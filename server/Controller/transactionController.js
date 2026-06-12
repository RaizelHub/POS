import mongoose from 'mongoose'; // Ensure mongoose is imported
import Transaction from '../Models/transaction.js';

export const confirmPayLaterPayment = async (req, res) => {
  const { userId, itemId } = req.body;
  console.log('Request Body:', req.body);

  if (!userId || !itemId) {
    return res.status(400).json({ message: 'User ID and Item ID are required.' });
  }

  try {
    // Ensure that itemId is a valid ObjectId
    const itemIdObject = new mongoose.Types.ObjectId(itemId); // Use 'new' to instantiate ObjectId

    // Find the transaction for the user with the specified itemId and 'Pay Later' status
    const transaction = await Transaction.findOne({
      userId,
      "products._id": itemIdObject,
      "products.paymentStatus": 'Pay Later'
    });

    console.log('Transaction:', transaction);

    if (!transaction || !transaction.products || transaction.products.length === 0) {
      return res.status(404).json({ message: 'Transaction or products not found.' });
    }

    // Locate the product in the products array with paymentStatus "Pay Later"
    const itemIndex = transaction.products.findIndex(
      (item) => item._id.toString() === itemIdObject.toString()
    );

    console.log('Item Index:', itemIndex);

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in Pay Later list.' });
    }

    const payLaterItem = transaction.products[itemIndex];
    console.log('Pay Later Item:', payLaterItem);

    if (!payLaterItem.name || !payLaterItem.price) {
      return res.status(400).json({ message: 'Item data is incomplete. Name and price are required.' });
    }

    // Update the payment status to "Paid" and push to paidItems
    const updatedTransaction = await Transaction.findOneAndUpdate(
      { userId, "products._id": itemIdObject, "products.paymentStatus": 'Pay Later' },
      {
        $set: {
          "products.$.paymentStatus": 'Paid',
        },
        $push: {
          paidItems: {
            itemId: payLaterItem._id,
            name: payLaterItem.name,
            price: payLaterItem.price,
            paymentMethod: 'Cash',
            date: new Date(),
          }
        }
      },
      { new: true } // Return the updated document
    );

    if (!updatedTransaction) {
      return res.status(500).json({ message: 'Error updating payment status.' });
    }

    console.log('Paid Items After Saving:', updatedTransaction.paidItems);

    res.status(200).json({ message: 'Payment confirmed successfully.', paidItem: payLaterItem });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ message: 'Error confirming payment.', error: error.stack || error.message });
  }
};
