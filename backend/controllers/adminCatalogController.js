const AdminCatalog = require("../models/AdminCatalog");

const getDoc = async () =>
  (await AdminCatalog.findOne({ scope: "global" })) ||
  (await AdminCatalog.create({ scope: "global", productOverrides: {}, hiddenIds: [], customProducts: [] }));

const getAdminCatalog = async (_req, res) => {
  const doc = await getDoc();
  res.json({
    productOverrides: Object.fromEntries(doc.productOverrides || []),
    hiddenIds: doc.hiddenIds,
    customProducts: doc.customProducts,
  });
};

const updateProduct = async (req, res) => {
  const doc = await getDoc();
  const current = doc.productOverrides.get(req.params.id) || {};
  doc.productOverrides.set(req.params.id, { ...current, ...req.body });
  await doc.save();
  res.json({ ok: true });
};

const hideProduct = async (req, res) => {
  const doc = await getDoc();
  if (!doc.hiddenIds.includes(req.params.id)) doc.hiddenIds.push(req.params.id);
  await doc.save();
  res.json({ hiddenIds: doc.hiddenIds });
};

const unhideProduct = async (req, res) => {
  const doc = await getDoc();
  doc.hiddenIds = doc.hiddenIds.filter((id) => id !== req.params.id);
  await doc.save();
  res.json({ hiddenIds: doc.hiddenIds });
};

module.exports = { getAdminCatalog, updateProduct, hideProduct, unhideProduct };
