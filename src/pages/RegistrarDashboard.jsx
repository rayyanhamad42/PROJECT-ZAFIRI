import React, { useState } from "react";
import "./RegistrarDashboard.css";

export default function RegistrarDashboard() {
  const [customerName, setCustomerName] = useState("");
  const [sampleType, setSampleType] = useState("");
  const [testType, setTestType] = useState("");
  const [controlNumber, setControlNumber] = useState("");
  const [paymentStatus, setPaymentStatus] = useState(null);

  const generateControlNumber = () => {
    if (!testType) {
      alert("Please select a test type before generating control number.");
      return;
    }
    const uniqueNum = `${testType.substring(0, 3).toUpperCase()}-${Date.now()}`;
    setControlNumber(uniqueNum);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Details submitted to HOD successfully!");
    setCustomerName("");
    setSampleType("");
    setTestType("");
    setControlNumber("");
  };

  const checkPaymentStatus = () => {
    if (!controlNumber) {
      alert("Enter or generate a control number first!");
      return;
    }
    // For now, simulate payment check
    setPaymentStatus(Math.random() > 0.5 ? "Paid" : "Unpaid");
  };

  return (
    <div className="registrar-dashboard">
      <h1>Registrar Dashboard</h1>
      <form className="register-form" onSubmit={handleSubmit}>
        <label>Customer Name</label>
        <input
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Enter customer name"
          required
        />

        <label>Sample Type</label>
        <input
          type="text"
          value={sampleType}
          onChange={(e) => setSampleType(e.target.value)}
          placeholder="Enter sample type"
          required
        />

        <label>Test Type</label>
        <select
          value={testType}
          onChange={(e) => setTestType(e.target.value)}
          required
        >
          <option value="">Select Test Type</option>
          <option value="Blood Test">Blood Test</option>
          <option value="Urine Test">Urine Test</option>
          <option value="X-Ray">X-Ray</option>
        </select>

        <button type="button" className="generate-btn" onClick={generateControlNumber}>
          Generate Control Number
        </button>

        {controlNumber && (
          <div className="control-display">
            Control Number: <strong>{controlNumber}</strong>
          </div>
        )}

        <button type="submit" className="submit-btn">
          Submit to HOD
        </button>
      </form>

      <div className="payment-section">
        <h2>Verify Payment</h2>
        <input
          type="text"
          value={controlNumber}
          onChange={(e) => setControlNumber(e.target.value)}
          placeholder="Enter control number"
        />
        <button className="verify-btn" onClick={checkPaymentStatus}>
          Check Payment Status
        </button>
        {paymentStatus && (
          <div
            className={`payment-status ${
              paymentStatus === "Paid" ? "paid" : "unpaid"
            }`}
          >
            {paymentStatus}
          </div>
        )}
      </div>
    </div>
  );
}
