import Transaction from '../Models/transaction.js';
import User from '../Models/user.js';
import mongoose from 'mongoose';
import { buildOrgBranchFilter } from '../utills/orgBranchFilter.js';

const parseDateRange = (query) => {
  const { date, startDate, endDate } = query;

  if (startDate || endDate) {
    let start, end;
    if (startDate) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
        const [y, m, d] = startDate.split('-').map(Number);
        start = new Date(y, m - 1, d, 0, 0, 0, 0);
      } else {
        start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
      }
    } else {
      start = new Date(0); // Beginning of epoch
    }

    if (endDate) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
        const [y, m, d] = endDate.split('-').map(Number);
        end = new Date(y, m - 1, d, 23, 59, 59, 999);
      } else {
        end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
      }
    } else {
      end = new Date();
      end.setHours(23, 59, 59, 999);
    }

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return null;
    }
    return { dateStart: start, dateEnd: end };
  }

  // Single date filter
  let baseDate;
  if (date && typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [y, m, d] = date.split('-').map(Number);
    return {
      dateStart: new Date(y, m - 1, d, 0, 0, 0, 0),
      dateEnd: new Date(y, m - 1, d, 23, 59, 59, 999),
    };
  }

  baseDate = date ? new Date(date) : new Date();
  if (isNaN(baseDate.getTime())) {
    return null;
  }

  const dateStart = new Date(baseDate);
  dateStart.setHours(0, 0, 0, 0);
  const dateEnd = new Date(baseDate);
  dateEnd.setHours(23, 59, 59, 999);

  return { dateStart, dateEnd };
};

export const getTotalSalesDetails = async (req, res) => {
  try {
    const dateRange = parseDateRange(req.query);
    if (!dateRange) {
      return res.status(400).json({
        message: 'Invalid date format. Please provide dates in YYYY-MM-DD or standard ISO format.',
      });
    }

    const { dateStart, dateEnd } = dateRange;

    // Get all transactions for the date range
    const transactions = await Transaction.find({
      ...buildOrgBranchFilter(req.auth),
      status: { $ne: 'voided' },
      transactionDate: {
        $gte: dateStart,
        $lte: dateEnd,
      },
    }).lean();

    // Collect user IDs for batch lookup
    const userIds = [
      ...new Set(
        transactions
          .map((t) => (t.userId ? t.userId.toString() : null))
          .filter(Boolean)
      ),
    ];

    const users = userIds.length > 0
      ? await User.find({
          _id: { $in: userIds.map((id) => new mongoose.Types.ObjectId(id)) },
        })
          .select('firstname lastname email')
          .lean()
      : [];

    const userMap = {};
    users.forEach((user) => {
      userMap[user._id.toString()] = {
        name: `${user.firstname} ${user.lastname}`.trim(),
        email: user.email,
      };
    });

    let totalSalesCents = 0;
    let paidSalesCents = 0;
    let payLaterSalesCents = 0;
    let refundTotalCents = 0;

    const userPurchases = {};
    const productSummary = {};

    transactions.forEach((transaction) => {
      const userId = transaction.userId ? transaction.userId.toString() : 'unknown';
      const userName = userMap[userId]?.name || 'Cashier';

      const txSubtotalCents = transaction.totalAmountCents
        ?? Math.round(((transaction.originalAmount || 0) - (transaction.discountAmount || 0)) * 100);
      const txRefundCents = transaction.refundTotalCents || 0;
      const txNetCents = Math.max(0, txSubtotalCents - txRefundCents);

      totalSalesCents += txNetCents;
      refundTotalCents += txRefundCents;

      if (transaction.paymentStatus === 'Paid') {
        paidSalesCents += txNetCents;
      } else {
        const balanceDue = transaction.balanceDueCents ?? txNetCents;
        const paidSoFar = Math.max(0, txNetCents - balanceDue);
        paidSalesCents += paidSoFar;
        payLaterSalesCents += balanceDue;
      }

      if (!userPurchases[userId]) {
        userPurchases[userId] = {
          userId,
          userName,
          email: userMap[userId]?.email || '',
          totalSpent: 0,
          paidAmount: 0,
          payLaterAmount: 0,
          transactionCount: 0,
          products: [],
        };
      }

      userPurchases[userId].totalSpent += txNetCents / 100;
      userPurchases[userId].transactionCount += 1;
      if (transaction.paymentStatus === 'Paid') {
        userPurchases[userId].paidAmount += txNetCents / 100;
      } else {
        userPurchases[userId].payLaterAmount += (transaction.balanceDueCents || 0) / 100;
      }

      // Process line items
      (transaction.products || []).forEach((product) => {
        const lineNetCents = Math.max(
          0,
          (product.netTotalPriceCents ?? Math.round((product.totalPrice || 0) * 100))
            - (product.refundedAmountCents || 0)
        );
        const lineNet = lineNetCents / 100;
        const remainingQuantity = Math.max(0, product.quantity - (product.returnedQuantity || 0));

        userPurchases[userId].products.push({
          name: product.name,
          price: product.price,
          quantity: product.quantity,
          returnedQuantity: product.returnedQuantity || 0,
          totalPrice: lineNet,
          paymentStatus: product.paymentStatus,
          timestamp: transaction.transactionDate,
        });

        const prodKey = product.name || 'Unnamed Product';
        if (!productSummary[prodKey]) {
          productSummary[prodKey] = {
            productName: prodKey,
            quantitySold: 0,
            priceSold: product.price || 0,
            totalRevenue: 0,
            buyers: [],
            transactions: [],
          };
        }

        productSummary[prodKey].quantitySold += remainingQuantity;
        productSummary[prodKey].totalRevenue += lineNet;

        productSummary[prodKey].transactions.push({
          transactionId: transaction.transactionId,
          timestamp: transaction.transactionDate,
          quantity: product.quantity,
          buyer: userName,
          paymentStatus: product.paymentStatus,
        });

        if (!productSummary[prodKey].buyers.includes(userName)) {
          productSummary[prodKey].buyers.push(userName);
        }
      });
    });

    const userPurchasesArray = Object.values(userPurchases).map((u) => ({
      ...u,
      totalSpent: Number(u.totalSpent.toFixed(2)),
      paidAmount: Number(u.paidAmount.toFixed(2)),
      payLaterAmount: Number(u.payLaterAmount.toFixed(2)),
    }));

    const salesDetails = Object.values(productSummary).map((p) => ({
      ...p,
      totalRevenue: Number(p.totalRevenue.toFixed(2)),
    }));

    res.status(200).json({
      dateRange: {
        startDate: dateStart.toISOString(),
        endDate: dateEnd.toISOString(),
      },
      totalSales: Number((totalSalesCents / 100).toFixed(2)),
      paidSales: Number((paidSalesCents / 100).toFixed(2)),
      payLaterSales: Number((payLaterSalesCents / 100).toFixed(2)),
      refundTotal: Number((refundTotalCents / 100).toFixed(2)),
      transactionCount: transactions.length,
      salesDetails,
      userPurchases: userPurchasesArray,
    });
  } catch (error) {
    console.error('Error fetching sales details:', error);
    res.status(500).json({
      message: 'Failed to fetch sales details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
