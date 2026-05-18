const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

async function test() {
  try {
    console.log("Testing with Key:", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) + "..." : "undefined");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    console.log("Sending prompt...");
    const result = await model.generateContent("Say hello");
    console.log("Response:", result.response.text());
  } catch (err) {
    console.error("FAILED:", err);
  }
}

test();
