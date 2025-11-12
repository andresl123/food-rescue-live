// src/components/common/AddressEditModal.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { updateAddress } from "../../services/addressService";


export default function AddressEditModal({
  show,
  onClose,
  title = 'Edit Address',
  userId,
  address,
  addressId,
  onSaved,
}) {
  const [form, setForm] = useState({
    id: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Prefill on open
  useEffect(() => {
    if (show) {
      const a = address || {};
      setForm({
        id: a.id || addressId || '',
        street: a.street || '',
        city: a.city || '',
        state: a.state || '',
        postalCode: a.postalCode || '',
        country: a.country || '',
      });
      setErrors({});
      setSaving(false);
      setSaved(false);
    }
  }, [show, address, addressId]);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const validate = useMemo(
    () => () => {
      const next = {};
      if (!form.street.trim()) next.street = 'Street is required';
      if (!form.city.trim()) next.city = 'City is required';
      if (!form.state.trim()) next.state = 'State/Province is required';
      if (!form.postalCode.trim()) next.postalCode = 'Postal code is required';
      if (!form.country.trim()) next.country = 'Country is required';
      setErrors(next);
      return Object.keys(next).length === 0;
    },
    [form]
  );

const handleSave = async () => {
  if (!validate()) return;
  setSaving(true);
  try {
    const res = await updateAddress(form.id, form);
    if (res.success) {
      setSaved(true);
      onSaved?.(res.data);
      setTimeout(onClose, 450);
    } else {
      throw new Error(res.message || "Failed to update address");
    }
  } catch (e) {
    console.error("Error saving address:", e);
    setSaving(false);
  }
};

//   const handleSave = async () => {
//     if (!validate()) return;
//     setSaving(true);
//     try {
//       // TODO: replace with your API call:
//       // await api.updateAddress(userId, form.id, form);
//       await new Promise((r) => setTimeout(r, 900)); // demo delay
//       setSaved(true);
//       onSaved?.(form);
//       // brief success flash before closing
//       setTimeout(onClose, 450);
//     } catch (e) {
//       setSaving(false);
//     }
//   };

  return (
    <>
      {/* component-scoped styles */}
      <style>{`
        .fdm-blur {
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
        .fdm-panel {
          width: 100%;
          max-width: 680px;
          border-radius: 20px;
          overflow: hidden;
          box-shadow:
            0 30px 60px rgba(16,24,40,.16),
            0 8px 18px rgba(16,24,40,.10);
          border: 1px solid rgba(16,24,40,.08);
        }
        .fdm-head {
          background: radial-gradient(120% 140% at 10% -20%, #dbeafe 0%, transparent 35%),
                      radial-gradient(110% 130% at 110% -10%, #e9d5ff 0%, transparent 35%),
                      linear-gradient(135deg, #111827, #1f2937);
          color: #fff;
        }
        .fdm-close {
          background: rgba(255,255,255,.12);
          border: 1px solid rgba(255,255,255,.25);
          width: 36px; height: 36px;
          display: grid; place-items: center;
          border-radius: 10px;
        }
        .fdm-close:hover { background: rgba(255,255,255,.18); }
        .fdm-label { font-weight: 600; color: #111827; }
        .fdm-input.form-control {
          border-radius: 12px;
          border: 1px solid #E5E7EB;
          padding: .75rem .95rem;
          transition: box-shadow .2s, border-color .2s, transform .05s;
          background: #fff;
        }
        .fdm-input.form-control:focus {
          border-color: #6366F1;
          box-shadow: 0 0 0 .25rem rgba(99,102,241,.15);
        }
        .fdm-input.is-invalid {
          border-color: #EF4444;
          box-shadow: 0 0 0 .2rem rgba(239,68,68,.12);
        }
        .fdm-footer {
          background: linear-gradient(180deg, #fff, #f9fafb);
        }
        .fdm-btn-dark {
          border-radius: 12px;
          padding: .7rem 1rem;
        }
        .fdm-badge {
          display: inline-flex; align-items: center; gap:.5rem;
          font-size: .85rem; padding: .35rem .6rem;
          border-radius: 999px; background: rgba(255,255,255,.14);
          border: 1px dashed rgba(255,255,255,.35);
          color: #e5e7eb;
        }
      `}</style>

      <AnimatePresence>
        {show && (
          <>
            {/* Backdrop */}
            <motion.div
              className="position-fixed top-0 start-0 w-100 h-100 fdm-blur"
              style={{ background: 'rgba(17,24,39,.45)', zIndex: 1050 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            {/* Panel */}
            <motion.div
              className="position-fixed top-50 start-50 translate-middle fdm-panel bg-white"
              style={{ zIndex: 1051 }}
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            >
              {/* Header */}
              <div className="fdm-head p-4 p-md-5">
                <div className="d-flex align-items-start justify-content-between">
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="d-inline-flex align-items-center justify-content-center rounded-3"
                      style={{
                        width: 48,
                        height: 48,
                        background: 'rgba(255,255,255,.14)',
                        border: '1px solid rgba(255,255,255,.28)',
                      }}
                    >
                      <i className="bi bi-geo-alt-fill fs-4" />
                    </div>
                    <div>
                      <h4 className="mb-1 text-white">{title}</h4>
                    </div>
                  </div>
                  <button className="fdm-close btn p-0 text-white" onClick={onClose} aria-label="Close">
                    <i className="bi bi-x-lg" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 p-md-5">
                <div className="row g-3">
                  <div className="col-12">
                    <label className="fdm-label mb-1">Street</label>
                    <input
                      className={`form-control fdm-input ${errors.street ? 'is-invalid' : ''}`}
                      name="street"
                      value={form.street}
                      onChange={onChange}
                      placeholder="123 Main Street"
                    />
                    {errors.street && <div className="invalid-feedback">{errors.street}</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="fdm-label mb-1">City</label>
                    <input
                      className={`form-control fdm-input ${errors.city ? 'is-invalid' : ''}`}
                      name="city"
                      value={form.city}
                      onChange={onChange}
                      placeholder="San Francisco"
                    />
                    {errors.city && <div className="invalid-feedback">{errors.city}</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="fdm-label mb-1">State/Province</label>
                    <input
                      className={`form-control fdm-input ${errors.state ? 'is-invalid' : ''}`}
                      name="state"
                      value={form.state}
                      onChange={onChange}
                      placeholder="CA"
                    />
                    {errors.state && <div className="invalid-feedback">{errors.state}</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="fdm-label mb-1">Postal Code</label>
                    <input
                      className={`form-control fdm-input ${errors.postalCode ? 'is-invalid' : ''}`}
                      name="postalCode"
                      value={form.postalCode}
                      onChange={onChange}
                      placeholder="94102"
                    />
                    {errors.postalCode && <div className="invalid-feedback">{errors.postalCode}</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="fdm-label mb-1">Country</label>
                    <input
                      className={`form-control fdm-input ${errors.country ? 'is-invalid' : ''}`}
                      name="country"
                      value={form.country}
                      onChange={onChange}
                      placeholder="USA"
                    />
                    {errors.country && <div className="invalid-feedback">{errors.country}</div>}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="fdm-footer px-4 px-md-5 py-3 d-flex justify-content-between align-items-center">
                <div className="text-secondary small">
                  {saved ? (
                    <motion.span
                      className="d-inline-flex align-items-center gap-2 text-success"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                    >
                      <i className="bi bi-check2-circle" />
                      Saved!
                    </motion.span>
                  ) : (
                    <span>
                      Address ID:&nbsp;<code>{form.id || 'new'}</code>
                    </span>
                  )}
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-light fdm-btn-dark" onClick={onClose} disabled={saving}>
                    Cancel
                  </button>
                  <button
                    className="btn btn-dark fdm-btn-dark d-inline-flex align-items-center gap-2"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" />
                        <span>Saving…</span>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-save2" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
