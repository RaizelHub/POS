import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { requireRoles } from '../Middleware/authorize.js';

test.after(async () => {
  await mongoose.disconnect();
});

test('requireRoles allows owner or authorized roles', () => {
  const middleware = requireRoles('manager', 'supervisor');

  let passed = false;
  const mockReq = { auth: { role: 'manager', isAdmin: false } };
  const mockRes = {
    status: () => mockRes,
    json: () => mockRes,
  };
  const mockNext = () => { passed = true; };

  middleware(mockReq, mockRes, mockNext);
  assert.equal(passed, true);
});

test('requireRoles permits admin/owner override regardless of role', () => {
  const middleware = requireRoles('manager');

  let passed = false;
  const mockReq = { auth: { role: 'cashier', isAdmin: true } };
  const mockRes = {
    status: () => mockRes,
    json: () => mockRes,
  };
  const mockNext = () => { passed = true; };

  middleware(mockReq, mockRes, mockNext);
  assert.equal(passed, true);
});

test('requireRoles rejects unauthorized role with 403', () => {
  const middleware = requireRoles('owner', 'manager');

  let statusCode = null;
  let responseData = null;
  let passed = false;

  const mockReq = { auth: { role: 'cashier', isAdmin: false } };
  const mockRes = {
    status: (code) => {
      statusCode = code;
      return mockRes;
    },
    json: (data) => {
      responseData = data;
      return mockRes;
    },
  };
  const mockNext = () => { passed = true; };

  middleware(mockReq, mockRes, mockNext);
  assert.equal(passed, false);
  assert.equal(statusCode, 403);
  assert.equal(responseData.message, 'You do not have permission to perform this action.');
});

test('requireRoles handles missing auth context with 500 configuration error', () => {
  const middleware = requireRoles('owner');

  let statusCode = null;
  const mockReq = {}; // No auth attached
  const mockRes = {
    status: (code) => {
      statusCode = code;
      return mockRes;
    },
    json: () => mockRes,
  };

  middleware(mockReq, mockRes, () => {});
  assert.equal(statusCode, 500);
});
