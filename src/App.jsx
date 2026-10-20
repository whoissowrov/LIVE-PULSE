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
import RecordDonationModal from './components/RecordDonationModal';
import RegionalDonorTracker from './components/RegionalDonorTracker';
import BangladeshHospitals from './components/BangladeshHospitals';
import PageHeader from './components/PageHeader';
import HomeExplorePortals from './components/HomeExplorePortals';
import { MapPin, Hospital, Droplet, Compass, AlertTriangle, Layers, UserCircle, ArrowRight } from 'lucide-react';
import api from './api';

import {
  DEFAULT_USERS,
  DEFAULT_DONORS,
  DEFAULT_REQUESTS
} from './data/mockData';

export default function App() {
  // LocalStorage state initialization with zero dummy people
  const dummyUserIds = new Set(['user_sarah', 'user_alex', 'user_marcus', 'user_aisha', 'user_david', 'user_maria', 'user_liam', 'user_sarah_r', 'user_tanvir', 'user_nusrat', 'user_asif']);
  const dummyDonorIds = new Set(['donor_1', 'donor_2', 'donor_3', 'donor_4', 'donor_5', 'donor_6', 'donor_dhaka_1', 'donor_dhaka_2', 'donor_dhaka_3', 'donor_dhaka_4']);
  const dummyRequestIds = new Set(['req_dhaka_1', 'req_dhaka_2', 'req_1', 'req_2', 'req_3']);

  const isDummyUser = (u) => {
    if (!u) return true;
    if (dummyUserIds.has(u.id)) return true;
    const name = (u.name || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    if (email === 'sarah.chen@example.com' || email === 'alex.rivera@example.com') return true;
    if (['sarah chen', 'dr. alex rivera', 'marcus vance', 'aisha patel', 'david kim', 'maria rodriguez', 'liam gallagher', 'dr. sarah rahman'].some(n => name.includes(n))) return true;
    return false;
  };

  const isDummyDonor = (d) => {
    if (!d) return true;
    if (dummyDonorIds.has(d.id) || dummyUserIds.has(d.userId)) return true;
    const name = (d.name || '').toLowerCase();
    if (['sarah chen', 'dr. alex rivera', 'marcus vance', 'aisha patel', 'david kim', 'maria rodriguez', 'liam gallagher', 'dr. sarah rahman'].some(n => name.includes(n))) return true;
    return false;
  };

  const isDummyRequest = (r) => {
    if (!r) return true;
    if (dummyRequestIds.has(r.id)) return true;
    const patient = (r.patientName || '').toLowerCase();
    if (['farhana ahmed', 'kamal uddin', 'emma watson', 'robert martinez', 'sophia lee'].some(n => patient.includes(n))) return true;
    return false;
  };

  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('lifepulse_react_users');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.filter((u) => !isDummyUser(u));
      }
      return DEFAULT_USERS;
    } catch (e) {
      return DEFAULT_USERS;
    }
  });

  // Start as guest (logged out) so visitor sees Login / Register on refresh
  const [currentUser, setCurrentUser] = useState(null);

  const [donors, setDonors] = useState(() => {
    try {
      const saved = localStorage.getItem('lifepulse_react_donors');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.filter((d) => !isDummyDonor(d));
      }
      return DEFAULT_DONORS;
    } catch (e) {
      return DEFAULT_DONORS;
    }
  });

  const [requests, setRequests] = useState(() => {
    try {
      const saved = localStorage.getItem('lifepulse_react_requests');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.filter((r) => !isDummyRequest(r));
      }
      return DEFAULT_REQUESTS;
    } catch (e) {
      return DEFAULT_REQUESTS;
    }
  });

  // Modal visibility states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isRecordDonationModalOpen, setIsRecordDonationModalOpen] = useState(false);
  const [platformAlert, setPlatformAlert] = useState('LifePulse Live Network Active • Register as a donor or broadcast an emergency SOS request.');

  // Website notifications & automated messages
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('lifepulse_react_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Track user login and registration activities categorized by location
  const [loginActivities, setLoginActivities] = useState(() => {
    try {
      const saved = localStorage.getItem('lifepulse_login_activities');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Dedicated separate page file mapping
  const PAGE_URL_MAP = {
    home: 'index.html',
    districts: 'districts.html',
    hospitals: 'hospitals.html',
    donors: 'donors.html',
    map: 'map.html',
    requests: 'urgent.html',
    compatibility: 'compatibility.html',
    dashboard: 'index.html#/dashboard'
  };

  // Multi-page detection and routing
  const getPageFromHash = () => {
    // 1. First, check URL hash (enables instantaneous view switching and browser back/forward history)
    const raw = typeof window !== 'undefined' ? window.location.hash.replace(/^#\/?/, '').toLowerCase().trim() : '';
    if (['districts', 'district', 'tracker', 'regional'].includes(raw)) return 'districts';
    if (['hospitals', 'hospital'].includes(raw)) return 'hospitals';
    if (['donors', 'donor', 'search'].includes(raw)) return 'donors';
    if (['map', 'livemap'].includes(raw)) return 'map';
    if (['requests', 'sos', 'urgent'].includes(raw)) return 'requests';
    if (['compatibility', 'eligibility', 'quiz'].includes(raw)) return 'compatibility';
    if (['dashboard', 'profile', 'user'].includes(raw)) return 'dashboard';
    if (raw === 'home') return 'home';

    // 2. Check window.INITIAL_PAGE set in standalone HTML files (districts.html, hospitals.html, etc.)
    if (typeof window !== 'undefined' && window.INITIAL_PAGE && window.INITIAL_PAGE !== 'home') {
      return window.INITIAL_PAGE;
    }

    // 3. Check window.location.pathname fallback
    if (typeof window !== 'undefined' && window.location) {
      const path = (window.location.pathname || '').toLowerCase();
      if (path.includes('district')) return 'districts';
      if (path.includes('hospital')) return 'hospitals';
      if (path.includes('donor')) return 'donors';
      if (path.includes('map')) return 'map';
      if (path.includes('urgent') || path.includes('request') || path.includes('sos')) return 'requests';
      if (path.includes('compatibility') || path.includes('eligibility')) return 'compatibility';
    }

    return 'home';
  };

  const [currentPage, setCurrentPage] = useState(getPageFromHash);

  useEffect(() => {
    const handleHashChange = () => {
      const page = getPageFromHash();
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (page) => {
    setCurrentPage(page);
    window.location.hash = page === 'home' ? '#/' : `#/${page}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const recordLoginSession = (user, action = 'login') => {
    if (!user) return;
    const entry = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId: user.id,
      userName: user.name,
      bloodGroup: user.bloodGroup,
      isDonor: user.isDonor !== false,
      division: user.division || user.location?.division || 'Dhaka',
      district: user.district || user.location?.district || user.city || user.location?.city || 'Dhaka',
      upazila: user.upazila || user.location?.upazila || '',
      union: user.union || user.location?.union || '',
      village: user.village || user.location?.village || '',
      action,
      timestamp: new Date().toISOString()
    };
    setLoginActivities((prev) => {
      const updated = [entry, ...prev.slice(0, 49)];
      try {
        localStorage.setItem('lifepulse_login_activities', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // Sync remote stats and login activity on mount
  useEffect(() => {
    const fetchRemoteStats = async () => {
      try {
        const res = await api.getRegionalStats();
        if (res?.success && Array.isArray(res.recentActivity) && res.recentActivity.length > 0) {
          setLoginActivities((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const fresh = res.recentActivity.filter((a) => !existingIds.has(a.id));
            return [...fresh, ...prev];
          });
        }
      } catch (e) {}
    };
    fetchRemoteStats();
  }, []);

  const handleOpenAuth = (tab = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

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

  // Persist notifications
  useEffect(() => {
    localStorage.setItem('lifepulse_react_notifications', JSON.stringify(notifications));
  }, [notifications]);

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

  // Automated notification checker for blood donation recovery (90-day standard)
  const checkAndNotifyRecovery = (user) => {
    if (!user || !user.lastDonationDate) return;
    try {
      const donTime = new Date(user.lastDonationDate).getTime();
      const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;
      const eligibleTime = donTime + ninetyDaysMs;
      const isEligible = Date.now() >= eligibleTime;
      const daysRemaining = Math.max(0, Math.ceil((eligibleTime - Date.now()) / (1000 * 60 * 60 * 24)));
      const eligibleDateFormatted = new Date(eligibleTime).toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });

      if (isEligible) {
        // Auto-create eligibility website message if not already present
        setNotifications((prev) => {
          const hasEligNotif = prev.some(
            (n) => n.userId === user.id && n.type === 'eligibility' && n.metadata?.donationDate === user.lastDonationDate
          );
          if (!hasEligNotif) {
            const newNotif = {
              id: 'notif_elig_' + Date.now(),
              userId: user.id,
              title: '🎉 Recovery Complete: Eligible to Donate Again!',
              message: `Your 90-day recovery period from your blood donation on ${user.lastDonationDate} is complete! You are in optimal health to donate again and save lives in emergencies.`,
              type: 'eligibility',
              read: false,
              createdAt: new Date().toISOString(),
              metadata: {
                donationDate: user.lastDonationDate,
                eligibleDate: eligibleDateFormatted,
                isEligible: true
              }
            };
            return [newNotif, ...prev];
          }
          return prev;
        });

        setTimeout(() => {
          showToast('🎉 Great news! Your 90-day recovery period is complete. You are eligible to donate again!', 'success');
        }, 1200);
      } else {
        setTimeout(() => {
          showToast(`⏳ Recovery active: ${daysRemaining} days remaining until eligible to donate again (${eligibleDateFormatted}).`, 'info');
        }, 1200);
      }
    } catch (e) {
      console.warn('Error evaluating recovery:', e);
    }
  };

  // Sync notifications and evaluate recovery whenever currentUser changes
  useEffect(() => {
    if (!currentUser) return;
    const syncRemoteNotifications = async () => {
      try {
        const res = await api.getNotifications();
        if (res?.success && Array.isArray(res.notifications) && res.notifications.length > 0) {
          setNotifications((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const fresh = res.notifications.filter((rn) => !existingIds.has(rn.id));
            return [...fresh, ...prev];
          });
        }
      } catch (e) {
        // Backend offline or local fallback
      }
    };
    syncRemoteNotifications();
    if (currentUser.lastDonationDate) {
      checkAndNotifyRecovery(currentUser);
    }
  }, [currentUser?.id]);

  // Auth actions
  const handleLogin = async (email, password) => {
    // Try backend API first
    try {
      const res = await api.login(email, password);
      if (res?.success && res.user) {
        localStorage.setItem('lifepulse_token', res.token);
        const mappedUser = {
          ...res.user,
          division: res.user.division || res.user.location?.division || 'Dhaka',
          district: res.user.district || res.user.location?.district || res.user.location?.city || 'Dhaka',
          upazila: res.user.upazila || res.user.location?.upazila || '',
          union: res.user.union || res.user.location?.union || '',
          village: res.user.village || res.user.location?.village || '',
          lat: res.user.location?.lat || 23.8103,
          lng: res.user.location?.lng || 90.4125,
          city: res.user.location?.city || 'Dhaka',
          area: res.user.location?.area || '',
          nearestHospital: res.user.location?.hospital || '',
          availableNow: res.user.isAvailable !== false,
          lastLoginAt: new Date().toISOString(),
          loginCount: (res.user.loginCount || 0) + 1
        };
        recordLoginSession(mappedUser, 'login');
        setCurrentUser(mappedUser);
        setIsAuthModalOpen(false);
        if (mappedUser.role === 'admin') {
          setIsAdminModalOpen(true);
          showToast('👑 Welcome back, Root Administrator! Admin Console unlocked.', 'success');
        } else {
          showToast(res.message || `Welcome back, ${res.user.name}!`, 'success');
          if (mappedUser.lastDonationDate) {
            checkAndNotifyRecovery(mappedUser);
          }
        }
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
    const updatedUser = {
      ...user,
      lastLoginAt: new Date().toISOString(),
      loginCount: (user.loginCount || 0) + 1
    };
    recordLoginSession(updatedUser, 'login');
    setUsers((prev) => prev.map((u) => (u.id === user.id ? updatedUser : u)));
    setCurrentUser(updatedUser);
    setIsAuthModalOpen(false);
    if (user.role === 'admin') {
      setIsAdminModalOpen(true);
      showToast('👑 Welcome back, Root Administrator! Admin Console unlocked.', 'success');
    } else {
      showToast(`Welcome back, ${user.name}!`, 'success');
      if (user.lastDonationDate) {
        checkAndNotifyRecovery(user);
      }
    }
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
          setIsAdminModalOpen(true);
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
      setIsAdminModalOpen(true);
      showToast('👑 Logged in as Administrator! Admin Console unlocked.', 'success');
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
      emergencyContact: regData.emergencyContact || 'Family Contact (+880 1...)',
      division: regData.division || 'Dhaka',
      district: regData.district || regData.city || 'Dhaka',
      upazila: regData.upazila || '',
      union: regData.union || '',
      village: regData.village || '',
      city: regData.district || regData.city || 'Dhaka',
      area: regData.area || regData.upazila || regData.district || 'Dhaka',
      address: regData.address || `${regData.village ? regData.village + ', ' : ''}${regData.upazila ? regData.upazila + ', ' : ''}${regData.district || 'Dhaka'}`,
      lat: parseFloat(regData.lat) || 23.8103 + (Math.random() - 0.5) * 0.05,
      lng: parseFloat(regData.lng) || 90.4125 + (Math.random() - 0.5) * 0.05,
      nearestHospital: regData.nearestHospital || 'District Hospital / Upazila Health Complex',
      totalDonations: 1,
      lastDonationDate: '',
      availableNow: true,
      hemoglobin: '14.0',
      notes: 'New active donor.',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(regData.name)}`,
      loginCount: 1,
      lastLoginAt: new Date().toISOString()
    };

    recordLoginSession(newUser, 'register');
    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);

    if (newUser.role === 'donor') {
      syncDonorEntry(newUser);
    }

    setIsAuthModalOpen(false);
    showToast(`Account created! Welcome, ${newUser.name} to LifePulse Bangladesh!`, 'success');
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
        division: user.division || 'Dhaka',
        district: user.district || user.city || 'Dhaka',
        upazila: user.upazila || '',
        union: user.union || '',
        village: user.village || '',
        city: user.district || user.city || 'Dhaka',
        area: user.area || user.upazila || user.city || 'Central',
        lat: parseFloat(user.lat) || 23.8103,
        lng: parseFloat(user.lng) || 90.4125,
        phone: user.phone || '+880 1711-000000',
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
      division: updatedData.division || currentUser.division || 'Dhaka',
      district: updatedData.district || currentUser.district || updatedData.city || currentUser.city || 'Dhaka',
      upazila: updatedData.upazila !== undefined ? updatedData.upazila : (currentUser.upazila || ''),
      union: updatedData.union !== undefined ? updatedData.union : (currentUser.union || ''),
      village: updatedData.village !== undefined ? updatedData.village : (currentUser.village || ''),
      city: updatedData.district || updatedData.city || currentUser.city || 'Dhaka',
      area: updatedData.area || updatedData.upazila || currentUser.area || '',
      lat: parseFloat(updatedData.lat) || currentUser.lat || 23.8103,
      lng: parseFloat(updatedData.lng) || currentUser.lng || 90.4125
    };

    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    syncDonorEntry(updatedUser);

    showToast('Profile data and Bangladesh location successfully uploaded & live on LifePulse!', 'success');
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

  // Record blood donation date, track 90-day recovery, and trigger automated website messages
  const handleRecordDonation = async (donationData) => {
    if (!currentUser) return;
    const donTime = new Date(donationData.donationDate).getTime();
    const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;
    const eligibleTime = donTime + ninetyDaysMs;
    const isEligible = Date.now() >= eligibleTime;
    const daysRemaining = Math.max(0, Math.ceil((eligibleTime - Date.now()) / (1000 * 60 * 60 * 24)));
    const eligibleDateFormatted = new Date(eligibleTime).toLocaleDateString(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    const updatedUser = {
      ...currentUser,
      lastDonationDate: donationData.donationDate,
      totalDonations: (Number(currentUser.totalDonations) || 0) + 1,
      availableNow: isEligible
    };

    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    syncDonorEntry(updatedUser);

    // Create automated website messages (in-app notifications)
    const newNotif = {
      id: 'notif_' + Date.now(),
      userId: currentUser.id,
      title: isEligible ? '🎉 Recovery Complete: Eligible to Donate Again!' : '🩸 Blood Donation Recorded',
      message: isEligible
        ? `Your donation on ${donationData.donationDate} has been recorded. You have already completed the 90-day recovery interval and are eligible to donate again!`
        : `Thank you for saving lives on ${donationData.donationDate} at ${donationData.hospital || 'Authorized Blood Center'}! Your 90-day recovery period is now active. You will be eligible to donate again on ${eligibleDateFormatted} (${daysRemaining} days remaining).`,
      type: isEligible ? 'eligibility' : 'donation',
      read: false,
      createdAt: new Date().toISOString(),
      metadata: {
        donationDate: donationData.donationDate,
        donationTime: donationData.donationTime,
        hospital: donationData.hospital,
        units: donationData.units,
        eligibleDate: eligibleDateFormatted,
        isEligible
      }
    };

    const careTipNotif = !isEligible ? {
      id: 'notif_care_' + (Date.now() + 1),
      userId: currentUser.id,
      title: '💧 Post-Donation Care Reminder',
      message: 'Drink plenty of water and electrolytes today, eat iron-rich foods, and avoid strenuous physical workouts for the next 24 hours.',
      type: 'info',
      read: false,
      createdAt: new Date().toISOString()
    } : null;

    setNotifications((prev) => (careTipNotif ? [newNotif, careTipNotif, ...prev] : [newNotif, ...prev]));

    showToast(
      isEligible
        ? '🎉 Blood donation recorded! You are eligible to donate again.'
        : `🩸 Donation recorded! Recovery period: 90 days. Next eligible date: ${eligibleDateFormatted}. Automated website alerts activated.`,
      'success'
    );

    // Sync with backend API if available
    try {
      await api.recordDonationDate(donationData);
    } catch (e) {
      console.warn('Backend sync failed, saved locally:', e);
    }
  };

  const handleMarkNotificationRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    try {
      api.markNotificationRead(id);
    } catch (e) {}
  };

  const handleClearNotifications = () => {
    if (currentUser) {
      setNotifications((prev) => prev.filter((n) => n.userId !== currentUser.id));
    } else {
      setNotifications([]);
    }
    try {
      api.clearNotifications();
    } catch (e) {}
    showToast('Website messages cleared.', 'info');
  };

  // Emergency SOS creation
  const handleCreateSos = (sosData) => {
    const newReq = {
      id: 'req_' + Date.now(),
      ...sosData,
      division: sosData.division || 'Dhaka',
      district: sosData.district || sosData.city || 'Dhaka',
      upazila: sosData.upazila || '',
      union: sosData.union || '',
      village: sosData.village || '',
      city: sosData.district || sosData.city || 'Dhaka',
      units: parseInt(sosData.units) || 1,
      requiredWithin:
        sosData.urgency === 'critical'
          ? 'Immediate (Next 2 Hours)'
          : sosData.urgency === 'urgent'
          ? 'Within 24 Hours'
          : 'Scheduled Surgery',
      lat: parseFloat(sosData.lat) || 23.8103 + (Math.random() - 0.5) * 0.05,
      lng: parseFloat(sosData.lng) || 90.4125 + (Math.random() - 0.5) * 0.05,
      dateAdded: 'Just now',
      verified: true
    };

    setRequests((prev) => [newReq, ...prev]);
    showToast(`🚨 Emergency SOS broadcasted for ${sosData.bloodGroup} in ${sosData.upazila ? sosData.upazila + ', ' : ''}${sosData.district || 'Dhaka'}! Matching donors alerted.`, 'danger');

    const el = document.getElementById('requestsSection');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const userNotifications = currentUser
    ? notifications.filter((n) => n.userId === currentUser.id || !n.userId)
    : [];

  return (
    <div className="app-root">
      {/* 1. Custom Interactive Cursor */}
      <CustomCursor />

      {/* 2. Luxury Bioluminescent Particle Background */}
      <AmbientBackground />

      {/* 3. Navigation Header with Page Routing */}
      <Navbar
        currentUser={currentUser}
        currentPage={currentPage}
        onNavigate={navigateTo}
        onOpenAuth={handleOpenAuth}
        onOpenSos={() => setIsSosModalOpen(true)}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        onOpenUpload={() => {
          if (!currentUser) handleOpenAuth('login');
          else setIsUploadModalOpen(true);
        }}
        notifications={userNotifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onClearNotifications={handleClearNotifications}
      />

      {/* =========================================================================
          PAGE 1: HOME PORTAL PAGE
          ========================================================================= */}
      {currentPage === 'home' && (
        <>
          {/* Hero Section */}
          <Hero
            platformAlert={platformAlert}
            onOpenUpload={() => {
              if (!currentUser) {
                handleOpenAuth('register');
                showToast('Please login or create an account to upload your data and location.', 'info');
              } else {
                setIsUploadModalOpen(true);
              }
            }}
            onOpenSos={() => setIsSosModalOpen(true)}
            onQuickSearch={(filters) => {
              setSearchFilters(filters);
              navigateTo('donors');
            }}
            onNavigate={navigateTo}
          />

          {/* User Profile Bar Preview (When logged in) */}
          {currentUser && (
            <div className="container mt-4 mb-2">
              <div
                className="interactive-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 24px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(15, 23, 42, 0.85))',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#fff', fontWeight: 700 }}>
                    Welcome back, {currentUser.name}! 🩸
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Blood Group: <strong>{currentUser.bloodGroup}</strong> • Location: <strong>{currentUser.upazila ? currentUser.upazila + ', ' : ''}{currentUser.district || 'Dhaka'}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={() => navigateTo('dashboard')}
                >
                  <UserCircle className="w-4 h-4 mr-1" />
                  <span>Open My Dashboard &amp; Records</span>
                </button>
              </div>
            </div>
          )}

          {/* Dedicated Portals Exploration Hub */}
          <HomeExplorePortals
            onNavigate={navigateTo}
            donorsCount={donors.length}
            requestsCount={requests.length}
          />

          {/* Urgent Emergency SOS Section Preview on Home */}
          {requests.length > 0 && (
            <div className="home-sos-preview-section section" style={{ paddingTop: 0 }}>
              <div className="container">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px',
                    marginBottom: '20px'
                  }}
                >
                  <div>
                    <div className="pill-badge mb-2">
                      <span className="pulse-dot" />
                      <span>LIVE EMERGENCY BROADCAST</span>
                    </div>
                    <h2 className="section-title" style={{ fontSize: '1.75rem', marginBottom: '4px' }}>
                      Urgent Blood Needs in <span className="gradient-text">Bangladesh</span>
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
                      Patients requiring immediate blood transfusions in medical centers right now.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigateTo('requests')}
                  >
                    <span>View All SOS Requests ({requests.length})</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>

                <SosRequests requests={requests.slice(0, 3)} />

                <div className="text-center mt-3">
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-lg"
                    onClick={() => navigateTo('requests')}
                  >
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    <span>Open Dedicated Emergency SOS Center ({requests.length} Active Requests)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* =========================================================================
          PAGE 2: DEDICATED DISTRICT & VILLAGE TRACKER PAGE
          ========================================================================= */}
      {currentPage === 'districts' && (
        <main className="dedicated-page-view">
          <PageHeader
            title="Bangladesh District & Village Tracker"
            subtitle="Categorized directory tracking registered blood donors and active user login sessions across all 64 Zillas, 495+ Upazilas, and villages."
            badge="NATIONWIDE REGIONAL ACTIVITY"
            icon={MapPin}
            currentPage="districts"
            onNavigate={navigateTo}
          />
          <RegionalDonorTracker
            donors={donors}
            users={users}
            loginActivities={loginActivities}
            onSelectLocationFilter={(filters) => {
              setSearchFilters(filters);
              navigateTo('donors');
            }}
            onOpenAuth={handleOpenAuth}
          />
        </main>
      )}

      {/* =========================================================================
          PAGE 3: DEDICATED HOSPITALS & BLOOD TRANSFUSION DIRECTORY PAGE
          ========================================================================= */}
      {currentPage === 'hospitals' && (
        <main className="dedicated-page-view">
          <PageHeader
            title="Hospitals & Blood Transfusion Centers"
            subtitle="Complete nationwide directory of government medical colleges, 250-bed general hospitals, and certified 24/7 blood transfusion facilities with GPS and emergency hotlines."
            badge="VERIFIED MEDICAL DIRECTORY"
            icon={Hospital}
            currentPage="hospitals"
            onNavigate={navigateTo}
          />
          <BangladeshHospitals
            onLocateOnMap={(hospital) => {
              navigateTo('map');
            }}
          />
        </main>
      )}

      {/* =========================================================================
          PAGE 4: DEDICATED FIND DONORS DIRECTORY PAGE
          ========================================================================= */}
      {currentPage === 'donors' && (
        <main className="dedicated-page-view">
          <PageHeader
            title="Find Verified Blood Donors"
            subtitle="Search and connect with life savers across all 64 districts in Bangladesh by blood group (A+, B+, O+, AB+), division, and availability."
            badge="VERIFIED LIFE SAVERS"
            icon={Droplet}
            currentPage="donors"
            onNavigate={navigateTo}
          />
          <DonorDirectory donors={donors} initialFilters={searchFilters} />
        </main>
      )}

      {/* =========================================================================
          PAGE 5: DEDICATED LIVE GEOLOCATION RADAR MAP PAGE
          ========================================================================= */}
      {currentPage === 'map' && (
        <main className="dedicated-page-view">
          <PageHeader
            title="Live Geolocation Radar Map"
            subtitle="Interactive high-resolution Google Maps visualizing volunteer donors, medical institutions, and critical emergency SOS requests across Bangladesh."
            badge="OFFICIAL GOOGLE MAPS RADAR"
            icon={Compass}
            currentPage="map"
            onNavigate={navigateTo}
          />
          <LiveMap donors={donors} requests={requests} currentUser={currentUser} />
        </main>
      )}

      {/* =========================================================================
          PAGE 6: DEDICATED URGENT EMERGENCY SOS REQUESTS PAGE
          ========================================================================= */}
      {currentPage === 'requests' && (
        <main className="dedicated-page-view">
          <PageHeader
            title="Urgent Emergency Blood SOS Center"
            subtitle="Real-time broadcast for patients requiring emergency blood transfusions in hospitals across Bangladesh. Broadcast a new SOS or contact matching donors."
            badge="CRITICAL EMERGENCY BROADCAST"
            icon={AlertTriangle}
            currentPage="requests"
            onNavigate={navigateTo}
          />
          <div className="container mb-4 text-center">
            <button
              type="button"
              className="btn btn-danger-sos btn-lg"
              onClick={() => setIsSosModalOpen(true)}
            >
              <AlertTriangle className="w-5 h-5 mr-2" />
              <span>Broadcast New Emergency SOS Request</span>
            </button>
          </div>
          <SosRequests requests={requests} />
        </main>
      )}

      {/* =========================================================================
          PAGE 7: DEDICATED BLOOD COMPATIBILITY & ELIGIBILITY QUIZ PAGE
          ========================================================================= */}
      {currentPage === 'compatibility' && (
        <main className="dedicated-page-view">
          <PageHeader
            title="Blood Compatibility Matrix & Eligibility Quiz"
            subtitle="Explore medical transfusion compatibility rules and take our 60-second questionnaire to verify whether you can safely donate blood today."
            badge="CLINICAL GUIDELINES & QUIZ"
            icon={Layers}
            currentPage="compatibility"
            onNavigate={navigateTo}
          />
          <CompatibilityMatrix />
          <EligibilityQuiz
            onOpenUpload={() => {
              if (!currentUser) handleOpenAuth('register');
              else setIsUploadModalOpen(true);
            }}
          />
        </main>
      )}

      {/* =========================================================================
          PAGE 8: DEDICATED USER DASHBOARD & PROFILE PAGE
          ========================================================================= */}
      {currentPage === 'dashboard' && (
        <main className="dedicated-page-view">
          <PageHeader
            title="My Profile & Location Data"
            subtitle="Manage your blood donor profile, location, automated 90-day recovery reminders, and website messages."
            badge="DONOR DASHBOARD"
            icon={UserCircle}
            currentPage="dashboard"
            onNavigate={navigateTo}
          />
          {currentUser ? (
            <UserDashboard
              currentUser={currentUser}
              onOpenUpload={() => setIsUploadModalOpen(true)}
              onLogout={() => {
                handleLogout();
                navigateTo('home');
              }}
              onToggleAvailability={handleToggleAvailability}
              onOpenRecordDonation={() => setIsRecordDonationModalOpen(true)}
              notifications={userNotifications}
              onMarkNotificationRead={handleMarkNotificationRead}
            />
          ) : (
            <div className="container text-center py-5">
              <div
                className="interactive-card p-5"
                style={{
                  maxWidth: '520px',
                  margin: '40px auto',
                  padding: '40px 24px',
                  borderRadius: '20px',
                  background: 'rgba(15, 23, 42, 0.85)',
                  border: '1px solid rgba(239, 68, 68, 0.3)'
                }}
              >
                <UserCircle className="w-16 h-16 text-rose-500 mx-auto mb-3" />
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
                  Member Authentication Required
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
                  Please log in or create an account to view and manage your profile, location data, automated donation recovery timeline, and private messages.
                </p>
                <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  onClick={() => handleOpenAuth('login')}
                >
                  Log In / Create Account
                </button>
              </div>
            </div>
          )}
        </main>
      )}

      {/* Footer (Available on all pages) */}
      <Footer
        currentUser={currentUser}
        onOpenUpload={() => {
          if (!currentUser) handleOpenAuth('register');
          else setIsUploadModalOpen(true);
        }}
        onOpenAuth={handleOpenAuth}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        onNavigate={navigateTo}
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
        initialTab={authModalTab}
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

      <RecordDonationModal
        isOpen={isRecordDonationModalOpen}
        onClose={() => setIsRecordDonationModalOpen(false)}
        onSave={handleRecordDonation}
        currentUser={currentUser}
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
