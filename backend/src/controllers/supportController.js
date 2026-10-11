const SupportTicket = require('../models/SupportTicket');

const createTicket = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message, category } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, subject, and inquiry message are required.',
      });
    }

    const ticket = await SupportTicket.create({
      user: req.user ? req.user._id : null,
      name,
      email: email.toLowerCase(),
      phone: phone || '',
      subject,
      message,
      category: category || 'general',
      status: 'open',
    });

    res.status(201).json({
      success: true,
      message: 'Support request submitted. Our artisan support team will reach out shortly.',
      ticket,
    });
  } catch (error) {
    next(error);
  }
};

const getMyTickets = async (req, res, next) => {
  try {
    const tickets = await SupportTicket.find({
      $or: [{ user: req.user._id }, { email: req.user.email }],
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      tickets,
    });
  } catch (error) {
    next(error);
  }
};

const getAllTickets = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;

    const tickets = await SupportTicket.find(query)
      .sort({ createdAt: -1 })
      .populate('user', 'name email role');

    res.status(200).json({
      success: true,
      tickets,
    });
  } catch (error) {
    next(error);
  }
};

const replyTicket = async (req, res, next) => {
  try {
    const { message, status } = req.body;
    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Support ticket not found' });
    }

    ticket.responses.push({
      sender: req.user._id,
      senderName: req.user.name,
      senderRole: req.user.role,
      message,
      timestamp: new Date(),
    });

    if (status) {
      ticket.status = status;
    }

    await ticket.save();

    res.status(200).json({
      success: true,
      message: 'Response recorded',
      ticket,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTicket,
  getMyTickets,
  getAllTickets,
  replyTicket,
};
