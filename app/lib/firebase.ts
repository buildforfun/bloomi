import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBQHCEkpQGAwQ1_jcjER0GT7E9tPa50FOs",
  authDomain: "bloomi-1fb3e.firebaseapp.com",
  projectId: "bloomi-1fb3e",
  storageBucket: "bloomi-1fb3e.firebasestorage.app",
  messagingSenderId: "29507249474",
  appId: "1:29507249474:web:205a3a7473ad45e32d94db",
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
