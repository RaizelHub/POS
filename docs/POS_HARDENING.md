# SUELTO POS hardening and rollout

## Before deployment

1. Back up the MongoDB database.
2. Rotate every credential that was ever committed or shared, including MongoDB, JWT, email, Google OAuth/Drive, and Cloudinary credentials. Updating `.env.example` does not revoke an exposed secret.
3. Put new secrets only in `server/.env` or the deployment secret manager. `.env` files are now ignored by Git.
4. Use a MongoDB replica set (Atlas qualifies). Atomic checkout, returns, voids, and credit payments use database transactions.
5. Run the migration as a dry run:

   ```powershell
   cd server
   npm run migrate:pos-foundation
   ```

6. Review the counts and database backup, then apply:

   ```powershell
   npm run migrate:pos-foundation -- --apply
   ```

7. Start the server once so Mongoose creates the new compound organization/branch indexes. Inspect index creation before serving traffic.

## Operational behavior

- Checkout requires authentication, an open cashier shift, and an `Idempotency-Key`.
- Product prices and discounts are calculated on the server in integer cents.
- Stock changes once, in the same database transaction as the sale.
- Manual discounts require supervisor, manager, or owner authority and cannot stack with coupons.
- Returns and voids restore inventory and create inventory and audit records.
- Credit payments require an active receiving shift and create their own payment ledger record.
- Manager routes are branch-scoped. Registration is manager-only.
- PIN reset tokens are random, hashed, expiring, and single-use.

## Recommended release check

Run:

```powershell
cd server
npm test
node --check server.js
cd ..\client
node node_modules\vite\bin\vite.js build
```

Test one cash sale, digital sale with reference, split tender, credit sale/payment, partial return, full void, cash-in/out, and shift reconciliation in a staging database before production rollout.
