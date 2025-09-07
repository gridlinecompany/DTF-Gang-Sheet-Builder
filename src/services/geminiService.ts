const FUNCTION_URL = '/.netlify/functions/gemini';

async function callApi(action: string, params: Record<string, any>) {
    try {
        const response = await fetch(FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action, ...params }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || `Request failed with status ${response.status}`);
        }

        return result.data;
    } catch (error) {
        console.error(`Error calling function for action "${action}":`, error);
        if (error instanceof Error) {
            throw new Error(`AI service request failed: ${error.message}`);
        }
        throw new Error('An unknown error occurred while contacting the AI service.');
    }
}

export const removeBackground = async (base64ImageData: string, mimeType: string): Promise<string> => {
    return callApi('removeBackground', { base64ImageData, mimeType });
};

export const generateSeamlessPattern = async (prompt: string): Promise<string> => {
    return callApi('generatePattern', { prompt });
};
