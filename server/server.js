import './polyfills.js';
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenvSafe from "dotenv-safe";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from './Routes/userRoutes.js';
import connectDB from './db.js';
import path from 'path';
import { fileURLToPath } from 'url';
import adminRoutes from './Routes/adminRoutes.js';
import productRoutes from './Routes/productRoute.js'
import salesRoutes from './Routes/salesRoutes.js'
import transactionRoutes from "./Routes/transcationRoutes.js";
import receipt from './Routes/receiptRoutes.js'
import draftOrderRoutes from './Routes/draftOrderRoutes.js';
import couponRoutes from './Routes/couponRoutes.js';
import shiftRoutes from './Routes/shiftRoutes.js';
import customerRoutes from './Routes/customerRoutes.js';
import analyticsRoutes from './Routes/analyticsRoutes.js';
import supplierRoutes from './Routes/supplierRoutes.js';
import inventoryRoutes from './Routes/inventoryRoutes.js';
import returnRoutes from './Routes/returnRoutes.js';
import reportRoutes from './Routes/reportRoutes.js';
import auditRoutes from './Routes/auditRoutes.js';
import fs from 'fs';

const app = express();
dotenvSafe.config({
  example: ".env.example",
  allowEmptyValues: true
});
// Keep original dotenv for backward compatibility
dotenv.config();
const port = process.env.PORT || 8000;

// Flexible CORS configuration (supports comma-separated CLIENT_URL)
const configuredOrigins = (process.env.CLIENT_URL || '')
    .split(',')
    .map(url => url.trim().replace(/\/$/, ''))
    .filter(Boolean);

const whitelist = [
    ...configuredOrigins,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://localhost:3454',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3454'
].filter(Boolean);

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        const cleanOrigin = origin.trim().replace(/\/$/, '');
        if (whitelist.indexOf(cleanOrigin) !== -1) {
            return callback(null, true);
        }
        if (cleanOrigin.includes('localhost') || cleanOrigin.includes('127.0.0.1')) {
            return callback(null, true);
        }
        if (process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }
        return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Idempotency-Key'],
    exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
    maxAge: 86400
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());

// Security middlewares with cross-origin resource policy allowed for dev
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
}));

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 300, // limit each IP to 300 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// Serve static files (e.g., images)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/products', express.static(path.join(__dirname, 'products')));


const uploadDir = path.join(__dirname, 'ads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API routes
app.use('/api', userRoutes);
app.use('/api', adminRoutes);
app.use('/api', productRoutes);
app.use('/api', salesRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/', receipt);
app.use('/api', draftOrderRoutes);
app.use('/api', couponRoutes);
app.use('/api', shiftRoutes);
app.use('/api', customerRoutes);
app.use('/api', analyticsRoutes);
app.use('/api', supplierRoutes);
app.use('/api', inventoryRoutes);
app.use('/api', returnRoutes);
app.use('/api', reportRoutes);
app.use('/api', auditRoutes);

// Unhandled API 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({
    message: `API endpoint ${req.method} ${req.originalUrl} not found.`,
    code: 'NOT_FOUND',
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);

  // Check if the error is a CORS error
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      message: 'CORS error: Origin not allowed',
      code: 'CORS_ERROR',
      error: err.message,
    });
  }

  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Server error. Please try again later.',
    code: err.code || (statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'REQUEST_FAILED'),
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

let server;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(port, () => {
    console.log(`Connected to PORT ${port}`);
  });
}

// Graceful shutdown handling for containerless PaaS deployments (Render, Railway, VPS)
const handleGracefulShutdown = (signal) => {
  console.log(`Received ${signal}. Starting graceful shutdown...`);
  if (!server) {
    process.exit(0);
    return;
  }
  server.close(async () => {
    console.log('HTTP server closed.');
    try {
      const mongoose = (await import('mongoose')).default;
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
        console.log('MongoDB connection closed.');
      }
      process.exit(0);
    } catch (err) {
      console.error('Error during graceful shutdown:', err);
      process.exit(1);
    }
  });

  // Force shutdown if cleanup hangs past 10 seconds
  setTimeout(() => {
    console.error('Graceful shutdown timed out. Forcing process exit.');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

export { app, server };
export default app;
