import React, { useState } from 'react';

// This component receives the user's email from the parent component
function ResetPasswordForm({ email }) {
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  // --- 1. ADD NEW STATE ---
  // State to hold the value of the "repeat password" field
  const [repeatPassword, setRepeatPassword] = useState('');

  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage(''); // Clear any previous messages

    // --- 2. ADD VALIDATION LOGIC ---
    // Check if the passwords match before doing anything else
    if (newPassword !== repeatPassword) {
      setMessage('Error: Passwords do not match. Please try again.');
      return; // Stop the function here
    }

    setIsLoading(true);

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
        throw new Error(data.message || 'An error occurred.');
      }

      setMessage('Success! Your password has been reset. You can now log in.');
      // You can also add a redirect to the login page here.

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
        {/* --- 3. ADD NEW INPUT FIELD --- */}
        <input
          type="password"
          value={repeatPassword}
          onChange={(e) => setRepeatPassword(e.target.value)}
          placeholder="Repeat your new password"
          required
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
      {/* This paragraph will now show both API errors and the "passwords don't match" error */}
      {message && <p>{message}</p>}
    </div>
  );
}

export default ResetPasswordForm;