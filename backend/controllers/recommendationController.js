const Product = require("../models/Product");
const { plantInfoDataset } = require("../data/plantInfo");

/**
 * Advanced Rule-Based Plant Recommendation Engine
 * Filters the 100-plant static knowledge base and maps them to real e-commerce products in MongoDB.
 */
const getRecommendations = async (req, res) => {
  try {
    const { sunlight, petSafe, maintenance, location } = req.body;

    console.log("Processing plant recommendations for:", { sunlight, petSafe, maintenance, location });

    // Step 1: Filter the static 100-plant knowledge base using rules
    let filteredPlants = plantInfoDataset;

    // A. Sunlight Rule
    if (sunlight) {
      const sunLower = sunlight.toLowerCase();
      if (sunLower.includes("direct")) {
        // Bright direct sunlight
        filteredPlants = filteredPlants.filter(p => 
          p.sunlight.toLowerCase().includes("direct") || 
          p.sunlight.toLowerCase().includes("full sun") ||
          p.category === "Succulents" || 
          p.category === "Herbs"
        );
      } else if (sunLower.includes("indirect") && sunLower.includes("bright")) {
        // Bright indirect light
        filteredPlants = filteredPlants.filter(p => 
          p.sunlight.toLowerCase().includes("indirect") || 
          p.sunlight.toLowerCase().includes("filtered") ||
          p.sunlight.toLowerCase().includes("bright")
        );
      } else if (sunLower.includes("low")) {
        // Low light (north facing)
        filteredPlants = filteredPlants.filter(p => 
          p.sunlight.toLowerCase().includes("low") || 
          p.sunlight.toLowerCase().includes("adaptable") ||
          p.sunlight.toLowerCase().includes("shade")
        );
      } else if (sunLower.includes("no natural") || sunLower.includes("office")) {
        // No natural light (office/fluorescent)
        filteredPlants = filteredPlants.filter(p => 
          p.sunlight.toLowerCase().includes("low") || 
          p.sunlight.toLowerCase().includes("adaptable") || 
          p.sunlight.toLowerCase().includes("office")
        );
      }
    }

    // B. Pet Safety Rule
    if (petSafe && petSafe.toLowerCase().includes("yes")) {
      filteredPlants = filteredPlants.filter(p => p.petSafe === true);
    }

    // C. Maintenance Difficulty Rule
    if (maintenance) {
      const maintLower = maintenance.toLowerCase();
      if (maintLower.includes("low") || maintLower.includes("hard to kill")) {
        filteredPlants = filteredPlants.filter(p => p.difficulty === "Easy");
      } else if (maintLower.includes("regular")) {
        filteredPlants = filteredPlants.filter(p => p.difficulty === "Easy" || p.difficulty === "Medium");
      }
      // "expert" allows all difficulties including "Hard"
    }

    // D. Location / Placement Rule (Category weights)
    if (location) {
      const locLower = location.toLowerCase();
      if (locLower.includes("bedroom")) {
        // Highly oxygenating and clean indoor plants
        filteredPlants = filteredPlants.filter(p => p.category === "Indoor" || p.category === "Palms");
      } else if (locLower.includes("living room")) {
        // Broad lush statement plants
        filteredPlants = filteredPlants.filter(p => p.category === "Indoor" || p.category === "Palms" || p.category === "Flowering");
      } else if (locLower.includes("balcony")) {
        // Sun loving and outdoor
        filteredPlants = filteredPlants.filter(p => p.category === "Outdoor" || p.category === "Succulents" || p.category === "Herbs");
      } else if (locLower.includes("bathroom")) {
        // Humidity loving ferns and tropicals
        filteredPlants = filteredPlants.filter(p => p.category === "Ferns" || p.category === "Indoor");
      } else if (locLower.includes("office")) {
        // Low care, compact desktop growers
        filteredPlants = filteredPlants.filter(p => p.difficulty === "Easy" || p.category === "Succulents");
      } else if (locLower.includes("kitchen")) {
        // Edible herbs
        filteredPlants = filteredPlants.filter(p => p.category === "Herbs" || p.category === "Indoor");
      } else if (locLower.includes("garden")) {
        // Outdoor bushes and herbs
        filteredPlants = filteredPlants.filter(p => p.category === "Outdoor" || p.category === "Herbs");
      }
    }

    // Fallback if filtering was too strict (ensure we always return at least some plants)
    if (filteredPlants.length === 0) {
      console.log("Filtering too strict, returning general high-quality matches.");
      filteredPlants = plantInfoDataset.filter(p => p.difficulty === "Easy");
      if (petSafe && petSafe.toLowerCase().includes("yes")) {
        filteredPlants = filteredPlants.filter(p => p.petSafe === true);
      }
    }

    // Step 2: Query the real e-commerce products in stock
    const dbProducts = await Product.find({});
    
    // Step 3: Map the matching plants to real database products dynamically
    const results = [];
    let matchCount = 0;

    for (const plant of filteredPlants) {
      if (matchCount >= 6) break; // Limit results to max 6 plants as requested

      // Try to find a product matching this plant's name in Mongoose
      let matchedDbProduct = dbProducts.find(prod => 
        prod.name.toLowerCase().includes(plant.name.split(" ")[0].toLowerCase())
      );

      // Fallback: If no direct name match, map to a suitable real product by category
      if (!matchedDbProduct) {
        if (plant.category === "Succulents") {
          // Map to cactus product
          matchedDbProduct = dbProducts.find(p => p.category === "cactus") || dbProducts[0];
        } else {
          // Map to snake or money plant products
          matchedDbProduct = dbProducts.find(p => p.category === "indoor-plants") || dbProducts[0];
        }
      }

      if (matchedDbProduct) {
        results.push({
          _id: matchedDbProduct._id,
          id: matchedDbProduct.id,
          name: plant.name, // Use static name for precise botanical details
          dbProductName: matchedDbProduct.name, // Real DB name
          slug: matchedDbProduct.slug,
          price: matchedDbProduct.discountPrice && matchedDbProduct.discountPrice > 0 ? matchedDbProduct.discountPrice : matchedDbProduct.price,
          discountPrice: matchedDbProduct.discountPrice,
          images: matchedDbProduct.images,
          category: plant.category,
          sunlight: plant.sunlight,
          watering: plant.watering,
          difficulty: plant.difficulty,
          shortDescription: plant.shortDescription,
          careTips: plant.careTips
        });
        matchCount++;
      }
    }

    // Determine if more matches exist
    const hasMore = filteredPlants.length > 6;

    res.status(200).json({
      success: true,
      recommendations: results,
      hasMore,
      totalMatches: filteredPlants.length
    });

  } catch (error) {
    console.error("Recommendation Engine Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getRecommendations
};
