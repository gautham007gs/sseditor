import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  MousePointer, 
  Crop, 
  Type, 
  Square, 
  Filter, 
  Maximize, 
  Undo, 
  Redo,
  Circle,
  ArrowRight,
  Trash2,
  Plus,
  ScanText,
  Eye,
  Edit3,
  Download,
  RotateCcw,
  ZoomIn,
  ZoomOut
} from "lucide-react";
import { useImageEditor } from "@/hooks/use-image-editor";
import { CanvasElement, TextElement, ShapeElement } from "@/lib/image-editor";

interface EnhancedEditorProps {
  imageData: string | null;
  imageInfo: {
    width: number;
    height: number;
    size: number;
    format: string;
  } | null;
}

type Tool = 'select' | 'crop' | 'text' | 'shapes' | 'filters' | 'resize' | 'ocr';

export default function EnhancedEditor({ imageData, imageInfo }: EnhancedEditorProps) {
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
  const [zoom, setZoom] = useState(100);
  
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
    redo,
    downloadImage
  } = useImageEditor();

  // Initialize editor and load image
  useEffect(() => {
    if (canvasRef.current && imageData) {
      console.log('Initializing editor with image data:', imageData.substring(0, 50) + '...');
      const editor = initializeEditor(canvasRef.current);
      if (editor) {
        console.log('Editor initialized, loading image...');
        editor.loadImage(imageData)
          .then((info) => {
            console.log('Image loaded successfully:', info);
            // Force a redraw to ensure image is visible
            setTimeout(() => {
              console.log('Triggering redraw after image load');
              const canvas = canvasRef.current!;
              console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);
              console.log('Canvas style:', canvas.style.width, 'x', canvas.style.height);
            }, 100);
          })
          .catch((error) => {
            console.error('Error loading image:', error);
          });
      } else {
        console.error('Failed to initialize editor');
      }
    } else {
      console.log('Missing canvas or image data:', { 
        hasCanvas: !!canvasRef.current, 
        hasImageData: !!imageData 
      });
    }
  }, [initializeEditor, imageData]);

  // Update selected element state
  useEffect(() => {
    if (selectedElement && 'text' in selectedElement) {
      const textElement = selectedElement as TextElement;
      setTextContent(textElement.text);
      setFontSize([textElement.fontSize]);
      setTextColor(textElement.color);
    }
  }, [selectedElement]);

  // Apply filters
  useEffect(() => {
    applyFilter(brightness[0], contrast[0], saturation[0]);
  }, [brightness, contrast, saturation, applyFilter]);

  const tools = [
    { id: 'select', label: 'Select', icon: MousePointer, description: 'Select and move elements' },
    { id: 'ocr', label: 'AI Text', icon: ScanText, description: 'Extract text with AI' },
    { id: 'text', label: 'Text', icon: Type, description: 'Add text overlay' },
    { id: 'shapes', label: 'Shapes', icon: Square, description: 'Add shapes and arrows' },
    { id: 'filters', label: 'Filters', icon: Filter, description: 'Adjust image properties' },
    { id: 'crop', label: 'Crop', icon: Crop, description: 'Crop and resize image' },
  ];

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
    if (selectedElement && 'text' in selectedElement) {
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

  const renderToolContent = () => {
    switch (selectedTool) {
      case 'ocr':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <div className="mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <ScanText className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-slate-800 mb-2">AI Text Recognition</h4>
                <p className="text-sm text-slate-600">
                  Automatically detect and extract text from your image
                </p>
              </div>
              
              <Button 
                onClick={handleExtractText} 
                disabled={isOcrLoading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                size="lg"
              >
                {isOcrLoading ? (
                  <>
                    <Eye className="w-4 h-4 mr-2 animate-pulse" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <ScanText className="w-4 h-4 mr-2" />
                    Extract Text
                  </>
                )}
              </Button>
            </div>
            
            {ocrResults.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-medium text-slate-700">
                    Found {ocrResults.length} text elements
                  </h5>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    ✓ Complete
                  </Badge>
                </div>
                
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {ocrResults.map((textElement, index) => (
                    <Card key={textElement.id} className="p-3 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {Math.round((textElement.confidence || 0) * 100)}%
                          </Badge>
                          <span className="text-xs text-slate-500">Text {index + 1}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setTextContent(textElement.text);
                            setSelectedTool('text');
                          }}
                          className="p-1 h-6 w-6"
                        >
                          <Edit3 className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-sm font-mono bg-slate-50 p-2 rounded text-slate-700">
                        "{textElement.text}"
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'text':
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Type className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-slate-800">Add Text</h4>
            </div>
            
            <div>
              <Label htmlFor="text-content" className="text-sm font-medium text-slate-700">
                Text Content
              </Label>
              <Input
                id="text-content"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Enter your text..."
                className="mt-2"
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
                Text Color
              </Label>
              <Input
                id="text-color"
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="mt-2 h-12 w-full"
              />
            </div>
            
            <Button 
              onClick={selectedElement ? handleUpdateText : handleAddText} 
              className="w-full" 
              size="lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              {selectedElement ? 'Update Text' : 'Add Text'}
            </Button>
          </div>
        );

      case 'shapes':
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Square className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-slate-800">Add Shapes</h4>
            </div>
            
            <div>
              <Label htmlFor="shape-color" className="text-sm font-medium text-slate-700">
                Shape Color
              </Label>
              <Input
                id="shape-color"
                type="color"
                value={shapeColor}
                onChange={(e) => setShapeColor(e.target.value)}
                className="mt-2 h-12 w-full"
              />
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <Button onClick={() => handleAddShape('rectangle')} variant="outline" className="w-full">
                <Square className="w-4 h-4 mr-2" />
                Rectangle
              </Button>
              <Button onClick={() => handleAddShape('circle')} variant="outline" className="w-full">
                <Circle className="w-4 h-4 mr-2" />
                Circle
              </Button>
              <Button onClick={() => handleAddShape('arrow')} variant="outline" className="w-full">
                <ArrowRight className="w-4 h-4 mr-2" />
                Arrow
              </Button>
            </div>
          </div>
        );

      case 'filters':
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Filter className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-slate-800">Image Filters</h4>
            </div>
            
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
            
            <Button 
              onClick={() => {
                setBrightness([100]);
                setContrast([100]);
                setSaturation([100]);
              }}
              variant="outline"
              className="w-full"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Filters
            </Button>
          </div>
        );

      default:
        if (selectedElement) {
          if ('text' in selectedElement) {
            const textElement = selectedElement as TextElement;
            return (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-slate-800">Edit Text</h4>
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
                  <Label className="text-sm font-medium text-slate-700">Content</Label>
                  <Input
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    onBlur={handleUpdateText}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-slate-700">
                    Size: {fontSize[0]}px
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
                  <Label className="text-sm font-medium text-slate-700">Color</Label>
                  <Input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    onBlur={handleUpdateText}
                    className="mt-2 h-12"
                  />
                </div>
              </div>
            );
          }
        }
        
        return (
          <div className="text-center py-8">
            <MousePointer className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h4 className="font-medium text-slate-700 mb-2">Select Tool</h4>
            <p className="text-sm text-slate-500">
              Choose a tool from the menu or click on an element to edit it
            </p>
          </div>
        );
    }
  };

  if (!imageData) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Type className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="font-medium text-slate-700 mb-2">No Image Loaded</h3>
        <p className="text-sm text-slate-500">Upload an image to start editing</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      {/* Header with action buttons */}
      <div className="border-b border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="font-semibold text-slate-800">Image Editor</h3>
            {imageInfo && (
              <div className="hidden sm:flex items-center space-x-4 text-xs text-slate-500">
                <span>{imageInfo.width} × {imageInfo.height}</span>
                <span>{formatFileSize(imageInfo.size)}</span>
                <span>{imageInfo.format.toUpperCase()}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={undo}>
              <Undo className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={redo}>
              <Redo className="w-4 h-4" />
            </Button>
            <Button onClick={downloadImage} className="bg-emerald-500 hover:bg-emerald-600 text-white">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Tools sidebar */}
        <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50">
          {/* Mobile: Horizontal tools */}
          <div className="lg:hidden p-4">
            <div className="flex overflow-x-auto space-x-2 pb-2">
              {tools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Button
                    key={tool.id}
                    variant={selectedTool === tool.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTool(tool.id as Tool)}
                    className={`flex-shrink-0 min-w-[80px] ${
                      selectedTool === tool.id ? 'bg-blue-500 text-white' : ''
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-1" />
                    <span className="text-xs">{tool.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Desktop: Vertical tools */}
          <div className="hidden lg:block p-4">
            <h4 className="font-medium text-slate-700 mb-4">Tools</h4>
            <div className="space-y-2">
              {tools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Button
                    key={tool.id}
                    variant={selectedTool === tool.id ? "default" : "ghost"}
                    onClick={() => setSelectedTool(tool.id as Tool)}
                    className={`w-full justify-start text-left ${
                      selectedTool === tool.id ? 'bg-blue-500 text-white' : ''
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    <div>
                      <div className="font-medium">{tool.label}</div>
                      <div className="text-xs opacity-70">{tool.description}</div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Tool properties */}
          <div className="p-4 border-t border-slate-200 lg:border-t-0">
            <h4 className="font-medium text-slate-700 mb-4">Properties</h4>
            <div className="max-h-80 overflow-y-auto">
              {renderToolContent()}
            </div>
          </div>
        </div>

        {/* Canvas area */}
        <div className="flex-1 p-6 bg-slate-50 min-h-[500px]">
          <div className="flex items-center justify-center h-full">
            <div className="bg-white rounded-lg shadow-sm border-2 border-dashed border-slate-300 p-4 max-w-full">
              <canvas 
                ref={canvasRef}
                className="max-w-full max-h-full border border-slate-200 rounded shadow-sm"
                style={{ 
                  cursor: selectedTool === 'select' ? 'pointer' : 'crosshair'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}