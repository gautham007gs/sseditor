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
  Plus,
  ScanText,
  Eye,
  Edit3
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

type Tool = 'select' | 'crop' | 'text' | 'shapes' | 'filters' | 'resize' | 'ocr';

export default function EditorSection({ imageData, imageInfo }: EditorSectionProps) {
  const [selectedTool, setSelectedTool] = useState<Tool>('select');
  const [brightness, setBrightness] = useState([100]);
  const [contrast, setContrast] = useState([100]);
  const [saturation, setSaturation] = useState([100]);
  const [textContent, setTextContent] = useState('');
  const [fontSize, setFontSize] = useState([24]);
  const [textColor, setTextColor] = useState('#000000');
  const [shapeColor, setShapeColor] = useState('#ff0000');
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [ocrResults, setOcrResults] = useState<TextElement[]>([]);
  const [showOcrOverlay, setShowOcrOverlay] = useState(false);
  
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
    if (canvasRef.current && imageData) {
      const editor = initializeEditor(canvasRef.current);
      if (editor && imageData) {
        // Load the image into the editor when component mounts
        editor.loadImage(imageData).catch(console.error);
      }
    }
  }, [initializeEditor, imageData]);

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
    { id: 'ocr', label: 'Extract Text', icon: ScanText },
    { id: 'crop', label: 'Crop', icon: Crop },
    { id: 'text', label: 'Text', icon: Type },
    { id: 'shapes', label: 'Shapes', icon: Square },
    { id: 'filters', label: 'Filters', icon: Filter },
    { id: 'resize', label: 'Resize', icon: Maximize },
  ];

  const handleAddText = () => {
    console.log('Adding text:', textContent, fontSize[0], textColor);
    if (textContent.trim()) {
      addText(textContent, 50, 50, fontSize[0], textColor);
      setTextContent('');
    } else {
      console.log('No text content to add');
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

  const handleExtractText = async () => {
    if (!canvasRef.current) return;
    
    setIsOcrLoading(true);
    try {
      const canvas = canvasRef.current;
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageData }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.textElements) {
        // Convert percentage-based coordinates to canvas pixels
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        
        const detectedTexts: TextElement[] = result.textElements.map((item: any) => ({
          id: item.id,
          text: item.text,
          x: (item.x / 100) * canvasWidth,
          y: (item.y / 100) * canvasHeight,
          width: (item.width / 100) * canvasWidth,
          height: (item.height / 100) * canvasHeight,
          fontSize: item.fontSize,
          fontFamily: item.fontFamily,
          color: item.color,
          isOcrDetected: true,
          confidence: item.confidence,
          originalText: item.text
        }));

        setOcrResults(detectedTexts);
        setShowOcrOverlay(true);
        setSelectedTool('select');
        
        // Add detected text to the canvas
        detectedTexts.forEach(textElement => {
          addText(textElement.text, textElement.x, textElement.y, textElement.fontSize, textElement.color);
        });
        
        console.log(`Found ${detectedTexts.length} text elements`);
      } else {
        console.log('No text found in image');
      }
    } catch (error) {
      console.error('OCR extraction failed:', error);
    } finally {
      setIsOcrLoading(false);
    }
  };

  const handleOcrTextEdit = (textElement: TextElement, newText: string) => {
    updateElement(textElement.id, {
      text: newText,
      width: canvasRef.current?.getContext('2d')?.measureText(newText).width || 0
    });
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
      case 'ocr':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h4 className="font-medium text-slate-700 mb-2">Extract Text from Image</h4>
              <p className="text-sm text-slate-500 mb-4">
                AI will identify and extract all text from your image automatically
              </p>
              <Button 
                onClick={handleExtractText} 
                disabled={isOcrLoading}
                className="w-full"
              >
                {isOcrLoading ? (
                  <>
                    <Eye className="w-4 h-4 mr-2 animate-pulse" />
                    Analyzing Image...
                  </>
                ) : (
                  <>
                    <ScanText className="w-4 h-4 mr-2" />
                    Extract All Text
                  </>
                )}
              </Button>
            </div>
            
            {ocrResults.length > 0 && (
              <div className="mt-4">
                <h5 className="font-medium text-slate-700 mb-2">
                  Found {ocrResults.length} text elements
                </h5>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {ocrResults.map((textElement, index) => (
                    <div key={textElement.id} className="p-2 bg-slate-50 rounded border">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-500">
                          Text {index + 1} ({Math.round((textElement.confidence || 0) * 100)}% confidence)
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setTextContent(textElement.text);
                            setSelectedTool('text');
                          }}
                          className="p-1 h-6"
                        >
                          <Edit3 className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-sm font-mono">{textElement.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
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
      {/* Mobile Tools Bar */}
      <div className="lg:hidden mb-4">
        <Card>
          <CardContent className="p-3">
            <div className="flex overflow-x-auto space-x-2 pb-2">
              {tools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Button
                    key={tool.id}
                    variant={selectedTool === tool.id ? "default" : "ghost"}
                    className={`flex-shrink-0 tool-btn ${
                      selectedTool === tool.id ? 'active' : ''
                    }`}
                    size="sm"
                    onClick={() => setSelectedTool(tool.id as Tool)}
                  >
                    <Icon className="w-4 h-4 mr-1" />
                    <span className="text-xs">{tool.label}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
        {/* Desktop Left Toolbar */}
        <div className="hidden lg:block lg:col-span-2 order-2 lg:order-1">
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
                <div className="flex space-x-2 mb-3">
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
                
                {/* Quick Test Button */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    console.log('Test button clicked');
                    addText('Test Text', 100, 100, 24, '#ff0000');
                  }}
                  title="Test: Add Text"
                >
                  🔧 Test Add Text
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Canvas Area */}
        <div className="lg:col-span-8 order-1 lg:order-2">
          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="canvas-container relative">
                <div className="bg-white rounded-lg border-2 border-dashed border-slate-300 p-2 sm:p-4">
                  <canvas 
                    ref={canvasRef}
                    className="max-w-full h-auto rounded-lg mx-auto block cursor-crosshair shadow-sm"
                    style={{ maxHeight: '60vh', minHeight: '200px' }}
                  />
                </div>
                <div className="mt-2 sm:mt-4 text-center text-xs sm:text-sm text-slate-500">
                  {selectedElement ? 
                    `Selected: ${selectedElement.id.startsWith('text_') ? 'Text' : 'Shape'} - Tap and drag to move` :
                    "Tap on elements to select and edit them"
                  }
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Mobile Properties Panel */}
        <div className="lg:hidden order-3 mb-4">
          <Card>
            <CardContent className="p-3">
              <h3 className="font-semibold text-slate-700 mb-3 text-sm">Properties</h3>
              <div id="toolProperties">
                {renderToolProperties()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Desktop Right Properties Panel */}
        <div className="hidden lg:block lg:col-span-2 order-3">
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
