import React from 'react';
import { Button, Form, Spinner } from 'react-bootstrap';

export default function RequestCodeForm({ email, onChange, onSubmit, isLoading }) {
  return (
    <Form onSubmit={onSubmit}>
      <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Control
          type="email"
          name="email" // Added name for consistency
          value={email}
          onChange={onChange}
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
  );
}