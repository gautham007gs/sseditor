import { Card, CardContent } from "@/components/ui/card";
import { 
  Crop, 
  Type, 
  Filter, 
  Maximize, 
  Square, 
  Download 
} from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      icon: Crop,
      title: "Smart Cropping",
      description: "Precisely crop your images with intelligent aspect ratio suggestions and guidelines.",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: Type,
      title: "Text Overlay",
      description: "Add professional text with custom fonts, colors, and styling options.",
      color: "bg-purple-100 text-purple-600"
    },
    {
      icon: Filter,
      title: "Professional Filters",
      description: "Enhance your images with brightness, contrast, saturation, and blur effects.",
      color: "bg-emerald-100 text-emerald-600"
    },
    {
      icon: Maximize,
      title: "Resize & Scale",
      description: "Resize images while maintaining quality with smart scaling algorithms.",
      color: "bg-orange-100 text-orange-600"
    },
    {
      icon: Square,
      title: "Shapes & Annotations",
      description: "Add arrows, rectangles, circles, and annotations to highlight important areas.",
      color: "bg-pink-100 text-pink-600"
    },
    {
      icon: Download,
      title: "Export Options",
      description: "Download in multiple formats (PNG, JPG) with quality optimization.",
      color: "bg-indigo-100 text-indigo-600"
    }
  ];

  return (
    <div className="mt-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">
          Powerful Editing Tools
        </h2>
        <p className="text-lg text-slate-600">
          Everything you need to edit screenshots and images professionally
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
