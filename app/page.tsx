"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import HeroSlider from "@/components/hero-slider";
import FeatureSection from "@/components/feature-section";
import StatsSection from "@/components/stats-section";
import AboutSection from "@/components/about-section";
import Footer from "@/components/footer";

const BACKEND = "http://127.0.0.1:8001";

type GeeLayers = { rgb: string; ndvi: string; ndbi: string };

interface GeeResponse {
  location: string;
  date: string;
  png: GeeLayers;
  tif_url: string;
}

export default function Home() {
  // State variables
  const [cache, setCache] = useState<Record<string, GeeResponse>>({});
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(
    null
  );
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gee, setGee] = useState<GeeResponse | null>(null);
  const [layer, setLayer] = useState<keyof GeeLayers>("rgb");
  const [fullscreen, setFullscreen] = useState(false);
  const [fullscreenLayer, setFullscreenLayer] =
    useState<keyof GeeLayers>("rgb");

  const layerList: (keyof GeeLayers)[] = ["rgb", "ndvi", "ndbi"];

  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    // Load history from local storage on component mount
    const stored = localStorage.getItem("locationHistory");
    if (stored) {
      setHistory(JSON.parse(stored));
    }
  }, []);

  async function fetchImagery() {
    if (!location.trim()) return;
    setLoading(true);
    setError(null);
    setGee(null);

    try {
      // Check if location is already cached
      if (cache[location]) {
        setGee(cache[location]);
        setLayer("rgb");
      } else {
        const res = await fetch("/api/gee", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ location }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Request failed");

        // Update cache with new query
        setGee(json as GeeResponse);
        setLayer("rgb");
        setCache((prevCache) => ({
          ...prevCache,
          [location]: json,
        }));

        // Add location to history if not already present
        setHistory((prev) => {
          const updated = [
            location,
            ...prev.filter((l) => l !== location),
          ].slice(0, 5); // limit to 5 recent
          localStorage.setItem("locationHistory", JSON.stringify(updated));
          return updated;
        });
      }
    } catch (e: any) {
      setError(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  const getImg = (l: keyof GeeLayers) => (gee ? `${BACKEND}${gee.png[l]}` : "");

  const handleFullscreen = (l: keyof GeeLayers) => {
    setFullscreenLayer(l);
    setFullscreen(true);
  };

  const nextLayer = () => {
    const idx = layerList.indexOf(fullscreenLayer);
    setFullscreenLayer(layerList[(idx + 1) % layerList.length]);
  };

  const prevLayer = () => {
    const idx = layerList.indexOf(fullscreenLayer);
    setFullscreenLayer(
      layerList[(idx - 1 + layerList.length) % layerList.length]
    );
  };

  return (
    <main className="min-h-screen dark">
      {/* Hero */}
      <section className="relative">
        <HeroSlider />
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/50 p-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 text-center">
            Pakistan Satellite Crop Imagery Portal
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl text-center">
            Enter any city and get live NDVI, NDBI & RGB imagery from
            Sentinel‑2.
          </p>

          <div className="flex gap-2">
            <input
              className="px-4 py-2 rounded-md text-white bg-gray-800 placeholder-gray-400 w-72"
              placeholder="e.g. Lahore, Pakistan"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <Button onClick={fetchImagery} disabled={loading}>
              {loading ? "Loading…" : "Get Imagery"}
            </Button>
          </div>
          {history.length > 0 && (
            <div className="mt-4 text-gray-300 text-sm text-center">
              <p className="mb-2">Recent queries:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {history.map((loc, i) => (
                  <button
                    key={i}
                    onClick={() => setLocation(loc)}
                    className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded"
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && <p className="text-red-400 mt-4">{error}</p>}
        </div>
      </section>

      {/* Imagery Section */}
      {gee && (
        <section className="bg-gray-900 text-white py-12 relative z-0">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">
              Imagery for {gee.location} ({gee.date})
            </h2>

            {/* Layer buttons */}
            <div className="flex gap-4 mb-6">
              {layerList.map((l) => (
                <Button
                  key={l}
                  variant={layer === l ? "default" : "outline"}
                  className="capitalize"
                  onClick={() => setLayer(l)}
                >
                  {l}
                </Button>
              ))}
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              <img
                src={getImg(layer)}
                alt={`${layer.toUpperCase()} preview`}
                className="w-full md:w-96 rounded-lg shadow-md border cursor-zoom-in"
                onClick={() => handleFullscreen(layer)}
              />

              <div className="self-center">
                <a
                  href={`${BACKEND}${gee.tif_url}`}
                  className="bg-emerald-600 hover:bg-emerald-700 px-6 py-3 rounded text-white font-semibold transition"
                  download
                >
                  Download full GeoTIFF
                </a>
              </div>
            </div>
          </div>

          {/* Fullscreen viewer */}
          {fullscreen && (
            <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
              <img
                src={getImg(fullscreenLayer)}
                alt={`${fullscreenLayer.toUpperCase()} fullscreen`}
                className="max-w-[90%] max-h-[90%] rounded shadow-2xl"
              />

              {/* Navigation */}
              <button
                className="absolute left-4 text-white text-4xl font-bold bg-gray-800 bg-opacity-50 hover:bg-opacity-80 px-3 py-1 rounded"
                onClick={prevLayer}
              >
                ‹
              </button>
              <button
                className="absolute right-4 text-white text-4xl font-bold bg-gray-800 bg-opacity-50 hover:bg-opacity-80 px-3 py-1 rounded"
                onClick={nextLayer}
              >
                ›
              </button>

              {/* Close button */}
              <button
                className="absolute top-4 right-4 text-white text-2xl bg-gray-800 bg-opacity-50 hover:bg-opacity-80 px-3 py-1 rounded"
                onClick={() => setFullscreen(false)}
              >
                ✕
              </button>
            </div>
          )}
        </section>
      )}

      {/* Static Sections */}
      <FeatureSection />
      <StatsSection />
      <AboutSection />
      <Footer />
    </main>
  );
}
