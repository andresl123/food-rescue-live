// src/pages/TestLotImportWithAddresses.jsx
import React, { useRef, useState, useEffect } from "react";

const LOT_SERVICE_BASE = "http://localhost:8081";
const ADDRESS_SERVICE_BASE = "http://localhost:8080";
const AUTH_TOKEN =
  "Bearer eyJraWQiOiJCR3FMdC1pa0RCTXBMSmdHN1QtSFA1cGN4cVFFejBjNlcxZGNfLXlFSHY0IiwidHlwIjoiSldUIiwiYWxnIjoiUlMyNTYifQ.eyJhdWQiOiJmb29kcmVzY3VlLWJmZiIsInN1YiI6IjY4ZjZmNjhmMDE3MjhjMWMwNmRhNDc5NyIsInJvbGVzIjpbIlJFQ0VJVkVSIl0sImlzcyI6ImZvb2RyZXNjdWUtYXV0aCIsInR5cCI6ImFjY2VzcyIsImV4cCI6MTc2MjY0MjQ2OCwiaWF0IjoxNzYyNjQwNjY4LCJqdGkiOiJjMThjODMxNS0xMDM5LTQyNGQtYWJiNC00YTIwZDNkODNlMjEiLCJlbWFpbCI6Iml0cy5oYXJtZWV0LnNpbmdoQG91dGxvb2suY29tIiwic3RhdHVzIjoiQUNUSVZFIn0.LD1KLQkzpXk3qX_KQHN8aOB9kBfTczlwym_juz_v3hPmbv7MrgetJ67GVC9m42mFwT7iyWaEnbKul45CI7aiEXguWV8o_V0wzBYXmc7DbrdJEYqYZlwO-UTxcANboGa8jcp12gDJd-eK8irE3Tc_kNFbGCOBVsEACeySwjokJJfX2yTu23X3Gpbmo01-D9OQGfcq9X_uWb6aH5Tv6fW-WEhOSiEPdL6UXfpPJrdLidMPUwBQhFAAyZuEQcQFlyb-dw33EHpslcx3ME7NL7HHGodFdXVqOmtD98Dymq38aSxJlLpujxU8ymDxycgNmO1a86Eg_3EW3_6eq63jumJ9WA";

// the one that worked in Postman
const USER_ID = "690d2a7946bb798cf6b8e416";

