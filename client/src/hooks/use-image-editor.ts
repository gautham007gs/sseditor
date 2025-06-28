import { useState, useRef, useCallback } from "react";
import { ImageEditor, ImageInfo, CanvasElement } from "@/lib/image-editor";

export function useImageEditor() {
  const [imageData, setImageData] = useState<string | null>(null);
  const [isEditorVisible, setIsEditorVisible] = useState(false);
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [selectedElement, setSelectedElement] = useState<CanvasElement | null>(null);
  const editorRef = useRef<ImageEditor | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const showEditor = useCallback(async (file: File, dataUrl: string) => {
    console.log('showEditor called with:', { fileName: file.name, dataUrlLength: dataUrl.length });
    setImageData(dataUrl);
    setIsEditorVisible(true);
    
    // Extract basic image info without requiring editor
    const img = new Image();
    img.onload = () => {
      setImageInfo({
        width: img.naturalWidth,
        height: img.naturalHeight,
        size: file.size,
        format: file.type.split('/')[1] || 'unknown'
      });
      console.log('Image info set:', {
        width: img.naturalWidth,
        height: img.naturalHeight,
        size: file.size,
        format: file.type
      });
    };
    img.src = dataUrl;
  }, []);

  const initializeEditor = useCallback((canvas: HTMLCanvasElement) => {
    if (!editorRef.current && canvas) {
      editorRef.current = new ImageEditor(canvas);
      editorRef.current.setElementSelectCallback(setSelectedElement);
      canvasRef.current = canvas;
    }
    return editorRef.current;
  }, []);

  const downloadImage = useCallback(() => {
    if (!editorRef.current) return;
    
    const dataUrl = editorRef.current.export('png');
    const link = document.createElement('a');
    link.download = 'edited-screenshot.png';
    link.href = dataUrl;
    link.click();
  }, []);

  const applyFilter = useCallback((brightness: number, contrast: number, saturation: number) => {
    if (editorRef.current) {
      editorRef.current.applyFilter(brightness, contrast, saturation);
    }
  }, []);

  const addText = useCallback((text: string, x: number = 50, y: number = 50, fontSize: number = 24, color: string = '#000000') => {
    console.log('Hook addText called with:', { text, x, y, fontSize, color });
    console.log('editorRef.current:', !!editorRef.current);
    if (editorRef.current) {
      editorRef.current.addText(text, x, y, fontSize, color);
    } else {
      console.log('No editor instance available');
    }
  }, []);

  const addShape = useCallback((type: 'rectangle' | 'circle' | 'arrow', x: number = 50, y: number = 50, width: number = 100, height: number = 100, color: string = '#ff0000') => {
    if (editorRef.current) {
      editorRef.current.addShape(type, x, y, width, height, color);
    }
  }, []);

  const updateElement = useCallback((elementId: string, updates: Partial<CanvasElement>) => {
    if (editorRef.current) {
      editorRef.current.updateElement(elementId, updates);
    }
  }, []);

  const deleteSelectedElement = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.deleteSelectedElement();
      setSelectedElement(null);
    }
  }, []);

  const undo = useCallback(() => {
    if (editorRef.current) {
      return editorRef.current.undo();
    }
    return false;
  }, []);

  const redo = useCallback(() => {
    if (editorRef.current) {
      return editorRef.current.redo();
    }
    return false;
  }, []);

  const resetEditor = useCallback(() => {
    setImageData(null);
    setIsEditorVisible(false);
    setImageInfo(null);
    setSelectedElement(null);
    editorRef.current = null;
    canvasRef.current = null;
  }, []);

  return {
    imageData,
    isEditorVisible,
    imageInfo,
    selectedElement,
    canvasRef,
    showEditor,
    initializeEditor,
    downloadImage,
    applyFilter,
    addText,
    addShape,
    updateElement,
    deleteSelectedElement,
    undo,
    redo,
    resetEditor,
  };
}
