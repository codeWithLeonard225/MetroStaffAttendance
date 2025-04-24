import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";


import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  enableIndexedDbPersistence,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { initializeApp } from "firebase/app";
import dayjs from "dayjs";

const staffimage = [
  { staffID: "st001", image: "/Admin.jpg" },
  { staffID: "st002", image: "/Admin.jpg" },
];

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

enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === "failed-precondition") {
    console.log("Offline persistence failed: Multiple tabs open.");
  } else if (err.code === "unimplemented") {
    console.log("Offline persistence failed: Browser does not support it.");
  }
});

export default function AdminPage() {
  const [formData, setFormData] = useState({
    staffID: "",
    fullName: "",
    dob: "",
    age: "",
    gender: "",
    tele1: "",
    tele2: "",
    address: "",
    position: "",
    imageURL: "",
  });

  const [staffList, setStaffList] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [currentDocID, setCurrentDocID] = useState(null);

  const navigate = useNavigate();


  useEffect(() => {
    const q = query(collection(db, "StaffDetails"), orderBy("fullName"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const staffData = snapshot.docs.map((doc) => ({
        docID: doc.id,
        ...doc.data(),
      }));
      setStaffList(staffData);
    });
    return () => unsubscribe();
  }, []);

  const handleDOBChange = (e) => {
    const dob = e.target.value;
    const age = dayjs().diff(dayjs(dob), "year");
    setFormData({ ...formData, dob, age });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.staffID || !formData.fullName || !formData.dob) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      if (editMode && currentDocID) {
        const docRef = doc(db, "StaffDetails", currentDocID);
        await updateDoc(docRef, formData);
        alert("Staff updated successfully!");
      } else {
        await addDoc(collection(db, "StaffDetails"), formData);
        alert("Staff registered successfully!");
      }

      // Reset form
      setFormData({
        staffID: "",
        fullName: "",
        dob: "",
        age: "",
        gender: "",
        tele1: "",
        tele2: "",
        address: "",
        position: "",
        imageURL: "",
      });
      setEditMode(false);
      setCurrentDocID(null);
    } catch (error) {
      console.error("Error submitting document: ", error);
      alert("Something went wrong");
    }
  };

  const handleEdit = (staff) => {
    setFormData(staff);
    setEditMode(true);
    setCurrentDocID(staff.docID);
  };

  const handleCancelEdit = () => {
    setFormData({
      staffID: "",
      fullName: "",
      dob: "",
      age: "",
      gender: "",
      tele1: "",
      tele2: "",
      address: "",
      position: "",
      imageURL: "",
    });
    setEditMode(false);
    setCurrentDocID(null);
  };

  const handleDelete = async (docID) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this staff?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "StaffDetails", docID));
      alert("Staff deleted successfully.");
    } catch (error) {
      console.error("Error deleting document: ", error);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="flex flex-col md:flex-row">
      <div className="w-full md:w-1/5 bg-gray-800 text-white min-h-[200px] md:min-h-screen p-4">
        <h2 className="text-xl font-semibold mb-8">Admin Dashboard</h2>
        <button
          onClick={() => navigate("/")}
          className="mb-4 mt-2 self-start bg-blue-100 text-black px-4 py-2 rounded hover:bg-blue-600"
        >
          🏠 Home
        </button>
        <div className="space-y-4">
          <Link to="/admin" className="block text-center px-4 py-2 bg-green-600 hover:bg-white hover:text-black rounded text-white">Staff Details</Link>
          <Link to="/timeMgn" className="block text-center px-4 py-2 bg-blue-600 hover:bg-white hover:text-black rounded text-white">Time Management</Link>
          <Link to="/reports" className="block text-center px-4 py-2 bg-blue-600 hover:bg-white hover:text-black rounded text-white">Reports</Link>
          <Link to="/more" className="block text-center px-4 py-2 bg-blue-600 hover:bg-white hover:text-black rounded text-white">More</Link>
        </div>

      </div>

      <div className="w-full md:w-4/5 p-6 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-4 text-center">
          {editMode ? "Update Staff" : "Register Staff"}
        </h2>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <input type="text" placeholder="Staff ID" value={formData.staffID} onChange={(e) => setFormData({ ...formData, staffID: e.target.value })} className="p-2 border rounded w-full" />
          <input type="text" placeholder="Full Name" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className="p-2 border rounded w-full" />
          <input type="date" value={formData.dob} onChange={handleDOBChange} className="p-2 border rounded w-full" />
          <input type="text" placeholder="Age" value={formData.age} readOnly className="p-2 border rounded bg-gray-100 w-full" />
          <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="p-2 border rounded w-full">
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          <input type="text" placeholder="Telephone 1" value={formData.tele1} onChange={(e) => setFormData({ ...formData, tele1: e.target.value })} className="p-2 border rounded w-full" />
          <input type="text" placeholder="Telephone 2 (optional)" value={formData.tele2} onChange={(e) => setFormData({ ...formData, tele2: e.target.value })} className="p-2 border rounded w-full" />
          <input type="text" placeholder="Address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="p-2 border rounded w-full" />
          <input type="text" placeholder="Position" value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} className="p-2 border rounded w-full" />
          <input type="text" placeholder="Paste Google Drive Image URL" value={formData.imageURL} onChange={(e) => setFormData({ ...formData, imageURL: e.target.value })} className="p-2 border rounded w-full" />
          <div className="md:col-span-2 flex gap-2">
            <button type="submit" className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700">
              {editMode ? "Update" : "Register"}
            </button>
            {editMode && (
              <button type="button" onClick={handleCancelEdit} className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600">
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        <div className="mt-10">
          <h3 className="text-xl font-semibold mb-4">Staff Records</h3>
          <div className="overflow-x-auto max-h-[400px] overflow-y-scroll border rounded">
            <table className="min-w-full text-sm text-left border-collapse">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="p-2 border">Staff ID</th>
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">DOB</th>
                  <th className="p-2 border">Age</th>
                  <th className="p-2 border">Gender</th>
                  <th className="p-2 border">Tel 1</th>
                  <th className="p-2 border">Tel 2</th>
                  <th className="p-2 border">Address</th>
                  <th className="p-2 border">Position</th>
                  <th className="p-2 border">Image</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((staff) => {
                  const matchedImage = staffimage.find((img) => img.staffID === staff.staffID);
                  return (
                    <tr key={staff.docID}>
                      <td className="p-2 border">{staff.staffID}</td>
                      <td className="p-2 border">{staff.fullName}</td>
                      <td className="p-2 border">{staff.dob}</td>
                      <td className="p-2 border">{staff.age}</td>
                      <td className="p-2 border">{staff.gender}</td>
                      <td className="p-2 border">{staff.tele1}</td>
                      <td className="p-2 border">{staff.tele2}</td>
                      <td className="p-2 border">{staff.address}</td>
                      <td className="p-2 border">{staff.position}</td>
                      <td className="p-2 border">
                        {staff.imageURL ? (
                          <img src={staff.imageURL} alt="Staff" className="w-12 h-12 object-cover rounded" />
                        ) : matchedImage ? (
                          <img src={matchedImage.image} alt="Staff" className="w-12 h-12 object-cover rounded" />
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="p-2 border flex flex-col gap-1">
                        <button
                          onClick={() => handleEdit(staff)}
                          className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(staff.docID)}
                          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {staffList.length === 0 && (
                  <tr>
                    <td colSpan="11" className="text-center py-4 text-gray-500">
                      No records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
