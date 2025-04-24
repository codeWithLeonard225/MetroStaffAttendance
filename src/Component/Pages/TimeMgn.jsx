import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../FirebaseConfig/Firebase"; // Update the path based on your project structure
import html2pdf from 'html2pdf.js'; // Import html2pdf.js

export default function TimeMgn() {
  const navigate = useNavigate();
  const [timeSheetData, setTimeSheetData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [searchName, setSearchName] = useState("");

  // Fetch data from Firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "TimeSheet"));
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTimeSheetData(data);
        setFilteredData(data);  // Initially set filtered data to all data
      } catch (error) {
        console.error("Error fetching time sheet data: ", error);
      }
    };

    fetchData();
  }, []);

  // Filter data based on selected date
  const handleDateChange = (event) => {
    const date = event.target.value;
    setSelectedDate(date);
    filterData(date, selectedMonth, searchName);
  };

  // Filter data based on month selection
  const handleMonthChange = (event) => {
    const month = event.target.value;
    setSelectedMonth(month);
    filterData(selectedDate, month, searchName);
  };

  // Filter data based on name search
  const handleSearchNameChange = (event) => {
    const name = event.target.value;
    setSearchName(name);
    filterData(selectedDate, selectedMonth, name);
  };

  // General filter function for date, month, and name
  const filterData = (date, month, name) => {
    let filtered = timeSheetData;

    // Filter by date if a date is selected
    if (date) {
      filtered = filtered.filter((entry) => {
        const entryDate = new Date(entry.date.seconds * 1000);
        return entryDate.toLocaleDateString() === new Date(date).toLocaleDateString();
      });
    }

    // Filter by month if a month is selected
    if (month) {
      filtered = filtered.filter((entry) => {
        const entryDate = new Date(entry.date.seconds * 1000);
        return entryDate.getMonth() === parseInt(month) - 1; // Month is 0-indexed
      });
    }

    // Filter by name if a name is provided
    if (name) {
      filtered = filtered.filter((entry) => {
        return entry.fullName.toLowerCase().includes(name.toLowerCase());
      });
    }

    setFilteredData(filtered);
  };

  // Function to print the table as PDF
  const handlePrint = () => {
    const element = document.getElementById("print-table");
    const opt = {
      margin: 1,
      filename: 'timesheet.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 4 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' }
    };
    html2pdf().from(element).set(opt).save();
  };

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
          <Link to="/timeMgn" className="block text-center px-4 py-2 bg-green-600 hover:bg-white hover:text-black rounded text-white">Time Management</Link>
          <Link to="/reports" className="block text-center px-4 py-2 bg-blue-600 hover:bg-white hover:text-black rounded text-white">Reports</Link>
          <Link to="/more" className="block text-center px-4 py-2 bg-blue-600 hover:bg-white hover:text-black rounded text-white">More</Link>
        </div>
      </div>

      {/* Page content */}
      <div className="w-full md:w-4/5 p-6 bg-white rounded shadow">
        <div>
          <div className="flex justify-between ">
            <div className="flex mb-4">
              <label htmlFor="date-filter" className="mr-2">Filter by Date:</label>
              <input
                type="date"
                id="date-filter"
                value={selectedDate}
                onChange={handleDateChange}
                className="p-2 border border-gray-300 rounded"
              />
            </div>

            <div className="flex mb-4">
              <label htmlFor="month-filter" className="mr-2">Filter by Month:</label>
              <select
                id="month-filter"
                value={selectedMonth}
                onChange={handleMonthChange}
                className="p-2 border border-gray-300 rounded"
              >
                <option value="">Select Month</option>
                <option value="1">January</option>
                <option value="2">February</option>
                <option value="3">March</option>
                <option value="4">April</option>
                <option value="5">May</option>
                <option value="6">June</option>
                <option value="7">July</option>
                <option value="8">August</option>
                <option value="9">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>
            </div>

            <div className="flex mb-4">
              <label htmlFor="name-filter" className="mr-2">Search by Name:</label>
              <input
                type="text"
                id="name-filter"
                value={searchName}
                onChange={handleSearchNameChange}
                className="p-2 border border-gray-300 rounded"
                placeholder="Search by name"
              />
            </div>
          </div>
          <div className="mb-2">
            <button
              onClick={handlePrint}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
            >
              Print as PDF
            </button>
          </div>

        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow rounded-lg" id="print-table">
            <thead>
              <tr className="bg-gray-200 text-left text-sm font-semibold">
                <th className="py-3 px-4 border-b">Staff ID</th>
                <th className="py-3 px-4 border-b">Name</th>
                <th className="py-3 px-4 border-b">Position</th>
                <th className="py-3 px-4 border-b">Clock In</th>
                <th className="py-3 px-4 border-b">Clock Out</th>
                <th className="py-3 px-4 border-b">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((entry) => (
                <tr key={entry.id} className="text-sm">
                  <td className="py-2 px-4 border-b">{entry.staffID}</td>
                  <td className="py-2 px-4 border-b">{entry.fullName}</td>
                  <td className="py-2 px-4 border-b">{entry.position}</td>
                  <td className="py-2 px-4 border-b">{entry.clockIn}</td>
                  <td className="py-2 px-4 border-b">{entry.clockOut}</td>
                  <td className="py-2 px-4 border-b">{new Date(entry.date.seconds * 1000).toLocaleDateString()}</td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-gray-500">No records found for the selected filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
