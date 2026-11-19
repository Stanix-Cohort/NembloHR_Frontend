import { useMemo, useRef, useState } from "react";
import { ChevronDown, LoaderCircle } from "lucide-react";

const DEFAULT_JOB_TITLES = [
  "Product Manager",
  "Software Engineer",
  "Product Designer",
  "Marketing Specialist",
  "Sales Executive",
  "Financial Analyst",
  "HR Specialist",
];

function splitFullName(employee) {
  if (employee?.firstName || employee?.lastName) {
    return {
      firstName: employee.firstName || "",
      lastName: employee.lastName || "",
    };
  }

  const parts = (employee?.fullName || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

function getInitials(firstName, lastName) {
  const first = firstName.trim()[0] || "";
  const last = lastName.trim()[0] || "";
  const combined = `${first}${last}`.toUpperCase();
  return combined || "?";
}

function buildInitialState(employee) {
  const { firstName, lastName } = splitFullName(employee);
  return {
    firstName,
    lastName,
    email: employee?.workEmail || employee?.email || "",
    phone: employee?.phone || "",
    departmentId: employee?.departmentId || employee?.department?.id || "",
    jobTitle: employee?.jobTitle || "",
  };
}

function EditEmployeeForm({
  employee,
  departments = [],
  departmentsLoading = false,
  isSubmitting = false,
  serverError = "",
  onCancel,
  onSubmit,
}) {
  const [formData, setFormData] = useState(() => buildInitialState(employee));
  const [errors, setErrors] = useState({});
  const [photoPreview, setPhotoPreview] = useState(
    () => employee?.avatarUrl || employee?.photoUrl || "",
  );
  const fileInputRef = useRef(null);

  const jobTitleOptions = useMemo(() => {
    const current = formData.jobTitle?.trim();
    if (current && !DEFAULT_JOB_TITLES.includes(current)) {
      return [current, ...DEFAULT_JOB_TITLES];
    }
    return DEFAULT_JOB_TITLES;
  }, [formData.jobTitle]);

  const initials = getInitials(formData.firstName, formData.lastName);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handlePhotoSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);
  };

  const validate = () => {
    const nextErrors = {};

    if (!formData.firstName.trim()) {
      nextErrors.firstName = "First name is required.";
    }

    if (!formData.lastName.trim()) {
      nextErrors.lastName = "Last name is required.";
    }

    if (!formData.email.trim()) {
      nextErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }

    return nextErrors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      fullName: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
      workEmail: formData.email.trim(),
      phone: formData.phone.trim(),
      departmentId: formData.departmentId,
      jobTitle: formData.jobTitle,
    };

    if (onSubmit) {
      onSubmit(payload);
    }
  };

  const getInputClasses = (hasError) =>
    `w-full h-[46px] px-4 rounded-[8px] border bg-white text-[14px] text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed ${
      hasError
        ? "border-[#DC2626] focus:ring-[#DC2626]/20 focus:border-[#DC2626]"
        : "border-[#CBD5E1] focus:ring-[#1E3247]/20 focus:border-[#1E3247]"
    }`;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-busy={isSubmitting}
      className="bg-white border border-[#E2E8F0] rounded-[12px] p-6 sm:p-8 lg:px-10 lg:py-10"
    >
      {serverError && (
        <div
          role="alert"
          className="mb-6 rounded-[8px] bg-red-50 border border-red-200 px-4 py-3 text-[13px] text-red-700"
        >
          {serverError}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Left: Avatar & Change Photo */}
        <div className="flex flex-col items-center shrink-0 lg:w-[210px] pt-2">
          <div className="w-[132px] h-[132px] rounded-full bg-[#DCE1E7] flex items-center justify-center overflow-hidden">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt={
                  `${formData.firstName} ${formData.lastName}`.trim() ||
                  "Employee avatar"
                }
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-[44px] font-normal tracking-tight text-[#1E293B] select-none">
                {initials}
              </span>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoSelect}
            className="hidden"
            aria-label="Upload employee photo"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSubmitting}
            className="mt-5 h-[36px] px-5 rounded-[8px] border border-[#1E3247] bg-white hover:bg-[#F8FAFC] text-[13px] font-medium text-[#0F172A] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3247]/30 disabled:opacity-60"
          >
            Change Photo
          </button>
        </div>

        {/* Right: 2-Column Form Fields */}
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* First Name */}
            <div>
              <label
                htmlFor="edit-firstName"
                className="block text-[14px] font-medium text-[#0F172A] mb-2"
              >
                First Name <span className="text-[#DC2626]">*</span>
              </label>
              <input
                id="edit-firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange("firstName")}
                placeholder="Enter first name"
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.firstName)}
                className={getInputClasses(Boolean(errors.firstName))}
              />
              {errors.firstName && (
                <p className="mt-1.5 text-[12px] text-[#DC2626]">
                  {errors.firstName}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label
                htmlFor="edit-lastName"
                className="block text-[14px] font-medium text-[#0F172A] mb-2"
              >
                Last Name <span className="text-[#DC2626]">*</span>
              </label>
              <input
                id="edit-lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange("lastName")}
                placeholder="Enter last name"
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.lastName)}
                className={getInputClasses(Boolean(errors.lastName))}
              />
              {errors.lastName && (
                <p className="mt-1.5 text-[12px] text-[#DC2626]">
                  {errors.lastName}
                </p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label
                htmlFor="edit-email"
                className="block text-[14px] font-medium text-[#0F172A] mb-2"
              >
                Email Address <span className="text-[#DC2626]">*</span>
              </label>
              <input
                id="edit-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange("email")}
                placeholder="user@nemblo.com"
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.email)}
                className={getInputClasses(Boolean(errors.email))}
              />
              {errors.email && (
                <p className="mt-1.5 text-[12px] text-[#DC2626]">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label
                htmlFor="edit-phone"
                className="block text-[14px] font-medium text-[#0F172A] mb-2"
              >
                Phone Number
              </label>
              <input
                id="edit-phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange("phone")}
                placeholder="+234 801 234 5678"
                disabled={isSubmitting}
                className={getInputClasses(false)}
              />
            </div>

            {/* Department */}
            <div>
              <label
                htmlFor="edit-departmentId"
                className="block text-[14px] font-medium text-[#0F172A] mb-2"
              >
                Department
              </label>
              <div className="relative">
                <select
                  id="edit-departmentId"
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleChange("departmentId")}
                  disabled={isSubmitting || departmentsLoading}
                  className={`w-full h-[46px] pl-4 pr-10 rounded-[8px] border border-[#CBD5E1] bg-white text-[14px] appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1E3247]/20 focus:border-[#1E3247] disabled:opacity-60 disabled:cursor-not-allowed ${
                    formData.departmentId ? "text-[#0F172A]" : "text-[#64748B]"
                  }`}
                >
                  <option value="">
                    {departmentsLoading
                      ? "Loading departments..."
                      : "Select department"}
                  </option>
                  {departments.map((dept) => (
                    <option
                      key={dept.id}
                      value={dept.id}
                      className="text-[#0F172A]"
                    >
                      {dept.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="w-4 h-4 text-[#0F172A] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
              </div>
            </div>

            {/* Job Title */}
            <div>
              <label
                htmlFor="edit-jobTitle"
                className="block text-[14px] font-medium text-[#0F172A] mb-2"
              >
                Job Title
              </label>
              <div className="relative">
                <select
                  id="edit-jobTitle"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange("jobTitle")}
                  disabled={isSubmitting}
                  className={`w-full h-[46px] pl-4 pr-10 rounded-[8px] border border-[#CBD5E1] bg-white text-[14px] appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1E3247]/20 focus:border-[#1E3247] disabled:opacity-60 disabled:cursor-not-allowed ${
                    formData.jobTitle ? "text-[#0F172A]" : "text-[#64748B]"
                  }`}
                >
                  <option value="">Select job title</option>
                  {jobTitleOptions.map((title) => (
                    <option
                      key={title}
                      value={title}
                      className="text-[#0F172A]"
                    >
                      {title}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="w-4 h-4 text-[#0F172A] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-12 sm:mt-16 flex items-center justify-end gap-3.5">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="h-[42px] px-5 rounded-[8px] border border-[#94A3B8] bg-white hover:bg-[#F8FAFC] text-[13px] font-medium text-[#1E293B] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3247]/30 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-[42px] px-5 rounded-[8px] bg-[#1E3247] hover:bg-[#162638] active:bg-[#101D2B] text-[13px] font-medium text-white inline-flex items-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3247]/40 disabled:opacity-70"
            >
              {isSubmitting && <LoaderCircle className="w-4 h-4 animate-spin" />}
              <span>{isSubmitting ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

export default EditEmployeeForm;