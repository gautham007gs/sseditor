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
  RotateCcw,
  Circle,
  ArrowRight,
  Trash2,
  Plus
} from "lucide-react";
import { useImageEditor } from "@/hooks/use-image-editor";
import { CanvasElement, TextElement, ShapeElement } from "@/lib/image-editor";

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
  const [shapeColor, setShapeColor] = useState('#ff0000');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { 
    selectedElement, 
    initializeEditor, 
    applyFilter, 
    addText, 
    addShape, 
    updateElement, 
    deleteSelectedElement, 
    undo, 
    redo 
  } = useImageEditor();

  useEffect(() => {
    if (canvasRef.current) {
      initializeEditor(canvasRef.current);
    }
  }, [initializeEditor]);

  useEffect(() => {
    if (selectedElement && selectedElement.id.startsWith('text_')) {
      const textElement = selectedElement as TextElement;
      setTextContent(textElement.text);
      setFontSize([textElement.fontSize]);
      setTextColor(textElement.color);
    }
  }, [selectedElement]);

  useEffect(() => {
    applyFilter(brightness[0], contrast[0], saturation[0]);
  }, [brightness, contrast, saturation, applyFilter]);

  const tools = [
    { id: 'select', label: 'Select', icon: MousePointer },
    { id: 'crop', label: 'Crop', icon: Crop },
    { id: 'text', label: 'Text', icon: Type },
    { id: 'shapes', label: 'Shapes', icon: Square },
    { id: 'filters', label: 'Filters', icon: Filter },
    { id: 'resize', label: 'Resize', icon: Maximize },
  ];

  const handleAddText = () => {
    if (textContent.trim()) {
      addText(textContent, 50, 50, fontSize[0], textColor);
      setTextContent('');
    }
  };

  const handleAddShape = (type: 'rectangle' | 'circle' | 'arrow') => {
    addShape(type, 50, 50, 100, 100, shapeColor);
  };

  const handleUpdateText = () => {
    if (selectedElement && selectedElement.id.startsWith('text_')) {
      updateElement(selectedElement.id, {
        text: textContent,
        fontSize: fontSize[0],
        color: textColor,
        width: canvasRef.current?.getContext('2d')?.measureText(textContent).width || 0
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderToolProperties = () => {
    // If an element is selected, show its properties
    if (selectedElement) {
      if (selectedElement.id.startsWith('text_')) {
        const textElement = selectedElement as TextElement;
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-slate-700">Selected Text</h4>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={deleteSelectedElement}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <div>
              <Label htmlFor="text-content" className="text-sm font-medium text-slate-700">
                Text
              </Label>
              <Input
                id="text-content"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                onBlur={handleUpdateText}
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
                onValueChange={(value) => {
                  setFontSize(value);
                  if (selectedElement) {
                    updateElement(selectedElement.id, { fontSize: value[0] });
                  }
                }}
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
                onChange={(e) => {
                  setTextColor(e.target.value);
                  if (selectedElement) {
                    updateElement(selectedElement.id, { color: e.target.value });
                  }
                }}
                className="mt-1 h-10"
              />
            </div>
          </div>
        );
      } else {
        const shapeElement = selectedElement as ShapeElement;
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-slate-700">Selected {shapeElement.type}</h4>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={deleteSelectedElement}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <div>
              <Label htmlFor="shape-color" className="text-sm font-medium text-slate-700">
                Color
              </Label>
              <Input
                id="shape-color"
                type="color"
                value={shapeElement.color}
                onChange={(e) => {
                  updateElement(selectedElement.id, { color: e.target.value });
                }}
                className="mt-1 h-10"
              />
            </div>
          </div>
        );
      }
    }

    // Otherwise show tool-specific properties
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
            <Button onClick={handleAddText} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Text
            </Button>
          </div>
        );

      case 'shapes':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="shape-color" className="text-sm font-medium text-slate-700">
                Color
              </Label>
              <Input
                id="shape-color"
                type="color"
                value={shapeColor}
                onChange={(e) => setShapeColor(e.target.value)}
                className="mt-1 h-10"
              />
            </div>
            <div className="space-y-2">
              <Button 
                onClick={() => handleAddShape('rectangle')} 
                className="w-full justify-start"
                variant="outline"
              >
                <Square className="w-4 h-4 mr-2" />
                Add Rectangle
              </Button>
              <Button 
                onClick={() => handleAddShape('circle')} 
                className="w-full justify-start"
                variant="outline"
              >
                <Circle className="w-4 h-4 mr-2" />
                Add Circle
              </Button>
              <Button 
                onClick={() => handleAddShape('arrow')} 
                className="w-full justify-start"
                variant="outline"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Add Arrow
              </Button>
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
            {selectedElement ? 
              "Click on an element to edit it" : 
              "Select a tool or click an element"
            }
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
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => undo()}
                    title="Undo"
                  >
                    <Undo className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => redo()}
                    title="Redo"
                  >
                    <Redo className="w-4 h-4" />
                  </Button>
                  {selectedElement && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex-1 text-red-500 hover:text-red-700"
                      onClick={deleteSelectedElement}
                      title="Delete Selected"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Canvas Area */}
        <div className="lg:col-span-8 order-1 lg:order-2">
          <Card>
            <CardContent className="p-6">
              <div className="canvas-container relative">
                <canvas 
                  ref={canvasRef}
                  className="max-w-full h-auto border border-slate-200 rounded-lg mx-auto block cursor-crosshair"
                  style={{ maxHeight: '70vh' }}
                />
                <div className="mt-4 text-center text-sm text-slate-500">
                  {selectedElement ? 
                    `Selected: ${selectedElement.id.startsWith('text_') ? 'Text' : 'Shape'} - Click and drag to move` :
                    "Click on elements to select and edit them"
                  }
                </div>
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
