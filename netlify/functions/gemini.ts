
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

interface PatternGenerationParams {
    prompt: string;
    style: string;
    colors: string;
    negativePrompt: string;
}

const generateSeamlessPattern = async (params: PatternGenerationParams) => {
    const { prompt, style, colors, negativePrompt } = params;

    let fullPrompt = `A high-quality, detailed, 4k, seamlessly tileable, repeating pattern of: "${prompt}". The pattern must have a transparent background with isolated subject elements.`;

    if (style && style !== 'default') {
        const styleText = style.replace('-', ' ');
        fullPrompt += ` Art style: ${styleText}.`;
    }

    if (colors && colors.trim()) {
        fullPrompt += ` Dominant color palette: ${colors.trim()}.`;
    }

    if (negativePrompt && negativePrompt.trim()) {
        fullPrompt += ` Avoid the following: ${negativePrompt.trim()}.`;
    }

    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: fullPrompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/png', // Request PNG for transparency
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/png;base64,${base64ImageBytes}`;
    } else {
        console.error("Imagen API did not return an image for pattern generation. Response:", response);
        throw new Error(`AI could not generate a pattern. The request may have been blocked for safety reasons or other issues.`);
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
                result = await generateSeamlessPattern(params as PatternGenerationParams);
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
