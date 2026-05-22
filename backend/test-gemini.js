const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

async function runDiagnostics() {
  console.log("=================== GEMINI AI DEVELOPER DIAGNOSTICS ===================");
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error("❌ ERROR: GEMINI_API_KEY is not defined in your environment variables (.env).");
    console.error("👉 ACTION REQUIRED: Add GEMINI_API_KEY to your .env file.");
    console.log("=======================================================================");
    return;
  }
  
  console.log(`🔑 Key Detected: ${apiKey.substring(0, 10)}... (Length: ${apiKey.length})`);
  console.log("🎯 Targeting Model: gemini-2.0-flash (Default Model for Greenbloom)");
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    console.log("🔄 Sending content generation request...");
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: "Respond with the word 'SUCCESS' if you read this." }] }],
      generationConfig: { maxOutputTokens: 10 }
    });
    
    const text = result.response.text().trim();
    console.log("\n✅ SUCCESS! Gemini API responded perfectly:");
    console.log(`💬 AI Output: "${text}"`);
    console.log("\n🎉 Your API key is 100% working and ready for production deployment!");
    console.log("=======================================================================");
  } catch (err) {
    const errMsg = err.message || "";
    console.error("\n❌ FAILED: Unable to communicate with Gemini API.");
    console.error(`💥 Error Details: ${errMsg}`);
    
    console.log("\n------------------------- DIAGNOSTIC GUIDANCE -------------------------");
    if (errMsg.includes("403") || errMsg.includes("denied access")) {
      console.log("👉 PROBLEM: Your Google AI Studio/Google Cloud project has been suspended or denied access.");
      console.log("👉 ACTION: You must generate a brand new API key from Google AI Studio.");
      console.log("   1. Open: https://aistudio.google.com/");
      console.log("   2. Click 'Get API Key'.");
      console.log("   3. Create a fresh key (preferably in a new cloud project).");
      console.log("   4. Update GEMINI_API_KEY in your local .env and Render settings.");
    } else if (errMsg.includes("429") || errMsg.includes("quota")) {
      console.log("👉 PROBLEM: Your current key's free tier quota limit is restricted to 0.");
      console.log("👉 ACTION: This is typically due to suspension or account verification requirements.");
      console.log("   1. Open: https://aistudio.google.com/");
      console.log("   2. Create a brand new API key under a fresh Google Account / Project.");
      console.log("   3. Update GEMINI_API_KEY in your .env and Render environment settings.");
    } else if (errMsg.includes("404")) {
      console.log("👉 PROBLEM: The target model 'gemini-2.0-flash' is unsupported or not enabled on this key.");
      console.log("👉 ACTION: Ensure your Google AI Studio account has access to Gemini 2.0 or list available models.");
    } else {
      console.log("👉 ACTION: Double check that your internet connection is active and that your API key is correctly pasted.");
    }
    console.log("=======================================================================");
  }
}

runDiagnostics();
