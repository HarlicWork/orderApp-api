const mongoose = require('mongoose');

const OrderSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  ownerId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
  },
  orderStatus: {
    type: String,
    enum: ['CREATED', 'CANCELLED', 'CONFIRMED', 'DELIVERED'],
    default: 'CREATED',
  },
});

module.exports = mongoose.model('Order', OrderSchema);
