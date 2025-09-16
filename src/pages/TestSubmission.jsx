import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { FaArrowLeft, FaFileSignature } from "react-icons/fa";
import Layout from "../components/Layout";
import "./TestSubmission.css";

export default function TestSubmission() {
  const navigate = useNavigate();
  const { testId } = useParams();
  const location = useLocation();
  const [test, setTest] = useState(null);
  const [formData, setFormData] = useState({ result_data: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Get state from navigation with debug logging
  const state = location.state || {};
  console.log("Location state at 04:49 PM EAT 09/12/2025:", state);
  const {
    sampleDetails = "Test Sample", // Hardcoded for testing
    labNumber = "LAB-001",
    customerId = "CUST-123",
    assignedDate = "09/10/2025",
    dateOfSubmission = new Date().toLocaleDateString('en-US'), // 09/12/2025
    sampleSubmittedBy = "Dr. John Doe",
    laboratoryResults = "pH: 7.2",
    analysisRequest = "Check pH",
  } = state;

  // Sidebar menu items
  const menuItems = [
    { name: "Dashboard", path: "/technician-dashboard", icon: <FaFileSignature /> },
    { name: "View History", path: "/history", icon: <FaArrowLeft /> },
  ];

  // Mock examples for table
  const mockExamples = [
    {
      sampleDetails: "Water Quality Analysis",
      labNumber: "LAB-001",
      customerId: "CUST-123",
      assignedDate: "09/10/2025",
      dateOfSubmission: "09/12/2025",
      sampleSubmittedBy: "Dr. John Doe",
      laboratoryResults: "pH: 7.2, Turbidity: 5 NTU",
      analysisRequest: "Check pH and turbidity levels",
    },
    {
      sampleDetails: "Soil Nutrient Test",
      labNumber: "LAB-002",
      customerId: "CUST-124",
      assignedDate: "09/09/2025",
      dateOfSubmission: "09/11/2025",
      sampleSubmittedBy: "Dr. Jane Smith",
      laboratoryResults: "Nitrogen: 12 mg/kg, Phosphorus: 8 mg/kg",
      analysisRequest: "Analyze nutrient content",
    },
  ];

  useEffect(() => {
    const testsData = JSON.parse(localStorage.getItem("assignedTests")) || [];
    console.log("LocalStorage testsData at 04:49 PM EAT 09/12/2025:", testsData);
    const foundTest = testsData.find(t => t.id === parseInt(testId, 10));

    if (foundTest) {
      setTest(foundTest);
      setFormData({ result_data: foundTest.result_data || laboratoryResults });
      if (foundTest.status === "Completed") {
        setIsSubmitted(true);
      }
    } else {
      setError("Test not found.");
    }
  }, [testId, laboratoryResults]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    console.log("Submitting result at 04:49 PM EAT 09/12/2025:", {
      test: testId,
      sample: test?.sample?.id,
      result_data: formData.result_data,
    });
    
    const testsData = JSON.parse(localStorage.getItem("assignedTests")) || [];
    const updatedTests = testsData.map(t => {
      if (t.id === parseInt(testId, 10)) {
        return { ...t, status: "Completed", result_data: formData.result_data };
      }
      return t;
    });

    localStorage.setItem("assignedTests", JSON.stringify(updatedTests));
    setSuccess("Result submitted successfully! (Mock submission)");
    setIsSubmitted(true);
    setFormData({ result_data: "" });

    setTimeout(() => {
      navigate("/technician-dashboard", { state: { refresh: true } });
    }, 1000);
  };

  const handleBack = () => navigate("/technician-dashboard");

  return (
    <Layout menuItems={menuItems}>
      <div className="test-submission">
        <header className="header">
          <button className="back-btn" onClick={handleBack}>
            <FaArrowLeft className="btn-icon" /> Back to Dashboard
          </button>
          <h1>Submit Test Result</h1>
        </header>

        <main className="content">
          <section className="submission-form">
            <h2><FaFileSignature className="section-icon" /> Test Result Submission</h2>
            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}
            {test ? (
              <>
                <div className="test-details-table">
                  <h3>Test Details</h3>
                  <table className="details-table">
                    <thead>
                      <tr>
                        <th>Field</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { field: "Sample Details", value: sampleDetails },
                        { field: "Lab Number", value: labNumber },
                        { field: "Customer ID", value: customerId },
                        { field: "Assigned Date", value: assignedDate },
                        { field: "Date of Submission", value: dateOfSubmission },
                        { field: "Sample Submitted By", value: sampleSubmittedBy },
                        { field: "Laboratory Results", value: laboratoryResults },
                        { field: "Analysis Request", value: analysisRequest },
                        { field: "Sample Code", value: test.sample?.control_number || "N/A" },
                        { field: "Customer", value: test.sample?.customer?.name || "N/A" },
                        { field: "Ingredient", value: test.ingredient?.name || "N/A" },
                        { field: "Status", value: test.status },
                      ].map((item, index) => (
                        <tr key={index}>
                          <td>{item.field}</td>
                          <td>{item.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mock-examples-table">
                  <h3>Mock Examples</h3>
                  <table className="details-table">
                    <thead>
                      <tr>
                        <th>Sample Details</th>
                        <th>Lab Number</th>
                        <th>Customer ID</th>
                        <th>Assigned Date</th>
                        <th>Date of Submission</th>
                        <th>Sample Submitted By</th>
                        <th>Laboratory Results</th>
                        <th>Analysis Request</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockExamples.map((example, index) => (
                        <tr key={index}>
                          <td>{example.sampleDetails}</td>
                          <td>{example.labNumber}</td>
                          <td>{example.customerId}</td>
                          <td>{example.assignedDate}</td>
                          <td>{example.dateOfSubmission}</td>
                          <td>{example.sampleSubmittedBy}</td>
                          <td>{example.laboratoryResults}</td>
                          <td>{example.analysisRequest}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="result_data">Update Laboratory Results</label>
                    <textarea
                      id="result_data"
                      name="result_data"
                      value={formData.result_data}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter or update test results here (e.g., pH: 7.2, Turbidity: 5 NTU)"
                      rows="5"
                      disabled={isSubmitted || test.status === "Completed"}
                    />
                  </div>
                  <button
                    type="submit"
                    className={`submit-btn ${isSubmitted ? 'submitted' : ''}`}
                    disabled={isSubmitted || test.status === "Completed"}
                  >
                    <FaFileSignature className="btn-icon" /> {isSubmitted ? "Submitted" : "Submit Result"}
                  </button>
                </form>
              </>
            ) : (
              <p>Loading test details...</p>
            )}
          </section>
        </main>
      </div>
    </Layout>
  );
}