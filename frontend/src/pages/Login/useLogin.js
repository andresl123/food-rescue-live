import React, { useState, useCallback } from 'react';
import { loginApi, GOOGLE_AUTH_URL } from '../../services/auth.js';

const useLogin = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('user@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleLogin = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const data = await loginApi(username, password);

      console.log("Authentication successful! Token:", data.token);
      setSuccessMessage('Login Successful! Redirecting...');

      onLoginSuccess(data.username, data.token);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [username, password, onLoginSuccess]);

  const handleOAuthLogin = useCallback(() => {
    console.log(`Initiating OAuth flow by redirecting to: ${GOOGLE_AUTH_URL}`);
    setSuccessMessage('OAuth redirect simulated. Assuming successful backend return.');

    setTimeout(() => {
        onLoginSuccess('OAuth User', 'oauth_token_12345');
    }, 1500);

  }, [onLoginSuccess]);

  return {
    username,
    setUsername,
    password,
    setPassword,
    loading,
    error,
    successMessage,
    handleLogin,
    handleOAuthLogin,
  };
};

export default useLogin;