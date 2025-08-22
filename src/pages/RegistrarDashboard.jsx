import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSignOutAlt,
  FaTachometerAlt,
  FaFlask,
  FaUserPlus,
  FaHistory,
  FaPlusCircle,
} from "react-icons/fa";
import Select from 'react-select';
import logo from "../assets/zafiri.png";
import "./RegistrarDashboard.css";

export default function RegistrarDashboard() {
  const navigate = useNavigate();
  const [registrarName] = useState(localStorage.getItem("username") || "Registrar");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [controlNumber, setControlNumber] = useState("");
  const [sampleName, setSampleName] = useState("");
  const [paymentStatus, setPaymentStatus] = useState({});
  const [paymentDetails, setPaymentDetails] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [token] = useState(localStorage.getItem("access_token"));
  const [activeMenu, setActiveMenu] = useState("register-sample");
  const [ingredients, setIngredients] = useState([]);
  const [microIngredients, setMicroIngredients] = useState([]);
  const [chemIngredients, setChemIngredients] = useState([]);
  const [samples, setSamples] = useState([]);
  const MARKING_FEE = 10000.0;

  const [samplesToAdd, setSamplesToAdd] = useState([
    { sample_name: "", sample_details: "", selected_micro_ingredients: [], selected_chem_ingredients: [] },
  ]);

  useEffect(() => {
    const fetchIngredients = async () => {
      if (!token) return;
      try {
        const response = await fetch("http://192.168.1.180:8000/api/ingredients/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch ingredients.");
        const data = await response.json();
        setIngredients(data);
        const micro = data.filter((ing) => ing.test_type === "Microbiology");
        const chem = data.filter((ing) => ing.test_type === "Chemistry");
        setMicroIngredients(micro);
        setChemIngredients(chem);
      } catch (err) {
        console.error("Error fetching ingredients:", err);
        setError("Failed to load test options. Please refresh.");
      }
    };

    const fetchSamples = async () => {
      if (!token) return;
      try {
        const response = await fetch("http://192.168.1.180:8000/api/registrar-samples/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch samples.");
        const data = await response.json();
        setSamples(data.samples || []);
        const initialStatus = {};
        (data.samples || []).forEach((s) => {
          initialStatus[s.control_number] = s.payment?.status || "Pending";
        });
        setPaymentStatus(initialStatus);
      } catch (err) {
        console.error("Error fetching samples:", err);
        setError("Failed to load sample data. Please refresh.");
      }
    };

    fetchIngredients();
    fetchSamples();
  }, [token]);

  const handleSampleChange = (index, field, value) => {
    const updatedSamples = [...samplesToAdd];
    updatedSamples[index][field] = value;
    setSamplesToAdd(updatedSamples);
  };

  const handleSelectChange = (index, selectedOptions, category) => {
    const updatedSamples = [...samplesToAdd];
    const field = category === "microbiology" ? "selected_micro_ingredients" : "selected_chem_ingredients";
    const currentSelections = updatedSamples[index][field] || [];
    const newSelections = selectedOptions ? selectedOptions.map(option => option.value) : [];
    const updatedSelections = [...new Set([...currentSelections, ...newSelections])];
    updatedSamples[index][field] = updatedSelections;
    setSamplesToAdd(updatedSamples);
  };

  const addNewSample = () => {
    setSamplesToAdd([...samplesToAdd, { sample_name: "", sample_details: "", selected_micro_ingredients: [], selected_chem_ingredients: [] }]);
  };

  const calculateTotalPrice = () => {
    let testsPrice = 0;
    samplesToAdd.forEach((sample) => {
      const allSelected = [...sample.selected_micro_ingredients, ...sample.selected_chem_ingredients];
      allSelected.forEach((id) => {
        const ingredient = ingredients.find((ing) => ing.id === id);
        if (ingredient) testsPrice += parseFloat(ingredient.price || 0);
      });
    });
    return (testsPrice + MARKING_FEE * samplesToAdd.length).toFixed(2);
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

    const requestBody = {
      customer: {
        name: customerName,
        phone_number: customerPhone,
        email: customerEmail,
        address: customerAddress,
      },
      samples: samplesToAdd.map((sample) => ({
        sample_name: sample.sample_name,
        sample_details: sample.sample_details,
        selected_ingredients: [...sample.selected_micro_ingredients, ...sample.selected_chem_ingredients],
      })),
    };

    try {
      const response = await fetch("http://192.168.1.180:8000/api/submit-sample/", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        let errorMessage = `Submission failed: ${response.status}`;
        const errorData = await response.json();
        if (errorData) {
          const errorMessages = Object.entries(errorData)
            .map(
              ([field, messages]) =>
                `${field}: ${Array.isArray(messages) ? messages.join(", ") : messages}`
            )
            .join("\n");
          errorMessage = `Validation errors:\n${errorMessages}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const totalPayment = calculateTotalPrice();
      alert(
        `Samples submitted successfully!\nControl Number(s): ${data.samples.map(s => s.control_number).join(", ")}\nTotal Amount Due: TZS ${totalPayment}`
      );

      setControlNumber(data.samples.map(s => s.control_number).join(", "));
      setCustomerName("");
      setCustomerPhone("");
      setCustomerEmail("");
      setCustomerAddress("");
      setSamplesToAdd([{ sample_name: "", sample_details: "", selected_micro_ingredients: [], selected_chem_ingredients: [] }]);
      const newStatus = {};
      data.samples.forEach((s) => {
        newStatus[s.control_number] = "Pending";
      });
      setPaymentStatus((prev) => ({ ...prev, ...newStatus }));
      setSamples((prev) => [...prev, ...data.samples]);
    } catch (err) {
      console.error("Submission error:", err);
      setError(err.message || "Failed to submit details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (!controlNumber) {
      alert("Please enter a control number!");
      return;
    }
    if (!token) {
      setError("No authentication token found. Please log in.");
      navigate("/");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `http://192.168.1.180:8000/api/payments/verify/${controlNumber.split(",")[0]}/`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPaymentStatus((prev) => ({ ...prev, [controlNumber.split(",")[0]]: data.payment.status }));
          setPaymentDetails((prev) => ({
            ...prev,
            [controlNumber.split(",")[0]]: {
              status: data.payment.status,
              amount: data.payment.amount || "N/A",
              date: data.payment.date || new Date().toLocaleString("en-US", { timeZone: "Africa/Nairobi" }),
            },
          }));
        } else {
          alert(data.message || "Failed to check payment status");
        }
      } else {
        const errorText = await response.text();
        throw new Error(`Payment verification failed: ${response.status} - ${errorText}`);
      }
    } catch (err) {
      console.error("Payment check error:", err);
      setPaymentStatus((prev) => ({ ...prev, [controlNumber.split(",")[0]]: "Pending" }));
      setPaymentDetails((prev) => ({
        ...prev,
        [controlNumber.split(",")[0]]: { status: "Pending", amount: "N/A", date: "N/A" },
      }));
      alert("Could not verify payment status. Defaulting to Pending.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    navigate("/");
  };

  const microOptions = microIngredients.map(ingredient => ({
    value: ingredient.id,
    label: `${ingredient.name} (TZS ${ingredient.price})`
  }));

  const chemOptions = chemIngredients.map(ingredient => ({
    value: ingredient.id,
    label: `${ingredient.name} (TZS ${ingredient.price})`
  }));

  const handleControlClick = (controlNum, sampleName) => {
    setControlNumber(controlNum);
    setSampleName(sampleName);
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <img src={logo} alt="Zafiri Logo" className="sidebar-logo" />
        </div>
        <ul className="menu">
          <li
            className={activeMenu === "dashboard" ? "active" : ""}
            onClick={() => setActiveMenu("dashboard")}
          >
            <FaTachometerAlt className="menu-icon" /> Dashboard
          </li>
          <li
            className={activeMenu === "register-sample" ? "active" : ""}
            onClick={() => setActiveMenu("register-sample")}
          >
            <FaUserPlus className="menu-icon" /> Register Sample
          </li>
          <li
            className={activeMenu === "verify-payment" ? "active" : ""}
            onClick={() => setActiveMenu("verify-payment")}
          >
            <FaFlask className="menu-icon" /> Verify Payment
          </li>
          <li
            className={activeMenu === "sample-history" ? "active" : ""}
            onClick={() => setActiveMenu("sample-history")}
          >
            <FaHistory className="menu-icon" /> Sample History
          </li>
        </ul>
      </aside>

      <main className="content">
        <header className="header">
          <div className="header-left">
            <h1>Welcome, {registrarName}</h1>
            <p>Register and manage samples for Marine Lab operations</p>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt className="btn-icon" /> Logout
          </button>
        </header>

        {error && <div className="error-message">{error}</div>}

        {activeMenu === "register-sample" && (
          <section className="content-card register-sample-page">
            <h2 className="section-title">
              <FaUserPlus className="title-icon" /> Register New Sample(s)
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-section">
                <h3>Customer Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="customerName">Customer Name *</label>
                    <input
                      id="customerName"
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="customerPhone">Customer Phone *</label>
                    <input
                      id="customerPhone"
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="customerEmail">Customer Email *</label>
                    <input
                      id="customerEmail"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="customerAddress">Customer Address *</label>
                    <textarea
                      id="customerAddress"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      required
                      disabled={loading}
                      rows="3"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Samples & Test Details</h3>
                {samplesToAdd.map((sample, index) => (
                  <div key={index} className="sample-box">
                    <h4>Sample {index + 1}</h4>
                    <div className="form-group">
                      <label>Sample Name *</label>
                      <input
                        type="text"
                        value={sample.sample_name}
                        onChange={(e) => handleSampleChange(index, "sample_name", e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="form-group">
                      <label>Sample Details *</label>
                      <textarea
                        value={sample.sample_details}
                        onChange={(e) => handleSampleChange(index, "sample_details", e.target.value)}
                        required
                        disabled={loading}
                        rows="2"
                      />
                    </div>
                    <div className="form-group">
                      <label>Microbiology Tests</label>
                      {microIngredients.length > 0 ? (
                        <Select
                          isMulti
                          options={microOptions}
                          value={microOptions.filter(option => sample.selected_micro_ingredients.includes(option.value))}
                          onChange={(selected) => handleSelectChange(index, selected, "microbiology")}
                          isDisabled={loading}
                          className="react-select-container"
                          classNamePrefix="react-select"
                          hideSelectedOptions={false}
                          components={{ MultiValue: () => null }} // Hide multi-value tags
                        />
                      ) : (
                        <p>Loading tests...</p>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Chemistry Tests</label>
                      {chemIngredients.length > 0 ? (
                        <Select
                          isMulti
                          options={chemOptions}
                          value={chemOptions.filter(option => sample.selected_chem_ingredients.includes(option.value))}
                          onChange={(selected) => handleSelectChange(index, selected, "chemistry")}
                          isDisabled={loading}
                          className="react-select-container"
                          classNamePrefix="react-select"
                          hideSelectedOptions={false}
                          components={{ MultiValue: () => null }} // Hide multi-value tags
                        />
                      ) : (
                        <p>Loading tests...</p>
                      )}
                    </div>
                    <div className="selected-micro-tests">
                      <strong>Selected Microbiology Tests:</strong>
                      {sample.selected_micro_ingredients.map(id => {
                        const ingredient = ingredients.find(ing => ing.id === id);
                        return ingredient ? (
                          <div key={id}>- {ingredient.name} (TZS {ingredient.price})</div>
                        ) : null;
                      })}
                    </div>
                    <div className="selected-chem-tests">
                      <strong>Selected Chemistry Tests:</strong>
                      {sample.selected_chem_ingredients.map(id => {
                        const ingredient = ingredients.find(ing => ing.id === id);
                        return ingredient ? (
                          <div key={id}>- {ingredient.name} (TZS {ingredient.price})</div>
                        ) : null;
                      })}
                    </div>
                  </div>
                ))}
                <button type="button" className="add-sample-btn" onClick={addNewSample}>
                  <FaPlusCircle /> Add Another Sample
                </button>
              </div>

              <div className="total-price-display">
                <strong>Total Amount Due:</strong> TZS {calculateTotalPrice()}
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? "Submitting..." : "Submit & Get Payment Info"}
                </button>
                {controlNumber && (
                  <div className="control-display">
                    Control Number(s): <strong>{controlNumber}</strong>
                  </div>
                )}
              </div>
            </form>
          </section>
        )}

       {activeMenu === "verify-payment" && (
  <section className="content-card verify-payment-page">
    <h2 className="section-title">
      <FaFlask className="title-icon" /> Verify Payment Status
    </h2>

    {error && <div className="error-message">{error}</div>}

    <div className="table-wrapper">
      <table className="payment-table">
        <thead>
          <tr>
            <th>Customer Name</th>
            <th>Sample Details</th>
            <th>Ingredients</th>
            <th>Control Number</th>
            <th>Payment Status</th>
          </tr>
        </thead>
        <tbody>
          {samples.map((sample) => (
            <tr key={sample.id}>
              <td>{sample.customer.name}</td>
              <td>{sample.sample_details}</td>
              <td>
                {sample.tests && sample.tests.length > 0
                  ? sample.tests.map((test) => test.ingredient?.name || "N/A").join(", ")
                  : "N/A"}
              </td>
              <td
                style={{ cursor: "pointer", color: "#0077b6" }}
                onClick={() => setControlNumber(sample.control_number)}
              >
                {sample.control_number}
              </td>
              <td>{paymentStatus[sample.control_number] || "Pending"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div className="form-group">
      <input
        type="text"
        value={controlNumber}
        onChange={(e) => setControlNumber(e.target.value)}
        placeholder="Click a control number to populate"
      />
      <button
        className="verify-btn"
        onClick={checkPaymentStatus}
        disabled={loading}
      >
        {loading ? "Checking..." : "Check Payment Status"}
      </button>
    </div>

    {controlNumber && paymentStatus[controlNumber] && (
      <div
        className={`payment-status ${paymentStatus[controlNumber].toLowerCase()}`}
      >
        Payment Status: {paymentStatus[controlNumber]}
      </div>
    )}
  </section>
)}

        
      </main>
      <footer className="footer">
        <p>&copy; 2025 Marine Laboratory Management System. All rights reserved.</p>
      </footer>
    </div>
  );
}