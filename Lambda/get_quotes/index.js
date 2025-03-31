import dotenv from 'dotenv';

dotenv.config();

export const handler = async (event) => {
    const api_key = process.env.API_KEY;

    console.log("Incoming request:", JSON.stringify(event, null, 2)); // ✅ Debug incoming request

    // ✅ Handle CORS Preflight (OPTIONS Request)
    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
            body: JSON.stringify({ message: "CORS preflight successful" }),
        };
    }

    try {
        const response = await fetch('https://api.api-ninjas.com/v1/quotes', {
            method: "GET",
            headers: {
                'X-Api-Key': api_key, // ✅ Correct API key format
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`API request failed with status: ${response.status}`);
        }

        const data = await response.json();

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
            body: JSON.stringify(data),
        };
    } catch (error) {
        console.error('Error fetching quote:', error);

        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
            body: JSON.stringify({ message: "Failed to fetch quote", error: error.message }),
        };
    }
};
