// AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingAuthState, setLoadingAuthState] = useState(true);
  const [userRole, setUserRole] = useState(null); // Nuevo estado para el rol del usuario

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Obtener el rol del usuario desde Firestore
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserRole(data.role);
        } else {
          console.error('No se encontró el rol del usuario en Firestore.');
          setUserRole(null);
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoadingAuthState(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loadingAuthState, userRole }}>
      {children}
    </AuthContext.Provider>
  );
}
