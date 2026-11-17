import { useEffect, useState } from 'react';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

const DASHBOARD_PATHS = ['/admin/employees', '/dashboard'];

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    DASHBOARD_PATHS.includes(window.location.pathname),
  );

  useEffect(() => {
    const handlePopState = () => {
      setIsAuthenticated(DASHBOARD_PATHS.includes(window.location.pathname));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleLoginSuccess = (credentials) => {
    console.log('Admin login submitted:', credentials);
    window.history.pushState({}, '', '/admin/employees');
    setIsAuthenticated(true);
  };

  if (isAuthenticated) {
    return <AdminDashboard />;
  }

  return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
}

export default App;