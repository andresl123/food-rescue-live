// pages/receiver/ReceiverDashboard.jsx (or your current path)
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import LotCard from "../../../components/dashboards/receiver/LotCard";
import LotFlipCard from "../../../components/dashboards/receiver/LotFlipCard";
import ControlledDropdown from "../../../components/dashboards/receiver/ControlledDropdown";
import { lots as MOCK_LOTS } from "../../../mock/lots";

// NEW: modals
import LotDetailsModal from "../../../components/dashboards/receiver/LotDetailsModal";
import ConfirmReserveModal from "../../../components/dashboards/receiver/ConfirmReserveModal";

const FILTERS = {
  Distance: {
    key: "distanceKm",
    options: [
      { label: "1 km", value: 1 },
      { label: "2 km", value: 2 },
      { label: "5 km", value: 5 },
      { label: "10 km", value: 10 },
      { label: "Any", value: "any" },
    ],
    apply: (lot, v) => (v === "any" ? true : lot.distanceKm <= v),
    display(v) {
      return this.options.find((o) => o.value === v)?.label ?? "Any";
    },
  },
  Freshness: {
    key: "freshness",
    options: [
      { label: "All items", value: "all" },
      { label: "Fresh", value: "fresh" },
      { label: "Expiring Near", value: "near" },
    ],
    apply: (lot, v) => {
      if (v === "all") return true;
      const days = Math.ceil(
        (new Date(lot.expiresAt).getTime() - Date.now()) / 86400000
      );
      if (v === "fresh") return days >= 2;
      if (v === "near") return days <= 1;
      return true;
    },
    display(v) {
      return this.options.find((o) => o.value === v)?.label ?? "All items";
    },
  },
  Quantity: {
    key: "weightLbs",
    options: [
      { label: "10+", value: 10 },
      { label: "20+", value: 20 },
      { label: "30+", value: 30 },
      { label: "40+", value: 40 },
    ],
    apply: (lot, v) => lot.weightLbs >= v,
    display(v) {
      return this.options.find((o) => o.value === v)?.label ?? "10+";
    },
  },
  "Lot Type": {
    key: "category",
    options: [
      { label: "Produce", value: "produce" },
      { label: "Bakery", value: "bakery" },
      { label: "Dairy", value: "dairy" },
      { label: "Prepared", value: "prepared" },
    ],
    apply: (lot, v) => (v ? lot.category === v : true),
    display(v) {
      return v ? this.options.find((o) => o.value === v)?.label : "All categories";
    },
  },
};

const DEFAULT_FILTERS = Object.freeze({
  Distance: "any",
  Freshness: "all",
  Quantity: 10,
  "Lot Type": null,
});

