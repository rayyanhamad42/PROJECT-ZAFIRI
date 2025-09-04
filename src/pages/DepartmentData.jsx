import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { FaFlask, FaCheckCircle, FaArrowLeft, FaTachometerAlt } from "react-icons/fa";
import Layout from "../components/Layout";
import './HeadOfDepartmentDashboard.css'; // Reuse existing CSS

const DepartmentData = () => {
  const navigate = useNavigate();
  const [completedTests, setCompletedTests] = useState([]);
  const [token] = useState(localStorage.getItem("access_token") || "mock-token");
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError('');
        if (!token) throw new Error('No authentication token found. Please log in.');
        console.log("Using token:", token.substring(0, 10) + "...");

        const response = await fetch("http://192.168.1.180:8000/api/dashboard/hod/", {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HOD Dashboard API error: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        console.log("Department Data response:", data);

        if (data.success) {
          setCompletedTests(data.completed_tests || []);
        } else {
          setError(data.message || 'Failed to load department data.');
        }
      } catch (err) {
        console.error("Error fetching department data:", err);
        setError(err.message || 'Failed to load department data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    } else {
      setError('No authentication token found. Please log in.');
      navigate('/');
    }
  }, [token, navigate]);

  const handleApproveResult = async (testId) => {
    try {
      const response = await fetch(`http://192.168.1.180:8000/api/approve-test-result/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ test_id: testId }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to approve result. Status: ${response.status}, Response: ${errorText}`);
      }
      const data = await response.json();
      if (data.success) {
        setCompletedTests(prev => prev.filter(t => t.id !== testId));
        // Mock submit to DG
        await fetch(`http://192.168.1.180:8000/api/submit-to-director/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ test_id: testId }),
        });
      }
    } catch (err) {
      console.error("Error approving result:", err);
      setError(err.message || 'Failed to approve result.');
    }
  };

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((o, key) => (o && o[key] !== undefined) ? o[key] : '', obj);
  };

  // sidebar menu
  const menuItems = [
    { name: "Dashboard", path: "/hod-dashboard", icon: <FaTachometerAlt /> },
    { name: "Submitted Results", path: "/hod-department-data", icon: <FaFlask /> },
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
            <h1>Department Data</h1>
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
                    <th>ID</th><th>Sample</th><th>Test</th><th>Ctrl No.</th><th>Result</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="7">Loading...</td></tr>
                  ) : completedTests.length ? (
                    completedTests.map(test => {
                      const isApproved = !completedTests.some(t => t.id === test.id);
                      return (
                        <tr key={test.id}>
                          <td>{test.id}</td>
                          <td>{test.sample?.sample_details || 'N/A'}</td>
                          <td>{test.ingredient?.name || 'N/A'}</td>
                          <td>{test.sample?.control_number || 'N/A'}</td>
                          <td>{test.results || 'N/A'}</td>
                          <td>{isApproved ? 'Approved' : 'Awaiting Approval'}</td>
                          <td>
                            <button
                              className={`action-btn approve-btn ${isApproved ? 'approved' : ''}`}
                              onClick={() => !isApproved && handleApproveResult(test.id)}
                              disabled={isApproved}
                            >
                              <FaCheckCircle /> {isApproved ? 'Approved' : 'Approve & Submit'}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr><td colSpan="7">No submitted results</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </Layout>
  );
};

export default DepartmentData;
