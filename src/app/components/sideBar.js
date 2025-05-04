"use client";
import React, { useState } from "react";
import { db } from "../lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { ref, onValue } from "firebase/database";

function SideBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [location, setLocation] = useState({ lat: 0, lng: 0 });
  const [sensorName, setSensorName] = useState("");
  const [sensorSize, setSensorSize] = useState(1);
  const sensorRef = collection(db, "sensorData");

  const fetchLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error fetching location:", error);
          alert("Failed to get location");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const handleSubmit = async () => {
    if (!location || !sensorName) {
      alert("Please enter all fields");
      return;
    }

    try {
      const q = query(sensorRef, where("sensorName", "==", sensorName));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const existingDoc = querySnapshot.docs[0];
        await updateDoc(doc(db, "sensorData", existingDoc.id), {
          location,
          sensorSize: parseFloat(sensorSize),
          timestamp: new Date(),
        });
      } else {
        await addDoc(sensorRef, {
          location,
          sensorName,
          sensorSize: parseFloat(sensorSize),
          timestamp: new Date(),
        });
      }

      setIsOpen(false);
      setLocation("");
      setSensorName("");
      setSensorSize(1);
      alert("Data sent successfully!");
    } catch (error) {
      console.error("Error adding document:", error);
      alert("Error sending data");
    }
  };

  return (
    <div className=" fixed bottom-0 right-0 p-4 z-10">
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 text-xl text-white px-4 py-2 rounded-lg"
      >
        Add / Update
      </button>

      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Enter Details</h2>

            <label className="block mb-2">Current Location:</label>
            <input
              type="text"
              value={`Latitude: ${location.lat}, Longitude: ${location.lng}`}
              readOnly
              className="w-full border p-2 mb-2"
            />
            <button
              onClick={fetchLocation}
              className="bg-green-500 text-white px-4 py-2 rounded mb-4"
            >
              Get My Location
            </button>
            <label className="block mb-2">Dustbin Size (in m):</label>
            <input
              type="number"
              value={sensorSize}
              placeholder="Size of Dustbin sensor"
              onChange={(e) => setSensorSize(e.target.value)}
              className="w-full border p-2 mb-4"
            />

            <label className="block mb-2">Sensor Name:</label>
            <input
              type="text"
              value={sensorName}
              placeholder="Name of Dustbin sensor"
              onChange={(e) => setSensorName(e.target.value)}
              className="w-full border p-2 mb-4"
            />

            <div className="flex justify-between">
              <button
                onClick={handleSubmit}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Submit
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SideBar;
