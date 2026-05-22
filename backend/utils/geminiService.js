const { GoogleGenerativeAI } = require("@google/generative-ai");

let genAI = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
} else {
  console.warn("⚠️  [Gemini AI WARNING] GEMINI_API_KEY is not defined in environment variables. Plant AI features will be disabled!");
}

/**
 * Diagnostic check to verify Gemini API connection, key status, and quota health.
 * Runs on server bootup without blocking the main event loop.
 */
async function verifyGeminiConnection() {
  if (!genAI) {
    console.warn("⚠️  [Gemini AI Status] Connection check skipped: No GEMINI_API_KEY supplied.");
    return false;
  }

  console.log("🔄 Verifying Gemini AI connection...");
  try {
    // We use the modern gemini-2.0-flash model for our fast health handshake
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: "Hello" }] }],
      generationConfig: { maxOutputTokens: 5 }
    });
    
    // If we reached here, content generation succeeded perfectly!
    const text = result.response.text();
    console.log("✅ Gemini AI Service: Connection successful! Ready to process plant diagnosis and chat queries.");
    return true;
  } catch (err) {
    const errMsg = err.message || "";
    console.error("\n=================== GEMINI AI CONNECTION FAILURE ===================");
    
    if (errMsg.includes("403") || errMsg.includes("denied access")) {
      console.error("❌ ERROR: Your Google AI Studio / Google Cloud project has been denied access.");
      console.error("👉 REASON: Google has suspended or blocked the project associated with this API key.");
      console.error("👉 SOLUTION: Go to https://aistudio.google.com/, create a new project/key, and update GEMINI_API_KEY.");
    } else if (errMsg.includes("429") || errMsg.includes("quota")) {
      console.error("❌ ERROR: Quota Exceeded / Rate Limit Enforced.");
      console.error("👉 REASON: Your free tier request quota limit has been set to 0. This typically occurs when a key is suspended or flagged.");
      console.error("👉 SOLUTION: Generate a fresh API key from Google AI Studio (https://aistudio.google.com/).");
    } else if (errMsg.includes("404")) {
      console.error("❌ ERROR: Model Not Found (404).");
      console.error("👉 REASON: The requested Gemini model identifier is not supported on this SDK or key version.");
      console.error("👉 SOLUTION: Check your model version configurations.");
    } else {
      console.error(`❌ ERROR: Failed to communicate with Gemini API.`);
      console.error(`👉 DETAILS: ${errMsg}`);
    }
    
    console.error("====================================================================\n");
    return false;
  }
}

module.exports = {
  genAI,
  verifyGeminiConnection
};
