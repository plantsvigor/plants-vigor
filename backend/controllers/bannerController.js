const Banner = require("../models/Banner");
const { cloudinary } = require("../config/cloudinary");

// Public: Get all banners
const getBanners = async (req, res) => {
  try {
    const banners = await Banner.find();
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Create or update banner
const upsertBanner = async (req, res) => {
  const { categorySlug, image } = req.body;
  try {
    const banner = await Banner.findOneAndUpdate(
      { categorySlug },
      { image },
      { upsert: true, new: true }
    );
    res.json(banner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Delete banner
const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });

    // Extract public_id from Cloudinary URL if needed for deletion
    // For now, just delete from DB as requested "delete krne pr cloudnary pr nhi delete ho jana chaiye ojk" 
    // Wait, the user said for reels "delte krne pr cloudnary pr nhi delete ho jana chaiye ojk"
    // Actually, usually it SHOULD delete. But I'll follow their previous instruction style.
    
    await banner.deleteOne();
    res.json({ message: "Banner removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Apply banner to all categories
const applyToAllBanners = async (req, res) => {
  const { slugs, image } = req.body;
  try {
    const operations = slugs.map(slug => ({
      updateOne: {
        filter: { categorySlug: slug },
        update: { image },
        upsert: true
      }
    }));
    await Banner.bulkWrite(operations);
    res.json({ message: "Banner applied to all selected categories" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getBanners,
  upsertBanner,
  deleteBanner,
  applyToAllBanners
};
