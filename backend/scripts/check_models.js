require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
        // Not all SDK versions expose listModels directly on genAI or model, 
        // but let's try the common pattern or use a fetch if needed.
        // Actually the Node SDK doesn't always have listModels easily accessible 
        // without using the model manager if available.
        // Let's try to just generate content with 'gemini-pro' as a fallback to test auth,
        // and try to list if possible. 
        // A better check is to use the REST API via fetch to list models.

        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.models) {
            console.log("Available Models:");
            data.models.forEach(m => {
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')) {
                    console.log(`- ${m.name}`);
                }
            });
        } else {
            console.log("Error listing models:", data);
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

listModels();
