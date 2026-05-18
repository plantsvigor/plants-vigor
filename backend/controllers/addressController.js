const User = require("../models/User");

// @desc    Get all addresses
// @route   GET /api/address
// @access  Private
const getAddresses = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ addresses: user.addresses || [] });
};

// @desc    Add new address
// @route   POST /api/address/add
// @access  Private
const addAddress = async (req, res) => {
  try {
    const { fullName, phone, street, city, state, pincode, country, isDefault } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.addresses.length >= 5) {
      return res.status(400).json({ message: "Maximum 5 addresses allowed" });
    }

    const newAddress = { 
      fullName, 
      phone, 
      street, 
      city, 
      state, 
      pincode, 
      country: country || "India", 
      isDefault: isDefault || false 
    };

    // Check for duplicate address
    const isDuplicate = user.addresses.some(addr => 
      addr.fullName.toLowerCase() === newAddress.fullName.toLowerCase() &&
      addr.phone === newAddress.phone &&
      addr.street.toLowerCase() === newAddress.street.toLowerCase() &&
      addr.city.toLowerCase() === newAddress.city.toLowerCase() &&
      addr.state.toLowerCase() === newAddress.state.toLowerCase() &&
      addr.pincode === newAddress.pincode &&
      addr.country.toLowerCase() === newAddress.country.toLowerCase()
    );

    if (isDuplicate) {
      return res.status(400).json({ message: "This address is already saved" });
    }

    if (newAddress.isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
    } else if (user.addresses.length === 0) {
      newAddress.isDefault = true;
    }

    user.addresses.push(newAddress);
    await user.save();

    res.status(201).json({ addresses: user.addresses });
  } catch (error) {
    console.error("Add Address Error:", error);
    res.status(500).json({ message: error.message || "Failed to add address" });
  }
};

// @desc    Update address
// @route   PUT /api/address/update/:id
// @access  Private
const updateAddress = async (req, res) => {
  try {
    const { fullName, phone, street, city, state, pincode, country, isDefault } = req.body;
    const user = await User.findById(req.user._id);

    const address = user.addresses.id(req.params.id);
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    address.fullName = fullName || address.fullName;
    address.phone = phone || address.phone;
    address.street = street || address.street;
    address.city = city || address.city;
    address.state = state || address.state;
    address.pincode = pincode || address.pincode;
    address.country = country || address.country;

    // Check for duplicates (excluding current address)
    const isDuplicate = user.addresses.some(addr => 
      addr._id.toString() !== req.params.id &&
      addr.fullName.toLowerCase() === (fullName || address.fullName).toLowerCase() &&
      addr.phone === (phone || address.phone) &&
      addr.street.toLowerCase() === (street || address.street).toLowerCase() &&
      addr.city.toLowerCase() === (city || address.city).toLowerCase() &&
      addr.state.toLowerCase() === (state || address.state).toLowerCase() &&
      addr.pincode === (pincode || address.pincode) &&
      addr.country.toLowerCase() === (country || address.country).toLowerCase()
    );

    if (isDuplicate) {
      return res.status(400).json({ message: "Another saved address has these exact details" });
    }

    if (isDefault !== undefined && isDefault !== address.isDefault) {
      if (isDefault) {
        user.addresses.forEach((addr) => (addr.isDefault = false));
        address.isDefault = true;
      } else {
        address.isDefault = false;
        // If we unset default, make sure at least one is default if there are others
        if (user.addresses.length > 1) {
          const firstOther = user.addresses.find((a) => a._id.toString() !== req.params.id);
          if (firstOther) firstOther.isDefault = true;
        }
      }
    }

    await user.save();
    res.json({ addresses: user.addresses });
  } catch (error) {
    console.error("Update Address Error:", error);
    res.status(500).json({ message: error.message || "Failed to update address" });
  }
};

// @desc    Delete address
// @route   DELETE /api/address/delete/:id
// @access  Private
const deleteAddress = async (req, res) => {
  const user = await User.findById(req.user._id);
  const address = user.addresses.id(req.params.id);

  if (!address) {
    return res.status(404).json({ message: "Address not found" });
  }

  const wasDefault = address.isDefault;
  user.addresses.pull(req.params.id);

  if (wasDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true;
  }

  await user.save();
  res.json({ addresses: user.addresses });
};

// @desc    Set default address
// @route   PUT /api/address/default/:id
// @access  Private
const setDefaultAddress = async (req, res) => {
  const user = await User.findById(req.user._id);
  const address = user.addresses.id(req.params.id);

  if (!address) {
    return res.status(404).json({ message: "Address not found" });
  }

  user.addresses.forEach((addr) => (addr.isDefault = false));
  address.isDefault = true;

  await user.save();
  res.json({ addresses: user.addresses });
};

module.exports = {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
