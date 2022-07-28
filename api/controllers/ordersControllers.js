const mongoose = require('mongoose');

const Order = require('../models/Order');

exports.get_all_order = async (req, res, next) => {
  try {
    const order = await Order.find().sort({ createdAt: 1 });
    res.status(200).json({ order });
  } catch (err) {
    return res.status(500).json({
      error: err,
    });
  }
};

exports.order_get_by_id = async (req, res, next) => {
  try {
    const order = await Order.findById().sort({ createdAt: 1 });
    res.status(200).json({ order });
  } catch (err) {
    return res.status(500).json({
      error: err,
    });
  }
};

exports.order_create_order = async (req, res, next) => {
  const { ownerId } = req.body;
  try {
    const newOrder = new Order({
      _id: new mongoose.Types.ObjectId(),
      ownerId,
      createdAt: new Date().toISOString(),
    });

    newOrder.save().then((result) => {
      res.status(201).json({
        message: 'Order successfully created',
        postId: result._id,
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err,
    });
  }
};

exports.order_cancel_order = async (req, res, next) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findByIdAndUpdate(
      { _id: orderId },
      {
        $set: {
          orderStatus: 'CANCELLED',
        },
      },
      { new: true }
    );
    res.status(200).json({ order });
  } catch (err) {
    res.status(400).json({ err });
  }
};

exports.order_confirmed_order = async (req, res, next) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findByIdAndUpdate(
      { _id: orderId },
      {
        $set: {
          orderStatus: 'CONFIRMED',
        },
      },
      { new: true }
    );
    res.status(200).json({ order });
    // console.log(order);

    setTimeout(async () => {
      await Order.findByIdAndUpdate(
        { _id: orderId },
        {
          $set: {
            orderStatus: 'DELIVERED',
          },
        },
        { new: true }
      );
    }, 5000);
  } catch (err) {
    res.status(400).json({ err });
  }
};

exports.order_delete = async (req, res, next) => {
  const { orderId } = req.params;

  try {
    const result = await Order.deleteOne({ _id: orderId });
    res.status(200).json({
      message: 'Order id success deleted!',
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err,
    });
  }
};
