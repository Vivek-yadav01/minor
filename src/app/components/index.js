"use client";
import { useEffect, useState } from "react";
import { database } from "../lib/firebase";
import { ref, onValue } from "firebase/database";

export default function RealtimeData() {
  const [distance, setDistance] = useState(null);
  const [airQuality, setAirQuality] = useState(null);
  const [accelX, setAccelX] = useState(null);
  const [accelY, setAccelY] = useState(null);
  const [accelZ, setAccelZ] = useState(null);

  useEffect(() => {
    // 🔹 Reference Firebase Data
    const distanceRef = ref(database, "/sensor/distance");
    const airQualityRef = ref(database, "/sensor/airQuality");
    const accelXRef = ref(database, "/sensor/accX");
    const accelYRef = ref(database, "/sensor/accY");
    const accelZRef = ref(database, "/sensor/accZ");

    // 🔹 Listen for Realtime Updates
    onValue(distanceRef, (snapshot) => {
      setDistance(snapshot.exists() ? snapshot.val() : "No Data");
    });

    onValue(airQualityRef, (snapshot) => {
      setAirQuality(snapshot.exists() ? snapshot.val() : "No Data");
    });

    onValue(accelXRef, (snapshot) => {
      setAccelX(snapshot.exists() ? snapshot.val() : "No Data");
    });

    onValue(accelYRef, (snapshot) => {
      setAccelY(snapshot.exists() ? snapshot.val() : "No Data");
    });

    onValue(accelZRef, (snapshot) => {
      setAccelZ(snapshot.exists() ? snapshot.val() : "No Data");
    });
  }, []);

  return (
    <div>
      <h1>Realtime Sensor Data</h1>
      <p>🚀 Distance: {distance} cm</p>
      <p>🌫 Air Quality: {airQuality}</p>
      <p>📟 Acceleration X: {accelX} m/s²</p>
      <p>📟 Acceleration Y: {accelY} m/s²</p>
      <p>📟 Acceleration Z: {accelZ} m/s²</p>
    </div>
  );
}