export default function TestLotImportWithAddresses() {
  const fileInputRef = useRef(null);

  const [preview, setPreview] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [addrError, setAddrError] = useState("");
  const [uploadingIndex, setUploadingIndex] = useState(null);

  // 1) fetch user addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await fetch(
          `${ADDRESS_SERVICE_BASE}/api/v1/addresses/user/${USER_ID}`,
          {
            method: "GET",
            mode: "cors",
            headers: {
              Authorization: AUTH_TOKEN,
              Accept: "application/json",
            },
          }
        );
        if (!res.ok) {
          const txt = await res.text();
          console.error("address fetch failed:", txt);
          setAddrError(`Failed to load addresses (${res.status})`);
          return;
        }
        const data = await res.json();
        setAddresses(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("address fetch error:", err);
        setAddrError(err.message);
      }
    };
    fetchAddresses();
  }, []);

  // open file chooser
  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  // 2) upload excel → preview
  const handleFileSelected = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setMsg("Uploading and building preview...");
    setError("");
    setPreview(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(
        `${LOT_SERVICE_BASE}/api/v1/import/lots-excel/preview`,
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: AUTH_TOKEN,
          },
        }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Preview failed");
      }

      const data = await res.json();

      // ensure every lot has imageUrl property so inputs are controlled
      const lotsWithImage = (data.lots || []).map((l) => ({
        ...l,
        imageUrl: l.imageUrl || "",
      }));

      setPreview({ ...data, lots: lotsWithImage });
      setMsg("Preview ready. Pick address & image for each lot, then confirm.");
    } catch (err) {
      setError(err.message);
      setMsg("");
    }
  };

  // 3) address dropdown change
  const handleAddressChange = (index, addressId) => {
    setPreview((prev) => {
      const lots = [...prev.lots];
      lots[index] = { ...lots[index], addressId };
      return { ...prev, lots };
    });
  };

  // 4) manual image URL change
  const handleImageUrlChange = (index, imageUrl) => {
    setPreview((prev) => {
      const lots = [...prev.lots];
      lots[index] = { ...lots[index], imageUrl };
      return { ...prev, lots };
    });
  };

  // 5) upload to Cloudinary (same as your reference)
  const handleImageUpload = async (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingIndex(index);

    const formData = new FormData();
    formData.append("file", file); // same field name
    formData.append("upload_preset", "foodrescue_lot_uploads"); // same preset

    try {
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/da8bvrcjg/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();

      // only store the image URL
      if (data.secure_url) {
        setPreview((prev) => {
          const lots = [...prev.lots];
          lots[index] = { ...lots[index], imageUrl: data.secure_url };
          return { ...prev, lots };
        });
      } else {
        alert("Image upload failed");
      }
    } catch (err) {
      alert("Image upload failed");
    } finally {
      setUploadingIndex(null);
      e.target.value = "";
    }
  };

  // 6) commit
  const handleConfirm = async () => {
    if (!preview) return;
    setMsg("Importing...");
    setError("");

    try {
      const res = await fetch(
        `${LOT_SERVICE_BASE}/api/v1/import/lots-excel/commit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: AUTH_TOKEN,
          },
          body: JSON.stringify(preview), // this now includes imageUrl per lot
        }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Import failed");
      }

      const data = await res.json();
      setMsg(
        `Done: ${data.lotsCreated} lot(s), ${data.itemsCreated} item(s) imported.`
      );
    } catch (err) {
      setError(err.message);
      setMsg("");
    }
  };

  const getAddressLabel = (addr) =>
    `${addr.street}, ${addr.city}, ${addr.postalCode}`;

  return (
    <div style={{ padding: "1.5rem" }}>
      <h2>Import Lots from Excel (with address + image)</h2>

      <p>
        Addresses loaded: <b>{addresses.length}</b>
      </p>
      {addrError && <p style={{ color: "red" }}>{addrError}</p>}

      <button onClick={handleChooseFile}>1) Choose Excel & Preview</button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        style={{ display: "none" }}
        onChange={handleFileSelected}
      />

      {msg && <p style={{ color: "green" }}>{msg}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* LOTS TABLE */}
      {preview?.lots && preview.lots.length > 0 && (
        <>
          <h3 style={{ marginTop: "1.5rem" }}>Lots Preview</h3>
          <div style={{ overflowX: "auto" }}>
            <table
              border="1"
              cellPadding="6"
              style={{ width: "100%", marginBottom: "1rem" }}
            >
              <thead>
                <tr>
                  <th>#</th>
                  <th>LotKey</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Category</th>
                  <th>Tags</th>
                  <th>Address</th>
                  <th>Image URL / Upload</th>
                </tr>
              </thead>
              <tbody>
                {preview.lots.map((lot, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>{lot.lotKey}</td>
                    <td>{lot.description}</td>
                    <td>{lot.status}</td>
                    <td>{lot.category}</td>
                    <td>{(lot.tags || []).join(", ")}</td>
                    <td>
                      <select
                        value={lot.addressId || ""}
                        onChange={(e) =>
                          handleAddressChange(idx, e.target.value)
                        }
                      >
                        <option value="">-- select address --</option>
                        {addresses.map((addr) => (
                          <option key={addr.id} value={addr.id}>
                            {getAddressLabel(addr)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="text"
                        placeholder="https://..."
                        value={lot.imageUrl || ""}
                        onChange={(e) =>
                          handleImageUrlChange(idx, e.target.value)
                        }
                        style={{ width: "160px", marginBottom: "4px" }}
                      />
                      <br />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(idx, e)}
                      />
                      {uploadingIndex === idx && (
                        <div style={{ fontSize: "0.75rem" }}>
                          uploading...
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* FOOD ITEMS TABLE */}
      {preview?.foodItems && preview.foodItems.length > 0 && (
        <>
          <h3>Food Items Preview</h3>
          <div style={{ overflowX: "auto" }}>
            <table
              border="1"
              cellPadding="6"
              style={{ width: "100%", marginBottom: "1rem" }}
            >
              <thead>
                <tr>
                  <th>#</th>
                  <th>LotKey</th>
                  <th>Item Name</th>
                  <th>Category</th>
                  <th>Expiry Date</th>
                  <th>Quantity</th>
                  <th>UOM</th>
                </tr>
              </thead>
              <tbody>
                {preview.foodItems.map((fi, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>{fi.lotKey}</td>
                    <td>{fi.itemName}</td>
                    <td>{fi.category}</td>
                    <td>{fi.expiryDate}</td>
                    <td>{fi.quantity}</td>
                    <td>{fi.unitOfMeasure}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {preview?.lots && preview.lots.length > 0 && (
        <button onClick={handleConfirm}>2) Confirm & Import</button>
      )}

      {preview && (
        <pre
          style={{
            background: "#f5f5f5",
            padding: "0.75rem",
            marginTop: "1rem",
            maxHeight: "300px",
            overflow: "auto",
          }}
        >
          {JSON.stringify(preview, null, 2)}
        </pre>
      )}
    </div>
  );
}
