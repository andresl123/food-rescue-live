import React, { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Button, Form, Spinner, Alert } from 'react-bootstrap';

// IMPORTANT: Update this path to your actual image!
import yourImage from '../../assets/food-rescue-image.png';
// IMPORTANT: Update this to your CSS file if you have one
import "./ResetPasswordForm.css";

function ResetPasswordForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email; // Read the email from the previous route

  // State management from your functionality example
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // handleSubmit logic adapted from your functionality example
  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    // Check if passwords match before making the API call
    if (newPassword !== repeatPassword) {
      setError('Error: Passwords do not match. Please try again.');
      setIsLoading(false);
      return; // Stop the function here
    }

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

      setMessage('Success! Your password has been reset.');
      // After a short delay, redirect to the login page
      setTimeout(() => {
        navigate('/login'); // Assuming you have a /login route
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // If someone lands on this page without an email, redirect them
  if (!email) {
    return <Navigate to="/resetpassword" />;
  }

  // The JSX structure and styling is from your design template
  return (
    <div className="container-fluid vh-100 px-5">
      <div className="row h-100 g-0">

        {/* --- Left section with the new form --- */}
        <div className="col-lg-6 d-flex align-items-center justify-content-center bg-light">
          <div className="w-100 mx-3" style={{ maxWidth: "470px" }}>
            <h2 className="text-center fw-bold mb-4" style={{ color: "#000" }}>
              Create New Password
            </h2>
            <p className="text-center text-muted mb-4">
              A verification code was sent to {email}.
            </p>

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Control
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="6-digit code from email"
                  required
                  style={{ borderRadius: "15px", padding: "10px" }}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Control
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  required
                  style={{ borderRadius: "15px", padding: "10px" }}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Control
                  type="password"
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  placeholder="Repeat your new password"
                  required
                  style={{ borderRadius: "15px", padding: "10px" }}
                />
              </Form.Group>

              <Button
                type="submit"
                className="btn btn-dark w-100 py-2 fw-semibold"
                style={{ borderRadius: "15px" }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                    {' '}Resetting...
                  </>
                ) : (
                  'Set New Password'
                )}
              </Button>
            </Form>

            {message && <Alert variant="success" className="text-center mt-3 small">{message}</Alert>}
            {error && <Alert variant="danger" className="text-center mt-3 small">{error}</Alert>}
          </div>
        </div>

        {/* --- Right section with image --- */}
        <div className="col-lg-6 d-none d-lg-flex align-items-center justify-content-center p-4">
          <div className="position-relative w-100 h-100">
            <img
              src={yourImage}
              alt="Food Rescue"
              className="w-100 h-100 object-fit-cover"
              style={{ borderRadius: "30px" }}
            />
            <div className="position-absolute top-50 start-50 translate-middle text-center text-white px-4">
              <h1 className="fw-bold display-4">FoodRescue</h1>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ResetPasswordForm;