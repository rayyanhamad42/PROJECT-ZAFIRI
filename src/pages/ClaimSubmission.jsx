import React, { useState } from "react";
import { FaClipboardCheck } from "react-icons/fa";
import "./ClaimSubmission.css";

export default function ClaimSubmission() {
  const [modalSample, setModalSample] = useState(null);

  // Mock Data (Customer Details)
  const [unclaimedSamples, setUnclaimedSamples] = useState([
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
        national_id: "1234567890",
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
  ]);

  return (
    <section className="claim-submission-container">
      <h2 className="claim-title">
        <FaClipboardCheck /> Claim Submissions
      </h2>

      <table className="claim-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Customer</th>
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
          {unclaimedSamples.length > 0 ? (
            unclaimedSamples.map((sample) => {
              const c = sample.customer;
              const customerName = c.is_organization
                ? c.organization_name
                : `${c.first_name} ${c.middle_name} ${c.last_name}`;
              return (
                <tr key={sample.id}>
                  <td>{sample.id}</td>
                  <td>{customerName}</td>
                  <td>{c.email}</td>
                  <td>{`${c.phone_country_code} ${c.phone_number}`}</td>
                  <td>{c.region}</td>
                  <td>{sample.sample_details}</td>
                  <td>{sample.payment?.amount_due} TZS</td>
                  <td>
                    <span
                      className={`status-badge ${sample.payment?.status}`}
                    >
                      {sample.payment?.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="view-btn"
                      onClick={() => setModalSample(sample)}
                    >
                      Claim
                    </button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="9" style={{ textAlign: "center", padding: "10px" }}>
                No unclaimed samples at the moment.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal */}
      {modalSample && (
        <div className="modal-overlay" onClick={() => setModalSample(null)}>
          <div
            className="modal-content slide-down"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Claim Sample</h3>
            <p>
              Are you sure you want to claim{" "}
              <strong>{modalSample.sample_details}</strong> for{" "}
              <strong>
                {modalSample.customer.is_organization
                  ? modalSample.customer.organization_name
                  : `${modalSample.customer.first_name} ${modalSample.customer.middle_name} ${modalSample.customer.last_name}`}
              </strong>
              ?
            </p>
            <p>
              <strong>Payment Due:</strong>{" "}
              {modalSample.payment?.amount_due} TZS
            </p>
            <div className="modal-actions">
              <button
                className="approve-btn"
                onClick={() => {
                  alert("Sample claimed successfully!");
                  setUnclaimedSamples(
                    unclaimedSamples.filter((s) => s.id !== modalSample.id)
                  );
                  setModalSample(null);
                }}
              >
                Confirm
              </button>
              <button
                className="close-btn"
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
