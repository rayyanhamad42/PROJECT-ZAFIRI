import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { FaPrint, FaEye, FaArrowLeft, FaTachometerAlt, FaCheckCircle } from "react-icons/fa";
import Layout from "../components/Layout";
import logo from '../assets/zafiri.png';
import "./DirectorGeneralDashboard.css";

export default function DirectorGeneralDashboard() {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [token] = useState(localStorage.getItem("access_token") || "");
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modalSuccess, setModalSuccess] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError('');
        if (!token) throw new Error('No authentication token found. Please log in.');

        // Verify user role
        const userResponse = await fetch("http://192.168.1.180:8000/api/users/me/", {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        if (!userResponse.ok) {
          const userError = await userResponse.json();
          throw new Error(userError.message || `Failed to fetch user data: ${userResponse.status}`);
        }
        const userData = await userResponse.json();
        if (userData.role !== "Director General" && userData.role !== "Director") {
          throw new Error(`User role not supported. Expected 'Director General', got '${userData.role}'.`);
        }

        // Fetch DG dashboard tests
        const response = await fetch("http://192.168.1.180:8000/api/dashboard/dg/", {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `DG Dashboard API error: ${response.status}`);
        }

        const samples = await response.json();
        const flattenedTests = samples.flatMap(sample =>
          sample.tests
            .filter(test => test.status === "Awaiting DG Review" || test.status === "Approved")
            .map(test => ({
              id: test.id,
              laboratory_number: test.sample?.laboratory_number || sample.laboratory_number || "—",
              total_amount: sample.payment?.amount_due || "—",
              sample_name: test.sample?.sample_name || sample.sample_name || "—",
              sample_details: test.sample?.sample_details || sample.sample_details || "—",
              date_received: test.sample?.date_received || sample.date_received || "—",
              registrar_name: test.sample?.registrar_name || sample.claimed_by?.username || "—",
              customer: sample.customer,
              ingredient_name: test.ingredient?.name || "N/A",
              results: test.results || "N/A",
              status: test.status,
              submitted_date: test.submitted_date || "—",
            }))
        );

        setTests(flattenedTests);
      } catch (err) {
        console.error("Error fetching DG dashboard:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchData();
    else navigate('/login');
  }, [token, navigate]);

  const handleViewDetails = (test) => {
    setSelectedTest(test);
    setShowDetailsModal(true);
  };

  const handleApproveTest = async (testId) => {
    try {
      const response = await fetch(
        `http://192.168.1.180:8000/api/dg/approve-result/${testId}/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "Approved" }),
        }
      );

      if (!response.ok) throw new Error("Failed to approve result.");
      const data = await response.json();

      setTests((prev) =>
        prev.map((t) => (t.id === testId ? { ...t, status: "Approved" } : t))
      );
      setSelectedTest((prev) => ({ ...prev, status: "Approved" }));
      setModalSuccess("Result approved successfully!");
      setTimeout(() => setModalSuccess(""), 2000);
    } catch (err) {
      console.error(err);
      alert("Failed to approve result. Try again.");
    }
  };

  const handlePrint = (test) => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert("Please allow pop-ups to print the certificate.");
      return;
    }

    const certificateContent = `
      <div class="certificate-container">
        <header class="certificate-header">
          <img src="${logo}" alt="Zafiri Logo" class="certificate-logo" />
          <h1>Certificate of Approval</h1>
          <p>This certifies that the following test has been officially approved.</p>
        </header>
        <section class="certificate-details">
          <div class="detail-item">
            <span class="detail-label">Test ID:</span>
            <span class="detail-value">${test.id}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Customer Name:</span>
            <span class="detail-value">
              ${test.customer?.is_organization
                ? test.customer.organization_name || "—"
                : `${test.customer?.first_name || ""} ${test.customer?.middle_name || ""} ${test.customer?.last_name || ""}`.trim() || "—"}
            </span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Lab Number:</span>
            <span class="detail-value">${test.laboratory_number || "—"}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Test Type:</span>
            <span class="detail-value">${test.ingredient_name || "—"}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Results:</span>
            <span class="detail-value">${test.results || "—"}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Total Payment:</span>
            <span class="detail-value">${test.total_amount ? new Intl.NumberFormat('en-TZ', { style: 'currency', currency: 'TZS' }).format(test.total_amount) : "—"}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Date of Approval:</span>
            <span class="detail-value">${new Date().toLocaleDateString()}</span>
          </div>
        </section>
        <footer class="certificate-footer">
          <p>Approved by the Director of Zafiri Laboratory.</p>
        </footer>
      </div>
    `;

    const certificateStyles = `
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: white; }
      .certificate-container { width: 100%; max-width: 700px; margin: 0 auto; padding: 20px; border: 1px solid #1CA3DE; background-color: #ffffff; text-align: center; box-sizing: border-box; }
      .certificate-logo { width: 80px; margin-bottom: 10px; }
      .certificate-header h1 { color: #1CA3DE; font-size: 1.8em; margin: 0; }
      .certificate-header p { color: #555; margin-top: 5px; font-size: 0.9em; }
      .certificate-details { text-align: left; font-size: 0.9em; line-height: 1.5; margin-bottom: 25px; }
      .detail-item { display: flex; justify-content: space-between; border-bottom: 1px dashed #ddd; padding: 6px 0; }
      .detail-label { font-weight: bold; color: #333; }
      .detail-value { color: #1CA3DE; }
      .certificate-footer { border-top: 1px solid #1CA3DE; padding-top: 15px; color: #777; font-size: 0.8em; }
      @media print { .certificate-container { border: none; padding: 0; } }
    `;

    printWindow.document.write('<html><head><title>Certificate</title>');
    printWindow.document.write(`<style>${certificateStyles}</style>`);
    printWindow.document.write('</head><body>');
    printWindow.document.write(certificateContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const menuItems = [
    { name: "Dashboard", path: "/director-dashboard", icon: <FaTachometerAlt /> },
  ];

  const filteredTests = tests.filter((test) => {
    const q = search.trim().toLowerCase();
    const matchSearch = q
      ? test.laboratory_number?.toLowerCase().includes(q) ||
        test.sample_name?.toLowerCase().includes(q) ||
        test.ingredient_name?.toLowerCase().includes(q) ||
        test.customer?.first_name?.toLowerCase().includes(q) ||
        test.customer?.last_name?.toLowerCase().includes(q)
      : true;
    const matchStatus =
      statusFilter === "All"
        ? true
        : test.status.toLowerCase() === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  return (
    <Layout menuItems={menuItems}>
      <div className="main-content">
        {error && <p className="error-message">{error}</p>}
        {modalSuccess && <p className="success-message">{modalSuccess}</p>}
        

        <div className="stats-cards">
          <div className="stat-card approved">
            <h3>Approved</h3>
            <p>{tests.filter(t => t.status.toLowerCase() === "approved").length}</p>
          </div>
          <div className="stat-card pending">
            <h3>Pending Review</h3>
            <p>{tests.filter(t => t.status.toLowerCase() === "awaiting dg review").length}</p>
          </div>
          <div className="stat-card total">
            <h3>Total</h3>
            <p>{tests.length}</p>
          </div>
        </div>

        <div className="filter-row">
          <input
            type="text"
            placeholder="Search by lab number, sample name, test type, or customer"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All</option>
            <option>Awaiting DG Review</option>
            <option>Approved</option>
          </select>
        </div>

        <section className="content-card">
          <h2>Test Results</h2>
          <table className="customers-table">
            <thead>
              <tr>
                <th>Lab Number</th>
                <th>Date of Submission</th>
                <th>Analysis Request</th>
                <th>Laboratory Results</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6">Loading...</td></tr>
              ) : filteredTests.length > 0 ? (
                filteredTests.map(test => (
                  <tr key={test.id}>
                    <td>{test.laboratory_number || "—"}</td>
                    <td>{test.submitted_date ? new Date(test.submitted_date).toLocaleDateString() : "—"}</td>
                    <td>{test.ingredient_name || "—"}</td>
                    <td>{test.results || "N/A"}</td>
                    <td>
                      <span className={`status ${test.status.toLowerCase().replace(' ', '-')}`}>
                        {test.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="action-btn view-btn"
                        onClick={() => handleViewDetails(test)}
                      >
                        <FaEye /> View Details
                      </button>
                      {test.status === "Approved" && (
                        <button
                          className="action-btn print-btn"
                          onClick={() => handlePrint(test)}
                        >
                          <FaPrint /> Print Certificate
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6">No test results available</td></tr>
              )}
            </tbody>
          </table>
        </section>
        {showDetailsModal && selectedTest && (
          <div className="modal-overlay">
            <div className="modal details-modal">
              <h3>Test Details</h3>
              <div className="modal-content">
                <div className="form-section">
                  <h4>Customer Information</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Name</label>
                      <p>
                        {selectedTest.customer?.is_organization
                          ? selectedTest.customer.organization_name || "—"
                          : `${selectedTest.customer?.first_name || ""} ${selectedTest.customer?.middle_name || ""} ${selectedTest.customer?.last_name || ""}`.trim() || "—"}
                      </p>
                    </div>
                    <div className="form-group">
                      <label>Phone</label>
                      <p>{(selectedTest.customer?.phone_country_code || "") + (selectedTest.customer?.phone_number || "—")}</p>
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <p>{selectedTest.customer?.email || "—"}</p>
                    </div>
                    <div className="form-group">
                      <label>Country</label>
                      <p>{selectedTest.customer?.country || "—"}</p>
                    </div>
                    <div className="form-group">
                      <label>Region</label>
                      <p>{selectedTest.customer?.region || "—"}</p>
                    </div>
                    <div className="form-group">
                      <label>Street</label>
                      <p>{selectedTest.customer?.street || "—"}</p>
                    </div>
                    <div className="form-group">
                      <label>Is Organization?</label>
                      <p>{selectedTest.customer?.is_organization ? "Yes" : "No"}</p>
                    </div>
                    {!selectedTest.customer?.is_organization ? (
                      <div className="form-group">
                        <label>National ID</label>
                        <p>{selectedTest.customer?.national_id || "—"}</p>
                      </div>
                    ) : (
                      <div className="form-group">
                        <label>Organization ID</label>
                        <p>{selectedTest.customer?.organization_id || "—"}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="form-section">
                  <h4>Sample Information</h4>
                  <div className="form-group">
                    <label>Sample Name</label>
                    <p>{selectedTest.sample_name || "—"}</p>
                  </div>
                  <div className="form-group">
                    <label>Sample Details</label>
                    <p>{selectedTest.sample_details || "—"}</p>
                  </div>
                  <div className="form-group">
                    <label>Total Payment</label>
                    <p>{selectedTest.total_amount ? new Intl.NumberFormat('en-TZ', { style: 'currency', currency: 'TZS' }).format(selectedTest.total_amount) : "—"}</p>
                  </div>
                  <div className="form-group">
                    <label>Date Received</label>
                    <p>{selectedTest.date_received ? new Date(selectedTest.date_received).toLocaleDateString() : "—"}</p>
                  </div>
                  <div className="form-group">
                    <label>Submitted By</label>
                    <p>{selectedTest.registrar_name || "—"}</p>
                  </div>
                </div>
                <div className="form-section">
                  <h4>Test Information</h4>
                  <div className="form-group">
                    <label>Test Type</label>
                    <p>{selectedTest.ingredient_name || "—"}</p>
                  </div>
                  <div className="form-group">
                    <label>Date of Submission</label>
                    <p>{selectedTest.submitted_date ? new Date(selectedTest.submitted_date).toLocaleDateString() : "—"}</p>
                  </div>
                  <div className="form-group">
                    <label>Results</label>
                    <p>{selectedTest.results || "—"}</p>
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <p>{selectedTest.status || "—"}</p>
                  </div>
                </div>
                <div className="modal-actions">
                  {selectedTest.status === "Awaiting DG Review" && (
                    <button
                      className="action-btn approve-btn"
                      onClick={() => handleApproveTest(selectedTest.id)}
                    >
                      <FaCheckCircle /> Approve Test
                    </button>
                  )}
                  {selectedTest.status === "Approved" && (
                    <button
                      className="action-btn print-btn"
                      onClick={() => handlePrint(selectedTest)}
                    >
                      <FaPrint /> Print Certificate
                    </button>
                  )}
                  <button type="button" className="action-btn" onClick={() => setShowDetailsModal(false)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}