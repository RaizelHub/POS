import Transaction from '../Models/transaction.js';
import Product from '../Models/product.js';
import UserModel from '../Models/user.js';
import { buildOrgBranchFilter } from '../utills/orgBranchFilter.js';

/**
 * Compile comprehensive dashboard analytics for the store management console.
 * Derives all figures from authoritative database records using aggregation pipelines.
 */
export const getDashboardAnalytics = async (req, res) => {
  try {
    const orgBranch = buildOrgBranchFilter(req.auth);
    const now = new Date();

    // Time boundaries (local server time)
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const startOfWeek = new Date(now);
    startOfWeek.setDate(startOfWeek.getDate() - 6);
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

    const baseMatch = {
      ...orgBranch,
      status: { $ne: 'voided' },
    };

    // 1. Unified summary aggregations using $facet
    const [summaryFacet] = await Transaction.aggregate([
      { $match: baseMatch },
      {
        $facet: {
          allTime: [
            {
              $group: {
                _id: null,
                revenueCents: {
                  $sum: { $subtract: ['$totalAmountCents', { $ifNull: ['$refundTotalCents', 0] }] },
                },
                count: { $sum: 1 },
              },
            },
          ],
          today: [
            { $match: { transactionDate: { $gte: startOfToday, $lte: endOfToday } } },
            {
              $group: {
                _id: null,
                revenueCents: {
                  $sum: { $subtract: ['$totalAmountCents', { $ifNull: ['$refundTotalCents', 0] }] },
                },
                count: { $sum: 1 },
              },
            },
          ],
          weekly: [
            { $match: { transactionDate: { $gte: startOfWeek, $lte: endOfToday } } },
            {
              $group: {
                _id: null,
                revenueCents: {
                  $sum: { $subtract: ['$totalAmountCents', { $ifNull: ['$refundTotalCents', 0] }] },
                },
                count: { $sum: 1 },
              },
            },
          ],
          monthly: [
            { $match: { transactionDate: { $gte: startOfMonth, $lte: endOfToday } } },
            {
              $group: {
                _id: null,
                revenueCents: {
                  $sum: { $subtract: ['$totalAmountCents', { $ifNull: ['$refundTotalCents', 0] }] },
                },
                count: { $sum: 1 },
              },
            },
          ],
          recent: [
            { $sort: { transactionDate: -1 } },
            { $limit: 6 },
            {
              $project: {
                _id: 1,
                transactionId: 1,
                transactionDate: 1,
                totalAmountCents: 1,
                refundTotalCents: 1,
                originalAmount: 1,
                discountAmount: 1,
                paymentMethod: 1,
                paymentStatus: 1,
                status: 1,
                userId: 1,
                itemCount: { $size: { $ifNull: ['$products', []] } },
              },
            },
          ],
        },
      },
    ]);

    const allTimeCents = Math.max(0, summaryFacet?.allTime?.[0]?.revenueCents || 0);
    const todayCents = Math.max(0, summaryFacet?.today?.[0]?.revenueCents || 0);
    const weeklyCents = Math.max(0, summaryFacet?.weekly?.[0]?.revenueCents || 0);
    const monthlyCents = Math.max(0, summaryFacet?.monthly?.[0]?.revenueCents || 0);

    const totalTransactions = summaryFacet?.allTime?.[0]?.count || 0;
    const todayTransactions = summaryFacet?.today?.[0]?.count || 0;
    const weeklyTransactions = summaryFacet?.weekly?.[0]?.count || 0;
    const monthlyTransactions = summaryFacet?.monthly?.[0]?.count || 0;

    const totalRevenue = Number((allTimeCents / 100).toFixed(2));
    const todaySales = Number((todayCents / 100).toFixed(2));
    const weeklySales = Number((weeklyCents / 100).toFixed(2));
    const monthlySales = Number((monthlyCents / 100).toFixed(2));

    const averageTransactionValue = totalTransactions > 0
      ? Number((totalRevenue / totalTransactions).toFixed(2))
      : 0;
    const todayAverageTransactionValue = todayTransactions > 0
      ? Number((todaySales / todayTransactions).toFixed(2))
      : 0;

    // Populate recent transactions user details safely
    const recentTransactionsRaw = summaryFacet?.recent || [];
    const cashierUserIds = [
      ...new Set(recentTransactionsRaw.map((tx) => tx.userId?.toString()).filter(Boolean)),
    ];
    const cashiers = cashierUserIds.length > 0
      ? await UserModel.find({ _id: { $in: cashierUserIds } }).select('firstname lastname email').lean()
      : [];
    const cashierMap = new Map(cashiers.map((c) => [c._id.toString(), `${c.firstname} ${c.lastname}`.trim()]));

    const recentTransactions = recentTransactionsRaw.map((tx) => {
      const netCents = Math.max(0, (tx.totalAmountCents || 0) - (tx.refundTotalCents || 0));
      return {
        _id: tx._id,
        transactionId: tx.transactionId,
        transactionDate: tx.transactionDate,
        amount: Number((netCents / 100).toFixed(2)),
        paymentMethod: tx.paymentMethod,
        paymentStatus: tx.paymentStatus,
        status: tx.status,
        cashierName: cashierMap.get(tx.userId?.toString()) || 'Cashier',
        itemCount: tx.itemCount || 0,
      };
    });

    // 2. Sales Trend (last 7 days, daily, zero-filled)
    const dailySalesAgg = await Transaction.aggregate([
      {
        $match: {
          ...baseMatch,
          transactionDate: { $gte: startOfWeek, $lte: endOfToday },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$transactionDate' } },
          totalSalesCents: {
            $sum: { $subtract: ['$totalAmountCents', { $ifNull: ['$refundTotalCents', 0] }] },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const dailySalesMap = new Map(
      dailySalesAgg.map((item) => [
        item._id,
        {
          sales: Math.max(0, Number((item.totalSalesCents / 100).toFixed(2))),
          count: item.count,
        },
      ])
    );

    const formattedDailySales = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const existing = dailySalesMap.get(dateStr);
      formattedDailySales.push({
        date: dateStr,
        sales: existing ? existing.sales : 0,
        transactions: existing ? existing.count : 0,
      });
    }

    // 3. Category distribution (last 30 days)
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const categorySales = await Transaction.aggregate([
      {
        $match: {
          ...baseMatch,
          transactionDate: { $gte: thirtyDaysAgo, $lte: endOfToday },
        },
      },
      { $unwind: '$products' },
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
          valueCents: {
            $sum: {
              $subtract: [
                { $ifNull: ['$products.netTotalPriceCents', { $multiply: ['$products.totalPrice', 100] }] },
                { $ifNull: ['$products.refundedAmountCents', 0] },
              ],
            },
          },
          unitsSold: { $sum: '$products.quantity' },
        },
      },
      { $sort: { valueCents: -1 } },
    ]);

    const formattedCategorySales = categorySales.map((item) => {
      const catName = String(item._id || 'others');
      return {
        name: catName.charAt(0).toUpperCase() + catName.slice(1),
        value: Math.max(0, Number((item.valueCents / 100).toFixed(2))),
        unitsSold: item.unitsSold || 0,
      };
    });

    // 4. Top 5 Best-Selling Products (by units sold, net of returns)
    const topProductsAgg = await Transaction.aggregate([
      {
        $match: {
          ...baseMatch,
          transactionDate: { $gte: thirtyDaysAgo, $lte: endOfToday },
        },
      },
      { $unwind: '$products' },
      {
        $group: {
          _id: '$products.name',
          quantity: {
            $sum: {
              $subtract: ['$products.quantity', { $ifNull: ['$products.returnedQuantity', 0] }],
            },
          },
          revenueCents: {
            $sum: {
              $subtract: [
                { $ifNull: ['$products.netTotalPriceCents', { $multiply: ['$products.totalPrice', 100] }] },
                { $ifNull: ['$products.refundedAmountCents', 0] },
              ],
            },
          },
        },
      },
      { $match: { quantity: { $gt: 0 } } },
      { $sort: { quantity: -1, revenueCents: -1 } },
      { $limit: 5 },
    ]);

    const formattedTopProducts = topProductsAgg.map((item) => ({
      name: item._id || 'Unnamed Product',
      quantity: Math.max(0, item.quantity),
      revenue: Math.max(0, Number((item.revenueCents / 100).toFixed(2))),
    }));

    // 5. Store Catalog & Inventory Summary
    const productBaseFilter = {
      ...orgBranch,
      isActive: { $ne: false },
    };

    const [
      totalProducts,
      lowStockCount,
      outOfStockCount,
      lowStockProducts,
      totalCashiers,
    ] = await Promise.all([
      Product.countDocuments(productBaseFilter),
      Product.countDocuments({
        ...productBaseFilter,
        $expr: { $lte: ['$quantity', '$lowStockThreshold'] },
      }),
      Product.countDocuments({
        ...productBaseFilter,
        quantity: { $lte: 0 },
      }),
      Product.find({
        ...productBaseFilter,
        $expr: { $lte: ['$quantity', '$lowStockThreshold'] },
      })
        .select('_id name quantity category lowStockThreshold price priceCents image')
        .sort({ quantity: 1, name: 1 })
        .limit(8)
        .lean(),
      UserModel.countDocuments({
        ...orgBranch,
        isActive: { $ne: false },
        role: { $in: ['cashier', 'supervisor'] },
      }),
    ]);

    return res.status(200).json({
      summary: {
        totalRevenue,
        todaySales,
        weeklySales,
        monthlySales,
        totalTransactions,
        todayTransactions,
        weeklyTransactions,
        monthlyTransactions,
        averageTransactionValue,
        todayAverageTransactionValue,
        totalProducts,
        totalCashiers,
        lowStockCount,
        outOfStockCount,
      },
      dailySales: formattedDailySales,
      salesByDay: formattedDailySales, // Backwards compatibility with previous field names
      categorySales: formattedCategorySales,
      topProducts: formattedTopProducts,
      lowStockProducts,
      recentTransactions,
    });
  } catch (error) {
    console.error('Error compiling analytics data:', error);
    return res.status(500).json({
      message: 'Error compiling analytics data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
