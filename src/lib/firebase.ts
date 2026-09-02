import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Configuration from firebase-applet-config.json
const firebaseConfig = {
  projectId: "gen-lang-client-0261177908",
  appId: "1:149219204144:web:86160e09ac6be9114861f5",
  apiKey: "AIzaSyAbdkw_El7eia_j5LShpMC3CdKHB1uat08",
  authDomain: "gen-lang-client-0261177908.firebaseapp.com",
  storageBucket: "gen-lang-client-0261177908.firebasestorage.app",
  messagingSenderId: "149219204144"
};

const app = initializeApp(firebaseConfig);

// Use custom Firestore Database ID: "ai-studio-d91f6d5d-aa92-47e5-b4c4-d0d91c6894bd"
export const db = getFirestore(app, "ai-studio-d91f6d5d-aa92-47e5-b4c4-d0d91c6894bd");
