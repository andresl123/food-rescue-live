// components/common/TagPill.jsx
import React from "react";
import "./TagPill.css";

const TAG_CLASS = {
  "vegan": "tag--vegan",
  "vegetarian": "tag--vegetarian",
  "gluten-free": "tag--glutenfree",
  "organic": "tag--organic",
  "kid-friendly": "tag--kid",
  "ready-to-eat": "tag--ready",
  "local": "tag--ready",
  "dairy-free": "tag--dairyfree",
  "nut-free": "tag--nutfree",
};

export default function TagPill({ label }) {
  const key = String(label || "").toLowerCase().trim();
  const className = TAG_CLASS[key] || "tag--default";
  return (
    <span className={`frl-tag ${className}`} title={label}>
      {label}
    </span>
  );
}
