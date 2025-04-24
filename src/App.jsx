import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StaffPage from "./Component/Pages/StaffPage";
import AdminPage from "./Component/Pages/AdminPage";
import TimeMgn from "./Component/Pages/TimeMgn";
import LoginPage from "./Component/Login/Login";
import Reports from "./Component/Pages/Reports";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/staff" element={<StaffPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/timeMgn" element={<TimeMgn />} />
        <Route path="/reports" element={<Reports />} />
      
      </Routes>
    </Router>
  );
}
