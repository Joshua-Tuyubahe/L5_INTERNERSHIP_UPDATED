const Order = require('../models/Order');
const User = require('../models/User');
const Feedback = require('../models/Feedback');

async function getReports(req, res) {
  try {
    const { type, startDate: queryStartDate, endDate: queryEndDate } = req.query; // 'daily', 'weekly', 'annual', 'custom'
    const now = new Date();
    let startDate, endDate;

    switch (type) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'weekly':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
        weekStart.setHours(0, 0, 0, 0);
        startDate = weekStart;
        endDate = new Date(weekStart);
        endDate.setDate(weekStart.getDate() + 7);
        break;
      case 'annual':
        startDate = new Date(now.getFullYear(), 0, 1); // January 1st
        endDate = new Date(now.getFullYear() + 1, 0, 1); // January 1st next year
        break;
      case 'custom':
        if (!queryStartDate || !queryEndDate) {
          return res.status(400).json({ message: 'For custom reports, startDate and endDate are required' });
        }
        startDate = new Date(queryStartDate);
        endDate = new Date(queryEndDate);
        // Add one day to endDate to include the entire end date
        endDate.setDate(endDate.getDate() + 1);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD format' });
        }
        if (startDate >= endDate) {
          return res.status(400).json({ message: 'Start date must be before end date' });
        }
        break;
      default:
        return res.status(400).json({ message: 'Invalid report type. Use: daily, weekly, annual, or custom' });
    }

    // Get orders within date range
    const orders = await Order.find({
      createdAt: { $gte: startDate, $lt: endDate }
    }).populate('userId', 'name email');

    // Get feedbacks within date range
    const feedbacks = await Feedback.find({
      createdAt: { $gte: startDate, $lt: endDate }
    }).populate('userId', 'name');

    // Calculate order statistics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    const deliveredOrders = orders.filter(order => order.status === 'Delivered').length;
    const pendingOrders = orders.filter(order => order.status === 'Pending').length;
    const preparingOrders = orders.filter(order => order.status === 'Preparing').length;

    // Calculate feedback statistics
    const totalFeedbacks = feedbacks.length;
    const averageRating = totalFeedbacks > 0
      ? feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0) / totalFeedbacks
      : 0;

    // Group orders by food item
    const foodStats = {};
    orders.forEach(order => {
      if (!foodStats[order.foodName]) {
        foodStats[order.foodName] = {
          name: order.foodName,
          totalQuantity: 0,
          totalRevenue: 0,
          orderCount: 0
        };
      }
      foodStats[order.foodName].totalQuantity += order.quantity;
      foodStats[order.foodName].totalRevenue += order.totalPrice;
      foodStats[order.foodName].orderCount += 1;
    });

    // Group feedbacks by type
    const feedbackStats = {};
    feedbacks.forEach(feedback => {
      if (!feedbackStats[feedback.type]) {
        feedbackStats[feedback.type] = {
          type: feedback.type,
          count: 0,
          averageRating: 0,
          totalRating: 0
        };
      }
      feedbackStats[feedback.type].count += 1;
      feedbackStats[feedback.type].totalRating += feedback.rating;
    });

    // Calculate average ratings for feedback types
    Object.keys(feedbackStats).forEach(type => {
      feedbackStats[type].averageRating = feedbackStats[type].totalRating / feedbackStats[type].count;
    });

    const report = {
      period: {
        type,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      },
      summary: {
        totalOrders,
        totalRevenue,
        deliveredOrders,
        pendingOrders,
        preparingOrders,
        totalFeedbacks,
        averageRating: Math.round(averageRating * 10) / 10
      },
      foodStats: Object.values(foodStats),
      feedbackStats: Object.values(feedbackStats),
      recentOrders: orders.slice(0, 10), // Last 10 orders in the period
      recentFeedbacks: feedbacks.slice(0, 10) // Last 10 feedbacks in the period
    };

    return res.json(report);
  } catch (error) {
    console.error('Get reports error:', error);
    return res.status(500).json({ message: 'Server error generating report' });
  }
}

module.exports = { getReports };