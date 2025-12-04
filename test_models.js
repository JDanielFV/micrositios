const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = "AIzaSyB9tMRR7ynL0cGgAsbytzDsHwRBAku7BMk";
const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        // There isn't a direct listModels method on the client instance in some versions, 
        // but let's try to just run a generation with a very standard model name first to verify connectivity
        // or use the model manager if exposed.
        // Actually, the error message said "Call ListModels". 
        // In the Node SDK, it's usually not directly exposed on the main class in older versions, 
        // but let's try to infer from a simple generation or check documentation behavior.

        // Wait, the error comes from the API.
        // Let's try 'gemini-1.5-flash' again but maybe the issue is the library version?
        // package.json says "^0.24.1" which is recent.

        // Let's try to use the model manager if available, or just try a few known valid ones.

        console.log("Testing gemini-1.5-flash...");
        const modelFlash = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const resultFlash = await modelFlash.generateContent("Hello");
        console.log("gemini-1.5-flash worked!");
        return;
    } catch (error) {
        console.error("gemini-1.5-flash failed:", error.message);
    }

    try {
        console.log("Testing gemini-pro...");
        const modelPro = genAI.getGenerativeModel({ model: "gemini-pro" });
        const resultPro = await modelPro.generateContent("Hello");
        console.log("gemini-pro worked!");
        return;
    } catch (error) {
        console.error("gemini-pro failed:", error.message);
    }

    try {
        console.log("Testing gemini-1.0-pro...");
        const modelPro1 = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
        const resultPro1 = await modelPro1.generateContent("Hello");
        console.log("gemini-1.0-pro worked!");
        return;
    } catch (error) {
        console.error("gemini-1.0-pro failed:", error.message);
    }
}

listModels();
