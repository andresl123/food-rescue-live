import React from "react";

export default function Footer({ appName = "Food Rescue Live" }) {
  const year = new Date().getFullYear();
  return (
    <footer
      className="app-footer text-muted small d-flex flex-wrap align-items-center justify-content-between"
      role="contentinfo"
    >
      <span>© {year} {appName}. All rights reserved.</span>
      <span className="d-flex gap-3">
        <a className="link-secondary text-decoration-none" href="#privacy">Privacy</a>
        <a className="link-secondary text-decoration-none" href="#terms">Terms</a>
        <a className="link-secondary text-decoration-none" href="#contact">Contact</a>
      </span>
    </footer>
  );
}
