import { Users, Plus } from 'lucide-react';

function EmptyState({ onAddEmployee }) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[12px] px-6 py-16 sm:py-20 flex flex-col items-center justify-center text-center min-h-[340px]">
      <div className="w-14 h-14 rounded-full bg-[#DCE1E7] flex items-center justify-center text-[#1E3247]">
        <Users className="w-6 h-6" strokeWidth={1.6} aria-hidden="true" />
      </div>

      <h2 className="mt-5 text-[20px] font-bold text-[#0F172A] leading-snug">
        No employees added yet
      </h2>

      <p className="mt-2 text-[14px] leading-[1.55] text-[#475569] max-w-[440px]">
        Your employee directory is currently empty.
        <br />
        Add your first employee to start managing your workforce.
      </p>

      <button
        type="button"
        onClick={onAddEmployee}
        className="mt-6 h-[42px] px-5 rounded-[8px] bg-[#1E3247] hover:bg-[#162638] active:bg-[#101D2B] text-white text-[13px] font-medium inline-flex items-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3247]/40"
      >
        <Plus className="w-4 h-4" strokeWidth={2} />
        <span>Add Your First Employee</span>
      </button>
    </div>
  );
}

export default EmptyState;