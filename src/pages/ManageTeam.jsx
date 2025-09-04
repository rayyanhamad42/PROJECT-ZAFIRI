import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { FaUsers, FaArrowLeft } from "react-icons/fa";
import "./ManageTeam.css";

const ManageTeam = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("access_token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        if (!token) throw new Error("No authentication token found. Please log in.");

        const response = await fetch("http://192.168.1.180:8000/api/users/", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error(`Failed to fetch team data. Status: ${response.status}`);

        const data = await response.json();
        setTeamMembers(data.users || []);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, [token]);

  const handleBack = () => {
    navigate("/hod-dashboard");
  };

  return (
    <Layout menuItems={[
      { name: 'Dashboard', path: '/hod-dashboard', icon: <FaUsers /> },
      { name: 'Manage Team', path: '/manage-team', icon: <FaUsers /> },
    ]}>
      <div className="manage-team-content">
        <button className="back-btn" onClick={handleBack}>
          <FaArrowLeft /> Back To dashbaord 
        </button>

        <h2><FaUsers /> Manage Team</h2>

        {loading && <p>Loading team members...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && (
          <div className="table-wrapper">
            <table className="team-table">
              <thead>
                <tr>
                  <th>Id</th>
                  <th>Full Name</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.length > 0 ? (
                  teamMembers.map((member, index) => (
                    <tr key={member.id}>
                      <td>{index + 1}</td>
                      <td>{member.full_name || "N/A"}</td>
                      <td>{member.username}</td>
                      <td>{member.email}</td>
                      <td>{member.role}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">No team members found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ManageTeam;
