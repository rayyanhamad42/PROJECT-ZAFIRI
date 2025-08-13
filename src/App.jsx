
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import LabTechnicianDashboard from './pages/LabTechnicianDashboard';
import AdminDashboard from './pages/AdminDashboard';
import RegistrarDashboard from './pages/RegistrarDashboard'; 
function App() {
  return (
  
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/technician-dashboard" element={<LabTechnicianDashboard />} /> 
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/Registar-dashboard" element={<RegistrarDashboard />} />
        </Routes>
      </div>
  );
}

export default App;