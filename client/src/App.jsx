import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import './App.css';
import { jwtDecode } from 'jwt-decode';

const RegisterPage = lazy(() => import('./components/RegisterPage'));
const AdminLoginPage = lazy(() => import('./components/AdminLoginPage'));
const LoginSelectionPage = lazy(() => import('./components/LoginSelection'));
const VerifyEmailPage = lazy(() => import('./components/VerifyEmail'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const ScanPage = lazy(() => import('./components/ScanPage'));
const PaymentPage = lazy(() => import('./components/PaymentPage'));
const ThankYou = lazy(() => import('./components/ThankYou'));
const EditProfile = lazy(() => import('./components/EditProfile'));
const ResetPinPage = lazy(() => import('./components/ResetPinPage'));

const ManagerRegistrationRoute = () => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/admin-login" replace />;
  try {
    const decoded = jwtDecode(token);
    const role = decoded.isAdmin ? 'owner' : decoded.role;
    if (decoded.exp * 1000 <= Date.now() || !['owner', 'manager'].includes(role)) {
      return <Navigate to="/admin-login" replace />;
    }
    return <RegisterPage />;
  } catch {
    return <Navigate to="/admin-login" replace />;
  }
};

function App() {
  const theme = createTheme({
    palette: {
      primary: {
        main: '#059669', // Emerald 600
        light: '#10b981', // Emerald 500
        dark: '#047857', // Emerald 700
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
        light: '#ecfdf5',
        dark: '#047857',
      },
      error: {
        main: '#f43f5e', // Rose 500
        light: '#fff1f2',
        dark: '#e11d48',
      },
      warning: {
        main: '#f59e0b', // Amber 500
        light: '#fef3c7',
        dark: '#d97706',
      },
      info: {
        main: '#0ea5e9', // Sky 500
        light: '#f0f9ff',
        dark: '#0284c7',
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
            background: '#059669',
            color: 'white',
            '&:hover': {
              background: '#047857',
            },
          },
          outlined: {
            borderColor: '#059669',
            color: '#059669',
            '&:hover': {
              backgroundColor: '#059669',
              color: 'white',
              borderColor: '#059669',
            },
          },
          text: {
            color: '#059669',
            '&:hover': {
              backgroundColor: 'rgba(5, 150, 105, 0.08)',
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            transition: 'background-color .15s ease, color .15s ease',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#cbd5e1',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#059669',
                borderWidth: '2px',
              },
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 12,
            border: '1px solid #e2e8f0',
            boxShadow: '0 18px 50px rgba(15, 23, 42, 0.16)',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            backgroundColor: '#f8fafc',
            color: '#475569',
            fontSize: '0.6875rem',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          },
          root: {
            borderColor: '#e2e8f0',
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            height: 2,
            backgroundColor: '#059669',
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            minHeight: 44,
            textTransform: 'none',
            fontWeight: 600,
          },
        },
      },
    },
  });

  return (
    <Router>
      <ThemeProvider theme={theme}>
        <div className="app-container">
          <Suspense fallback={<div className="min-h-screen grid place-items-center bg-slate-50 text-sm text-slate-500">Loading workspace…</div>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<ManagerRegistrationRoute />} />
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
          </Suspense>
        </div>
      </ThemeProvider>
    </Router>
  );
}

export default App;
