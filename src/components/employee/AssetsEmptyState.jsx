import { Briefcase } from "lucide-react";

function AssetsEmptyState() {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[12px] px-6 py-20 sm:py-28 flex flex-col items-center justify-center text-center min-h-[480px] sm:min-h-[520px]">
      <div className="w-16 h-16 rounded-full bg-[#DCE1E7] flex items-center justify-center text-[#1E3247]">
        <Briefcase className="w-7 h-7" strokeWidth={1.5} aria-hidden="true" />
      </div>

      <h2 className="mt-5 text-[20px] font-bold text-[#0F172A] leading-snug">
        No assets assigned yet
      </h2>

      <p className="mt-2 text-[14px] leading-[1.55] text-[#64748B] max-w-[380px]">
        You currently don’t have any company assets assigned to your account.
        Any asset assigned to you will appear here.
      </p>
    </div>
  );
}

export default AssetsEmptyState;