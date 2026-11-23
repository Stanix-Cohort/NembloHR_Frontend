import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LoaderCircle, Lock } from "lucide-react";
import { useAuth } from "../context/auth-context";
import { getApiErrorMessage } from "../utils/apiError";

function getPostResetDestination(role) {
  if (role === "ADMIN") return "/admin/employees";
  if (role === "EMPLOYEE") return "/employee/assets";
  return "/unauthorized";
}

function ChangePassword() {
  const navigate = useNavigate();
  const {
    user,
    isAuthenticated,
    isInitializing,
    hasPendingPassword,
    changePassword,
  } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <p className="text-sm text-[#64748B]">Checking your session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.mustChangePassword) {
    return <Navigate to={getPostResetDestination(user?.role)} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    setError("");

    if (!hasPendingPassword && !currentPassword.trim()) {
      setError("Please enter your current password.");
      return;
    }

    if (!newPassword.trim()) {
      setError("Please enter a new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedUser = await changePassword({
        ...(hasPendingPassword ? {} : { currentPassword }),
        newPassword,
        confirmPassword,
      });

      navigate(getPostResetDestination(updatedUser?.role ?? user?.role), {
        replace: true,
      });
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "Unable to update password. Please check your input and try again.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-[560px] bg-white border border-[#E2E8F0] rounded-[14px] px-6 py-10 sm:px-14 sm:py-12">
        <div className="text-center">
          <h1 className="text-[28px] sm:text-[32px] font-bold tracking-[-0.02em] text-[#334155] leading-tight">
            Update Your Password
          </h1>
          <p className="mt-2.5 text-[14px] leading-[1.5] text-[#64748B] max-w-[360px] mx-auto">
            For security reasons, please update your password before continuing
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          aria-busy={isSubmitting}
          className="mt-7 max-w-[380px] mx-auto"
        >
          {error && (
            <div
              role="alert"
              className="mb-4 rounded-[8px] bg-red-50 border border-red-200 px-3.5 py-2.5 text-[13px] text-red-700"
            >
              {error}
            </div>
          )}

          {/* Fallback Current Password (shown only if in-memory password was cleared by a hard refresh) */}
          {!hasPendingPassword && (
            <div className="mb-4">
              <label
                htmlFor="current-password"
                className="block text-[14px] font-medium text-[#0F172A] mb-2"
              >
                Current Password
              </label>
              <div className="relative">
                <Lock
                  className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  strokeWidth={1.7}
                  aria-hidden="true"
                />
                <input
                  id="current-password"
                  name="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  className="w-full h-[44px] pl-10 pr-10 rounded-[8px] border border-[#CBD5E1] bg-white text-[14px] text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#1E3247]/20 focus:border-[#1E3247] disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  aria-label={
                    showCurrentPassword
                      ? "Hide current password"
                      : "Show current password"
                  }
                  disabled={isSubmitting}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#0F172A] cursor-pointer focus:outline-none"
                >
                  {showCurrentPassword ? (
                    <Eye className="w-4 h-4" strokeWidth={1.7} />
                  ) : (
                    <EyeOff className="w-4 h-4" strokeWidth={1.7} />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* New Password */}
          <div>
            <label
              htmlFor="new-password"
              className="block text-[14px] font-medium text-[#0F172A] mb-2"
            >
              New Password
            </label>
            <div className="relative">
              <Lock
                className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                strokeWidth={1.7}
                aria-hidden="true"
              />
              <input
                id="new-password"
                name="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                autoComplete="new-password"
                disabled={isSubmitting}
                className="w-full h-[44px] pl-10 pr-10 rounded-[8px] border border-[#CBD5E1] bg-white text-[14px] text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#1E3247]/20 focus:border-[#1E3247] disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                aria-label={
                  showNewPassword ? "Hide new password" : "Show new password"
                }
                disabled={isSubmitting}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#0F172A] cursor-pointer focus:outline-none"
              >
                {showNewPassword ? (
                  <Eye className="w-4 h-4" strokeWidth={1.7} />
                ) : (
                  <EyeOff className="w-4 h-4" strokeWidth={1.7} />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="mt-4">
            <label
              htmlFor="confirm-password"
              className="block text-[14px] font-medium text-[#0F172A] mb-2"
            >
              Confirm Password
            </label>
            <div className="relative">
              <Lock
                className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                strokeWidth={1.7}
                aria-hidden="true"
              />
              <input
                id="confirm-password"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                autoComplete="new-password"
                disabled={isSubmitting}
                className="w-full h-[44px] pl-10 pr-10 rounded-[8px] border border-[#CBD5E1] bg-white text-[14px] text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#1E3247]/20 focus:border-[#1E3247] disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
                disabled={isSubmitting}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#0F172A] cursor-pointer focus:outline-none"
              >
                {showConfirmPassword ? (
                  <Eye className="w-4 h-4" strokeWidth={1.7} />
                ) : (
                  <EyeOff className="w-4 h-4" strokeWidth={1.7} />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 w-full h-[44px] rounded-[8px] bg-[#1E3247] hover:bg-[#162638] active:bg-[#101D2B] text-white text-[14px] font-medium inline-flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3247]/40 disabled:opacity-70"
          >
            {isSubmitting && <LoaderCircle className="w-4 h-4 animate-spin" />}
            <span>{isSubmitting ? "Updating..." : "Update Password"}</span>
          </button>
        </form>
      </div>
    </main>
  );
}

export default ChangePassword;