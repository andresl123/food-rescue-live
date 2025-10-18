import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import RequestCodeForm from '../../components/RequestCodeForm'; // The dumb form component
import yourImage from '../../assets/food-rescue-image.png'; // Update path if needed

export default function RequestCodePage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/code/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: email }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'An error occurred.');
      }

      // On success, navigate to the next page and pass the email
      navigate('/createnewpassword', { state: { email: email } });

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container-fluid vh-100 px-5">
      <div className="row h-100 g-0">
        {/* Left section with form */}
        <div className="col-lg-6 d-flex align-items-center justify-content-center bg-light">
          <div className="w-100 mx-3" style={{ maxWidth: "470px" }}>
            <h2 className="text-center fw-bold mb-4" style={{ color: "#000" }}>
              Reset Your Password
            </h2>
            {/* Render the dumb form component and pass props */}
            <RequestCodeForm
              email={email}
              onChange={handleChange}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
            {error && <Alert variant="danger" className="text-center mt-3 small">{error}</Alert>}
          </div>
        </div>
        {/* Right section with image */}
        <div className="col-lg-6 d-none d-lg-flex align-items-center justify-content-center p-4">
          <div className="position-relative w-100 h-100">
            <img
              src={yourImage}
              alt="Food Rescue"
              className="w-100 h-100 object-fit-cover"
              style={{ borderRadius: "30px" }}
            />
            <div className="position-absolute top-50 start-50 translate-middle text-center text-white px-4">
              <h1 className="fw-bold display-4">Forgot Your Password?</h1>
              <p className="fs-5">
                No problem. Enter your email and we'll send you a code to get back into your account.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}