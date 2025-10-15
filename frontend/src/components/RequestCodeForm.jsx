import React, { useState } from 'react';

function RequestCodeForm({ onEmailSubmitted }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:8080/api/code/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier: email }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle errors from the backend (e.g., 404 User Not Found)
        throw new Error(data.message || 'An error occurred.');
      }

      setMessage('Success! A verification code has been sent to your email.');
      // A callback to the parent component to switch to the next page
      // and pass the email along.
      onEmailSubmitted(email);

    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Reset Your Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send Verification Code'}
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default RequestCodeForm;