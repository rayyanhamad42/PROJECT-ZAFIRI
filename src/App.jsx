
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import LabTechnicianDashboard from './pages/LabTechnicianDashboard';

function App() {
  return (
  
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/technician-dashboard" element={<LabTechnicianDashboard />} />   
        </Routes>
      </div>
  );
}

export default App;