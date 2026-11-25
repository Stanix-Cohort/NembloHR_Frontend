import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, LoaderCircle } from "lucide-react";
import Sidebar from "../layouts/Sidebar";
import DashboardHeader from "../layouts/DashboardHeader";
import EditEmployeeForm from "../components/dashboard/EditEmployeeForm";
import { useAuth } from "../context/auth-context";
import {
  getDepartments,
  getEmployeeById,
  updateEmployee,
} from "../services/employeeService";
import { getApiErrorMessage } from "../utils/apiError";

function EditEmployee() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [employee, setEmployee] = useState(
    () => location.state?.employee || null,
  );
  const [isLoading, setIsLoading] = useState(
    () => !location.state?.employee && Boolean(id),
  );
  const [loadError, setLoadError] = useState("");

  const [departments, setDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    let isMounted = true;

    getDepartments()
      .then((list) => {
        if (isMounted) setDepartments(list);
      })
      .catch(() => {
        // Leave dropdown gracefully empty on error
      })
      .finally(() => {
        if (isMounted) setDepartmentsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (employee || !id) return;

    let isMounted = true;

    getEmployeeById(id)
      .then((record) => {
        if (isMounted) {
          setEmployee(record);
          setLoadError("");
        }
      })
      .catch((err) => {
        if (isMounted) {
          setLoadError(
            getApiErrorMessage(err, "Unable to load employee details."),
          );
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, employee]);

  const handleBack = () => {
    navigate("/admin/employees");
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const handleSaveChanges = async (payload) => {
    if (Object.keys(payload).length === 0) {
      navigate("/admin/employees");
      return;
    }

    setSaveError("");
    setIsSubmitting(true);

    try {
      await updateEmployee(id, payload);
      navigate("/admin/employees");
    } catch (err) {
      setSaveError(
        getApiErrorMessage(
          err,
          "Unable to update employee. Please check your input and try again.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#F8FAFC] overflow-x-hidden">
      <Sidebar
        activeRoute="employees"
        onNavigate={(item) => {
          if (item.id === "employees" || item.id === "assets") {
            navigate(item.path);
          }
        }}
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
            { label: "Edit Employee" },
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
                  Edit Employee
                </h1>
                <p className="mt-1 text-[13px] font-normal text-[#64748B]">
                  Update the employee information
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

            {/* Content */}
            <div className="mt-6">
              {isLoading ? (
                <div className="bg-white border border-[#E2E8F0] rounded-[12px] py-20 flex flex-col items-center justify-center text-[#64748B]">
                  <LoaderCircle className="w-6 h-6 animate-spin mb-2" />
                  <p className="text-[13px]">Loading employee information...</p>
                </div>
              ) : loadError ? (
                <div
                  role="alert"
                  className="bg-white border border-red-200 rounded-[12px] p-6 text-[13px] text-red-700"
                >
                  {loadError}
                </div>
              ) : (
                <EditEmployeeForm
                  key={employee?.id || id}
                  employee={employee}
                  departments={departments}
                  departmentsLoading={departmentsLoading}
                  isSubmitting={isSubmitting}
                  serverError={saveError}
                  onCancel={handleBack}
                  onSubmit={handleSaveChanges}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default EditEmployee;