import { useState } from "react";
import { Check, CheckCircle2, Copy, Eye, EyeOff } from "lucide-react";

function EmployeeCreatedModal({
  isOpen,
  employeeName,
  departmentName,
  username,
  temporaryPassword,
  onDone,
  onCreateAnother,
}) {
  const [showPassword, setShowPassword] = useState(true);
  const [copiedField, setCopiedField] = useState("");

  if (!isOpen) return null;

  const handleCopy = async (field, value) => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(""), 2000);
    } catch {
      // Clipboard API unavailable
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="employee-created-title"
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
    >
      <div className="w-full max-w-[490px] bg-white border border-[#E2E8F0] rounded-[14px] p-7 sm:p-8 shadow-sm">
        {/* Success Icon */}
        <div className="w-12 h-12 rounded-full bg-[#DCFCE7] flex items-center justify-center mx-auto">
          <CheckCircle2
            className="w-7 h-7 text-[#16A34A]"
            strokeWidth={2}
            aria-hidden="true"
          />
        </div>

        {/* Heading & Subtitle */}
        <h2
          id="employee-created-title"
          className="mt-4 text-[22px] sm:text-[24px] font-bold text-[#0F172A] text-center tracking-[-0.01em]"
        >
          Employee Created Successfully!
        </h2>

        <p className="mt-2 text-[13px] leading-[1.5] text-[#475569] text-center">
          The employee has been created. Share the login credentials below with
          the employee to enable their first login.
        </p>

        {/* Employee Details Box */}
        <div className="mt-6 bg-[#F1F5F9]/80 rounded-[10px] p-4">
          <h3 className="text-[14px] font-bold text-[#0F172A]">
            Employee Details
          </h3>

          <div className="mt-3 grid grid-cols-2 gap-4">
            <div>
              <p className="text-[12px] text-[#475569]">Name</p>
              <p className="mt-1 text-[14px] font-medium text-[#0F172A] break-words">
                {employeeName || "—"}
              </p>
            </div>
            <div>
              <p className="text-[12px] text-[#475569]">Department</p>
              <p className="mt-1 text-[14px] font-medium text-[#0F172A] break-words">
                {departmentName || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Login Credentials Box */}
        <div className="mt-3.5 bg-[#F1F5F9]/80 rounded-[10px] p-4">
          <div className="flex items-center gap-2.5">
            <h3 className="text-[14px] font-bold text-[#0F172A]">
              Login Credentials
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-[#DBEAFE] text-[#2563EB] text-[11px] font-medium">
              Temporary
            </span>
          </div>

          {/* Username */}
          <div className="mt-3">
            <p className="text-[12px] text-[#475569]">Username</p>
            <div className="mt-1 flex items-center justify-between gap-3">
              <p className="text-[14px] font-medium text-[#0F172A] break-all">
                {username || "—"}
              </p>
              <button
                type="button"
                onClick={() => handleCopy("username", username)}
                aria-label="Copy username"
                className="p-1 text-[#1E293B] hover:text-[#1E3247] shrink-0 cursor-pointer"
              >
                {copiedField === "username" ? (
                  <Check className="w-4 h-4 text-[#16A34A]" strokeWidth={2} />
                ) : (
                  <Copy className="w-4 h-4" strokeWidth={1.75} />
                )}
              </button>
            </div>
          </div>

          {/* Temporary Password */}
          <div className="mt-3">
            <p className="text-[12px] text-[#475569]">Password</p>
            <div className="mt-1 flex items-center justify-between gap-3">
              <p className="text-[14px] font-medium text-[#0F172A] break-all">
                {temporaryPassword
                  ? showPassword
                    ? temporaryPassword
                    : "•".repeat(temporaryPassword.length)
                  : "—"}
              </p>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="p-1 text-[#1E293B] hover:text-[#1E3247] cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" strokeWidth={1.75} />
                  ) : (
                    <Eye className="w-4 h-4" strokeWidth={1.75} />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy("password", temporaryPassword)}
                  aria-label="Copy temporary password"
                  className="p-1 text-[#1E293B] hover:text-[#1E3247] cursor-pointer"
                >
                  {copiedField === "password" ? (
                    <Check className="w-4 h-4 text-[#16A34A]" strokeWidth={2} />
                  ) : (
                    <Copy className="w-4 h-4" strokeWidth={1.75} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onDone}
            className="h-[42px] rounded-[8px] bg-[#1E3247] hover:bg-[#162638] active:bg-[#101D2B] text-white text-[13px] font-medium cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3247]/40"
          >
            Done
          </button>
          <button
            type="button"
            onClick={onCreateAnother}
            className="h-[42px] rounded-[8px] border border-[#1E3247] bg-white hover:bg-[#F8FAFC] text-[#1E3247] text-[13px] font-medium cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3247]/30"
          >
            Create Another Employee
          </button>
        </div>
      </div>
    </div>
  );
}

export default EmployeeCreatedModal;