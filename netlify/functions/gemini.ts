import { GoogleGenAI, Modality } from "@google/genai";
import type { Handler } from '@netlify/functions';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("Gemini API key not found in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const headers = {
  'Access-Control-Allow-Origin': '*', // Allows any origin
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const removeBackground = async (base64ImageData: string, mimeType: string) => {
    const base64Data = base64ImageData.split(',')[1] || base64ImageData;
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
         return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
    } else {
        const textPart = response.candidates?.[0]?.content?.parts?.find(part => part.text);
        const refusalReason = textPart?.text || "No reason specified";
        throw new Error(`AI could not process the image. Reason: ${refusalReason}`);
    }
};

const generateSeamlessPattern = async (prompt: string) => {
    const transparent_1x1_png_b64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    const fullPrompt = `On this transparent canvas, generate a high-quality, detailed, 4k, seamlessly tileable, repeating pattern of: "${prompt}". The pattern should have a transparent background with isolated subject elements.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
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
        throw new Error(`AI could not generate a pattern. Reason: ${refusalReason}`);
    }
};

export const handler: Handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
        };
    }
    
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        if (!event.body) {
            return { statusCode: 400, body: 'Bad Request: No body provided.' };
        }
        
        const { action, ...params } = JSON.parse(event.body);

        let result;

        switch (action) {
            case 'removeBackground':
                if (!params.base64ImageData || !params.mimeType) {
                    return { statusCode: 400, body: 'Bad Request: Missing parameters for removeBackground.' };
                }
                result = await removeBackground(params.base64ImageData, params.mimeType);
                break;
            case 'generatePattern':
                if (!params.prompt) {
                    return { statusCode: 400, body: 'Bad Request: Missing prompt for generatePattern.' };
                }
                result = await generateSeamlessPattern(params.prompt);
                break;
            default:
                return { statusCode: 400, body: 'Bad Request: Invalid action.' };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ data: result }),
        };
    } catch (error) {
        console.error("Error in Netlify function:", error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error instanceof Error ? error.message : 'An internal server error occurred.' }),
        };
    }
};
