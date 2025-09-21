// src/pages/ClaimSubmission.jsx
import React, { useState } from "react";
import { FaClipboardCheck } from "react-icons/fa";
import "./ClaimSubmission.css";

export default function ClaimSubmission({ unclaimedSamples, setUnclaimedSamples }) {
  const [modalSample, setModalSample] = useState(null);
  const token = localStorage.getItem("access_token") || localStorage.getItem("token");

const confirmClaim = async (sample) => {
  setModalSample(null);

  try {
    if (!token) return;

    const registrarUser = JSON.parse(localStorage.getItem("user"));

    const resp = await fetch(
      `http://192.168.1.180:8000/api/claim-sample/${sample.id}/`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ claimed_by: registrarUser?.username }), // ✅ send registrar
      }
    );

    if (resp.ok) {
      alert("Sample successfully claimed & sent to HOD");
      fetchUnclaimedSamples(); // refresh list
    } else {
      console.warn("Backend claim returned error:", resp.status);
      alert("Failed to claim sample.");
    }
  } catch (err) {
    console.warn("Claim API call failed:", err);
    alert("Error while claiming sample.");
  }
};


const fetchUnclaimedSamples = async () => {
  try {
    const resp = await fetch("http://192.168.1.180:8000/api/unclaimed-samples/", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!resp.ok) {
      console.warn("Failed to fetch unclaimed samples:", resp.status);
      return;
    }
    const data = await resp.json();
    setUnclaimedSamples(data);
  } catch (err) {
    console.warn("Error fetching unclaimed samples:", err);
  }
};


  // ✅ fetch when page first loads
  React.useEffect(() => {
    fetchUnclaimedSamples();
  }, []);
  return (
    <section className="content-card">
      <h2 className="section-title">
        <FaClipboardCheck /> Claim Submissions
      </h2>

     <table className="samples-table">
  <thead>
    <tr>
      <th>ID</th>
      <th>First Name</th>
      <th>Middle Name</th>
      <th>Last Name</th>
      <th>Phone</th>
      <th>Email</th>
      <th>Country</th>
      <th>Region</th>
      <th>Street</th>
      <th>Is Organization</th>
      <th>National ID</th>
      {unclaimedSamples.some((s) => s.customer_details?.is_organization) && (
        <>
          <th>Organization Name</th>
          <th>Organization ID</th>
        </>
      )}
      <th>Sample Name</th>
      <th>Sample Details</th>
      <th>Delivery Date</th>
      <th>Submission Date</th>
      <th>Submission Time</th>
      <th>Payment Due</th>
      <th>Status</th>
      <th>Action</th>
    </tr>
  </thead>
  <tbody>
    {unclaimedSamples && unclaimedSamples.length > 0 ? (
      unclaimedSamples.map((sample) => {
        const c = sample.customer_details || {};
        const statusLower = (sample.payment?.status || "pending").toLowerCase();

        return (
          <tr key={sample.id}>
            <td>{sample.id}</td>
            <td>{c.first_name}</td>
            <td>{c.middle_name}</td>
            <td>{c.last_name}</td>
            <td>{`${c.phone_country_code || ""} ${c.phone_number || ""}`}</td>
            <td>{c.email}</td>
            <td>{c.country}</td>
            <td>{c.region}</td>
            <td>{c.street}</td>
            <td>{c.is_organization ? "Yes" : "No"}</td>
            <td>{c.national_id}</td>

            {c.is_organization && (
              <>
                <td>{c.organization_name}</td>
                <td>{c.organization_id}</td>
                <td>{c.submission_date ||  "N/A"}
                    <td>{c.submission_time ||  "N/A"}</td>
                </td>
              </>
            )}

            <td>{sample.sample_name || "N/A"}</td>
            <td>{sample.sample_details || "N/A"}</td>
            <td>{sample.delivery_date || "N/A"}</td>
            <td>{c.submission_date || "N/A"}</td>
            <td>{c.submission_time || "N/A"}</td>
            <td>{sample.payment?.amount_due ?? "N/A"} TZS</td>

            <td>
              <span className={`status-badge ${statusLower}`}>{sample.payment?.status || "Pending"}</span>
            </td>

            <td>
              {statusLower === "pending" ? (
                <button className="claim-btn" onClick={() => setModalSample(sample)}>
                  Claim
                </button>
              ) : (
                <span style={{ color: "#2d7a2d", fontWeight: 700 }}>Approved</span>
              )}
            </td>
          </tr>
        );
      })
    ) : (
      <tr>
        <td colSpan="21" style={{ textAlign: "center", padding: "10px" }}>
          No unclaimed samples at the moment.
        </td>
      </tr>
    )}
  </tbody>
</table>


      {/* Modal */}
     {modalSample && (
  <div className="modal-overlay" onClick={() => setModalSample(null)}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <h3>Claim Sample</h3>
      <p>
        Are you sure you want to claim this sample for customer{" "}
        <strong>
          {modalSample.customer_details?.first_name}{" "}
          {modalSample.customer_details?.last_name}
        </strong>
        ?
      </p>

      <p><strong>Sample Name:</strong> {modalSample.sample_name || "N/A"}</p>
      <p><strong>Sample Details:</strong> {modalSample.sample_details || "N/A"}</p>
      <p><strong>Delivery Date:</strong> {modalSample.delivery_date || "N/A"}</p>
      <p><strong>Submission Date:</strong> {modalSample.submission_date || "N/A"}</p>
      <p><strong>Submission Time:</strong> {modalSample.submission_time || "N/A"}</p>
      <p><strong>Payment Due:</strong> {modalSample.payment?.amount_due ?? "N/A"} TZS</p>

      <div className="modal-actions">
        <button className="submit-btn" onClick={() => confirmClaim(modalSample)}>
          Confirm
        </button>
        <button className="add-sample-btn" onClick={() => setModalSample(null)}>
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

    </section>
  );
}
