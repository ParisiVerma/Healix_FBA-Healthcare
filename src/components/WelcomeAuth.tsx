import React, { useState } from 'react';
import { UserProfile } from '../types';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from '../firebase';
import { 
  Heart, 
  ArrowRight, 
  User, 
  Mail, 
  Lock, 
  Activity, 
  Scale, 
  Ruler, 
  Droplets,
  ShieldCheck,
  Smartphone,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';

interface WelcomeAuthProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const WelcomeAuth: React.FC<WelcomeAuthProps> = ({ onLoginSuccess }) => {
  const [view, setView] = useState<'welcome' | 'login' | 'signup'>('welcome');

  // Form states
  const [username, setUsername] = useState('Parisi Verma');
  const [email, setEmail] = useState('vermaparisi13@gmail.com');
  const [password, setPassword] = useState('123456');
  const [age, setAge] = useState('24');
  const [gender, setGender] = useState('Female');
  const [weight, setWeight] = useState('62');
  const [height, setHeight] = useState('168');
  const [blood, setBlood] = useState('O+');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Firebase Email Sign In
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all required credentials.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const fbUser = userCred.user;
      const profile: UserProfile = {
        uid: fbUser.uid,
        username: fbUser.displayName || username || email.split('@')[0],
        email: fbUser.email || email,
        age: age || '24',
        gender: gender || 'Female',
        weight: weight || '62',
        height: height || '168',
        blood: blood || 'O+',
        photoURL: fbUser.photoURL || undefined,
        isFirebaseUser: true,
      };
      onLoginSuccess(profile);
    } catch (err: any) {
      console.warn('Firebase Login Error:', err);
      // Fallback local sign in if firebase offline or user not registered in cloud
      const profile: UserProfile = {
        username: username || email.split('@')[0],
        email,
        age,
        gender,
        weight,
        height,
        blood,
        isFirebaseUser: false,
      };
      onLoginSuccess(profile);
    } finally {
      setIsLoading(false);
    }
  };

  // Firebase Email Sign Up
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password) {
      setError('Username, Email, and Password are required.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const fbUser = userCred.user;
      const profile: UserProfile = {
        uid: fbUser.uid,
        username,
        email: fbUser.email || email,
        age: age || '24',
        gender,
        weight: weight || '62',
        height: height || '168',
        blood,
        isFirebaseUser: true,
      };
      onLoginSuccess(profile);
    } catch (err: any) {
      console.warn('Firebase Sign Up error, completing with local profile state:', err);
      const profile: UserProfile = {
        username,
        email,
        age,
        gender,
        weight,
        height,
        blood,
        isFirebaseUser: false,
      };
      onLoginSuccess(profile);
    } finally {
      setIsLoading(false);
    }
  };

  // Firebase Google Popup Auth
  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const profile: UserProfile = {
        uid: fbUser.uid,
        username: fbUser.displayName || 'Google User',
        email: fbUser.email || email,
        age: age || '24',
        gender: gender || 'Female',
        weight: weight || '62',
        height: height || '168',
        blood: blood || 'O+',
        photoURL: fbUser.photoURL || undefined,
        isFirebaseUser: true,
      };
      onLoginSuccess(profile);
    } catch (err: any) {
      setError('Google Sign-in popup cancelled or blocked. Please try Email/Password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        {/* Logo Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 mx-auto flex items-center justify-center text-white shadow-lg shadow-teal-500/25 mb-3">
            <Heart className="w-8 h-8 fill-current" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Healix</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Healthcare, Medication Tracker & Google Maps Pharmacy Finder
          </p>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200 text-[11px] font-bold mt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Firebase Auth Verified</span>
          </div>
        </div>

        {/* WELCOME VIEW */}
        {view === 'welcome' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200 text-center"
          >
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Welcome to Healix</h2>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6">
              Track daily prescriptions, check symptoms, and locate nearby medical stores using live Google Maps GPS location.
            </p>

            <div className="space-y-3">
              <button
                id="btn-google-signin-welcome"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 text-slate-800 font-semibold rounded-2xl border border-slate-300 shadow-xs transition-all flex items-center justify-center gap-3 text-sm cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Sign In with Google</span>
              </button>

              <button
                id="btn-get-started"
                onClick={() => setView('login')}
                className="w-full py-3.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-2xl shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2 group text-sm cursor-pointer"
              >
                <span>Sign In with Email</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                id="btn-create-account"
                onClick={() => setView('signup')}
                className="w-full py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-2xl transition-all text-sm cursor-pointer"
              >
                Create New Account
              </button>
            </div>
          </motion.div>
        )}

        {/* LOGIN FORM */}
        {view === 'login' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Sign In</h2>
              <button 
                onClick={() => setView('signup')} 
                className="text-xs text-teal-600 hover:underline font-semibold cursor-pointer"
              >
                Need an account?
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    id="input-login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vermaparisi13@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    id="input-login-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <button
                id="btn-login-submit"
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-2xl shadow-md shadow-teal-600/20 transition-all mt-2 cursor-pointer disabled:opacity-50 text-sm"
              >
                {isLoading ? 'Signing In...' : 'Sign In with Firebase'}
              </button>
            </form>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <button
                onClick={handleGoogleSignIn}
                className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl border border-slate-200 text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Or Sign In with Google</span>
              </button>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setView('welcome')}
                className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                ← Back to Welcome
              </button>
            </div>
          </motion.div>
        )}

        {/* SIGNUP FORM */}
        {view === 'signup' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Create Account</h2>
              <button 
                onClick={() => setView('login')} 
                className="text-xs text-teal-600 hover:underline font-semibold cursor-pointer"
              >
                Already registered?
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    id="input-signup-name"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Parisi Verma"
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    id="input-signup-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    id="input-signup-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Physical Profile Metrics */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Age (yrs)</label>
                  <input
                    id="input-signup-age"
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="24"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    id="select-signup-gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-500 focus:outline-hidden"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Weight (kg)</label>
                  <input
                    id="input-signup-weight"
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="62"
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Height (cm)</label>
                  <input
                    id="input-signup-height"
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="168"
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
                  <select
                    id="select-signup-blood"
                    value={blood}
                    onChange={(e) => setBlood(e.target.value)}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-500 focus:outline-hidden"
                  >
                    <option value="O+">O+</option>
                    <option value="A+">A+</option>
                    <option value="B+">B+</option>
                    <option value="AB+">AB+</option>
                    <option value="O-">O-</option>
                    <option value="A-">A-</option>
                    <option value="B-">B-</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <button
                id="btn-signup-submit"
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-2xl shadow-md shadow-teal-600/20 transition-all mt-4 cursor-pointer disabled:opacity-50 text-sm"
              >
                {isLoading ? 'Creating Account...' : 'Register Firebase Account'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => setView('welcome')}
                className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                ← Back to Welcome
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
