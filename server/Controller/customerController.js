import Customer from '../Models/customer.js';

// Create a new customer profile
export const createCustomer = async (req, res) => {
  try {
    const { name, phone, email } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Customer name is required.' });
    }

    if (phone) {
      const existing = await Customer.findOne({ phone });
      if (existing) {
        return res.status(400).json({ message: 'A customer with this phone number already exists.' });
      }
    }

    const customer = new Customer({ name, phone, email });
    await customer.save();
    res.status(201).json({ message: 'Customer profile created successfully!', customer });
  } catch (error) {
    res.status(500).json({ message: 'Error creating customer profile', error: error.message });
  }
};

// Search customers by phone or name
export const searchCustomers = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.json([]);
    }

    // Search case-insensitively by name or phone containing query
    const customers = await Customer.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } },
      ],
    }).limit(10);

    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Error searching customers', error: error.message });
  }
};

// Get all customers (admin list)
export const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customer list', error: error.message });
  }
};

// Get customer by ID
export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customer details', error: error.message });
  }
};
