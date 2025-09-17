import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaFileSignature } from "react-icons/fa";
import Layout from "../components/Layout";
import "./TestSubmission.css";

export default function TestSubmission() {
  const navigate = useNavigate();
  const { testId } = useParams();
  const [test, setTest] = useState(null);
  const [formData, setFormData] = useState({
    labNumber: "",
    dateOfSubmission: "",
    result_data: "",
    analysisRequest: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const token = localStorage.getItem("access_token");

  // Sidebar menu items
  const menuItems = [
    { name: "Dashboard", path: "/technician-dashboard", icon: <FaFileSignature /> },
    { name: "Back", path: "/technician-dashboard", icon: <FaArrowLeft /> },
  ];

  // Fetch test details from backend
  useEffect(() => {
    if (!token) {
      setError("Authentication required.");
      return;
    }

    const fetchTest = async () => {
      try {
        const response = await fetch(
          `http://192.168.1.180:8000/api/tests/${testId}/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch test details");

        const data = await response.json();
        setTest(data);

        setFormData({
          labNumber: data.sample?.laboratory_number || "",
          dateOfSubmission: "",
          result_data: data.results || "",
          analysisRequest: data.analysisRequest || "",
        });

        if (data.status === "Completed" || data.status === "Submitted") {
          setIsSubmitted(true);
        }
      } catch (err) {
        console.error("Error fetching test:", err);
        setError(err.message || "Could not load test details.");
      }
    };

    fetchTest();
  }, [testId, token]);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle result submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `http://192.168.1.180:8000/api/technician/submit-result/${testId}/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            results: formData.result_data,
            status: "Submitted",
            lab_number: formData.labNumber,
            analysis_request: formData.analysisRequest,
            date_of_submission: formData.dateOfSubmission,
          }),
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to submit result");
      }

      const data = await response.json();
      console.log("Result submission success:", data);

      setSuccess("Result submitted successfully!");
      setIsSubmitted(true);

      setTimeout(() => {
        navigate("/technician-dashboard", { state: { refresh: true } });
      }, 1000);
    } catch (err) {
      console.error("Error submitting result:", err);
      setError(err.message || "An error occurred.");
    }
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
            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}

            {test ? (
              <form onSubmit={handleSubmit}>
<table className="details-table">
  <tbody>
  <tr>
  <td>Sample Details</td>
  <td>{test.sample?.sample_details || "—"}</td>
</tr>
<tr>
  <td>Assigned Date</td>
  <td>{test.sample?.date_received || "—"}</td>
</tr>
<tr>
  <td>Sample Submitted By</td>
  <td>{test.sample?.registrar_name || "—"}</td>
</tr>
<tr>
  <td>Sample Code</td>
  <td>{test.sample?.control_number || "—"}</td>
</tr>
    <tr>
      <td>Lab Number</td>
      <td>
        <input
          name="labNumber"
          value={formData.labNumber || ""}
          onChange={handleInputChange}
          required
        />
      </td>
    </tr>
    <tr>
      <td>Date of Submission</td>
      <td>
        <input
          type="date"
          name="dateOfSubmission"
          value={formData.dateOfSubmission || ""}
          onChange={handleInputChange}
          required
        />
      </td>
    </tr>
    <tr>
      <td>Laboratory Results</td>
      <td>
        <textarea
          name="result_data"
          value={formData.result_data || ""}
          onChange={handleInputChange}
          placeholder="Enter test results (e.g., pH: 7.2)"
          rows="4"
          required
        />
      </td>
    </tr>
    <tr>
      <td>Analysis Request</td>
      <td>
        <textarea
          rows="3"
          placeholder="Enter analysis request details"
          name="analysisRequest"
          value={formData.analysisRequest || ""}
          onChange={handleInputChange}
        />
      </td>
    </tr>
    <tr>
      <td>Ingredient</td>
      <td>{test.ingredient?.name || "—"}</td>
    </tr>
    <tr>
      <td>Status</td>
      <td>{test.status || "Pending"}</td>
    </tr>
  </tbody>
</table>

                <button
                  type="submit"
                  className={`submit-btn ${isSubmitted ? "submitted" : ""}`}
                  disabled={isSubmitted}
                >
                  <FaFileSignature className="btn-icon" />{" "}
                  {isSubmitted ? "Submitted" : "Submit to HOD"}
                </button>
              </form>
            ) : (
              <p>Loading test details...</p>
            )}
          </section>
        </main>
      </div>
    </Layout>
  );
}