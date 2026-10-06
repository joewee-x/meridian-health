import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { 
    initiateLogin, 
    initiateRegister, 
    verifyMfa, 
    mfaPending, 
    cancelMfa, 
    demoAccounts,
    getPortalPath 
  } = useAuth();

  // Mode: 'login' | 'signup'
  const isSignupRoute =
    location.pathname === '/signup' || searchParams.get('mode') === 'signup';
  const [mode, setMode] = useState(isSignupRoute ? 'signup' : 'login');

  // Keep mode in sync with the URL so the app chrome (navbar/footer) can react
  useEffect(() => {
    const nextMode =
      location.pathname === '/signup' || searchParams.get('mode') === 'signup'
        ? 'signup'
        : 'login';
    setMode((prev) => (prev === nextMode ? prev : nextMode));
  }, [location.pathname, searchParams]);

  const goToSignup = () => {
    setErrorMessage('');
    setMode('signup');
    if (location.pathname !== '/signup') navigate('/signup');
  };

  const goToLogin = () => {
    setErrorMessage('');
    setMode('login');
    if (location.pathname !== '/login') navigate('/login');
  };

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');

  // Status & error states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  // MFA 6-digit input boxes state
  const [mfaDigits, setMfaDigits] = useState(['', '', '', '', '', '']);
  const digitInputRefs = useRef([]);
  const [resendCooldown, setResendCooldown] = useState(45);

  // If role query parameter was passed (e.g. from footer link /login?role=provider)
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam) {
      const match = demoAccounts.find((a) => a.role === roleParam);
      if (match) {
        setEmail(match.email);
        setPassword(match.password);
      }
    }
  }, [searchParams, demoAccounts]);

  // MFA timer countdown
  useEffect(() => {
    let timer;
    if (mfaPending && resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [mfaPending, resendCooldown]);

  // Handle Step 1: Login Submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await initiateLogin({ email, password });
      setResendCooldown(45);
      // Automatically focus first digit input on next tick
      setTimeout(() => {
        digitInputRefs.current[0]?.focus();
      }, 100);
    } catch (err) {
      setErrorMessage(err.message || 'Unable to sign in. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Step 1b: Sign Up Submission
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!fullName.trim() || !email.trim() || !password || !dob) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      await initiateRegister({
        name: fullName,
        email,
        password,
        dateOfBirth: dob,
      });
      setResendCooldown(45);
      setTimeout(() => {
        digitInputRefs.current[0]?.focus();
      }, 100);
    } catch (err) {
      setErrorMessage(err.message || 'Unable to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle MFA 6-digit box changes with auto-advance
  const handleDigitChange = (index, value) => {
    const cleaned = value.replace(/\D/g, '');
    
    // Support paste of entire 6-digit string
    if (cleaned.length > 1) {
      const newDigits = [...mfaDigits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = cleaned[i] || '';
      }
      setMfaDigits(newDigits);
      const nextIndex = Math.min(cleaned.length, 5);
      digitInputRefs.current[nextIndex]?.focus();
      return;
    }

    const newDigits = [...mfaDigits];
    newDigits[index] = cleaned;
    setMfaDigits(newDigits);

    // Auto-advance to next box
    if (cleaned && index < 5) {
      digitInputRefs.current[index + 1]?.focus();
    }
  };

  const handleDigitKeyDown = (index, e) => {
    // Backspace: clear and jump back
    if (e.key === 'Backspace' && !mfaDigits[index] && index > 0) {
      digitInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle Step 2: MFA Verification Submission
  const handleMfaSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    const fullCode = mfaDigits.join('');

    if (fullCode.length !== 6) {
      setErrorMessage('Please enter all 6 digits of your verification code.');
      return;
    }

    setIsSubmitting(true);
    try {
      const authedUser = await verifyMfa(fullCode);
      // Redirect to intended page or user's designated portal
      const from = location.state?.from;
      const destination = from?.pathname ? `${from.pathname}${from.search || ''}` : getPortalPath(authedUser.role);
      navigate(destination, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Invalid verification code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick fill helper for demo grading
  const handleDemoFill = (demoUser) => {
    setMode('login');
    setEmail(demoUser.email);
    setPassword(demoUser.password);
    setErrorMessage('');
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
      
      {/* Container Box */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">

        {/* Back to landing page (auth screen has no navbar) */}
        <div className="mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 hover:text-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back
          </Link>
        </div>

        {/* Brand link back to home */}
        <div className="text-center mb-6">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded-lg p-1"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm shadow-teal-600/20">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Meridian <span className="text-teal-700">Health</span>
            </span>
          </Link>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Secure Role-Based Health Portal
          </p>
        </div>

        {/* Card Frame */}
        <div className="bg-white py-8 px-5 shadow-xs border border-slate-200/90 rounded-2xl sm:px-10 relative">
          
          {/* ========================================================================= */}
          {/* VIEW A: MFA VERIFICATION SCREEN (STEP 2) */}
          {/* ========================================================================= */}
          {mfaPending ? (
            <div>
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-slate-900">Security Verification</h2>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  We sent a 6-digit code to your registered device ending in <strong className="text-slate-900 font-semibold">{mfaPending.maskedPhone}</strong>
                </p>
              </div>

              {/* Demo Hint Banner */}
              <div className="mb-6 p-3 bg-teal-50/70 border border-teal-200/80 rounded-xl text-xs text-teal-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse"></span>
                  <span>Demo Code: <strong className="font-mono font-bold tracking-wider">123456</strong></span>
                </div>
                <button
                  type="button"
                  onClick={() => setMfaDigits(['1', '2', '3', '4', '5', '6'])}
                  className="underline hover:text-teal-950 font-semibold cursor-pointer"
                >
                  Auto-fill
                </button>
              </div>

              {errorMessage && (
                <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5">
                  <svg className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleMfaSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider text-center mb-3">
                    Enter 6-Digit Code
                  </label>
                  
                  {/* 6 Digit Input Grid */}
                  <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                    {mfaDigits.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (digitInputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleDigitChange(index, e.target.value)}
                        onKeyDown={(e) => handleDigitKeyDown(index, e)}
                        className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/30 transition-all outline-none"
                        aria-label={`Digit ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 active:bg-teal-900 rounded-xl shadow-xs transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Confirm & Enter Portal</span>
                  )}
                </button>

                <div className="pt-3 flex items-center justify-between text-xs text-slate-500">
                  <button
                    type="button"
                    onClick={cancelMfa}
                    className="hover:text-slate-800 font-medium cursor-pointer"
                  >
                    ← Back to Sign In
                  </button>

                  <button
                    type="button"
                    disabled={resendCooldown > 0}
                    onClick={() => {
                      setResendCooldown(45);
                      setSuccessNotice('New simulated verification code sent.');
                      setTimeout(() => setSuccessNotice(''), 3000);
                    }}
                    className={`font-semibold cursor-pointer ${
                      resendCooldown > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-teal-700 hover:text-teal-800'
                    }`}
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                  </button>
                </div>

                {successNotice && (
                  <p className="text-center text-xs text-emerald-700 font-medium">{successNotice}</p>
                )}
              </form>
            </div>
          ) : (
            /* ========================================================================= */
            /* VIEW B: PRIMARY AUTH SCREEN (LOGIN OR SIGN UP) */
            /* ========================================================================= */
            <div>
              {/* Clean Single-Action Tabs */}
              <div className="flex border-b border-slate-200 mb-6" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'login'}
                  onClick={goToLogin}
                  className={`flex-1 pb-3 text-center text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                    mode === 'login'
                      ? 'border-teal-600 text-teal-800'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'signup'}
                  onClick={goToSignup}
                  className={`flex-1 pb-3 text-center text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                    mode === 'signup'
                      ? 'border-teal-600 text-teal-800'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Create Patient Account
                </button>
              </div>

              {/* Error Callout */}
              {errorMessage && (
                <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5">
                  <svg className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <span className="font-semibold block">{errorMessage}</span>
                    {errorMessage.includes("couldn't find") && (
                      <button
                        type="button"
                        onClick={goToSignup}
                        className="text-teal-700 underline font-semibold mt-1 inline-block"
                      >
                        Create an account with this email →
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* FORM: LOGIN */}
              {mode === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label 
                      htmlFor="login-email" 
                      className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                    >
                      Email Address
                    </label>
                    <input
                      id="login-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. name@example.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 transition-all outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label 
                        htmlFor="login-password" 
                        className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
                      >
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => alert('For this assignment demo, passwords for all seeded accounts are: password123')}
                        className="text-xs text-teal-700 hover:text-teal-800 font-medium"
                      >
                        Forgot?
                      </button>
                    </div>
                    <input
                      id="login-password"
                      type="password"
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 transition-all outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-2 py-3 px-4 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 active:bg-teal-900 rounded-xl shadow-xs transition-colors disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Verifying credentials...</span>
                      </>
                    ) : (
                      <span>Continue to Security Check</span>
                    )}
                  </button>
                </form>
              ) : (
                /* FORM: SIGN UP */
                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  <div>
                    <label 
                      htmlFor="signup-name" 
                      className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                    >
                      Legal Full Name
                    </label>
                    <input
                      id="signup-name"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="First and last name"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 transition-all outline-none"
                    />
                  </div>

                  <div>
                    <label 
                      htmlFor="signup-dob" 
                      className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                    >
                      Date of Birth
                    </label>
                    <input
                      id="signup-dob"
                      type="date"
                      required
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 transition-all outline-none"
                    />
                  </div>

                  <div>
                    <label 
                      htmlFor="signup-email" 
                      className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                    >
                      Email Address
                    </label>
                    <input
                      id="signup-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 transition-all outline-none"
                    />
                  </div>

                  <div>
                    <label 
                      htmlFor="signup-password" 
                      className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                    >
                      Create Password (min. 8 characters)
                    </label>
                    <input
                      id="signup-password"
                      type="password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 transition-all outline-none"
                    />
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                    By registering, you agree to receive medical notices and accept our simulated HIPAA privacy terms.
                  </p>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 active:bg-teal-900 rounded-xl shadow-xs transition-colors disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Creating account...</span>
                      </>
                    ) : (
                      <span>Create Account & Verify</span>
                    )}
                  </button>
                </form>
              )}

              {/* DEMO ACCOUNTS QUICK-FILL HELPER */}
              <div className="mt-8 pt-5 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Assignment Demo Accounts
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">pwd: password123</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {demoAccounts.map((account) => (
                    <button
                      key={account.role}
                      type="button"
                      onClick={() => handleDemoFill(account)}
                      className="text-left p-2 rounded-lg border border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 transition-all text-xs cursor-pointer group"
                    >
                      <span className="block font-bold text-slate-800 capitalize group-hover:text-teal-900">
                        {account.role}
                      </span>
                      <span className="text-[10px] text-slate-500 truncate block">
                        {account.name.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Security reassurance footnote */}
        <div className="mt-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <svg className="w-3.5 h-3.5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Simulated 256-Bit SSL Encrypted Verification</span>
        </div>

      </div>

    </div>
  );
}
