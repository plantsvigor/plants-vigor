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

// Rate limiting cache
const chatRateLimits = new Map();

// FAQ Caching Map
const faqCache = new Map();

// Intent Detection and Predefined Business Logic Handlers
const handleEcommerceIntent = async (message, user) => {
  const msgLower = message.toLowerCase();

  // 1. Order tracking
  if (msgLower.includes("order") || msgLower.includes("track") || msgLower.includes("package") || msgLower.includes("status")) {
    if (!user) {
      return "Please log in first to track your orders. If you have an order number, please sign in to see its real-time shipping status.";
    }

    try {
      const { Order } = require("../models/Order");
      // Find the latest order for this user
      const order = await Order.findOne({
        $or: [
          { userId: user._id.toString() },
          { email: user.email }
        ]
      }).sort({ createdAtMs: -1 });

      if (!order) {
        return "Hi there! I couldn't find any recent orders associated with your account. If you placed an order recently, please ensure you're logged in with the correct email address.";
      }

      return `📦 **Order Status**: Your latest order **${order.orderCode}** is currently **${order.status}**.\n\n* **Placed on**: ${new Date(order.createdAtMs || order.createdAt).toLocaleDateString()}\n* **Payment**: ${order.payment} (${order.paymentId ? 'Completed' : 'Pending Verification'})\n* **Total**: Rs. ${order.totalAmount || order.total}\n* **Delivery Address**: ${order.address.addressLine1}, ${order.address.city}\n\nYou can track the shipping progress directly in the "My Orders" dashboard!`;
    } catch (err) {
      console.error("Error fetching order context for chatbot:", err);
      return "I encountered an issue trying to retrieve your order details. Please visit the 'My Orders' section in your account dashboard to track your order.";
    }
  }

  // 2. Shipping FAQ
  if (msgLower.includes("shipping") || msgLower.includes("deliver")) {
    return "🚚 **Shipping Policy & Details**:\n\n* We ship greenhouse-fresh plants securely in specialized eco-friendly ventilated packaging.\n* **Delivery Timeline**: 3-5 business days across India.\n* **Shipping Charges**: Free delivery on all orders above Rs. 499. For orders below Rs. 499, a flat delivery fee of Rs. 49 is applied.\n* You will receive a tracking link via SMS/Email as soon as your package is dispatched.";
  }

  // 3. Return & Refund FAQ
  if (msgLower.includes("return") || msgLower.includes("refund") || msgLower.includes("cancel")) {
    return "🌿 **Returns & Refund Guarantee**:\n\n* We want you and your plants to thrive! If your plant arrives damaged or unhealthy, we offer a **100% Replacement or Refund** within **7 days** of delivery.\n* Simply share an image of the damaged plant using our **AI Plant Care Doctor / Diagnosis** tool or contact us at support@plantsvigor.com.\n* **Refund Processing**: Once approved, refunds are credited back to your original payment method within 5-7 business days.";
  }

  // 4. Payment FAQs
  if (msgLower.includes("payment") || msgLower.includes("pay") || msgLower.includes("razorpay") || msgLower.includes("cod")) {
    return "💳 **Secure Payment Methods**:\n\n* We support 100% secure payments via **Razorpay** (UPI, Credit/Debit Cards, Netbanking).\n* **Cash on Delivery (COD)** is also available for all deliverable pin codes.\n* All transactions are encrypted, and no sensitive card information is stored on our servers.";
  }

  // 5. Cart Help
  if (msgLower.includes("cart") || msgLower.includes("help") || msgLower.includes("support")) {
    return "🛒 **Need help with your cart or checkout?**\n\n* You can add items to your cart as a guest. When you are ready to checkout, you'll be prompted to log in/sign up. Any items in your guest cart will merge automatically!\n* Check if you have chosen your preferred **Planter Type** (Standard Gropot or Premium Krish Planter adding just +Rs. 50).\n* For further assistance, feel free to email our customer delight team at support@plantsvigor.com.";
  }

  return "👋 Hello! I am your Plants Vigor support assistant. I can help you with order tracking, shipping, payments, returns, and plant care. What can I do for you today?";
};

