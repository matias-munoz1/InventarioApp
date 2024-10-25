// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; // Importar getAuth

const firebaseConfig = {
  apiKey: "AIzaSyCOAnSMCLYuI1HEMwi6d1r4uMlm_Sw06rQ",
  authDomain: "inventarioapp-345c5.firebaseapp.com",
  projectId: "inventarioapp-345c5",
  storageBucket: "inventarioapp-345c5.appspot.com",
  messagingSenderId: "327477373493",
  appId: "1:327477373493:web:fb6dc3d71591cc9ce85f7c",
  measurementId: "G-HF5WZMHBS9"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar Firestore
const db = getFirestore(app);
const auth = getAuth(app); // Inicializar auth
export { db, auth };
