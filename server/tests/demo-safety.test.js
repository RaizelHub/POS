import test from 'node:test';
import assert from 'node:assert/strict';

// Logic replica of the guard in server/scripts/seed-demo.js
const verifySafeEnvironment = ({ uri, nodeEnv, allowDemoSeed, allowInProd }) => {
  if (!uri) {
    throw new Error('No MongoDB URI found.');
  }

  if (nodeEnv === 'production' && allowInProd !== 'CONFIRM') {
    throw new Error('BLOCKED: Seeding demo data in NODE_ENV=production is disallowed.');
  }

  const lowerUri = uri.toLowerCase();
  const isSuspiciousProd = lowerUri.includes('prod') || lowerUri.includes('production') || lowerUri.includes('live-pos');
  if (isSuspiciousProd && allowInProd !== 'CONFIRM') {
    throw new Error(`BLOCKED: The database target appears to be a production environment.`);
  }

  if (!allowDemoSeed) {
    throw new Error('BLOCKED: Demo seeding requires ALLOW_DEMO_SEED=true or --demo flag.');
  }

  return true;
};

test('Demo Seeder: Allows seeding in development on demo database', () => {
  const result = verifySafeEnvironment({
    uri: 'mongodb://localhost:27017/pos_demo?replicaSet=rs0',
    nodeEnv: 'development',
    allowDemoSeed: true,
  });
  assert.equal(result, true);
});

test('Demo Seeder: Blocks execution if NODE_ENV=production without explicit CONFIRM', () => {
  assert.throws(
    () => {
      verifySafeEnvironment({
        uri: 'mongodb://localhost:27017/pos_demo',
        nodeEnv: 'production',
        allowDemoSeed: true,
      });
    },
    (err) => err.message.includes('BLOCKED: Seeding demo data in NODE_ENV=production is disallowed.')
  );
});

test('Demo Seeder: Blocks execution if URI contains production database name', () => {
  assert.throws(
    () => {
      verifySafeEnvironment({
        uri: 'mongodb+srv://user:pass@cluster0.net/pos_production_main',
        nodeEnv: 'development',
        allowDemoSeed: true,
      });
    },
    (err) => err.message.includes('BLOCKED: The database target appears to be a production environment.')
  );
});

test('Demo Seeder: Blocks execution if ALLOW_DEMO_SEED is false or missing', () => {
  assert.throws(
    () => {
      verifySafeEnvironment({
        uri: 'mongodb://localhost:27017/pos_demo',
        nodeEnv: 'development',
        allowDemoSeed: false,
      });
    },
    (err) => err.message.includes('BLOCKED: Demo seeding requires ALLOW_DEMO_SEED=true')
  );
});

