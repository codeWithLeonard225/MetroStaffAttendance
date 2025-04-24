import React, { useEffect, useState } from "react";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDewVEb0RF8UF9Phy1PRq4aMP5aEb-AsoA",
  authDomain: "codetest-b335a.firebaseapp.com",
  projectId: "codetest-b335a",
  storageBucket: "codetest-b335a.appspot.com",
  messagingSenderId: "653179469205",
  appId: "1:653179469205:web:0feabf21c89bf6cdac8a9c",
  measurementId: "G-JXLJJ1PDB1",
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export { db }; // Export db to be used in other files

export default function Firebase() {
  const [staffList, setStaffList] = useState([]);

  useEffect(() => {
    const fetchStaffData = async () => {
      const colRef = collection(db, "StaffDetails"); // Fetching from StaffDetails collection
      const snapshot = await getDocs(colRef);

      const staffData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setStaffList(staffData); // Update the state with fetched data
    };

    fetchStaffData();
  }, []);

  return (
    <div>
      <h2>Staff List</h2>
      {staffList.length === 0 ? (
        <p>No staff data available.</p>
      ) : (
        <ul>
          {staffList.map((staff) => (
            <li key={staff.id}>
              {staff.fullName} - {staff.position}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