const handlePlantDbIntent = async (message) => {
  const msgLower = message.toLowerCase();
  try {
    const { PlantInfo } = require("../models/PlantInfo");
    const plants = await PlantInfo.find({});
    let matchedPlant = null;

    for (const plant of plants) {
      if (msgLower.includes(plant.name.toLowerCase())) {
        matchedPlant = plant;
        break;
      }
    }

    if (!matchedPlant) {
      return null; // Fallback to AI
    }

    // Direct care guides based on matching fields
    if (msgLower.includes("water")) {
      return `💧 **Watering Guide for ${matchedPlant.name}**:\n\n${matchedPlant.watering}\n\n* **Pro Care Tip**: ${matchedPlant.careTips[0] || 'Ensure good drainage.'}`;
    }
    if (msgLower.includes("light") || msgLower.includes("sun")) {
      return `☀️ **Sunlight Requirements for ${matchedPlant.name}**:\n\n${matchedPlant.sunlight}`;
    }
    if (msgLower.includes("fertiliz") || msgLower.includes("feed")) {
      return `🌱 **Fertilizer Instructions for ${matchedPlant.name}**:\n\n${matchedPlant.fertilizer}`;
    }
    if (msgLower.includes("humid") || msgLower.includes("moist")) {
      return `💨 **Humidity Guide for ${matchedPlant.name}**:\n\n${matchedPlant.humidity}`;
    }
    if (msgLower.includes("pet") || msgLower.includes("dog") || msgLower.includes("cat") || msgLower.includes("toxic")) {
      return matchedPlant.petFriendly
        ? `🐾 Safe choice! **${matchedPlant.name}** is **100% Pet-Friendly** and non-toxic to cats and dogs. Perfect for households with furry friends.`
        : `⚠️ Caution: **${matchedPlant.name}** is **toxic to pets**. Keep it out of reach of curious cats and dogs, as ingestion can cause mild to moderate digestive discomfort.`;
    }
    if (msgLower.includes("problem") || msgLower.includes("issue") || msgLower.includes("yellow") || msgLower.includes("brown")) {
      return `🩺 **Common Problems & Solutions for ${matchedPlant.name}**:\n\n${matchedPlant.commonProblems.map(p => `* ${p}`).join("\n")}`;
    }

    // General care sheet response
    return `🌿 **Care Guide for ${matchedPlant.name}**:\n\n` +
           `* **Watering**: ${matchedPlant.watering}\n` +
           `* **Sunlight**: ${matchedPlant.sunlight}\n` +
           `* **Humidity & Temp**: ${matchedPlant.humidity} (${matchedPlant.temperature})\n` +
           `* **Pet Safe?**: ${matchedPlant.petFriendly ? 'Yes, 100% Pet-Friendly' : 'No, toxic to pets'}\n` +
           `* **Key Care Tips**:\n${matchedPlant.careTips.map(tip => `  - ${tip}`).join("\n")}\n\n` +
           `Feel free to ask specific questions about its watering, sunlight, or issues!`;
  } catch (err) {
    console.error("Error checking Plant Care Database:", err);
    return null;
  }
};

const handleAiIntent = async (message, history) => {
  const { PlantInfo } = require("../models/PlantInfo");
  const plants = await PlantInfo.find({});

  // Construct context for the AI
  const plantContext = plants.map(p => {
    return `Plant Name: ${p.name}
- Watering: ${p.watering}
- Sunlight: ${p.sunlight}
- Fertilizer: ${p.fertilizer}
- Humidity: ${p.humidity}
- Temperature: ${p.temperature}
- Pet Friendly: ${p.petFriendly ? 'Yes' : 'No'}
- Care Tips: ${p.careTips.join(", ")}
- Common Problems: ${p.commonProblems.join(", ")}
`;
  }).join("\n---\n");

  const systemInstruction = `You are a plant care assistant for a plant ecommerce website.
Only answer questions related to plants, gardening, pots, sunlight, watering, fertilizers, indoor plants, outdoor plants, and ecommerce support.
Do not answer unrelated questions.
Use only the provided plant database context.
Keep answers concise, friendly, and accurate.

Plant Database Context:
${plantContext}`;

  const model = genAI.getGenerativeModel({ 
    model: "gemini-flash-latest",
    systemInstruction: systemInstruction
  });

  const chat = model.startChat({
    history: history || [],
    generationConfig: {
      maxOutputTokens: 350,
    },
  });

  const result = await chat.sendMessage(message);
  const response = await result.response;
  return response.text();
};

