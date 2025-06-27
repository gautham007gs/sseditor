import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MousePointer, 
  Crop, 
  Type, 
  Square, 
  Filter, 
  Maximize, 
  Undo, 
  Redo,
  RotateCcw
} from "lucide-react";

interface EditorSectionProps {
  imageData: string | null;
  imageInfo: {
    width: number;
    height: number;
    size: number;
    format: string;
  } | null;
}

type Tool = 'select' | 'crop' | 'text' | 'shapes' | 'filters' | 'resize';

export default function EditorSection({ imageData, imageInfo }: EditorSectionProps) {
  const [selectedTool, setSelectedTool] = useState<Tool>('select');
  const [brightness, setBrightness] = useState([100]);
  const [contrast, setContrast] = useState([100]);
  const [saturation, setSaturation] = useState([100]);
  const [textContent, setTextContent] = useState('');
  const [fontSize, setFontSize] = useState([24]);
  const [textColor, setTextColor] = useState('#000000');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (imageData && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        // Calculate canvas size while maintaining aspect ratio
        const maxWidth = 800;
        const maxHeight = 600;
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        setCanvasSize({ width, height });
        
        // Apply filters
        ctx.filter = `brightness(${brightness[0]}%) contrast(${contrast[0]}%) saturate(${saturation[0]}%)`;
        ctx.drawImage(img, 0, 0, width, height);
      };
      img.src = imageData;
    }
  }, [imageData, brightness, contrast, saturation]);

  const tools = [
    { id: 'select', label: 'Select', icon: MousePointer },
    { id: 'crop', label: 'Crop', icon: Crop },
    { id: 'text', label: 'Text', icon: Type },
    { id: 'shapes', label: 'Shapes', icon: Square },
    { id: 'filters', label: 'Filters', icon: Filter },
    { id: 'resize', label: 'Resize', icon: Maximize },
  ];

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderToolProperties = () => {
    switch (selectedTool) {
      case 'text':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="text-content" className="text-sm font-medium text-slate-700">
                Text
              </Label>
              <Input
                id="text-content"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Enter text"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700">
                Font Size: {fontSize[0]}px
              </Label>
              <Slider
                value={fontSize}
                onValueChange={setFontSize}
                min={12}
                max={72}
                step={1}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="text-color" className="text-sm font-medium text-slate-700">
                Color
              </Label>
              <Input
                id="text-color"
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="mt-1 h-10"
              />
            </div>
          </div>
        );
      
      case 'crop':
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-slate-700">Aspect Ratio</Label>
              <Select>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Free" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="1:1">1:1 Square</SelectItem>
                  <SelectItem value="16:9">16:9 Widescreen</SelectItem>
                  <SelectItem value="4:3">4:3 Standard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      
      case 'filters':
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-slate-700">
                Brightness: {brightness[0]}%
              </Label>
              <Slider
                value={brightness}
                onValueChange={setBrightness}
                min={0}
                max={200}
                step={1}
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700">
                Contrast: {contrast[0]}%
              </Label>
              <Slider
                value={contrast}
                onValueChange={setContrast}
                min={0}
                max={200}
                step={1}
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700">
                Saturation: {saturation[0]}%
              </Label>
              <Slider
                value={saturation}
                onValueChange={setSaturation}
                min={0}
                max={200}
                step={1}
                className="mt-2"
              />
            </div>
          </div>
        );
      
      default:
        return (
          <div className="text-sm text-slate-500">
            Select a tool to see properties
          </div>
        );
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Toolbar */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-slate-700 mb-4">Tools</h3>
              
              <div className="space-y-2">
                {tools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <Button
                      key={tool.id}
                      variant={selectedTool === tool.id ? "default" : "ghost"}
                      className={`w-full justify-start tool-btn ${
                        selectedTool === tool.id ? 'active' : ''
                      }`}
                      onClick={() => setSelectedTool(tool.id as Tool)}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {tool.label}
                    </Button>
                  );
                })}
              </div>
              
              <div className="border-t border-slate-200 mt-6 pt-4">
                <h4 className="font-medium text-slate-600 mb-3">Actions</h4>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" className="flex-1">
                    <Undo className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1">
                    <Redo className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1">
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Canvas Area */}
        <div className="lg:col-span-8 order-1 lg:order-2">
          <Card>
            <CardContent className="p-6">
              <div className="canvas-container">
                <canvas 
                  ref={canvasRef}
                  className="max-w-full h-auto border border-slate-200 rounded-lg mx-auto block"
                  style={{ maxHeight: '70vh' }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right Properties Panel */}
        <div className="lg:col-span-2 order-3">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-slate-700 mb-4">Properties</h3>
              
              <div id="toolProperties">
                {renderToolProperties()}
              </div>
              
              {/* Image Info */}
              {imageInfo && (
                <div className="border-t border-slate-200 mt-6 pt-4">
                  <h4 className="font-medium text-slate-600 mb-3">Image Info</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Size:</span>
                      <span className="text-slate-700">
                        {imageInfo.width} × {imageInfo.height}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Format:</span>
                      <span className="text-slate-700 uppercase">
                        {imageInfo.format}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">File Size:</span>
                      <span className="text-slate-700">
                        {formatFileSize(imageInfo.size)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
