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

    // Note: Using gemini-2.5-flash-image-preview for image generation from a text prompt is unconventional.
    // This model is optimized for image editing. For better text-to-image results, 'imagen-4.0-generate-001' is recommended.
    // To make this work, we provide a blank transparent canvas for the model to "edit".
    const transparent_1x1_png_b64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    
    try {
        const fullPrompt = `On this transparent canvas, generate a high-quality, detailed, 4k, seamlessly tileable, repeating pattern of: "${prompt}". The pattern should have a transparent background with isolated subject elements.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview', // Using "nano banana" as requested
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: transparent_1x1_png_b64,
                            mimeType: 'image/png',
                        },
                    },
                    { text: fullPrompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

        if (imagePart && imagePart.inlineData) {
            return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
        } else {
            const textPart = response.candidates?.[0]?.content?.parts?.find(part => part.text);
            const refusalReason = textPart?.text || "No image was generated.";
            console.error("Gemini API did not return an image for pattern generation. Reason:", refusalReason, response);
            throw new Error(`AI could not generate a pattern. Reason: ${refusalReason}`);
        }
    } catch (error) {
        console.error("Error calling Gemini API for pattern generation:", error);
        throw new Error("Failed to communicate with the AI image generation service.");
    }
};