const chatWithAI = async (req, res) => {
  const clientIp = req.ip || req.headers['x-forwarded-for'] || "unknown";
  
  // 1. Rate Limiting Middleware/Validation
  const now = Date.now();
  const limitWindow = 60 * 1000; 
  const maxRequests = 20; 
  if (!chatRateLimits.has(clientIp)) {
    chatRateLimits.set(clientIp, [now]);
  } else {
    const timestamps = chatRateLimits.get(clientIp).filter(ts => now - ts < limitWindow);
    if (timestamps.length >= maxRequests) {
      console.warn(`[CHAT ABUSE BLOCKED] IP: ${clientIp} exceeded rate limits`);
      return res.status(429).json({ 
        role: "model",
        parts: [{ text: "⚠️ You are sending requests too quickly. Please wait a minute before asking more questions!" }] 
      });
    }
    timestamps.push(now);
    chatRateLimits.set(clientIp, timestamps);
  }

  const { message, history } = req.body;
  console.log(`[CHAT REQUEST] IP: ${clientIp} - Message: "${message}" - History: ${history ? history.length : 0}`);

  // 2. Prompt Validation & Abuse Prevention
  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return res.status(400).json({ 
      role: "model",
      parts: [{ text: "Please provide a valid question." }] 
    });
  }

  const msgLower = message.toLowerCase().trim();

  // Prompt Validation Check for Hacking / NSFW / Out of Scope topics
  const hackingKeywords = ["sql", "select *", "drop table", "script", "<script>", "javascript:", "eval(", "exec(", "system(", "passwd", "shadow", "rm -rf", "sudo", "hack"];
  const abuseKeywords = ["nsfw", "porn", "adult", "sex", "naked", "drugs", "weed", "cocaine", "illegal", "bomb", "weapon", "kill", "suicide"];
  
  for (const keyword of hackingKeywords) {
    if (msgLower.includes(keyword)) {
      return res.status(400).json({
        role: "model",
        parts: [{ text: "🔒 Access Denied: Coding, scripting, and system commands are strictly prohibited." }]
      });
    }
  }

  for (const keyword of abuseKeywords) {
    if (msgLower.includes(keyword)) {
      return res.status(400).json({
        role: "model",
        parts: [{ text: "🚫 Inappropriate Request: NSFW, adult, or illegal topics are not allowed." }]
      });
    }
  }

  try {
    // 3. FAQ Caching
    if (faqCache.has(msgLower)) {
      console.log(`[CHAT HIT CACHE] FAQ Cache Hit for: "${msgLower}"`);
      return res.status(200).json({
        role: "model",
        parts: [{ text: faqCache.get(msgLower) }]
      });
    }

    // 4. Intent Classification

    // Class A: Ecommerce / Support Queries
    const ecommerceKeywords = ["order", "track", "shipping", "refund", "return", "payment", "cart", "help", "support", "cancel", "delivery", "status", "package", "pay", "buy"];
    const isEcommerce = ecommerceKeywords.some(keyword => msgLower.includes(keyword));

    if (isEcommerce) {
      console.log(`[CHAT ROUTE] Intent classified: ECOMMERCE Support`);
      const responseText = await handleEcommerceIntent(message, req.user);
      faqCache.set(msgLower, responseText); // Cache FAQ responses
      return res.status(200).json({
        role: "model",
        parts: [{ text: responseText }]
      });
    }

    // Class B: Direct Plant DB Lookup
    const careKeywords = ["water", "light", "sun", "fertiliz", "feed", "humid", "moist", "pet", "dog", "cat", "toxic", "problem", "issue", "yellow", "brown", "care"];
    const isCareQuery = careKeywords.some(keyword => msgLower.includes(keyword));

    if (isCareQuery) {
      const dbResponse = await handlePlantDbIntent(message);
      if (dbResponse) {
        console.log(`[CHAT ROUTE] Intent classified: PLANT_DB Direct Care Guide`);
        faqCache.set(msgLower, dbResponse); // Cache DB lookups
        return res.status(200).json({
          role: "model",
          parts: [{ text: dbResponse }]
        });
      }
    }

    // Class C: Recommendation / Conversational / Complex AI Response
    console.log(`[CHAT ROUTE] Intent classified: AI Conversational advice fallback`);
    const aiResponse = await handleAiIntent(message, history);
    return res.status(200).json({
      role: "model",
      parts: [{ text: aiResponse }]
    });

  } catch (error) {
    console.error("[CHAT EXCEPTION]", error);
    
    // Premium Offline Fallback: Serve high-quality specific recommendations from the seeded DB if AI fails
    const msgLower = message.toLowerCase().trim();
    if (msgLower.includes("recommend") || msgLower.includes("suggest") || msgLower.includes("best") || msgLower.includes("low maintenance") || msgLower.includes("bedroom") || msgLower.includes("office") || msgLower.includes("beginner") || msgLower.includes("indoor") || msgLower.includes("outdoor")) {
      try {
        const { PlantInfo } = require("../models/PlantInfo");
        const plants = await PlantInfo.find({});
        
        let filtered = plants;
        let reason = "our premium greenhouse collection";
        
        if (msgLower.includes("bedroom")) {
          filtered = plants.filter(p => p.name === "Snake Plant" || p.name === "Peace Lily");
          reason = "ideal bedroom plants that release high amounts of oxygen at night and filter indoor air toxins";
        } else if (msgLower.includes("low maintenance") || msgLower.includes("beginner") || msgLower.includes("easy")) {
          filtered = plants.filter(p => p.name === "Snake Plant" || p.name === "Spider Plant" || p.name === "Aloe Vera");
          reason = "extremely resilient plants that are highly drought-tolerant, making them perfect for beginners";
        } else if (msgLower.includes("office") || msgLower.includes("desk")) {
          filtered = plants.filter(p => p.name === "Snake Plant" || p.name === "Spider Plant" || p.name === "Peace Lily" || p.name === "Monstera");
          reason = "plants that thrive in indirect office lighting and clean ambient workspace environments";
        } else if (msgLower.includes("pet") || msgLower.includes("safe")) {
          filtered = plants.filter(p => p.petFriendly === true);
          reason = "being completely non-toxic and 100% pet-friendly for households with cats and dogs";
        } else if (msgLower.includes("indoor")) {
          filtered = plants.filter(p => p.name === "Snake Plant" || p.name === "Peace Lily" || p.name === "Monstera" || p.name === "Spider Plant");
          reason = "ideal indoor conditions and indirect household lighting";
        }

        const plantList = filtered.map(p => `🪴 **${p.name}**\n  * **Sunlight**: ${p.sunlight}\n  * **Watering**: ${p.watering}`).join("\n\n");
        
        return res.status(200).json({
          role: "model",
          parts: [{
            text: `👋 **Plants Vigor Assistant (Offline Support Mode)**\n\nHere are our highly-rated plant recommendations for your space (${reason}):\n\n${plantList}\n\n*All of these are freshly grown in our greenhouses and ready for shipping!*`
          }]
        });
      } catch (dbErr) {
        console.error("Fallback DB recommendation error:", dbErr);
      }
    }

    res.status(500).json({ 
      role: "model",
      parts: [{ text: "🌱 I'm having trouble connecting to my plant roots right now. Please try again shortly!" }] 
    });
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
