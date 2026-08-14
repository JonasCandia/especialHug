import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.js';
import { ThemeCatalog } from './components/ThemeCatalog.js';
import { OrderWizard } from './components/OrderWizard.js';
import { PreviewAndCheckout } from './components/PreviewAndCheckout.js';
import { CreditModal } from './components/CreditModal.js';
import { MyOrdersModal } from './components/MyOrdersModal.js';
import { AdminPanel } from './components/AdminPanel.js';
import { LgpdTermsModal } from './components/LgpdTermsModal.js';
import { Footer } from './components/Footer.js';
import type { Theme } from './types.js';

export default function App() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loadingThemes, setLoadingThemes] = useState<boolean>(true);

  // Navigation views
  const [view, setView] = useState<'catalog' | 'wizard' | 'preview'>('catalog');
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  // User state
  const [userEmail, setUserEmail] = useState<string>(() => {
    return localStorage.getItem('abraco_user_email') || 'demo@abraco.com';
  });
  const [userCredits, setUserCredits] = useState<number>(3);

  // Modals
  const [creditsModalOpen, setCreditsModalOpen] = useState<boolean>(false);
  const [myOrdersModalOpen, setMyOrdersModalOpen] = useState<boolean>(false);
  const [adminPanelOpen, setAdminPanelOpen] = useState<boolean>(false);
  const [termsModalOpen, setTermsModalOpen] = useState<boolean>(false);

  // Fetch themes
  const fetchThemes = async () => {
    try {
      const res = await fetch('/api/themes');
      const data = await res.json();
      if (data.success) {
        setThemes(data.themes || []);
      }
    } catch (e) {
      console.error('Error fetching themes:', e);
    } finally {
      setLoadingThemes(false);
    }
  };

  // Fetch user credits
  const fetchCredits = async (email: string) => {
    if (!email) return;
    try {
      const res = await fetch(`/api/credits?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.success) {
        setUserCredits(data.credits || 0);
      }
    } catch (e) {
      console.error('Error fetching credits:', e);
    }
  };

  useEffect(() => {
    fetchThemes();
  }, []);

  useEffect(() => {
    if (userEmail) {
      localStorage.setItem('abraco_user_email', userEmail);
      fetchCredits(userEmail);
    }
  }, [userEmail]);

  const handleSelectTheme = (theme: Theme) => {
    setSelectedTheme(theme);
    setView('wizard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderCreated = (orderId: string) => {
    setActiveOrderId(orderId);
    setView('preview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    setSelectedTheme(null);
    setActiveOrderId(null);
    setView('catalog');
    fetchCredits(userEmail);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectSpecificOrder = (orderId: string) => {
    setActiveOrderId(orderId);
    setView('preview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-800 flex flex-col font-sans selection:bg-amber-200 selection:text-amber-900">
      
      {/* Top Navigation */}
      <Navbar
        userEmail={userEmail}
        userCredits={userCredits}
        onOpenCreditsModal={() => setCreditsModalOpen(true)}
        onOpenMyOrders={() => setMyOrdersModalOpen(true)}
        onOpenAdmin={() => setAdminPanelOpen(true)}
        onOpenTerms={() => setTermsModalOpen(true)}
        onSelectHome={handleBackToHome}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {view === 'catalog' && (
          <ThemeCatalog
            themes={themes}
            onSelectTheme={handleSelectTheme}
            onOpenCreditsModal={() => setCreditsModalOpen(true)}
            onOpenTerms={() => setTermsModalOpen(true)}
          />
        )}

        {view === 'wizard' && selectedTheme && (
          <OrderWizard
            theme={selectedTheme}
            userEmail={userEmail}
            onBack={handleBackToHome}
            onOrderCreated={handleOrderCreated}
          />
        )}

        {view === 'preview' && activeOrderId && (
          <PreviewAndCheckout
            orderId={activeOrderId}
            userEmail={userEmail}
            userCredits={userCredits}
            onCreditsUpdated={() => fetchCredits(userEmail)}
            onBackToHome={handleBackToHome}
            onOpenCreditsModal={() => setCreditsModalOpen(true)}
          />
        )}
      </main>

      {/* Modals */}
      <CreditModal
        isOpen={creditsModalOpen}
        userEmail={userEmail}
        userCredits={userCredits}
        onClose={() => setCreditsModalOpen(false)}
        onCreditsUpdated={() => fetchCredits(userEmail)}
        onEmailChanged={(email) => setUserEmail(email)}
      />

      <MyOrdersModal
        isOpen={myOrdersModalOpen}
        userEmail={userEmail}
        onClose={() => setMyOrdersModalOpen(false)}
        onSelectOrder={handleSelectSpecificOrder}
        onEmailChanged={(email) => setUserEmail(email)}
      />

      <AdminPanel
        isOpen={adminPanelOpen}
        onClose={() => setAdminPanelOpen(false)}
        themes={themes}
        onThemeUpdated={fetchThemes}
      />

      <LgpdTermsModal
        isOpen={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
      />

      {/* Footer */}
      <Footer
        onOpenTerms={() => setTermsModalOpen(true)}
        onOpenAdmin={() => setAdminPanelOpen(true)}
        onOpenCreditsModal={() => setCreditsModalOpen(true)}
      />

    </div>
  );
}
