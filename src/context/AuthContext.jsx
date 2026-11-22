import { useCallback, useEffect, useState } from "react";

import apiClient from "../api/client";
import { AuthContext } from "./auth-context";

// Share an in-flight refresh request to avoid concurrent token rotations.
let refreshPromise = null;

function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = apiClient
      .post("/auth/refresh")
      .then((response) => response.data.data)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [pendingPassword, setPendingPassword] = useState("");
  const [isInitializing, setIsInitializing] = useState(true);

  const isAuthenticated = Boolean(user && accessToken);

  const updateAccessToken = useCallback((token) => {
    setAccessToken(token);

    if (token) {
      apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete apiClient.defaults.headers.common.Authorization;
    }
  }, []);

  const clearAuth = useCallback(() => {
    updateAccessToken(null);
    setUser(null);
    setPendingPassword("");
  }, [updateAccessToken]);

  // Restore an existing session when the application starts.
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const session = await refreshSession();

        if (!session?.accessToken) {
          throw new Error("No valid access token returned.");
        }

        const token = session.accessToken;

        apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;

        const response = await apiClient.get("/auth/me");
        const currentUser = response.data.data.user;

        if (isMounted) {
          setAccessToken(token);
          setUser(currentUser);
        }
      } catch {
        if (isMounted) {
          clearAuth();
        }
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, [clearAuth]);

  // Authenticate a user.
  const login = useCallback(
    async ({ username, password }) => {
      const response = await apiClient.post("/auth/login", {
        username,
        password,
      });

      const { accessToken: token, user: authenticatedUser } =
        response.data.data;

      updateAccessToken(token);
      setUser(authenticatedUser);
      setPendingPassword(
        authenticatedUser?.mustChangePassword ? password : "",
      );

      return authenticatedUser;
    },
    [updateAccessToken],
  );

  // Update password on first login using the in-memory login password (or fallback input).
  const changePassword = useCallback(
    async ({ currentPassword, newPassword, confirmPassword }) => {
      const resolvedCurrentPassword = currentPassword || pendingPassword;

      await apiClient.post("/auth/change-password", {
        currentPassword: resolvedCurrentPassword,
        newPassword,
        confirmPassword,
      });

      setPendingPassword("");

      try {
        const response = await apiClient.get("/auth/me");
        const updatedUser = response.data.data.user;
        setUser(updatedUser);
        return updatedUser;
      } catch {
        const fallbackUser = user
          ? { ...user, mustChangePassword: false }
          : null;
        setUser(fallbackUser);
        return fallbackUser;
      }
    },
    [pendingPassword, user],
  );

  // Revoke the session and clear local authentication state.
  const logout = useCallback(async () => {
    try {
      await apiClient.post("/auth/logout");
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  const value = {
    user,
    accessToken,
    isAuthenticated,
    isInitializing,
    hasPendingPassword: Boolean(pendingPassword),
    login,
    changePassword,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}