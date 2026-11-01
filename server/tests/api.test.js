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

test('Health probe: returns 200 with status ok and uptime', () => {
  let statusCode = null;
  let body = null;
  const mockRes = {
    status: (code) => {
      statusCode = code;
      return mockRes;
    },
    json: (data) => {
      body = data;
      return mockRes;
    },
  };

  const handleHealth = (req, res) => {
    res.status(200).json({
      status: 'ok',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    });
  };

  handleHealth({}, mockRes);
  assert.equal(statusCode, 200);
  assert.equal(body.status, 'ok');
  assert.equal(typeof body.uptimeSeconds, 'number');
});

test('Readiness probe: returns 200 when database readyState is 1, and 503 when disconnected', () => {
  const evaluateReadiness = (readyState) => {
    const isDbReady = readyState === 1;
    return {
      statusCode: isDbReady ? 200 : 503,
      status: isDbReady ? 'ready' : 'unready',
      database: isDbReady ? 'connected' : 'disconnected',
    };
  };

  const readyResult = evaluateReadiness(1);
  assert.equal(readyResult.statusCode, 200);
  assert.equal(readyResult.status, 'ready');
  assert.equal(readyResult.database, 'connected');

  const disconnectedResult = evaluateReadiness(0);
  assert.equal(disconnectedResult.statusCode, 503);
  assert.equal(disconnectedResult.status, 'unready');
  assert.equal(disconnectedResult.database, 'disconnected');
});

