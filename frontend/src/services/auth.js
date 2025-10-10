const LOGIN_API_URL = '/api/auth/login'; // Spring Boot traditional endpoint
const GOOGLE_AUTH_URL = '/oauth2/authorization/google'; // Spring Boot OAuth 2.0 Client endpoint

/**
 * Executes the login API call with exponential backoff for retries.
 */
const loginApi = async (username, password) => {
  const credentials = { username, password };
  const MAX_RETRIES = 3;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      // --- START: Mock API Response based on credentials ---
      // Simulate network delay and fetch request
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1) / 2));

      const mockResponse = {
        ok: true,
        status: 200,
        // The real Spring backend would return a JWT token and user details
        json: () => Promise.resolve({ token: 'jwt_token_12345', userId: 'user123', username: username })
      };

      if (username === 'fail@test.com') {
        mockResponse.ok = false;
        mockResponse.status = 401;
        mockResponse.json = () => Promise.resolve({ error: 'Invalid username or password provided by user.' });
      }
      // --- END: Mock API Response ---

      if (!mockResponse.ok) {
        const errorData = await mockResponse.json();
        throw new Error(errorData.error || 'Authentication failed. Please check your credentials.');
      }

      return await mockResponse.json();

    } catch (error) {
      if (attempt === MAX_RETRIES - 1) {
        console.error("Final API Error after retries:", error.message);
        throw error;
      }
      // Retry logic silently handled by loop
    }
  }
};