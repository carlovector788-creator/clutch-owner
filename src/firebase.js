import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBQhR2xTNDhJNsSIrA15xjfxztOL_FuzmM",
  authDomain: "clutch-app-8d8bd.firebaseapp.com",
  projectId: "clutch-app-8d8bd",
  storageBucket: "clutch-app-8d8bd.firebasestorage.app",
  messagingSenderId: "713925883143",
  appId: "1:713925883143:web:e8970f33e553c1f08f41a2",
  measurementId: "G-JKTGDFEBK4",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
