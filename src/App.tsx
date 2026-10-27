import React, { useState, useEffect } from 'react';
import { User } from './types/swms';
import { StorageService } from './services/storageService';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AuthPage } from './pages/AuthPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { BookingPage } from './pages/BookingPage';
import { BurnoutRiskPage } from './pages/BurnoutRiskPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { ProviderDashboard } from './pages/ProviderDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { HelpEmergencyPage } from './pages/HelpEmergencyPage';

export function App() {
  const storage = StorageService.getInstance();
  const [currentUser, setCurrentUser] = useState<User>(storage.getCurrentUser());
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [previousTab, setPreviousTab] = useState<string>('dashboard');

  // Adjust active tab when switching user roles
  const handleUserChange = (newUser: User) => {
    setCurrentUser(newUser);
    if (newUser.role === 'student') {
      setActiveTab('dashboard');
    } else if (newUser.role === 'provider') {
      setActiveTab('provider_dashboard');
    } else if (newUser.role === 'admin') {
      setActiveTab('admin_analytics');
    }
  };

  const handleOpenHelp = () => {
    setPreviousTab(activeTab);
    setActiveTab('help');
  };

  const handleCloseHelp = () => {
    setActiveTab(previousTab);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fbf9f5] text-slate-800 antialiased selection:bg-teal-100 selection:text-teal-900">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onUserChange={handleUserChange}
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'auth') {
            setShowAuthModal(true);
          } else {
            setActiveTab(tab);
          }
        }}
        onOpenHelp={handleOpenHelp}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'help' ? (
          <HelpEmergencyPage onBack={handleCloseHelp} />
        ) : currentUser.role === 'student' ? (
          <>
            {activeTab === 'dashboard' && (
              <StudentDashboard
                currentUser={currentUser}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onOpenHelp={handleOpenHelp}
              />
            )}
            {activeTab === 'booking' && <BookingPage currentUser={currentUser} />}
            {activeTab === 'burnout' && (
              <BurnoutRiskPage
                currentUser={currentUser}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}
            {activeTab === 'privacy' && (
              <PrivacyPage
                currentUser={currentUser}
                onDataDeleted={() => {
                  storage.initIfEmpty(true);
                  handleUserChange(storage.getCurrentUser());
                }}
              />
            )}
          </>
        ) : currentUser.role === 'provider' ? (
          <>
            {activeTab === 'provider_dashboard' && (
              <ProviderDashboard currentUser={currentUser} activeSubTab="dashboard" />
            )}
            {activeTab === 'availability' && (
              <ProviderDashboard currentUser={currentUser} activeSubTab="availability" />
            )}
            {activeTab === 'student_summary' && (
              <ProviderDashboard currentUser={currentUser} activeSubTab="students" />
            )}
          </>
        ) : currentUser.role === 'admin' ? (
          <>
            {activeTab === 'admin_analytics' && (
              <AdminDashboard currentUser={currentUser} />
            )}
            {activeTab === 'admin_users' && (
              <AdminDashboard currentUser={currentUser} />
            )}
          </>
        ) : null}
      </main>

      {/* Mandatory Universal Disclaimer Footer */}
      <Footer onOpenHelp={handleOpenHelp} />

      {/* Auth Screen Modal (if user wants to view S1 / S2) */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-8 right-6 z-10 text-slate-400 hover:text-slate-700 bg-white/80 rounded-full p-1"
            >
              ✕
            </button>
            <AuthPage
              onLoginSuccess={(u) => {
                handleUserChange(u);
                setShowAuthModal(false);
              }}
              onOpenHelp={handleOpenHelp}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
