import React, { useEffect, useState } from "react";
import { getLots, getFoodItemsByLot } from "../../../services/lotService";
import { getUserProfile } from "../../../services/loginServices";
import { jwtDecode } from "jwt-decode";
import CreateLotModal from "./CreateLotModal";
import FoodItemModal from "./FoodItemModal";
import EditLotModal from "./EditLotModal";
import DonorStatsCards from "./DonorStatsCards";
import DonationList from "./DonationList";

export default function DonorDashboard() {
  const [lots, setLots] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    pickedUp: 0,
    delivered: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState({ name: "User" });
  const [selectedLotId, setSelectedLotId] = useState(null);
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLot, setSelectedLot] = useState(null);
  const [selectedTabList, setSelectedTabList] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("All Lots");


  // -------------------- HANDLERS --------------------
  const handleEditLot = (lot) => {
    setSelectedLot(lot);
    setShowEditModal(true);
  };

  const handleAddItem = (lotId) => {
    setSelectedLotId(lotId);
    setShowFoodModal(true);
  };

  // -------------------- FETCH USER PROFILE --------------------
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const result = await getUserProfile();

        if (result.success && result.data) {
          console.log("User profile in donor dashboard:", result.data);
          setUser({
            name: result.data.email?.split("@")[0] || "User",
            role: result.data.role || result.data.roles?.[0] || "",
          });
        } else {
          console.error("Failed to fetch user info:", result.message);
        }
      } catch (err) {
        console.error("Error fetching user info:", err);
      }
    };

    fetchUserData();
  }, []);


  // -------------------- FETCH LOTS --------------------

  const normalizeStatus = (status) => status?.toLowerCase().trim();

  const fetchLots = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getLots();

      if (!response.success || !Array.isArray(response.data)) {
        setError("Failed to load donor dashboard.");
        setLoading(false);
        return;
      }

      // ✅ Fetch food item counts in parallel, but safely
      const lotsWithCounts = await Promise.all(
        response.data.map(async (lot) => {
          try {
            const lotId = lot.lotId || lot.id || lot._id;

            const itemsResponse = await getFoodItemsByLot(lotId);

            // ✅ Safely extract items array
            const items =
              itemsResponse.success && Array.isArray(itemsResponse.data)
                ? itemsResponse.data
                : [];

            // ✅ Count + Attach items directly
            return {
              ...lot,
              totalItems: items.length,
              items, // attach the full array for modal use
            };
          } catch (err) {
            console.warn(`Error fetching items for lot ${lot.id || lot._id}:`, err);
            return { ...lot, totalItems: 0, items: [] };
          }
        })
      );

      setLots(lotsWithCounts);

      setStats({
        total: lotsWithCounts.length,
        pending: lotsWithCounts.filter(
          (l) => l.status?.toLowerCase() === "pending"
        ).length,
        expiringSoon: lotsWithCounts.filter(
          (l) => l.status?.toLowerCase() === "expiring_soon"
        ).length,
        delivered: lotsWithCounts.filter(
          (l) => l.status?.toLowerCase() === "delivered"
        ).length,
      });
    } catch (err) {
      console.error("Error loading lots:", err);
      setError("Unexpected error while loading lots.");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchLots();
  }, []);

  // -------------------- LOADING --------------------
  if (loading)
    return (
      <div className="text-center mt-5 text-secondary">
        <div className="spinner-border text-dark" role="status" />
        <p className="mt-2">Loading dashboard...</p>
      </div>
    );

    // -------------------- FILTERED LOTS --------------------
    const filteredLots = lots
      // Handle All / Delivered toggle
      .filter((lot) =>
        selectedTabList === "All"
          ? true
          : normalizeStatus(lot.status) === "delivered"
      )
      // Apply status filter from sidebar
      .filter((lot) => {
        if (selectedStatusFilter === "All Lots") return true;
        return normalizeStatus(lot.status) === selectedStatusFilter
          .toLowerCase()
          .replace(" ", "_"); // converts "Expiring Soon" → "expiring_soon"
      })
      // Apply search
      .filter((lot) =>
        lot.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );





  // -------------------- MAIN RETURN --------------------
  return (
    <div
      className="container-fluid px-4"
      style={{
//         background: "linear-gradient(to bottom, #f9fdf9, #f0f0f0)", // light gray bottom tint
        minHeight: "calc(100vh - 80px)", // prevents white overlap under navbar
//         borderTop: "1px solid #e5e7eb",
      }}
    >

      {/* -------------------- HEADER -------------------- */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        {/* Left: Title + subtitle */}
        <div>
          <h2
            className=" mb-1"
            style={{
              color: "#111827",
              fontSize: "1.75rem",
              letterSpacing: "-0.5px",
            }}
          >
            Donor Dashboard
          </h2>
          <p
            className="mb-0"
            style={{
              color: "#6b7280",
              fontSize: "1rem",
              fontWeight: 300,
            }}
          >
            Manage your food donations and track your community impact
          </p>
        </div>

        {/* Right: Create button */}
        <button
          className="btn fw-semibold"
          onClick={() => setShowModal(true)}
          style={{
            backgroundColor: "#111827",
            color: "white",
            borderRadius: "10px",
            padding: "10px 20px",
            fontSize: "0.95rem",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            transition: "background 0.2s ease, transform 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#000";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#111827";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <i className="bi bi-plus-lg me-2"></i>
          Create New Lot
        </button>
      </div>

      {/* -------------------- STATS -------------------- */}
      <DonorStatsCards stats={stats} />

      {/* -------------------- MAIN GRID -------------------- */}
      <div className="row mt-4">
        {/* Left: Food Lots */}
        <div className="col-lg-8">
          <div
            className="bg-white shadow-sm rounded-4 p-4 mb-4"
            style={{ border: "1px solid #e5e7eb" }}
          >
            <div className="mb-4">
              {/* Heading + subtitle */}
              <div className="mb-3">
                <h5
                  className="fw-semibold mb-1"
                  style={{ color: "#111827", fontSize: "1.15rem" }}
                >
                  Your Food Lots
                </h5>
                <p
                  className="mb-0"
                  style={{ color: "#6b7280", fontSize: "0.95rem", fontWeight: 500 }}
                >
                  Manage and track your listed items
                </p>
              </div>

              <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mt-2">
                {/* --- Toggle Buttons --- */}
                <div
                  className="d-flex bg-light rounded-pill p-1 flex-grow-1"
                  style={{
                    border: "1px solid #e5e7eb",
                    overflow: "hidden",
                    height: "46px",
                  }}
                >
                  <button
                    className={`btn rounded-pill fw-semibold flex-fill py-2 ${
                      selectedTabList === "All" ? "bg-white shadow-sm" : "bg-transparent"
                    }`}
                    style={{
                      color: "#111827",
                      fontSize: "0.95rem",
                      border: "none",
                      transition: "all 0.2s ease",
                    }}
                    onClick={() => setSelectedTabList("All")}
                  >
                    All
                  </button>

                  <button
                    className={`btn rounded-pill fw-semibold flex-fill py-2 ${
                      selectedTabList === "Delivered" ? "bg-white shadow-sm" : "bg-transparent"
                    }`}
                    style={{
                      color: "#111827",
                      fontSize: "0.95rem",
                      border: "none",
                      transition: "all 0.2s ease",
                    }}
                    onClick={() => setSelectedTabList("Delivered")}
                  >
                    Delivered
                  </button>
                </div>

                {/* --- Search Bar --- */}
                <div className="position-relative" style={{ width: "260px" }}>
                  <i
                    className="bi bi-search position-absolute top-50 translate-middle-y text-muted"
                    style={{ left: "14px" }}
                  ></i>
                  <input
                    type="text"
                    className="form-control ps-5"
                    placeholder="Search lots..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      borderRadius: "50px",
                      fontSize: "0.9rem",
                      border: "1px solid #e5e7eb",
                      height: "46px",
                    }}
                  />
                </div>
              </div>

            </div>

            <DonationList
              donations={filteredLots}
              onAddItem={handleAddItem}
              onEditLot={handleEditLot}
            />
          </div>
        </div>

        <div className="col-lg-4">
          {/* -------------------- FILTER BY STATUS -------------------- */}
          <div
            className="bg-white shadow-sm rounded-4 p-4 mb-4"
            style={{ border: "1px solid #e5e7eb" }}
          >
            <h5
              className="fw-semibold mb-1"
              style={{ color: "#111827", fontSize: "1.15rem" }}
            >
              <i className="bi bi-funnel me-2 text-muted"></i>
              Filter by Status
            </h5>
            <p
              className="mb-3"
              style={{ color: "#6b7280", fontSize: "0.95rem", fontWeight: 500 }}
            >
              View lots by their current status
            </p>

            {/* Status List */}
            <div className="d-flex flex-column gap-2">
              {[
                { label: "All Lots", color: "#6b7280", count: lots.length },
                {
                  label: "Active",
                  color: "#22c55e",
                  count: lots.filter((l) => l.status?.toLowerCase() === "active").length,
                },
                {
                  label: "Pending",
                  color: "#eab308",
                  count: lots.filter((l) => l.status?.toLowerCase() === "pending").length,
                },
                {
                  label: "Delivered",
                  color: "#3b82f6",
                  count: lots.filter((l) => l.status?.toLowerCase() === "delivered").length,
                },
                {
                  label: "Expiring Soon",
                  color: "#f97316",
                  count: lots.filter((l) => l.status?.toLowerCase() === "expiring_soon").length,
                },
                {
                  label: "Inactive",
                  color: "#374151",
                  count: lots.filter((l) => l.status?.toLowerCase() === "inactive").length,
                },
              ].map((status, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedStatusFilter(status.label)}
                  className={`d-flex justify-content-between align-items-center px-3 py-2 rounded-3 ${
                    selectedStatusFilter === status.label ? "bg-dark text-white" : "bg-light"
                  }`}
                  style={{
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <span
                      className="rounded-circle"
                      style={{
                        backgroundColor: status.color,
                        width: "10px",
                        height: "10px",
                        display: "inline-block",
                      }}
                    ></span>
                    <span
                      className="fw-semibold"
                      style={{
                        fontSize: "0.95rem",
                        color:
                          selectedStatusFilter === status.label ? "#ffffff" : "#111827",
                      }}
                    >
                      {status.label}
                    </span>
                  </div>
                  <span
                    className={`badge ${
                      selectedStatusFilter === status.label
                        ? "bg-secondary"
                        : "bg-white text-dark border"
                    }`}
                  >
                    {status.count}
                  </span>
                </div>
              ))}
            </div>
          </div>


          {/* Tips for Success */}
{/*           <div */}
{/*             className="bg-white shadow-sm rounded-4 p-4 mt-3" */}
{/*             style={{ */}
{/*               border: "1px solid #e5e7eb", */}
{/*             }} */}
{/*           > */}
{/*             <h6 */}
{/*               className="fw-semibold mb-4" */}
{/*               style={{ color: "#111827", fontSize: "1.05rem" }} */}
{/*             > */}
{/*               Tips for Success */}
{/*             </h6> */}

{/*             <ul className="list-unstyled d-flex flex-column gap-4 mb-0"> */}
{/*                */}{/* Tip 1 */}
{/*               <li className="d-flex align-items-start"> */}
{/*                 <div */}
{/*                   className="d-flex align-items-center justify-content-center me-3" */}
{/*                   style={{ */}
{/*                     backgroundColor: "rgba(34,197,94,0.1)", */}
{/*                     color: "#16a34a", */}
{/*                     width: "36px", */}
{/*                     height: "36px", */}
{/*                     borderRadius: "50%", */}
{/*                   }} */}
{/*                 > */}
{/*                   <i className="bi bi-check-circle" style={{ fontSize: "1.1rem" }}></i> */}
{/*                 </div> */}
{/*                 <div> */}
{/*                   <h6 */}
{/*                     className="fw-semibold mb-1" */}
{/*                     style={{ color: "#111827", fontSize: "0.95rem" }} */}
{/*                   > */}
{/*                     Add clear photos */}
{/*                   </h6> */}
{/*                   <p className="mb-0" style={{ color: "#6b7280", fontSize: "0.9rem" }}> */}
{/*                     Lots with photos get 3x more interest */}
{/*                   </p> */}
{/*                 </div> */}
{/*               </li> */}

{/*                */}{/* Tip 2 */}
{/*               <li className="d-flex align-items-start"> */}
{/*                 <div */}
{/*                   className="d-flex align-items-center justify-content-center me-3" */}
{/*                   style={{ */}
{/*                     backgroundColor: "rgba(59,130,246,0.1)", */}
{/*                     color: "#2563eb", */}
{/*                     width: "36px", */}
{/*                     height: "36px", */}
{/*                     borderRadius: "50%", */}
{/*                   }} */}
{/*                 > */}
{/*                   <i className="bi bi-clock" style={{ fontSize: "1.1rem" }}></i> */}
{/*                 </div> */}
{/*                 <div> */}
{/*                   <h6 */}
{/*                     className="fw-semibold mb-1" */}
{/*                     style={{ color: "#111827", fontSize: "0.95rem" }} */}
{/*                   > */}
{/*                     Flexible pickup times */}
{/*                   </h6> */}
{/*                   <p className="mb-0" style={{ color: "#6b7280", fontSize: "0.9rem" }}> */}
{/*                     Wider windows help more people */}
{/*                   </p> */}
{/*                 </div> */}
{/*               </li> */}

{/*                */}{/* Tip 3 */}
{/*               <li className="d-flex align-items-start"> */}
{/*                 <div */}
{/*                   className="d-flex align-items-center justify-content-center me-3" */}
{/*                   style={{ */}
{/*                     backgroundColor: "rgba(168,85,247,0.1)", */}
{/*                     color: "#9333ea", */}
{/*                     width: "36px", */}
{/*                     height: "36px", */}
{/*                     borderRadius: "50%", */}
{/*                   }} */}
{/*                 > */}
{/*                   <i className="bi bi-exclamation-circle" style={{ fontSize: "1.1rem" }}></i> */}
{/*                 </div> */}
{/*                 <div> */}
{/*                   <h6 */}
{/*                     className="fw-semibold mb-1" */}
{/*                     style={{ color: "#111827", fontSize: "0.95rem" }} */}
{/*                   > */}
{/*                     Update availability */}
{/*                   </h6> */}
{/*                   <p className="mb-0" style={{ color: "#6b7280", fontSize: "0.9rem" }}> */}
{/*                     Keep quantities current for better trust */}
{/*                   </p> */}
{/*                 </div> */}
{/*               </li> */}
{/*             </ul> */}
{/*           </div> */}


        </div>
      </div>

      {/* -------------------- MODALS -------------------- */}
      <CreateLotModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onLotCreated={fetchLots}
      />
      <FoodItemModal
        show={showFoodModal}
        lotId={selectedLotId}
        onClose={() => setShowFoodModal(false)}
        onItemAdded={fetchLots}
      />
      <EditLotModal
        show={showEditModal}
        lot={selectedLot}
        onClose={() => setShowEditModal(false)}
        onLotUpdated={fetchLots}
      />
    </div>
  );
}
