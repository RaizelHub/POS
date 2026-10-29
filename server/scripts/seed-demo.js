import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

import UserModel from '../Models/user.js';
import Product from '../Models/product.js';
import Customer from '../Models/customer.js';
import Supplier from '../Models/supplier.js';
import Coupon from '../Models/coupon.js';
import Shift from '../Models/shift.js';
import Transaction from '../Models/transaction.js';
import InventoryMovement from '../Models/inventoryMovement.js';
import AuditLog from '../Models/auditLog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const uriArg = process.argv.find(arg => arg.startsWith('--uri='))?.split('=')[1] || 
               (process.argv.indexOf('--uri') !== -1 ? process.argv[process.argv.indexOf('--uri') + 1] : null);
const MONGODB_URI = uriArg || process.env.DEMO_MONGODB_URI || process.env.MONGODB_URI;
const ALLOW_DEMO_SEED = process.env.ALLOW_DEMO_SEED === 'true' || process.argv.includes('--demo');
const RESET_DATA = process.argv.includes('--reset') || process.argv.includes('--clean');

// Safety verification: Prevent accidental overwriting of production databases
const verifySafeEnvironment = (uri) => {
  if (!uri) {
    throw new Error('No MongoDB URI found. Specify MONGODB_URI or DEMO_MONGODB_URI or pass --uri=<connection-string>.');
  }

  // Refuse if production without explicit override
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DEMO_SEED_IN_PRODUCTION !== 'CONFIRM') {
    throw new Error(
      'BLOCKED: Seeding demo data in NODE_ENV=production is disallowed unless ALLOW_DEMO_SEED_IN_PRODUCTION=CONFIRM is explicitly set.'
    );
  }

  // Check if DB name appears to be production
  const lowerUri = uri.toLowerCase();
  const isSuspiciousProd = lowerUri.includes('prod') || lowerUri.includes('production') || lowerUri.includes('live-pos');
  if (isSuspiciousProd && !process.env.ALLOW_DEMO_SEED_IN_PRODUCTION) {
    throw new Error(
      `BLOCKED: The database target (${uri}) appears to be a production environment. To protect real records, demo seed has halted.`
    );
  }

  if (!ALLOW_DEMO_SEED) {
    throw new Error(
      'BLOCKED: Demo seeding requires ALLOW_DEMO_SEED=true in environment or passing the --demo flag.'
    );
  }
};

