import { Satellite, BarChart2, Map, Leaf } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    icon: <Satellite className="h-10 w-10 text-emerald-500" />,
    title: "High-Resolution Imagery",
    description:
      "Access to the latest high-resolution satellite imagery covering all agricultural regions of Pakistan",
  },
  {
    icon: <BarChart2 className="h-10 w-10 text-emerald-500" />,
    title: "NDBI Analysis",
    description:
      "Advanced Normalized Difference Built-up Index analysis to monitor urban encroachment on agricultural land",
  },
  {
    icon: <Map className="h-10 w-10 text-emerald-500" />,
    title: "Interactive Mapping",
    description:
      "Interactive maps with multiple layers for comprehensive agricultural monitoring and analysis",
  },
  {
    icon: <Leaf className="h-10 w-10 text-emerald-500" />,
    title: "Crop Health Monitoring",
    description:
      "Real-time monitoring of crop health and growth patterns across different regions",
  },
];

export default function FeatureSection() {
  return (
    <section className="py-20 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Advanced Features
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Our satellite imagery portal provides cutting-edge tools for
            agricultural monitoring and analysis
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors"
            >
              <CardHeader>
                <div className="mb-4">{feature.icon}</div>
                <CardTitle className="text-white">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
