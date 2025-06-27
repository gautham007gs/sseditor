import { useState, useRef, useCallback } from "react";
import { ImageEditor, ImageInfo } from "@/lib/image-editor";

export function useImageEditor() {
  const [imageData, setImageData] = useState<string | null>(null);
  const [isEditorVisible, setIsEditorVisible] = useState(false);
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const editorRef = useRef<ImageEditor | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const showEditor = useCallback(async (file: File, dataUrl: string) => {
    setImageData(dataUrl);
    setIsEditorVisible(true);
    
    // Create canvas if it doesn't exist
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }
    
    try {
      if (!editorRef.current) {
        editorRef.current = new ImageEditor(canvasRef.current);
      }
      
      const info = await editorRef.current.loadImage(dataUrl);
      setImageInfo(info);
    } catch (error) {
      console.error('Error loading image:', error);
    }
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

  const addText = useCallback((text: string, x: number, y: number, fontSize: number, color: string) => {
    if (editorRef.current) {
      editorRef.current.addText(text, x, y, fontSize, color);
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

  return {
    imageData,
    isEditorVisible,
    imageInfo,
    canvasRef,
    showEditor,
    downloadImage,
    applyFilter,
    addText,
    undo,
    redo,
  };
}
