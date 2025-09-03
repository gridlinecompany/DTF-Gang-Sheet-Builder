
import { GoogleGenAI, Modality, Type } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    console.error("Gemini API key not found. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const removeBackground = async (base64ImageData: string, mimeType: string): Promise<string> => {
    if (!API_KEY) {
        throw new Error("API key is not configured.");
    }
    // Remove the data URL prefix if it exists
    const base64Data = base64ImageData.split(',')[1] || base64ImageData;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64Data,
                            mimeType: mimeType,
                        },
                    },
                    {
                        text: 'Remove the background from this image, making the background fully transparent. Only return the main subject.',
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        
        const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

        if (imagePart && imagePart.inlineData) {
             // Return the new image as a data URL
             return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
        } else {
            const textPart = response.candidates?.[0]?.content?.parts?.find(part => part.text);
            const refusalReason = textPart?.text || "No reason specified";
            console.error("Gemini API did not return an image. Reason:", refusalReason);
            throw new Error(`AI could not process the image. Reason: ${refusalReason}`);
        }
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to communicate with the AI service.");
    }
};

export const trimImage = async (base64ImageData: string, mimeType: string): Promise<{x: number, y: number, width: number, height: number}> => {
    if (!API_KEY) {
        throw new Error("API key is not configured.");
    }
    const base64Data = base64ImageData.split(',')[1] || base64ImageData;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64Data,
                            mimeType: mimeType,
                        },
                    },
                    {
                        text: 'Identify the primary subject in this image. Return a JSON object with the tightest possible bounding box around it, with keys "x", "y", "width", and "height" as integer pixel values.',
                    },
                ],
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        x: { type: Type.INTEGER },
                        y: { type: Type.INTEGER },
                        width: { type: Type.INTEGER },
                        height: { type: Type.INTEGER },
                    },
                },
            },
        });

        const jsonStr = response.text.trim();
        if (jsonStr) {
            return JSON.parse(jsonStr);
        } else {
            throw new Error("AI did not return a valid bounding box.");
        }
    } catch (error) {
        console.error("Error calling Gemini API for trimming:", error);
        throw new Error("Failed to communicate with the AI service for trimming.");
    }
};
