import { useState, useEffect, useRef, MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { SiteType } from "@/app/page";

type InteractiveSatelliteViewerProps = {
  site: SiteType | null;
  onClose: () => void;
};

export default function InteractiveSatelliteViewer({
  site,
  onClose,
}: InteractiveSatelliteViewerProps) {
  const [activeLayer, setActiveLayer] = useState<"rgb" | "ndvi" | "ndbi">(
    site?.initialLayer || "rgb"
  );
  const [coordinates, setCoordinates] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [indexValue, setIndexValue] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageData, setImageData] = useState<ImageData | null>(null);

  useEffect(() => {
    if (!site) return;

    const img = new Image();
    img.src = site[activeLayer];
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      setImageData(ctx.getImageData(0, 0, canvas.width, canvas.height));
      setImageLoaded(true);
      imageRef.current = img;
    };
  }, [site, activeLayer]);

  const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !imageData) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    setCoordinates({ x, y });

    if (x >= 0 && y >= 0 && x < imageData.width && y < imageData.height) {
      const pixelIndex = (y * imageData.width + x) * 4;
      const r = imageData.data[pixelIndex];
      const g = imageData.data[pixelIndex + 1];
      const b = imageData.data[pixelIndex + 2];

      let value: number | null = null;

      if (activeLayer === "ndvi") {
        value = -0.2 + 1.0 * (g / 255);
        value = Math.round(value * 100) / 100;
      } else if (activeLayer === "ndbi") {
        value = -0.5 + 1.0 * (r / 255);
        value = Math.round(value * 100) / 100;
      }

      setIndexValue(value);
    }
  };

  const getTitle = () => {
    switch (activeLayer) {
      case "ndvi":
        return "NDVI from Sentinel-2";
      case "ndbi":
        return "NDBI from Sentinel-2";
      case "rgb":
        return "RGB Composite";
      default:
        return "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {site?.name} - {getTitle()}
          </h2>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="flex flex-col md:flex-row h-full overflow-hidden">
          <div className="flex-1 relative overflow-auto">
            <div className="relative inline-block">
              <canvas
                ref={canvasRef}
                onMouseMove={handleMouseMove}
                className="max-w-full h-auto"
              />
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p>Loading image...</p>
                </div>
              )}
            </div>
          </div>

          <div className="w-full md:w-64 p-4 border-t md:border-t-0 md:border-l border-gray-800">
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Layers</h3>
              <div className="flex flex-col space-y-2">
                <Button
                  variant={activeLayer === "rgb" ? "default" : "outline"}
                  onClick={() => setActiveLayer("rgb")}
                  className={activeLayer === "rgb" ? "bg-blue-600" : ""}
                >
                  RGB
                </Button>
                <Button
                  variant={activeLayer === "ndvi" ? "default" : "outline"}
                  onClick={() => setActiveLayer("ndvi")}
                  className={activeLayer === "ndvi" ? "bg-green-600" : ""}
                >
                  NDVI
                </Button>
                <Button
                  variant={activeLayer === "ndbi" ? "default" : "outline"}
                  onClick={() => setActiveLayer("ndbi")}
                  className={activeLayer === "ndbi" ? "bg-red-600" : ""}
                >
                  NDBI
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Information</h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Coordinates:</span>
                  <br />
                  X: {coordinates.x}, Y: {coordinates.y}
                </p>
                {indexValue !== null && (
                  <p>
                    <span className="font-medium">
                      {activeLayer.toUpperCase()} Value:
                    </span>
                    <br />
                    {indexValue}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
