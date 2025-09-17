import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { FaFlask, FaCheckCircle, FaArrowLeft, FaTachometerAlt, FaTimes, FaEye } from "react-icons/fa";
import Layout from "../components/Layout";
import './HeadOfDepartmentDashboard.css';

const TestResults = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [token] = useState(localStorage.getItem("access_token") || "");
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState("");
  const [modalSuccess, setModalSuccess] = useState("");
  const [modalError, setModalError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError('');
        if (!token) throw new Error('No authentication token found. Please log in.');
        console.log("Using token:", token.substring(0, 10) + "...");

        // Fetch HOD dashboard samples
        const response = await fetch("http://192.168.1.180:8000/api/dashboard/hod/", {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HOD Dashboard API error: ${response.status}`);
        }

        const samples = await response.json();
        console.log("Test Results response at 10:15 AM EAT 09/17/2025:", samples);

        // Flatten samples.tests into a list of tests with sample info
        const flattenedTests = samples.flatMap(sample =>
          sample.tests.map(test => ({
            id: test.id,
            total_amount: sample.payment?.amount_due || "—",
            sample_name: sample.sample_name,
            sample_details: sample.sample_details,
            date_received: sample.date_received,
            registrar_name: sample.registrar_name,
            customer: sample.customer,
            ingredient_name: test.ingredient?.name || "N/A",
            results: test.results || "N/A",
            status: test.status,
            submitted_date: test.submitted_date,
            payment: sample.payment,
          }))
        ).filter(test => test.status === "Awaiting HOD Review"); // Only show tests awaiting review

        setTests(flattenedTests);

        // Fetch technicians for reassign dropdown
        const techResponse = await fetch("http://192.168.1.180:8000/api/technicians/", {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });

        if (techResponse.ok) {
          const techData = await techResponse.json();
          setTechnicians(techData); // Assuming response is array of technicians
        }
      } catch (err) {
        console.error("Error fetching test results:", err);
        setError(err.message || 'Failed to load test results. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    } else {
      setError('No authentication token found. Please log in.');
      navigate('/login');
    }
  }, [token, navigate]);

  const handleApproveResult = async (testId) => {
    try {
      setModalError("");
      const response = await fetch(`http://192.168.1.180:8000/api/hod/accept-result/${testId}/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to approve result: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setTests(prev => prev.filter(t => t.id !== testId));
        setModalSuccess("Result approved successfully!");
        setTimeout(() => setModalSuccess(""), 2000);
        setShowDetailsModal(false);
      }
    } catch (err) {
      console.error("Error approving result:", err);
      setModalError(err.message || 'Failed to approve result.');
    }
  };

  const handleRejectResult = async (testId) => {
    try {
      setModalError("");
      setModalSuccess("");
      const response = await fetch(`http://192.168.1.180:8000/api/hod/reject-result/${testId}/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reassigned_to: selectedTechnicianId }), // Pass new technician ID for reassign
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to reject and reassign result: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setTests(prev => prev.filter(t => t.id !== testId)); // Remove from list
        setModalSuccess("Result rejected and reassigned successfully!");
        setTimeout(() => setModalSuccess(""), 2000);
        setShowRejectModal(false);
        setSelectedTechnicianId("");
        setShowDetailsModal(false);
      }
    } catch (err) {
      console.error("Error rejecting result:", err);
      setModalError(err.message || 'Failed to reject and reassign result.');
    }
  };

  const handleViewDetails = (test) => {
    setSelectedTest(test);
    setShowDetailsModal(true);
  };

  const openRejectModal = (test) => {
    setSelectedTest(test);
    setSelectedTechnicianId(""); // Reset selection
    setShowRejectModal(true);
  };

  const menuItems = [
    { name: "Dashboard", path: "/hod-dashboard", icon: <FaTachometerAlt /> },
  ];

  return (
    <Layout menuItems={menuItems}>
      <div className="main-content">
        {error && <p className="error-message">{error}</p>}

        <header className="header">
          <div className="header-left">
            <button className="back-btn" onClick={() => navigate("/hod-dashboard")}>
              <FaArrowLeft className="btn-icon" /> Back to Dashboard
            </button>
            <h1>Submitted Test Results</h1>
            <p>Review and approve submitted test results</p>
          </div>
        </header>

        <main className="dashboard-content">
          <section className="department-data-section">
            <h2><FaFlask /> Submitted Results</h2>
            <div className="table-wrapper">
              <table className="overview-table">
                <thead>
                  <tr>
                    <th>Total Amount</th>
                    <th>Date of Submission</th>
                    <th>Laboratory Results</th>
                    <th>Analysis Request</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="6">Loading...</td></tr>
                  ) : tests.length ? (
                    tests.map(test => {
                      const isApproved = test.status === "Approved";
                      return (
                        <tr key={test.id}>
                          <td>{test.total_amount || "—"}</td>
                          <td>{test.submitted_date ? new Date(test.submitted_date).toLocaleDateString() : "—"}</td>
                          <td>{test.results || "N/A"}</td>
                          <td>{test.ingredient_name || "—"}</td>
                          <td>{test.status || "Pending"}</td>
                          <td>
                            <button
                              className="action-btn view-btn"
                              onClick={() => handleViewDetails(test)}
                            >
                              <FaEye /> View Details
                            </button>
                          
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr><td colSpan="6">No submitted results</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Details Modal */}
          {showDetailsModal && selectedTest && (
            <div className="modal-overlay">
              <div className="modal details-modal">
                <h3>Test Details</h3>
                <div className="modal-content">
                  <div className="form-section">
                    <h4>Customer Information</h4>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>First Name</label>
                        <p>{selectedTest.customer?.first_name || "—"}</p>
                      </div>
                      <div className="form-group">
                        <label>Middle Name</label>
                        <p>{selectedTest.customer?.middle_name || "—"}</p>
                      </div>
                      <div className="form-group">
                        <label>Last Name</label>
                        <p>{selectedTest.customer?.last_name || "—"}</p>
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
                        <>
                          <div className="form-group">
                            <label>Organization Name</label>
                            <p>{selectedTest.customer?.organization_name || "—"}</p>
                          </div>
                          <div className="form-group">
                            <label>Organization ID</label>
                            <p>{selectedTest.customer?.organization_id || "—"}</p>
                          </div>
                        </>
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
                      <label>Total Amount</label>
                      <p>{selectedTest.total_amount || "—"}</p>
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
                    <button
                      className="action-btn approve-btn"
                      onClick={() => handleApproveResult(selectedTest.id)}
                      disabled={selectedTest.status === "Approved"}
                    >
                      <FaCheckCircle /> Approve
                    </button>
                    <button
                      className="action-btn reject-btn"
                      onClick={() => openRejectModal(selectedTest)}
                      disabled={selectedTest.status === "Approved"}
                    >
                      <FaTimes /> Reject & Reassign
                    </button>
                    <button type="button" onClick={() => setShowDetailsModal(false)}>
                      Close
                    </button>
                    {modalSuccess && <p className="success-text">{modalSuccess}</p>}
                    {modalError && <p className="error-text">{modalError}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reject & Reassign Modal */}
          {showRejectModal && selectedTest && (
            <div className="modal-overlay">
              <div className="modal details-modal">
                <h3>Reject & Reassign Test</h3>
                <div className="modal-content">
                  <div className="form-section">
                    <h4>Reassign to Technician</h4>
                    <div className="form-group">
                      <label htmlFor="technician-select">Select Technician</label>
                      <select
                        id="technician-select"
                        value={selectedTechnicianId}
                        onChange={(e) => setSelectedTechnicianId(e.target.value)}
                        required
                      >
                        <option value="">Choose a technician...</option>
                        {technicians.map(tech => (
                          <option key={tech.id} value={tech.id}>
                            {tech.username} ({tech.specialization})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="modal-actions">
                    <button
                      className="action-btn reject-btn"
                      onClick={() => handleRejectResult(selectedTest.id)}
                      disabled={!selectedTechnicianId}
                    >
                      <FaTimes /> Reassign & Reject
                    </button>
                    <button type="button" onClick={() => setShowRejectModal(false)}>
                      Cancel
                    </button>
                    {modalSuccess && <p className="success-text">{modalSuccess}</p>}
                    {modalError && <p className="error-text">{modalError}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </Layout>
  );
};

export default TestResults;