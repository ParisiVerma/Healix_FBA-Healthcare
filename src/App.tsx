import React, { useState, useEffect } from 'react';
import { UserProfile, ActiveTab } from './types';
import { storage } from './utils/storage';
import { auth, onAuthStateChanged, firebaseSignOut } from './firebase';
import { Navbar } from './components/Navbar';
import { ProfileDashboard } from './components/ProfileDashboard';
import { MedicineTracker } from './components/MedicineTracker';
import { SymptomChecker } from './components/SymptomChecker';
import { PharmacyFinder } from './components/PharmacyFinder';
import { ApiHealth } from './components/ApiHealth';
import { WelcomeAuth } from './components/WelcomeAuth';

export function App() {
  const [user, setUser] = useState<UserProfile | null>(() => storage.getUser());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isAuthInitializing, setIsAuthInitializing] = useState(true);

  // Sync Firebase Auth observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const existing = storage.getUser();
        const updated: UserProfile = {
          uid: fbUser.uid,
          username: fbUser.displayName || existing?.username || fbUser.email?.split('@')[0] || 'User',
          email: fbUser.email || existing?.email || '',
          age: existing?.age || '24',
          gender: existing?.gender || 'Female',
          weight: existing?.weight || '62',
          height: existing?.height || '168',
          blood: existing?.blood || 'O+',
          photoURL: fbUser.photoURL || undefined,
          isFirebaseUser: true,
        };
        setUser(updated);
        storage.setUser(updated);
      }
      setIsAuthInitializing(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLoginSuccess = (userProfile: UserProfile) => {
    setUser(userProfile);
    storage.setUser(userProfile);
    setActiveTab('dashboard');
  };

  const handleLogout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch {
      // ignore
    }
    setUser(null);
    storage.removeUser();
  };

  if (!user) {
    return <WelcomeAuth onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col antialiased">
      {/* Navbar with Mobile Bottom Bar Support */}
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 md:pb-12">
        {activeTab === 'dashboard' && (
          <ProfileDashboard user={user} setActiveTab={setActiveTab} />
        )}

        {activeTab === 'medicines' && <MedicineTracker />}

        {activeTab === 'symptoms' && (
          <SymptomChecker
            onNavigatePharmacies={() => setActiveTab('pharmacies')}
            onNavigateMedicines={() => setActiveTab('medicines')}
          />
        )}

        {activeTab === 'pharmacies' && <PharmacyFinder />}

        {activeTab === 'health' && <ApiHealth />}
      </main>
    </div>
  );
}

export default App;
