// src/pages/HeadOfDepartmentDashboard.jsx
import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { FaTachometerAlt, FaFlask, FaUsers } from "react-icons/fa";
import "./HeadOfDepartmentDashboard.css";

const HeadOfDepartmentDashboard = () => {
  const [pendingSamples, setPendingSamples] = useState([]);
  const [technicians] = useState([
    { id: 1, username: "tech1" },
    { id: 2, username: "tech2" },
    { id: 3, username: "tech3" },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [selectedSampleId, setSelectedSampleId] = useState(null);
  const [modalError, setModalError] = useState("");
  const [modalSuccess, setModalSuccess] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const token = localStorage.getItem("access_token");

  // 🔹 Fetch samples for HOD
  useEffect(() => {
    const fetchSamples = async () => {
      try {
        const res = await fetch("http://192.168.1.180:8000/api/hod/samples/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch samples.");
        const data = await res.json();
        setPendingSamples(data.samples || []);
      } catch (err) {
        console.error("Error loading HOD samples:", err);
      }
    };
    if (token) fetchSamples();
  }, [token]);

  // 🔹 Assign/Reassign modal
  const handleAssignTechnician = (sampleId) => {
    setSelectedSampleId(sampleId);
    setSelectedCategory("");
    setShowModal(true);
    setModalError("");
    setModalSuccess("");
    setIsDropdownOpen(false);
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    const selectedOptions = Array.from(document.querySelector("#technician").selectedOptions);
    const technicianIds = selectedOptions.map(opt => parseInt(opt.value, 10));

    if (technicianIds.length === 0) {
      setModalError("Please select at least one technician.");
      return;
    }
    if (!selectedCategory) {
      setModalError("Please select a test category.");
      return;
    }

    // 🔹 Simulate assignment (you will later connect this with backend API)
    setPendingSamples(prev =>
      prev.map(sample => {
        if (sample.id === selectedSampleId) {
          const existing = sample.assigned_to_technician || [];
          const newAssignments = technicianIds
            .filter(id => !existing.some(t => t.id === id && t.category === selectedCategory))
            .map(id => ({
              id,
              username: technicians.find(t => t.id === id).username,
              category: selectedCategory,
            }));

          return {
            ...sample,
            tests: [
              ...sample.tests,
              { category: selectedCategory, ingredient: { name: "TBD" } },
            ],
            assigned_to_technician: [...existing, ...newAssignments],
            status: "In Progress",
            assigned_date: new Date().toISOString(),
          };
        }
        return sample;
      })
    );

    setModalSuccess("Technician(s) assigned successfully!");
    setTimeout(() => {
      setShowModal(false);
      setSelectedSampleId(null);
      setSelectedCategory("");
      setModalError("");
      setModalSuccess("");
    }, 1000);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedSampleId(null);
    setSelectedCategory("");
    setModalError("");
    setModalSuccess("");
    setIsDropdownOpen(false);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setIsDropdownOpen(false);
  };

  const toggleDropdown = (e) => {
    e.preventDefault();
    setIsDropdownOpen(prev => !prev);
  };

  const formatDate = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
  };

  const filteredSamples = pendingSamples.filter(s => {
    const q = search.trim().toLowerCase();
    const matchSearch = q
      ? s.sample_details?.toLowerCase().includes(q) ||
        (s.tests || []).some(t => t.ingredient?.name?.toLowerCase().includes(q))
      : true;
    const matchStatus = statusFilter === "All" ? true : s.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  return (
    <Layout
      menuItems={[
        { name: "Dashboard", path: "/hod-dashboard", icon: <FaTachometerAlt /> },
        { name: "Department Data", path: "/department-data", icon: <FaFlask /> },
        { name: "Manage Team", path: "/manage-team", icon: <FaUsers /> },
      ]}
    >
      <div className="hod-dashboard-container">
        <h2>Head of Department – Manage Samples</h2>

        <div className="filter-row">
          <input
            type="text"
            placeholder="Search by sample, test, or technician"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option>All</option>
            <option>In Progress</option>
            <option>Completed</option>
            <option>Submitted to HOD</option>
          </select>
        </div>

        <table className="assignment-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Sample</th>
              <th>Tests</th>
              <th>Payment</th>
              <th>Control No.</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSamples.length > 0 ? (
              filteredSamples.map(s => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>
                    {s.customer
                      ? `${s.customer.first_name} ${s.customer.last_name}`
                      : "—"}
                  </td>
                  <td>{s.sample_details}</td>
                  <td>
                    {(s.tests || []).length > 0
                      ? s.tests.map((t, i) => (
                          <span key={i}>
                            {t.ingredient?.name} ({t.ingredient?.test_type})
                          </span>
                        ))
                      : "N/A"}
                  </td>
                  <td>{s.payment ? `${s.payment.amount_due} TZS` : "—"}</td>
                  <td>{s.control_number}</td>
                  <td>{s.status}</td>
                  <td>
                    <button onClick={() => handleAssignTechnician(s.id)}>
                      Assign/Reassign
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "10px" }}>
                  No samples available.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {showModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Assign Technician(s)</h3>
              <form onSubmit={handleModalSubmit}>
                <div className="form-group">
                  <label htmlFor="technician">Select Technician(s)</label>
                  <select id="technician" multiple size={3} required>
                    {technicians.map(tech => (
                      <option key={tech.id} value={tech.id}>{tech.username}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Select Test Category</label>
                  <div className="custom-dropdown">
                    <button className="dropdown-toggle" onClick={toggleDropdown}>
                      {selectedCategory || "Select Category"} <span className="dropdown-arrow"></span>
                    </button>
                    {isDropdownOpen && (
                      <div className="dropdown-menu">
                        <div className="dropdown-item-style" onClick={() => handleCategorySelect("Chemistry")}>Chemistry</div>
                        <div className="dropdown-item-style" onClick={() => handleCategorySelect("Microbiology")}>Microbiology</div>
                      </div>
                    )}
                  </div>
                </div>

                {modalError && <p className="error-text">{modalError}</p>}
                {modalSuccess && <p className="success-text">{modalSuccess}</p>}

                <div className="modal-actions">
                  <button type="submit">Assign</button>
                  <button type="button" onClick={handleModalClose}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default HeadOfDepartmentDashboard;