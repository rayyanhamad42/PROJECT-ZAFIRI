import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt } from "react-icons/fa";
import "./RegistrarDashboard.css";

export default function RegistrarDashboard() {
  const navigate = useNavigate();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [sampleType, setSampleType] = useState("");
  const [testType, setTestType] = useState("");
  const [controlNumber, setControlNumber] = useState("");
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [error, setError] = useState("");
  const [token] = useState(localStorage.getItem("access_token"));

  const generateControlNumber = () => {
    if (!testType) {
      alert("Please select a test type first.");
      return;
    }
    const uniqueNum = `${testType.substring(0, 3).toUpperCase()}-${Date.now()}`;
    setControlNumber(uniqueNum);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!token) {
      setError("No authentication token found. Please log in.");
      navigate("/");
      return;
    }
    try {
      const response = await fetch("http://192.168.1.180:8000/api/submit-sample/", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName, customerPhone, customerEmail, customerAddress,
          sampleType, testType, controlNumber, status: "Pending",
          date: new Date().toISOString().split("T")[0],
        }),
      });
      if (!response.ok) throw new Error(`Submission failed: ${response.status}`);
      const data = await response.json();
      if (data.success) {
        alert("Details submitted to HOD successfully!");
        setCustomerName(""); setCustomerPhone(""); setCustomerEmail("");
        setCustomerAddress(""); setSampleType(""); setTestType("");
        setControlNumber(""); setPaymentStatus(null);
      } else throw new Error(data.message || "Submission failed.");
    } catch (err) {
      console.error("Submission error:", err);
      setError(err.message || "Failed to submit. Try again.");
    }
  };

  const checkPaymentStatus = () => {
    if (!controlNumber) {
      alert("Generate a control number first!");
      return;
    }
    setPaymentStatus(Math.random() > 0.5 ? "Paid" : "Unpaid");
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <div className="registrar-dashboard">
      <div className="main-content">
        {error && <p className="error-message">{error}</p>}
        <header className="header">
          <div className="header-left">
            <h1>Registrar Dashboard</h1>
            <p>Register samples for Marine Lab</p>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </header>
        <main className="dashboard-content">
          <form className="register-form" onSubmit={handleSubmit}>
            <h2>Register Sample</h2>
            <label>Customer Name</label><input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Name" required />
            <label>Customer Phone</label><input type="text" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Phone" required />
            <label>Customer Email</label><input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="Email" required />
            <label>Customer Address</label><input type="text" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} placeholder="Address" required />
            <label>Sample Type</label><input type="text" value={sampleType} onChange={(e) => setSampleType(e.target.value)} placeholder="Sample" required />
            <label>Test Type</label>
            <select value={testType} onChange={(e) => setTestType(e.target.value)} required>
              <option value="">Select Test</option>
              <option value="Water Quality Test">Water Quality Test</option>
              <option value="Coral Analysis">Coral Analysis</option>
              <option value="Algae Test">Algae Test</option>
            </select>
            <button type="button" className="generate-btn" onClick={generateControlNumber}>Generate Ctrl No.</button>
            {controlNumber && <div className="control-display">Ctrl No.: <strong>{controlNumber}</strong></div>}
            <button type="submit" className="submit-btn">Submit</button>
          </form>
          <section className="payment-section">
            <h2>Verify Payment</h2>
            <input type="text" value={controlNumber} onChange={(e) => setControlNumber(e.target.value)} placeholder="Ctrl No." />
            <button className="verify-btn" onClick={checkPaymentStatus}>Check Status</button>
            {paymentStatus && <div className={`payment-status ${paymentStatus === "Paid" ? "paid" : "unpaid"}`}>{paymentStatus}</div>}
          </section>
        </main>
        <footer className="footer">
          <p>&copy; 2025 Marine Laboratory Management System</p>
        </footer>
      </div>
    </div>
  );
}