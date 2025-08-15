
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import LabTechnicianDashboard from './pages/LabTechnicianDashboard';
import AdminDashboard from './pages/AdminDashboard';
import RegistrarDashboard from './pages/RegistrarDashboard'; 
import HeadOfDepartmentDashboard from './pages/HeadOfDepartmentDashboard';
function App() {
  return (
  
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/technician-dashboard" element={<LabTechnicianDashboard />} /> 
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/Registrar-dashboard" element={<RegistrarDashboard />} />
          <Route path="/hod-dashboard" element={<HeadOfDepartmentDashboard />} />
        </Routes>
      </div>
  );
}

export default App;