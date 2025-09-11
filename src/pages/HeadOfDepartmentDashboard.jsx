import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { FaTachometerAlt, FaFlask, FaUsers } from "react-icons/fa";
import "./HeadOfDepartmentDashboard.css";

const HeadOfDepartmentDashboard = () => {
  const [samples, setSamples] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [chemIngredients, setChemIngredients] = useState([]);
  const [microIngredients, setMicroIngredients] = useState([]);
  
  const token = localStorage.getItem("access_token");  // ✅ declare early

  // 🔹 Fetch technicians from backend
  useEffect(() => {
    const fetchTechnicians = async () => {
      if (!token) return;
      try {
        const res = await fetch("http://192.168.1.180:8000/api/technicians/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch technicians");
        const data = await res.json();
        setTechnicians(data.filter(t => t.role === "Technician"));
      } catch (err) {
        console.error("Error fetching technicians:", err);
      }
    };
    fetchTechnicians();
  }, [token]);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSampleId, setSelectedSampleId] = useState(null);
  const [selectedSampleForDetails, setSelectedSampleForDetails] = useState(null);
  const [modalError, setModalError] = useState("");
  const [modalSuccess, setModalSuccess] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTechnician, setSelectedTechnician] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // const token = localStorage.getItem("access_token");

  // Mock ingredients for fallback
  const MOCK_INGREDIENTS = [
    { id: 1, name: "pH Test", test_type: "Chemistry", price: 5000 },
    { id: 2, name: "Bacteria Count", test_type: "Microbiology", price: 10000 },
  ];

  // 🔹 Fetch data for HOD (samples and ingredients)
  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      try {
        // Fetch Ingredients
        const ingRes = await fetch("http://192.168.1.180:8000/api/ingredients/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (ingRes.ok) {
          const ingData = await ingRes.json();
          const all = Array.isArray(ingData) ? ingData : [];
          setIngredients(all);
          setChemIngredients(all.filter((ing) => ing.test_type === "Chemistry"));
          setMicroIngredients(all.filter((ing) => ing.test_type === "Microbiology"));
        }

        // Fetch Samples
        const res = await fetch("http://192.168.1.180:8000/api/hod/samples/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch samples.");
        const data = await res.json();

        // Normalize response shape to match Registrar's unclaimedSamples structure
        let samplesData = [];
        if (Array.isArray(data)) {
          samplesData = data;
        } else if (Array.isArray(data.samples)) {
          samplesData = data.samples;
        } else if (data.results && Array.isArray(data.results)) {
          samplesData = data.results;
        }

        // Ensure status is lowercase for consistency
        const normalized = samplesData.map((sample) => ({
          ...sample,
          payment: {
            ...(sample.payment || {}),
            status: (sample.payment?.status || "pending").toString().toLowerCase(),
          },
        }));

        console.log("HOD API raw:", data);
        console.log("Normalized samples:", normalized);

        setSamples(normalized);
      } catch (err) {
        console.error("Error loading HOD data:", err);
        // Mock data matching registrar's unclaimedSamples structure
        setIngredients(MOCK_INGREDIENTS);
        setChemIngredients(MOCK_INGREDIENTS.filter((ing) => ing.test_type === "Chemistry"));
        setMicroIngredients(MOCK_INGREDIENTS.filter((ing) => ing.test_type === "Microbiology"));
        setSamples([
          {
            id: 1,
            customer: {
              first_name: "John",
              middle_name: "M.",
              last_name: "Doe",
              phone_country_code: "+255",
              phone_number: "712345678",
              email: "john@example.com",
              country: "Tanzania",
              region: "Zanzibar",
              street: "Stone Town",
              is_organization: false,
              national_id: "123456789",
              organization_name: "",
              organization_id: "",
            },
            sample_name: "Water Sample",
            sample_details: "Water Quality Test",
            selected_ingredients: [1], // Mock selected ingredients
            payment: { amount_due: 50000, status: "pending" },
            control_number: "CN12345",
            status: "Submitted to HOD",
            assigned_to_technician: [],
          },
        ]);
      }
    };
    fetchData();
  }, [token]);

  // 🔹 Assign/Reassign modal
  const handleAssignTechnician = (sampleId) => {
    setSelectedSampleId(sampleId);
    setSelectedCategory("");
    setSelectedTechnician("");
    setShowModal(true);
    setModalError("");
    setModalSuccess("");
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();

    if (!selectedTechnician) {
      setModalError("Please select a technician.");
      return;
    }
    if (!selectedCategory) {
      setModalError("Please select a test category.");
      return;
    }

    // ✅ Get tests of this category for the selected sample
    const selectedSample = samples.find((s) => s.id === selectedSampleId);
    const testIds = (selectedSample?.tests || [])
      .filter((t) => t.ingredient?.test_type === selectedCategory)
      .map((t) => t.id);

    if (testIds.length === 0) {
      setModalError(`No ${selectedCategory} tests available for this sample.`);
      return;
    }

    try {
      const response = await fetch(
        `http://192.168.1.180:8000/api/hod/assign-technician/${selectedSampleId}/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            technician_ids: [selectedTechnician], // Single technician ID
            test_ids: testIds, // ✅ Sending test IDs
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to assign technician.");
      const data = await response.json();

      // ✅ Update local state from backend response
      setSamples((prev) =>
        prev.map((s) => (s.id === selectedSampleId ? data.sample : s))
      );

      setModalSuccess("Technician assigned successfully!");
      setTimeout(() => {
        setShowModal(false);
        setSelectedSampleId(null);
        setSelectedCategory("");
        setSelectedTechnician("");
        setModalError("");
        setModalSuccess("");
      }, 1000);
    } catch (err) {
      console.error(err);
      setModalError("Failed to assign technician. Try again.");
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedSampleId(null);
    setSelectedCategory("");
    setSelectedTechnician("");
    setModalError("");
    setModalSuccess("");
  };

  const handleViewDetails = (sampleId) => {
    const sample = samples.find((s) => s.id === sampleId);
    setSelectedSampleForDetails(sample);
    setShowDetailsModal(true);
  };

  const handleDetailsClose = () => {
    setShowDetailsModal(false);
    setSelectedSampleForDetails(null);
  };

  const filteredSamples = samples.filter((s) => {
    const q = search.trim().toLowerCase();
    const customer = s.customer || {};
    const matchSearch = q
      ? s.sample_name?.toLowerCase().includes(q) ||
        s.sample_details?.toLowerCase().includes(q) ||
        customer.first_name?.toLowerCase().includes(q) ||
        customer.middle_name?.toLowerCase().includes(q) ||
        customer.last_name?.toLowerCase().includes(q) ||
        customer.email?.toLowerCase().includes(q) ||
        customer.organization_name?.toLowerCase().includes(q) ||
        `${customer.phone_country_code}${customer.phone_number}`.toLowerCase().includes(q)
      : true;
    const matchStatus =
      statusFilter === "All"
        ? true
        : s.payment?.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  const renderTestNames = (testType) => {
    const tests = selectedSampleForDetails?.tests || [];
    const filtered = tests.filter((t) => t.ingredient?.test_type === testType);

    if (filtered.length === 0) {
      return <p>No {testType.toLowerCase()} tests selected.</p>;
    }

    return (
      <ul>
        {filtered.map((t) => (
          <li key={t.id}>
            {t.ingredient?.name} ({t.ingredient?.price} TZS)
          </li>
        ))}
      </ul>
    );
  };

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

        {/* Stats Cards */}
        <div className="stats-cards">
          <div className="stat-card approved">
            <h3>Approved</h3>
            <p>
              {samples.filter(
                (s) => (s.payment?.status || "").toLowerCase() === "approved"
              ).length}
            </p>
          </div>
          <div className="stat-card pending">
            <h3>Pending</h3>
            <p>
              {samples.filter(
                (s) => (s.payment?.status || "").toLowerCase() === "pending"
              ).length}
            </p>
          </div>
          <div className="stat-card total">
            <h3>Total</h3>
            <p>{samples.length}</p>
          </div>
        </div>

        <div className="filter-row">
          <input
            type="text"
            placeholder="Search by sample, customer, phone, or organization"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All</option>
            <option>Pending</option>
            <option>Approved</option>
          </select>
        </div>

        <table className="assignment-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer Name</th>
              <th>Phone</th>
              <th>Sample Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSamples.length > 0 ? (
              filteredSamples.map((s) => {
                const customer = s.customer || {};
                return (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td>
                      {customer.first_name} {customer.middle_name} {customer.last_name}
                    </td>
                    <td>{`${customer.phone_country_code}${customer.phone_number}`}</td>
                    <td>{s.sample_name || "—"}</td>
                    <td>
                      <button onClick={() => handleViewDetails(s.id)} className="view-btn">
                        View Details
                      </button>
                      <button onClick={() => handleAssignTechnician(s.id)}>
                        Assign/Reassign
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "10px" }}>
                  No samples available.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Assign Modal */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Assign Technician</h3>
              <form onSubmit={handleModalSubmit}>
                <div className="form-group">
                  <label>Select Technician</label>
                  <select
                    value={selectedTechnician}
                    onChange={(e) => setSelectedTechnician(e.target.value)}
                    required
                    className="form-group-select"
                  >
                    <option value="">Select Technician</option>
                    {technicians.map((tech) => (
                      <option key={tech.id} value={tech.id}>
                        {tech.username}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="category">Select Test Category</label>
                  <select
                    id="category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    required
                    className="form-group-select"
                  >
                    <option value="">Select Category</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Microbiology">Microbiology</option>
                  </select>
                </div>

                {modalError && <p className="error-text">{modalError}</p>}
                {modalSuccess && <p className="success-text">{modalSuccess}</p>}

                <div className="modal-actions">
                  <>
                    <button type="submit">Assign</button>
                    <button type="button" onClick={handleModalClose}>
                      Cancel
                    </button>
                  </>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Details Modal */}
        {showDetailsModal && selectedSampleForDetails && (
          <div className="modal-overlay">
            <div className="modal details-modal">
              <h3>Sample Details</h3>
              <div className="modal-content">
                <div className="form-section">
                  <h4>Customer Information</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>First Name</label>
                      <p>{selectedSampleForDetails.customer?.first_name || "—"}</p>
                    </div>
                    <div className="form-group">
                      <label>Middle Name</label>
                      <p>{selectedSampleForDetails.customer?.middle_name || "—"}</p>
                    </div>
                    <div className="form-group">
                      <label>Last Name</label>
                      <p>{selectedSampleForDetails.customer?.last_name || "—"}</p>
                    </div>
                    <div className="form-group">
                      <label>Phone</label>
                      <p>
                        {selectedSampleForDetails.customer?.phone_country_code || ""}
                        {selectedSampleForDetails.customer?.phone_number || "—"}
                      </p>
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <p>{selectedSampleForDetails.customer?.email || "—"}</p>
                    </div>
                    <div className="form-group">
                      <label>Country</label>
                      <p>{selectedSampleForDetails.customer?.country || "—"}</p>
                    </div>
                    <div className="form-group">
                      <label>Region</label>
                      <p>{selectedSampleForDetails.customer?.region || "—"}</p>
                    </div>
                    <div className="form-group">
                      <label>Street</label>
                      <p>{selectedSampleForDetails.customer?.street || "—"}</p>
                    </div>
                    <div className="form-group">
                      <label>Is Organization?</label>
                      <p>{selectedSampleForDetails.customer?.is_organization ? "Yes" : "No"}</p>
                    </div>
                    {!selectedSampleForDetails.customer?.is_organization ? (
                      <div className="form-group">
                        <label>National ID</label>
                        <p>{selectedSampleForDetails.customer?.national_id || "—"}</p>
                      </div>
                    ) : (
                      <>
                        <div className="form-group">
                          <label>Organization Name</label>
                          <p>{selectedSampleForDetails.customer?.organization_name || "—"}</p>
                        </div>
                        <div className="form-group">
                          <label>Organization ID</label>
                          <p>{selectedSampleForDetails.customer?.organization_id || "—"}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="form-section">
                  <h4>Sample Information</h4>
                  <div className="form-group">
                    <label>Sample Name</label>
                    <p>{selectedSampleForDetails.sample_name || "—"}</p>
                  </div>
                  <div className="form-group">
                    <label>Sample Details</label>
                    <p>{selectedSampleForDetails.sample_details || "—"}</p>
                  </div>
                </div>

                <div className="form-section">
                  <h4>Payment Information</h4>
                  <div className="form-group">
                    <label>Amount Due</label>
                    <p>{selectedSampleForDetails.payment?.amount_due ? `${selectedSampleForDetails.payment.amount_due} TZS` : "—"}</p>
                  </div>
                  <div className="form-group">
                    <label>Control Number</label>
                    <p>{selectedSampleForDetails.control_number || "—"}</p>
                  </div>
                  <div className="form-group">
                    <label>Payment Status</label>
                    <p>{selectedSampleForDetails.payment?.status || "—"}</p>
                  </div>
                </div>

                <div className="form-section">
                  <h4>Tests</h4>
                  <div className="test-section">
                    <h5>Chemistry Tests</h5>
                    {renderTestNames("Chemistry")}
                  </div>
                  <div className="test-section">
                    <h5>Microbiology Tests</h5>
                    {renderTestNames("Microbiology")}
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={handleDetailsClose}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default HeadOfDepartmentDashboard;