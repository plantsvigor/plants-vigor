const mongoose = require("mongoose");

const plantInfoSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    watering: { type: String, required: true },
    sunlight: { type: String, required: true },
    fertilizer: { type: String, required: true },
    humidity: { type: String, required: true },
    temperature: { type: String, required: true },
    petFriendly: { type: Boolean, required: true },
    careTips: [{ type: String }],
    commonProblems: [{ type: String }],
  },
  { timestamps: true }
);

const PlantInfo = mongoose.model("PlantInfo", plantInfoSchema);

// Self-seeding function
const seedPlantData = async () => {
  try {
    const count = await PlantInfo.countDocuments();
    if (count > 0) return;

    const defaultPlants = [
      {
        name: "Aloe Vera",
        watering: "Water deeply but infrequently. Allow the soil to dry completely (about 2-3 weeks) between waterings. Overwatering causes root rot.",
        sunlight: "Bright, indirect sunlight. Thrives in sunny spots but can get scorched by intense direct afternoon sun.",
        fertilizer: "Apply a balanced organic fertilizer diluted to half strength once a spring/summer. Do not fertilize in winter.",
        humidity: "Low humidity. Prefers dry air and typical household environments.",
        temperature: "65°F to 85°F (18°C to 29°C). Protect from cold drafts and frost.",
        petFriendly: false,
        careTips: [
          "Use well-draining succulent soil mix.",
          "Ensure the pot has drainage holes.",
          "Harvest outer leaves first for their gel."
        ],
        commonProblems: [
          "Mushy, brown leaves (caused by overwatering).",
          "Thin, curled leaves (needs more frequent watering).",
          "Pale green or yellow leaves (needs more sunlight)."
        ]
      },
      {
        name: "Snake Plant",
        watering: "Extremely drought-tolerant. Water only when the soil is 100% dry (every 3-4 weeks). Better to underwater than overwater.",
        sunlight: "Highly adaptable. Thrives in bright indirect light, but tolerates low light and direct sun very well.",
        fertilizer: "Feed with all-purpose plant food once in spring and once in summer.",
        humidity: "Average room humidity. No special misting needed.",
        temperature: "70°F to 90°F (21°C to 32°C). Keep away from temperatures below 50°F (10°C).",
        petFriendly: false,
        careTips: [
          "Perfect for bedrooms as it releases oxygen at night.",
          "Never let water pool in the center of the rosette.",
          "Repot only when the pot cracks from root growth."
        ],
        commonProblems: [
          "Wrinkled leaves (needs water).",
          "Drooping, yellowing leaves (overwatering / root rot).",
          "Scarred leaf tips (physical damage or cold drafts)."
        ]
      },
      {
        name: "Peace Lily",
        watering: "Keep soil consistently moist but not soggy. Water when the top inch of soil is dry. Leaves droop dramatically when thirsty.",
        sunlight: "Medium to low indirect light. Direct sunlight will scorch the leaves.",
        fertilizer: "Balanced liquid houseplant fertilizer every 6 weeks during spring and summer.",
        humidity: "High humidity. Misting leaves regularly or placing near a humidifier is recommended.",
        temperature: "65°F to 80°F (18°C to 27°C). Very sensitive to cold temperatures.",
        petFriendly: false,
        careTips: [
          "Excellent air purifier.",
          "Wipe leaves with a damp cloth to remove dust.",
          "Use rainwater or distilled water if leaf tips turn brown."
        ],
        commonProblems: [
          "Brown leaf tips (caused by tap water chemicals or low humidity).",
          "Yellow leaves (overwatering or too much direct light).",
          "No flowers blooming (needs slightly more bright indirect light)."
        ]
      },
      {
        name: "Monstera",
        watering: "Water every 1-2 weeks. Allow the top 2 inches of soil to dry out between waterings. Reduce frequency in winter.",
        sunlight: "Bright, indirect sunlight. Too much direct sun causes leaf burn.",
        fertilizer: "Balanced organic liquid fertilizer once a month during spring and summer.",
        humidity: "High humidity preferred. Mist leaves or use a humidity tray.",
        temperature: "65°F to 85°F (18°C to 29°C). Avoid drafts.",
        petFriendly: false,
        careTips: [
          "Provide a moss pole or trellis for climbing support.",
          "Clean leaves regularly to assist photosynthesis.",
          "Prune yellow/dead leaves to encourage new growth."
        ],
        commonProblems: [
          "Yellowing leaves (overwatering).",
          "Brown spots with yellow halos (fungal infection, check drainage).",
          "No fenestrations/splits in leaves (needs more indirect light)."
        ]
      },
      {
        name: "Spider Plant",
        watering: "Water when the top 50% of soil is dry. Prefers well-draining soil. Susceptible to fluoride in tap water.",
        sunlight: "Bright, indirect light. Can tolerate medium/low light, but stripes will be less defined.",
        fertilizer: "Feed monthly in spring/summer with diluted houseplant food.",
        humidity: "Moderate to high humidity. Appreciates occasional misting.",
        temperature: "55°F to 80°F (13°C to 27°C). Tolerates cooler temperatures well.",
        petFriendly: true,
        careTips: [
          "Produces 'spiderettes' (runners) that can be easily propagated.",
          "Use rainwater or distilled water to avoid brown tips.",
          "Great for hanging baskets."
        ],
        commonProblems: [
          "Brown leaf tips (fluoride/chlorine in tap water).",
          "Limp, soggy leaves (overwatering).",
          "Faded leaf color (needs more light)."
        ]
      }
    ];

    await PlantInfo.insertMany(defaultPlants);
    console.log("SUCCESS: Plant care database seeded successfully!");
  } catch (err) {
    console.error("ERROR seeding plant care data:", err);
  }
};

module.exports = { PlantInfo, seedPlantData };
