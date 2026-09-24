import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Lock,
  Phone,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  LogOut,
  Building2,
  Copy,
  Check,
  Zap,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';
import { auth, AuthSession, validateEmailFormat, checkPasswordStrength } from '../services/auth';
import { storage } from '../services/storage';
import { UserProfile, RegisteredUser } from '../types';
import confetti from 'canvas-confetti';

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: UserProfile;
  onAuthSuccess: () => void;
}

export const UserAuthModal: React.FC<UserAuthModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onAuthSuccess
}) => {
  if (!isOpen) return null;

  const session = auth.getSession();
  const [authMode, setAuthMode] = useState<'dashboard' | 'login' | 'signup' | 'forgot_password'>(
    session ? 'dashboard' : 'login'
  );

  // Sign up state
  const [signupUsername, setSignupUsername] = useState('');
  const [signupFirstName, setSignupFirstName] = useState('');
  const [signupLastName, setSignupLastName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('+234 ');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupRole, setSignupRole] = useState<'Agency Lead' | 'Creator' | 'Member'>('Agency Lead');

  // Login state (no hardcoded demo credentials)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Password recovery state
  const [recoverIdentifier, setRecoverIdentifier] = useState('');
  const [recoverNewPassword, setRecoverNewPassword] = useState('');
  const [recoverConfirmPassword, setRecoverConfirmPassword] = useState('');
  const [recoveryStep, setRecoveryStep] = useState<'find' | 'reset'>('find');

  // Feedback
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [copiedBank, setCopiedBank] = useState(false);

  const registeredUsers = storage.getRegisteredUsers();

  const handleCopyAccount = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!loginEmail.trim()) {
      setErrorMsg('Please enter your username or registered email address.');
      return;
    }

    setLoading(true);
    const res = await auth.loginUser(loginEmail.trim(), loginPassword);
    setLoading(false);

    if (res.success) {
      setSuccessMsg(res.message);
      try {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      } catch (err) {}
      setTimeout(() => {
        onAuthSuccess();
        setAuthMode('dashboard');
      }, 700);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleQuickLogin = async (email: string, pass: string) => {
    setLoginEmail(email);
    setLoginPassword(pass);
    setLoading(true);
    setErrorMsg('');
    const res = await auth.loginUser(email, pass);
    setLoading(false);
    if (res.success) {
      setSuccessMsg(res.message);
      try {
        confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
      } catch (err) {}
      setTimeout(() => {
        onAuthSuccess();
        setAuthMode('dashboard');
      }, 700);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanUsername = signupUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!cleanUsername || cleanUsername.length < 3) {
      setErrorMsg('Please enter a username of at least 3 characters.');
      return;
    }

    // Check if username repeated
    const existingUser = storage.findUserByUsernameOrEmail(cleanUsername);
    if (existingUser) {
      setErrorMsg(`This username "${cleanUsername}" is already taken. No repeat of same username allowed during sign up.`);
      return;
    }

    if (!signupFirstName.trim() || !signupLastName.trim()) {
      setErrorMsg('Please provide both your first and last name.');
      return;
    }

    if (!signupEmail.trim() || !validateEmailFormat(signupEmail.trim())) {
      setErrorMsg('Invalid email address. Please enter a valid and accessible email address.');
      return;
    }

    // Check if email registered before
    const existingEmail = storage.findUserByEmail(signupEmail.trim());
    if (existingEmail) {
      setErrorMsg('This email has already been registered using the email before. Please sign in or use another email.');
      return;
    }

    // Check password level
    const strength = checkPasswordStrength(signupPassword);
    if (!strength.isValid) {
      setErrorMsg(strength.feedback || 'Password level is too low. Passwords must be at least 8 characters long with uppercase, lowercase, numbers, and symbols.');
      return;
    }

    if (signupConfirmPassword && signupPassword !== signupConfirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter them carefully.');
      return;
    }

    setLoading(true);
    const res = await auth.registerUser({
      username: cleanUsername,
      firstName: signupFirstName.trim(),
      lastName: signupLastName.trim(),
      name: `${signupFirstName.trim()} ${signupLastName.trim()}`,
      email: signupEmail.trim(),
      phone: signupPhone.trim(),
      password: signupPassword.trim(),
      role: signupRole
    });
    setLoading(false);

    if (res.success) {
      setSuccessMsg(res.message);
      try {
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
      } catch (err) {}
      setTimeout(() => {
        onAuthSuccess();
        setAuthMode('dashboard');
      }, 900);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!recoverIdentifier.trim()) {
      setErrorMsg('Please enter your username or email.');
      return;
    }

    if (recoveryStep === 'find') {
      const user = storage.findUserByUsernameOrEmail(recoverIdentifier.trim());
      if (!user) {
        setErrorMsg('No user account found matching that username or email.');
        return;
      }
      setRecoveryStep('reset');
      setSuccessMsg(`Account found for ${user.name}! Enter your new password below.`);
      return;
    }

    if (recoveryStep === 'reset') {
      if (!recoverNewPassword || recoverNewPassword.length < 6) {
        setErrorMsg('Password must be at least 6 characters.');
        return;
      }
      if (recoverNewPassword !== recoverConfirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }

      setLoading(true);
      const res = await auth.recoverPassword(recoverIdentifier.trim(), recoverNewPassword);
      setLoading(false);

      if (res.success) {
        setSuccessMsg('Password updated successfully! Welcome back.');
        try {
          confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
        } catch (err) {}
        setTimeout(() => {
          onAuthSuccess();
          setAuthMode('dashboard');
        }, 700);
      } else {
        setErrorMsg(res.message);
      }
    }
  };

  const handleLogout = () => {
    auth.logout();
    setSuccessMsg('You have successfully logged out.');
    onAuthSuccess();
    setAuthMode('login');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95">
        {/* Top Header */}
        <div className="bg-slate-900 text-white p-6 relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">
                  {authMode === 'dashboard'
                    ? 'User Account Dashboard'
                    : authMode === 'login'
                    ? 'Member Sign-In'
                    : 'Create New Account'}
                </h3>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  Naira Wallet Only
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Really Simple Social • Nigerian Naira (NGN) SMM Platform
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation when not in dashboard */}
        <div className="flex border-b border-slate-100 bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => {
              setAuthMode('dashboard');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-3 text-center transition flex items-center justify-center gap-1.5 ${
              authMode === 'dashboard'
                ? 'bg-white text-indigo-600 border-b-2 border-indigo-600 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Account Overview</span>
          </button>
          <button
            onClick={() => {
              setAuthMode('login');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-3 text-center transition flex items-center justify-center gap-1.5 ${
              authMode === 'login'
                ? 'bg-white text-indigo-600 border-b-2 border-indigo-600 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Sign In (Existing)</span>
          </button>
          <button
            onClick={() => {
              setAuthMode('signup');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-3 text-center transition flex items-center justify-center gap-1.5 ${
              authMode === 'signup'
                ? 'bg-white text-indigo-600 border-b-2 border-indigo-600 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sign Up (New)</span>
          </button>
        </div>

        {/* Feedback banners */}
        {errorMsg && (
          <div className="m-4 mb-0 bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="m-4 mb-0 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-xl flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6">
          {/* DASHBOARD VIEW */}
          {authMode === 'dashboard' && (
            <div className="space-y-5">
              {/* User Profile Card */}
              <div className="bg-gradient-to-br from-indigo-50/60 to-slate-50 rounded-2xl p-5 border border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={currentProfile.avatarUrl}
                    alt={currentProfile.name}
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-indigo-500/30"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-base">{currentProfile.name}</h4>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-mono mt-0.5">{currentProfile.email}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="bg-indigo-100 text-indigo-800 text-[10px] font-semibold px-2 py-0.5 rounded">
                        {currentProfile.role}
                      </span>
                      <span className="text-slate-500 text-[11px]">
                        {currentProfile.phone || '+234 814 892 0192'}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-200 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-xs self-end sm:self-center"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>

              {/* Dedicated Nigerian Virtual Account Details */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    <h5 className="font-bold text-slate-900 text-xs sm:text-sm">
                      Dedicated Naira (NGN) Virtual Bank Account
                    </h5>
                  </div>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-full border border-indigo-200">
                    Instant Credit
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Send Naira from any Nigerian mobile bank app (OPay, PalmPay, Kuda, Moniepoint, GTBank, Access, Zenith) to this account. Your balance will be credited automatically.
                </p>

                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Bank Name</span>
                    <span className="font-bold text-slate-800 font-mono">
                      {currentProfile.virtualBankName || 'Wema Bank'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Account Number</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-indigo-700 text-sm font-mono tracking-wider">
                        {currentProfile.virtualAccountNumber || '8492019482'}
                      </span>
                      <button
                        onClick={() =>
                          handleCopyAccount(currentProfile.virtualAccountNumber || '8492019482')
                        }
                        className="text-slate-400 hover:text-indigo-600 p-0.5 rounded"
                        title="Copy Account Number"
                      >
                        {copiedBank ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Account Name</span>
                    <span className="font-bold text-slate-800 truncate block">
                      RSS / {currentProfile.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Registered Accounts Quick Switcher */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Switch Registered Account ({registeredUsers.length} in Local Database)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {registeredUsers.map(u => {
                    const isCurrent = u.email.toLowerCase() === currentProfile.email.toLowerCase();
                    return (
                      <div
                        key={u.id}
                        onClick={() => !isCurrent && handleQuickLogin(u.email, u.password || 'Password123!')}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                          isCurrent
                            ? 'bg-indigo-50/50 border-indigo-300 ring-1 ring-indigo-500/20'
                            : 'bg-white hover:bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <img
                            src={u.avatarUrl}
                            alt={u.name}
                            className="w-8 h-8 rounded-full object-cover shrink-0"
                          />
                          <div className="truncate">
                            <p className="font-bold text-slate-900 text-xs truncate">{u.name}</p>
                            <p className="text-[10px] text-slate-500 truncate">{u.email}</p>
                          </div>
                        </div>
                        {isCurrent ? (
                          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded shrink-0">
                            Active
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="text-[10px] font-semibold text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded shrink-0"
                          >
                            Switch
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* LOGIN VIEW */}
          {authMode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Registration Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    placeholder="timelessmusicclassic@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-700 font-semibold">Password</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setLoginPassword('Password123!')}
                      className="text-[10px] text-indigo-600 hover:underline"
                    >
                      Demo Pass
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('forgot_password');
                        setErrorMsg('');
                        setSuccessMsg('');
                        setRecoveryStep('find');
                      }}
                      className="text-[10px] text-amber-600 font-semibold hover:underline"
                    >
                      Forgotten password?
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-98 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>{loading ? 'Authenticating...' : 'Sign In to Naira Dashboard'}</span>
              </button>

              <div className="text-center pt-2">
                <span className="text-slate-500 text-[11px]">
                  Do not have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthMode('signup')}
                    className="text-indigo-600 font-bold hover:underline"
                  >
                    Create a new user account
                  </button>
                </span>
              </div>
            </form>
          )}

          {/* SIGN UP VIEW */}
          {authMode === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Username</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">@</div>
                  <input
                    type="text"
                    required
                    placeholder="Choose username (e.g. adelekegrowth)"
                    value={signupUsername}
                    onChange={e => setSignupUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Registration Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. user@gmail.com"
                    value={signupEmail}
                    onChange={e => setSignupEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Nigerian Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    required
                    placeholder="+234 812 345 6789"
                    value={signupPhone}
                    onChange={e => setSignupPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    placeholder="First Name"
                    value={signupFirstName}
                    onChange={e => setSignupFirstName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Last Name"
                    value={signupLastName}
                    onChange={e => setSignupLastName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="Create strong password (min 6 characters)"
                    value={signupPassword}
                    onChange={e => setSignupPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="Confirm password"
                    value={signupConfirmPassword}
                    onChange={e => setSignupConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>₦5,000 Welcome Bonus</strong> automatically credited to your new Naira wallet upon registration!
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-98 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{loading ? 'Creating Account...' : 'Complete Sign Up & Claim ₦5,000'}</span>
              </button>

              <div className="text-center pt-1">
                <span className="text-slate-500 text-[11px]">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className="text-indigo-600 font-bold hover:underline"
                  >
                    Sign in here
                  </button>
                </span>
              </div>
            </form>
          )}

          {/* FORGOTTEN PASSWORD & RECOVER LOGIN ACCESS VIEW */}
          {authMode === 'forgot_password' && (
            <form onSubmit={handleRecover} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Registered Username or Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Enter username or email"
                    value={recoverIdentifier}
                    onChange={e => setRecoverIdentifier(e.target.value)}
                    disabled={recoveryStep === 'reset'}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                  />
                </div>
              </div>

              {recoveryStep === 'reset' && (
                <>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="password"
                        required
                        placeholder="Enter new password (min 6 characters)"
                        value={recoverNewPassword}
                        onChange={e => setRecoverNewPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="password"
                        required
                        placeholder="Confirm new password"
                        value={recoverConfirmPassword}
                        onChange={e => setRecoverConfirmPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-600 hover:bg-amber-700 active:scale-98 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition shadow-md shadow-amber-600/20 flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>
                  {loading
                    ? 'Processing...'
                    : recoveryStep === 'find'
                    ? 'Find Account & Recover Access'
                    : 'Reset Password & Sign In'}
                </span>
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setRecoveryStep('find');
                  }}
                  className="text-indigo-600 font-semibold hover:underline text-[11px]"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
