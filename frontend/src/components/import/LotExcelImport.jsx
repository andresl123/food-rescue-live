// src/components/import/LotExcelImport.jsx
import React, { useState } from "react";
import { previewLotExcel, commitLotExcel } from "../../services/lotImportApi";

export default function LotExcelImport() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setPreview(null);
    setError("");
    setSuccess(null);
  };

  const handlePreview = async () => {
    if (!file) {
      setError("Please select an Excel file first.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess(null);
    try {
      const data = await previewLotExcel(file);
      setPreview(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCommit = async () => {
    if (!preview) return;
    setCommitting(true);
    setError("");
    try {
      const result = await commitLotExcel(preview);
      setSuccess(
        `Imported ${result.lotsCreated} lots and ${result.itemsCreated} food items.`
      );
      // you can also clear preview if you want
      // setPreview(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setCommitting(false);
    }
  };

  return (
    <div className="lot-import-container" style={{ background: "#fff", padding: "1rem", borderRadius: "8px" }}>
      <h2 style={{ marginBottom: "1rem" }}>Import Lots from Excel</h2>

      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileChange}
        style={{ marginBottom: "1rem" }}
      />

      <div style={{ marginBottom: "1rem" }}>
        <button onClick={handlePreview} disabled={loading || !file}>
          {loading ? "Parsing..." : "Preview"}
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      {/* PREVIEW TABLES */}
      {preview && (
        <>
          <h3>Lots Preview</h3>
          {preview.lots && preview.lots.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table border="1" cellPadding="6" style={{ width: "100%", marginBottom: "1rem" }}>
                <thead>
                  <tr>
                    <th>LotKey</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Category</th>
                    <th>AddressId</th>
                    <th>Tags</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.lots.map((lot, idx) => (
                    <tr key={idx}>
                      <td>{lot.lotKey}</td>
                      <td>{lot.description}</td>
                      <td>{lot.status}</td>
                      <td>{lot.category}</td>
                      <td>{lot.addressId}</td>
                      <td>{(lot.tags || []).join(", ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No lots found in file.</p>
          )}

          <h3>Food Items Preview</h3>
          {preview.foodItems && preview.foodItems.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table border="1" cellPadding="6" style={{ width: "100%", marginBottom: "1rem" }}>
                <thead>
                  <tr>
                    <th>LotKey</th>
                    <th>Item Name</th>
                    <th>Category</th>
                    <th>Expiry Date</th>
                    <th>Quantity</th>
                    <th>UOM</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.foodItems.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.lotKey}</td>
                      <td>{item.itemName}</td>
                      <td>{item.category}</td>
                      <td>{item.expiryDate}</td>
                      <td>{item.quantity}</td>
                      <td>{item.unitOfMeasure}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No food items found in file.</p>
          )}

          <button onClick={handleCommit} disabled={committing}>
            {committing ? "Importing..." : "Confirm & Import"}
          </button>
        </>
      )}
    </div>
  );
}
