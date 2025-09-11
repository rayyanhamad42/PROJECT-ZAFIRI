import React, { useState } from "react";
import { FaClipboardCheck } from "react-icons/fa";
import "./ClaimSubmission.css";
// import "./RegistrarDashboard.css";


export default function ClaimSubmission() {
  const token = localStorage.getItem("token");

  // Mock data for now (you’ll replace with backend later)
  const [unclaimedSamples, setUnclaimedSamples] = useState([
    {
      id: 1,
      first_name: "Ali",
      middle_name: "H.",
      last_name: "Juma",
      phone_country_code: "+255",
      phone_number: "712345678",
      email: "ali@example.com",
      country: "Tanzania",
      region: "Zanzibar",
      street: "Stone Town",
      is_organization: false,
      national_id: "12345678",
      organization_name: "",
      organization_id: "",
      sample_details: "Water quality test",
      payment: { amount_due: 50000, status: "Pending" },
    },
  ]);

  const [modalSample, setModalSample] = useState(null);

  return (
    
    <section className="content-card">
      <h2 className="section-title">
        <FaClipboardCheck /> Claim Submissions
      </h2>

      <table className="samples-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Customer</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Sample Details</th>
            <th>Payment Due</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {unclaimedSamples.length > 0 ? (
            unclaimedSamples.map((sample) => (
              <tr key={sample.id}>
                <td>{sample.id}</td>
                <td>
                  {sample.first_name} {sample.middle_name} {sample.last_name}
                </td>
                <td>{sample.email}</td>
                <td>
                  {sample.phone_country_code} {sample.phone_number}
                </td>
                <td>{sample.sample_details}</td>
                <td>{sample.payment?.amount_due} TZS</td>
                <td>
                  <span
                    className={`status-badge ${
                      sample.payment?.status === "Pending"
                        ? "status-pending"
                        : "status-approved"
                    }`}
                  >
                    {sample.payment?.status}
                  </span>
                </td>
                <td>
                  {sample.payment?.status === "Pending" && (
                    <button
                      className="claim-btn"
                      onClick={() => setModalSample(sample)}
                    >
                      Claim
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" style={{ textAlign: "center", padding: "10px" }}>
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
              Are you sure you want to claim sample{" "}
              <strong>{modalSample.sample_details}</strong> for customer{" "}
              <strong>
                {modalSample.first_name} {modalSample.last_name}
              </strong>
              ?
            </p>
            <p>
              <strong>Payment Due:</strong>{" "}
              {modalSample.payment?.amount_due} TZS
            </p>
            <div className="modal-actions">
              <button
                className="submit-btn"
                onClick={() => {
                  // ✅ Update status locally to Approved
                  setUnclaimedSamples((prev) =>
                    prev.map((s) =>
                      s.id === modalSample.id
                        ? {
                            ...s,
                            payment: { ...s.payment, status: "Approved" },
                          }
                        : s
                    )
                  );
                  setModalSample(null);
                }}
              >
                Confirm
              </button>
              <button
                className="add-sample-btn"
                onClick={() => setModalSample(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
