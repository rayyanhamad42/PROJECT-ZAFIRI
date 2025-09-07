import React, { useState } from "react";
import Layout from "../components/Layout";
import { FaTachometerAlt, FaFlask, FaUsers } from "react-icons/fa";
import "./HeadOfDepartmentDashboard.css";

const HeadOfDepartmentDashboard = () => {
  const [pendingSamples, setPendingSamples] = useState([
    {
      id: 101,
      sample_details: "Blood Sample A",
      tests: [{ category: "Chemistry", ingredient: { name: "Hemoglobin" } }],
      control_number: "CTRL-001",
      status: "In Progress",
      assigned_date: "2025-09-01T10:30:00Z",
      assigned_to_technician: [{ id: 1, username: "tech1", category: "Chemistry" }]
    },
    {
      id: 102,
      sample_details: "Urine Sample B",
      tests: [{ category: "Microbiology", ingredient: { name: "Glucose" } }],
      control_number: "CTRL-002",
      status: "Completed",
      assigned_date: "2025-09-02T12:00:00Z",
      assigned_to_technician: [{ id: 2, username: "tech2", category: "Microbiology" }]
    },
    {
      id: 103,
      sample_details: "Blood Sample C",
      tests: [{ category: "Chemistry", ingredient: { name: "Cholesterol" } }],
      control_number: "CTRL-003",
      status: "In Progress",
      assigned_date: "2025-09-03T09:00:00Z",
      assigned_to_technician: []
    }
  ]);

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

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const handleAssignTechnician = (sampleId) => {
    setSelectedSampleId(sampleId);
    setSelectedCategory(""); // Reset category when opening modal
    setShowModal(true);
    setModalError("");
    setModalSuccess("");
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

    setPendingSamples(prev =>
      prev.map(sample => {
        if (sample.id === selectedSampleId) {
          const existingIds = sample.assigned_to_technician.map(t => t.id);
          const newTechnicians = technicianIds
            .filter(id => !existingIds.includes(id))
            .map(id => ({ id, username: technicians.find(t => t.id === id).username, category: selectedCategory }));

          return {
            ...sample,
            tests: [...sample.tests, { category: selectedCategory, ingredient: { name: sample.tests[0]?.ingredient?.name || "TBD" } }],
            assigned_to_technician: [...sample.assigned_to_technician, ...newTechnicians],
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
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const formatDate = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
  };

  const filteredSamples = pendingSamples.filter(s => {
    const q = search.trim().toLowerCase();
    const matchSearch = q
      ? s.sample_details.toLowerCase().includes(q) ||
        s.tests[0]?.ingredient?.name.toLowerCase().includes(q) ||
        s.assigned_to_technician.some(t => t.username.toLowerCase().includes(q))
      : true;
    const matchStatus = statusFilter === "All" ? true : s.status.toLowerCase() === statusFilter.toLowerCase();
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
        <h2>Manage Team Assignments (Example Data)</h2>

        <div className="filter-row">
          <input
            type="text"
            placeholder="Search by technician, sample or test"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option>All</option>
            <option>In Progress</option>
            <option>Completed</option>
          </select>
        </div>

        <table className="assignment-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Technicians</th>
              <th>Sample</th>
              <th>Test</th>
              <th>Control No.</th>
              <th>Assigned Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSamples.map(s => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>
                  {s.assigned_to_technician.length > 0 ? (
                    s.assigned_to_technician.map(t => (
                      <span key={t.id} className="tech-badge">{t.username} ({t.category})</span>
                    ))
                  ) : (
                    "—"
                  )}
                </td>
                <td>{s.sample_details}</td>
                <td>{s.tests[0]?.ingredient?.name || "N/A"}</td>
                <td>{s.control_number}</td>
                <td>{formatDate(s.assigned_date)}</td>
                <td>{s.status}</td>
                <td>
                  <button onClick={() => handleAssignTechnician(s.id)}>Assign/Reassign</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {showModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Assign Technician(s)</h3>
              <form onSubmit={handleModalSubmit}>
                <div className="form-group">
                  <label htmlFor="technician">Select Technician(s)</label>
                  <select id="technician" name="technician" multiple size={3} required>
                    {technicians.map(tech => (
                      <option key={tech.id} value={tech.id}>{tech.username}</option>
                    ))}
                  </select>
                  <small>Select one or more technicians (Ctrl/Command + Click)</small>
                </div>

                <div className="form-group">
                  <label htmlFor="category">Select Test Category</label>
                  <select id="category" name="category" value={selectedCategory} onChange={handleCategoryChange} required>
                    <option value="">Select Category</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Microbiology">Microbiology</option>
                  </select>
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