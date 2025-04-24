
import React from "react";
import { Link, useNavigate } from "react-router-dom";


export default function Reports() {

  const navigate = useNavigate();
  return (
    <div className="flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-1/5 bg-gray-800 text-white min-h-[200px] md:min-h-screen p-4">
        <h2 className="text-xl font-semibold mb-8">Admin Dashboard</h2>
        <button
          onClick={() => navigate("/")}
          className="mb-4 mt-2 self-start bg-blue-100 text-black px-4 py-2 rounded hover:bg-blue-600"
        >
          🏠 Home
        </button>
        <div className="space-y-4">
          <Link to="/admin" className="block text-center px-4 py-2 bg-blue-600 hover:bg-white hover:text-black rounded text-white">Staff Details</Link>
          <Link to="/timeMgn" className="block text-center px-4 py-2 bg-blue-600 hover:bg-white hover:text-black rounded text-white">Time Management</Link>
          <Link to="/reports" className="block text-center px-4 py-2 bg-green-600 hover:bg-white hover:text-black rounded text-white">Reports</Link>
          <Link to="/more" className="block text-center px-4 py-2 bg-blue-600 hover:bg-white hover:text-black rounded text-white">More</Link>
        </div>

      </div>

      {/* Page content */}
      <div className="w-full md:w-4/5 p-6 bg-white rounded shadow">

      </div>
    </div>
  );
}
