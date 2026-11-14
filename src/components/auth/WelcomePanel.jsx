import { Users, CalendarDays, ShieldCheck } from 'lucide-react';
import nembloLogo from '../../assets/nemblo-logo.png';
import hrIllustration from '../../assets/hr-illustration.png';

const FEATURE_HIGHLIGHTS = [
  {
    id: 'employees',
    Icon: Users,
    line1: 'Manage',
    line2: 'Employees',
  },
  {
    id: 'attendance',
    Icon: CalendarDays,
    line1: 'Track',
    line2: 'Attendance',
  },
  {
    id: 'leave-assets',
    Icon: ShieldCheck,
    line1: 'Oversee',
    line2: 'Leave & Assets',
  },
];

function WelcomePanel({
  logoSrc = nembloLogo,
  illustrationSrc = hrIllustration,
}) {
  return (
    <section
      aria-label="Nemblo HR Overview"
      className="w-full lg:w-1/2 bg-[#D1D7DD] flex flex-col justify-center px-6 py-10 sm:px-12 lg:px-12 xl:px-[62px] xl:py-16"
    >
      <div className="w-full max-w-[596px] mx-auto">
        {/* Brand Logo & Wordmark */}
        <div className="flex items-center gap-3">
          <img
            src={logoSrc}
            alt="Nemblo logo"
            className="w-11 h-11 rounded-[10px] object-contain shrink-0 select-none"
          />
          <span className="text-[28px] xl:text-[30px] leading-none tracking-[-0.02em] font-semibold text-[#0B0F15]">
            Nemblo{' '}
            <span className="font-semibold text-[#233B53]">HR</span>
          </span>
        </div>

        {/* Heading & Description */}
        <div className="mt-10 sm:mt-12 xl:mt-[72px]">
          <h1 className="text-[38px] sm:text-[48px] xl:text-[56px] leading-[1.12] font-bold tracking-[-0.025em] text-[#171E29]">
            Welcome Back,
            <br />
            Admin!
          </h1>
          <p className="mt-5 xl:mt-6 max-w-[430px] text-[18px] sm:text-[20px] xl:text-[22px] leading-[1.35] font-normal text-[#1E2530]">
            Access your HR dashboard and manage your organization with ease.
          </p>
        </div>

        {/* HR Illustration */}
        <div className="mt-9 sm:mt-11 xl:mt-14">
          <img
            src={illustrationSrc}
            alt="HR management illustration"
            className="w-full h-auto block select-none"
          />
        </div>

        {/* Three Feature Highlights */}
        <div className="mt-8 xl:mt-10 grid grid-cols-3 gap-3 sm:gap-6">
          {FEATURE_HIGHLIGHTS.map(({ id, Icon, line1, line2 }) => (
            <div key={id} className="flex flex-col items-center text-center">
              <div className="w-[30px] h-[30px] rounded-[6px] bg-[#22354B] flex items-center justify-center text-white">
                <Icon className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <p className="mt-2 text-[12px] sm:text-[13px] leading-[1.3] font-semibold text-[#1F2733]">
                {line1}
                <br />
                {line2}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WelcomePanel;