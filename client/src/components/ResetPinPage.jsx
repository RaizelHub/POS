import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './css/ResetPinPage.module.css'; // Assume your styles are in this CSS file.
import config from '../config';

const ResetPinPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();
  const { token } = useParams();  // Capture the token from URL path parameter

  useEffect(() => {
    if (token) {
      resetPin(token);
    } else {
      setError('Invalid link. Please check your email again.');
      setLoading(false);
    }
  }, [token]);  // Depend on token instead of location

  const resetPin = async (token) => {
    try {
      setLoading(true);
      setError(null); // Reset error state on a new request

      console.log('Attempting to reset PIN with token:', token);

      const res = await fetch(`${config.apiUrl}/api/reset-pin/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();
      console.log('Response:', data); // Debug response

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset the PIN.');
      }

      setSuccessMessage('Your PIN has been successfully reset. Your new PIN is 123456.');

      // Redirect after a short delay
      setTimeout(() => {
        navigate('/login-selection?pinReset=true'); // Redirect to LoginSelectionPage with success parameter
      }, 2000);

    } catch (error) {
      console.error('Error resetting PIN:', error);
      setError(error.message || 'Error occurred while resetting PIN.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2>Resetting Your PIN...</h2>

        {loading && <div className={styles.loader}></div>}
        {error && <p className={styles.errorMessage}>{error}</p>}
        {successMessage && <p className={styles.successMessage}>{successMessage}</p>}

        {successMessage && (
          <button className={styles.redirectButton} onClick={() => navigate('/login-selection')}>
            Go Back to Login Selection
          </button>
        )}
      </div>
    </div>
  );
};

export default ResetPinPage;
