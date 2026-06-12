import Transaction from '../Models/transaction.js';
import User from '../Models/user.js';
import Sales from '../Models/sales.js';
import mongoose from 'mongoose';

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

    console.log('Fetching total sales details for:', selectedDate);

    // Ensure dateStart and dateEnd are set correctly, without modifying the original selectedDate object
    const dateStart = new Date(selectedDate);
    dateStart.setHours(0, 0, 0, 0); // Start of the selected day
    const dateEnd = new Date(selectedDate);
    dateEnd.setHours(23, 59, 59, 999); // End of the selected day

    // Get all transactions for the day
    const transactions = await Transaction.find({
      transactionDate: {
        $gte: dateStart,
        $lt: dateEnd,
      },
    }).lean();

    // Get all user IDs from transactions
    const userIds = [...new Set(transactions.map(t => t.userId.toString()))];

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

    // Process transactions to get detailed sales data
    let totalSales = 0;
    let paidSales = 0;
    let payLaterSales = 0;

    // Create a detailed sales report with user information
    const userPurchases = {};
    const productSummary = {};

    transactions.forEach(transaction => {
      const userId = transaction.userId.toString();
      const userName = userMap[userId]?.name || 'Unknown User';

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
        // Add to total sales
        totalSales += product.totalPrice;

        // Add to paid or pay later sales
        if (product.paymentStatus === 'Paid') {
          paidSales += product.totalPrice;
          userPurchases[userId].paidAmount += product.totalPrice;
        } else {
          payLaterSales += product.totalPrice;
          userPurchases[userId].payLaterAmount += product.totalPrice;
        }

        // Add to user's total spent
        userPurchases[userId].totalSpent += product.totalPrice;

        // Add product to user's products with timestamp
        userPurchases[userId].products.push({
          name: product.name,
          price: product.price,
          quantity: product.quantity,
          totalPrice: product.totalPrice,
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

        productSummary[product.name].quantitySold += product.quantity;
        productSummary[product.name].totalRevenue += product.totalPrice;

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




export const createOrUpdateSales = async (req, res) => {
  try {
    const { date, totalSales, paidSales, payLaterSales, salesDetails } = req.body;

    const salesDate = new Date(date); // Ensure date format
    const dateStart = new Date(salesDate.setHours(0, 0, 0, 0)); // Start of the day
    const dateEnd = new Date(salesDate.setHours(23, 59, 59, 999)); // End of the day

    // Try to find an existing sales record for the given date
    let salesData = await Sales.findOne({ date: { $gte: dateStart, $lt: dateEnd } });

    if (salesData) {
      // Update the existing record
      salesData.totalSales = totalSales;
      salesData.paidSales = paidSales;
      salesData.payLaterSales = payLaterSales;
      salesData.salesDetails = salesDetails;
      await salesData.save();
    } else {
      // Create a new record for the day
      salesData = new Sales({
        date: salesDate,
        totalSales,
        paidSales,
        payLaterSales,
        salesDetails,
      });
      await salesData.save();
    }

    res.status(200).json({ message: 'Sales data successfully created/updated.' });
  } catch (error) {
    console.error('Error saving sales data:', error);
    res.status(500).json({ message: 'Failed to save sales data', error: error.message });
  }
};

