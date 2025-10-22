// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBW85iYMpE7yCu6XDNohHTmr8ON11-FWUI",
  authDomain: "lembretecontas.firebaseapp.com",
  projectId: "lembretecontas",
  storageBucket: "lembretecontas.firebasestorage.app",
  messagingSenderId: "853973539596",
  appId: "1:853973539596:web:010e651e5414d4b2690729",
  measurementId: "G-S88VBFRSEF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;