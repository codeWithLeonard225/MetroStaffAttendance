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
  const [staffDetails, setStaffDetails] = useState(null);
  const [timeSheetData, setTimeSheetData] = useState([]);
  const [clockedInToday, setClockedInToday] = useState(false);
  const [clockInMessage, setClockInMessage] = useState("");
  const [clockOutMessage, setClockOutMessage] = useState("");
  const [showClockInMessage, setShowClockInMessage] = useState(false);
  const [showClockOutMessage, setShowClockOutMessage] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const staffimage = [
    { staffID: "st001", image: "/Admin.jpg" },
    { staffID: "st002", image: "/Admin.jpg" },
  ];

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
    const timeSheetRef = collection(db, "TimeSheet");
    const q = query(timeSheetRef);
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

  // Timer to navigate after 15 seconds
  // useEffect(() => {
  // const timeout = setTimeout(() => {
  // navigate('/'); // Redirect to login page after 15 seconds
  // }, 15000);



  // return () => clearTimeout(timeout); // Clear timeout if any event occurs
  // }, [navigate]);

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

  const handleClockIn = async () => {
    if (clockedInToday) {
      setClockInMessage("⚠️ You have already clocked in today!");
      return;
    }

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

  return (
    <div className="flex h-screen">
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}
      <div className="w-1/3 bg-gray-100 p-6 border-r flex flex-col">
        <h2 className="text-xl font-semibold mb-4">Staff Panel</h2>
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
      <div className="w-2/3 p-6 overflow-auto">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <div className="mb-6 flex gap-4 justify-between">
          <div className="flex gap-4">
            <div>
              <button onClick={handleClockIn} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                Clock In
              </button>
              {clockInMessage && (
                <p className={`mt-1 text-yellow-600 transition-opacity duration-500 ease-in ${showClockInMessage ? "opacity-100" : "opacity-0"}`}>{clockInMessage}</p>
              )}
            </div>
            <div>
              <button onClick={handleClockOut} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                Clock Out
              </button>
              {clockOutMessage && (
                <p className={`mt-1 text-yellow-600 transition-opacity duration-500 ease-in ${showClockOutMessage ? "opacity-100" : "opacity-0"}`}>{clockOutMessage}</p>
              )}
            </div>
          </div>
          <div>
            <button onClick={fetchTodayTimeSheet} className="bg-black text-white px-4 py-2 rounded hover:bg-gray-700">
              Fetch All Timesheet Records
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow rounded-lg">
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
              {timeSheetData.map((entry, idx) => (
                <tr key={idx} className="text-sm border-t hover:bg-gray-50">
                  <td className="py-2 px-4">{entry.staffID}</td>
                  <td className="py-2 px-4">{entry.fullName}</td>
                  <td className="py-2 px-4">{entry.position}</td>
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
