from flask import Flask, request, jsonify, send_from_directory
import subprocess, json, os, tempfile, pathlib

BASE      = pathlib.Path(__file__).parent
JOB       = BASE / "gee_job.py"
DOWNLOADS = BASE / "downloads"

app = Flask(__name__)

@app.post("/gee/run")
def run_gee():
    """Kick off gee_job.py and return its manifest (or error details)."""
    loc = request.json.get("location")
    if not loc:
        return {"error": "location field required"}, 400

    out_json = tempfile.mktemp(suffix=".json")
    env      = os.environ | {"GEE_LOCATION": loc, "GEE_OUTPUT_JSON": out_json}

    proc = subprocess.run(["python", str(JOB)], env=env, text=True, capture_output=True)

    # Always print EE job logs to server console for easier debugging
    print("=== gee_job stdout ===\n", proc.stdout)
    print("=== gee_job stderr ===\n", proc.stderr)

    if proc.returncode != 0:
        return {
            "error": "gee_job failed",
            "detail": (proc.stdout or "") + (proc.stderr or "")
        }, 500

    if not os.path.exists(out_json):
        return {"error": "gee_job produced no manifest"}, 500

    manifest = json.load(open(out_json))

    # make URLs browser‑friendly
    manifest["tif_url"] = f"/gee/file/{manifest['tif']}"
    manifest["png"]     = {k: f"/gee/file/{v}" for k, v in manifest["png"].items()}
    return jsonify(manifest)

@app.get("/gee/file/<path:filename>")
def serve_file(filename: str):
    return send_from_directory(DOWNLOADS, filename, as_attachment=False)

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8001, debug=True)