export default function ReceiverDashboard() {
  const navigate = useNavigate();

  // existing UI state
  const [query, setQuery] = useState("");
  const [primary, setPrimary] = useState("Distance");
  const [selected, setSelected] = useState({ ...DEFAULT_FILTERS });

  // NEW: modal state (kept minimal; doesn’t affect existing flow)
  const [selectedLot, setSelectedLot] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [confirmLot, setConfirmLot] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const isDirty =
    selected.Distance !== DEFAULT_FILTERS.Distance ||
    selected.Freshness !== DEFAULT_FILTERS.Freshness ||
    selected.Quantity !== DEFAULT_FILTERS.Quantity ||
    selected["Lot Type"] !== DEFAULT_FILTERS["Lot Type"];

  const resetFilters = () => {
    setSelected({ ...DEFAULT_FILTERS });
    setPrimary("Distance");
  };

  const applyAll = (lot) => {
    if (!FILTERS.Distance.apply(lot, selected.Distance)) return false;
    if (!FILTERS.Freshness.apply(lot, selected.Freshness)) return false;
    if (!FILTERS.Quantity.apply(lot, selected.Quantity)) return false;
    if (!FILTERS["Lot Type"].apply(lot, selected["Lot Type"])) return false;
    return true;
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MOCK_LOTS.filter((l) => {
      const inText =
        q.length === 0
          ? true
          : [l.title, l.description, l.locationName, l.category, ...(l.tags || [])]
              .join(" ")
              .toLowerCase()
              .includes(q);
      return inText && applyAll(l);
    });
  }, [query, selected]);

  const primaryItems = Object.keys(FILTERS).map((name) => ({
    key: name,
    text: name,
    active: primary === name,
    onClick: () => setPrimary(name),
  }));

  const currentConf = FILTERS[primary];

  const secondaryItems = currentConf.options.map((opt) => ({
    key: String(opt.value),
    text: opt.label,
    active: selected[primary] === opt.value,
    onClick: () => setSelected((s) => ({ ...s, [primary]: opt.value })),
  }));

  if (primary === "Lot Type") {
    secondaryItems.push({
      key: "all-cats",
      text: "All categories",
      active: selected["Lot Type"] == null,
      onClick: () => setSelected((s) => ({ ...s, "Lot Type": null })),
    });
  }

  // ---- NEW handlers (non-breaking) ----
  const openDetails = (lot) => {
    setSelectedLot(lot);
    setShowDetails(true);
  };

  const handleReserveClick = (lot) => {
    setShowDetails(false);
    setConfirmLot(lot);
    setShowConfirm(true);
  };

  const handleConfirmYes = () => {
    setShowConfirm(false);
    navigate("/dashboard");
  };
  // -------------------------------------

  return (
    <div className="container-fluid">
      {/* Controls — inline reset slot */}
      <div className={`frl-controls ${isDirty ? "show-reset" : ""}`}>
        <div className="frl-controls-main">
          <div className="row g-3 align-items-stretch">
            <div className="col-12 col-xl-6">
              <div className="input-group h-100">
                <span className="input-group-text bg-white">
                  <i className="bi bi-search" />
                </span>
                <input
                  className="form-control"
                  placeholder="Search by food type, location, or description..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="col-6 col-xl-3">
              <ControlledDropdown
                variant="white"
                iconLeft={<i className="bi bi-sliders me-2" />}
                selectedText={primary}
                items={primaryItems}
              />
            </div>

            <div className="col-6 col-xl-3">
              <ControlledDropdown
                variant="ghost"
                iconLeft={<i className="bi bi-funnel me-2" />}
                selectedText={
                  primary === "Lot Type"
                    ? FILTERS["Lot Type"].display(selected["Lot Type"])
                    : currentConf.display(selected[primary])
                }
                items={secondaryItems}
                resetKey={primary}
              />
            </div>
          </div>
        </div>

        <div className="frl-reset-slot">
          {isDirty && (
            <button
              type="button"
              className="btn btn-dark w-100 h-100 frl-reset-btn frl-appear"
              onClick={resetFilters}
              title="Reset filters"
            >
              <i className="bi bi-arrow-counterclockwise me-2" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="mb-2 small text-muted d-flex align-items-center flex-wrap gap-2">
        <span>Showing</span>
        <span className="badge text-bg-light border">{filtered.length} lots</span>
        <span>within</span>
        <span className="badge text-bg-light border">
          {FILTERS.Distance.display(selected.Distance)}
        </span>
        <span>·</span>
        <span className="badge text-bg-light border">
          {FILTERS.Freshness.display(selected.Freshness)}
        </span>
        <span>·</span>
        <span className="badge text-bg-light border">
          {FILTERS.Quantity.display(selected.Quantity)}
        </span>
        {selected["Lot Type"] && (
          <>
            <span>·</span>
            <span className="badge text-bg-light border">
              {FILTERS["Lot Type"].display(selected["Lot Type"])}
            </span>
          </>
        )}
      </div>

      {/* Grid */}
      <div className="row g-4">
        {filtered.map((lot) => (
          <div
            className="col-12 col-md-6 col-xl-3"
            key={lot.id}
            onClick={() => openDetails(lot)}      // NEW: open details on click
            style={{ cursor: "pointer" }}          // visual affordance only
          >
            <LotFlipCard lot={lot} front={<LotCard lot={lot} />} />
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-12">
            <div className="text-center text-muted py-5">
              No lots match your filters.
            </div>
          </div>
        )}
      </div>

      {/* --- NEW: Modals (don’t affect layout) --- */}
      <LotDetailsModal
        lot={selectedLot}
        show={showDetails}
        onClose={() => setShowDetails(false)}
        onReserve={handleReserveClick}
      />
      <ConfirmReserveModal
        lot={confirmLot}
        show={showConfirm}
        onCancel={() => setShowConfirm(false)}
        onConfirm={handleConfirmYes}
      />
      {/* --------------------------------------- */}
    </div>
  );
}
