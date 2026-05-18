const Reel = require("../models/reelModel");
const { cloudinary } = require("../config/cloudinary");

// @desc    Get all reels
// @route   GET /api/reels
// @access  Public
const getReels = async (req, res) => {
  try {
    const reels = await Reel.find({}).sort({ createdAt: -1 });
    res.json(reels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new reel
// @route   POST /api/admin/reels
// @access  Private/Admin
const createReel = async (req, res) => {
  try {
    const { instagramId, profileUrl } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: "No video file uploaded" });
    }

    const newReel = new Reel({
      videoUrl: req.file.path,
      publicId: req.file.filename,
      instagramId: instagramId || "greenbloom_co",
      avatarUrl: `https://ui-avatars.com/api/?name=${instagramId || 'GB'}&background=0D9488&color=fff`,
      profileUrl: profileUrl || "https://www.instagram.com/greenbloom_co"
    });

    const savedReel = await newReel.save();
    res.status(201).json(savedReel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete reel
// @route   DELETE /api/admin/reels/:id
// @access  Private/Admin
const deleteReel = async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    if (!reel) {
      return res.status(404).json({ message: "Reel not found" });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(reel.publicId, { resource_type: 'video' });

    await reel.deleteOne();
    res.json({ message: "Reel removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getReels, createReel, deleteReel };
