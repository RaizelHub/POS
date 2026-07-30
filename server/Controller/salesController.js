import Transaction from '../Models/transaction.js';
import User from '../Models/user.js';
import mongoose from 'mongoose';
import { buildOrgBranchFilter } from '../utills/orgBranchFilter.js';

export const getTotalSalesDetails = async (req, res) => {
  try {
    const { date } = req.query; // Get the date from query params
    let selectedDate = date ? new Date(date) : new Date();

    // Validate the date format
    if (isNaN(selectedDate)) {
      return res.status(400).json({
        message: 'Invalid date format. Please provide a valid date.',
      });
    }

    // Ensure dateStart and dateEnd are set correctly, without modifying the original selectedDate object
    const dateStart = new Date(selectedDate);
    dateStart.setHours(0, 0, 0, 0); // Start of the selected day
    const dateEnd = new Date(selectedDate);
    dateEnd.setHours(23, 59, 59, 999); // End of the selected day

    // Get all transactions for the day
    const transactions = await Transaction.find({
      ...buildOrgBranchFilter(req.auth),
      status: { $ne: 'voided' },
      transactionDate: {
        $gte: dateStart,
        $lt: dateEnd,
      },
    }).lean();

    // Get all user IDs from transactions
    const userIds = [...new Set(transactions.map(t => t.userId ? t.userId.toString() : null).filter(Boolean))];

    // Fetch user details
    const users = await User.find({
      _id: { $in: userIds.map(id => new mongoose.Types.ObjectId(id)) }
    }).lean();

    // Create a map of user IDs to user details for quick lookup
    const userMap = {};
    users.forEach(user => {
      userMap[user._id.toString()] = {
        name: `${user.firstname} ${user.lastname}`,
        email: user.email
      };
    });

    let totalSales = 0;
    let paidSales = 0;
    let payLaterSales = 0;
    const userPurchases = {};
    const productSummary = {};

    transactions.forEach(transaction => {
      const userId = transaction.userId.toString();
      const userName = userMap[userId]?.name || 'Unknown User';
      const transactionNetCents = Math.max(
        0,
        (transaction.totalAmountCents || Math.round((transaction.originalAmount - transaction.discountAmount) * 100))
          - (transaction.refundTotalCents || 0)
      );
      const transactionNet = transactionNetCents / 100;
      const collectedAmount = Math.min(
        transactionNet,
        (transaction.amountPaidCents ?? (transaction.paymentStatus === 'Paid' ? transactionNetCents : 0)) / 100
      );
      totalSales += transactionNet;
      paidSales += collectedAmount;
      payLaterSales += Math.max(0, (transaction.balanceDueCents || 0) / 100);

      // Initialize user in userPurchases if not exists
      if (!userPurchases[userId]) {
        userPurchases[userId] = {
          userId,
          userName,
          email: userMap[userId]?.email || 'Unknown Email',
          totalSpent: 0,
          paidAmount: 0,
          payLaterAmount: 0,
          products: []
        };
      }

      // Process each product in the transaction
      transaction.products.forEach(product => {
        const lineNet = Math.max(
          0,
          ((product.netTotalPriceCents ?? Math.round(product.totalPrice * 100))
            - (product.refundedAmountCents || 0)) / 100
        );
        const remainingQuantity = product.quantity - (product.returnedQuantity || 0);
        userPurchases[userId].totalSpent += lineNet;
        if (transaction.paymentStatus === 'Paid') userPurchases[userId].paidAmount += lineNet;
        else userPurchases[userId].payLaterAmount += lineNet;

        // Add product to user's products with timestamp
        userPurchases[userId].products.push({
          name: product.name,
          price: product.price,
          quantity: product.quantity,
          totalPrice: lineNet,
          paymentStatus: product.paymentStatus,
          timestamp: transaction.transactionDate // Add the transaction timestamp
        });

        // Add to product summary
        if (!productSummary[product.name]) {
          productSummary[product.name] = {
            productName: product.name,
            quantitySold: 0,
            priceSold: product.price,
            totalRevenue: 0,
            buyers: [],
            transactions: [] // Add array to store transaction timestamps
          };
        }

        // Add transaction timestamp to the product summary
        productSummary[product.name].transactions.push({
          timestamp: transaction.transactionDate,
          quantity: product.quantity,
          buyer: userName,
          paymentStatus: product.paymentStatus
        });

        productSummary[product.name].quantitySold += remainingQuantity;
        productSummary[product.name].totalRevenue += lineNet;

        // Add buyer to product summary if not already added
        if (!productSummary[product.name].buyers.includes(userName)) {
          productSummary[product.name].buyers.push(userName);
        }
      });
    });

    // Convert userPurchases object to array
    const userPurchasesArray = Object.values(userPurchases);

    // Convert productSummary object to array
    const salesDetails = Object.values(productSummary);

    res.json({
      totalSales,
      paidSales,
      payLaterSales,
      salesDetails,
      userPurchases: userPurchasesArray
    });
  } catch (error) {
    console.error('Error fetching sales details:', error);
    res.status(500).json({
      message: 'Failed to fetch sales details',
      error: error.message,
    });
  }
};

