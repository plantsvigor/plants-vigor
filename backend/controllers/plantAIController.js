const { GoogleGenerativeAI } = require("@google/generative-ai");
const { PlantDiagnosis, PlantQuizResult } = require("../models/PlantAI");
const { cloudinary } = require("../config/cloudinary");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper to convert file to generative part
function fileToGenerativePart(buffer, mimeType) {
  return {
    inlineData: {
      data: buffer.toString("base64"),
      mimeType
    },
  };
}

const diagnosePlant = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `
      Analyze this plant image and provide a detailed health report in JSON format.
      The JSON should have the following structure:
      {
        "plantName": "Name of the plant",
        "healthStatus": "Healthy" | "Needs Attention" | "Critical",
        "healthPercentage": 0-100,
        "issues": ["list of issues like yellow leaves, pests, etc."],
        "description": "Short description of the plant's current state",
        "careTips": ["specific care tips based on the image"],
        "recoverySteps": ["steps to fix issues if any"],
        "sunlightGuide": "Sunlight requirements",
        "wateringGuide": "Watering requirements",
        "fertilizerSuggestions": ["recommended fertilizers"],
        "recommendedProducts": [
          { "name": "Product Name (e.g. Neem Oil)", "reason": "Why it is recommended" }
        ],
        "confidenceScore": 0-1
      }
      If the image is not a plant, return an error message in the JSON under a "error" field.
      ONLY return the JSON string, no markdown formatting.
    `;

    // We can't directly send the cloudinary buffer easily, 
    // but since we are using multer-storage-cloudinary, req.file.path is the URL.
    // However, Gemini inlineData needs the base64. 
    // Let's use a workaround: fetch the image from cloudinary or use the buffer if available.
    // Actually, multer-storage-cloudinary doesn't keep the buffer by default.
    // Let's adjust: upload to cloudinary first (done by multer), then send the URL to Gemini or 
    // better yet, use multer-storage-memory for Gemini and then upload to cloudinary manually.
    
    // For now, I'll assume we want the most reliable way:
    // 1. Multer-storage-cloudinary already uploaded it.
    // 2. We can use the URL for Gemini if Gemini supports URLs, but 1.5-flash inlineData is safer with base64.
    // Since I don't want to double upload, I'll use the cloudinary URL to fetch the image bytes.
    
    console.log("Starting diagnosis for file:", req.file.path);
    const response = await fetch(req.file.path);
    if (!response.ok) throw new Error(`Failed to fetch image from Cloudinary: ${response.statusText}`);
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log("Image fetched and converted to buffer. Size:", buffer.length);
    
    const imagePart = fileToGenerativePart(buffer, req.file.mimetype);

    console.log("Sending to Gemini...");
    const result = await model.generateContent([prompt, imagePart]);
    const aiResponseText = result.response.text().trim().replace(/```json/g, "").replace(/```/g, "");
    console.log("Gemini response received:", aiResponseText);
    let diagnosisData;
    try {
      diagnosisData = JSON.parse(aiResponseText);
    } catch (parseError) {
      console.error("AI Response Parse Error:", aiResponseText);
      return res.status(500).json({ message: "Failed to parse AI response", raw: aiResponseText });
    }

    if (diagnosisData.error) {
      return res.status(400).json({ message: diagnosisData.error });
    }

    const newDiagnosis = new PlantDiagnosis({
      userId: req.user._id,
      image: {
        url: req.file.path,
        publicId: req.file.filename
      },
      diagnosis: diagnosisData,
      confidenceScore: diagnosisData.confidenceScore || 0.9,
    });

    await newDiagnosis.save();

    res.status(200).json(newDiagnosis);
  } catch (error) {
    console.error("Plant Diagnosis Error:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

const getDiagnosisHistory = async (req, res) => {
  try {
    const history = await PlantDiagnosis.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: "Error fetching history", error: error.message });
  }
};

const chatWithAI = async (req, res) => {
  try {
    const { message, history } = req.body;
    console.log("Chat Request - Message:", message);
    console.log("Chat Request - History Length:", history ? history.length : 0);
    
    const model = genAI.getGenerativeModel({ 
      model: "gemini-flash-latest",
      systemInstruction: "You are GreenBloom's Expert Plant Doctor. Provide helpful, concise, and professional plant care advice. Use markdown for lists and emphasis. You specialize in identifying plant issues and providing recovery plans."
    });

    const chat = model.startChat({
      history: history || [],
      generationConfig: {
        maxOutputTokens: 500,
      },
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const aiMessage = {
      role: "model",
      parts: [{ text: response.text() }]
    };
    res.status(200).json(aiMessage);
  } catch (error) {
    res.status(500).json({ message: "Chat Error", error: error.message });
  }
};

const saveQuizResult = async (req, res) => {
  try {
    const { preferences, recommendedPlants } = req.body;
    const result = new PlantQuizResult({
      userId: req.user._id,
      preferences,
      recommendedPlants
    });
    await result.save();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Error saving quiz", error: error.message });
  }
};

module.exports = {
  diagnosePlant,
  getDiagnosisHistory,
  chatWithAI,
  saveQuizResult
};
