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
        main: '#059669',
        light: '#34d399',
        dark: '#047857',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#0f172a',
        light: '#334155',
        dark: '#020617',
        contrastText: '#ffffff',
      },
      success: {
        main: '#059669',
        light: '#34d399',
        dark: '#059669',
      },
      error: {
        main: '#e11d48',
        light: '#f87171',
        dark: '#dc2626',
      },
      background: {
        default: '#f8fafc',
        paper: '#ffffff',
      },
      text: {
        primary: '#1e293b',
        secondary: '#64748b',
      },
    },
    typography: {
      fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
      h1: {
        fontSize: '2.5rem',
        fontWeight: 600,
        lineHeight: 1.2,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 600,
        lineHeight: 1.3,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 600,
        lineHeight: 1.3,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 500,
        lineHeight: 1.4,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 500,
        lineHeight: 1.4,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 500,
        lineHeight: 1.4,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.5,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.5,
      },
      button: {
        textTransform: 'none',
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            padding: '12px 24px',
            textTransform: 'none',
            fontWeight: 600,
            transition: 'background-color .15s ease, border-color .15s ease, box-shadow .15s ease',
          },
          contained: {
            background: '#059669',
            color: 'white',
            '&:hover': {
              background: '#047857',
            },
          },
          outlined: {
            borderColor: '#059669',
            color: '#047857',
            '&:hover': {
              backgroundColor: '#059669',
              color: 'white',
            },
          },
          text: {
            color: '#1a2a6c',
            '&:hover': {
              backgroundColor: 'rgba(26, 42, 108, 0.1)',
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
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



