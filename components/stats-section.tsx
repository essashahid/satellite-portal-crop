import { Card, CardContent } from "@/components/ui/card";

const stats = [
  {
    value: "10TB+",
    label: "Satellite Data",
  },
  {
    value: "95%",
    label: "Coverage of Pakistan",
  },
  {
    value: "24/7",
    label: "Real-time Updates",
  },
  {
    value: "500+",
    label: "Agricultural Regions",
  },
];

export default function StatsSection() {
  return (
    <section className="py-20 bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-gray-800 border-gray-700">
              <CardContent className="p-6 text-center">
                <p className="text-4xl md:text-5xl font-bold text-emerald-500 mb-2">
                  {stat.value}
                </p>
                <p className="text-lg text-gray-300">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
