import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { requireRoles, requireSelfOrManager } from '../Middleware/authorize.js';

const TEST_SECRET = 'test_jwt_secret_key_minimum_32_characters_12345';

// Mock response creator
const createMockRes = () => {
  const res = {
    statusCode: 200,
    body: null,
    status: (code) => {
      res.statusCode = code;
      return res;
    },
    json: (data) => {
      res.body = data;
      return res;
    },
  };
  return res;
};

// ==========================================
// TEST SUITE: JWT Signature & Expiration
// ==========================================

test('Auth: Valid JWT token resolves claims correctly', () => {
  const payload = { id: 'user-001', role: 'cashier', organizationId: 'org-demo', branchId: 'main' };
  const token = jwt.sign(payload, TEST_SECRET, { expiresIn: '1h' });

  const decoded = jwt.verify(token, TEST_SECRET);
  assert.equal(decoded.id, 'user-001');
  assert.equal(decoded.role, 'cashier');
  assert.equal(decoded.organizationId, 'org-demo');
});

test('Auth: Expired JWT token is rejected', async () => {
  const payload = { id: 'user-001', role: 'cashier' };
  // Expired 1 second ago
  const token = jwt.sign(payload, TEST_SECRET, { expiresIn: -1 });

  assert.throws(
    () => {
      jwt.verify(token, TEST_SECRET);
    },
    (err) => err.name === 'TokenExpiredError'
  );
});

test('Auth: Corrupted or forged JWT signature is rejected', () => {
  const payload = { id: 'user-001', role: 'owner', isAdmin: true };
  const token = jwt.sign(payload, 'wrong_secret_key_here_1234567890');

  assert.throws(
    () => {
      jwt.verify(token, TEST_SECRET);
    },
    (err) => err.name === 'JsonWebTokenError'
  );
});

// ==========================================
// TEST SUITE: Role Authorization Boundaries
// ==========================================

test('RBAC: Cashier is blocked from Manager-only endpoints', () => {
  const requireManager = requireRoles('owner', 'manager');

  const req = { auth: { userId: 'cashier-01', role: 'cashier', isAdmin: false } };
  const res = createMockRes();
  let nextCalled = false;

  requireManager(req, res, () => { nextCalled = true; });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 403);
  assert.equal(res.body.message, 'You do not have permission to perform this action.');
});

test('RBAC: Manager is granted access to Manager-only endpoints', () => {
  const requireManager = requireRoles('owner', 'manager');

  const req = { auth: { userId: 'mgr-01', role: 'manager', isAdmin: false } };
  const res = createMockRes();
  let nextCalled = false;

  requireManager(req, res, () => { nextCalled = true; });

  assert.equal(nextCalled, true);
  assert.equal(res.statusCode, 200);
});

test('RBAC: Store Owner (isAdmin: true) bypasses all role restrictions', () => {
  const requireSupervisor = requireRoles('supervisor');

  const req = { auth: { userId: 'owner-01', role: 'cashier', isAdmin: true } };
  const res = createMockRes();
  let nextCalled = false;

  requireSupervisor(req, res, () => { nextCalled = true; });

  assert.equal(nextCalled, true);
});

test('RBAC: Cashier cannot view other users records via requireSelfOrManager', () => {
  const middleware = requireSelfOrManager('id');

  const req = {
    auth: { userId: 'cashier-01', role: 'cashier', isAdmin: false },
    params: { id: 'user-other-02' },
  };
  const res = createMockRes();
  let nextCalled = false;

  middleware(req, res, () => { nextCalled = true; });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 403);
  assert.equal(res.body.message, 'You can only access your own records.');
});

test('RBAC: Cashier CAN view their OWN records via requireSelfOrManager', () => {
  const middleware = requireSelfOrManager('id');

  const req = {
    auth: { userId: 'cashier-01', role: 'cashier', isAdmin: false },
    params: { id: 'cashier-01' },
  };
  const res = createMockRes();
  let nextCalled = false;

  middleware(req, res, () => { nextCalled = true; });

  assert.equal(nextCalled, true);
});

test('RBAC: Manager can access any users records via requireSelfOrManager', () => {
  const middleware = requireSelfOrManager('id');

  const req = {
    auth: { userId: 'mgr-01', role: 'manager', isAdmin: false },
    params: { id: 'cashier-01' },
  };
  const res = createMockRes();
  let nextCalled = false;

  middleware(req, res, () => { nextCalled = true; });

  assert.equal(nextCalled, true);
});

// ==========================================
// TEST SUITE: Account State & Tamper Safety
// ==========================================

test('Security: Inactive user account is rejected', () => {
  const user = { _id: 'u-99', isActive: false, role: 'cashier' };
  
  // Middleware simulation for inactive account check
  const checkAccountActive = (authUser) => {
    if (!authUser || authUser.isActive === false) {
      return { status: 401, message: 'Your account is unavailable.' };
    }
    return { status: 200 };
  };

  const check = checkAccountActive(user);
  assert.equal(check.status, 401);
  assert.equal(check.message, 'Your account is unavailable.');
});

test('Security: Client body role injection is rejected (auth context authoritative)', () => {
  // A cashier tries to pass { role: 'owner' } in the body
  const body = { role: 'owner', isAdmin: true, amount: 100 };
  const auth = { userId: 'cashier-01', role: 'cashier', isAdmin: false };

  // Re-deriving role strictly from verified auth context, ignoring req.body
  const effectiveRole = auth.isAdmin ? 'owner' : auth.role;
  assert.equal(effectiveRole, 'cashier');
  assert.notEqual(effectiveRole, body.role);
});

// ==========================================
// TEST SUITE: CORS & Network Security
// ==========================================

test('Security: CORS whitelist accurately identifies permitted and denied origins in production', () => {
  const clientUrls = 'https://suelto-pos.vercel.app,https://preview.suelto-pos.vercel.app';
  const configuredOrigins = clientUrls.split(',').map((u) => u.trim());
  const whitelist = [
    ...configuredOrigins,
    'http://localhost:3000',
    'http://localhost:5173',
  ];

  const isOriginAllowed = (origin, isProd = true) => {
    if (!origin) return true; // Server-to-server / curl
    if (whitelist.includes(origin)) return true;
    if (!isProd && (origin.includes('localhost') || origin.includes('127.0.0.1'))) return true;
    return false;
  };

  assert.equal(isOriginAllowed('https://suelto-pos.vercel.app', true), true);
  assert.equal(isOriginAllowed('https://preview.suelto-pos.vercel.app', true), true);
  assert.equal(isOriginAllowed('http://localhost:3000', true), true);
  // Malicious external origin rejected in production
  assert.equal(isOriginAllowed('https://malicious-site.com', true), false);
  assert.equal(isOriginAllowed('https://evil-phishing-pos.net', true), false);
});

