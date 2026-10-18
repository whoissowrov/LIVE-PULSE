import React, { useState, useEffect } from 'react';
import CustomCursor from './components/CustomCursor';
import AmbientBackground from './components/AmbientBackground';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import UserDashboard from './components/UserDashboard';
import SosRequests from './components/SosRequests';
import DonorDirectory from './components/DonorDirectory';
import LiveMap from './components/LiveMap';
import CompatibilityMatrix from './components/CompatibilityMatrix';
import EligibilityQuiz from './components/EligibilityQuiz';
import Footer from './components/Footer';
import UploadDataModal from './components/UploadDataModal';
import SosModal from './components/SosModal';
import AuthModal from './components/AuthModal';
import AdminPortal from './components/AdminPortal';
import api from './api';

import {
  DEFAULT_USERS,
  DEFAULT_DONORS,
  DEFAULT_REQUESTS
} from './data/mockData';

export default function App() {
  // LocalStorage state initialization
  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('lifepulse_react_users');
      return saved ? JSON.parse(saved) : DEFAULT_USERS;
    } catch (e) {
      return DEFAULT_USERS;
    }
  });

  // Start as guest (logged out) so visitor sees Login / Register on refresh
  const [currentUser, setCurrentUser] = useState(null);

  const [donors, setDonors] = useState(() => {
    try {
      const saved = localStorage.getItem('lifepulse_react_donors');
      return saved ? JSON.parse(saved) : DEFAULT_DONORS;
    } catch (e) {
      return DEFAULT_DONORS;
    }
  });

  const [requests, setRequests] = useState(() => {
    try {
      const saved = localStorage.getItem('lifepulse_react_requests');
      return saved ? JSON.parse(saved) : DEFAULT_REQUESTS;
    } catch (e) {
      return DEFAULT_REQUESTS;
    }
  });

  // Modal visibility states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [platformAlert, setPlatformAlert] = useState('Urgent demand for O-Negative and B-Positive at Mount Sinai & NYU Langone ER wards.');

  // Search filter passed from hero
  const [searchFilters, setSearchFilters] = useState(null);

  // Toasts
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  };

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem('lifepulse_react_users', JSON.stringify(users));
  }, [users]);

  // On page mount / refresh, ensure guest visitor state so "Login / Register" is always shown
  useEffect(() => {
    localStorage.removeItem('lifepulse_react_current_user');
  }, []);

  useEffect(() => {
    localStorage.setItem('lifepulse_react_donors', JSON.stringify(donors));
  }, [donors]);

  useEffect(() => {
    localStorage.setItem('lifepulse_react_requests', JSON.stringify(requests));
  }, [requests]);

  // Auth actions
  const handleLogin = async (email, password) => {
    // Try backend API first
    try {
      const res = await api.login(email, password);
      if (res?.success && res.user) {
        localStorage.setItem('lifepulse_token', res.token);
        const mappedUser = {
          ...res.user,
          lat: res.user.location?.lat || 23.8103,
          lng: res.user.location?.lng || 90.4125,
          city: res.user.location?.city || 'Dhaka',
          area: res.user.location?.area || '',
          nearestHospital: res.user.location?.hospital || '',
          availableNow: res.user.isAvailable !== false
        };
        setCurrentUser(mappedUser);
        setIsAuthModalOpen(false);
        showToast(res.message || `Welcome back, ${res.user.name}!`, 'success');
        return;
      } else if (res?.message) {
        showToast(res.message, 'danger');
        return;
      }
    } catch (e) {
      console.warn('Backend offline, falling back to local user store:', e);
    }

    // Local fallback
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      showToast('No account found with this email. Please register.', 'danger');
      return;
    }
    if (user.password && user.password !== password) {
      showToast('Incorrect password. Try "password123" for demo.', 'danger');
      return;
    }
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    showToast(`Welcome back, ${user.name}!`, 'success');
  };

  const handleDemoLogin = async (email) => {
    // Check if logging in as Admin
    if (email === 'admin@lifepulse.org') {
      try {
        const res = await api.login('admin@lifepulse.org', 'admin123');
        if (res?.success && res.user) {
          localStorage.setItem('lifepulse_token', res.token);
          const adminProfile = {
            ...res.user,
            role: 'admin',
            lat: res.user.location?.lat || 23.7461,
            lng: res.user.location?.lng || 90.3742
          };
          setCurrentUser(adminProfile);
          setIsAuthModalOpen(false);
          showToast('👑 Welcome back, Root Administrator! Admin Console unlocked.', 'success');
          return;
        }
      } catch (e) {
        console.warn('Backend admin login fallback:', e);
      }

      // Local Admin Profile fallback
      const adminLocal = {
        id: 'admin_primary_01',
        name: 'System Administrator',
        email: 'admin@lifepulse.org',
        role: 'admin',
        bloodGroup: 'O+',
        phone: '+880 1711-000000',
        city: 'Dhaka',
        area: 'Dhanmondi',
        isDonor: false,
        isVerifiedDonor: true
      };
      setCurrentUser(adminLocal);
      setIsAuthModalOpen(false);
      showToast('👑 Logged in as Administrator! Admin Console unlocked in Navbar.', 'success');
      return;
    }

    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      setCurrentUser(user);
      setIsAuthModalOpen(false);
      showToast(`Logged in as demo profile: ${user.name}`, 'success');
    }
  };

  const handleRegister = (regData) => {
    if (users.find((u) => u.email.toLowerCase() === regData.email.toLowerCase())) {
      showToast('An account with this email already exists.', 'danger');
      return;
    }

    const newUser = {
      id: 'user_' + Date.now(),
      ...regData,
      weight: 65,
      age: 25,
      gender: 'Prefer not to say',
      emergencyContact: 'Family Contact (+1 555-0100)',
      address: 'Downtown Metro Area',
      area: 'Central District',
      lat: 40.7128 + (Math.random() - 0.5) * 0.08,
      lng: -74.006 + (Math.random() - 0.5) * 0.08,
      nearestHospital: 'Metro General Hospital',
      totalDonations: 1,
      lastDonationDate: '',
      availableNow: true,
      hemoglobin: '14.0',
      notes: 'New active donor.',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(regData.name)}`
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);

    if (newUser.role === 'donor') {
      syncDonorEntry(newUser);
    }

    setIsAuthModalOpen(false);
    showToast(`Account created! Welcome, ${newUser.name}!`, 'success');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    showToast('Logged out successfully.', 'info');
  };

  const syncDonorEntry = (user) => {
    setDonors((prev) => {
      const idx = prev.findIndex((d) => d.userId === user.id);
      const donorItem = {
        id: idx !== -1 ? prev[idx].id : 'donor_' + Date.now(),
        userId: user.id,
        name: user.name,
        bloodGroup: user.bloodGroup,
        city: user.city || 'New York',
        area: user.area || user.city || 'Central',
        lat: parseFloat(user.lat) || 40.7128,
        lng: parseFloat(user.lng) || -74.006,
        phone: user.phone || '+1 555-0000',
        status: user.availableNow ? 'available' : 'unavailable',
        lastDonated: user.lastDonationDate || 'Recently',
        donationsCount: user.totalDonations || 1,
        verified: true,
        avatar: user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.name)}`
      };

      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = donorItem;
        return copy;
      }
      return [donorItem, ...prev];
    });
  };

  // Upload data & location handler
  const handleSaveProfile = (updatedData) => {
    const updatedUser = {
      ...currentUser,
      ...updatedData,
      lat: parseFloat(updatedData.lat) || currentUser.lat || 40.7128,
      lng: parseFloat(updatedData.lng) || currentUser.lng || -74.006
    };

    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    syncDonorEntry(updatedUser);

    showToast('Profile data and location successfully uploaded & live on LifePulse!', 'success');
  };

  // Availability quick toggle
  const handleToggleAvailability = (isAvailable) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, availableNow: isAvailable };
    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    syncDonorEntry(updatedUser);
    showToast(`Status updated: ${isAvailable ? '🟢 Available for donations' : '🟡 Temporarily busy'}`, 'success');
  };

  // Emergency SOS creation
  const handleCreateSos = (sosData) => {
    const newReq = {
      id: 'req_' + Date.now(),
      ...sosData,
      units: parseInt(sosData.units) || 1,
      requiredWithin:
        sosData.urgency === 'critical'
          ? 'Immediate (Next 2 Hours)'
          : sosData.urgency === 'urgent'
          ? 'Within 24 Hours'
          : 'Scheduled Surgery',
      lat: 40.73 + (Math.random() - 0.5) * 0.08,
      lng: -73.98 + (Math.random() - 0.5) * 0.08,
      dateAdded: 'Just now',
      verified: true
    };

    setRequests((prev) => [newReq, ...prev]);
    showToast(`🚨 Emergency SOS broadcasted for ${sosData.bloodGroup}! Matching donors alerted.`, 'danger');

    const el = document.getElementById('requestsSection');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="app-root">
      {/* 1. Custom Interactive Cursor */}
      <CustomCursor />

      {/* 2. Luxury Bioluminescent Particle Background */}
      <AmbientBackground />

      {/* 3. Navigation Header */}
      <Navbar
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenSos={() => setIsSosModalOpen(true)}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        onOpenUpload={() => {
          if (!currentUser) setIsAuthModalOpen(true);
          else setIsUploadModalOpen(true);
        }}
      />

      {/* 4. Hero Section */}
      <Hero
        platformAlert={platformAlert}
        onOpenUpload={() => {
          if (!currentUser) {
            setIsAuthModalOpen(true);
            showToast('Please login or create an account to upload your data and location.', 'info');
          } else {
            setIsUploadModalOpen(true);
          }
        }}
        onOpenSos={() => setIsSosModalOpen(true)}
        onQuickSearch={(filters) => setSearchFilters(filters)}
      />

      {/* 5. User Profile & Data Dashboard */}
      {currentUser && (
        <UserDashboard
          currentUser={currentUser}
          onOpenUpload={() => setIsUploadModalOpen(true)}
          onLogout={handleLogout}
          onToggleAvailability={handleToggleAvailability}
        />
      )}

      {/* 6. Active Emergency SOS Requests */}
      <SosRequests requests={requests} />

      {/* 7. Find Donors Directory */}
      <DonorDirectory donors={donors} initialFilters={searchFilters} />

      {/* 8. Interactive Live Map */}
      <LiveMap donors={donors} requests={requests} currentUser={currentUser} />

      {/* 9. Compatibility Matrix */}
      <CompatibilityMatrix />

      {/* 10. Eligibility Quiz */}
      <EligibilityQuiz
        onOpenUpload={() => {
          if (!currentUser) setIsAuthModalOpen(true);
          else setIsUploadModalOpen(true);
        }}
      />

      {/* 11. Footer */}
      <Footer
        onOpenUpload={() => {
          if (!currentUser) setIsAuthModalOpen(true);
          else setIsUploadModalOpen(true);
        }}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
      />

      {/* Modals */}
      <UploadDataModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        currentUser={currentUser}
        onSave={handleSaveProfile}
        showToast={showToast}
      />

      <SosModal
        isOpen={isSosModalOpen}
        onClose={() => setIsSosModalOpen(false)}
        onSubmitSos={handleCreateSos}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onDemoLogin={handleDemoLogin}
      />

      <AdminPortal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        showToast={showToast}
        platformAlert={platformAlert}
        setPlatformAlert={setPlatformAlert}
      />

      {/* Floating Animated Toast Notifications */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span className="toast-icon">
              {t.type === 'success' ? '✓' : t.type === 'danger' ? '⚠️' : 'ℹ️'}
            </span>
            <div style={{ flex: 1 }}>{t.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
