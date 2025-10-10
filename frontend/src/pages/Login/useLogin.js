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

      // Successfully authenticated
      console.log("Authentication successful! Token:", data.token);
      setSuccessMessage('Login Successful! Redirecting...');

      // Pass the user data up to the router/global state
      onLoginSuccess(data.username, data.token);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [username, password, onLoginSuccess]);

  // New function to handle OAuth redirect
  const handleOAuthLogin = useCallback(() => {
    // In a real application, this triggers the Spring Security OAuth flow
    // which results in a redirect to the provider's login page (Google, GitHub, etc.)
    console.log(`Initiating OAuth flow by redirecting to: ${GOOGLE_AUTH_URL}`);
    // window.location.href = GOOGLE_AUTH_URL; // Uncomment this in a real environment

    // For this demonstration, we'll simulate an immediate success after a brief delay
    setSuccessMessage('OAuth redirect simulated. Assuming successful backend return.');
    setTimeout(() => {
        // Mock user details received after a successful OAuth handshake
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
    handleOAuthLogin, // Expose the new OAuth handler
  };
};