import React, { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import ResetPasswordForm from '../../components/ResetPasswordForm'; // The dumb form component
import yourImage from '../../assets/food-rescue-image.png'; // Update path if needed

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [formData, setFormData] = useState({
    code: '',
    newPassword: '',
    repeatPassword: '',
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    if (formData.newPassword !== formData.repeatPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    const url = `/api/password/reset/${email}/${formData.code}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: formData.newPassword }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'An error occurred.');
      }

      setMessage('Success! Your password has been reset.');
      setTimeout(() => navigate('/authentication'), 2000); // Navigate to login after success

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) {
    return <Navigate to="/resetpassword" />;
  }

  return (
    <div className="container-fluid vh-100 px-5">
      <div className="row h-100 g-0">
        {/* Left section with form */}
        <div className="col-lg-6 d-flex align-items-center justify-content-center bg-light">
          <div className="w-100 mx-3" style={{ maxWidth: "470px" }}>
            <h2 className="text-center fw-bold mb-4" style={{ color: "#000" }}>
              Create New Password
            </h2>
            <p className="text-center text-muted mb-4">
              A verification code was sent to {email}.
            </p>
            {/* Render the dumb form component and pass props */}
            <ResetPasswordForm
              formData={formData}
              onChange={handleChange}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
            {message && <Alert variant="success" className="text-center mt-3 small">{message}</Alert>}
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
              <h1 className="fw-bold display-4">Secure Your Account</h1>
              <p className="fs-5">
                Choose a strong new password to protect your account.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}