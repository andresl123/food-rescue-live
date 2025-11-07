// src/pages/TestLotImportWithAddresses.jsx
import React, { useRef, useState, useEffect } from "react";

const LOT_SERVICE_BASE = "http://localhost:8081"; // for /import preview/commit
const ADDRESS_SERVICE_BASE = "http://localhost:8080"; // for /api/v1/addresses/user/{userId}
const AUTH_TOKEN =
  "Bearer eyJraWQiOiJCR3FMdC1pa0RCTXBMSmdHN1QtSFA1cGN4cVFFejBjNlcxZGNfLXlFSHY0IiwidHlwIjoiSldUIiwiYWxnIjoiUlMyNTYifQ..."; // <-- your same token
const USER_ID = "690d2a7946bb798cf6b8e416"; // 👈 put the actual userId (the one in your token)

export default function TestLotImportWithAddresses() {
  const fileInputRef = useRef(null);

  const [preview, setPreview] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  // 1) fetch addresses right away (or you can do it after preview)
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await fetch(
          `${ADDRESS_SERVICE_BASE}/api/v1/addresses/user/${USER_ID}`,
          {
            headers: {
              Authorization: AUTH_TOKEN,
            },
          }
        );
        if (!res.ok) {
          throw new Error("Failed to load addresses");
        }
        const data = await res.json();
        // data is Flux<Address> → array
        setAddresses(data);
      } catch (err) {
        console.error(err);
        // don't block the page, just show optional error
      }
    };
    fetchAddresses();
  }, []);

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
      // backend sends addressId: null → we keep it
      setPreview(data);
      setMsg("Preview ready. Pick address for each lot, then confirm.");
    } catch (err) {
      setError(err.message);
      setMsg("");
    }
  };

  // 3) when user selects address for a lot
  const handleAddressChange = (index, addressId) => {
    setPreview((prev) => {
      const lots = [...prev.lots];
      lots[index] = { ...lots[index], addressId };
      return { ...prev, lots };
    });
  };

  // 4) confirm → commit
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
          body: JSON.stringify(preview),
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

  // helper: how to show address in dropdown
  const getAddressLabel = (addr) => {
    // guess fields – adjust to your Address model
    return (
      addr.label ||
      addr.name ||
      addr.addressLine1 ||
      `${addr.city || ""} ${addr.postalCode || ""}` ||
      addr.id
    );
  };

  return (
    <div style={{ padding: "1.5rem" }}>
      <h2>Import Lots from Excel (with address dropdown)</h2>

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

      {/* TABLE: LOTS */}
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
                            {getAddressLabel(addr)} ({addr.id})
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* TABLE: FOOD ITEMS */}
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

      {/* CONFIRM BUTTON */}
      {preview?.lots && preview.lots.length > 0 && (
        <button onClick={handleConfirm}>2) Confirm & Import</button>
      )}

      {/* raw dump for debugging */}
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
