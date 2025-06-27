export interface ImageInfo {
  width: number;
  height: number;
  size: number;
  format: string;
}

export class ImageEditor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private history: ImageData[] = [];
  private historyIndex: number = -1;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    this.ctx = ctx;
  }

  loadImage(imageData: string): Promise<ImageInfo> {
    return new Promise((resolve, reject) => {
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
        
        this.canvas.width = width;
        this.canvas.height = height;
        
        // Draw image on canvas
        this.ctx.drawImage(img, 0, 0, width, height);
        
        // Save to history
        this.saveToHistory();
        
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight,
          size: this.estimateFileSize(imageData),
          format: this.getFormatFromDataUrl(imageData)
        });
      };
      img.onerror = reject;
      img.src = imageData;
    });
  }

  applyFilter(brightness: number, contrast: number, saturation: number) {
    this.ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    this.redraw();
  }

  addText(text: string, x: number, y: number, fontSize: number, color: string) {
    this.ctx.font = `${fontSize}px Inter, sans-serif`;
    this.ctx.fillStyle = color;
    this.ctx.fillText(text, x, y);
    this.saveToHistory();
  }

  crop(x: number, y: number, width: number, height: number) {
    const imageData = this.ctx.getImageData(x, y, width, height);
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx.putImageData(imageData, 0, 0);
    this.saveToHistory();
  }

  resize(newWidth: number, newHeight: number) {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d')!;
    
    tempCanvas.width = this.canvas.width;
    tempCanvas.height = this.canvas.height;
    tempCtx.putImageData(imageData, 0, 0);
    
    this.canvas.width = newWidth;
    this.canvas.height = newHeight;
    this.ctx.drawImage(tempCanvas, 0, 0, newWidth, newHeight);
    this.saveToHistory();
  }

  undo(): boolean {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.ctx.putImageData(this.history[this.historyIndex], 0, 0);
      return true;
    }
    return false;
  }

  redo(): boolean {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.ctx.putImageData(this.history[this.historyIndex], 0, 0);
      return true;
    }
    return false;
  }

  export(format: 'png' | 'jpeg' = 'png', quality: number = 1): string {
    return this.canvas.toDataURL(`image/${format}`, quality);
  }

  private saveToHistory() {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(imageData);
    this.historyIndex = this.history.length - 1;
  }

  private redraw() {
    // This method would redraw the original image with current filters
    // For simplicity, we're not implementing full redraw here
  }

  private estimateFileSize(dataUrl: string): number {
    // Rough estimation based on base64 data
    const base64Data = dataUrl.split(',')[1];
    return Math.round((base64Data.length * 3) / 4);
  }

  private getFormatFromDataUrl(dataUrl: string): string {
    const mimeType = dataUrl.split(',')[0].split(':')[1].split(';')[0];
    return mimeType.split('/')[1];
  }
}
