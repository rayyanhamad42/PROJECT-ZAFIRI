import React from 'react';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from './pages/Login';

import LabTechnicianDashboard from './pages/LabTechnicianDashboard';

import AdminDashboard from './pages/AdminDashboard';

import ManageUsers from './pages/ManageUsers';

import ErrorBoundary from './pages/ErrorBoundary';

import RegistrarDashboard from './pages/RegistrarDashboard';

import AddIngredients from './pages/AddIngredients';


import TestSubmission from './pages/TestSubmission';

import DepartmentData from './pages/DepartmentData';

import HeadOfDepartmentDashboard from './pages/HeadOfDepartmentDashboard';

import DirectorGeneralDashboard from './pages/DirectorGeneralDashboard';
import ManageTeam from './pages/ManageTeam';





function App() {

return (


<div className="App">

<Routes>

<Route path="/" element={<Login />} />

<Route path="/technician-dashboard" element={<LabTechnicianDashboard />} />

<Route path="/admin-dashboard" element={<AdminDashboard />} />

<Route path="/Registrar-dashboard" element={<RegistrarDashboard />} />

<Route path="/manage-users" element={<ManageUsers />} />

<Route path="/hod-dashboard" element={<HeadOfDepartmentDashboard />} />

<Route path="/director-dashboard" element={<DirectorGeneralDashboard />} />

<Route path="/submit-result/:testId" element={<TestSubmission />} />

<Route path="/manage-team" element={<ManageTeam />} />

<Route path="/add-ingredients" element={<AddIngredients />} />
<Route path="/department-data" element={<DepartmentData />} />
 



{/* Catch-all route for undefined paths */}

<Route path="*" element={<ErrorBoundary><div>404 Not Found</div></ErrorBoundary>} />




</Routes>

</div>

);

}



export default App;