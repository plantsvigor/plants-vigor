const mongoose = require('mongoose');

const plantDiagnosisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  image: {
    url: { type: String, required: true },
    publicId: { type: String, required: true }
  },
  diagnosis: {
    plantName: String,
    healthStatus: {
      type: String,
      enum: ['Healthy', 'Needs Attention', 'Critical'],
      default: 'Healthy'
    },
    healthPercentage: Number,
    issues: [String],
    description: String,
    careTips: [String],
    recoverySteps: [String],
    sunlightGuide: String,
    wateringGuide: String,
    fertilizerSuggestions: [String],
    recommendedProducts: [{
      name: String,
      reason: String
    }]
  },
  confidenceScore: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const plantQuizResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  preferences: {
    sunlight: String,
    pets: String,
    maintenance: String,
    roomType: String,
    wateringFrequency: String
  },
  recommendedPlants: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const PlantDiagnosis = mongoose.model('PlantDiagnosis', plantDiagnosisSchema);
const PlantQuizResult = mongoose.model('PlantQuizResult', plantQuizResultSchema);

module.exports = { PlantDiagnosis, PlantQuizResult };
