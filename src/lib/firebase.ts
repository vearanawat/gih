// This file is deprecated as we're using Clerk for authentication
// Keeping this file as a placeholder in case we need Firebase features in the future
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
import { initializeFirestore, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';

// Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC0r-OxQeYxE_e-iOQ2Q_xGUe0gwKjdzTI",
  authDomain: "mediflow-80fc2.firebaseapp.com",
  projectId: "mediflow-80fc2",
  storageBucket: "mediflow-80fc2.appspot.com",
  messagingSenderId: "511007423689",
  appId: "1:511007423689:web:f3020673be5d4df181a118",
  measurementId: "G-E1WF9J8TGQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services with specific settings
const auth = getAuth(app);
const db = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,
  experimentalForceLongPolling: true // Use only this option for long polling
});

// Initialize analytics only in production
const analytics = process.env.NODE_ENV === 'production' ? getAnalytics(app) : null;

// Export initialized services
export { auth, db, app };
export const analytics_enabled = process.env.NODE_ENV === 'production' ? analytics : null;