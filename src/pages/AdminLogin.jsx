import WelcomePanel from '../components/auth/WelcomePanel';
import LoginForm from '../components/auth/LoginForm';

function AdminLogin({ onLoginSuccess }) {
  const handleLogin = (credentials) => {
    console.log('Admin login submitted:', credentials);
    if (onLoginSuccess) {
      onLoginSuccess(credentials);
    }
  };

  return (
    <main className="min-h-screen w-full flex flex-col lg:flex-row bg-white overflow-x-hidden">
      <WelcomePanel />
      <LoginForm onSubmit={handleLogin} />
    </main>
  );
}

export default AdminLogin;