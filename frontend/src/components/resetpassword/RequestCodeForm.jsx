import React from "react";
import { Button, Form, Spinner } from "react-bootstrap";
import toast from "react-hot-toast";

export default function RequestCodeForm({ email, onChange, onSubmit, isLoading }) {
  // This handler validates the email before calling the parent's submit function.
  const handleValidationAndSubmit = (e) => {
    e.preventDefault(); // Prevent the form from reloading the page

    if (!email.trim()) {
      return toast.error("Please enter an email address.");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return toast.error("Please enter a valid email address.");
    }

    // If validation passes, call the onSubmit function from the parent page
    onSubmit(e);
  };

  return (
    <Form onSubmit={handleValidationAndSubmit}>
      <Form.Group className="mb-3" controlId="formRequestCodeEmail">
        <Form.Control
          type="email"
          name="email"
          value={email}
          onChange={onChange}
          placeholder="Enter your email address"
          className="form-input-field" // For custom styling from your CSS
        />
      </Form.Group>

      <Button
        type="submit"
        className="btn btn-dark w-100 py-2 fw-semibold form-submit-button" // For custom styling
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
            />
            &nbsp;Sending...
          </>
        ) : (
          "Send Verification Code"
        )}
      </Button>
    </Form>
  );
}