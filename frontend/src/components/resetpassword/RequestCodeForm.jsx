import React, { useState } from 'react';
import { Button, Form, Spinner, Alert, Image } from 'react-bootstrap';

// --- IMPORTANT: Update this path to your actual image! ---
import yourImage from '../../assets/food-rescue-image.png';
import "./RequestCodeForm.css"

function RequestCodeForm({ onEmailSubmitted }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

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
        throw new Error(data.message || 'An error occurred.');
      }

      setMessage('Success! A verification code has been sent to your email.');
      onEmailSubmitted(email);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container-fluid vh-100 bg-light d-flex justify-content-center align-items-center">

      <div className="row g-0 shadow-lg rounded-5 overflow-hidden" style={{ width: '90%', maxWidth: '1000px', height: '85%' }}>

        {/* Left section with the form */}
        <div className="col-lg-6 d-flex align-items-center justify-content-center bg-white rounded-start-5">

          {/* --- THIS IS THE CHANGED LINE --- */}
          {/* Replaced mx-3 (margin) with px-3 (padding) */}
          <div className="w-100 px-3" style={{ maxWidth: "470px" }}>

            <h2 className="text-center fw-bold mb-4" style={{ color: "#000" }}>
              Reset Your Password
            </h2>

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
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
                    {' '}Sending...
                  </>
                ) : (
                  'Send Verification Code'
                )}
              </Button>
            </Form>

            {message && <Alert variant="success" className="text-center mt-3 small">{message}</Alert>}
            {error && <Alert variant="danger" className="text-center mt-3 small">{error}</Alert>}
          </div>
        </div>

        {/* Right section with image */}
        <div className="col-lg-6 d-none d-lg-flex p-0">
            <img
              src={yourImage}
              alt="Food Rescue"
              className="w-100 h-100 object-fit-cover"
            />
        </div>

      </div>
    </div>
  );
}

export default RequestCodeForm;