import React, { useState } from 'react';

// This component would receive the user's email from the parent component
function ResetPasswordForm({ email }) {
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage('');

    // Construct the URL with the email and code as path variables
    const url = `http://localhost:8080/api/password/reset/${email}/${code}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPassword: newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle errors (e.g., 400 Invalid Code)
        throw new Error(data.message || 'An error occurred.');
      }

      setMessage('Success! Your password has been reset. You can now log in.');
      // Here you would typically redirect the user to the login page.

    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Create a New Password</h2>
      <p>A code was sent to {email}.</p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="6-digit code from email"
          required
        />
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Enter your new password"
          required
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default ResetPasswordForm;