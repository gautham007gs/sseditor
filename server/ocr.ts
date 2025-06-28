import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface DetectedText {
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
}

export async function extractTextFromImage(base64Image: string): Promise<DetectedText[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an OCR expert. Analyze the image and extract ALL text elements with their visual properties and positions. 
          
          For each text element, estimate:
          - Exact text content
          - Position (x, y coordinates as percentages from top-left: 0-100)
          - Dimensions (width, height as percentages: 0-100)
          - Font size (estimate in pixels: 8-72)
          - Font family (generic: Arial, Times, Courier, or similar)
          - Text color (hex format like #000000)
          - Confidence level (0-1)
          
          Return JSON array with this structure:
          [
            {
              "id": "unique_id",
              "text": "detected text",
              "x": 25.5,
              "y": 30.2,
              "width": 20.0,
              "height": 5.0,
              "fontSize": 16,
              "fontFamily": "Arial",
              "color": "#000000",
              "confidence": 0.95
            }
          ]
          
          Be precise with positioning and sizing. Return empty array if no text is found.`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract all text from this image with precise positioning and formatting details."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    if (result.textElements && Array.isArray(result.textElements)) {
      return result.textElements.map((item: any, index: number) => ({
        id: item.id || `text_${Date.now()}_${index}`,
        text: item.text || "",
        x: Math.max(0, Math.min(100, item.x || 0)),
        y: Math.max(0, Math.min(100, item.y || 0)),
        width: Math.max(1, Math.min(100, item.width || 10)),
        height: Math.max(1, Math.min(100, item.height || 5)),
        fontSize: Math.max(8, Math.min(72, item.fontSize || 16)),
        fontFamily: item.fontFamily || "Arial",
        color: item.color || "#000000",
        confidence: Math.max(0, Math.min(1, item.confidence || 0.5))
      }));
    }

    // Fallback: try to parse direct array
    if (Array.isArray(result)) {
      return result.map((item: any, index: number) => ({
        id: item.id || `text_${Date.now()}_${index}`,
        text: item.text || "",
        x: Math.max(0, Math.min(100, item.x || 0)),
        y: Math.max(0, Math.min(100, item.y || 0)),
        width: Math.max(1, Math.min(100, item.width || 10)),
        height: Math.max(1, Math.min(100, item.height || 5)),
        fontSize: Math.max(8, Math.min(72, item.fontSize || 16)),
        fontFamily: item.fontFamily || "Arial",
        color: item.color || "#000000",
        confidence: Math.max(0, Math.min(1, item.confidence || 0.5))
      }));
    }

    return [];
  } catch (error) {
    console.error("OCR extraction failed:", error);
    throw new Error("Failed to extract text from image");
  }
}

export async function analyzeImageElements(base64Image: string): Promise<{
  textElements: DetectedText[];
  imageDescription: string;
}> {
  try {
    const [textElements, description] = await Promise.all([
      extractTextFromImage(base64Image),
      analyzeImageContent(base64Image)
    ]);

    return {
      textElements,
      imageDescription: description
    };
  } catch (error) {
    console.error("Image analysis failed:", error);
    throw new Error("Failed to analyze image elements");
  }
}

async function analyzeImageContent(base64Image: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Briefly describe what you see in this image. Focus on the layout, visual elements, and overall content."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ],
        },
      ],
      max_tokens: 300,
    });

    return response.choices[0].message.content || "Image analyzed";
  } catch (error) {
    console.error("Image content analysis failed:", error);
    return "Could not analyze image content";
  }
}