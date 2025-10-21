import React from 'react';
import { Button, Form, Spinner } from 'react-bootstrap';

export default function ResetPasswordForm({ formData, onChange, onSubmit, isLoading }) {
  return (
    <Form onSubmit={onSubmit}>
      <Form.Group className="mb-3">
        <Form.Control
          type="text"
          name="code"
          value={formData.code}
          onChange={onChange}
          placeholder="6-digit code from email"
          required
          style={{ borderRadius: "15px", padding: "10px" }}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Control
          type="password"
          name="newPassword"
          value={formData.newPassword}
          onChange={onChange}
          placeholder="Enter your new password"
          required
          style={{ borderRadius: "15px", padding: "10px" }}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Control
          type="password"
          name="repeatPassword"
          value={formData.repeatPassword}
          onChange={onChange}
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
  );
}