import React from 'react';
import { AuthProvider } from './contexts/AuthContext.ultra-simple';
import AppRouter from './router/AppRouter.ultra-simple';

// App principal
function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;