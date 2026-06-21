// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyC-cL0zKvUph0Z-dTS_a3S4Pv8Fz6mKTng",
  authDomain: "curso-claude-220b2.firebaseapp.com",
  projectId: "curso-claude-220b2",
  storageBucket: "curso-claude-220b2.firebasestorage.app",
  messagingSenderId: "689631936721",
  appId: "1:689631936721:web:c0e0b7441c0985ee3a85f0",
  measurementId: "G-ZCNKCZFV42"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

export { auth, db, provider };
