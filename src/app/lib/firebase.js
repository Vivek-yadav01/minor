// lib/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCTB3LYL0E3_69NtM-t362_HhGOwdC-YkM",
  authDomain: "fir-project-f187d.firebaseapp.com",
  databaseURL: "https://fir-project-f187d-default-rtdb.firebaseio.com",
  projectId: "fir-project-f187d",
  storageBucket: "fir-project-f187d.firebasestorage.app",
  messagingSenderId: "715189819833",
  appId: "1:715189819833:web:3707a6adfef167e00d3e68",
  measurementId: "G-7D6QCS7ZYD",
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Realtime Database
const auth = getAuth(app);
const database = getDatabase(app);

// Export both
export { db, database, auth };
