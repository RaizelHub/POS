import 'dotenv/config';
import mongoose from 'mongoose';

const apply = process.argv.includes('--apply');
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error('MONGODB_URI is required.');

await mongoose.connect(uri);
const db = mongoose.connection.db;

const collections = ['users', 'products', 'transactions', 'shifts', 'customers', 'coupons', 'suppliers', 'draftorders', 'receiptsettings'];
const report = {};
for (const name of collections) {
  const collection = db.collection(name);
  const exists = await collection.countDocuments({}, { limit: 1 });
  if (!exists) continue;
  report[name] = {
    missingOrganization: await collection.countDocuments({ organizationId: { $exists: false } }),
    missingBranch: await collection.countDocuments({ branchId: { $exists: false } }),
  };
}

console.table(report);
if (!apply) {
  console.log('Dry run only. Review the counts, back up the database, then rerun with --apply.');
  await mongoose.disconnect();
  process.exit(0);
}

for (const name of collections) {
  const collection = db.collection(name);
  await collection.updateMany({ organizationId: { $exists: false } }, { $set: { organizationId: 'default' } });
  await collection.updateMany({ branchId: { $exists: false } }, { $set: { branchId: 'main' } });
}
await db.collection('users').updateMany({ isActive: { $exists: false } }, { $set: { isActive: true } });

const products = await db.collection('products').find({
  $or: [{ priceCents: { $exists: false } }, { costPriceCents: { $exists: false } }],
}).project({ price: 1, costPrice: 1 }).toArray();
for (const product of products) {
  await db.collection('products').updateOne(
    { _id: product._id },
    { $set: {
      priceCents: Math.round(Number(product.price || 0) * 100),
      costPriceCents: Math.round(Number(product.costPrice || 0) * 100),
    } }
  );
}

const transactions = await db.collection('transactions').find({
  $or: [
    { totalAmountCents: { $exists: false } },
    { balanceDueCents: { $exists: false } },
    { 'products.netTotalPriceCents': { $exists: false } },
  ],
}).toArray();
for (const transaction of transactions) {
  const subtotalCents = Math.round(Number(transaction.originalAmount || 0) * 100);
  const discountAmountCents = Math.round(Number(transaction.discountAmount || 0) * 100);
  const totalAmountCents = Math.max(0, subtotalCents - discountAmountCents);
  const payLater = transaction.paymentStatus === 'Pay Later';
  let remainingDiscountCents = discountAmountCents;
  const products = (transaction.products || []).map((product, index, allProducts) => {
    const unitPriceCents = product.unitPriceCents ?? Math.round(Number(product.price || 0) * 100);
    const totalPriceCents = product.totalPriceCents ?? unitPriceCents * Number(product.quantity || 0);
    const proportional = subtotalCents
      ? Math.floor((discountAmountCents * totalPriceCents) / subtotalCents)
      : 0;
    const allocated = index === allProducts.length - 1
      ? remainingDiscountCents
      : Math.min(remainingDiscountCents, proportional);
    remainingDiscountCents -= allocated;
    return {
      ...product,
      unitPriceCents,
      totalPriceCents,
      discountAllocationCents: product.discountAllocationCents ?? allocated,
      netTotalPriceCents: product.netTotalPriceCents ?? (totalPriceCents - allocated),
      returnedQuantity: product.returnedQuantity || 0,
      refundedAmountCents: product.refundedAmountCents || 0,
    };
  });
  await db.collection('transactions').updateOne(
    { _id: transaction._id },
    { $set: {
      subtotalCents,
      discountAmountCents,
      totalAmountCents,
      amountPaidCents: payLater ? 0 : totalAmountCents,
      balanceDueCents: payLater ? totalAmountCents : 0,
      refundTotalCents: transaction.refundTotalCents || 0,
      products,
    } }
  );
}

for (const [collectionName, indexNames] of Object.entries({
  products: ['barcode_1', 'sku_1'],
  coupons: ['code_1'],
  suppliers: ['email_1'],
})) {
  const collection = db.collection(collectionName);
  const existing = new Set((await collection.indexes()).map((index) => index.name));
  for (const indexName of indexNames) {
    if (existing.has(indexName)) await collection.dropIndex(indexName);
  }
}

console.log('POS foundation migration completed.');
await mongoose.disconnect();
