import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { extractTextFromImage, analyzeImageElements } from "./ocr";

const extractTextSchema = z.object({
  imageData: z.string().min(1, "Image data is required")
});

const analyzeImageSchema = z.object({
  imageData: z.string().min(1, "Image data is required")
});

export async function registerRoutes(app: Express): Promise<Server> {
  // OCR text extraction endpoint
  app.post("/api/extract-text", async (req, res) => {
    try {
      const { imageData } = extractTextSchema.parse(req.body);
      
      // Remove data URL prefix if present
      const base64Image = imageData.replace(/^data:image\/[a-z]+;base64,/, "");
      
      const textElements = await extractTextFromImage(base64Image);
      
      res.json({
        success: true,
        textElements,
        count: textElements.length
      });
    } catch (error) {
      console.error("Text extraction error:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Failed to extract text"
      });
    }
  });

  // Enhanced image analysis endpoint
  app.post("/api/analyze-image", async (req, res) => {
    try {
      const { imageData } = analyzeImageSchema.parse(req.body);
      
      // Remove data URL prefix if present
      const base64Image = imageData.replace(/^data:image\/[a-z]+;base64,/, "");
      
      const analysis = await analyzeImageElements(base64Image);
      
      res.json({
        success: true,
        ...analysis
      });
    } catch (error) {
      console.error("Image analysis error:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Failed to analyze image"
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
