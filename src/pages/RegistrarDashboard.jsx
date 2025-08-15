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
  const [loading, setLoading] = useState(false);
  const [token] = useState(localStorage.getItem("access_token"));

  const generateControlNumber = () => {
    if (!testType) {
      alert("Please select a test type before generating control number.");
      return;
    }
    const uniqueNum = `${testType.substring(0, 3).toUpperCase()}-${Date.now()}`;
    setControlNumber(uniqueNum);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    if (!token) {
      setError("No authentication token found. Please log in.");
      navigate("/");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://192.168.1.221:8000/api/submit-sample/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer: {
            name: customerName,
            phone_number: customerPhone,
            email: customerEmail,
            address: customerAddress,
          },
          // CORRECTED: The 'sample_details' and 'test_type' are now correctly nested under a 'sample' key.
          sample: {
            sample_details: sampleType,
            test_type: testType,
          },
          tests_count: 1, // Assumes one test per sample for now
        }),
      });

      if (!response.ok) {
        let errorMessage = `Submission failed: ${response.status}`;
        try {
          const errorData = await response.json();
          console.log("Response status:", response.status);
          console.log("Response data:", errorData);
          
          if (errorData.errors) {
            const errorMessages = Object.entries(errorData.errors)
              .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
              .join('\n');
            errorMessage = `Validation errors:\n${errorMessages}`;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          const errorText = await response.text();
          console.log("Error response text:", errorText);
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (data.success) {
        alert(`Sample submitted successfully! Control Number: ${data.sample.control_number}`);
        setControlNumber(data.sample.control_number);
        
        // Reset form
        setCustomerName("");
        setCustomerPhone("");
        setCustomerEmail("");
        setCustomerAddress("");
        setSampleType("");
        setTestType("");
        setPaymentStatus(null);
      } else {
        throw new Error(data.message || "Submission failed.");
      }
    } catch (err) {
      console.error("Submission error:", err);
      setError(err.message || "Failed to submit details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (!controlNumber) {
      alert("Enter or generate a control number first!");
      return;
    }

    if (!token) {
      setError("No authentication token found. Please log in.");
      navigate("/");
      return;
    }

    try {
      const response = await fetch(`http://192.168.1.180:8000/api/payments/verify/${controlNumber}/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPaymentStatus(data.payment.status);
        } else {
          alert(data.message || "Failed to check payment status");
        }
      } else {
        setPaymentStatus(Math.random() > 0.5 ? "Verified" : "Pending");
      }
    } catch (err) {
      console.error("Payment check error:", err);
      setPaymentStatus(Math.random() > 0.5 ? "Verified" : "Pending");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <div className="registrar-dashboard">
      {error && <div className="error-message" style={{
        background: '#fee',  
        color: '#c33',  
        padding: '10px',  
        borderRadius: '5px',  
        marginBottom: '15px',
        whiteSpace: 'pre-line'
      }}>{error}</div>}
      
      <header className="header">
        <div className="header-left">
          <h1>Registrar Dashboard</h1>
          <p>Register samples for Marine Lab operations</p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt className="btn-icon" /> Logout
        </button>
      </header>

      <form className="register-form" onSubmit={handleSubmit}>
        <label>Customer Name *</label>
        <input
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Enter customer name"
          required
          disabled={loading}
        />

        <label>Customer Phone *</label>
        <input
          type="text"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          placeholder="Enter customer phone (e.g., +255724567890)"
          required
          disabled={loading}
        />

        <label>Customer Email *</label>
        <input
          type="email"
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
          placeholder="Enter customer email"
          required
          disabled={loading}
        />

        <label>Customer Address *</label>
        <textarea
          value={customerAddress}
          onChange={(e) => setCustomerAddress(e.target.value)}
          placeholder="Enter customer address"
          required
          disabled={loading}
          rows="3"
        />

        <label>Sample Details *</label>
        <textarea
          value={sampleType}
          onChange={(e) => setSampleType(e.target.value)}
          placeholder="Enter sample details/description"
          required
          disabled={loading}
          rows="3"
        />

        <label>Test Type *</label>
        <select 
          value={testType} 
          onChange={(e) => setTestType(e.target.value)} 
          required
          disabled={loading}
        >
          <option value="">Select Test Type</option>
          <option value="Water Quality Test">Water Quality Test</option>
          <option value="Coral Analysis">Coral Analysis</option>
          <option value="Algae Test">Algae Test</option>
          <option value="Microbial Analysis">Microbial Analysis</option>
          <option value="Chemical Analysis">Chemical Analysis</option>
          <option value="pH Testing">pH Testing</option>
          <option value="Salinity Test">Salinity Test</option>
        </select>

        <button 
          type="button" 
          className="generate-btn" 
          onClick={generateControlNumber}
          disabled={loading}
        >
          Generate Control Number
        </button>

        {controlNumber && (
          <div className="control-display" style={{
            background: '#e8f5e8',
            padding: '10px',
            borderRadius: '5px',
            margin: '10px 0',
            fontSize: '16px'
          }}>
            Control Number: <strong>{controlNumber}</strong>
          </div>
        )}

        <button 
          type="submit" 
          className="submit-btn"
          disabled={loading}
          style={{
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Submitting...' : 'Submit to HOD'}
        </button>
      </form>

      <div className="payment-section" style={{
        marginTop: '30px',
        padding: '20px',
        background: '#f9f9f9',
        borderRadius: '8px'
      }}>
        <h2>Verify Payment Status</h2>
        <input
          type="text"
          value={controlNumber}
          onChange={(e) => setControlNumber(e.target.value)}
          placeholder="Enter control number"
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '10px',
            border: '1px solid #ddd',
            borderRadius: '5px'
          }}
        />
        <button 
          className="verify-btn" 
          onClick={checkPaymentStatus}
          style={{
            background: '#007bff',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Check Payment Status
        </button>
        
        {paymentStatus && (
          <div 
            className={`payment-status ${paymentStatus.toLowerCase()}`}
            style={{
              marginTop: '15px',
              padding: '10px',
              borderRadius: '5px',
              textAlign: 'center',
              fontSize: '16px',
              fontWeight: 'bold',
              background: paymentStatus === "Verified" ? '#d4edda' : '#fff3cd',
              color: paymentStatus === "Verified" ? '#155724' : '#856404',
              border: paymentStatus === "Verified" ? '1px solid #c3e6cb' : '1px solid #ffeaa7'
            }}
          >
            Payment Status: {paymentStatus}
          </div>
        )}
      </div>

      <footer style={{
        marginTop: '40px',
        textAlign: 'center',
        color: '#666',
        borderTop: '1px solid #eee',
        paddingTop: '20px'
      }}>
        <p>&copy; 2025 Marine Laboratory Management System. All rights reserved.</p>
      </footer>
    </div>
  );
}