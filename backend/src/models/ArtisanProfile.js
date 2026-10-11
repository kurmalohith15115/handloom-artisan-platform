const mongoose = require('mongoose');

const artisanProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    craftType: {
      type: String,
      required: [true, 'Craft type is required'],
      trim: true,
    },
    craftStory: {
      type: String,
      required: [true, 'Craft story and artisan background is required'],
      trim: true,
      minlength: [20, 'Please share at least 20 characters about your craft heritage'],
    },
    experienceYears: {
      type: Number,
      required: [true, 'Years of experience is required'],
      min: [0, 'Experience years cannot be negative'],
    },
    location: {
      village: { type: String, trim: true, default: '' },
      district: { type: String, trim: true, default: '' },
      state: { type: String, trim: true, required: true },
      country: { type: String, default: 'India' },
      postalCode: { type: String, trim: true, default: '' },
    },
    profilePhoto: {
      type: String,
      default: '',
    },
    workshopPhotos: [
      {
        type: String,
      },
    ],
    applicationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended'],
      default: 'pending',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    bankDetails: {
      accountHolder: { type: String, default: '' },
      accountNumberMasked: { type: String, default: '' },
      ifscCode: { type: String, default: '' },
      bankName: { type: String, default: '' },
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    totalSales: {
      type: Number,
      default: 0,
    },
    earnings: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

artisanProfileSchema.index({ craftType: 1 });
artisanProfileSchema.index({ applicationStatus: 1 });
artisanProfileSchema.index({ 'location.state': 1 });

const ArtisanProfile = mongoose.model('ArtisanProfile', artisanProfileSchema);
module.exports = ArtisanProfile;
