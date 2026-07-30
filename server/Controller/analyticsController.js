import Transaction from '../Models/transaction.js';

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
          organizationId: req.auth.organizationId,
          branchId: req.auth.branchId,
          status: { $ne: 'voided' },
          transactionDate: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$transactionDate' } },
          totalSales: {
            $sum: {
              $divide: [
                { $subtract: ['$totalAmountCents', { $ifNull: ['$refundTotalCents', 0] }] },
                100,
              ],
            },
          },
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
          organizationId: req.auth.organizationId,
          branchId: req.auth.branchId,
          status: { $ne: 'voided' },
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
          value: {
            $sum: {
              $divide: [
                {
                  $subtract: [
                    { $ifNull: ['$products.netTotalPriceCents', { $multiply: ['$products.totalPrice', 100] }] },
                    { $ifNull: ['$products.refundedAmountCents', 0] },
                  ],
                },
                100,
              ],
            },
          },
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
        $match: {
          organizationId: req.auth.organizationId,
          branchId: req.auth.branchId,
          status: { $ne: 'voided' },
          transactionDate: { $gte: start, $lte: end },
        },
      },
      {
        $unwind: '$products',
      },
      {
        $group: {
          _id: '$products.name',
          quantity: { $sum: '$products.quantity' },
          revenue: {
            $sum: {
              $divide: [
                {
                  $subtract: [
                    { $ifNull: ['$products.netTotalPriceCents', { $multiply: ['$products.totalPrice', 100] }] },
                    { $ifNull: ['$products.refundedAmountCents', 0] },
                  ],
                },
                100,
              ],
            },
          },
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
