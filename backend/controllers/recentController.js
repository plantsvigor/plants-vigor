const Recent = require("../models/Recent");

const MAX = 8;

const getRecent = async (req, res) => {
  const doc = await Recent.findOne({ userId: req.user._id });
  res.json({ ids: doc?.ids || [] });
};

const pushRecent = async (req, res) => {
  const userId = req.user._id;
  const { id } = req.body;
  const doc = (await Recent.findOne({ userId })) || (await Recent.create({ userId, ids: [] }));
  doc.ids = [id, ...doc.ids.filter((x) => x !== id)].slice(0, MAX);
  await doc.save();
  res.status(201).json({ ids: doc.ids });
};

module.exports = { getRecent, pushRecent };
