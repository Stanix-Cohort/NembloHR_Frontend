import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import DepartmentSelect from "./DepartmentSelect";

const INITIAL_FORM_STATE = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  jobTitle: "",
};

function CreateEmployeeForm({
  departments = [],
  departmentsLoading = false,
  departmentsError = "",
  selectedDepartmentId = "",
  onDepartmentChange,
  onAddNewDepartment,
  isSubmitting = false,
  serverError = "",
  onCancel,
  onSubmit,
}) {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});

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

    const today = new Date().toISOString().split("T")[0];

    const payload = {
      fullName: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
      workEmail: formData.email.trim(),
      startDate: today,
      ...(formData.phone.trim() ? { phone: formData.phone.trim() } : {}),
      ...(selectedDepartmentId ? { departmentId: selectedDepartmentId } : {}),
      ...(formData.jobTitle.trim()
        ? { jobTitle: formData.jobTitle.trim() }
        : {}),
    };

    const selectedDepartment = departments.find(
      (dept) => dept.id === selectedDepartmentId,
    );

    if (onSubmit) {
      onSubmit(payload, {
        departmentName: selectedDepartment?.name || "",
        resetForm: () => {
          setFormData(INITIAL_FORM_STATE);
          setErrors({});
          if (onDepartmentChange) onDepartmentChange("");
        },
      });
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
      className="bg-white border border-[#E2E8F0] rounded-[12px] p-6 sm:p-8"
    >
      <h2 className="text-[18px] font-bold text-[#0F172A] leading-snug">
        Personal Information
      </h2>

      {serverError && (
        <div
          role="alert"
          className="mt-4 rounded-[8px] bg-red-50 border border-red-200 px-4 py-3 text-[13px] text-red-700"
        >
          {serverError}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {/* First Name */}
        <div>
          <label
            htmlFor="firstName"
            className="block text-[14px] font-medium text-[#0F172A] mb-2"
          >
            First Name <span className="text-[#DC2626]">*</span>
          </label>
          <input
            id="firstName"
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
            htmlFor="lastName"
            className="block text-[14px] font-medium text-[#0F172A] mb-2"
          >
            Last Name <span className="text-[#DC2626]">*</span>
          </label>
          <input
            id="lastName"
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
            htmlFor="email"
            className="block text-[14px] font-medium text-[#0F172A] mb-2"
          >
            Email Address <span className="text-[#DC2626]">*</span>
          </label>
          <input
            id="email"
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
            <p className="mt-1.5 text-[12px] text-[#DC2626]">{errors.email}</p>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <label
            htmlFor="phone"
            className="block text-[14px] font-medium text-[#0F172A] mb-2"
          >
            Phone Number
          </label>
          <input
            id="phone"
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
            htmlFor="departmentId"
            className="block text-[14px] font-medium text-[#0F172A] mb-2"
          >
            Department
          </label>
          <DepartmentSelect
            id="departmentId"
            value={selectedDepartmentId}
            onChange={onDepartmentChange}
            departments={departments}
            loading={departmentsLoading}
            disabled={isSubmitting}
            onAddNewDepartment={onAddNewDepartment}
          />
          {departmentsError && (
            <p className="mt-1.5 text-[12px] text-[#DC2626]">
              {departmentsError}
            </p>
          )}
        </div>

        {/* Job Title */}
        <div>
          <label
            htmlFor="jobTitle"
            className="block text-[14px] font-medium text-[#0F172A] mb-2"
          >
            Job Title
          </label>
          <input
            id="jobTitle"
            name="jobTitle"
            type="text"
            value={formData.jobTitle}
            onChange={handleChange("jobTitle")}
            placeholder="Enter job title"
            disabled={isSubmitting}
            className={getInputClasses(false)}
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="mt-12 sm:mt-16 flex items-center justify-end gap-3.5">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="h-[42px] px-5 rounded-[8px] border border-[#94A3B8] bg-white hover:bg-[#F8FAFC] text-[13px] font-medium text-[#1E293B] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3247]/30 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="h-[42px] px-5 rounded-[8px] bg-[#1E3247] hover:bg-[#162638] active:bg-[#101D2B] text-[13px] font-medium text-white inline-flex items-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3247]/40 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting && <LoaderCircle className="w-4 h-4 animate-spin" />}
          <span>{isSubmitting ? "Creating..." : "Create Employee"}</span>
        </button>
      </div>
    </form>
  );
}

export default CreateEmployeeForm;