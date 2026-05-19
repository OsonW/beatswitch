// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDQDR7P6uk-Ly-bK2_ic229N8wwXhEE3FU",
  authDomain: "beatswitch-d1037.firebaseapp.com",
  projectId: "beatswitch-d1037",
  storageBucket: "beatswitch-d1037.firebasestorage.app",
  messagingSenderId: "61949070226",
  appId: "1:61949070226:web:96a62a20738742631e0f4b",
  measurementId: "G-HFDPH8CC8T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);