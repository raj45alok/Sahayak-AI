import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDX4ynxb-5zsO8zdXbP-RopbTRoADoQcI0",
  authDomain: "sahayak-ai-f3474.firebaseapp.com",
  projectId: "sahayak-ai-f3474",
  storageBucket: "sahayak-ai-f3474.firebasestorage.app",
  messagingSenderId: "232818560105",
  appId: "1:232818560105:web:4725a1e0fbc00c3d0ae6f8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);