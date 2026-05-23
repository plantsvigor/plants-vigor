const express = require('express');
const router = express.Router();
const { getChatbotResponse } = require('../controllers/chatbotController');
const { getRecommendations } = require('../controllers/recommendationController');
const { optionalProtect } = require('../middleware/authMiddleware');

router.post('/chat', optionalProtect, getChatbotResponse);
router.post('/recommend', getRecommendations);

module.exports = router;
