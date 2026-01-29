import React, { useState } from 'react';
import { Mic, Video, LayoutGrid, Settings } from 'lucide-react';
import Hero from './components/sections/Hero';
import FeatureHighlightsBar from './components/sections/FeatureHighlightsBar';
import HowItWorks from './components/sections/HowItWorks';
import DetailedFeatures from './components/sections/DetailedFeatures';
import Pricing from './components/sections/Pricing';
import Testimonials from './components/sections/Testimonials';
import FAQ from './components/sections/FAQ';
import Footer from './components/sections/Footer';
import Navbar from './components/layout/Navbar';
import Dashboard from './components/dashboard/Dashboard';
import RecordingStudio from './components/studio/RecordingStudio';
import RecordingsLibrary from './components/dashboard/RecordingsLibrary';
import SettingsPanel from './components/dashboard/SettingsPanel';
import AuthModal from './components/auth/AuthModal';
import { useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';

function App() {
  const { user, loading } = useAuth();
  const [activeSection, setActiveSection] = useState('landing');
  const [currentStudio, setCurrentStudio] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('podnest_token', token);
      window.location.href = '/';
      return;
    }

    // Handle invite links: http://localhost:5173/join/12345678
    const path = window.location.pathname;
    if (path.startsWith('/join/')) {
      const inviteCode = path.split('/')[2];
      handleJoinByInvite(inviteCode);
    }
  }, []);

  const handleJoinByInvite = async (code) => {
    try {
      const headers = {};
      const token = localStorage.getItem('podnest_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`http://localhost:8080/api/studios/invite/${code}`, {
        headers: headers
      });

      if (response.ok) {
        const studio = await response.json();
        setCurrentStudio(studio);
        setActiveSection('studio');
      } else {
        window.history.replaceState({}, '', '/');
        // We'll trigger the toast once the provider is active, but inside the component we need useToast
      }
    } catch (err) {
      console.error('Failed to join studio:', err);
    }
  };

  const [activeTab, setActiveTab] = useState(null);

  const startStudio = (studio) => {
    setCurrentStudio(studio);
    setActiveSection('studio');
  };

  const handleNavigate = (section, tab = null) => {
    if (['dashboard', 'studio', 'library', 'settings'].includes(section) && !user) {
      setAuthMode('login');
      setIsAuthModalOpen(true);
      return;
    }
    setActiveSection(section);
    if (tab) setActiveTab(tab);
  };

  if (loading) return null;

  return (
    <ToastProvider>
      <div className="min-h-screen bg-background text-white selection:bg-accent-purple/30">
        {activeSection === 'landing' && (
          <>
            <Navbar onNavigate={handleNavigate} />
            <main className="relative">
              {/* Ambient Background Particles (Mockup) */}
              <div className="fixed inset-0 pointer-events-none -z-10 opacity-30">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full bg-accent-purple/20 blur-xl animate-pulse"
                    style={{
                      width: `${Math.random() * 300 + 100}px`,
                      height: `${Math.random() * 300 + 100}px`,
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 5}s`,
                    }}
                  />
                ))}
              </div>

              <Hero onStart={() => handleNavigate('dashboard')} />
              <FeatureHighlightsBar />
              <HowItWorks />
              <DetailedFeatures />
              <Pricing />
              <Testimonials />
              <FAQ />
              <Footer />
            </main>
          </>
        )}

        {activeSection === 'dashboard' && (
          <Dashboard
            onBack={() => handleNavigate('landing')}
            onEnterStudio={(studio) => startStudio(studio)}
            onNavigate={handleNavigate}
          />
        )}

        {activeSection === 'studio' && (
          <RecordingStudio
            studio={currentStudio}
            onLeave={() => handleNavigate('dashboard')}
          />
        )}

        {activeSection === 'library' && (
          <div className="flex min-h-screen bg-background text-white">
            <aside className="w-64 border-r border-white/5 bg-card/30 backdrop-blur-xl p-6 hidden lg:block">
              {/* Sidebar logo preserved */}
              <div className="flex items-center gap-2 mb-10 px-2 cursor-pointer" onClick={() => handleNavigate('landing')}>
                <div className="w-8 h-8 bg-gradient-to-br from-accent-purple to-accent-pink rounded-lg flex items-center justify-center">
                  <Mic className="text-white w-5 h-5" />
                </div>
                <span className="text-xl font-bold">PodNest</span>
              </div>
              <nav className="space-y-2">
                <div onClick={() => handleNavigate('dashboard')} className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer text-white/50 hover:bg-white/5"><LayoutGrid className="w-5 h-5" /> Dashboard</div>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-accent-purple/10 text-accent-purple"><Video className="w-5 h-5" /> Recordings</div>
                <div onClick={() => handleNavigate('settings')} className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer text-white/50 hover:bg-white/5"><Settings className="w-5 h-5" /> Settings</div>
              </nav>
            </aside>
            <RecordingsLibrary onBack={() => handleNavigate('dashboard')} />
          </div>
        )}

        {activeSection === 'settings' && (
          <div className="flex min-h-screen bg-background text-white">
            <SettingsPanel
              onBack={() => handleNavigate('dashboard')}
              initialTab={activeTab}
            />
          </div>
        )}

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialMode={authMode}
        />
      </div>
    </ToastProvider>
  );
}

export default App;
