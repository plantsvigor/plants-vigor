const express = require('express');
const router = express.Router();
const { 
  diagnosePlant, 
  getDiagnosisHistory, 
  chatWithAI, 
  saveQuizResult 
} = require('../controllers/plantAIController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

router.post('/diagnose', protect, upload.single('image'), diagnosePlant);
router.get('/history', protect, getDiagnosisHistory);
router.post('/chat', protect, chatWithAI);
router.post('/quiz', protect, saveQuizResult);

module.exports = router;
