import React, { useState, useMemo } from 'react';
import {
  Globe,
  Lock,
  Mail,
  User,
  Phone,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Zap,
  Check,
  LogIn,
  UserPlus,
  HelpCircle,
  TrendingUp,
  Shield,
  X,
  AlertTriangle,
  Flame,
  CheckCircle
} from 'lucide-react';
import { auth, AuthSession, validateEmailFormat, checkPasswordStrength } from '../services/auth';
import { storage } from '../services/storage';
import confetti from 'canvas-confetti';

interface LandingAuthViewProps {
  onAuthSuccess: (session: AuthSession) => void;
}

type AuthMode = 'login' | 'signup' | 'forgot_password';

interface AlertPopupState {
  isOpen: boolean;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const LandingAuthView: React.FC<LandingAuthViewProps> = ({
  onAuthSuccess
}) => {
  const [mode, setMode] = useState<AuthMode>('login');

  // Login form state - demanding username and passwords
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Sign up form state (Exact order: Username, Email, Phone Number, First Name and Last Name, Password, Confirm Password)
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('+234 ');
  const [signupFirstName, setSignupFirstName] = useState('');
  const [signupLastName, setSignupLastName] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Recover password state
  const [recoverIdentifier, setRecoverIdentifier] = useState('');
  const [recoverNewPassword, setRecoverNewPassword] = useState('');
  const [recoverConfirmPassword, setRecoverConfirmPassword] = useState('');
  const [showRecoverPassword, setShowRecoverPassword] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState<'request' | 'reset' | 'completed'>('request');

  // Common UX state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Popup Modal Alert State for strict notifications
  const [alertPopup, setAlertPopup] = useState<AlertPopupState | null>(null);

  // Real-time password strength calculation
  const passwordStrength = useMemo(() => {
    return checkPasswordStrength(signupPassword);
  }, [signupPassword]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const cleanIdentifier = loginIdentifier.trim();
    if (!cleanIdentifier) {
      setAlertPopup({
        isOpen: true,
        type: 'warning',
        title: 'Missing Username or Email',
        message: 'Please enter your registered username or email address to sign in.',
        actionLabel: 'OK'
      });
      return;
    }
    if (!loginPassword) {
      setAlertPopup({
        isOpen: true,
        type: 'warning',
        title: 'Missing Password',
        message: 'Please enter your account password to proceed.',
        actionLabel: 'OK'
      });
      return;
    }

    // Check if the user exists in registered database or admin recovery list
    const foundUser = storage.findUserByUsernameOrEmail(cleanIdentifier);
    if (!foundUser) {
      setAlertPopup({
        isOpen: true,
        type: 'error',
        title: 'Access Denied: Wrong Email or Username',
        message: `No registered account was found with "${cleanIdentifier}". Access is strictly reserved for registered users. Please check your credentials or register an account below.`,
        actionLabel: 'Sign Up to Get Started',
        onAction: () => {
          setAlertPopup(null);
          setMode('signup');
        }
      });
      setError('Access denied: Wrong email address or username.');
      return;
    }

    setLoading(true);
    try {
      const res = await auth.loginUser(cleanIdentifier, loginPassword);
      if (res.success && res.session) {
        setSuccessMessage(res.message);
        try {
          confetti({ particleCount: 60, spread: 65, origin: { y: 0.65 } });
        } catch {
          // ignore
        }
        setTimeout(() => {
          onAuthSuccess(res.session!);
        }, 500);
      } else {
        setError(res.message);
        setAlertPopup({
          isOpen: true,
          type: 'error',
          title: 'Incorrect Credentials',
          message: res.message || 'Incorrect password entered. If you forgot your password, you can use the password recovery section.',
          actionLabel: 'Recover Password',
          onAction: () => {
            setAlertPopup(null);
            setMode('forgot_password');
            setRecoverIdentifier(cleanIdentifier);
          }
        });
      }
    } catch {
      setError('An unexpected error occurred during sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Sign Up with strict notifications
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // 1. Username validation (no repeat of same username during sign up)
    const cleanUser = signupUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!cleanUser || cleanUser.length < 3) {
      setAlertPopup({
        isOpen: true,
        type: 'warning',
        title: 'Invalid Username',
        message: 'Username must be at least 3 characters long and contain only letters, numbers, or underscores.',
        actionLabel: 'Fix Username'
      });
      return;
    }

    const existingUsername = storage.findUserByUsernameOrEmail(cleanUser);
    if (existingUsername) {
      setAlertPopup({
        isOpen: true,
        type: 'error',
        title: 'Username Already Taken',
        message: `This username "@${cleanUser}" has already been claimed. No repeat of same username allowed during sign up. Please choose a different unique username.`,
        actionLabel: 'Choose Another Username'
      });
      setError(`Username "@${cleanUser}" is already taken.`);
      return;
    }

    // 2. Email validation (notify wrong email address access or email repeatedly used)
    const cleanEmail = signupEmail.trim();
    if (!validateEmailFormat(cleanEmail)) {
      setAlertPopup({
        isOpen: true,
        type: 'error',
        title: 'Wrong Email Address',
        message: 'The email address provided is invalid. Please enter a valid and accessible email address (e.g. name@domain.com).',
        actionLabel: 'Correct Email'
      });
      setError('Invalid email address format.');
      return;
    }

    const existingEmail = storage.findUserByEmail(cleanEmail);
    if (existingEmail) {
      setAlertPopup({
        isOpen: true,
        type: 'warning',
        title: 'Email Already Registered',
        message: 'It had already been registered using the email before. Please sign in to your existing account or use a different email address.',
        actionLabel: 'Proceed to Sign In',
        onAction: () => {
          setAlertPopup(null);
          setMode('login');
          setLoginIdentifier(cleanEmail);
        }
      });
      setError('It had already been registered using the email before.');
      return;
    }

    // 3. Phone number validation
    if (!signupPhone.trim() || signupPhone.trim().length < 8) {
      setAlertPopup({
        isOpen: true,
        type: 'warning',
        title: 'Phone Number Required',
        message: 'Please provide a valid active phone number for account verification and transaction alerts.',
        actionLabel: 'OK'
      });
      return;
    }

    // 4. First name and last name validation
    if (!signupFirstName.trim() || !signupLastName.trim()) {
      setAlertPopup({
        isOpen: true,
        type: 'warning',
        title: 'Missing Full Name',
        message: 'Please enter both your first name and last name to register on the admin security list.',
        actionLabel: 'OK'
      });
      return;
    }

    // 5. Password strength check (no password with low level)
    const strength = checkPasswordStrength(signupPassword);
    if (!strength.isValid) {
      setAlertPopup({
        isOpen: true,
        type: 'error',
        title: 'Password Level Too Low',
        message: strength.feedback || 'Password with low level is rejected. Your password must be at least 8 characters and combine uppercase letters, lowercase letters, numbers, and symbols.',
        actionLabel: 'Strengthen Password'
      });
      setError('Password level is too low.');
      return;
    }

    // 6. Confirm password match
    if (signupPassword !== signupConfirmPassword) {
      setAlertPopup({
        isOpen: true,
        type: 'error',
        title: 'Passwords Do Not Match',
        message: 'The password and confirm password fields do not match. Please re-enter them carefully.',
        actionLabel: 'Re-enter Password'
      });
      setError('Passwords do not match.');
      return;
    }

    if (!agreeTerms) {
      setAlertPopup({
        isOpen: true,
        type: 'info',
        title: 'Terms of Service',
        message: 'Please accept the service agreement to continue registration.',
        actionLabel: 'OK'
      });
      return;
    }

    setLoading(true);
    try {
      const res = await auth.registerUser({
        username: cleanUser,
        firstName: signupFirstName.trim(),
        lastName: signupLastName.trim(),
        name: `${signupFirstName.trim()} ${signupLastName.trim()}`,
        email: cleanEmail,
        phone: signupPhone.trim(),
        password: signupPassword,
        role: 'Agency Lead'
      });

      if (res.success && res.user) {
        setSuccessMessage(res.message);
        try {
          confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
        } catch {
          // ignore
        }
        const session = auth.getSession();
        if (session) {
          setTimeout(() => {
            onAuthSuccess(session);
          }, 700);
        }
      } else {
        setError(res.message);
        setAlertPopup({
          isOpen: true,
          type: 'error',
          title: 'Registration Error',
          message: res.message,
          actionLabel: 'Review'
        });
      }
    } catch {
      setError('Failed to create account. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Recover Password
  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const cleanIdentifier = recoverIdentifier.trim();
    if (!cleanIdentifier) {
      setAlertPopup({
        isOpen: true,
        type: 'warning',
        title: 'Missing Identifier',
        message: 'Please enter your registered username or email to recover your account.',
        actionLabel: 'OK'
      });
      return;
    }

    if (recoveryStep === 'request') {
      const user = storage.findUserByUsernameOrEmail(cleanIdentifier);
      if (!user) {
        setAlertPopup({
          isOpen: true,
          type: 'error',
          title: 'Account Not Found',
          message: `No registered account found with username or email "${cleanIdentifier}". Please check for typos or sign up.`,
          actionLabel: 'Sign Up Instead',
          onAction: () => {
            setAlertPopup(null);
            setMode('signup');
          }
        });
        setError('No registered account found with that username or email.');
        return;
      }
      setRecoveryStep('reset');
      setSuccessMessage(`Account found for ${user.name}! Please set your new password below.`);
      return;
    }

    if (recoveryStep === 'reset') {
      const strength = checkPasswordStrength(recoverNewPassword);
      if (!strength.isValid) {
        setAlertPopup({
          isOpen: true,
          type: 'error',
          title: 'Password Level Too Low',
          message: strength.feedback || 'New password level is too low. Passwords must be at least 8 characters long with letters, numbers, and symbols.',
          actionLabel: 'Strengthen'
        });
        return;
      }
      if (recoverNewPassword !== recoverConfirmPassword) {
        setAlertPopup({
          isOpen: true,
          type: 'error',
          title: 'Passwords Do Not Match',
          message: 'The new password and confirm password fields do not match.',
          actionLabel: 'Re-enter'
        });
        return;
      }

      setLoading(true);
      try {
        const res = await auth.recoverPassword(cleanIdentifier, recoverNewPassword);
        if (res.success && res.session) {
          setSuccessMessage('Password reset successfully! Redirecting to your dashboard...');
          try {
            confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
          } catch {
            // ignore
          }
          setTimeout(() => {
            onAuthSuccess(res.session!);
          }, 600);
        } else {
          setError(res.message);
        }
      } catch {
        setError('Failed to reset password. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-indigo-500 selection:text-white font-sans">
      {/* Pop-up Notification Modal for Strict Validation & Security Alerts */}
      {alertPopup && alertPopup.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-slate-900 relative">
            <button
              onClick={() => setAlertPopup(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  alertPopup.type === 'error'
                    ? 'bg-rose-100 text-rose-600'
                    : alertPopup.type === 'warning'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-indigo-100 text-indigo-700'
                }`}
              >
                {alertPopup.type === 'error' ? (
                  <AlertCircle className="w-6 h-6" />
                ) : alertPopup.type === 'warning' ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : (
                  <HelpCircle className="w-6 h-6" />
                )}
              </div>

              <div className="space-y-1.5 flex-1 pr-4">
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {alertPopup.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {alertPopup.message}
                </p>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setAlertPopup(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Dismiss
              </button>
              {alertPopup.actionLabel && (
                <button
                  type="button"
                  onClick={() => {
                    if (alertPopup.onAction) {
                      alertPopup.onAction();
                    } else {
                      setAlertPopup(null);
                    }
                  }}
                  className={`px-4 py-2 text-xs font-semibold text-white rounded-xl transition shadow-xs ${
                    alertPopup.type === 'error'
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : alertPopup.type === 'warning'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {alertPopup.actionLabel}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-lg tracking-tight">
                  Really Simple Social
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  🇳🇬 Nigeria
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                reallysimplesocial.com • Automated Social Growth Panel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              <span>Instant Automated Delivery</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Content - Normal link size panel like reallysimplesocial.com */}
      <main className="flex-1 py-8 sm:py-12 px-4 sm:px-6 flex items-center justify-center">
        <div className="w-full max-w-xl">
          {/* Introduction Section About The Website - Explicitly Requested */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-6 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-600 via-blue-500 to-emerald-500"></div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-3 border border-indigo-100">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Nigeria's #1 Social Growth Platform
            </div>

            {/* Introduction Headline */}
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
              world's fastest and cheapest SMM Growing panel
            </h1>

            {/* Introduction Subtitle */}
            <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-lg mx-auto leading-relaxed">
              Get likes, follows, views and everything else you need from Nigeria's best SMM panel. All at super affordable prices.
            </p>

            {/* Platform Highlights like reallysimplesocial.com */}
            <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-left">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-indigo-600 uppercase block">Instagram</span>
                <span className="text-xs font-semibold text-slate-800">Followers & Likes</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-pink-600 uppercase block">TikTok</span>
                <span className="text-xs font-semibold text-slate-800">Views & ForYou Boost</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-red-600 uppercase block">YouTube</span>
                <span className="text-xs font-semibold text-slate-800">Watch Hours & Subs</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-sky-600 uppercase block">X (Twitter)</span>
                <span className="text-xs font-semibold text-slate-800">Retweets & Trends</span>
              </div>
            </div>
          </div>

          {/* Core Authentication Panel Box */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            {/* Notifications and Alerts inside form */}
            {error && (
              <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <div className="flex-1 font-medium">{error}</div>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-start gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <div className="flex-1 font-medium">{successMessage}</div>
              </div>
            )}

            {/* View Mode Switcher Header */}
            <div className="flex items-center border-b border-slate-200 mb-6 pb-2">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 pb-3 text-center text-sm font-semibold transition relative ${
                  mode === 'login'
                    ? 'text-indigo-600'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <LogIn className="w-4 h-4" />
                  Sign In
                </span>
                {mode === 'login' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"></span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 pb-3 text-center text-sm font-semibold transition relative ${
                  mode === 'signup'
                    ? 'text-indigo-600'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4" />
                  Sign Up
                </span>
                {mode === 'signup' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"></span>
                )}
              </button>

              {mode === 'forgot_password' && (
                <button
                  type="button"
                  className="flex-1 pb-3 text-center text-sm font-semibold text-amber-600 relative"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4" />
                    Recovery
                  </span>
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-600 rounded-full"></span>
                </button>
              )}
            </div>

            {/* SECTION 1: LOGIN SECTION (Demanding Username and Passwords) */}
            {mode === 'login' && (
              <div>
                <div className="mb-5">
                  <h2 className="text-lg font-bold text-slate-900">Sign in to your account</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Enter your username or email and password to access your Naira balance & SMM services.
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4 text-xs">
                  {/* Demanding Username */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Username or Email
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        placeholder="Enter your registered username or email"
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-slate-900 placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {/* Demanding Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block font-semibold text-slate-700">
                        Password
                      </label>
                      {/* Forgotten Password Section */}
                      <button
                        type="button"
                        onClick={() => {
                          setMode('forgot_password');
                          setError(null);
                          setSuccessMessage(null);
                          setRecoveryStep('request');
                          if (loginIdentifier.trim()) {
                            setRecoverIdentifier(loginIdentifier.trim());
                          }
                        }}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                      >
                        Forgotten password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter your account password"
                        className="w-full pl-9 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-slate-900 placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                      />
                      <span>Remember my login access</span>
                    </label>
                  </div>

                  {/* Sign In Tap */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-200 hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Signing in...
                      </span>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* If visitor don't have account section as explicitly requested */}
                <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-600">
                  <p>
                    I don’t have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('signup');
                        setError(null);
                        setSuccessMessage(null);
                      }}
                      className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline inline-flex items-center gap-1 ml-1"
                    >
                      Sign Up
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </p>
                </div>
              </div>
            )}

            {/* SECTION 2: SIGN UP SECTION (Written messages & fields sequence) */}
            {mode === 'signup' && (
              <div>
                {/* Explicitly requested written messages */}
                <div className="mb-5">
                  <h2 className="text-lg font-bold text-slate-900">
                    Sign up to get started
                  </h2>
                  <p className="text-xs text-slate-600 mt-1 font-medium">
                    Choose a username and quickly set up your account with your email
                  </p>
                </div>

                <form onSubmit={handleSignUp} className="space-y-3.5 text-xs">
                  {/* Sequence 1: Username */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-semibold text-slate-700">
                        Username
                      </label>
                      <span className="text-[10px] text-slate-400">No duplicate usernames allowed</span>
                    </div>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">@</div>
                      <input
                        type="text"
                        required
                        value={signupUsername}
                        onChange={(e) => setSignupUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                        placeholder="Choose a unique username"
                        className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-slate-900 placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {/* Sequence 2: Email */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-semibold text-slate-700">
                        Email
                      </label>
                      <span className="text-[10px] text-slate-400">Must be unique and accessible</span>
                    </div>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="yourname@domain.com"
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-slate-900 placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {/* Sequence 3: Phone Number */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="tel"
                        required
                        value={signupPhone}
                        onChange={(e) => setSignupPhone(e.target.value)}
                        placeholder="+234 800 000 0000"
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-slate-900 placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {/* Sequence 4: First Name and Last Name */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        required
                        value={signupFirstName}
                        onChange={(e) => setSignupFirstName(e.target.value)}
                        placeholder="First name"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-slate-900 placeholder:text-slate-400"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        required
                        value={signupLastName}
                        onChange={(e) => setSignupLastName(e.target.value)}
                        placeholder="Last name"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-slate-900 placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {/* Sequence 5: Password with real-time level security verification */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-semibold text-slate-700">
                        Password
                      </label>
                      {signupPassword && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            passwordStrength.level === 'Low'
                              ? 'bg-rose-100 text-rose-700'
                              : passwordStrength.level === 'Medium'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          Level: {passwordStrength.level} {passwordStrength.level === 'Low' && '(Rejected)'}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showSignupPassword ? 'text' : 'password'}
                        required
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="Create password (min 8 chars, uppercase, number, symbol)"
                        className="w-full pl-9 pr-10 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-slate-900 placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Password Level Indicator Bar */}
                    {signupPassword && (
                      <div className="mt-1.5 space-y-1">
                        <div className="flex gap-1 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              passwordStrength.score >= 1 ? 'bg-rose-500 w-1/4' : 'bg-transparent'
                            }`}
                          />
                          <div
                            className={`h-full transition-all ${
                              passwordStrength.score >= 2 ? 'bg-amber-500 w-1/4' : 'bg-transparent'
                            }`}
                          />
                          <div
                            className={`h-full transition-all ${
                              passwordStrength.score >= 3 ? 'bg-emerald-500 w-1/4' : 'bg-transparent'
                            }`}
                          />
                          <div
                            className={`h-full transition-all ${
                              passwordStrength.score >= 4 ? 'bg-indigo-600 w-1/4' : 'bg-transparent'
                            }`}
                          />
                        </div>
                        <p
                          className={`text-[10px] ${
                            passwordStrength.isValid ? 'text-emerald-700' : 'text-rose-600'
                          }`}
                        >
                          {passwordStrength.feedback}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Sequence 6: Confirm Password */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={signupConfirmPassword}
                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                        placeholder="Re-enter password to confirm"
                        className={`w-full pl-9 pr-10 py-2 bg-white border rounded-xl focus:ring-2 focus:ring-indigo-500 transition text-slate-900 placeholder:text-slate-400 ${
                          signupConfirmPassword && signupPassword !== signupConfirmPassword
                            ? 'border-rose-300 focus:border-rose-500'
                            : 'border-slate-300 focus:border-indigo-500'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {signupConfirmPassword && signupPassword !== signupConfirmPassword && (
                      <p className="text-[11px] text-rose-600 mt-1 font-medium">Passwords do not match.</p>
                    )}
                  </div>

                  {/* SMM Guarantee & Delivery Notice */}
                  <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100 flex items-start gap-2 text-emerald-900 text-[11px]">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>100% Non-Drop & Auto-Refill Guarantee:</strong> Orders are dispatched instantly with 24/7 automated delivery and genuine engagement across Nigeria and global audiences.
                    </span>
                  </div>

                  {/* Agreement */}
                  <div className="pt-1">
                    <label className="flex items-start gap-2 cursor-pointer text-slate-600 text-[11px]">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 mt-0.5 shrink-0"
                      />
                      <span>
                        I agree to Really Simple Social terms of service, virtual Naira account assignment & automated order delivery.
                      </span>
                    </label>
                  </div>

                  {/* Sign Up Action Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-3 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-200 hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Registering Account...
                      </span>
                    ) : (
                      <>
                        <span>Sign Up to Get Started</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Switch back to sign in */}
                <div className="mt-5 pt-4 border-t border-slate-100 text-center text-xs text-slate-600">
                  <p>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setError(null);
                        setSuccessMessage(null);
                      }}
                      className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline ml-1"
                    >
                      Sign In
                    </button>
                  </p>
                </div>
              </div>
            )}

            {/* SECTION 3: RECOVER LOGIN ACCESS */}
            {mode === 'forgot_password' && (
              <div>
                <div className="mb-5">
                  <h2 className="text-lg font-bold text-slate-900">Recover Login Access</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Recover your login access and reset your account password.
                  </p>
                </div>

                <form onSubmit={handleRecover} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Your Registered Username or Email
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={recoverIdentifier}
                        onChange={(e) => setRecoverIdentifier(e.target.value)}
                        placeholder="Enter username or email address"
                        disabled={recoveryStep === 'reset'}
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-slate-900 placeholder:text-slate-400 disabled:bg-slate-100"
                      />
                    </div>
                  </div>

                  {recoveryStep === 'reset' && (
                    <>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1.5">
                          New Password
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type={showRecoverPassword ? 'text' : 'password'}
                            required
                            value={recoverNewPassword}
                            onChange={(e) => setRecoverNewPassword(e.target.value)}
                            placeholder="Enter new password (min 8 characters)"
                            className="w-full pl-9 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-slate-900 placeholder:text-slate-400"
                          />
                          <button
                            type="button"
                            onClick={() => setShowRecoverPassword(!showRecoverPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showRecoverPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1.5">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type={showRecoverPassword ? 'text' : 'password'}
                            required
                            value={recoverConfirmPassword}
                            onChange={(e) => setRecoverConfirmPassword(e.target.value)}
                            placeholder="Confirm your new password"
                            className="w-full pl-9 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-slate-900 placeholder:text-slate-400"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm shadow-md shadow-amber-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Processing Recovery...
                      </span>
                    ) : recoveryStep === 'request' ? (
                      <>
                        <span>Find Account & Recover Access</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <span>Reset Password & Sign In</span>
                        <Check className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-5 pt-4 border-t border-slate-100 text-center text-xs text-slate-600">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setRecoveryStep('request');
                      setError(null);
                      setSuccessMessage(null);
                    }}
                    className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline inline-flex items-center gap-1"
                  >
                    Back to Sign In
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Social Proof & Guarantee Badges below */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              100% Encrypted & Safe
            </span>
            <span className="inline-flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Automated API Dispatch
            </span>
            <span className="inline-flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
              1.2M+ Orders Processed
            </span>
          </div>
        </div>
      </main>

      {/* Footer with Copyright Similar to reallysimplesocial.com */}
      <footer className="bg-white border-t border-slate-200 py-5 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-600">
            © {new Date().getFullYear()} Really Simple Social (reallysimplesocial.com). All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-slate-500">World's Fastest & Cheapest SMM Growing Panel</span>
            <span>•</span>
            <span className="text-indigo-600 font-medium">Nigeria's Best SMM Panel</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
