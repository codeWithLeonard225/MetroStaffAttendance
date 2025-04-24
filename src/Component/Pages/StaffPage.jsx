import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getFirestore, collection, query, where, getDocs, addDoc, updateDoc, doc } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import Confetti from 'react-confetti';

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDewVEb0RF8UF9Phy1PRq4aMP5aEb-AsoA",
  authDomain: "codetest-b335a.firebaseapp.com",
  projectId: "codetest-b335a",
  storageBucket: "codetest-b335a.appspot.com",
  messagingSenderId: "653179469205",
  appId: "1:653179469205:web:0feabf21c89bf6cdac8a9c",
  measurementId: "G-JXLJJ1PDB1",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const StaffPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { staffId } = location.state || {};

  const [clockInTime, setClockInTime] = useState("--");
  const [clockOutTime, setClockOutTime] = useState("--");
  const [isClockingIn, setIsClockingIn] = useState(false);
  const [absenceReason, setAbsenceReason] = useState(""); // Sick or Excuse
  const [statusSubmitted, setStatusSubmitted] = useState(false);
  const [staffDetails, setStaffDetails] = useState(null);
  const [timeSheetData, setTimeSheetData] = useState([]);
  const [clockedInToday, setClockedInToday] = useState(false);
  const [clockInMessage, setClockInMessage] = useState("");
  const [clockOutMessage, setClockOutMessage] = useState("");
  const [showClockInMessage, setShowClockInMessage] = useState(false);
  const [showClockOutMessage, setShowClockOutMessage] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);


  const staffimage = [
    { staffID: "st001", image: "/Admin.jpg" },
    { staffID: "st002", image: "/Admin.jpg" },
  ];


  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);


  useEffect(() => {
    const fetchStaffDetails = async () => {
      const staffRef = collection(db, "StaffDetails");
      const q = query(staffRef, where("staffID", "==", staffId));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setStaffDetails(querySnapshot.docs[0].data());
      }
    };
    fetchStaffDetails();
  }, [staffId]);

  const fetchTodayTimeSheet = async () => {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const timeSheetRef = collection(db, "TimeSheet");
    const q = query(timeSheetRef, where("date", ">=", startOfDay), where("date", "<=", endOfDay));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate().toLocaleDateString(),
    }));
    setTimeSheetData(data);

    const todayStr = new Date().toLocaleDateString();
    const todayEntry = data.find(entry => entry.staffID === staffId && entry.date === todayStr);
    if (todayEntry && todayEntry.clockIn !== "--") {
      setClockedInToday(true);
    } else {
      setClockedInToday(false);
    }
  };

  useEffect(() => {
    fetchTodayTimeSheet();
  }, [staffId]);

  useEffect(() => {
    if (clockInMessage) {
      setShowClockInMessage(true);
      const fadeTimer = setTimeout(() => setShowClockInMessage(false), 2500);
      const clearTimer = setTimeout(() => setClockInMessage(""), 3000);
      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(clearTimer);
      };
    }
  }, [clockInMessage]);

  useEffect(() => {
    if (clockOutMessage) {
      setShowClockOutMessage(true);
      const fadeTimer = setTimeout(() => setShowClockOutMessage(false), 2500);
      const clearTimer = setTimeout(() => setClockOutMessage(""), 3000);
      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(clearTimer);
      };
    }
  }, [clockOutMessage]);

  const staffImageUrl = staffimage.find(item => item.staffID === staffId)?.image || "/default.jpg";

  useEffect(() => {
    setStatusSubmitted(false);
  }, [staffId]);


  const handleClockIn = async () => {
    if (clockedInToday) {
      setClockInMessage("⚠️ You have already clocked in today!");
      return;
    }

    setIsClockingIn(true); // disable button

    const time = new Date().toLocaleTimeString();
    setClockInTime(time);

    await addDoc(collection(db, "TimeSheet"), {
      staffID: staffDetails.staffID,
      fullName: staffDetails.fullName,
      position: staffDetails.position,
      clockIn: time,
      clockOut: "--",
      date: new Date(),
    });

    fetchTodayTimeSheet();
    setClockInMessage("✅ Clocked in successfully!");
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const handleClockOut = async () => {
    const todayStr = new Date().toLocaleDateString();
    const todayEntry = timeSheetData.find(
      entry => entry.staffID === staffId && entry.date === todayStr
    );

    if (!todayEntry || todayEntry.clockIn === "--") {
      setClockOutMessage("⚠️ You need to clock in before clocking out.");
      return;
    }

    if (todayEntry.clockOut !== "--") {
      setClockOutMessage("⚠️ You have already clocked out today.");
      return;
    }

    const time = new Date().toLocaleTimeString();
    setClockOutTime(time);

    const docRef = doc(db, "TimeSheet", todayEntry.id);
    await updateDoc(docRef, {
      clockOut: time,
      clockOutDate: todayStr,
    });

    fetchTodayTimeSheet();
    setClockOutMessage("✅ Clocked out successfully!");
  };

  if (!staffDetails) return <p>Loading...</p>;

  const fetchAllTimeSheetdata = async () => {
    const timeSheetRef = collection(db, "TimeSheet");
    const querySnapshot = await getDocs(timeSheetRef);
    const data = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate().toLocaleDateString(),
    }));
    setTimeSheetData(data);
  };

  const handleAbsenceSubmit = async () => {
    if (!absenceReason) {
      alert("Please select a reason (Sick or Excuse).");
      return;
    }

    const todayStr = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();

    await addDoc(collection(db, "TimeSheet"), {
      staffID: staffDetails.staffID,
      fullName: staffDetails.fullName,
      position: staffDetails.position,
      clockIn: "--",
      clockOut: "--",
      status: absenceReason,
      submittedAt: time,
      date: new Date(),
    });

    fetchTodayTimeSheet();
    setAbsenceReason("");
    setStatusSubmitted(true); // Disable clock in/out
    alert("Absence submitted successfully.");
  };




  return (
    <div className="flex h-screen">
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}
      <div className="hidden md:flex md:w-1/4 bg-gray-100 p-6 border-r flex-col">
        <h2 className="text-xl font-semibold mb-4">Staff Panel</h2>
        <button
          onClick={() => navigate("/")}
          className="mb-4 mt-2 self-start bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          🏠 Home
        </button>
        <p className="mb-1">👋 Welcome, <strong>{staffId}</strong></p>
        <ul className="space-y-2 ">
          <li className="cursor-pointer hover:text-blue-600">📄 View Reports</li>
          <li className="cursor-pointer hover:text-blue-600">🗓️ Schedule</li>
          <li className="cursor-pointer hover:text-blue-600">📧 Messages</li>
          <li className="cursor-pointer hover:text-blue-600">⚙️ Settings</li>
        </ul>
        <div className="mt-8 h-full border-t pt-4 flex flex-col items-center text-center bg-gray-900">
          <img src={staffImageUrl} alt="Staff" className="w-40 h-40 mb-3" />
          <p className="font-semibold text-lg text-white">{staffDetails.staffID}</p>
          <p className="text-white">{staffDetails.fullName}</p>
          <p className="text-sm text-white">{staffDetails.position}</p>
        </div>
      </div>
      <div className="w-full md:w-3/4 p-4 md:p-6 overflow-auto">
        <h1 className="text-xl md:text-2xl font-bold mb-4">
          Dashboard {isOffline ? "(Offline)" : "(Online)"}
        </h1>

        <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex gap-4">
            <div>
              <button
                onClick={handleClockIn}
                disabled={statusSubmitted || isClockingIn}
                className={`bg-green-500 text-white text-sm md:text-base px-2 md:px-4 py-1 md:py-2 rounded hover:bg-green-600 ${statusSubmitted ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {isClockingIn ? "Clocking In..." : "Clock In"}
              </button>
              {clockInMessage && (
                <p className={`mt-1 text-yellow-600 transition-opacity duration-500 ease-in ${showClockInMessage ? "opacity-100" : "opacity-0"}`}>{clockInMessage}</p>
              )}
            </div>
            <div>
              <button
                onClick={handleClockOut}
                disabled={statusSubmitted}
                className={`bg-red-500 text-white text-sm md:text-base px-2 md:px-4 py-1 md:py-2 rounded hover:bg-red-600 ${statusSubmitted ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                Clock Out
              </button>
              {clockOutMessage && (
                <p className={`mt-1 text-yellow-600 transition-opacity duration-500 ease-in ${showClockOutMessage ? "opacity-100" : "opacity-0"}`}>{clockOutMessage}</p>
              )}
            </div>
            <div className="flex  gap-2">
              <select
                className="border p-2 rounded"
                value={absenceReason}
                onChange={(e) => setAbsenceReason(e.target.value)}
              >
                <option value="">-- Select Reason --</option>
                <option value="Sick">🤒 Sick</option>
                <option value="Excuse">📄 Excuse</option>
              </select>
              <button
                onClick={handleAbsenceSubmit}
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
              >
                Submit Absence
              </button>
            </div>

          </div>
          <div>
            <button onClick={fetchAllTimeSheetdata} className="bg-black text-white px-4 py-2 rounded hover:bg-gray-700">
              Fetch All Timesheet Records
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs md:text-sm bg-white shadow rounded-lg">
            <thead>
              <tr className="bg-gray-200 text-left text-sm font-semibold">
                <th className="py-2 md:py-3 px-2 md:px-4">Staff ID</th>
                <th className="py-2 md:py-3 px-2 md:px-4">Name</th>
                <th className="py-2 md:py-3 px-2 md:px-4">Position</th>
                <th className="py-2 md:py-3 px-2 md:px-4">Status</th>
                <th className="py-2 md:py-3 px-2 md:px-4">Clock In</th>
                <th className="py-2 md:py-3 px-2 md:px-4">Clock Out</th>
                <th className="py-2 md:py-3 px-2 md:px-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {timeSheetData.map((entry, idx) => (
                <tr key={idx} className="text-sm border-t hover:bg-gray-50">
                  <td className="py-2 px-4">{'*'.repeat(entry.staffID.length)}</td>
                  <td className="py-2 px-4">{entry.fullName}</td>
                  <td className="py-2 px-4">{entry.position}</td>
                  <td className="py-2 px-4">{entry.status || "—"}</td>
                  <td className="py-2 px-4">{entry.clockIn}</td>
                  <td className="py-2 px-4">{entry.clockOut}</td>
                  <td className="py-2 px-4">{entry.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StaffPage;