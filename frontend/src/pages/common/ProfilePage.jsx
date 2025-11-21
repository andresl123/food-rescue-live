import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

import { getUserProfile, getUserById } from "../../services/loginServices";
import { getAddressById } from "../../services/addressService";

import VerifyAndUpdateModal from '../../components/common/VerifyAndUpdateModal';
import AddressEditModal from '../../components/common/AddressEditModal';

function initials(name = '') {
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] || '') + (parts[1]?.[0] || '');
}

function formatAddress(addr) {
  if (!addr) return '';
  const parts = [
    addr.street,
    addr.city,
    addr.state,
    addr.postalCode,
    addr.country,
  ].filter(Boolean);
  return `${parts[0]}${parts[1] ? `, ${parts[1]}` : ''}${parts[2] || parts[3] ? `, ${[parts[2], parts[3]].filter(Boolean).join(' ')}` : ''}${parts[4] ? `, ${parts[4]}` : ''}`;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // verify (email/mobile) modal state
  const [modal, setModal] = useState({
    show: false,
    type: 'email',
    value: '',
  });

  // address edit modal state
  const [addrModal, setAddrModal] = useState({
    show: false,
    isDefault: false,
    index: -1,       
    address: null,   
  });

  const openEmailModal = () =>
    setModal({ show: true, type: 'email', value: user.email });

  const openMobileModal = () =>
    setModal({ show: true, type: 'mobile', value: user.phoneNumber });

  const closeVerifyModal = () => setModal((m) => ({ ...m, show: false }));

  const handleVerifySaved = (newValue) => {
    setUser((prev) =>
      modal.type === 'email'
        ? { ...prev, email: newValue }
        : { ...prev, phoneNumber: newValue }
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

  // NEW: Add Address
  const openAddAddressModal = () =>
    setAddrModal({
      show: true,
      isDefault: false,
      index: -1, 
      address: null, 
    });

  const closeAddressModal = () =>
    setAddrModal((m) => ({ ...m, show: false }));

  const handleAddressSaved = (updatedAddr) => {
    setUser((prev) => {
      if (addrModal.isDefault) {
        return { ...prev, defaultAddress: updatedAddr };
      }
      // Logic for additional addresses
      const next = prev.addresses ? [...prev.addresses] : [];
      if (addrModal.index === -1) {
        next.push(updatedAddr); // Add new
      } else {
        next[addrModal.index] = updatedAddr; // Update existing
      }
      return { ...prev, addresses: next };
    });
    closeAddressModal();
  };

  // ---- Fetch Data ----
  useEffect(() => {
    async function fetchUserData() {
      try {
        setLoading(true);
        setError(null);

        const meResponse = await getUserProfile();
        if (!meResponse.success || !meResponse.data?.userId) {
          throw new Error("Invalid user session or no userId found");
        }
        const userId = meResponse.data.userId;
        const fullUser = await getUserById(userId);

        let defaultAddress = null;
        if (fullUser.defaultAddressId) {
          try {
            defaultAddress = await getAddressById(fullUser.defaultAddressId);
          } catch (e) {
            console.warn("Could not fetch default address", e);
          }
        }

        let addresses = [];
        if (Array.isArray(fullUser.moreAddresses) && fullUser.moreAddresses.length > 0) {
          const results = await Promise.allSettled(
            fullUser.moreAddresses.map(id => getAddressById(id))
          );
          addresses = results
            .filter(r => r.status === "fulfilled")
            .map(r => r.value);
        }

        setUser({
          ...fullUser,
          userId,
          defaultAddress,
          addresses,
        });

      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    }
    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 text-danger">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100 py-4">
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
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div className="d-flex align-items-center gap-3">
              <div className="avatar">{initials(user.name)}</div>
              <div className="flex-grow-1">
                <h5 className="mb-2">{user.name}</h5>
                <div className="d-flex gap-2 flex-wrap">
                  <span className="chip chip-role">
                    {Array.isArray(user.roles) ? user.roles.join(", ") : user.roles}
                  </span>
                  <span className="chip chip-status">{user.status}</span>
                </div>
              </div>
            </div>

            <button
              className="btn d-inline-flex align-items-center fw-semibold"
              style={{
                backgroundColor: "#fff",
                color: "#344054",
                border: "1px solid #D0D5DD",
                borderRadius: "10px",
                padding: "8px 16px",
                fontSize: "15px",
                lineHeight: "1.4",
                boxShadow: "0 1px 2px rgba(16,24,40,0.05)",
                transition: "all 0.2s ease-in-out",
              }}
              onClick={() => navigate("/dashboard")}
            >
              <i className="bi bi-arrow-left me-2" style={{ fontSize: "1rem" }}></i>
              Back to Dashboard
            </button>
          </div>

          <div className="my-4 divider" />

          {/* Contact Information */}
          <h6 className="section-title mb-3">Contact Information</h6>

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

          <div className="d-flex align-items-center justify-content-between py-2">
            <div className="d-flex align-items-center gap-3">
              <i className="bi bi-telephone fs-5 text-secondary" />
              <span className="text-body">{user.phoneNumber}</span>
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
                    {user.defaultAddress ? formatAddress(user.defaultAddress) : <span className="text-muted">Not set</span>}
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

          {/* Additional Addresses Header */}
          <div className="d-flex align-items-center justify-content-between mt-4 mb-3">
            <div className="text-secondary fw-semibold">Additional Addresses</div>
            <button 
              className="btn btn-sm btn-outline-primary d-flex align-items-center gap-2"
              onClick={openAddAddressModal}
              style={{ borderRadius: '8px' }}
            >
              <i className="bi bi-plus-lg" /> Add New Address
            </button>
          </div>

          {/* Additional Addresses List */}
          {user?.addresses?.length > 0 ? (
            user.addresses.map((addr, idx) => (
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
            ))
          ) : (
            <div className="text-muted small fst-italic mb-3">No additional addresses added yet.</div>
          )}

          <div className="my-4 divider" />

          {/* Account Details */}
          <h6 className="section-title mb-3">Account Details</h6>
          <div className="d-flex flex-column gap-3">
            <div className="d-flex align-items-center gap-3">
              <i className="bi bi-shield-check text-secondary fs-5" />
              <div>
                <div className="text-secondary small">Roles</div>
                <span className="chip chip-role">
                  {Array.isArray(user.roles) ? user.roles.join(", ") : user.roles}
                </span>
              </div>
            </div>

            <div className="d-flex align-items-center gap-3">
              <i className="bi bi-calendar-check text-secondary fs-5" />
              <div>
                <div className="text-secondary small">Member Since</div>
                <div className="text-body">{user.createdAt
                    ? format(new Date(user.createdAt), "MMMM dd, yyyy")
                    : "—"}</div>
              </div>
            </div>

            <div className="d-flex align-items-center gap-3">
              <i className="bi bi-clock-history text-secondary fs-5" />
              <div>
                <div className="text-secondary small">Last Updated</div>
                <div className="text-body">{user.updatedAt
                    ? format(new Date(user.updatedAt), "MMMM dd, yyyy h:mm a")
                    : "—"}</div>
              </div>
            </div>
          </div>
        </div> {/* Closes card */}
      </div> {/* Closes container */}

      {/* Modals are INSIDE the main div, but OUTSIDE the container/card */}
      <VerifyAndUpdateModal
        show={modal.show}
        onClose={closeVerifyModal}
        type={modal.type}
        value={modal.value}
        userId={user?.userId || user?.id}
        title={`Update ${modal.type === 'email' ? 'Email' : 'Mobile'}`}
        onSaved={handleVerifySaved}
      />

      <AddressEditModal
        show={addrModal.show}
        onClose={closeAddressModal}
        userId={user?.userId || user?.id}
        address={addrModal.address}
        addressId={addrModal.address?.id}
        title={
          addrModal.isDefault 
            ? 'Edit Default Address' 
            : (addrModal.index === -1 ? 'Add New Address' : 'Edit Address')
        }
        onSaved={handleAddressSaved}
      />

    </div> // Closes bg-light
  );
}