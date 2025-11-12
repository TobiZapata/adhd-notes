// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey:
    "AIzaSyBueVZvjIcZm75JU6XGu8Uwx_EG6AbqWHM",
  authDomain:
    "adhd-notes-e8e1d.firebaseapp.com",
  projectId: "adhd-notes-e8e1d",
  storageBucket:
    "adhd-notes-e8e1d.firebasestorage.app",
  messagingSenderId: "507172452761",
  appId:
    "1:507172452761:web:3e366bc54e09eb87f5fb08",
};

// Initialize Firebase
const app = initializeApp(
  firebaseConfig
);
export const auth = getAuth(app);
export const db = getFirestore(app);
