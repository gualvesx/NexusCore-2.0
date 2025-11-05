// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// REMOVA: import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDznqrm2kJfKQXxWpgHWwk-msXH89OEgTo",
  authDomain: "banco-vc.firebaseapp.com",
  projectId: "banco-vc",
  storageBucket: "banco-vc.firebasestorage.app",
  messagingSenderId: "858410245985",
  appId: "1:858410245985:web:56fae7da4c145c30a32f20",
  measurementId: "G-4E7K9TY3B7" // Pode manter a config, mas não inicializar
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
// REMOVA: export const analytics = getAnalytics(app);