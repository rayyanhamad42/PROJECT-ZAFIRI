// src/pages/ClaimSubmission.jsx
import React, { useState } from "react";
import { FaClipboardCheck } from "react-icons/fa";
import "./ClaimSubmission.css"; // keep the styles you already have

export default function ClaimSubmission({ unclaimedSamples, setUnclaimedSamples }) {
  const [modalSample, setModalSample] = useState(null);
  const token = localStorage.getItem("access_token") || localStorage.getItem("token");

  // Claim confirm handler — updates parent state and tries the API (if available)
  const confirmClaim = async (sample) => {
    // Optimistic update: set status to approved locally
    const registrarUser = JSON.parse(localStorage.getItem("user")); 
// assuming you save registrar user info in localStorage after login


setUnclaimedSamples((prev) =>
  prev.map((s) =>
    s.id === sample.id
      ? {
          ...s,
          payment: { ...(s.payment || {}), status: "approved" },
          claimed_by: registrarUser,   // ✅ include registrar info
        }
      : s
  )
);

    setModalSample(null);

    // Try to notify backend (optional) — doesn't remove local update if backend fails
    try {
      if (!token) return;
      const resp = await fetch(`http://192.168.1.180:8000/api/claim-sample/${sample.id}/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ claimed_by: registrarUser?.username }), 
      });
      // backend may return success or not — we already updated UI optimistically
      if (!resp.ok) {
        // If you want to roll back on failure, uncomment rollback logic:
        // setUnclaimedSamples(prev => prev.map(s => s.id === sample.id ? { ...s, payment: { ...(s.payment || {}), status: "pending" } } : s));
        console.warn("Backend claim returned error:", resp.status);
      }
    } catch (err) {
      console.warn("Claim API call failed:", err);
      // keep optimistic UI even if API call fails
    }
  };

  return (
    <section className="content-card">
      <h2 className="section-title"><FaClipboardCheck /> Claim Submissions</h2>

      <table className="samples-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>First</th>
            <th>Middle</th>
            <th>Last</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Region</th>
            <th>Sample Details</th>
            <th>Payment Due</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {unclaimedSamples && unclaimedSamples.length > 0 ? (
            unclaimedSamples.map((sample) => {
              const c = sample.customer || {};
              const statusRaw = (sample.payment?.status || "pending").toString();
              const statusLower = statusRaw.toLowerCase();
              // attach both forms of class names to match different CSS variants (.status-badge.pending and .status-pending)
              const statusClassNames = `status-badge ${statusLower} status-${statusLower}`;
              return (
                <tr key={sample.id}>
                  <td>{sample.id}</td>
                  <td>{c.first_name}</td>
                  <td>{c.middle_name}</td>
                  <td>{c.last_name}</td>
                  <td>{c.email}</td>
                  <td>{c.phone_country_code} {c.phone_number}</td>
                  <td>{c.region}</td>
                  <td>{sample.sample_details}</td>
                  <td>{sample.payment?.amount_due ?? "N/A"} TZS</td>
                  <td><span className={statusClassNames}>{statusRaw}</span></td>
                  <td>
                    {statusLower === "pending" ? (
                      <button className="claim-btn" onClick={() => setModalSample(sample)}>Claim</button>
                    ) : (
                      <span style={{ color: "#2d7a2d", fontWeight: 700 }}>Approved</span>
                    )}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="11" style={{ textAlign: "center", padding: "10px" }}>
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
              Are you sure you want to claim sample <strong>{modalSample.sample_details}</strong> for customer <strong>{modalSample.customer?.first_name} {modalSample.customer?.last_name}</strong>?
            </p>
            <p><strong>Payment Due:</strong> {modalSample.payment?.amount_due ?? "N/A"} TZS</p>
            <div className="modal-actions">
              <button className="submit-btn" onClick={() => confirmClaim(modalSample)}>Confirm</button>
              <button className="add-sample-btn" onClick={() => setModalSample(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
