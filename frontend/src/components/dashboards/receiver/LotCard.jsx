// components/dashboards/receiver/LotCard.jsx
import React from "react";
import TagPill from "../../common/TagPill";
import "./css/LotCard.css";

function daysLeftLabel(expiresAt) {
  const ms = new Date(expiresAt).getTime() - Date.now();
  const d = Math.max(0, Math.ceil(ms / 86400000));
  return { text: d <= 1 ? "1d left" : `${d}d left` };
}

export default function LotCard({ lot }) {
  const left = daysLeftLabel(lot.expiresAt);

  return (
    <div className="card frl-lot2 h-100 shadow-sm">
      {/* Image */}
      <div className="position-relative">
        <img src={lot.imageUrl} alt={lot.title} className="w-100 frl-img-fixed" />
        <span className="frl-pill frl-pill--left"><i className="bi bi-clock me-1" />{left.text}</span>
        <span className="frl-pill frl-pill--right"><i className="bi bi-geo-alt me-1" />{lot.distanceKm.toFixed(1)} km</span>
      </div>

      {/* Body */}
      <div className="card-body frl-body d-flex flex-column">
        {/* Title + Lot type */}
        <div className="d-flex align-items-start justify-content-between mb-2">
          <h5 className="frl-title text-truncate-2 mb-0">{lot.title}</h5>
          <span className="badge text-bg-light border fw-semibold">{lot.category}</span>
        </div>

        {/* Description (kept to a fixed visual size) */}
        <div className="frl-desc-wrap mb-2">
          <p className="frl-desc text-muted text-truncate-3 mb-0">{lot.description}</p>
        </div>

        {/* Quantity */}
        <div className="small text-muted mb-2">
          <i className="bi bi-bag me-1" />
          {lot.weightLbs} lbs
        </div>

        {/* Tags (kept compact; reserves a bit of space to avoid footer jump) */}
        <div className="frl-tags-wrap mb-2">
          <div className="d-flex flex-wrap gap-2">
            {(lot.tags || []).map((t) => (
              <TagPill key={t} label={t} />
            ))}
          </div>
        </div>

        {/* FOOTER — fixed at the end with extra padding */}
        <div className="frl-footer mt-auto pt-2">
          <div className="small">
            <span className="text-muted me-2">Pickup:</span>
            <strong>{lot.pickupWindow}</strong>
          </div>
          <div className="small">
            <span className="text-muted me-2">Location:</span>
            <strong>{lot.locationName}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
