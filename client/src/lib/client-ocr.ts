import Tesseract from 'tesseract.js';

export interface OCRTextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  confidence: number;
  isOcrDetected: boolean;
  originalText?: string;
}

export class ClientOCR {
  private worker: Tesseract.Worker | null = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('Initializing Tesseract OCR worker...');
      this.worker = await Tesseract.createWorker('eng');
      this.isInitialized = true;
      console.log('Tesseract OCR worker initialized successfully');
    } catch (error) {
      console.error('Failed to initialize OCR worker:', error);
      throw new Error('OCR initialization failed');
    }
  }

  async extractTextFromImage(imageData: string): Promise<OCRTextElement[]> {
    if (!this.worker) {
      await this.initialize();
    }

    if (!this.worker) {
      throw new Error('OCR worker not available');
    }

    try {
      console.log('Starting OCR text extraction...');
      
      const { data } = await this.worker.recognize(imageData);
      console.log('OCR recognition completed:', data);

      const textElements: OCRTextElement[] = [];

      // Process words from OCR results
      const words = (data as any).words;
      if (words && Array.isArray(words)) {
        words.forEach((word: any, index: number) => {
          if (word.text?.trim() && word.confidence > 30) { // Only include words with reasonable confidence
            const bbox = word.bbox || { x0: 0, y0: 0, x1: 100, y1: 20 };
            
            // Estimate font size based on bounding box height
            const fontSize = Math.max(12, Math.min(72, bbox.y1 - bbox.y0));
            
            textElements.push({
              id: `ocr-word-${index}`,
              text: word.text.trim(),
              x: bbox.x0,
              y: bbox.y0,
              width: bbox.x1 - bbox.x0,
              height: bbox.y1 - bbox.y0,
              fontSize: fontSize,
              fontFamily: 'Arial, sans-serif', // Default font
              color: '#000000', // Default black color
              confidence: word.confidence / 100, // Convert to 0-1 range
              isOcrDetected: true,
              originalText: word.text.trim()
            });
          }
        });
      }

      console.log(`Extracted ${textElements.length} text elements`);
      return textElements;
    } catch (error) {
      console.error('OCR text extraction failed:', error);
      throw new Error('Text extraction failed');
    }
  }

  async analyzeImageContent(imageData: string): Promise<string> {
    if (!this.worker) {
      await this.initialize();
    }

    if (!this.worker) {
      throw new Error('OCR worker not available');
    }

    try {
      const { data } = await this.worker.recognize(imageData);
      
      // Create a summary of detected content
      const allText = data.text?.trim() || '';
      const words = (data as any).words || [];
      const wordCount = words.length;
      const avgConfidence = words.reduce((sum: number, word: any) => sum + (word.confidence || 0), 0) / Math.max(wordCount, 1);
      
      let description = 'Image analysis completed. ';
      
      if (allText) {
        description += `Detected ${wordCount} text elements with ${avgConfidence.toFixed(1)}% average confidence. `;
        
        if (allText.length > 100) {
          description += `Content preview: "${allText.substring(0, 100)}..."`;
        } else {
          description += `Full text: "${allText}"`;
        }
      } else {
        description += 'No readable text detected in the image.';
      }

      return description;
    } catch (error) {
      console.error('Image analysis failed:', error);
      return 'Failed to analyze image content.';
    }
  }

  async cleanup(): Promise<void> {
    if (this.worker) {
      try {
        await this.worker.terminate();
        this.worker = null;
        this.isInitialized = false;
        console.log('OCR worker terminated');
      } catch (error) {
        console.error('Error terminating OCR worker:', error);
      }
    }
  }
}

// Global OCR instance
export const clientOCR = new ClientOCR();