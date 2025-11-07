// src/components/ControlledDropdown.jsx
import { useEffect, useRef, useState } from "react";

export default function ControlledDropdown({
  variant = "ghost",             // "ghost" | "white"
  iconLeft,
  selectedText,
  items,                         // [{ key, text, active, onClick }]
  resetKey,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDoc = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => setOpen(false), [resetKey]);

  return (
    <div className="dropdown w-100 frl-dd" ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        className={`frl-btn ${variant === "white" ? "frl-btn-white" : ""}`}
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span className="d-inline-flex align-items-center">
          {iconLeft}
          <span>{selectedText}</span>
        </span>
        <i className="bi bi-chevron-down frl-chev" />
      </button>

      <ul className={`dropdown-menu frl-menu ${open ? "show frl-pop" : ""}`}>
        {items.map(({ key, text, active, onClick }) => (
          <li key={key}>
            <button
              type="button"
              className={`dropdown-item ${active ? "active" : ""}`}
              onClick={() => { onClick?.(); setOpen(false); }}
            >
              {text}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
