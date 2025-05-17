#!/usr/bin/env python3
"""
Earth‑Engine export helper
– Reads location from GEE_LOCATION
– Writes manifest JSON to GEE_OUTPUT_JSON
– Exports: GeoTIFF + PNGs for RGB, NDVI, NDBI (with colormaps)
"""

import os, io, time, json, pathlib
import ee, numpy as np, rasterio
from PIL import Image
from geopy.geocoders import Nominatim
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
import matplotlib.pyplot as plt

# ───── CONFIG ───── #
EE_KEY_PATH = "valued-watch-456911-p9-533c75370ef2.json"
START_DATE, END_DATE = "2024-06-01", "2024-06-30"
EXPORT_PREFIX = "Site_Export"
EXPORT_FOLDER = "EarthEngineExports"
EXPORT_DESC = "Sentinel2_Export"
SCALE, MAX_PX = 30, 1e13
DL_DIR = pathlib.Path(__file__).with_name("downloads")

# ───── ENV INPUT ───── #
place = os.getenv("GEE_LOCATION")
out_json = os.getenv("GEE_OUTPUT_JSON", "output.json")
if not place:
    raise RuntimeError("⚠️  GEE_LOCATION env var missing")

loc = Nominatim(user_agent="gee-job").geocode(place)
if not loc:
    raise RuntimeError(f"❌ location '{place}' not found")
lon, lat = loc.longitude, loc.latitude

# ───── EARTH ENGINE ───── #
ee_creds = service_account.Credentials.from_service_account_file(
    EE_KEY_PATH, scopes=["https://www.googleapis.com/auth/cloud-platform"]
)
ee.Initialize(credentials=ee_creds)

roi = ee.Geometry.Point([lon, lat]).buffer(15_000)

col = (
    ee.ImageCollection("COPERNICUS/S2_SR")
    .filterBounds(roi)
    .filterDate(START_DATE, END_DATE)
    .filterMetadata("CLOUDY_PIXEL_PERCENTAGE", "less_than", 10)
)

if col.size().getInfo() == 0:
    raise SystemExit("No Sentinel‑2 scenes match filters")

img = col.mosaic()
timestamp = col.aggregate_min("system:time_start").getInfo() / 1e3
capture_date = time.strftime("%Y-%m-%d", time.gmtime(timestamp))

ndvi = img.normalizedDifference(["B8", "B4"]).rename("NDVI")
ndbi = img.normalizedDifference(["B11", "B8"]).rename("NDBI")
mask = img.select("B8").mask()

stack = img.select(["B4", "B3", "B2"]).addBands([ndvi, ndbi]).updateMask(mask).toFloat()

stamp = int(time.time())
base = f"{EXPORT_PREFIX}_{stamp}"

task = ee.batch.Export.image.toDrive(
    image=stack,
    description=EXPORT_DESC,
    folder=EXPORT_FOLDER,
    fileNamePrefix=base,
    region=roi,
    scale=SCALE,
    maxPixels=MAX_PX,
)
task.start()
print("🚀 EE export submitted:", base)
while task.status()["state"] in {"READY", "RUNNING"}:
    print("   ⏳ waiting…", end="\r")
    time.sleep(10)
state = task.status()["state"]
print("✅ EE export", state)
if state != "COMPLETED":
    raise RuntimeError("Export failed in Earth‑Engine")

# ───── DOWNLOAD GeoTIFF ───── #
drive_creds = service_account.Credentials.from_service_account_file(
    EE_KEY_PATH, scopes=["https://www.googleapis.com/auth/drive.readonly"]
)
drive = build("drive", "v3", credentials=drive_creds)

q = f"trashed=false and name = '{base}.tif' and mimeType='image/tiff'"
f = (
    drive.files()
    .list(q=q, spaces="drive", fields="files(id,name)")
    .execute()["files"][0]
)

DL_DIR.mkdir(exist_ok=True)
tif_path = DL_DIR / f["name"]
with tif_path.open("wb") as fh:
    MediaIoBaseDownload(fh, drive.files().get_media(fileId=f["id"])).next_chunk()
print("⬇️  downloaded", tif_path.name)

# ───── PNG OUTPUTS ───── #
rgb_png = DL_DIR / f"{base}_RGB.png"
ndvi_png = DL_DIR / f"{base}_NDVI.png"
ndbi_png = DL_DIR / f"{base}_NDBI.png"

with rasterio.open(tif_path) as src:
    bands = src.read()
    red, green, blue = bands[0], bands[1], bands[2]
    ndvi, ndbi = bands[3], bands[4]

# RGB → PNG via PIL
rgb = np.clip(np.dstack([red, green, blue]) / 3000.0, 0, 1)
Image.fromarray((rgb * 255).astype(np.uint8)).save(rgb_png)


# NDVI/NDBI → PNG via matplotlib
import matplotlib.pyplot as plt


import numpy as np
import matplotlib.pyplot as plt


def save_colormap(data, cmap, vmin, vmax, path, title):
    # Mask out 0 or NaN values (depending on how nodata appears)
    masked_data = np.ma.masked_where(np.isnan(data) | (data == 0), data)

    fig, ax = plt.subplots(figsize=(8, 6))
    im = ax.imshow(masked_data, cmap=cmap, vmin=vmin, vmax=vmax)
    cbar = fig.colorbar(im, ax=ax, shrink=0.8)
    ax.set_title(title)
    ax.set_xlabel("Column")
    ax.set_ylabel("Row")
    ax.set_facecolor("white")
    fig.patch.set_facecolor("white")
    fig.savefig(path, dpi=150, bbox_inches="tight", facecolor="white")
    plt.close(fig)


save_colormap(ndvi, "RdYlGn", -0.2, 0.8, ndvi_png, "NDVI")
save_colormap(ndbi, "coolwarm", -0.5, 0.5, ndbi_png, "NDBI")

# ───── MANIFEST ───── #
with open(out_json, "w") as f:
    json.dump(
        {
            "location": place,
            "coords": {"lat": lat, "lon": lon},
            "date": capture_date,
            "tif": tif_path.name,
            "png": {
                "rgb": rgb_png.name,
                "ndvi": ndvi_png.name,
                "ndbi": ndbi_png.name,
            },
        },
        f,
        indent=2,
    )
print("📄 wrote manifest →", out_json)
