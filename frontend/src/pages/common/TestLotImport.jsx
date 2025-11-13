import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import UserLayout from "../../layout/UserLayout";

const BFF_BASE = import.meta.env.VITE_BFF_BASE_URL;

const pillInputStyle = {
  borderRadius: "999px",
  border: "1px solid #0f172a33",
  padding: "2px 10px",
  fontSize: "0.75rem",
  minWidth: "90px",
};

export default function TestLotImportWithAddresses() {
  const navigate = useNavigate();

  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [addrError, setAddrError] = useState("");
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [activeTab, setActiveTab] = useState("upload");
  const [currentUser, setCurrentUser] = useState(null);

  // =========================================================
  // 1) load current user from BFF, then load addresses for user
  // =========================================================
  useEffect(() => {
    const loadMeAndAddresses = async () => {
      try {
        const meRes = await fetch(`${BFF_BASE}/api/me`, {
          credentials: "include",
        });
        if (!meRes.ok) {
          return; // no cookie / not logged in
        }
        const me = await meRes.json();
        setCurrentUser(me);

        if (me.userId) {
          const addrRes = await fetch(
            `${BFF_BASE}/api/addresses/user/${me.userId}`,
            {
              credentials: "include",
              headers: {
                Accept: "application/json",
              },
            }
          );
          if (!addrRes.ok) {
            const msg = `Failed to load addresses (${addrRes.status})`;
            setAddrError(msg);
            toast.error(msg);
          } else {
            const data = await addrRes.json();
            setAddresses(Array.isArray(data) ? data : []);
            setAddrError("");
          }
        }
      } catch (err) {
        console.error("me/addresses error", err);
        setAddrError(err.message);
        toast.error(err.message);
      }
    };

    loadMeAndAddresses();
  }, []);

  const handleChooseFile = () => fileInputRef.current?.click();

  // =========================================================
  // 2) upload excel → preview (via BFF)
  // =========================================================
  const handleFileSelected = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setMsg("Uploading and building preview...");
    setError("");
    setPreview(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${BFF_BASE}/api/import/lots-excel/preview`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Preview failed");
      }

      const data = await res.json();
      const lotsWithImage = (data.lots || []).map((l) => ({
        ...l,
        imageUrl: l.imageUrl || "",
      }));

      setPreview({ ...data, lots: lotsWithImage });
      setMsg("Preview ready. Configure lots & food items.");
      toast.success("Preview built. Configure lots & food items.");
      setActiveTab("preview");
    } catch (err) {
      setError(err.message);
      setMsg("");
      toast.error(err.message);
    }
  };

  // =========================================================
  // LOT handlers (desc, address, image only)
  // =========================================================
  const handleAddressChange = (index, addressId) => {
    setPreview((prev) => {
      const lots = [...prev.lots];
      lots[index] = { ...lots[index], addressId };
      return { ...prev, lots };
    });
  };

  const handleLotDescriptionChange = (index, description) => {
    setPreview((prev) => {
      const lots = [...prev.lots];
      lots[index] = { ...lots[index], description };
      return { ...prev, lots };
    });
  };

  const handleImageUrlChange = (index, imageUrl) => {
    setPreview((prev) => {
      const lots = [...prev.lots];
      lots[index] = { ...lots[index], imageUrl };
      return { ...prev, lots };
    });
  };

  // =========================================================
  // Image upload → Cloudinary
  // =========================================================
  const handleImageUpload = async (index, e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingIndex(index);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "foodrescue_lot_uploads");

    try {
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/da8bvrcjg/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();
      if (data.secure_url) {
        setPreview((prev) => {
          const lots = [...prev.lots];
          lots[index] = { ...lots[index], imageUrl: data.secure_url };
          return { ...prev, lots };
        });
        toast.success(`Image added to lot ${index + 1}`);
      } else {
        toast.error("Image upload failed");
      }
    } catch (err) {
      toast.error("Image upload failed");
    } finally {
      setUploadingIndex(null);
      e.target.value = "";
    }
  };

  // =========================================================
  // Food item handlers (lotKey editable here)
  // =========================================================
  const handleFoodItemChange = (index, field, value) => {
    setPreview((prev) => {
      const items = [...prev.foodItems];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, foodItems: items };
    });
  };

  // =========================================================
  // Validation (must have address + image for all lots)
  // =========================================================
  const validatePreview = () => {
    if (!preview || !preview.lots || preview.lots.length === 0) {
      toast.error("No lots to import.");
      return false;
    }

    const invalid = preview.lots.filter(
      (l) =>
        !l.addressId ||
        l.addressId.trim() === "" ||
        !l.imageUrl ||
        l.imageUrl.trim() === ""
    );

    if (invalid.length > 0) {
      toast.error(
        `Please complete all lots: ${invalid.length} lot(s) missing address or image.`
      );
      return false;
    }

    return true;
  };

  // =========================================================
  // 3) Confirm → commit via BFF
  // =========================================================
  const handleConfirm = async () => {
    if (!preview) return;

    const ok = validatePreview();
    if (!ok) return;

    setMsg("Importing...");
    setError("");

    try {
      const res = await fetch(`${BFF_BASE}/api/import/lots-excel/commit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(preview),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Import failed");
      }

      toast.success("Lots created successfully.");
      setMsg("Lots created successfully.");
      setPreview(null);
      setActiveTab("upload");
      navigate("/bulk-import", { replace: true });
    } catch (err) {
      setError(err.message);
      setMsg("");
      toast.error(err.message);
    }
  };

  // =========================================================
  // Cancel
  // =========================================================
  const handleCancel = () => {
    setPreview(null);
    setActiveTab("upload");
    toast.info("Import cancelled.");
    navigate("/bulk-import", { replace: true });
  };

  // =========================================================
  // Helpers
  // =========================================================
  const getAddressLabel = (addr) =>
    `${addr.street}, ${addr.city}, ${addr.postalCode}`;

  const totalLots = preview?.lots?.length || 0;
  const completedLots =
    preview?.lots?.filter(
      (l) =>
        l.addressId &&
        l.addressId.trim() !== "" &&
        l.imageUrl &&
        l.imageUrl.trim() !== ""
    ).length || 0;
  const validationPct =
    totalLots > 0 ? Math.round((completedLots / totalLots) * 100) : 0;

  const handleDownloadTemplate = () => {
    const link = document.createElement("a");
    link.href = "/assets/foodrescue-import-template.xlsx";
    link.download = "foodrescue-import-template.xlsx";
    link.click();
    toast.info("Downloading template...");
  };

  return (
    <UserLayout>
      <style>{`
        .frl-soft-card {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 1.25rem;
          box-shadow: 0 12px 40px rgba(15, 23, 42, 0.02);
        }
        .frl-badge-chip {
          background: #e9edf3;
          border-radius: 999px;
          padding: 3px 14px;
          font-size: 0.78rem;
          font-weight: 600;
          color: #0f172a;
          display: inline-block;
        }
      `}</style>

      <div style={{ padding: "1.5rem" }}>
        {/* HEADER */}
        <div
          className="d-flex justify-content-between align-items-center mb-3 frl-soft-card"
          style={{ padding: "1.25rem 1.5rem" }}
        >
          <div className="d-flex align-items-center gap-3">
            <div
              style={{
                width: "52px",
                height: "52px",
                background: "#0f172a",
                borderRadius: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <i
                className="bi bi-cloud-arrow-up"
                style={{ color: "#fff", fontSize: "1.25rem" }}
              />
            </div>
            <div>
              <h2 className="h5 mb-1" style={{ color: "#0f172a" }}>
                Bulk Import Center
              </h2>
              <p
                className="mb-0"
                style={{ fontSize: "0.85rem", color: "#6b7280" }}
              >
                Advanced data management system for lots and food items
              </p>
            </div>
          </div>
          <button
            className="btn btn-dark btn-sm rounded-3"
            onClick={handleDownloadTemplate}
          >
            <i className="bi bi-download me-1" />
            Download Template
          </button>
        </div>

        {/* TOGGLE BAR */}
        <div
          className="frl-soft-card mb-3"
          style={{ borderRadius: "999px", padding: "0.45rem" }}
        >
          <div
            className="d-flex w-100"
            style={{ background: "#f4f6fb", borderRadius: "999px" }}
          >
            <button
              onClick={() => setActiveTab("upload")}
              className="border-0 flex-grow-1"
              style={{
                background: activeTab === "upload" ? "#0f172a" : "transparent",
                borderRadius: "999px",
                height: "42px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                fontWeight: 500,
                color: activeTab === "upload" ? "#fff" : "#0f172a",
              }}
            >
              <i className="bi bi-upload" />
              Upload
            </button>
            <button
              onClick={() => preview && setActiveTab("preview")}
              disabled={!preview}
              className="border-0 flex-grow-1"
              style={{
                background:
                  activeTab === "preview" ? "#0f172a" : "transparent",
                borderRadius: "999px",
                height: "42px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                fontWeight: 500,
                color: activeTab === "preview" ? "#fff" : "#0f172a",
              }}
            >
              <i className="bi bi-file-spreadsheet" />
              Preview &amp; Configure
              {preview?.lots ? (
                <span
                  style={{
                    background: "#122032",
                    padding: "0.1rem .75rem",
                    borderRadius: "999px",
                    fontSize: "0.65rem",
                    marginLeft: ".25rem",
                  }}
                >
                  {preview.lots.length} lots
                </span>
              ) : null}
            </button>
          </div>
        </div>

        {/* ================== UPLOAD VIEW ================== */}
        {activeTab === "upload" && (
          <div className="row g-3">
            <div className="col-lg-8">
              <div className="frl-soft-card" style={{ minHeight: "340px" }}>
                <div
                  className="px-3 py-3 border-bottom"
                  style={{ fontSize: "0.9rem", fontWeight: 600 }}
                >
                  File Upload Wizard
                  <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                    Upload your Excel file to begin the import process
                  </div>
                </div>
                <div className="p-4">
                  <div
                    onClick={handleChooseFile}
                    style={{
                      border: "1.5px dashed #d1d5db",
                      borderRadius: "1.5rem",
                      background: "#f8fafc",
                      minHeight: "200px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        width: "72px",
                        height: "72px",
                        background: "#0f172a",
                        borderRadius: "999px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "0.7rem",
                      }}
                    >
                      <i
                        className="bi bi-cloud-upload"
                        style={{ color: "#fff", fontSize: "1.5rem" }}
                      />
                    </div>
                    <div
                      style={{
                        fontWeight: 600,
                        color: "#0f172a",
                        fontSize: "0.9rem",
                      }}
                    >
                      Drop your Excel file here
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                      or click to browse from your computer
                    </div>
                    <button
                      className="btn btn-dark btn-sm mt-3 rounded-3"
                      type="button"
                    >
                      <i className="bi bi-folder2-open me-1" />
                      Browse Files
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls"
                      style={{ display: "none" }}
                      onChange={handleFileSelected}
                    />
                  </div>
                  <div className="mt-3" style={{ fontSize: "0.75rem" }}>
                    {msg && <div className="text-success">{msg}</div>}
                    {error && <div className="text-danger">{error}</div>}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="frl-soft-card">
                <div
                  className="px-3 py-3 border-bottom d-flex align-items-center gap-2"
                  style={{ fontSize: "0.9rem", fontWeight: 600 }}
                >
                  <i className="bi bi-info-circle" />
                  Upload Guidelines
                </div>
                <div className="p-3" style={{ fontSize: "0.78rem" }}>
                  {["Download Template", "Fill Data", "Upload File", "Configure"].map(
                    (title, i) => (
                      <div
                        key={title}
                        className="d-flex gap-3 mb-3 align-items-start"
                      >
                        <div
                          className="rounded-circle bg-dark text-white d-flex justify-content-center align-items-center"
                          style={{ width: 28, height: 28, fontSize: "0.7rem" }}
                        >
                          {i + 1}
                        </div>
                        <div>
                          <div className="fw-semibold">{title}</div>
                          <div className="text-muted">
                            {i === 0
                              ? "Get the pre-formatted Excel template"
                              : i === 1
                              ? "Complete all required fields"
                              : i === 2
                              ? "Drag & drop or browse to upload"
                              : "Add addresses and images for lots"}
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================== PREVIEW VIEW ================== */}
        {activeTab === "preview" && preview && (
          <>
            {/* STATS */}
            <div className="row g-3 mt-1 mb-3">
              {/* CARD 1 */}
              <div className="col-md-4">
                <div
                  className="frl-soft-card d-flex align-items-center gap-3 p-3"
                  style={{ minHeight: "110px" }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      background: "#eef2f9",
                      borderRadius: "1.25rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#0f172a",
                      fontSize: "1.2rem",
                    }}
                  >
                    <i className="bi bi-box" />
                  </div>
                  <div>
                    <div style={{ fontSize: "0.8rem", color: "#3f4a59" }}>
                      Total Lots
                    </div>
                    <div style={{ fontSize: "1.2rem", fontWeight: 600 }}>
                      {totalLots}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>
                      {preview?.foodItems?.length || 0} food items
                    </div>
                  </div>
                </div>
              </div>
              {/* CARD 2 */}
              <div className="col-md-4">
                <div
                  className="frl-soft-card d-flex align-items-center gap-3 p-3"
                  style={{ minHeight: "110px" }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      background: "#eef2f9",
                      borderRadius: "1.25rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#0f172a",
                      fontSize: "1.2rem",
                    }}
                  >
                    <i className="bi bi-arrow-up-right" />
                  </div>
                  <div>
                    <div style={{ fontSize: "0.8rem", color: "#3f4a59" }}>
                      Total Quantity
                    </div>
                    <div style={{ fontSize: "1.2rem", fontWeight: 600 }}>
                      {preview?.foodItems
                        ? preview.foodItems.reduce(
                            (sum, item) => sum + (Number(item.quantity) || 0),
                            0
                          )
                        : 0}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>
                      units across all items
                    </div>
                  </div>
                </div>
              </div>
              {/* CARD 3 */}
              <div className="col-md-4">
                <div
                  className="frl-soft-card d-flex align-items-center gap-3 p-3"
                  style={{ minHeight: "110px" }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      background: "#0f172a",
                      borderRadius: "1.25rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: "1.2rem",
                    }}
                  >
                    <i className="bi bi-check2-circle" />
                  </div>
                  <div style={{ width: "100%" }}>
                    <div style={{ fontSize: "0.8rem", color: "#3f4a59" }}>
                      Validation Progress
                    </div>
                    <div
                      className="d-flex justify-content-between align-items-center"
                      style={{ fontSize: "0.7rem", color: "#94a3b8" }}
                    >
                      <span>
                        {completedLots} / {totalLots} lots valid
                      </span>
                      <span style={{ fontWeight: 600, color: "#0f172a" }}>
                        {validationPct}%
                      </span>
                    </div>
                    <div
                      className="progress mt-1"
                      style={{ height: "6px", background: "#e2e8f0" }}
                    >
                      <div
                        className="progress-bar"
                        style={{
                          width: `${validationPct}%`,
                          background: "#0f172a",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* LOTS CONFIG */}
            <div className="frl-soft-card mb-3">
              <div className="px-3 py-3 border-bottom d-flex justify-content-between align-items-center">
                <div>
                  <strong>Lots Configuration</strong>
                  <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                    Configure delivery addresses and images for each lot
                  </div>
                </div>
                <span className="badge bg-dark rounded-pill">
                  {totalLots} lots
                </span>
              </div>

              <div
                className="px-3 py-2"
                style={{ fontSize: "0.72rem", color: "#475569" }}
              >
                <i className="bi bi-info-circle me-1" />
                A lot is valid when it has an address + image.
              </div>

              <div className="table-responsive">
                <table className="table table-borderless align-middle mb-0">
                  <thead
                    style={{
                      background: "#0f172a",
                      color: "#ffffff",
                      fontSize: "0.75rem",
                    }}
                  >
                    <tr>
                      <th style={{ width: 36 }}>#</th>
                      <th>Lot Key</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th>Category</th>
                      <th>Tags</th>
                      <th>Address *</th>
                      <th>Image</th>
                    </tr>
                  </thead>
                  <tbody style={{ fontSize: "0.75rem" }}>
                    {preview?.lots?.map((lot, idx) => (
                      <tr
                        key={idx}
                        style={{ borderBottom: "1px solid #e2e8f0" }}
                      >
                        <td>{idx + 1}</td>
                        <td style={{ minWidth: 120 }}>
                          <span
                            style={{
                              ...pillInputStyle,
                              background: "#e2e8f0",
                              borderColor: "transparent",
                              fontWeight: 500,
                            }}
                          >
                            {lot.lotKey}
                          </span>
                        </td>
                        <td style={{ maxWidth: 200 }}>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={lot.description || ""}
                            onChange={(e) =>
                              handleLotDescriptionChange(idx, e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <span className="frl-badge-chip">
                            {lot.status || "N/A"}
                          </span>
                        </td>
                        <td>
                          <span className="frl-badge-chip">
                            {lot.category || "N/A"}
                          </span>
                        </td>
                        <td style={{ maxWidth: 140 }}>
                          {(lot.tags || []).map((t) => (
                            <span
                              key={t}
                              className="frl-badge-chip me-1 mb-1"
                              style={{ display: "inline-block" }}
                            >
                              {t}
                            </span>
                          ))}
                        </td>
                        <td style={{ minWidth: 180 }}>
                          <select
                            className="form-select form-select-sm"
                            value={lot.addressId || ""}
                            onChange={(e) =>
                              handleAddressChange(idx, e.target.value)
                            }
                          >
                            <option value="">Select address...</option>
                            {addresses.map((addr) => (
                              <option key={addr.id} value={addr.id}>
                                {getAddressLabel(addr)}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td style={{ minWidth: 190 }}>
                          <div className="d-flex gap-2 align-items-center">
                            <input
                              className="form-control form-control-sm"
                              type="text"
                              placeholder="Paste image URL..."
                              value={lot.imageUrl || ""}
                              onChange={(e) =>
                                handleImageUrlChange(idx, e.target.value)
                              }
                            />
                            <button
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() =>
                                document
                                  .getElementById(`img-upload-${idx}`)
                                  ?.click()
                              }
                            >
                              <i className="bi bi-upload" />
                            </button>
                            <input
                              type="file"
                              id={`img-upload-${idx}`}
                              style={{ display: "none" }}
                              accept="image/*"
                              onChange={(e) => handleImageUpload(idx, e)}
                            />
                          </div>
                          {uploadingIndex === idx && (
                            <div className="text-muted" style={{ fontSize: 10 }}>
                              uploading...
                            </div>
                          )}
                          {lot.imageUrl && (
                            <img
                              src={lot.imageUrl}
                              alt="img"
                              style={{
                                width: 60,
                                height: 38,
                                objectFit: "cover",
                                borderRadius: 6,
                                marginTop: 4,
                                border: "1px solid #e2e8f0",
                              }}
                            />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* FOOD ITEMS */}
            <div className="frl-soft-card mb-3">
              <div className="px-3 py-3 d-flex justify-content-between align-items-center border-bottom">
                <div>
                  <strong>Food Items Configuration</strong>
                  <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                    Review and edit food items associated with each lot
                  </div>
                </div>
                <span className="badge bg-dark rounded-pill">
                  {preview?.foodItems?.length || 0} items
                </span>
              </div>

              <div className="table-responsive">
                <table className="table table-borderless align-middle mb-0">
                  <thead
                    style={{
                      background: "#0f172a",
                      color: "#ffffff",
                      fontSize: "0.75rem",
                    }}
                  >
                    <tr>
                      <th style={{ width: 36 }}>#</th>
                      <th>Lot Key</th>
                      <th>Item Name</th>
                      <th>Category</th>
                      <th>Expiry Date</th>
                      <th>Quantity</th>
                      <th>UOM</th>
                    </tr>
                  </thead>
                  <tbody style={{ fontSize: "0.75rem" }}>
                    {preview?.foodItems?.map((fi, idx) => (
                      <tr
                        key={idx}
                        style={{ borderBottom: "1px solid #e2e8f0" }}
                      >
                        <td>{idx + 1}</td>
                        <td>
                          <input
                            style={pillInputStyle}
                            value={fi.lotKey || ""}
                            onChange={(e) =>
                              handleFoodItemChange(idx, "lotKey", e.target.value)
                            }
                          />
                        </td>
                        <td style={{ minWidth: 160 }}>
                          <input
                            className="form-control form-control-sm"
                            type="text"
                            value={fi.itemName || ""}
                            onChange={(e) =>
                              handleFoodItemChange(
                                idx,
                                "itemName",
                                e.target.value
                              )
                            }
                          />
                        </td>
                        <td>
                          <span className="frl-badge-chip">
                            {fi.category || "N/A"}
                          </span>
                        </td>
                        <td style={{ minWidth: 140 }}>
                          <input
                            className="form-control form-control-sm"
                            type="date"
                            value={fi.expiryDate || ""}
                            onChange={(e) =>
                              handleFoodItemChange(
                                idx,
                                "expiryDate",
                                e.target.value
                              )
                            }
                          />
                        </td>
                        <td style={{ width: 90 }}>
                          <input
                            className="form-control form-control-sm"
                            type="number"
                            value={fi.quantity || ""}
                            onChange={(e) =>
                              handleFoodItemChange(
                                idx,
                                "quantity",
                                e.target.value
                              )
                            }
                          />
                        </td>
                        <td style={{ width: 90 }}>
                          <input
                            className="form-control form-control-sm"
                            type="text"
                            value={fi.unitOfMeasure || ""}
                            onChange={(e) =>
                              handleFoodItemChange(
                                idx,
                                "unitOfMeasure",
                                e.target.value
                              )
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="px-3 py-3 d-flex justify-content-end gap-2">
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-dark btn-sm d-flex align-items-center gap-1"
                  onClick={handleConfirm}
                >
                  <i className="bi bi-check2-circle" />
                  Confirm &amp; Import
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </UserLayout>
  );
}
