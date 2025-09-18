import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaFlask,
  FaUserPlus,
  FaHistory,
  FaPlusCircle,
  FaClipboardCheck,
} from "react-icons/fa";
import Select from "react-select";
import Layout from "../components/Layout";
import ClaimSubmission from "./ClaimSubmission";
import "./RegistrarDashboard.css";

// Custom Country and Phone Input Component
const CountryPhoneInput = ({
  countryOptions,
  selectedCountry,
  setSelectedCountry,
  phoneNumber,
  setPhoneNumber,
}) => {
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // If the click is outside the component, close the dropdown
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowCountryPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCountrySelection = (country) => {
    setSelectedCountry(country);
    setShowCountryPicker(false);
  };
  
  const handleTogglePicker = (event) => {
      // Stop propagation to prevent the document's click listener from firing immediately
      event.stopPropagation();
      setShowCountryPicker(prev => !prev);
  };

  return (
    <div className="phone-input-wrapper" ref={wrapperRef}>
      <div 
        className="country-code-display" 
        onClick={handleTogglePicker}
      >
        <span>{selectedCountry.flag} {selectedCountry.name} {selectedCountry.code}</span>
        <span className="dropdown-arrow"></span>
      </div>
      {showCountryPicker && (
        <div className="country-picker">
          {countryOptions.map((country) => (
            <div
              key={country.code}
              className="country-picker-option"
              onClick={() => handleCountrySelection(country)}
            >
              {country.flag} {country.name} {country.code}
            </div>
          ))}
        </div>
      )}
      <input
        type="tel"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        required
        placeholder="Enter phone number"
        className="phone-number-input-field"
      />
    </div>
  );
};

