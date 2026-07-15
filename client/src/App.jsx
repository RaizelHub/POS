import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import HomePage from './components/HomePage';
import RegisterPage from './components/RegisterPage';
import AdminLoginPage from './components/AdminLoginPage';
import LoginSelectionPage from './components/LoginSelection';
import VerifyEmailPage from './components/VerifyEmail';
import Dashboard from './components/Dashboard';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ScanPage from './components/ScanPage';
import PaymentPage from './components/PaymentPage';
import ThankYou from './components/ThankYou';
import EditProfile from './components/EditProfile';
import './App.css';
import ResetPinPage from './components/ResetPinPage';

function App() {
  const theme = createTheme({
    palette: {
      primary: {
        main: '#0f766e', // Teal 700
        light: '#14b8a6', // Teal 500
        dark: '#115e59', // Teal 800
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#0f172a', // Slate 900
        light: '#334155',
        dark: '#020617',
        contrastText: '#ffffff',
      },
      success: {
        main: '#10b981', // Emerald 500
        light: '#a7f3d0',
        dark: '#047857',
      },
      error: {
        main: '#ef4444', // Red 500
        light: '#fca5a5',
        dark: '#dc2626',
      },
      background: {
        default: '#f8fafc',
        paper: '#ffffff',
      },
      text: {
        primary: '#0f172a',
        secondary: '#475569',
      },
    },
    typography: {
      fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
      h1: {
        fontSize: '2.25rem',
        fontWeight: 700,
        lineHeight: 1.2,
      },
      h2: {
        fontSize: '1.75rem',
        fontWeight: 700,
        lineHeight: 1.3,
      },
      h3: {
        fontSize: '1.5rem',
        fontWeight: 600,
        lineHeight: 1.3,
      },
      h4: {
        fontSize: '1.25rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h5: {
        fontSize: '1.125rem',
        fontWeight: 500,
        lineHeight: 1.4,
      },
      h6: {
        fontSize: '0.875rem',
        fontWeight: 500,
        lineHeight: 1.4,
      },
      body1: {
        fontSize: '0.875rem',
        lineHeight: 1.5,
      },
      body2: {
        fontSize: '0.75rem',
        lineHeight: 1.5,
      },
      button: {
        textTransform: 'none',
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 10,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '10px 20px',
            textTransform: 'none',
            fontWeight: 600,
            transition: 'background-color .15s ease, border-color .15s ease, box-shadow .15s ease',
          },
          contained: {
            background: '#0f766e',
            color: 'white',
            '&:hover': {
              background: '#0d9488',
            },
          },
          outlined: {
            borderColor: '#0f766e',
            color: '#0f766e',
            '&:hover': {
              backgroundColor: '#0f766e',
              color: 'white',
              borderColor: '#0f766e',
            },
          },
          text: {
            color: '#0f766e',
            '&:hover': {
              backgroundColor: 'rgba(15, 118, 110, 0.08)',
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'scale(1.05)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
            },
          },
        },
      },
    },
  });

  return (
    <Router>
      <ThemeProvider theme={theme}>
        <div className="app-container">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/admin-login" element={<AdminLoginPage />} />
            <Route path="/login-selection" element={<LoginSelectionPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/scan" element={<ScanPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/thank-you" element={<ThankYou />} />
            <Route path='/edit-profile/:id' element={<EditProfile />} />
            <Route path="/dashboard/*" element={<Dashboard />} />
            <Route path="/reset-pin/:token" element={<ResetPinPage />} />
          </Routes>
        </div>
      </ThemeProvider>
    </Router>
  );
}

export default App;



