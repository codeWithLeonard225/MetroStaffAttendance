import React from "react";

const StaffPageExtra = ({ staffId }) => {

   // Timer to navigate after 15 seconds
  // useEffect(() => {
  // const timeout = setTimeout(() => {
  // navigate('/'); // Redirect to login page after 15 seconds
  // }, 15000);



  // return () => clearTimeout(timeout); // Clear timeout if any event occurs
  // }, [navigate]);
  
  return (
    <div className="flex h-screen">
      {/* Left Section - 30% */}
      <div className="w-1/3 bg-gray-100 p-6 border-r">
        <h2 className="text-xl font-semibold mb-4">Staff Panel</h2>
        <p className="mb-2">👋 Welcome, <strong>{staffId}</strong></p>
        <ul className="space-y-2">
          <li className="cursor-pointer hover:text-blue-600">📄 View Reports</li>
          <li className="cursor-pointer hover:text-blue-600">🗓️ Schedule</li>
          <li className="cursor-pointer hover:text-blue-600">📧 Messages</li>
          <li className="cursor-pointer hover:text-blue-600">⚙️ Settings</li>
        </ul>
      </div>

      {/* Right Section - 70% */}
      <div className="w-2/3 p-6">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p className="text-gray-700">
          This is your staff dashboard. Here you can access your reports, schedule, and more.
        </p>

        {/* You can replace this with any dynamic content later */}
        <div className="mt-6">
          <div className="bg-white p-4 shadow rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Quick Info</h2>
            <p>Some statistics or notices for staff...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffPageExtra;
