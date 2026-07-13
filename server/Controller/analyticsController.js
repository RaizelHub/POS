import Transaction from '../Models/transaction.js';
import Product from '../Models/product.js';
import mongoose from 'mongoose';

export const getDashboardAnalytics = async (req, res) => {
  try {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7); // Last 7 days
    start.setHours(0, 0, 0, 0);

    // 1. Sales Trend over the last 7 days
    const dailySales = await Transaction.aggregate([
      {
        $match: {
          transactionDate: { $gte: start, $lte: end },
        },
      },
      {
        $unwind: '$products',
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$transactionDate' } },
          totalSales: { $sum: '$products.totalPrice' },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Format daily sales for charting (ensure all 7 days are represented, even with 0 sales)
    const dailySalesMap = {};
    dailySales.forEach(item => {
      dailySalesMap[item._id] = item.totalSales;
    });

    const formattedDailySales = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(end.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      formattedDailySales.push({
        date: dateStr,
        sales: dailySalesMap[dateStr] || 0,
      });
    }

    // 2. Sales by Category
    const categorySales = await Transaction.aggregate([
      {
        $match: {
          transactionDate: { $gte: start, $lte: end },
        },
      },
      {
        $unwind: '$products',
      },
      {
        $lookup: {
          from: 'products',
          localField: 'products.productId',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      {
        $unwind: {
          path: '$productDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: { $ifNull: ['$productDetails.category', 'others'] },
          value: { $sum: '$products.totalPrice' },
        },
      },
    ]);

    // Format category sales for Pie Chart
    const formattedCategorySales = categorySales.map(item => ({
      name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
      value: item.value,
    }));

    // 3. Top 5 Selling Products
    const topProducts = await Transaction.aggregate([
      {
        $unwind: '$products',
      },
      {
        $group: {
          _id: '$products.name',
          quantity: { $sum: '$products.quantity' },
          revenue: { $sum: '$products.totalPrice' },
        },
      },
      {
        $sort: { quantity: -1 },
      },
      {
        $limit: 5,
      },
    ]);

    const formattedTopProducts = topProducts.map(item => ({
      name: item._id,
      quantity: item.quantity,
      revenue: item.revenue,
    }));

    res.json({
      dailySales: formattedDailySales,
      categorySales: formattedCategorySales,
      topProducts: formattedTopProducts,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error compiling analytics data', error: error.message });
  }
};

// Get cashier leaderboard analytics
export const getCashierLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Transaction.aggregate([
      {
        $group: {
          _id: '$userId',
          totalSales: { $sum: { $subtract: ['$originalAmount', '$discountAmount'] } },
          transactionsCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'cashierDetails',
        },
      },
      {
        $unwind: {
          path: '$cashierDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          totalSales: 1,
          transactionsCount: 1,
          firstname: { $ifNull: ['$cashierDetails.firstname', 'Unknown'] },
          lastname: { $ifNull: ['$cashierDetails.lastname', 'User'] },
          email: { $ifNull: ['$cashierDetails.email', 'N/A'] },
          image: { $ifNull: ['$cashierDetails.image', ''] },
        },
      },
      {
        $sort: { totalSales: -1 },
      },
    ]);

    res.json(leaderboard);
  } catch (error) {
    console.error('Error compiling cashier leaderboard:', error);
    res.status(500).json({ message: 'Error compiling cashier leaderboard data', error: error.message });
  }
};
