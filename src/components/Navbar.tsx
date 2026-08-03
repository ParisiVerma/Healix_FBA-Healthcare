import React from 'react';
import { UserProfile, ActiveTab } from '../types';
import { 
  Heart, 
  Pill, 
  Stethoscope, 
  MapPin, 
  User, 
  LogOut,
  Activity,
  ShieldCheck,
  Smartphone
} from 'lucide-react';

interface NavbarProps {
  user: UserProfile;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onLogout,
}) => {
  return (
    <>
      {/* Top Desktop & Tablet Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo */}
            <div 
              onClick={() => setActiveTab('dashboard')} 
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
                <Heart className="w-5 h-5 fill-current" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-teal-700 to-emerald-600 bg-clip-text text-transparent">
                  Healix
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider text-teal-700 ml-2 px-2 py-0.5 bg-teal-50 rounded-full border border-teal-200">
                  Health Companion
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 sm:gap-2">
              <button
                id="nav-tab-dashboard"
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-teal-50 text-teal-700 font-semibold shadow-xs border border-teal-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              <button
                id="nav-tab-medicines"
                onClick={() => setActiveTab('medicines')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  activeTab === 'medicines'
                    ? 'bg-teal-50 text-teal-700 font-semibold shadow-xs border border-teal-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Pill className="w-4 h-4" />
                <span>Medicines</span>
              </button>

              <button
                id="nav-tab-symptoms"
                onClick={() => setActiveTab('symptoms')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  activeTab === 'symptoms'
                    ? 'bg-teal-50 text-teal-700 font-semibold shadow-xs border border-teal-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Stethoscope className="w-4 h-4" />
                <span>Symptom Checker</span>
              </button>

              <button
                id="nav-tab-pharmacies"
                onClick={() => setActiveTab('pharmacies')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  activeTab === 'pharmacies'
                    ? 'bg-teal-50 text-teal-700 font-semibold shadow-xs border border-teal-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span>Pharmacies</span>
              </button>
            </nav>

            {/* User Badge & Logout */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs pl-3 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs border border-teal-200 shadow-xs">
                  {user.username.slice(0, 2).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="font-semibold text-slate-800 max-w-[100px] truncate">
                    {user.username}
                  </p>
                  {user.isFirebaseUser && (
                    <span className="text-[9px] text-emerald-700 font-bold flex items-center gap-0.5">
                      <ShieldCheck className="w-2.5 h-2.5" /> Firebase Auth
                    </span>
                  )}
                </div>
              </div>

              <button
                id="btn-logout"
                onClick={onLogout}
                title="Log out"
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Optimized for APK format & Touch Devices) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 shadow-lg px-2 py-1.5 flex items-center justify-around">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-xl text-[11px] font-medium transition-all ${
            activeTab === 'dashboard' ? 'text-teal-700 font-bold bg-teal-50' : 'text-slate-500'
          }`}
        >
          <User className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => setActiveTab('medicines')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-xl text-[11px] font-medium transition-all ${
            activeTab === 'medicines' ? 'text-teal-700 font-bold bg-teal-50' : 'text-slate-500'
          }`}
        >
          <Pill className="w-5 h-5 mb-0.5" />
          <span>Meds</span>
        </button>

        <button
          onClick={() => setActiveTab('symptoms')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-xl text-[11px] font-medium transition-all ${
            activeTab === 'symptoms' ? 'text-teal-700 font-bold bg-teal-50' : 'text-slate-500'
          }`}
        >
          <Stethoscope className="w-5 h-5 mb-0.5" />
          <span>Triage</span>
        </button>

        <button
          onClick={() => setActiveTab('pharmacies')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-xl text-[11px] font-medium transition-all ${
            activeTab === 'pharmacies' ? 'text-teal-700 font-bold bg-teal-50' : 'text-slate-500'
          }`}
        >
          <MapPin className="w-5 h-5 mb-0.5" />
          <span>Stores</span>
        </button>
      </div>
    </>
  );
};
