import { AuthProvider } from './contexts/AuthContext';
import AppRouter from './router/AppRouter';

// App principal
function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;