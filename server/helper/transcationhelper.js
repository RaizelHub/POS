import Transaction from '../Models/transaction.js';

export const addOrUpdateTransaction = async (userId, newItem, isPayLater = false) => {
  try {
    let transaction = await Transaction.findOne({ userId });

    if (!transaction) {
      // Create a new transaction record if none exists
      transaction = new Transaction({ userId, paidItems: [], payLaterItems: [] });
    }

    if (isPayLater) {
      transaction.payLaterItems.push(newItem);
    } else {
      transaction.paidItems.push(newItem);
    }

    await transaction.save();
    console.log('Transaction updated successfully:', transaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
};

export const fetchTransactionsByUser = async (userId) => {
  try {
    const transaction = await Transaction.findOne({ userId });
    if (!transaction) {
      console.log('No transactions found for user.');
      return { paidItems: [], payLaterItems: [] };
    }
    console.log('User Transactions:', transaction);
    return transaction;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};
