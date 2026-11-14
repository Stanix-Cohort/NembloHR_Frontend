import { useState } from 'react';
import { User, Lock, Eye, EyeOff, ArrowRight, Check } from 'lucide-react';

function LoginForm({ onSubmit }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (onSubmit) {
      onSubmit({ username, password, rememberMe });
    }
  };

  return (
    <section
      aria-label="Admin Login Form"
      className="w-full lg:w-1/2 bg-white flex items-center justify-center px-6 py-12 sm:px-12 lg:px-12 xl:px-[72px]"
    >
      <div className="w-full max-w-[576px]">
        {/* Header */}
        <div>
          <h2 className="text-[32px] sm:text-[38px] xl:text-[42px] leading-[1.15] font-bold tracking-[-0.02em] text-[#171E29]">
            Admin Login
          </h2>
          <p className="mt-3 text-[17px] sm:text-[19px] xl:text-[21px] leading-[1.4] font-normal text-[#1E2530]">
            Sign in to continue to your dashboard
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-9 sm:mt-11 xl:mt-12" noValidate>
          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className="block text-[16px] xl:text-[18px] font-medium text-[#171E29] mb-2.5"
            >
              Username
            </label>
            <div className="relative">
              <User
                className="w-[18px] h-[18px] text-[#374151] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                strokeWidth={1.6}
                aria-hidden="true"
              />
              <input
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                autoComplete="username"
                className="w-full h-[54px] pl-11 pr-4 rounded-[12px] border border-[#2B3440] bg-white text-[16px] text-[#171E29] placeholder:text-[#3D4654] focus:outline-none focus:ring-2 focus:ring-[#233B53]/20 focus:border-[#233B53]"
              />
            </div>
          </div>

          {/* Password */}
          <div className="mt-6 xl:mt-7">
            <label
              htmlFor="password"
              className="block text-[16px] xl:text-[18px] font-medium text-[#171E29] mb-2.5"
            >
              Password
            </label>
            <div className="relative">
              <Lock
                className="w-[18px] h-[18px] text-[#374151] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                strokeWidth={1.6}
                aria-hidden="true"
              />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                className="w-full h-[54px] pl-11 pr-12 rounded-[12px] border border-[#2B3440] bg-white text-[16px] text-[#171E29] placeholder:text-[#3D4654] focus:outline-none focus:ring-2 focus:ring-[#233B53]/20 focus:border-[#233B53]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1F2937] hover:text-[#233B53] focus:outline-none cursor-pointer"
              >
                {showPassword ? (
                  <Eye className="w-5 h-5" strokeWidth={1.7} />
                ) : (
                  <EyeOff className="w-5 h-5" strokeWidth={1.7} />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me & Need Help */}
          <div className="mt-6 xl:mt-7 flex items-center justify-between gap-4">
            <label
              htmlFor="remember-me"
              className="inline-flex items-center gap-3 cursor-pointer select-none"
            >
              <input
                id="remember-me"
                name="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="peer sr-only"
              />
              <span
                className="w-[26px] h-[26px] rounded-[6px] border border-[#2B3440] bg-white flex items-center justify-center peer-checked:bg-[#233B53] peer-checked:border-[#233B53] peer-focus-visible:ring-2 peer-focus-visible:ring-[#233B53]/30"
                aria-hidden="true"
              >
                {rememberMe && (
                  <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
                )}
              </span>
              <span className="text-[16px] xl:text-[17px] text-[#1E2530]">
                Remember me
              </span>
            </label>

            <a
              href="#need-help"
              onClick={(e) => e.preventDefault()}
              className="text-[16px] xl:text-[17px] text-[#233B53] hover:underline"
            >
              Need help?
            </a>
          </div>

          {/* Sign In Button */}
          <div className="mt-10 sm:mt-12 xl:mt-14">
            <button
              type="submit"
              className="w-full h-[54px] rounded-[12px] bg-[#233B53] hover:bg-[#1B2F44] active:bg-[#162739] text-white text-[18px] xl:text-[20px] font-medium flex items-center justify-center gap-3 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#233B53]/40"
            >
              <span>Sign in</span>
              <ArrowRight className="w-5 h-5" strokeWidth={1.8} />
            </button>
          </div>
        </form>

        {/* Footer Links */}
        <footer className="mt-10 xl:mt-14 text-center text-[15px] text-[#233B53]">
          <a
            href="#privacy-policy"
            onClick={(e) => e.preventDefault()}
            className="hover:underline"
          >
            Privacy Policy
          </a>
          <span> &amp; </span>
          <a
            href="#terms-of-service"
            onClick={(e) => e.preventDefault()}
            className="hover:underline"
          >
            Term
          </a>
        </footer>
      </div>
    </section>
  );
}

export default LoginForm;