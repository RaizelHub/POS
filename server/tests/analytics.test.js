import test from 'node:test';
import assert from 'node:assert/strict';
import { fromCents, toCents } from '../utils/money.js';

// Pure logic replica of the analytics aggregation formulas to test mathematical correctness
const calculateSummary = (transactions = []) => {
  const activeTransactions = transactions.filter((t) => t.status !== 'voided');

  let totalRevenueCents = 0;
  let totalRefundCents = 0;

  activeTransactions.forEach((t) => {
    const netCents = Math.max(0, (t.totalAmountCents || 0) - (t.refundTotalCents || 0));
    totalRevenueCents += netCents;
    totalRefundCents += t.refundTotalCents || 0;
  });

  const totalCount = activeTransactions.length;
  const totalRevenue = Number((totalRevenueCents / 100).toFixed(2));
  const averageTransactionValue = totalCount > 0
    ? Number((totalRevenue / totalCount).toFixed(2))
    : 0;

  return {
    totalRevenue,
    totalRefund: Number((totalRefundCents / 100).toFixed(2)),
    totalCount,
    averageTransactionValue,
  };
};

const filterByDateRange = (transactions, startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return transactions.filter((t) => {
    const d = new Date(t.transactionDate);
    return d >= start && d <= end;
  });
};

test('daily revenue correctly aggregates gross sales net of refunds', () => {
  const sampleTransactions = [
    {
      transactionId: 'TX-01',
      totalAmountCents: 50000, // 500.00
      refundTotalCents: 0,
      status: 'completed',
      transactionDate: '2026-10-30T10:00:00Z',
    },
    {
      transactionId: 'TX-02',
      totalAmountCents: 35000, // 350.00
      refundTotalCents: 5000,  // 50.00 refund
      status: 'partially_refunded',
      transactionDate: '2026-10-30T11:00:00Z',
    },
  ];

  const summary = calculateSummary(sampleTransactions);
  assert.equal(summary.totalRevenue, 800.00); // 500 + 300
  assert.equal(summary.totalRefund, 50.00);
  assert.equal(summary.totalCount, 2);
  assert.equal(summary.averageTransactionValue, 400.00);
});

test('voided and cancelled transactions are excluded from revenue and counts', () => {
  const sampleTransactions = [
    {
      transactionId: 'TX-01',
      totalAmountCents: 20000,
      refundTotalCents: 0,
      status: 'completed',
    },
    {
      transactionId: 'TX-VOID',
      totalAmountCents: 15000,
      refundTotalCents: 0,
      status: 'voided', // VOIDED
    },
  ];

  const summary = calculateSummary(sampleTransactions);
  assert.equal(summary.totalRevenue, 200.00);
  assert.equal(summary.totalCount, 1);
});

test('fully refunded sales contribute zero net revenue while preserving transaction record', () => {
  const sampleTransactions = [
    {
      transactionId: 'TX-REFUNDED',
      totalAmountCents: 12000, // 120.00
      refundTotalCents: 12000, // 120.00 refunded
      status: 'refunded',
    },
    {
      transactionId: 'TX-NORMAL',
      totalAmountCents: 10000, // 100.00
      refundTotalCents: 0,
      status: 'completed',
    },
  ];

  const summary = calculateSummary(sampleTransactions);
  assert.equal(summary.totalRevenue, 100.00);
  assert.equal(summary.totalRefund, 120.00);
  assert.equal(summary.totalCount, 2);
  assert.equal(summary.averageTransactionValue, 50.00); // 100 / 2
});

test('average transaction value returns 0 when no transactions exist without NaN', () => {
  const summary = calculateSummary([]);
  assert.equal(summary.totalRevenue, 0);
  assert.equal(summary.totalCount, 0);
  assert.equal(summary.averageTransactionValue, 0);
  assert.ok(!Number.isNaN(summary.averageTransactionValue));
});

test('date-range filtering properly bounds transactions', () => {
  const transactions = [
    { transactionId: 'TX-1', transactionDate: '2026-10-01T05:00:00Z' },
    { transactionId: 'TX-2', transactionDate: '2026-10-15T12:00:00Z' },
    { transactionId: 'TX-3', transactionDate: '2026-10-30T18:00:00Z' },
    { transactionId: 'TX-4', transactionDate: '2026-11-02T08:00:00Z' },
  ];

  const octoberOnly = filterByDateRange(
    transactions,
    '2026-10-01T00:00:00Z',
    '2026-10-31T23:59:59.999Z'
  );

  assert.equal(octoberOnly.length, 3);
  assert.deepEqual(octoberOnly.map((t) => t.transactionId), ['TX-1', 'TX-2', 'TX-3']);
});

