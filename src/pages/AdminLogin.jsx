import { useState } from "react";
import { useNavigate } from "react-router-dom";

import WelcomePanel from "../components/auth/WelcomePanel";
import LoginForm from "../components/auth/LoginForm";
import { useAuth } from "../context/auth-context";

function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (credentials) => {
    setError("");
    setIsLoading(true);

    try {
      const user = await login(credentials);

      if (user.mustChangePassword) {
        navigate("/change-password", { replace: true });
        return;
      }

      if (user.role === "ADMIN") {
        navigate("/admin/employees", { replace: true });
        return;
      }

      if (user.role === "EMPLOYEE") {
        navigate("/employee/dashboard", { replace: true });
        return;
      }

      navigate("/unauthorized", { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Unable to sign in. Please check your credentials and try again.";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex flex-col lg:flex-row bg-white overflow-x-hidden">
      <WelcomePanel />

      <LoginForm onSubmit={handleLogin} isLoading={isLoading} error={error} />
    </main>
  );
}

export default AdminLogin;