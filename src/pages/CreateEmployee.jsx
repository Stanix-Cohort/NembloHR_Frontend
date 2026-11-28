import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import Sidebar from "../layouts/Sidebar";
import DashboardHeader from "../layouts/DashboardHeader";
import CreateEmployeeForm from "../components/dashboard/CreateEmployeeForm";
import EmployeeCreatedModal from "../components/dashboard/EmployeeCreatedModal";
import AddDepartmentModal from "../components/dashboard/AddDepartmentModal";
import { useAuth } from "../context/auth-context";
import {
  createDepartment,
  createEmployee,
  getDepartments,
} from "../services/employeeService";
import { getApiErrorMessage } from "../utils/apiError";

function CreateEmployee() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [departments, setDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  const [departmentsError, setDepartmentsError] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");

  const [isAddDeptOpen, setIsAddDeptOpen] = useState(false);
  const [isSavingDept, setIsSavingDept] = useState(false);
  const [deptError, setDeptError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [createdResult, setCreatedResult] = useState(null);

  const resetFormRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    getDepartments()
      .then((list) => {
        if (isMounted) setDepartments(list);
      })
      .catch((err) => {
        if (isMounted) {
          setDepartmentsError(
            getApiErrorMessage(err, "Unable to load departments."),
          );
        }
      })
      .finally(() => {
        if (isMounted) setDepartmentsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleBack = () => {
    navigate("/admin/employees");
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const handleSidebarNavigate = (item) => {
    if (item.id === "dashboard" || item.id === "employees" || item.id === "assets") {
      navigate(item.path);
    }
  };

  const handleSaveDepartment = async (departmentName) => {
    setDeptError("");
    setIsSavingDept(true);

    try {
      const createdDept = await createDepartment({ name: departmentName });
      const refreshedList = await getDepartments();
      setDepartments(refreshedList);

      const matchedDept =
        refreshedList.find((dept) => dept.id === createdDept?.id) ||
        refreshedList.find(
          (dept) =>
            dept.name?.toLowerCase() === departmentName.trim().toLowerCase(),
        );

      if (matchedDept?.id) {
        setSelectedDepartmentId(matchedDept.id);
      }

      setIsAddDeptOpen(false);
      return true;
    } catch (err) {
      setDeptError(getApiErrorMessage(err, "Unable to create department."));
      return false;
    } finally {
      setIsSavingDept(false);
    }
  };

  const handleCreateSubmit = async (payload, { departmentName, resetForm }) => {
    setServerError("");
    setIsSubmitting(true);
    resetFormRef.current = resetForm;

    try {
      const data = await createEmployee(payload);
      const employee = data?.employee ?? data;
      const credentials = data?.credentials ?? data;

      setCreatedResult({
        employeeName: employee?.fullName || payload.fullName,
        departmentName:
          employee?.department?.name ||
          employee?.departmentName ||
          departmentName,
        username:
          credentials?.username ||
          employee?.username ||
          employee?.workEmail ||
          payload.workEmail,
        temporaryPassword:
          credentials?.temporaryPassword ||
          data?.temporaryPassword ||
          credentials?.password ||
          "",
      });
    } catch (err) {
      setServerError(
        getApiErrorMessage(
          err,
          "Unable to create employee. Please check your input and try again.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAnother = () => {
    setCreatedResult(null);
    setServerError("");
    if (resetFormRef.current) {
      resetFormRef.current();
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#F8FAFC] overflow-x-hidden">
      <Sidebar
        activeRoute="employees"
        onNavigate={handleSidebarNavigate}
        onLogout={handleLogout}
        user={user}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <DashboardHeader
          breadcrumbs={[
            { label: "Admin" },
            { label: "Employees", onClick: handleBack },
            { label: "Create Employee" },
          ]}
          user={user}
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-9 lg:py-7">
          <div className="w-full">
            {/* Page Title & Back Button */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-[28px] sm:text-[32px] font-bold tracking-[-0.02em] text-[#0F172A] leading-tight">
                  Create Employee
                </h1>
                <p className="mt-1 text-[13px] font-normal text-[#64748B]">
                  Add a new member to your organization.
                </p>
              </div>

              <button
                type="button"
                onClick={handleBack}
                className="h-[38px] px-4 rounded-[8px] border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-[13px] font-medium text-[#1E293B] inline-flex items-center gap-1.5 shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3247]/30"
              >
                <ChevronLeft className="w-4 h-4" strokeWidth={1.75} />
                <span>Back</span>
              </button>
            </div>

            {/* Form Card */}
            <div className="mt-6">
              <CreateEmployeeForm
                departments={departments}
                departmentsLoading={departmentsLoading}
                departmentsError={departmentsError}
                selectedDepartmentId={selectedDepartmentId}
                onDepartmentChange={setSelectedDepartmentId}
                onAddNewDepartment={() => {
                  setDeptError("");
                  setIsAddDeptOpen(true);
                }}
                isSubmitting={isSubmitting}
                serverError={serverError}
                onCancel={handleBack}
                onSubmit={handleCreateSubmit}
              />
            </div>
          </div>
        </main>
      </div>

      <AddDepartmentModal
        isOpen={isAddDeptOpen}
        isSubmitting={isSavingDept}
        serverError={deptError}
        onClose={() => setIsAddDeptOpen(false)}
        onSave={handleSaveDepartment}
      />

      <EmployeeCreatedModal
        isOpen={Boolean(createdResult)}
        employeeName={createdResult?.employeeName}
        departmentName={createdResult?.departmentName}
        username={createdResult?.username}
        temporaryPassword={createdResult?.temporaryPassword}
        onDone={handleBack}
        onCreateAnother={handleCreateAnother}
      />
    </div>
  );
}

export default CreateEmployee;