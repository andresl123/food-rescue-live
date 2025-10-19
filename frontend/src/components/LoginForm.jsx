import React from "react";
import { Button, Form, Spinner } from 'react-bootstrap';

export default function LoginForm({ formData, onChange, onSubmit, onForgotPasswordClick, isLoading }) {

  // Google OAuth handler can remain here as it's simple UI logic
  const handleGoogleLogin = () => {
    // Replace with your backend Google OAuth endpoint if you have one
    window.location.href = "http://localhost:8080/api/auth/google";
  };

  return (
    <Form onSubmit={onSubmit}>
      {/* Email Input */}
      <Form.Group className="mb-3">
        <Form.Control
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={onChange}
          required
          style={{ borderRadius: "15px", padding: "10px" }}
        />
      </Form.Group>

      {/* Password Input */}
      <Form.Group className="mb-2">
        <Form.Control
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={onChange}
          required
          style={{ borderRadius: "15px", padding: "10px" }}
        />
      </Form.Group>

      {/* Forgot Password Button */}
      <div className="text-end mb-4">
        <Button
          type="button"
          variant="link"
          className="p-0 text-decoration-none small"
          style={{ color: "#000" }}
          onClick={onForgotPasswordClick}
        >
          Forgot Password?
        </Button>
      </div>

      {/* Login Submit Button */}
      <Button
        type="submit"
        variant="dark"
        className="w-100 py-2 fw-semibold mb-3"
        style={{ borderRadius: "15px" }}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Spinner as="span" animation="border" size="sm" /> Logging in...
          </>
        ) : (
          "Login"
        )}
      </Button>

      {/* OR Separator */}
      <div className="d-flex align-items-center my-3">
        <hr className="flex-grow-1" />
        <span className="mx-2 text-muted small">OR</span>
        <hr className="flex-grow-1" />
      </div>

      {/* Google Login Button */}
      <Button
        type="button"
        variant="light"
        className="w-100 py-2 border fw-semibold d-flex align-items-center justify-content-center gap-2"
        style={{ borderRadius: "15px", backgroundColor: "#fff", border: "1px solid #ccc" }}
        onClick={handleGoogleLogin}
      >
        {/* You can add your Google icon here if you have it */}
        Continue with Google
      </Button>
    </Form>
  );
}