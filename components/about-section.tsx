import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function AboutSection() {
  return (
    <section className="py-20 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative h-[400px] rounded-lg overflow-hidden">
            <Image
              src="/placeholder.svg?height=800&width=1200"
              alt="Satellite imagery of Pakistan's agricultural landscape"
              fill
              className="object-cover"
            />
          </div>

          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              About Our Satellite Crop Imagery Portal
            </h2>
            <p className="text-gray-300 mb-6">
              Our platform provides comprehensive satellite imagery and NDBI
              analysis for Pakistan's agricultural sector. We combine
              cutting-edge technology with local expertise to deliver actionable
              insights for farmers, agricultural businesses, and government
              agencies.
            </p>
            <p className="text-gray-300 mb-8">
              With regular updates and high-resolution imagery, our portal
              enables better decision-making, improved crop management, and
              sustainable agricultural practices across Pakistan.
            </p>
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
              Learn More About Us
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
