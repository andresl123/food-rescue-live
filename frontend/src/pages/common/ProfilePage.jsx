// src/ProfilePage.jsx
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import React, { useState } from 'react';

import seedUser from '../../mock/user.json';
import VerifyAndUpdateModal from '../../components/common/VerifyAndUpdateModal';
import AddressEditModal from '../../components/common/AddressEditModal'; // <- no-OTP modal

function initials(name = '') {
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] || '') + (parts[1]?.[0] || '');
}

// pretty print an address object
function formatAddress(addr) {
  if (!addr) return '';
  const parts = [
    addr.street,
    addr.city,
    addr.state,
    addr.postalCode,
    addr.country,
  ].filter(Boolean);
  // "123 Main St, San Francisco, CA 94102, USA"
  return `${parts[0]}${parts[1] ? `, ${parts[1]}` : ''}${parts[2] || parts[3] ? `, ${[parts[2], parts[3]].filter(Boolean).join(' ')}` : ''}${parts[4] ? `, ${parts[4]}` : ''}`;
}

export default function ProfilePage() {
  // keep a local, editable copy of the user
  const [user, setUser] = useState(seedUser);

  // verify (email/mobile) modal state
  const [modal, setModal] = useState({
    show: false,
    type: 'email', // 'email' | 'mobile'
    value: '',
  });

  // address edit modal state
  const [addrModal, setAddrModal] = useState({
    show: false,
    isDefault: false,
    index: -1,       // index in user.addresses when editing a non-default address
    address: null,   // the address object to edit
  });

  const openEmailModal = () =>
    setModal({ show: true, type: 'email', value: user.email });

  const openMobileModal = () =>
    setModal({ show: true, type: 'mobile', value: user.phone });

  const closeVerifyModal = () => setModal((m) => ({ ...m, show: false }));

  const handleVerifySaved = (newValue) => {
    setUser((prev) =>
      modal.type === 'email'
        ? { ...prev, email: newValue }
        : { ...prev, phone: newValue }
    );
    closeVerifyModal();
  };

  // ---- Address modal open/close/save ----
  const openDefaultAddressModal = () =>
    setAddrModal({
      show: true,
      isDefault: true,
      index: -1,
      address: user.defaultAddress,
    });

  const openAdditionalAddressModal = (idx) =>
    setAddrModal({
      show: true,
      isDefault: false,
      index: idx,
      address: user.addresses[idx],
    });

  const closeAddressModal = () =>
    setAddrModal((m) => ({ ...m, show: false }));

  const handleAddressSaved = (updatedAddr) => {
    setUser((prev) => {
      if (addrModal.isDefault) {
        return { ...prev, defaultAddress: updatedAddr };
      }
      const next = [...prev.addresses];
      next[addrModal.index] = updatedAddr;
      return { ...prev, addresses: next };
    });
    closeAddressModal();
  };

  return (
    <div className="bg-light min-vh-100 py-4">
      {/* Local styles to fine-tune the look */}
      <style>{`
        .card-outer {
          max-width: 920px;
          border-radius: 1rem;
          box-shadow: 0 8px 20px rgba(0,0,0,.06), 0 2px 6px rgba(0,0,0,.05);
          border: 1px solid rgba(0,0,0,.06);
        }
        .avatar {
          width: 88px; height: 88px;
          border-radius: 50%;
          background: #101828;
          color: #fff;
          display: grid; place-items: center;
          font-weight: 700; font-size: 28px;
        }
        .chip {
          font-size: .75rem;
          padding: .25rem .5rem;
          border-radius: 999px;
          font-weight: 600;
        }
        .chip-role { background:#EEF4FF; color:#1D3B8B; }
        .chip-status { background:#101828; color:#fff; }
        .section-title { color:#101828; font-weight: 600; }
        .divider { height:1px; background:#E9ECEF; }
        .addr-card {
          border: 1px solid #E9ECEF;
          border-radius: .75rem;
        }
        .edit-btn {
          border-radius: .5rem;
        }
      `}</style>

      <div className="container">
        <div className="card bg-white mx-auto card-outer p-4 p-md-5">
          {/* Header */}
          <div className="d-flex align-items-center gap-3">
            <div className="avatar">{initials(user.name)}</div>
            <div className="flex-grow-1">
              <h5 className="mb-2">{user.name}</h5>
              <div className="d-flex gap-2">
                <span className="chip chip-role">{user.role}</span>
                <span className="chip chip-status">{user.status}</span>
              </div>
            </div>
          </div>

          <div className="my-4 divider" />

          {/* Contact Information */}
          <h6 className="section-title mb-3">Contact Information</h6>

          {/* Email row */}
          <div className="d-flex align-items-center justify-content-between py-2">
            <div className="d-flex align-items-center gap-3">
              <i className="bi bi-envelope fs-5 text-secondary" />
              <span className="text-body">{user.email}</span>
            </div>
            <button
              className="btn btn-outline-secondary btn-sm edit-btn"
              onClick={openEmailModal}
            >
              <i className="bi bi-pencil" />
            </button>
          </div>

          {/* Phone row */}
          <div className="d-flex align-items-center justify-content-between py-2">
            <div className="d-flex align-items-center gap-3">
              <i className="bi bi-telephone fs-5 text-secondary" />
              <span className="text-body">{user.phone}</span>
            </div>
            <button
              className="btn btn-outline-secondary btn-sm edit-btn"
              onClick={openMobileModal}
            >
              <i className="bi bi-pencil" />
            </button>
          </div>

          <div className="my-4 divider" />

          {/* Addresses */}
          <h6 className="section-title mb-3">Addresses</h6>

          {/* Default Address */}
          <div className="addr-card p-3 p-md-4 mb-3">
            <div className="d-flex align-items-start justify-content-between">
              <div className="d-flex align-items-start gap-3">
                <i className="bi bi-geo-alt text-secondary fs-5 mt-1" />
                <div>
                  <div className="fw-semibold">
                    Default Address
                    <span
                      className="ms-2 chip"
                      style={{ background: '#F2F4F7', color: '#344054' }}
                    >
                      Primary
                    </span>
                  </div>
                  <div className="mt-2 text-body">
                    {formatAddress(user.defaultAddress)}
                  </div>
                </div>
              </div>
              <button
                className="btn btn-outline-secondary btn-sm edit-btn"
                onClick={openDefaultAddressModal}
                title="Edit default address"
              >
                <i className="bi bi-pencil" />
              </button>
            </div>
          </div>

          {/* Additional Addresses */}
          <div className="mb-2 text-secondary fw-semibold">Additional Addresses</div>
          {user.addresses.map((addr, idx) => (
            <div className="addr-card p-3 p-md-4 mb-3" key={addr.id || idx}>
              <div className="d-flex align-items-start justify-content-between">
                <div className="d-flex align-items-start gap-3">
                  <i className="bi bi-geo-alt text-secondary fs-5 mt-1" />
                  <div>
                    <div className="fw-semibold">Address {idx + 1}</div>
                    <div className="mt-2 text-body">{formatAddress(addr)}</div>
                  </div>
                </div>
                <button
                  className="btn btn-outline-secondary btn-sm edit-btn"
                  onClick={() => openAdditionalAddressModal(idx)}
                  title="Edit address"
                >
                  <i className="bi bi-pencil" />
                </button>
              </div>
            </div>
          ))}

          <div className="my-4 divider" />

          {/* Account Details */}
          <h6 className="section-title mb-3">Account Details</h6>
          <div className="d-flex flex-column gap-3">
            <div className="d-flex align-items-center gap-3">
              <i className="bi bi-shield-check text-secondary fs-5" />
              <div>
                <div className="text-secondary small">Roles</div>
                <span className="chip chip-role">{user.role}</span>
              </div>
            </div>

            <div className="d-flex align-items-center gap-3">
              <i className="bi bi-calendar-check text-secondary fs-5" />
              <div>
                <div className="text-secondary small">Member Since</div>
                <div className="text-body">{user.memberSince}</div>
              </div>
            </div>

            <div className="d-flex align-items-center gap-3">
              <i className="bi bi-clock-history text-secondary fs-5" />
              <div>
                <div className="text-secondary small">Last Updated</div>
                <div className="text-body">{user.lastUpdated}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---- Verify email/mobile modal ---- */}
      <VerifyAndUpdateModal
        show={modal.show}
        onClose={closeVerifyModal}
        type={modal.type}
        value={modal.value}
        userId={user.userId}
        title={`Update ${modal.type === 'email' ? 'Email' : 'Mobile'}`}
        onSaved={handleVerifySaved}
      />

      {/* ---- Address edit modal (no OTP) ---- */}
      <AddressEditModal
        show={addrModal.show}
        onClose={closeAddressModal}
        userId={user.userId}
        address={addrModal.address}
        addressId={addrModal.address?.id}
        title={addrModal.isDefault ? 'Edit Default Address' : 'Edit Address'}
        onSaved={handleAddressSaved}
      />
    </div>
  );
}
