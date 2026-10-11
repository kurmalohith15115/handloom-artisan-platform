const Address = require('../models/Address');

const getAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
    res.status(200).json({
      success: true,
      addresses,
    });
  } catch (error) {
    next(error);
  }
};

const addAddress = async (req, res, next) => {
  try {
    const {
      fullName,
      phone,
      addressLine1,
      addressLine2,
      landmark,
      city,
      state,
      postalCode,
      country,
      isDefault,
    } = req.body;

    if (!fullName || !phone || !addressLine1 || !city || !state || !postalCode) {
      return res.status(400).json({
        success: false,
        message: 'Full name, phone, address line 1, city, state, and postal code are required.',
      });
    }

    const count = await Address.countDocuments({ user: req.user._id });
    const shouldBeDefault = isDefault || count === 0;

    if (shouldBeDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    const address = await Address.create({
      user: req.user._id,
      fullName,
      phone,
      addressLine1,
      addressLine2: addressLine2 || '',
      landmark: landmark || '',
      city,
      state,
      postalCode,
      country: country || 'India',
      isDefault: shouldBeDefault,
    });

    res.status(201).json({
      success: true,
      message: 'Address saved successfully',
      address,
    });
  } catch (error) {
    next(error);
  }
};

const updateAddress = async (req, res, next) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    if (req.body.isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    Object.assign(address, req.body);
    await address.save();

    res.status(200).json({
      success: true,
      message: 'Address updated',
      address,
    });
  } catch (error) {
    next(error);
  }
};

const deleteAddress = async (req, res, next) => {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Address removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
};
