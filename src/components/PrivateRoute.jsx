// PrivateRoute.jsx
import React, { useContext } from 'react';
import { AuthContext } from './AuthContext';
import { Navigate } from 'react-router-dom';

function PrivateRoute({ children }) {
  const { user, loadingAuthState } = useContext(AuthContext);

  if (loadingAuthState) {
    return <p>Cargando...</p>;
  }

  return user ? children : <Navigate to="/login" />;
}

export default PrivateRoute;
