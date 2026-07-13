import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import UserModel from '../Models/user.js';
import Product from '../Models/product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

const seedDatabase = async () => {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI is not defined in your environment variables.');
    process.exit(1);
  }

  try {
    console.log('Connecting to database for seeding...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully!');

    // Clear existing products and users to start clean if requested
    console.log('Clearing old database records...');
    await UserModel.deleteMany({});
    await Product.deleteMany({});

    console.log('Creating default users...');
    const hashedPin = await bcrypt.hash('123456', 10);

    const adminUser = new UserModel({
      firstname: 'Admin',
      lastname: 'User',
      email: 'admin@buksu.edu.ph',
      pin: hashedPin,
      isVerified: true,
      isAdmin: true,
    });

    const cashierUser = new UserModel({
      firstname: 'Cashier',
      lastname: 'User',
      email: 'cashier@student.buksu.edu.ph',
      pin: hashedPin,
      isVerified: true,
      isAdmin: false,
    });

    await adminUser.save();
    await cashierUser.save();
    console.log('Created users successfully:');
    console.log('  Admin User: admin@buksu.edu.ph (PIN: 123456)');
    console.log('  Cashier User: cashier@student.buksu.edu.ph (PIN: 123456)');

    console.log('Creating default products catalog...');
    const sampleProducts = [
      {
        name: 'Coca-Cola Can 330ml',
        price: 35.0,
        quantity: 50,
        category: 'drinks',
        barcode: '4800888137359',
        sku: 'DRK-COKE-330',
        image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=200&auto=format&fit=crop',
        lowStockThreshold: 10,
        isActive: true,
      },
      {
        name: 'Pepsi Blue 330ml',
        price: 32.0,
        quantity: 40,
        category: 'drinks',
        barcode: '4800888137441',
        sku: 'DRK-PEPSI-330',
        image: 'https://images.unsplash.com/photo-1543257580-7269da773bf5?q=80&w=200&auto=format&fit=crop',
        lowStockThreshold: 8,
        isActive: true,
      },
      {
        name: 'Lays Classic Potato Chips 50g',
        price: 45.0,
        quantity: 30,
        category: 'junkfood',
        barcode: '028400091566',
        sku: 'SNK-LAYS-50',
        image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?q=80&w=200&auto=format&fit=crop',
        lowStockThreshold: 5,
        isActive: true,
      },
      {
        name: 'Doritos Nacho Cheese 50g',
        price: 48.0,
        quantity: 25,
        category: 'junkfood',
        barcode: '028400091894',
        sku: 'SNK-DOR-50',
        image: 'https://images.unsplash.com/photo-1600952841320-db92ec4047ca?q=80&w=200&auto=format&fit=crop',
        lowStockThreshold: 5,
        isActive: true,
      },
      {
        name: 'San Miguel Beer Pale Pilsen',
        price: 80.0,
        quantity: 3, // Low stock on purpose to trigger alerts!
        category: 'drinks',
        barcode: '4800110026027',
        sku: 'DRK-SMB-320',
        image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?q=80&w=200&auto=format&fit=crop',
        lowStockThreshold: 5,
        isActive: true,
      },
    ];

    await Product.insertMany(sampleProducts);
    console.log('Successfully seeded database catalog!');
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
