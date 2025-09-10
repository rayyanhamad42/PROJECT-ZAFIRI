import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaFileSignature } from "react-icons/fa";
import Layout from "../components/Layout";
import "./TestSubmission.css";

export default function TestSubmission() {
  const navigate = useNavigate();
  const { testId } = useParams();
  const [test, setTest] = useState(null);
  const [formData, setFormData] = useState({ result_data: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false); // <--- RE-ADDED: State variable for submission status

  // Sidebar menu items
  const menuItems = [
    { name: "Dashboard", path: "/technician-dashboard", icon: <FaFileSignature /> },
    { name: "View History", path: "/history", icon: <FaArrowLeft /> },
  ];

  useEffect(() => {
    // Load assignedTests from localStorage
    const testsData = JSON.parse(localStorage.getItem("assignedTests")) || [];
    const foundTest = testsData.find(t => t.id === parseInt(testId, 10));

    if (foundTest) {
      setTest(foundTest);
      // Check if the test was already completed or submitted
      if (foundTest.status === "Completed") {
        setIsSubmitted(true);
      }
    } else {
      setError("Test not found.");
    }
  }, [testId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    console.log("Submitting result:", {
      test: testId,
      sample: test?.sample?.id,
      result_data: formData.result_data,
    });
    
    // --- Update local storage after a successful submission ---
    const testsData = JSON.parse(localStorage.getItem("assignedTests")) || [];
    const updatedTests = testsData.map(t => {
      if (t.id === parseInt(testId, 10)) {
        return { ...t, status: "Completed" };
      }
      return t;
    });

    localStorage.setItem("assignedTests", JSON.stringify(updatedTests));
    // --- End Update local storage ---

    setSuccess("Result submitted successfully! (Mock submission)");
    setIsSubmitted(true); // <--- Set submission state to true
    setFormData({ result_data: "" });

    // Navigate with a state to trigger a refresh on the dashboard
    setTimeout(() => {
      navigate("/technician-dashboard", { state: { refresh: true } });
    }, 1000); // Wait 1 second before navigating
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
              <div className="test-details">
                <p><strong>Sample:</strong> {test.sample.control_number}</p>
                <p><strong>Customer:</strong> {test.sample.customer.name}</p>
                <p><strong>Ingredient:</strong> {test.ingredient?.name || "N/A"}</p>
                <p><strong>Status:</strong> {test.status}</p>
              </div>
            ) : (
              <p>Loading test details...</p>
            )}
            {test && (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="result_data">Test Results</label>
                  <textarea
                    id="result_data"
                    name="result_data"
                    value={formData.result_data}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter test results here (e.g., pH level: 7.2, Salinity: 35 ppt)"
                    rows="5"
                    disabled={isSubmitted || test.status === "Completed"} // Disable textarea if submitted
                  />
                </div>
                <button
                  type="submit"
                  className={`submit-btn ${isSubmitted ? 'submitted' : ''}`} // Apply 'submitted' class
                  disabled={isSubmitted || test.status === "Completed"} // Disable if submitted or already completed
                >
                  <FaFileSignature className="btn-icon" /> {isSubmitted ? "Submitted" : "Submit Result"}
                </button>
              </form>
            )}
          </section>
        </main>
      </div>
    </Layout>
  );
}