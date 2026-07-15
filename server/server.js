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
import session from 'express-session';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
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
import fs from 'fs';
import jwt from 'jsonwebtoken';

const app = express();
dotenvSafe.config({
  example: ".env.example",
  allowEmptyValues: true
});
// Keep original dotenv for backward compatibility
dotenv.config();
app.use(express.json());
// Security middlewares
app.use(helmet());
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);
app.use(bodyParser.json());
app.use(cookieParser());
connectDB();

const port = process.env.PORT || 8000;

// More flexible CORS configuration with function to check origin
const whitelist = [
    process.env.CLIENT_URL,
    'http://localhost:3000',
    'http://localhost:3454'
];

const corsOptions = {
    origin: function (origin, callback) {
        console.log('Request origin:', origin);

        // Allow requests with no origin (like mobile apps, curl requests)
        if (!origin) {
            console.log('Allowing request with no origin');
            return callback(null, true);
        }

        // Check if origin is in whitelist
        if (whitelist.indexOf(origin) !== -1) {
            console.log('Origin in whitelist:', origin);
            return callback(null, true);
        }

        // Allow localhost in development (any port)
        if (origin && origin.includes('localhost')) {
            console.log('Allowing localhost:', origin);
            return callback(null, true);
        }

        // In development, allow all origins
        if (process.env.NODE_ENV !== 'production') {
            console.log('Allowing all origins in development mode');
            return callback(null, true);
        }

        console.log('Blocking origin by CORS:', origin);
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
    maxAge: 86400 // 24 hours
}
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Use express-session for session handling
app.use(session({
    secret: process.env.SESSION_SECRET || 'default_secret', // Make sure this is set in .env
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production',  // Set to true in production for HTTPS
        httpOnly: true,
    },
}));

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

// Test endpoint for CORS
app.get('/api/cors-test', (req, res) => {
    res.json({
        message: 'CORS is working!',
        origin: req.headers.origin || 'No origin header',
        timestamp: new Date().toISOString()
    });
});

// API routes
app.use('/api', userRoutes);
app.use('/api', adminRoutes);
app.use('/api', productRoutes)
app.use('/api', salesRoutes)
app.use('/api/transactions', transactionRoutes);
app.use('/api/', receipt);
app.use('/api', draftOrderRoutes);
app.use('/api', couponRoutes);
app.use('/api', shiftRoutes);
app.use('/api', customerRoutes);
app.use('/api', analyticsRoutes);
app.use('/api', supplierRoutes);


// Global error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err.stack);

    // Check if the error is a CORS error
    if (err.message && err.message.includes('CORS')) {
        console.error('CORS Error:', err.message);
        return res.status(403).json({
            message: "CORS error: Origin not allowed",
            error: err.message
        });
    }

    // For other errors, send a generic message
    res.status(500).json({
        message: "Server error. Please try again later.",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });

    // Continue to other error handlers if any
    if (next) next(err);
});

app.listen(port, () => {
    console.log(`Connected to PORT ${port}`);
});
