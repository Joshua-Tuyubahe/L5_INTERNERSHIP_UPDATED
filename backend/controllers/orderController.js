const Order = require('../models/Order');

async function createOrder(req, res) {
  try {
    const { foodName, price, quantity = 1 } = req.body;
    if (!foodName || typeof price !== 'number') {
      return res.status(400).json({ message: 'Food name and numeric price are required' });
    }
    if (typeof quantity !== 'number' || quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be a positive number' });
    }

    const order = await Order.create({
      userId: req.user.id,
      foodName,
      price,
      quantity,
      totalPrice: price * quantity
    });

    return res.status(201).json({ message: 'Order placed', order });
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({ message: 'Server error creating order' });
  }
}

async function getOrders(req, res) {
  try {
    let orders;
    if (req.user.role === 'admin') {
      orders = await Order.find().populate('userId', 'name email');
    } else {
      orders = await Order.find({ userId: req.user.id });
    }
    return res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    return res.status(500).json({ message: 'Server error loading orders' });
  }
}

async function updateOrder(req, res) {
  try {
    const { id } = req.params;
    const { quantity, status } = req.body;

    // Find the order first to check ownership
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns this order (unless admin)
    if (req.user.role !== 'admin' && order.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updateData = {};

    // Handle quantity updates (allowed for users on their own orders)
    if (quantity !== undefined) {
      if (typeof quantity !== 'number' || quantity < 1) {
        return res.status(400).json({ message: 'Quantity must be a positive number' });
      }
      updateData.quantity = quantity;
      updateData.totalPrice = order.price * quantity; // Recalculate total price
    }

    // Handle status updates (admin only)
    if (status !== undefined) {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required for status updates' });
      }
      const validStatuses = ['Pending', 'Preparing', 'Delivered'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid order status' });
      }
      updateData.status = status;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    const updatedOrder = await Order.findByIdAndUpdate(id, updateData, { new: true });
    return res.json({ message: 'Order updated successfully', order: updatedOrder });
  } catch (error) {
    console.error('Update order error:', error);
    return res.status(500).json({ message: 'Server error updating order' });
  }
}

async function deleteOrder(req, res) {
  try {
    const { id } = req.params;

    // Find the order first to check ownership
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns this order (unless admin)
    if (req.user.role !== 'admin' && order.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Order.findByIdAndDelete(id);
    return res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    console.error('Delete order error:', error);
    return res.status(500).json({ message: 'Server error deleting order' });
  }
}

module.exports = { createOrder, getOrders, updateOrder, deleteOrder };
