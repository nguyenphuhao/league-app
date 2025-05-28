// lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCrhzzmMMS9zl2ipGX7A838XBBLtxwJHs4",
  authDomain: "nph-toolkit.firebaseapp.com",
  databaseURL:
    "https://nph-toolkit-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "nph-toolkit",
  storageBucket: "nph-toolkit.firebasestorage.app",
  messagingSenderId: "59287181964",
  appId: "1:59287181964:web:9b3c85becec35151a2f9a9",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
