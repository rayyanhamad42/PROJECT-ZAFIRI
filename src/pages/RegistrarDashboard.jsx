// src/pages/RegistrarDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaFlask,
  FaUserPlus,
  FaHistory,
  FaPlusCircle,
} from "react-icons/fa";
import Select from "react-select";
import Layout from "../components/Layout";
import "./RegistrarDashboard.css";

export default function RegistrarDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [registrarName] = useState(localStorage.getItem("username") || "Registrar");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [controlNumber, setControlNumber] = useState("");
  const [sampleName, setSampleName] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");

  const [paymentStatus, setPaymentStatus] = useState({});
  const [paymentDetails, setPaymentDetails] = useState({}); // kept for future use
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [token] = useState(localStorage.getItem("access_token"));
  const [ingredients, setIngredients] = useState([]);
  const [microIngredients, setMicroIngredients] = useState([]);
  const [chemIngredients, setChemIngredients] = useState([]);
  const [samples, setSamples] = useState([]);
  const [pendingTests, setPendingTests] = useState([]);

  const MARKING_FEE = 10000.0;

  const [samplesToAdd, setSamplesToAdd] = useState([
    { sample_name: "", sample_details: "", selected_micro_ingredients: [], selected_chem_ingredients: [] },
  ]);

  // Menu for Layout (same style as other dashboards)
  const menuItems = [
    { name: "Dashboard", path: "/registrar-dashboard", icon: <FaTachometerAlt /> },
    { name: "Register Sample", path: "/registrar-dashboard/register-sample", icon: <FaUserPlus /> },
    { name: "Verify Payment", path: "/registrar-dashboard/verify-payment", icon: <FaFlask /> },
    { name: "Sample History", path: "/registrar-dashboard/sample-history", icon: <FaHistory /> },
  ];

  useEffect(() => {
    const { pathname } = location;
    if (pathname === "/registrar-dashboard/verify-payment") {
      setActiveTab("verify-payment");
    } else if (pathname === "/registrar-dashboard/sample-history") {
      setActiveTab("sample-history");
    } else if (pathname === "/registrar-dashboard/register-sample") {
      setActiveTab("register-sample");
    } else {
      setActiveTab("dashboard");
    }
  }, [location.pathname]);

  useEffect(() => {
    const fetchIngredientsAndDashboard = async () => {
      if (!token) return;
      try {
        // Ingredients
        const ingredientsResponse = await fetch("http://192.168.1.180:8000/api/ingredients/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (ingredientsResponse.ok) {
          const ingredientsData = await ingredientsResponse.json();
          const allIngredients = ingredientsData.ingredients || [];
          setIngredients(allIngredients);
          setMicroIngredients(allIngredients.filter((ing) => ing.test_type === "Microbiology"));
          setChemIngredients(allIngredients.filter((ing) => ing.test_type === "Chemistry"));
        } else {
          const errorText = await ingredientsResponse.text();
          console.warn("Ingredients fetch failed:", ingredientsResponse.status, errorText);
          setError("Cannot load test options. Please contact an Admin to set up ingredients.");
        }

        // Dashboard data
        const dashboardResponse = await fetch("http://192.168.1.180:8000/api/dashboard/registrar/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!dashboardResponse.ok) throw new Error("Failed to fetch dashboard data.");

        const dashboardData = await dashboardResponse.json();
        const recent = dashboardData.recent_samples || [];
        setSamples(recent);

        const initialStatus = {};
        recent.forEach((s) => {
          initialStatus[s.control_number] = s.payment?.status || "Pending";
        });
        setPaymentStatus(initialStatus);
        setPendingTests(dashboardData.pending_tests || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please refresh or contact support.");
      }
    };

    fetchIngredientsAndDashboard();
  }, [token]);

  const handleSampleChange = (index, field, value) => {
    const updated = [...samplesToAdd];
    updated[index][field] = value;
    setSamplesToAdd(updated);
  };

  const handleSelectChange = (index, selectedOptions, category) => {
    const updated = [...samplesToAdd];
    const field = category === "microbiology" ? "selected_micro_ingredients" : "selected_chem_ingredients";
    updated[index][field] = selectedOptions ? selectedOptions.map((o) => o.value) : [];
    setSamplesToAdd(updated);
  };

  const addNewSample = () => {
    setSamplesToAdd((prev) => [
      ...prev,
      { sample_name: "", sample_details: "", selected_micro_ingredients: [], selected_chem_ingredients: [] },
    ]);
  };

  const calculateTotalPrice = () => {
    let testsPrice = 0;
    samplesToAdd.forEach((sample) => {
      const allSelected = [...sample.selected_micro_ingredients, ...sample.selected_chem_ingredients];
      allSelected.forEach((id) => {
        const ing = ingredients.find((x) => x.id === id);
        if (ing) testsPrice += parseFloat(ing.price || 0);
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
      samples: samplesToAdd.map((s) => ({
        sample_name: s.sample_name,
        sample_details: s.sample_details,
        selected_ingredients: [...s.selected_micro_ingredients, ...s.selected_chem_ingredients],
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
        let errorData;
        try {
          errorData = await response.json();
        } catch {}
        if (errorData) {
          const errorMessages = Object.entries(errorData)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(", ") : messages}`)
            .join("\n");
          errorMessage = `Validation errors:\n${errorMessages}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const totalPayment = calculateTotalPrice();
      alert(
        `Samples submitted successfully!\nControl Number(s): ${data.samples
          .map((s) => s.control_number)
          .join(", ")}\nTotal Amount Due: TZS ${totalPayment}`
      );

      setControlNumber(data.samples.map((s) => s.control_number).join(", "));
      setCustomerName("");
      setCustomerPhone("");
      setCustomerEmail("");
      setCustomerAddress("");
      setSamplesToAdd([
        { sample_name: "", sample_details: "", selected_micro_ingredients: [], selected_chem_ingredients: [] },
      ]);

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
      const firstCtrl = controlNumber.split(",")[0].trim();
      const response = await fetch(
        `http://192.168.1.180:8000/api/payments/verify/${firstCtrl}/`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPaymentStatus((prev) => ({ ...prev, [firstCtrl]: data.payment.status }));
          setPaymentDetails((prev) => ({
            ...prev,
            [firstCtrl]: {
              status: data.payment.status,
              amount: data.payment.amount || "N/A",
              date:
                data.payment.date ||
                new Date().toLocaleString("en-US", { timeZone: "Africa/Nairobi" }),
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
      const firstCtrl = controlNumber.split(",")[0].trim();
      setPaymentStatus((prev) => ({ ...prev, [firstCtrl]: "Pending" }));
      setPaymentDetails((prev) => ({
        ...prev,
        [firstCtrl]: { status: "Pending", amount: "N/A", date: "N/A" },
      }));
      alert("Could not verify payment status. Defaulting to Pending.");
    } finally {
      setLoading(false);
    }
  };

  const microOptions = microIngredients.map((ingredient) => ({
    value: ingredient.id,
    label: `${ingredient.name} (TZS ${ingredient.price})`,
  }));

  const chemOptions = chemIngredients.map((ingredient) => ({
    value: ingredient.id,
    label: `${ingredient.name} (TZS ${ingredient.price})`,
  }));

  const handleControlClick = (controlNum, sName) => {
    setControlNumber(controlNum);
    setSampleName(sName || "");
  };

  return (
    <Layout menuItems={menuItems}>
      <div className="dashboard-content">
        {/* Optional welcome header inside content */}
       

        {error && <div className="error-message">{error}</div>}

        {/* Register Sample */}
        {(activeTab === "register-sample" || activeTab === "dashboard") && (
          <section className="content-card register-sample-page">
            <h2 className="section-title">
              <FaUserPlus className="title-icon" /> Register New Sample(s)
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-section">
                <h3>Customer Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="customerName">Customer Name </label>
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
                    <label htmlFor="customerPhone">Customer Phone </label>
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
                    <label htmlFor="customerEmail">Customer Email </label>
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
                    <label htmlFor="customerAddress">Customer Address </label>
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
                          value={microOptions.filter((opt) =>
                            sample.selected_micro_ingredients.includes(opt.value)
                          )}
                          onChange={(selected) => handleSelectChange(index, selected, "microbiology")}
                          isDisabled={loading}
                          className="react-select-container"
                          classNamePrefix="react-select"
                          hideSelectedOptions={false}
                          components={{ MultiValue: () => null }}
                        />
                      ) : (
                        <p>{error || "Loading tests..."}</p>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Chemistry Tests</label>
                      {chemIngredients.length > 0 ? (
                        <Select
                          isMulti
                          options={chemOptions}
                          value={chemOptions.filter((opt) =>
                            sample.selected_chem_ingredients.includes(opt.value)
                          )}
                          onChange={(selected) => handleSelectChange(index, selected, "chemistry")}
                          isDisabled={loading}
                          className="react-select-container"
                          classNamePrefix="react-select"
                          hideSelectedOptions={false}
                          components={{ MultiValue: () => null }}
                        />
                      ) : (
                        <p>{error || "Loading tests..."}</p>
                      )}
                    </div>

                    <div className="selected-micro-tests">
                      <strong>Selected Microbiology Tests:</strong>
                      {sample.selected_micro_ingredients.map((id) => {
                        const ing = ingredients.find((x) => x.id === id);
                        return ing ? <div key={id}>- {ing.name} (TZS {ing.price})</div> : null;
                      })}
                    </div>

                    <div className="selected-chem-tests">
                      <strong>Selected Chemistry Tests:</strong>
                      {sample.selected_chem_ingredients.map((id) => {
                        const ing = ingredients.find((x) => x.id === id);
                        return ing ? <div key={id}>- {ing.name} (TZS {ing.price})</div> : null;
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

        {/* Verify Payment */}
        {activeTab === "verify-payment" && (
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
                      <td>{sample.customer?.name || "N/A"}</td>
                      <td>{sample.sample_details || "N/A"}</td>
                      <td>
                        {sample.tests && sample.tests.length > 0
                          ? sample.tests.map((t) => t.ingredient?.name || "N/A").join(", ")
                          : pendingTests
                              .filter((t) => t.sample === sample.id)
                              .map((t) => t.ingredient?.name || "N/A")
                              .join(", ") || "N/A"}
                      </td>
                      <td
                        style={{ cursor: "pointer", color: "#0077b6" }}
                        onClick={() => handleControlClick(sample.control_number, sample.name)}
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
              <button className="verify-btn" onClick={checkPaymentStatus} disabled={loading}>
                {loading ? "Checking..." : "Check Payment Status"}
              </button>
            </div>

            {controlNumber && paymentStatus[controlNumber] && (
              <div className={`payment-status ${paymentStatus[controlNumber].toLowerCase()}`}>
                Payment Status: {paymentStatus[controlNumber]}
              </div>
            )}
          </section>
        )}

        {/* Sample History (placeholder to keep structure identical) */}
        {activeTab === "sample-history" && (
          <section className="content-card">
            <h2 className="section-title">
              <FaHistory className="title-icon" /> Sample History
            </h2>
            <p>Coming soon…</p>
          </section>
        )}
      </div>
    </Layout>
  );
}
