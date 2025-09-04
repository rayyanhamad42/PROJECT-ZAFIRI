import React, { useState } from "react";
import Layout from "../components/Layout"; 
import { FaCheckCircle, FaPrint } from "react-icons/fa";
import logo from '../assets/zafiri.png';
import "./DirectorGeneralDashboard.css";

export default function DirectorGeneralDashboard() {
  const [customers, setCustomers] = useState([
    { id: 1, name: "Ali Juma", service: "Marine License", status: "Pending" },
    { id: 2, name: "Fatma Mohamed", service: "Boat Registration", status: "Pending" },
  ]);

  const generateCertificateContent = (customer) => {
    return `
      <div class="certificate-container">
        <header class="certificate-header">
          <img src="${"../assets/zafiri.png"}" alt="Zafiri Logo" class="certificate-logo" />
          <h1>Certificate of Approval</h1>
          <p>This certifies that the following request has been officially approved.</p>
        </header>
        <section class="certificate-details">
          <div class="detail-item">
            <span class="detail-label">Request ID:</span>
            <span class="detail-value">${customer.id}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Customer Name:</span>
            <span class="detail-value">${customer.name}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Service Type:</span>
            <span class="detail-value">${customer.service}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Approval Status:</span>
            <span class="detail-value">${customer.status}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Date of Approval:</span>
            <span class="detail-value">${new Date().toLocaleDateString()}</span>
          </div>
        </section>
        <footer class="certificate-footer">
          <p>Approved by the Director General of Marine Laboratory.</p>
        </footer>
      </div>
    `;
  };

  const handleApprove = (id) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: "Approved" } : c
      )
    );
    alert("Customer details approved!");
  };

  const handlePrint = (customer) => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert("Please allow pop-ups to print the certificate.");
      return;
    }

    const certificateStyles = `
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        margin: 0;
        padding: 0;
        background-color: white;
      }
      .certificate-container {
        width: 100%;
        max-width: 700px;
        margin: 0 auto;
        padding: 20px;
        border: 1px solid #1CA3DE;
        background-color: #ffffff;
        box-shadow: none;
        text-align: center;
        box-sizing: border-box;
      }
      .certificate-header {
        border-bottom: 1px solid #1CA3DE;
        padding-bottom: 15px;
        margin-bottom: 20px;
      }
      .certificate-logo {
        width: 80px;
        margin-bottom: 10px;
      }
      .certificate-header h1 {
        color: #1CA3DE;
        font-size: 1.8em;
        margin: 0;
      }
      .certificate-header p {
        color: #555;
        margin-top: 5px;
        font-size: 0.9em;
      }
      .certificate-details {
        text-align: left;
        font-size: 0.9em;
        line-height: 1.5;
        margin-bottom: 25px;
      }
      .detail-item {
        display: flex;
        justify-content: space-between;
        border-bottom: 1px dashed #ddd;
        padding: 6px 0;
      }
      .detail-label {
        font-weight: bold;
        color: #333;
      }
      .detail-value {
        color: #1CA3DE;
      }
      .certificate-footer {
        border-top: 1px solid #1CA3DE;
        padding-top: 15px;
        color: #777;
        font-size: 0.8em;
      }
      @media print {
        .certificate-container {
          border: none;
          padding: 0;
        }
      }
    `;

    printWindow.document.write('<html><head><title>Certificate</title>');
    printWindow.document.write(`<style>${certificateStyles}</style>`);
    printWindow.document.write('</head><body>');
    printWindow.document.write(generateCertificateContent(customer));
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <Layout>
      <section className="content-card">
        <table className="customers-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Service</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.name}</td>
                <td>{c.service}</td>
                <td>
                  <span className={`status ${c.status.toLowerCase()}`}>
                    {c.status}
                  </span>
                </td>
                <td>
                  {c.status === "Pending" && (
                    <button
                      className="approve-btn"
                      onClick={() => handleApprove(c.id)}
                    >
                      <FaCheckCircle className="btn-icon" /> Approve
                    </button>
                  )}
                  {c.status === "Approved" && (
                    <button
                      className="print-btn"
                      onClick={() => handlePrint(c)}
                    >
                      <FaPrint className="btn-icon" /> Print Certificate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </Layout>
  );
}