const runDemoSeed = async () => {
  try {
    verifySafeEnvironment(MONGODB_URI);

    console.log('Connecting to database for safe demo seeding...');
    await mongoose.connect(MONGODB_URI);
    console.log(`Connected to: ${mongoose.connection.host} (DB: ${mongoose.connection.name})`);

    const orgId = 'default';
    const branchId = 'main';

    if (RESET_DATA) {
      console.log('Reset flag provided: Purging demo data in branch:', branchId);
      await Promise.all([
        UserModel.deleteMany({ organizationId: orgId, email: /@sueltopos\.demo$/ }),
        Product.deleteMany({ organizationId: orgId, branchId }),
        Customer.deleteMany({ organizationId: orgId, branchId }),
        Supplier.deleteMany({ organizationId: orgId, branchId }),
        Coupon.deleteMany({ organizationId: orgId, branchId }),
        Shift.deleteMany({ organizationId: orgId, branchId }),
        Transaction.deleteMany({ organizationId: orgId, branchId }),
        InventoryMovement.deleteMany({ organizationId: orgId, branchId }),
        AuditLog.deleteMany({ organizationId: orgId, branchId }),
      ]);
    }

    console.log('Seeding demo accounts with role-based access control...');
    const hashedPin = await bcrypt.hash('123456', 10);

    const usersToSeed = [
      {
        firstname: 'Demo',
        lastname: 'Owner',
        email: 'owner@sueltopos.demo',
        pin: hashedPin,
        isVerified: true,
        isAdmin: true,
        role: 'owner',
        organizationId: orgId,
        branchId,
        station: 'Main Office',
      },
      {
        firstname: 'Demo',
        lastname: 'Manager',
        email: 'manager@sueltopos.demo',
        pin: hashedPin,
        isVerified: true,
        isAdmin: true,
        role: 'manager',
        organizationId: orgId,
        branchId,
        station: 'Manager Terminal',
      },
      {
        firstname: 'Demo',
        lastname: 'Supervisor',
        email: 'supervisor@sueltopos.demo',
        pin: hashedPin,
        isVerified: true,
        isAdmin: false,
        role: 'supervisor',
        organizationId: orgId,
        branchId,
        station: 'Floor Supervisor',
      },
      {
        firstname: 'Demo',
        lastname: 'Cashier',
        email: 'cashier@sueltopos.demo',
        pin: hashedPin,
        isVerified: true,
        isAdmin: false,
        role: 'cashier',
        organizationId: orgId,
        branchId,
        station: 'Register 01',
      },
    ];

    const seededUsers = {};
    for (const u of usersToSeed) {
      const existing = await UserModel.findOne({ email: u.email });
      if (existing) {
        seededUsers[u.role] = existing;
      } else {
        const created = await UserModel.create(u);
        seededUsers[u.role] = created;
      }
    }

    console.log('Seeding demo products (Philippine Retail items in PHP)...');
    const catalogData = [
      {
        name: 'San Miguel Pale Pilsen 330ml Can',
        price: 85.0,
        costPrice: 62.0,
        quantity: 48,
        category: 'beverages',
        barcode: '4800110026027',
        sku: 'BEV-SMB-330C',
        lowStockThreshold: 12,
        image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?q=80&w=200&auto=format&fit=crop',
        organizationId: orgId,
        branchId,
        isActive: true,
      },
      {
        name: 'Coca-Cola Original Taste 330ml Can',
        price: 38.0,
        costPrice: 28.0,
        quantity: 60,
        category: 'beverages',
        barcode: '4800888137359',
        sku: 'BEV-COKE-330',
        lowStockThreshold: 15,
        image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=200&auto=format&fit=crop',
        organizationId: orgId,
        branchId,
        isActive: true,
      },
      {
        name: 'Nature Spring Purified Water 500ml',
        price: 18.0,
        costPrice: 10.0,
        quantity: 80,
        category: 'beverages',
        barcode: '4800118012015',
        sku: 'BEV-WTR-500',
        lowStockThreshold: 20,
        image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?q=80&w=200&auto=format&fit=crop',
        organizationId: orgId,
        branchId,
        isActive: true,
      },
      {
        name: 'Piattos Cheese Flavor 85g',
        price: 42.0,
        costPrice: 30.0,
        quantity: 35,
        category: 'snacks',
        barcode: '4800016644018',
        sku: 'SNK-PIAT-85',
        lowStockThreshold: 10,
        image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?q=80&w=200&auto=format&fit=crop',
        organizationId: orgId,
        branchId,
        isActive: true,
      },
      {
        name: 'Oishi Prawn Crackers Spicy 60g',
        price: 28.0,
        costPrice: 19.0,
        quantity: 40,
        category: 'snacks',
        barcode: '4800194115012',
        sku: 'SNK-OISH-60',
        lowStockThreshold: 10,
        image: 'https://images.unsplash.com/photo-1600952841320-db92ec4047ca?q=80&w=200&auto=format&fit=crop',
        organizationId: orgId,
        branchId,
        isActive: true,
      },
      {
        name: 'Lucky Me Pancit Canton Kalamansi',
        price: 16.0,
        costPrice: 11.5,
        quantity: 90,
        category: 'grocery',
        barcode: '4807770270034',
        sku: 'GRO-LMPC-KAL',
        lowStockThreshold: 25,
        image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?q=80&w=200&auto=format&fit=crop',
        organizationId: orgId,
        branchId,
        isActive: true,
      },
      {
        name: 'Century Tuna Flakes in Oil 155g',
        price: 44.0,
        costPrice: 32.0,
        quantity: 50,
        category: 'grocery',
        barcode: '4800151121016',
        sku: 'GRO-CTNA-155',
        lowStockThreshold: 10,
        image: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?q=80&w=200&auto=format&fit=crop',
        organizationId: orgId,
        branchId,
        isActive: true,
      },
      {
        name: 'Gardenia Classic White Bread 400g',
        price: 68.0,
        costPrice: 50.0,
        quantity: 24,
        category: 'dairy',
        barcode: '4800252110015',
        sku: 'BAK-GARD-400',
        lowStockThreshold: 8,
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=200&auto=format&fit=crop',
        organizationId: orgId,
        branchId,
        isActive: true,
      },
      {
        name: 'Magnolia Fresh Milk 1L Tetra',
        price: 115.0,
        costPrice: 88.0,
        quantity: 20,
        category: 'dairy',
        barcode: '4800110091018',
        sku: 'DRY-MAGM-1L',
        lowStockThreshold: 6,
        image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=200&auto=format&fit=crop',
        organizationId: orgId,
        branchId,
        isActive: true,
      },
      {
        // INTENTIONAL LOW STOCK ITEM to verify alert triggers
        name: 'Kopiko Blanca 3-in-1 Coffee 30g',
        price: 14.0,
        costPrice: 9.5,
        quantity: 3,
        category: 'beverages',
        barcode: '8996001414002',
        sku: 'BEV-KOP-BLA',
        lowStockThreshold: 15,
        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=200&auto=format&fit=crop',
        organizationId: orgId,
        branchId,
        isActive: true,
      },
      {
        // INTENTIONAL OUT OF STOCK ITEM to test out-of-stock guards
        name: 'Red Bull Energy Drink 250ml',
        price: 95.0,
        costPrice: 72.0,
        quantity: 0,
        category: 'beverages',
        barcode: '9002490100070',
        sku: 'BEV-RDB-250',
        lowStockThreshold: 5,
        image: 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?q=80&w=200&auto=format&fit=crop',
        organizationId: orgId,
        branchId,
        isActive: true,
      },
    ];

    const seededProducts = [];
    for (const item of catalogData) {
      const priceCents = Math.round(item.price * 100);
      const costPriceCents = Math.round(item.costPrice * 100);
      const existing = await Product.findOne({ barcode: item.barcode, organizationId: orgId, branchId });
      if (existing) {
        seededProducts.push(existing);
      } else {
        const created = await Product.create({ ...item, priceCents, costPriceCents });
        seededProducts.push(created);
      }
    }

    console.log('Seeding demo suppliers and mapping products...');
    const suppliersData = [
      {
        name: 'San Miguel Brewery Logistics',
        contactEmail: 'orders@smb-logistics.demo',
        contactPhone: '+63 2 8632 3000',
        organizationId: orgId,
        branchId,
        products: seededProducts.filter((p) => p.category === 'beverages').map((p) => p._id),
      },
      {
        name: 'Universal Robina Food Supply',
        contactEmail: 'distribution@urc-supply.demo',
        contactPhone: '+63 2 8633 7631',
        organizationId: orgId,
        branchId,
        products: seededProducts.filter((p) => p.category === 'snacks' || p.category === 'grocery').map((p) => p._id),
      },
    ];

    for (const s of suppliersData) {
      await Supplier.findOneAndUpdate(
        { name: s.name, organizationId: orgId, branchId },
        s,
        { upsert: true, new: true }
      );
    }

    console.log('Seeding demo customers and promotional coupons...');
    const demoCustomers = [
      {
        name: 'Maria Santos',
        phone: '09171234567',
        email: 'maria.santos@demo.internal',
        loyaltyPoints: 120,
        totalSpent: 4500,
        organizationId: orgId,
        branchId,
      },
      {
        name: 'Juan Dela Cruz',
        phone: '09189876543',
        email: 'juan.delacruz@demo.internal',
        loyaltyPoints: 45,
        totalSpent: 1850,
        organizationId: orgId,
        branchId,
      },
    ];

    const seededCustomers = [];
    for (const c of demoCustomers) {
      const cust = await Customer.findOneAndUpdate(
        { phone: c.phone, organizationId: orgId, branchId },
        c,
        { upsert: true, new: true }
      );
      seededCustomers.push(cust);
    }

    const demoCoupons = [
      {
        code: 'WELCOME10',
        discountType: 'percent',
        discountValue: 10,
        isActive: true,
        organizationId: orgId,
        branchId,
      },
      {
        code: 'SAVE50',
        discountType: 'fixed',
        discountValue: 50,
        isActive: true,
        organizationId: orgId,
        branchId,
      },
    ];

    for (const cp of demoCoupons) {
      await Coupon.findOneAndUpdate(
        { code: cp.code, organizationId: orgId, branchId },
        cp,
        { upsert: true, new: true }
      );
    }

    console.log('Configuring active cashier shift for instant test readiness...');
    let activeShift = await Shift.findOne({
      cashierId: seededUsers.cashier._id,
      status: 'Open',
      organizationId: orgId,
      branchId,
    });

    if (!activeShift) {
      activeShift = await Shift.create({
        organizationId: orgId,
        branchId,
        registerId: 'register-01',
        cashierId: seededUsers.cashier._id,
        cashierName: `${seededUsers.cashier.firstname} ${seededUsers.cashier.lastname}`,
        startingCash: 1000,
        status: 'Open',
        startTime: new Date(),
        transactionsCount: 0,
        discrepancy: 0,
      });
    }

    console.log('Seeding historical 7-day transactions for accurate dashboard trends...');
    const now = new Date();
    const demoTransactions = [];
    const paymentMethods = ['Cash', 'GCash/PayMaya', 'Card', 'Split'];

    // Generate sales distributed over the last 7 days
    for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
      const txDate = new Date(now);
      txDate.setDate(now.getDate() - dayOffset);
      txDate.setHours(10 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 59));

      const dailyTxCount = 2 + (dayOffset % 3);
      for (let i = 0; i < dailyTxCount; i++) {
        const item1 = seededProducts[i % seededProducts.length];
        const item2 = seededProducts[(i + 3) % seededProducts.length];
        const qty1 = 1 + (i % 2);
        const qty2 = 1;

        const p1Cents = item1.priceCents || Math.round(item1.price * 100);
        const p2Cents = item2.priceCents || Math.round(item2.price * 100);
        const subtotalCents = p1Cents * qty1 + p2Cents * qty2;
        const discountAmountCents = dayOffset === 1 ? 5000 : 0; // occasional ₱50 coupon
        const totalAmountCents = Math.max(0, subtotalCents - discountAmountCents);

        const method = paymentMethods[(dayOffset + i) % paymentMethods.length];
        const isSplit = method === 'Split';
        const splitCashCents = isSplit ? Math.round(totalAmountCents / 2) : undefined;
        const splitDigitalCents = isSplit ? totalAmountCents - splitCashCents : undefined;

        demoTransactions.push({
          organizationId: orgId,
          branchId,
          registerId: 'register-01',
          userId: seededUsers.cashier._id,
          customerId: seededCustomers[i % seededCustomers.length]._id,
          paymentMethod: method,
          paymentStatus: 'Paid',
          status: 'completed',
          transactionId: `TX-${txDate.getFullYear()}${String(txDate.getMonth() + 1).padStart(2, '0')}${String(txDate.getDate()).padStart(2, '0')}-${uuidv4().slice(0, 6).toUpperCase()}`,
          idempotencyKey: uuidv4(),
          transactionDate: txDate,
          subtotalCents,
          discountAmountCents,
          totalAmountCents,
          amountPaidCents: totalAmountCents,
          balanceDueCents: 0,
          originalAmount: subtotalCents / 100,
          discountAmount: discountAmountCents / 100,
          promoCode: discountAmountCents > 0 ? 'SAVE50' : undefined,
          tenderReference: method !== 'Cash' ? `REF-${Math.floor(100000 + Math.random() * 900000)}` : undefined,
          splitDetails: isSplit ? {
            cashAmount: splitCashCents / 100,
            digitalAmount: splitDigitalCents / 100,
            cashAmountCents: splitCashCents,
            digitalAmountCents: splitDigitalCents,
          } : undefined,
          products: [
            {
              productId: item1._id,
              name: item1.name,
              price: item1.price,
              quantity: qty1,
              totalPrice: (item1.price * qty1),
              unitPriceCents: p1Cents,
              totalPriceCents: p1Cents * qty1,
              netTotalPriceCents: p1Cents * qty1,
              paymentStatus: 'Paid',
              paymentMethod: method,
            },
            {
              productId: item2._id,
              name: item2.name,
              price: item2.price,
              quantity: qty2,
              totalPrice: (item2.price * qty2),
              unitPriceCents: p2Cents,
              totalPriceCents: p2Cents * qty2,
              netTotalPriceCents: p2Cents * qty2 - discountAmountCents,
              paymentStatus: 'Paid',
              paymentMethod: method,
            },
          ],
        });
      }
    }

    // Only insert if no recent transactions exist or if reset was invoked
    const txCount = await Transaction.countDocuments({ organizationId: orgId, branchId });
    if (txCount === 0 || RESET_DATA) {
      await Transaction.insertMany(demoTransactions);
      console.log(`Seeded ${demoTransactions.length} historical transactions across 7 days.`);
    } else {
      console.log(`Skipping transaction insert: ${txCount} transactions already present in database.`);
    }

    console.log('\n======================================================');
    console.log('✅ SUELTO POS DEMO SEEDING COMPLETED SUCCESSFULLY!');
    console.log('======================================================');
    console.log('Authorized Demonstration Logins:');
    console.log('  1. Store Owner:     owner@sueltopos.demo      (PIN: 123456)');
    console.log('  2. Store Manager:   manager@sueltopos.demo    (PIN: 123456)');
    console.log('  3. Shift Cashier:   cashier@sueltopos.demo    (PIN: 123456)');
    console.log('  4. Supervisor:      supervisor@sueltopos.demo (PIN: 123456)');
    console.log('------------------------------------------------------');
    console.log('Live Demo Features Pre-Configured:');
    console.log('  - Active Open Shift on register-01 (ready for instant scan & checkout)');
    console.log('  - Low Stock Alert item: Kopiko Blanca 3-in-1 (3 left / threshold 15)');
    console.log('  - Out of Stock item: Red Bull 250ml (0 left / threshold 5)');
    console.log('  - Active Promo Coupons: WELCOME10 (10% off), SAVE50 (₱50 off)');
    console.log('  - Loyalty Customer Profiles: Maria Santos (120 pts), Juan Dela Cruz');
    console.log('  - Realistic 7-day sales history for Dashboard Trend & Analytics charts');
    console.log('======================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ DEMO SEED FAILED:', error.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
};

runDemoSeed();
