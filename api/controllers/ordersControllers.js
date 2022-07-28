const mongoose = require('mongoose');
const axios = require('axios');

const Order = require('../models/Order');

let paymentStatus = null;

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
  const { orderId } = req.body;
  try {
    const order = await Order.findById({ orderId }).sort({ createdAt: 1 });
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

    newOrder
      .save()
      .then((result) => {
        res.status(201).json({
          message: 'Order successfully created',
          postId: result._id,
        });
      })
      .catch(function (error) {
        res.status(500).json({
          error: error,
          message: error.message,
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
  const { orderId } = req.body;

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

exports.order_deliver_order = async (req, res, next) => {
  const { orderId } = req.body;

  try {
    const order = await Order.findByIdAndUpdate(
      { _id: orderId },
      {
        $set: {
          orderStatus: 'DELIVERED',
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
  const { orderId, paymentType } = req.body;

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

    axios
      .post(process.env.API_PAYMENT, { orderId, paymentType })
      .catch((err) => {
        res.status(500).json({
          error: err,
          message: err.message,
        });
      });
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
    res.status(500).json({
      error: err,
      message: err.message,
    });
  }
};
