const { Order } = require("../models/Order");
const Product = require("../models/Product");
const { plantInfoDataset } = require("../data/plantInfo");

/**
 * Completely Rule-Based Chatbot Engine using Static Replies, Pre-defined
 * 100-plant dataset (plantInfo.js), and local MongoDB queries (Order and Products).
 */
const getChatbotResponse = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({
        role: "model",
        parts: [{ text: "Please provide a valid question." }]
      });
    }

    const input = message.toLowerCase().trim();
    let responseText = "";
    let suggestedProducts = [];
    let quickReplies = ["Indoor Plants", "Outdoor Plants", "Low Maintenance", "Pet Safe", "Track Order", "Watering Tips"];

    // Intercept Recommendation triggers to launch Questionnaire Wizard
    const recommendationTriggers = ["suggest", "recommend", "best plant", "choose", "find plant", "quiz", "wizard", "office plant"];
    const isRecommendationQuery = recommendationTriggers.some(trigger => input.includes(trigger));

    if (isRecommendationQuery) {
      console.log(`[CHAT ROUTE] Intercepted Recommendation query: Launching Questionnaire Wizard`);
      return res.status(200).json({
        role: "model",
        parts: [{ text: "I have loaded the **Plant Recommendation Wizard** for you! Please complete the questionnaire below so I can find your perfect plant match." }],
        isWizard: true
      });
    }

    // 1. Order Tracking Handler
    // Matches order codes (e.g. GB-123456) or "track order" intent
    const orderCodeMatch = message.match(/GB-\d+/i) || message.match(/\b\d{6,}\b/);
    
    if (input.includes("track") || input.includes("order") || orderCodeMatch) {
      if (orderCodeMatch) {
        const orderCode = orderCodeMatch[0].toUpperCase();
        const order = await Order.findOne({ orderCode: new RegExp(orderCode, 'i') });
        
        if (order) {
          responseText = `📦 **Order Status Found!**\n\n* **Order Code**: ${order.orderCode}\n* **Status**: **${order.status}**\n* **Placed on**: ${new Date(order.createdAtMs || order.createdAt).toLocaleDateString()}\n* **Payment**: ${order.payment} (${order.paymentId ? 'Completed' : 'Pending Verification'})\n* **Total**: Rs. ${order.totalAmount || order.subtotal}\n* **Delivery Address**: ${order.address.fullName}, ${order.address.street}, ${order.address.city}, ${order.address.pincode}\n\n*All plants are carefully packed in our special ventilated packages to arrive fresh and healthy!*`;
        } else {
          responseText = `❌ I could not find any order with code **${orderCode}** in our database. Please double check the code (example format: **GB-100234**) and try again.`;
        }
      } else {
        // Automatically fetch recent order for logged-in user if available
        let recentOrder = null;
        if (req.user) {
          recentOrder = await Order.findOne({
            $or: [
              { userId: req.user._id.toString() },
              { email: req.user.email }
            ]
          }).sort({ createdAtMs: -1 });
        }

        if (recentOrder) {
          responseText = `📦 **Latest Order Details Found (Logged In)**:\n\n* **Order Code**: ${recentOrder.orderCode}\n* **Status**: **${recentOrder.status}**\n* **Placed on**: ${new Date(recentOrder.createdAtMs || recentOrder.createdAt).toLocaleDateString()}\n* **Payment**: ${recentOrder.payment} (${recentOrder.paymentId ? 'Completed' : 'Pending Verification'})\n* **Total**: Rs. ${recentOrder.totalAmount || recentOrder.subtotal}\n* **Delivery Address**: ${recentOrder.address.fullName}, ${recentOrder.address.street}, ${recentOrder.address.city}, ${recentOrder.address.pincode}\n\n*Your plants are in safe hands and are currently being prepared for secure transport!*`;
        } else {
          responseText = `🔍 **Order Tracking Support**\n\nTo track your order, please type your **Order Code** directly in the chat (e.g., **GB-100234**).\n\nIf you are logged in and have placed a previous order, I will automatically pull your latest order details!`;
        }
      }
      
      return res.status(200).json({
        role: "model",
        parts: [{ text: responseText }],
        quickReplies
      });
    }

    // 2. Shipping / Delivery FAQ
    if (input.includes("shipping") || input.includes("deliver") || input.includes("receive") || input.includes("charge")) {
      responseText = `🚚 **Shipping & Delivery Policies**:\n\n* **Eco-Friendly Packaging**: We ship fresh greenhouse plants in specialized, custom-designed ventilated packaging so they arrive pristine.\n* **Delivery Time**: 3 to 5 business days across India.\n* **Charges**: **Free Shipping** on all orders above Rs. 499. For orders below Rs. 499, a flat delivery fee of Rs. 49 is applied.`;
      
      return res.status(200).json({
        role: "model",
        parts: [{ text: responseText }],
        quickReplies
      });
    }

    // 3. Return & Refund FAQ
    if (input.includes("return") || input.includes("refund") || input.includes("damage") || input.includes("replacement") || input.includes("cancel")) {
      responseText = `🌿 **Returns & Refund Guarantee**:\n\n* **7-Day Guarantee**: If any plant arrives damaged or unhealthy, we offer a **100% Free Replacement or Refund** within **7 days** of delivery.\n* **Process**: Simply send a photo of the damaged plant using the **Plant Care Diagnosis** upload tool on our site, or reach out to support@plantsvigor.com.\n* **Refund Processing**: Once approved, refunds are credited back to your original payment method within 5-7 business days.`;
      
      return res.status(200).json({
        role: "model",
        parts: [{ text: responseText }],
        quickReplies
      });
    }

    // 4. Payment FAQs
    if (input.includes("payment") || input.includes("pay") || input.includes("razorpay") || input.includes("cod") || input.includes("cash")) {
      responseText = `💳 **Secure Payment Methods**:\n\n* **Online Payments**: 100% secure payments via **Razorpay** (supports UPI, Netbanking, Credit/Debit Cards, and popular Wallets).\n* **Cash on Delivery (COD)**: Available for all eligible pincodes across India at checkout.\n* **Security**: All transactions are fully encrypted using SSL, and no card data is ever stored on our servers.`;
      
      return res.status(200).json({
        role: "model",
        parts: [{ text: responseText }],
        quickReplies
      });
    }

    // 5. Help / Cart / General Support
    if (input.includes("help") || input.includes("support") || input.includes("contact") || input.includes("email") || input.includes("phone")) {
      responseText = `👋 **Need Assistance? I am here to help!**\n\n* **Email**: support@plantsvigor.com (Response within 24 hours)\n* **Hours**: Mon - Sat, 9 AM to 6 PM IST\n* **Shopping Cart**: Any items placed in your cart as a guest will be automatically merged when you log in at checkout!\n\nYou can also click the quick reply pills below to navigate common gardening and order questions instantly.`;
      
      return res.status(200).json({
        role: "model",
        parts: [{ text: responseText }],
        quickReplies
      });
    }

    // 6. Watering Tips (Quick Reply / General)
    if (input === "watering tips" || (input.includes("water") && !input.includes("plant"))) {
      responseText = `💧 **General Plant Watering Guidelines**:\n\n1. **Check Soil Moisture**: Stick your finger 1-2 inches into the soil. If it feels dry, it is time to water. If damp, wait a few days.\n2. **Drainage is Key**: Always ensure your planter has drainage holes at the bottom. Waterlogging is the #1 cause of root rot.\n3. **Water Deeply**: Pour water until it starts draining out of the bottom holes, then discard excess water from the tray.\n4. **Tap Water Minerals**: Some sensitive houseplants (like Ferns and Peace Lilies) prefer filtered or rainwater over tap water to prevent brown tips.`;
      
      return res.status(200).json({
        role: "model",
        parts: [{ text: responseText }],
        quickReplies
      });
    }

    // 7. Plant Category/Attribute Recommendations (Static dataset filters)
    let matchedCategory = null;
    let categoryReason = "";

    if (input.includes("indoor")) {
      matchedCategory = "Indoor";
      categoryReason = "highly rated and grow beautifully in indirect indoor household lighting";
    } else if (input.includes("outdoor")) {
      matchedCategory = "Outdoor";
      categoryReason = "perfectly suited for direct or partial outdoor balcony and garden sun";
    } else if (input.includes("low maintenance") || input.includes("easy") || input.includes("beginner")) {
      matchedCategory = "Easy";
      categoryReason = "extremely hardy, drought-tolerant, and require very little maintenance—perfect for beginners";
    } else if (input.includes("pet safe") || input.includes("pet-friendly") || input.includes("cats") || input.includes("dogs")) {
      matchedCategory = "PetSafe";
      categoryReason = "completely non-toxic to dogs and cats, ensuring peace of mind for pet owners";
    } else if (input.includes("succulent")) {
      matchedCategory = "Succulents";
      categoryReason = "excellent drought-tolerant succulents that store water in their fleshy leaves";
    } else if (input.includes("fern")) {
      matchedCategory = "Ferns";
      categoryReason = "beautiful feathery ferns that thrive in high humidity and damp soils";
    } else if (input.includes("herb")) {
      matchedCategory = "Herbs";
      categoryReason = "highly aromatic culinary herbs that are perfect for sunny kitchen windowsills";
    } else if (input.includes("palm")) {
      matchedCategory = "Palms";
      categoryReason = "tropical palms that add a lush, statement green aesthetic to any space";
    }

    if (matchedCategory) {
      let filteredPlants = [];
      if (matchedCategory === "Easy") {
        filteredPlants = plantInfoDataset.filter(p => p.difficulty === "Easy");
      } else if (matchedCategory === "PetSafe") {
        filteredPlants = plantInfoDataset.filter(p => p.petSafe === true);
      } else {
        filteredPlants = plantInfoDataset.filter(p => p.category === matchedCategory);
      }

      // Pick up to 5 plants to show
      const recommendedList = filteredPlants.slice(0, 5);
      
      let plantListText = recommendedList.map(p => {
        return `🪴 **${p.name}** (${p.difficulty} Care)\n  * *Sunlight*: ${p.sunlight}\n  * *Watering*: ${p.watering}\n  * *About*: ${p.shortDescription}`;
      }).join("\n\n");

      responseText = `🌿 **Top Plant Recommendations**\n\nHere are some plants from our curated knowledge base that are ${categoryReason}:\n\n${plantListText}\n\nWould you like to buy a plant today? I can recommend some real greenhouse products currently in stock!`;
      
      // Query MongoDB for real products to show as cards!
      suggestedProducts = await Product.find({}).limit(5);

      return res.status(200).json({
        role: "model",
        parts: [{ text: responseText }],
        products: suggestedProducts,
        quickReplies
      });
    }

    // 8. Specific Plant Search (Matching names in the 100-plant dataset)
    let matchedPlant = null;
    for (const plant of plantInfoDataset) {
      if (input.includes(plant.name.toLowerCase())) {
        matchedPlant = plant;
        break;
      }
    }

    if (matchedPlant) {
      // Direct responses based on subtopic query keywords
      if (input.includes("water") || input.includes("drink") || input.includes("wet")) {
        responseText = `💧 **Watering Guide for ${matchedPlant.name}**:\n\n${matchedPlant.watering}\n\n* **Pro Care Tip**: ${matchedPlant.careTips[0]}`;
      } else if (input.includes("light") || input.includes("sun") || input.includes("shade")) {
        responseText = `☀️ **Sunlight Requirements for ${matchedPlant.name}**:\n\n${matchedPlant.sunlight}\n\n* **Pro Care Tip**: ${matchedPlant.careTips[1]}`;
      } else if (input.includes("pet") || input.includes("dog") || input.includes("cat") || input.includes("toxic") || input.includes("safe")) {
        responseText = matchedPlant.petSafe
          ? `🐾 **Pet Safety**: Excellent news! **${matchedPlant.name}** is **100% Pet-Safe** and completely non-toxic to cats and dogs. It is perfectly safe for animal-loving homes.`
          : `⚠️ **Pet Safety**: Caution! **${matchedPlant.name}** is **toxic to pets**. Please keep it out of reach of curious cats and dogs, as ingestion can cause mild to moderate digestive discomfort.`;
      } else if (input.includes("tip") || input.includes("care") || input.includes("fertiliz") || input.includes("grow") || input.includes("soil")) {
        const tips = matchedPlant.careTips.map((tip, idx) => `${idx + 1}. ${tip}`).join("\n");
        responseText = `🌱 **Care Tips for ${matchedPlant.name}** (${matchedPlant.difficulty} difficulty):\n\n${tips}\n\n* **Sunlight**: ${matchedPlant.sunlight}\n* **Watering**: ${matchedPlant.watering}`;
      } else {
        // Full Plant Card response
        const tips = matchedPlant.careTips.map(tip => `  - ${tip}`).join("\n");
        responseText = `🌿 **Plant Profile: ${matchedPlant.name}**\n\n* **Category**: ${matchedPlant.category}\n* **Difficulty**: ${matchedPlant.difficulty} Care\n* **Pet Safety**: ${matchedPlant.petSafe ? "🐾 100% Pet-Safe" : "⚠️ Toxic to Pets"}\n\n**Description**:\n${matchedPlant.shortDescription}\n\n**Quick Care Guides**:\n* ☀️ *Sunlight*: ${matchedPlant.sunlight}\n* 💧 *Watering*: ${matchedPlant.watering}\n\n**Essential Care Tips**:\n${tips}`;
      }

      // Query if there is a match in real products to suggest
      // For instance, match product name containing plant name
      const queryName = matchedPlant.name.split(" ")[0]; // First word (e.g. "Snake" or "Aloe")
      suggestedProducts = await Product.find({ name: new RegExp(queryName, 'i') }).limit(3);
      
      if (suggestedProducts.length === 0) {
        suggestedProducts = await Product.find({}).limit(3); // Fallback to standard products
      }

      return res.status(200).json({
        role: "model",
        parts: [{ text: responseText }],
        products: suggestedProducts,
        quickReplies
      });
    }

    // 9. Standard Welcome/Fallback Handler
    responseText = `👋 **Hello! Welcome to Plants Vigor!**\n\nI am your custom support & plant care assistant. I can answer questions about plant care, check if a plant is pet-safe, recommend plants, track your orders, and answer shipping FAQs!\n\n**Here are some things you can try:**\n* "Tell me about Snake Plant"\n* "Which plants are pet safe?"\n* "How long does shipping take?"\n* "Track order GB-100201"\n\nFeel free to click any of the **quick reply buttons** below to get started immediately!`;

    // Query standard e-commerce products for general display
    suggestedProducts = await Product.find({}).limit(3);

    return res.status(200).json({
      role: "model",
      parts: [{ text: responseText }],
      products: suggestedProducts,
      quickReplies
    });

  } catch (error) {
    console.error("Chatbot Engine Error:", error);
    res.status(500).json({
      role: "model",
      parts: [{ text: "🌱 I'm having trouble connecting to my plant roots right now. Please try again shortly!" }]
    });
  }
};

module.exports = {
  getChatbotResponse
};
