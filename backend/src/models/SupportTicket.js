const mongoose = require('mongoose');

const supportTicketResponseSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  senderName: {
    type: String,
    required: true,
  },
  senderRole: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const supportTicketSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Inquiry message is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['order', 'payment', 'artisan', 'craft', 'general'],
      default: 'general',
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open',
    },
    responses: [supportTicketResponseSchema],
  },
  {
    timestamps: true,
  }
);

supportTicketSchema.index({ status: 1 });
supportTicketSchema.index({ user: 1 });
supportTicketSchema.index({ createdAt: -1 });

const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);
module.exports = SupportTicket;
