const express = require('express');
const router = express.Router();

const ordersController = require('../controllers/ordersControllers');

router.get('/', ordersController.get_all_order);

router.get('/:id', ordersController.order_get_by_id);

router.post('/createOrder', ordersController.order_create_order);

router.delete('/:orderId', ordersController.order_delete);

router.put('/orderConfirm', ordersController.order_confirmed_order);

router.put('/orderCancel', ordersController.order_cancel_order);

router.put('/orderDeliver', ordersController.order_deliver_order);

module.exports = router;
