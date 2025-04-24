import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { initializeApp } from "firebase/app";

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

export default function LoginPage() {
  const [userID, setUserID] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    const inputID = userID.trim().toLowerCase();
  
    if (!inputID.startsWith("st") && !inputID.startsWith("ad")) {
      setError("ID must start with 'st' for staff or 'ad' for admin.");
      return;
    }
  
    const colRef = collection(db, "Login");
    const snapshot = await getDocs(colRef);
    const users = snapshot.docs.map((doc) => doc.data());
  
    console.log("Users from Firestore:", users);
  
    if (inputID.startsWith("st")) {
      const staff = users.find(
        (u) => u.staffID && u.staffID.toLowerCase() === inputID
      );
      if (staff) {
        navigate("/staff", { state: { staffId: inputID } });
      } else {
        setError("Staff ID not found.");
      }
    } else if (inputID.startsWith("ad")) {
      const admin = users.find(
        (u) => u.staffID && u.staffID.toLowerCase() === inputID
      );
      if (admin) {
        navigate("/admin", { state: { staffId: inputID } });
      } else {
        setError("Admin ID not found.");
      }
    }
  };

  return (
    <div
      className="flex flex-col justify-between h-screen bg-cover bg-center"
      style={{ backgroundImage: 'url("/IMG-20250421-WA0080.jpg")' }}
    >
      {/* Heading at the top */}
      <div className="text-center text-white bg-black bg-opacity-50 py-4">
        <h1 className="text-3xl font-semibold">
          Metro Transport Company Ltd Staff Details and TimeSheet Management System
        </h1>
      </div>

      {/* Login content at the bottom */}
      <div className="flex justify-center items-center h-screen bg-cover bg-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-80">
          <h2 className="text-2xl font-semibold mb-4 text-center">Login</h2>
          <input
            type="text"
            placeholder="Enter ID (e.g., st001, ad001)"
            value={userID}
            onChange={(e) => setUserID(e.target.value)}
            className="w-full p-2 border rounded mb-4"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            onClick={handleLogin}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
