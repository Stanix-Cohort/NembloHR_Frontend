import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import Sidebar from '../layouts/Sidebar';
import DashboardHeader from '../layouts/DashboardHeader';
import CreateEmployeeForm from '../components/dashboard/CreateEmployeeForm';

function CreateEmployee({ onBack, onNavigate }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleSidebarNavigate = (item) => {
    if (item.id === 'employees' && onBack) {
      onBack();
      return;
    }
    if (onNavigate) {
      onNavigate(item);
    }
  };

  const handleCreateSubmit = (formData) => {
    // Placeholder handler until backend employee creation API is connected
    console.log('Create employee payload:', formData);
  };

  return (
    <div className="min-h-screen w-full flex bg-[#F8FAFC] overflow-x-hidden">
      <Sidebar
        activeRoute="employees"
        onNavigate={handleSidebarNavigate}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <DashboardHeader
          breadcrumbs={[
            { label: 'Admin' },
            { label: 'Employees', onClick: onBack },
            { label: 'Create Employee' },
          ]}
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
                onClick={onBack}
                className="h-[38px] px-4 rounded-[8px] border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-[13px] font-medium text-[#1E293B] inline-flex items-center gap-1.5 shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3247]/30"
              >
                <ChevronLeft className="w-4 h-4" strokeWidth={1.75} />
                <span>Back</span>
              </button>
            </div>

            {/* Form Card */}
            <div className="mt-6">
              <CreateEmployeeForm
                onCancel={onBack}
                onSubmit={handleCreateSubmit}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default CreateEmployee;