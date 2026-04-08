// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey:import.meta.env.VITE_FIREBASE_APIKEY,
   authDomain: "yumrush-36c69.firebaseapp.com",
  projectId: "yumrush-36c69",
  storageBucket: "yumrush-36c69.firebasestorage.app",
  messagingSenderId: "1085058637757",
  appId: "1:1085058637757:web:d0d20ba2785ebc2c733cd4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth=getAuth(app)
export {app,auth}