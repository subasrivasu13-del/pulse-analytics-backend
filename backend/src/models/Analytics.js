const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  route: { type: String, required: true },
  sessionId: { type: String, required: true },
  ipAddress: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Analytics', analyticsSchema);
