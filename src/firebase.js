import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCTwUmX-w16RKqR8Zl_K0cS4JBryqNe8WA",
  authDomain: "fir-course-2c5cd.firebaseapp.com",
  projectId: "fir-course-2c5cd",
  storageBucket: "fir-course-2c5cd.firebasestorage.app",
  messagingSenderId: "131974547983",
  appId: "1:131974547983:web:8c00b452fdb09e88d5717a",
  measurementId: "G-PC45YWLGQ8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export { db };
