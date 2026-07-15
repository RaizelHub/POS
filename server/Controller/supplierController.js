import Supplier from '../Models/supplier.js';

// Get all suppliers
export const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find().populate('products');
    res.status(200).json(suppliers);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ message: 'Error fetching suppliers.', error: error.message });
  }
};

// Create a new supplier
export const createSupplier = async (req, res) => {
  try {
    const { name, contactEmail, contactPhone, products } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Supplier name is required.' });
    }

    const existingSupplier = await Supplier.findOne({ name });
    if (existingSupplier) {
      return res.status(400).json({ message: 'Supplier name already exists.' });
    }

    const newSupplier = new Supplier({
      name,
      contactEmail: contactEmail || '',
      contactPhone: contactPhone || '',
      products: products || []
    });

    await newSupplier.save();
    res.status(201).json(newSupplier);
  } catch (error) {
    console.error('Error creating supplier:', error);
    res.status(500).json({ message: 'Error creating supplier.', error: error.message });
  }
};

// Update an existing supplier
export const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contactEmail, contactPhone, products } = req.body;

    const supplier = await Supplier.findById(id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found.' });
    }

    if (name && name !== supplier.name) {
      const existingSupplier = await Supplier.findOne({ name });
      if (existingSupplier) {
        return res.status(400).json({ message: 'Supplier name already exists.' });
      }
      supplier.name = name;
    }

    if (contactEmail !== undefined) supplier.contactEmail = contactEmail;
    if (contactPhone !== undefined) supplier.contactPhone = contactPhone;
    if (products !== undefined) supplier.products = products;

    await supplier.save();
    
    // Return populated updated supplier
    const updated = await Supplier.findById(id).populate('products');
    res.status(200).json(updated);
  } catch (error) {
    console.error('Error updating supplier:', error);
    res.status(500).json({ message: 'Error updating supplier.', error: error.message });
  }
};

// Delete a supplier
export const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSupplier = await Supplier.findByIdAndDelete(id);
    if (!deletedSupplier) {
      return res.status(404).json({ message: 'Supplier not found.' });
    }
    res.status(200).json({ message: 'Supplier deleted successfully.' });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    res.status(500).json({ message: 'Error deleting supplier.', error: error.message });
  }
};
