export interface ImageInfo {
  width: number;
  height: number;
  size: number;
  format: string;
}

export interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
  width: number;
  height: number;
  isOcrDetected?: boolean;
  confidence?: number;
  originalText?: string;
}

export interface ShapeElement {
  id: string;
  type: 'rectangle' | 'circle' | 'arrow';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  strokeWidth: number;
}

export type CanvasElement = TextElement | ShapeElement;

export class ImageEditor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private history: ImageData[] = [];
  private historyIndex: number = -1;
  private originalImage: HTMLImageElement | null = null;
  private elements: CanvasElement[] = [];
  private selectedElement: CanvasElement | null = null;
  private isDragging = false;
  private dragOffset = { x: 0, y: 0 };
  private onElementSelect: ((element: CanvasElement | null) => void) | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    this.ctx = ctx;
    this.setupEventListeners();
  }

  setElementSelectCallback(callback: (element: CanvasElement | null) => void) {
    this.onElementSelect = callback;
  }

  private setupEventListeners() {
    // Mouse events
    this.canvas.addEventListener('click', this.handleCanvasClick.bind(this));
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    
    // Touch events for mobile support
    this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
  }

  loadImage(imageData: string): Promise<ImageInfo> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.originalImage = img;
        
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
        
        // Clear elements and redraw everything
        this.elements = [];
        this.redrawCanvas();
        
        // Save to history
        this.saveToHistory();
        
        console.log('Canvas setup complete:', { width, height, elements: this.elements.length });
        
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

  private handleCanvasClick(event: MouseEvent) {
    console.log('Canvas clicked at:', event.clientX, event.clientY);
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    console.log('Canvas relative position:', x, y);
    console.log('Current elements:', this.elements);
    
    // Check if click is on any element
    const clickedElement = this.getElementAtPosition(x, y);
    console.log('Clicked element:', clickedElement);
    
    if (clickedElement !== this.selectedElement) {
      this.selectedElement = clickedElement;
      this.redrawCanvas();
      
      if (this.onElementSelect) {
        this.onElementSelect(clickedElement);
      }
    }
  }

  private handleMouseDown(event: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const element = this.getElementAtPosition(x, y);
    if (element) {
      this.selectedElement = element;
      this.isDragging = true;
      this.dragOffset = {
        x: x - element.x,
        y: y - element.y
      };
    }
  }

  private handleMouseMove(event: MouseEvent) {
    if (!this.isDragging || !this.selectedElement) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    this.selectedElement.x = x - this.dragOffset.x;
    this.selectedElement.y = y - this.dragOffset.y;
    
    this.redrawCanvas();
  }

  private handleMouseUp() {
    if (this.isDragging) {
      this.isDragging = false;
      this.saveToHistory();
    }
  }

  private handleTouchStart(event: TouchEvent) {
    event.preventDefault();
    const touch = event.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    const clickedElement = this.getElementAtPosition(x, y);
    if (clickedElement) {
      this.selectedElement = clickedElement;
      this.isDragging = true;
      this.dragOffset = {
        x: x - clickedElement.x,
        y: y - clickedElement.y
      };
      
      if (this.onElementSelect) {
        this.onElementSelect(clickedElement);
      }
      this.redrawCanvas();
    }
  }

  private handleTouchMove(event: TouchEvent) {
    event.preventDefault();
    if (!this.isDragging || !this.selectedElement) return;
    
    const touch = event.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    this.selectedElement.x = x - this.dragOffset.x;
    this.selectedElement.y = y - this.dragOffset.y;
    
    this.redrawCanvas();
  }

  private handleTouchEnd(event: TouchEvent) {
    event.preventDefault();
    this.isDragging = false;
    if (this.selectedElement) {
      this.saveToHistory();
    }
  }

  private getElementAtPosition(x: number, y: number): CanvasElement | null {
    // Check in reverse order (top to bottom)
    for (let i = this.elements.length - 1; i >= 0; i--) {
      const element = this.elements[i];
      
      if (x >= element.x && x <= element.x + element.width &&
          y >= element.y && y <= element.y + element.height) {
        return element;
      }
    }
    return null;
  }

  getSelectedElement(): CanvasElement | null {
    return this.selectedElement;
  }

  updateElement(elementId: string, updates: Partial<CanvasElement>) {
    const element = this.elements.find(el => el.id === elementId);
    if (element) {
      Object.assign(element, updates);
      this.redrawCanvas();
      this.saveToHistory();
    }
  }

  deleteSelectedElement() {
    if (this.selectedElement) {
      this.elements = this.elements.filter(el => el.id !== this.selectedElement!.id);
      this.selectedElement = null;
      this.redrawCanvas();
      this.saveToHistory();
      
      if (this.onElementSelect) {
        this.onElementSelect(null);
      }
    }
  }

  async extractTextFromImage(): Promise<TextElement[]> {
    try {
      const imageData = this.export('jpeg', 0.8);
      
      // Use client-side OCR instead of API
      const { clientOCR } = await import('./client-ocr');
      const ocrElements = await clientOCR.extractTextFromImage(imageData);
      
      // Convert OCR elements to TextElements with canvas coordinates
      const textElements: TextElement[] = ocrElements.map(element => ({
        id: element.id,
        text: element.text,
        x: element.x,
        y: element.y,
        fontSize: element.fontSize,
        color: element.color,
        fontFamily: element.fontFamily,
        width: element.width,
        height: element.height,
        isOcrDetected: true,
        confidence: element.confidence,
        originalText: element.originalText
      }));

      return textElements;
    } catch (error) {
      console.error('Client-side OCR extraction failed:', error);
      throw new Error('Failed to extract text from image');
    }
  }

  async analyzeAndLoadOcrText(): Promise<{ textElements: TextElement[], description: string }> {
    try {
      const imageData = this.export('jpeg', 0.8);
      
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
      
      if (result.success) {
        // Convert percentage-based coordinates to canvas pixels
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        
        const textElements: TextElement[] = (result.textElements || []).map((item: any) => ({
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

        // Add detected text elements to the canvas
        this.elements.push(...textElements);
        this.redrawCanvas();
        this.saveToHistory();

        return {
          textElements,
          description: result.imageDescription || 'Image analyzed'
        };
      }
      
      return { textElements: [], description: 'No analysis results' };
    } catch (error) {
      console.error('Failed to analyze image:', error);
      throw new Error('Failed to analyze image');
    }
  }

  updateOcrTextElement(elementId: string, newText: string) {
    const element = this.elements.find(el => el.id === elementId) as TextElement;
    if (element && 'text' in element) {
      element.text = newText;
      
      // Recalculate width based on new text
      const ctx = this.ctx;
      ctx.font = `${element.fontSize}px ${element.fontFamily}`;
      element.width = ctx.measureText(newText).width;
      
      this.redrawCanvas();
      this.saveToHistory();
    }
  }

  getOcrTextElements(): TextElement[] {
    return this.elements.filter((el): el is TextElement => 
      'text' in el && (el as TextElement).isOcrDetected === true
    );
  }

  applyFilter(brightness: number, contrast: number, saturation: number) {
    // Store filter values for redraw
    this.currentFilters = { brightness, contrast, saturation };
    this.redrawCanvas();
  }

  private currentFilters = { brightness: 100, contrast: 100, saturation: 100 };

  addText(text: string, x: number, y: number, fontSize: number = 24, color: string = '#000000') {
    console.log('ImageEditor.addText called with:', { text, x, y, fontSize, color });
    if (!text.trim()) {
      console.log('Empty text, not adding element');
      return;
    }
    
    const textElement: TextElement = {
      id: `text_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text,
      x,
      y,
      fontSize,
      color,
      fontFamily: 'Inter, sans-serif',
      width: this.getTextWidth(text, fontSize),
      height: fontSize
    };
    
    console.log('Created text element:', textElement);
    this.elements.push(textElement);
    console.log('Total elements after adding text:', this.elements.length);
    this.selectedElement = textElement;
    this.redrawCanvas();
    this.saveToHistory();
    
    if (this.onElementSelect) {
      this.onElementSelect(textElement);
    }
  }

  addShape(type: 'rectangle' | 'circle' | 'arrow', x: number, y: number, width: number = 100, height: number = 100, color: string = '#ff0000') {
    const shapeElement: ShapeElement = {
      id: `shape_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      x,
      y,
      width,
      height,
      color,
      strokeWidth: 2
    };
    
    this.elements.push(shapeElement);
    this.selectedElement = shapeElement;
    this.redrawCanvas();
    this.saveToHistory();
    
    if (this.onElementSelect) {
      this.onElementSelect(shapeElement);
    }
  }

  private getTextWidth(text: string, fontSize: number): number {
    this.ctx.font = `${fontSize}px Inter, sans-serif`;
    return this.ctx.measureText(text).width;
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
    this.redrawCanvas();
  }

  private redrawCanvas() {
    // Clear the canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw the original image if available with filters
    if (this.originalImage) {
      // Apply filters to the image
      this.ctx.filter = `brightness(${this.currentFilters.brightness}%) contrast(${this.currentFilters.contrast}%) saturate(${this.currentFilters.saturation}%)`;
      this.ctx.drawImage(this.originalImage, 0, 0, this.canvas.width, this.canvas.height);
      
      // Reset filter for elements
      this.ctx.filter = 'none';
    }
    
    // Draw all elements
    this.elements.forEach(element => {
      this.drawElement(element);
      
      // Draw selection border if this element is selected
      if (element === this.selectedElement) {
        this.drawSelectionBorder(element);
      }
    });
  }

  private drawElement(element: CanvasElement) {
    if ('text' in element) {
      this.drawTextElement(element as TextElement);
    } else {
      this.drawShapeElement(element as ShapeElement);
    }
  }

  private drawTextElement(element: TextElement) {
    this.ctx.font = `${element.fontSize}px ${element.fontFamily}`;
    this.ctx.fillStyle = element.color;
    this.ctx.fillText(element.text, element.x, element.y + element.fontSize);
  }

  private drawShapeElement(element: ShapeElement) {
    this.ctx.strokeStyle = element.color;
    this.ctx.lineWidth = element.strokeWidth;
    
    switch (element.type) {
      case 'rectangle':
        this.ctx.strokeRect(element.x, element.y, element.width, element.height);
        break;
      case 'circle':
        this.ctx.beginPath();
        this.ctx.arc(
          element.x + element.width / 2,
          element.y + element.height / 2,
          Math.min(element.width, element.height) / 2,
          0,
          2 * Math.PI
        );
        this.ctx.stroke();
        break;
      case 'arrow':
        this.drawArrow(element);
        break;
    }
  }

  private drawArrow(element: ShapeElement) {
    const startX = element.x;
    const startY = element.y;
    const endX = element.x + element.width;
    const endY = element.y + element.height;
    
    // Draw arrow line
    this.ctx.beginPath();
    this.ctx.moveTo(startX, startY);
    this.ctx.lineTo(endX, endY);
    this.ctx.stroke();
    
    // Draw arrowhead
    const headLength = 15;
    const angle = Math.atan2(endY - startY, endX - startX);
    
    this.ctx.beginPath();
    this.ctx.moveTo(endX, endY);
    this.ctx.lineTo(
      endX - headLength * Math.cos(angle - Math.PI / 6),
      endY - headLength * Math.sin(angle - Math.PI / 6)
    );
    this.ctx.moveTo(endX, endY);
    this.ctx.lineTo(
      endX - headLength * Math.cos(angle + Math.PI / 6),
      endY - headLength * Math.sin(angle + Math.PI / 6)
    );
    this.ctx.stroke();
  }

  private drawSelectionBorder(element: CanvasElement) {
    this.ctx.strokeStyle = '#007bff';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([5, 5]);
    this.ctx.strokeRect(
      element.x - 2,
      element.y - 2,
      element.width + 4,
      element.height + 4
    );
    this.ctx.setLineDash([]);
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