export default function RegistrarDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [registrarName] = useState(localStorage.getItem("username") || "Registrar");

  // Customer fields
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [street, setStreet] = useState("");
  const [isOrganization, setIsOrganization] = useState(false);
  const [nationalId, setNationalId] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [dateReceived, setDateReceived] = useState("");
  const [dateSubmittedToHOD, setDateSubmittedToHOD] = useState("");

  const [modalSample, setModalSample] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [token] = useState(localStorage.getItem("access_token"));

  const countryOptions = [
    { name: "TZ", code: "+255", flag: "🇹🇿" },
    { name: "KE", code: "+254", flag: "🇰🇪" },
    { name: "UG", code: "+256", flag: "🇺🇬" },
    { name: "RW", code: "+250", flag: "🇷🇼" },
    { name: "BI", code: "+257", flag: "🇧🇮" },
  ];
  const [selectedCountry, setSelectedCountry] = useState(countryOptions[0]);

  const [ingredients, setIngredients] = useState([]);
  const [microIngredients, setMicroIngredients] = useState([]);
  const [chemIngredients, setChemIngredients] = useState([]);
  const [samplesToAdd, setSamplesToAdd] = useState([
    {
      sample_name: "",
      sample_details: "",
      selected_micro_ingredients: [],
      selected_chem_ingredients: [],
    },
  ]);

  const MARKING_FEE = 10000.0;

  const MOCK_UNCLAIMED = [
    {
      id: 1,
      customer: {
        first_name: "John",
        middle_name: "M.",
        last_name: "Doe",
        phone_country_code: "+255",
        phone_number: "712345678",
        email: "john@example.com",
        country: "Tanzania",
        region: "Zanzibar",
        street: "Stone Town",
        is_organization: false,
        national_id: "123456789",
        organization_name: "",
        organization_id: "",
      },
      sample_details: "Water Quality Test",
      payment: { amount_due: 50000, status: "pending" },
    },
    {
      id: 2,
      customer: {
        first_name: "Aisha",
        middle_name: "",
        last_name: "Hassan",
        phone_country_code: "+255",
        phone_number: "765432198",
        email: "aisha@example.com",
        country: "Tanzania",
        region: "Pemba",
        street: "Chake Chake",
        is_organization: true,
        national_id: "",
        organization_name: "Blue Ocean Org",
        organization_id: "ORG12345",
      },
      sample_details: "Fish Species Analysis",
      payment: { amount_due: 75000, status: "approved" },
    },
  ];

  const [unclaimedSamples, setUnclaimedSamples] = useState(MOCK_UNCLAIMED);

  const menuItems = [
    { name: "Dashboard", path: "/registrar-dashboard", icon: <FaTachometerAlt /> },
    { name: "Register Sample", path: "/registrar-dashboard/register-sample", icon: <FaUserPlus /> },
    { name: "Claim Submissions", path: "/registrar-dashboard/claim-submissions", icon: <FaClipboardCheck /> },
    { name: "Sample History", path: "/registrar-dashboard/sample-history", icon: <FaHistory /> },
  ];

  useEffect(() => {
    const { pathname } = location;
    if (pathname.includes("verify-payment")) setActiveTab("verify-payment");
    else if (pathname.includes("sample-history")) setActiveTab("sample-history");
    else if (pathname.includes("register-sample")) setActiveTab("register-sample");
    else if (pathname.includes("claim-submissions")) setActiveTab("claim-submissions");
    else setActiveTab("dashboard");
  }, [location.pathname]);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      try {
        const ingRes = await fetch("http://192.168.1.180:8000/api/ingredients/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (ingRes.ok) {
          const ingData = await ingRes.json();
          const all = Array.isArray(ingData) ? ingData : [];
          setIngredients(all);
          setMicroIngredients(all.filter((ing) => ing.test_type === "Microbiology"));
          setChemIngredients(all.filter((ing) => ing.test_type === "Chemistry"));
        }

        const claimRes = await fetch("http://192.168.1.180:8000/api/unclaimed-samples/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (claimRes.ok) {
          const claimData = await claimRes.json();
          if (Array.isArray(claimData) && claimData.length > 0) {
            const normalized = claimData.map((c) => ({
              ...c,
              payment: {
                ...(c.payment || {}),
                status: (c.payment?.status || "pending").toString().toLowerCase(),
              },
            }));
            setUnclaimedSamples(normalized);
          }
        }
      } catch (err) {
        setError("Failed to load data.");
      }
    };
    fetchData();
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
      {
        sample_name: "",
        sample_details: "",
        selected_micro_ingredients: [],
        selected_chem_ingredients: [],
      },
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
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        phone_number: phoneNumber,
        phone_country_code: selectedCountry.code,
        email: email,
        country: country,
        region: region,
        street: street,
        is_organization: isOrganization,
        national_id: nationalId,
        organization_name: organizationName,
        organization_id: organizationId,
        date_received: dateReceived,
        date_submitted_to_hod: dateSubmittedToHOD,
      },
      samples: samplesToAdd.map((s) => ({
        sample_name: s.sample_name,
        sample_details: s.sample_details,
        selected_ingredients: [...s.selected_micro_ingredients, ...s.selected_chem_ingredients],
      })),
    };
    try {
      const response = await fetch(
        "http://192.168.1.180:8000/api/registrar/register-sample/",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Submission failed.");
        setLoading(false);
        return;
      }

      alert(data.message || "Samples submitted successfully! Registrar has registered the customer & sample.");

      setFirstName("");
      setMiddleName("");
      setLastName("");
      setPhoneNumber("");
      setEmail("");
      setCountry("");
      setRegion("");
      setStreet("");
      setIsOrganization(false);
      setNationalId("");
      setOrganizationName("");
      setOrganizationId("");
      setSelectedCountry(countryOptions[0]);
      setSamplesToAdd([
        {
          sample_name: "",
          sample_details: "",
          selected_micro_ingredients: [],
          selected_chem_ingredients: [],
        },
      ]);
    } catch (err) {
      setError("Failed to submit. Try again.");
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

  const regionOptions = {
    Tanzania: ["Zanzibar", "Dar es Salaam", "Arusha", "Dodoma", "Mwanza", "Pemba"],
    Kenya: ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret"],
    Uganda: ["Kampala", "Entebbe", "Gulu", "Mbarara"],
    Rwanda: ["Kigali", "Butare", "Gisenyi", "Ruhengeri"],
    Burundi: ["Bujumbura", "Gitega", "Ngozi", "Rumonge"],
  };

  return (
    <Layout menuItems={menuItems}>
      <div className="dashboard-content">
        {error && <div className="error-message">{error}</div>}

        {(activeTab === "register-sample" || activeTab === "dashboard") && (
          <section className="content-card register-sample-page">
            <h2 className="section-title"><FaUserPlus /> Register Customer & Sample</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-section">
                <h3>Customer Information</h3>
                <div className="form-grid">
                  <div className="form-group"><label>First Name</label><input value={firstName} onChange={(e) => setFirstName(e.target.value)} required /></div>
                  <div className="form-group"><label>Middle Name</label><input value={middleName} onChange={(e) => setMiddleName(e.target.value)} /></div>
                  <div className="form-group"><label>Last Name</label><input value={lastName} onChange={(e) => setLastName(e.target.value)} required /></div>
                  <div className="form-group full-width-field">
                    <label>Phone Number *</label>
                    <CountryPhoneInput
                      countryOptions={countryOptions}
                      selectedCountry={selectedCountry}
                      setSelectedCountry={setSelectedCountry}
                      phoneNumber={phoneNumber}
                      setPhoneNumber={setPhoneNumber}
                    />
                  </div>
                  <div className="form-group full-width-field">
                    <label>Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Country</label>
                    <select
                      value={country}
                      onChange={(e) => {
                        setCountry(e.target.value);
                        setRegion("");
                      }}
                      required
                    >
                      <option value="">-- Select Country --</option>
                      {Object.keys(regionOptions).map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Region</label>
                    <select
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      required
                      disabled={!country}
                    >
                      <option value="">-- Select Region --</option>
                      {country && regionOptions[country].map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group"><label>Street</label><input value={street} onChange={(e) => setStreet(e.target.value)} required /></div>
                  <div className="form-group checkbox-group"><label>Is Organization?</label><input type="checkbox" checked={isOrganization} onChange={(e) => setIsOrganization(e.target.checked)} /></div>
                  {!isOrganization ? (
                    <div className="form-group"><label>National ID</label><input value={nationalId} onChange={(e) => setNationalId(e.target.value)} required /></div>
                  ) : (
                    <>
                      <div className="form-group"><label>Organization Name</label><input value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} required /></div>
                      <div className="form-group"><label>Organization ID</label><input value={organizationId} onChange={(e) => setOrganizationId(e.target.value)} required /></div>
                    </>
                  )}
                  <div className="form-group">
                    <label>Date Received from Customer</label>
                    <input
                      type="date"
                      value={dateReceived}
                      onChange={(e) => setDateReceived(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Date Submitted to HOD</label>
                    <input
                      type="date"
                      value={dateSubmittedToHOD}
                      onChange={(e) => setDateSubmittedToHOD(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Samples & Tests</h3>
                {samplesToAdd.map((sample, index) => (
                  <div key={index} className="sample-box">
                    <h4>Sample {index + 1}</h4>
                    <div className="sample-inputs-group">
                      <div className="form-group"><label>Sample Name</label><input value={sample.sample_name} onChange={(e) => handleSampleChange(index, "sample_name", e.target.value)} required /></div>
                      <div className="form-group"><label>Sample Details</label><textarea value={sample.sample_details} onChange={(e) => handleSampleChange(index, "sample_details", e.target.value)} required /></div>
                    </div>
                    <label>Microbiology Tests</label>
                    <Select isMulti options={microOptions} value={microOptions.filter((opt) => sample.selected_micro_ingredients.includes(opt.value))} onChange={(sel) => handleSelectChange(index, sel, "microbiology")} />
                    <label>Chemistry Tests</label>
                    <Select isMulti options={chemOptions} value={chemOptions.filter((opt) => sample.selected_chem_ingredients.includes(opt.value))} onChange={(sel) => handleSelectChange(index, sel, "chemistry")} />
                  </div>
                ))}
                <button type="button" onClick={addNewSample} className="add-sample-btn"><FaPlusCircle /> Add Another Sample</button>
              </div>

              <div className="total-price-display"><strong>Total Price:</strong> TZS {calculateTotalPrice()}</div>
              <button type="submit" className="submit-btn" disabled={loading}>{loading ? "Submitting..." : "Submit"}</button>
            </form>
          </section>
        )}

        {activeTab === "claim-submissions" && (
          <>
            <div className="stats-cards">
              <div className="stat-card approved">
                <h3>Approved</h3>
                <p>{unclaimedSamples.filter(s => (s.payment?.status || "").toLowerCase() === "approved").length}</p>
              </div>
              <div className="stat-card pending">
                <h3>Pending</h3>
                <p>{unclaimedSamples.filter(s => (s.payment?.status || "").toLowerCase() === "pending").length}</p>
              </div>
              <div className="stat-card total">
                <h3>Total</h3>
                <p>{unclaimedSamples.length}</p>
              </div>
            </div>
            <ClaimSubmission unclaimedSamples={unclaimedSamples} setUnclaimedSamples={setUnclaimedSamples} />
          </>
        )}

        {activeTab === "verify-payment" && (
          <section className="content-card">
            <h2 className="section-title"><FaFlask /> Verify Payment</h2>
            <p>Registrar can check payment manually here if finance provides control/reference number.</p>
          </section>
        )}

        {activeTab === "sample-history" && (
          <section className="content-card">
            <h2 className="section-title"><FaHistory /> Sample History</h2>
            <p>Coming soon…</p>
          </section>
        )}
      </div>
    </Layout>
  );
}