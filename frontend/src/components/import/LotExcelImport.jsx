import React, { useState } from "react";
import { previewLotExcel, commitLotExcel } from "../../services/lotImportApi";

export default function LotExcelImport() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);
  const [uploadingIndex, setUploadingIndex] = useState(null); // which row is uploading

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
      // make sure each lot has imageUrl field so UI is controlled
      const lotsWithImage = (data.lots || []).map((l) => ({
        ...l,
        imageUrl: l.imageUrl || "",
      }));
      setPreview({ ...data, lots: lotsWithImage });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // user typed/pasted image url
  const handleImageUrlChange = (index, value) => {
    setPreview((prev) => {
      const lots = [...prev.lots];
      lots[index] = { ...lots[index], imageUrl: value };
      return { ...prev, lots };
    });
  };

  // user picked a file → upload to cloudinary → set imageUrl
  const handleImageUpload = async (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingIndex(index);

    const formData = new FormData();
    formData.append("file", file);
    // your preset
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
      } else {
        alert("Image upload failed");
      }
    } catch (err) {
      alert("Failed to upload image");
    } finally {
      setUploadingIndex(null);
      // optional: clear the file input
      e.target.value = "";
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
    } catch (err) {
      setError(err.message);
    } finally {
      setCommitting(false);
    }
  };

  return (
    <div
      className="lot-import-container"
      style={{ background: "#fff", padding: "1rem", borderRadius: "8px" }}
    >
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
              <table
                border="1"
                cellPadding="6"
                style={{ width: "100%", marginBottom: "1rem" }}
              >
                <thead>
                  <tr>
                    <th>LotKey</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Category</th>
                    <th>AddressId</th>
                    <th>Tags</th>
                    <th>Image URL / Upload</th>
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
                      <td>
                        {/* manual url */}
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
                        {/* file upload */}
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
          ) : (
            <p>No lots found in file.</p>
          )}

          <h3>Food Items Preview</h3>
          {preview.foodItems && preview.foodItems.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table
                border="1"
                cellPadding="6"
                style={{ width: "100%", marginBottom: "1rem" }}
              >
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
