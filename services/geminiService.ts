
import { GoogleGenAI, Modality } from "@google/genai";

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

export const generateSeamlessPattern = async (prompt: string): Promise<string> => {
    if (!API_KEY) {
        throw new Error("API key is not configured.");
    }
    
    try {
        const fullPrompt = `A seamlessly tileable, repeating pattern of ${prompt} with a transparent background. The subject elements should be isolated. High quality, detailed, 4k.`;
        
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: fullPrompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/png',
                aspectRatio: '1:1',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image?.imageBytes) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/png;base64,${base64ImageBytes}`;
        } else {
            console.error("Gemini API did not return an image for pattern generation.", response);
            throw new Error("AI could not generate a pattern. The model may have refused the prompt.");
        }
    } catch (error) {
        console.error("Error calling Gemini API for pattern generation:", error);
        throw new Error("Failed to communicate with the AI image generation service.");
    }
};
