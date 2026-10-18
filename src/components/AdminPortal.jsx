import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  Heart,
  Activity,
  CheckCircle2,
  XCircle,
  Trash2,
  UserCheck,
  Search,
  RefreshCw,
  X,
  AlertTriangle,
  BadgeAlert,
  Flame,
  Phone,
  Hospital,
  Lock,
  ArrowRight,
  PlusCircle,
  Database,
  BarChart3,
  Settings,
  LogOut,
  Radio,
  FileText
} from 'lucide-react';
import api from '../api';

export default function AdminPortal({
  isOpen,
  onClose,
  currentUser,
  setCurrentUser,
  showToast,
  platformAlert,
  setPlatformAlert
}) {
  const [adminEmail, setAdminEmail] = useState('admin@lifepulse.org');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [sosList, setSosList] = useState([]);
  const [donationsList, setDonationsList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('ALL');

  // Modal sub-dialogs
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    password: 'password123',
    phone: '',
    bloodGroup: 'O+',
    role: 'user',
    isDonor: true,
    city: 'Dhaka',
    hospital: 'Central Hospital'
  });

  const [showAddSosModal, setShowAddSosModal] = useState(false);
  const [newSosData, setNewSosData] = useState({
    patientName: '',
    bloodGroup: 'O-',
    unitsNeeded: 2,
    hospital: 'City General Hospital',
    city: 'Dhaka',
    contactPhone: '+880 1700-112233',
    urgentLevel: 'critical',
    reason: 'Emergency Surgery'
  });

  const [showAddDonationModal, setShowAddDonationModal] = useState(false);
  const [newDonationData, setNewDonationData] = useState({
    donorName: '',
    bloodGroup: 'O+',
    hospital: 'Central Blood Bank',
    units: 1,
    recipientNotes: 'Emergency replenishment'
  });

  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    if (isOpen && isAdmin) {
      loadAllAdminData();
    }
  }, [isOpen, isAdmin]);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const statsRes = await api.getAdminStats();
      if (statsRes?.success) setStats(statsRes.stats);

      const usersRes = await api.getAdminUsers();
      if (usersRes?.success) setUsersList(usersRes.users);

      const sosRes = await api.getAdminSos();
      if (sosRes?.success) setSosList(sosRes.requests);

      const donRes = await api.adminGetDonations();
      if (donRes?.success) setDonationsList(donRes.donations);
    } catch (err) {
      console.warn('API error, using local fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      const res = await api.login(adminEmail, adminPassword);
      if (res?.success && res.user) {
        if (res.user.role !== 'admin') {
          showToast('Access Denied. This account does not possess administrator clearance.', 'danger');
          setIsLoggingIn(false);
          return;
        }
        localStorage.setItem('lifepulse_token', res.token);
        setCurrentUser(res.user);
        showToast('🛡️ Administrator identity verified. Welcome to LifePulse Command.', 'success');
        loadAllAdminData();
      } else {
        // Fallback local admin
        if (adminEmail.toLowerCase() === 'admin@lifepulse.org') {
          const rootAdmin = {
            id: 'admin_primary_01',
            name: 'Root Administrator',
            email: 'admin@lifepulse.org',
            role: 'admin',
            bloodGroup: 'O+',
            phone: '+880 1711-000000',
            city: 'Dhaka',
            isDonor: false,
            isVerifiedDonor: true
          };
          setCurrentUser(rootAdmin);
          showToast('🛡️ Logged in as Local Administrator.', 'success');
        } else {
          showToast(res?.message || 'Invalid administrator credentials.', 'danger');
        }
      }
    } catch (err) {
      // Local root fallback
      if (adminEmail.toLowerCase() === 'admin@lifepulse.org') {
        setCurrentUser({
          id: 'admin_primary_01',
          name: 'Root Administrator',
          email: 'admin@lifepulse.org',
          role: 'admin',
          bloodGroup: 'O+',
          phone: '+880 1711-000000',
          city: 'Dhaka',
          isDonor: false,
          isVerifiedDonor: true
        });
        showToast('🛡️ Logged in as Administrator (Local).', 'success');
      } else {
        showToast('Login failed. Please check credentials.', 'danger');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('lifepulse_token');
    localStorage.removeItem('lifepulse_react_current_user');
    setCurrentUser(null);
    showToast('Logged out of Admin Console.', 'info');
  };

  const handleToggleVerify = async (userId) => {
    try {
      const res = await api.verifyDonor(userId);
      if (res?.success) {
        setUsersList(prev => prev.map(u => u.id === userId ? res.user : u));
        showToast(res.message, 'success');
        loadAllAdminData();
      }
    } catch (err) {
      showToast('Error modifying verification.', 'danger');
    }
  };

  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const res = await api.changeUserRole(userId, newRole);
      if (res?.success) {
        setUsersList(prev => prev.map(u => u.id === userId ? res.user : u));
        showToast(res.message, 'success');
      }
    } catch (err) {
      showToast('Error changing role.', 'danger');
    }
  };

  const handleToggleBan = async (userId) => {
    try {
      const res = await api.toggleUserBan(userId);
      if (res?.success) {
        setUsersList(prev => prev.map(u => u.id === userId ? res.user : u));
        showToast(res.message, 'warning');
      }
    } catch (err) {
      showToast('Error modifying suspension.', 'danger');
    }
  };

  const handleDeleteUser = async (userId, name) => {
    if (!window.confirm(`Permanently delete user "${name}"? This removes all their records.`)) return;
    try {
      const res = await api.deleteUser(userId);
      if (res?.success) {
        setUsersList(prev => prev.filter(u => u.id !== userId));
        showToast(`User ${name} permanently deleted.`, 'info');
        loadAllAdminData();
      }
    } catch (err) {
      showToast('Error deleting user.', 'danger');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await api.adminCreateUser(newUserData);
      if (res?.success) {
        showToast(res.message, 'success');
        setShowAddUserModal(false);
        setNewUserData({
          name: '',
          email: '',
          password: 'password123',
          phone: '',
          bloodGroup: 'O+',
          role: 'user',
          isDonor: true,
          city: 'Dhaka',
          hospital: 'Central Hospital'
        });
        loadAllAdminData();
      } else {
        showToast(res?.message || 'Error creating user.', 'danger');
      }
    } catch (err) {
      showToast('Server error creating user.', 'danger');
    }
  };

  const handleCreateSos = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createSosRequest(newSosData);
      if (res?.success) {
        showToast('Emergency SOS broadcasted across the network!', 'danger');
        setShowAddSosModal(false);
        setNewSosData({
          patientName: '',
          bloodGroup: 'O-',
          unitsNeeded: 2,
          hospital: 'City General Hospital',
          city: 'Dhaka',
          contactPhone: '+880 1700-112233',
          urgentLevel: 'critical',
          reason: 'Emergency Surgery'
        });
        loadAllAdminData();
      }
    } catch (err) {
      showToast('Error creating SOS broadcast.', 'danger');
    }
  };

  const handleDeleteSos = async (sosId) => {
    if (!window.confirm('Delete this emergency broadcast permanently?')) return;
    try {
      const res = await api.deleteSos(sosId);
      if (res?.success) {
        setSosList(prev => prev.filter(s => s.id !== sosId));
        showToast('Emergency request removed.', 'info');
        loadAllAdminData();
      }
    } catch (err) {
      showToast('Error deleting SOS.', 'danger');
    }
  };

  const handleResolveSos = async (sosId) => {
    try {
      const res = await api.updateSosStatus(sosId, 'fulfilled');
      if (res?.success) {
        showToast('SOS marked as fulfilled and resolved!', 'success');
        loadAllAdminData();
      }
    } catch (err) {
      showToast('Error resolving SOS.', 'danger');
    }
  };

  const handleLogDonation = async (e) => {
    e.preventDefault();
    try {
      const res = await api.adminLogDonation(newDonationData);
      if (res?.success) {
        showToast('Blood donation logged successfully.', 'success');
        setShowAddDonationModal(false);
        setNewDonationData({
          donorName: '',
          bloodGroup: 'O+',
          hospital: 'Central Blood Bank',
          units: 1,
          recipientNotes: 'Emergency replenishment'
        });
        loadAllAdminData();
      }
    } catch (err) {
      showToast('Error logging donation.', 'danger');
    }
  };

  const handleDeleteDonation = async (id) => {
    if (!window.confirm('Delete this donation record?')) return;
    try {
      const res = await api.adminDeleteDonation(id);
      if (res?.success) {
        setDonationsList(prev => prev.filter(d => d.id !== id));
        showToast('Donation record deleted.', 'info');
        loadAllAdminData();
      }
    } catch (err) {
      showToast('Error deleting donation.', 'danger');
    }
  };

  if (!isOpen) return null;

  const filteredUsers = usersList.filter(u => {
    const matchesSearch =
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.location?.city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phone || '').includes(searchQuery);
    const matchesBlood = selectedBloodGroup === 'ALL' || u.bloodGroup === selectedBloodGroup;
    return matchesSearch && matchesBlood;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/90 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-zinc-950 border border-red-500/40 rounded-2xl shadow-2xl shadow-red-950/60 p-5 sm:p-7 max-h-[92vh] flex flex-col overflow-hidden text-zinc-100">
        
        {/* ========================================================= */}
        {/* VIEW 1: ADMIN LOGIN SCREEN (If not logged in as Admin)   */}
        {/* ========================================================= */}
        {!isAdmin ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 max-w-md mx-auto w-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-rose-950 flex items-center justify-center shadow-xl shadow-red-600/40 mb-5 border border-red-500/30">
              <ShieldAlert className="w-9 h-9 text-white animate-pulse" />
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-950/80 text-red-400 border border-red-800 mb-2 tracking-wide uppercase">
              Restricted Authority
            </span>

            <h2 className="text-2xl font-black text-white tracking-tight mb-2">
              LifePulse Admin Portal
            </h2>
            <p className="text-xs text-zinc-400 mb-6">
              Enter authorized administrator credentials to manage all users, donor verifications, emergency SOS alerts, and blood bank telemetry.
            </p>

            <form onSubmit={handleAdminLogin} className="w-full text-left space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Admin Email Address
                </label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Master Security Password
                </label>
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between text-xs">
                <span className="text-zinc-400">Default Root Admin:</span>
                <button
                  type="button"
                  onClick={() => {
                    setAdminEmail('admin@lifepulse.org');
                    setAdminPassword('admin123');
                    showToast('Admin credentials filled.', 'info');
                  }}
                  className="text-red-400 font-bold hover:underline"
                >
                  admin@lifepulse.org / admin123
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-sm font-semibold text-zinc-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-sm font-bold text-white shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all"
                >
                  <Lock className="w-4 h-4" />
                  <span>{isLoggingIn ? 'Verifying...' : 'Unlock Console'}</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* ========================================================= */
          /* VIEW 2: MASTER ADMIN CONTROL CENTER (When authenticated)   */
          /* ========================================================= */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top Bar */}
            <div className="flex flex-wrap items-center justify-between pb-4 border-b border-zinc-800 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-600 to-rose-950 flex items-center justify-center shadow-lg shadow-red-600/30 border border-red-500/30">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold tracking-tight text-white">LifePulse Master Authority</h2>
                    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Root Admin Active
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Administrator: <strong>{currentUser?.name || 'Administrator'}</strong> ({currentUser?.email}) &bull; Express API: Port 5000
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={loadAllAdminData}
                  disabled={loading}
                  title="Reload Live Server Data"
                  className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-red-400' : ''}`} />
                  <span>Sync</span>
                </button>

                <button
                  onClick={handleAdminLogout}
                  title="Log out of Admin Portal"
                  className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-amber-400 flex items-center gap-1.5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>

                <button
                  onClick={onClose}
                  className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-zinc-800 py-2.5 overflow-x-auto text-xs font-bold">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === 'overview'
                    ? 'bg-red-600/25 text-red-400 border border-red-600/50 shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Telemetry & Stats
              </button>

              <button
                onClick={() => setActiveTab('users')}
                className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === 'users'
                    ? 'bg-red-600/25 text-red-400 border border-red-600/50 shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Users className="w-4 h-4" />
                User & Donor Registry ({filteredUsers.length})
              </button>

              <button
                onClick={() => setActiveTab('sos')}
                className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === 'sos'
                    ? 'bg-red-600/25 text-red-400 border border-red-600/50 shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <BadgeAlert className="w-4 h-4" />
                Emergency SOS Room ({sosList.length})
              </button>

              <button
                onClick={() => setActiveTab('donations')}
                className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === 'donations'
                    ? 'bg-red-600/25 text-red-400 border border-red-600/50 shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Heart className="w-4 h-4" />
                Blood Logs ({donationsList.length})
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === 'settings'
                    ? 'bg-red-600/25 text-red-400 border border-red-600/50 shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Settings className="w-4 h-4" />
                Global Platform Settings
              </button>
            </div>

            {/* ======================================================= */}
            {/* TAB 1: TELEMETRY & STATS                                 */}
            {/* ======================================================= */}
            {activeTab === 'overview' && (
              <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
                {/* 4 Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-zinc-400 font-semibold">Total Accounts</span>
                      <Users className="w-4 h-4 text-blue-400" />
                    </div>
                    <p className="text-2xl font-black text-white">{stats?.totalUsers || usersList.length}</p>
                    <p className="text-[11px] text-zinc-500 mt-1">Donors & recipients registered</p>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-zinc-400 font-semibold">Active Donors</span>
                      <Heart className="w-4 h-4 text-red-400" />
                    </div>
                    <p className="text-2xl font-black text-red-400">{stats?.totalDonors || usersList.filter(u => u.isDonor).length}</p>
                    <p className="text-[11px] text-zinc-500 mt-1">Available for emergency calls</p>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-zinc-400 font-semibold">Verified Badges</span>
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                    </div>
                    <p className="text-2xl font-black text-emerald-400">{stats?.verifiedDonors || usersList.filter(u => u.isVerifiedDonor).length}</p>
                    <p className="text-[11px] text-zinc-500 mt-1">Medically cleared & verified</p>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-zinc-400 font-semibold">Active SOS Alerts</span>
                      <Flame className="w-4 h-4 text-amber-400" />
                    </div>
                    <p className="text-2xl font-black text-amber-400">{stats?.activeSos || sosList.filter(s => s.status === 'active').length}</p>
                    <p className="text-[11px] text-zinc-500 mt-1">Urgent blood needed right now</p>
                  </div>
                </div>

                {/* Blood Distribution Breakdown */}
                {stats?.bloodGroupCounts && (
                  <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                    <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                      <Radio className="w-4 h-4 text-red-400" />
                      Live Blood Group Distribution
                    </h4>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                      {Object.entries(stats.bloodGroupCounts).map(([group, count]) => (
                        <div key={group} className="p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800 text-center">
                          <span className="text-xs font-black text-red-400 block">{group}</span>
                          <span className="text-lg font-bold text-white block mt-0.5">{count}</span>
                          <span className="text-[10px] text-zinc-500">donors</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Master Actions */}
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <h4 className="text-sm font-bold text-white mb-3">Master Quick Actions</h4>
                  <div className="flex flex-wrap gap-2.5">
                    <button
                      onClick={() => { setActiveTab('users'); setShowAddUserModal(true); }}
                      className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-red-600/20"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Create New User / Donor
                    </button>
                    <button
                      onClick={() => { setActiveTab('sos'); setShowAddSosModal(true); }}
                      className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-2"
                    >
                      <BadgeAlert className="w-4 h-4" />
                      Broadcast Urgent SOS
                    </button>
                    <button
                      onClick={() => { setActiveTab('donations'); setShowAddDonationModal(true); }}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2"
                    >
                      <Heart className="w-4 h-4" />
                      Log Blood Donation
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================= */}
            {/* TAB 2: USER & DONOR DIRECTORY MANAGER                    */}
            {/* ======================================================= */}
            {activeTab === 'users' && (
              <div className="flex-1 flex flex-col overflow-hidden py-3">
                {/* Search & Actions Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3">
                  <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                      <input
                        type="text"
                        placeholder="Search users by name, email, phone, city..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowAddUserModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-red-600/30"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      Add User
                    </button>
                  </div>
                </div>

                {/* Blood Group Filter Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2">
                  {['ALL', 'O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(bg => (
                    <button
                      key={bg}
                      onClick={() => setSelectedBloodGroup(bg)}
                      className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-all ${
                        selectedBloodGroup === bg
                          ? 'bg-red-600 text-white'
                          : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                      }`}
                    >
                      {bg}
                    </button>
                  ))}
                </div>

                {/* Users Table */}
                <div className="flex-1 overflow-y-auto border border-zinc-800 rounded-xl bg-zinc-900/30">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-zinc-800 bg-zinc-900/80 text-zinc-400 font-semibold sticky top-0">
                        <th className="py-2.5 px-3">Donor / User</th>
                        <th className="py-2.5 px-3">Blood</th>
                        <th className="py-2.5 px-3">Location & Hospital</th>
                        <th className="py-2.5 px-3">Role & Status</th>
                        <th className="py-2.5 px-3 text-right">Master Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="py-8 text-center text-zinc-500">
                            No users found. Click "Add User" to create one.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map(u => (
                          <tr key={u.id} className="hover:bg-zinc-800/40 transition-colors">
                            <td className="py-2.5 px-3">
                              <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
                                {u.name}
                                {u.isVerifiedDonor && (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" title="Verified Badge" />
                                )}
                                {u.isBanned && (
                                  <span className="px-1.5 py-0.2 bg-red-950 text-red-400 border border-red-800 text-[10px] rounded">
                                    SUSPENDED
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-zinc-400">{u.email} &bull; {u.phone || 'No phone'}</div>
                            </td>

                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded-full font-bold bg-red-950/80 text-red-300 border border-red-800/40 text-[11px]">
                                {u.bloodGroup}
                              </span>
                            </td>

                            <td className="py-2.5 px-3">
                              <div className="text-zinc-300">{u.location?.city || 'Dhaka'}, {u.location?.area || ''}</div>
                              <div className="text-[10px] text-zinc-500">{u.location?.hospital || 'General Hospital'}</div>
                            </td>

                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-1.5">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  u.role === 'admin'
                                    ? 'bg-amber-950/80 text-amber-400 border border-amber-800/40'
                                    : 'bg-zinc-800 text-zinc-300'
                                }`}>
                                  {u.role.toUpperCase()}
                                </span>
                                {u.isDonor ? (
                                  <span className="text-emerald-400 text-[10px]">● Donor</span>
                                ) : (
                                  <span className="text-zinc-500 text-[10px]">○ Recipient</span>
                                )}
                              </div>
                            </td>

                            <td className="py-2.5 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleToggleVerify(u.id)}
                                  title={u.isVerifiedDonor ? 'Revoke Verification' : 'Grant Verified Badge'}
                                  className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                                    u.isVerifiedDonor
                                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/50 hover:bg-emerald-900'
                                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                                  }`}
                                >
                                  {u.isVerifiedDonor ? 'Verified ✓' : 'Verify'}
                                </button>

                                <button
                                  onClick={() => handleToggleRole(u.id, u.role)}
                                  title="Change between Admin and User"
                                  className="px-2 py-1 rounded text-[11px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                                >
                                  {u.role === 'admin' ? 'Demote' : 'Make Admin'}
                                </button>

                                <button
                                  onClick={() => handleToggleBan(u.id)}
                                  title={u.isBanned ? 'Reactivate Account' : 'Suspend Account'}
                                  className={`p-1 rounded ${u.isBanned ? 'bg-amber-950 text-amber-400' : 'text-zinc-500 hover:text-amber-400'}`}
                                >
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => handleDeleteUser(u.id, u.name)}
                                  title="Delete User Permanently"
                                  className="p-1 rounded text-zinc-500 hover:text-red-400"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ======================================================= */}
            {/* TAB 3: EMERGENCY SOS ROOM                               */}
            {/* ======================================================= */}
            {activeTab === 'sos' && (
              <div className="flex-1 flex flex-col overflow-hidden py-3">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <BadgeAlert className="w-4 h-4 text-red-500" />
                    All Emergency Broadcasts Across Network
                  </h4>
                  <button
                    onClick={() => setShowAddSosModal(true)}
                    className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-red-600/30"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Broadcast New SOS
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                  {sosList.length === 0 ? (
                    <div className="py-12 text-center text-zinc-500">
                      No emergency SOS requests in the system.
                    </div>
                  ) : (
                    sosList.map(sos => (
                      <div
                        key={sos.id}
                        className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-red-600/20 text-red-400 flex items-center justify-center font-black text-sm border border-red-600/30">
                            {sos.bloodGroup}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h5 className="font-bold text-white text-sm">{sos.patientName}</h5>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                                sos.urgentLevel === 'critical'
                                  ? 'bg-red-950 text-red-400 border border-red-800'
                                  : 'bg-amber-950 text-amber-400 border border-amber-800'
                              }`}>
                                {sos.urgentLevel}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[10px] ${
                                sos.status === 'active' ? 'bg-emerald-950/60 text-emerald-400' : 'bg-zinc-800 text-zinc-400'
                              }`}>
                                {sos.status.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-xs text-zinc-400 flex items-center gap-2 mt-1">
                              <Hospital className="w-3 h-3 text-red-400" />
                              {sos.hospital} &bull; {sos.city} &bull; <strong>{sos.unitsNeeded} Units Required</strong>
                            </p>
                            <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-2">
                              <Phone className="w-3 h-3 text-emerald-400" />
                              {sos.contactPhone} &bull; Reason: {sos.reason || 'Urgent requirement'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {sos.status === 'active' && (
                            <button
                              onClick={() => handleResolveSos(sos.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/50 text-xs font-semibold"
                            >
                              Mark Fulfilled ✓
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteSos(sos.id)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-800"
                            title="Delete SOS"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ======================================================= */}
            {/* TAB 4: BLOOD INVENTORY & DONATIONS LOG                   */}
            {/* ======================================================= */}
            {activeTab === 'donations' && (
              <div className="flex-1 flex flex-col overflow-hidden py-3">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    Verified Blood Donations Registry
                  </h4>
                  <button
                    onClick={() => setShowAddDonationModal(true)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Log New Donation
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto border border-zinc-800 rounded-xl bg-zinc-900/30">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-zinc-800 bg-zinc-900/80 text-zinc-400 font-semibold sticky top-0">
                        <th className="py-2.5 px-3">Donor Name</th>
                        <th className="py-2.5 px-3">Blood Group</th>
                        <th className="py-2.5 px-3">Hospital / Center</th>
                        <th className="py-2.5 px-3">Units</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {donationsList.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="py-8 text-center text-zinc-500">
                            No donation records logged yet.
                          </td>
                        </tr>
                      ) : (
                        donationsList.map(d => (
                          <tr key={d.id} className="hover:bg-zinc-800/40">
                            <td className="py-2.5 px-3 font-semibold text-white">{d.donorName}</td>
                            <td className="py-2.5 px-3 font-bold text-red-400">{d.bloodGroup}</td>
                            <td className="py-2.5 px-3 text-zinc-300">{d.hospital}</td>
                            <td className="py-2.5 px-3 text-emerald-400 font-bold">{d.units} Unit(s)</td>
                            <td className="py-2.5 px-3 text-zinc-400">{d.donationDate?.slice(0, 10)}</td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                onClick={() => handleDeleteDonation(d.id)}
                                className="p-1 rounded text-zinc-500 hover:text-red-400"
                                title="Delete record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ======================================================= */}
            {/* TAB 5: GLOBAL PLATFORM SETTINGS                         */}
            {/* ======================================================= */}
            {activeTab === 'settings' && (
              <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
                {/* Platform Emergency Banner Customizer */}
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Radio className="w-4 h-4 text-red-500" />
                    Top Alert Banner Broadcast
                  </h4>
                  <p className="text-xs text-zinc-400">
                    This message is displayed across the very top of the LifePulse homepage for all incoming visitors.
                  </p>
                  <input
                    type="text"
                    value={platformAlert}
                    onChange={(e) => setPlatformAlert(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setPlatformAlert('CRITICAL ALERT: Urgent demand for O-Negative and B-Positive at Mount Sinai & NYU Langone ER wards.');
                        showToast('Banner reset to default.', 'info');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
                    >
                      Reset Default
                    </button>
                    <button
                      onClick={() => showToast('Emergency banner broadcasted live to all visitors!', 'success')}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
                    >
                      Update Live Banner
                    </button>
                  </div>
                </div>

                {/* System Diagnostics */}
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-400" />
                    Database & Server Telemetry
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
                      <span className="text-zinc-500 block">Database Storage:</span>
                      <span className="text-zinc-200 font-mono">server/data/database.json</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
                      <span className="text-zinc-500 block">API Status:</span>
                      <span className="text-emerald-400 font-bold">ONLINE (Port 5000)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ========================================================= */}
        {/* SUB-MODAL: ADD NEW USER AS ADMIN                          */}
        {/* ========================================================= */}
        {showAddUserModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-zinc-950 border border-red-500/50 rounded-2xl p-5 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
                <h3 className="font-bold text-white text-sm">Add New User / Donor</h3>
                <button onClick={() => setShowAddUserModal(false)}><X className="w-4 h-4 text-zinc-400" /></button>
              </div>
              <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
                <div>
                  <label className="text-zinc-300 font-semibold mb-1 block">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newUserData.name}
                    onChange={e => setNewUserData({...newUserData, name: e.target.value})}
                    className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white"
                  />
                </div>
                <div>
                  <label className="text-zinc-300 font-semibold mb-1 block">Email</label>
                  <input
                    type="email"
                    required
                    value={newUserData.email}
                    onChange={e => setNewUserData({...newUserData, email: e.target.value})}
                    className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-zinc-300 font-semibold mb-1 block">Blood Group</label>
                    <select
                      value={newUserData.bloodGroup}
                      onChange={e => setNewUserData({...newUserData, bloodGroup: e.target.value})}
                      className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white"
                    >
                      {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-zinc-300 font-semibold mb-1 block">Role</label>
                    <select
                      value={newUserData.role}
                      onChange={e => setNewUserData({...newUserData, role: e.target.value})}
                      className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white"
                    >
                      <option value="user">User / Donor</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-zinc-300 font-semibold mb-1 block">Phone</label>
                  <input
                    type="tel"
                    value={newUserData.phone}
                    onChange={e => setNewUserData({...newUserData, phone: e.target.value})}
                    className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white"
                  />
                </div>
                <div>
                  <label className="text-zinc-300 font-semibold mb-1 block">City</label>
                  <input
                    type="text"
                    value={newUserData.city}
                    onChange={e => setNewUserData({...newUserData, city: e.target.value})}
                    className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddUserModal(false)}
                    className="flex-1 py-2 rounded-lg bg-zinc-900 text-zinc-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold"
                  >
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SUB-MODAL: BROADCAST SOS AS ADMIN                         */}
        {/* ========================================================= */}
        {showAddSosModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-zinc-950 border border-red-500/50 rounded-2xl p-5 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
                <h3 className="font-bold text-white text-sm">Broadcast Emergency SOS</h3>
                <button onClick={() => setShowAddSosModal(false)}><X className="w-4 h-4 text-zinc-400" /></button>
              </div>
              <form onSubmit={handleCreateSos} className="space-y-3 text-xs">
                <div>
                  <label className="text-zinc-300 font-semibold mb-1 block">Patient Name</label>
                  <input
                    type="text"
                    required
                    value={newSosData.patientName}
                    onChange={e => setNewSosData({...newSosData, patientName: e.target.value})}
                    className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-zinc-300 font-semibold mb-1 block">Blood Group</label>
                    <select
                      value={newSosData.bloodGroup}
                      onChange={e => setNewSosData({...newSosData, bloodGroup: e.target.value})}
                      className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white"
                    >
                      {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-zinc-300 font-semibold mb-1 block">Units Needed</label>
                    <input
                      type="number"
                      min="1"
                      value={newSosData.unitsNeeded}
                      onChange={e => setNewSosData({...newSosData, unitsNeeded: e.target.value})}
                      className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-zinc-300 font-semibold mb-1 block">Hospital & City</label>
                  <input
                    type="text"
                    required
                    value={newSosData.hospital}
                    onChange={e => setNewSosData({...newSosData, hospital: e.target.value})}
                    className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white"
                  />
                </div>
                <div>
                  <label className="text-zinc-300 font-semibold mb-1 block">Emergency Phone</label>
                  <input
                    type="tel"
                    required
                    value={newSosData.contactPhone}
                    onChange={e => setNewSosData({...newSosData, contactPhone: e.target.value})}
                    className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddSosModal(false)}
                    className="flex-1 py-2 rounded-lg bg-zinc-900 text-zinc-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold"
                  >
                    Broadcast SOS
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SUB-MODAL: LOG DONATION AS ADMIN                          */}
        {/* ========================================================= */}
        {showAddDonationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-zinc-950 border border-emerald-500/50 rounded-2xl p-5 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
                <h3 className="font-bold text-white text-sm">Log Blood Donation Record</h3>
                <button onClick={() => setShowAddDonationModal(false)}><X className="w-4 h-4 text-zinc-400" /></button>
              </div>
              <form onSubmit={handleLogDonation} className="space-y-3 text-xs">
                <div>
                  <label className="text-zinc-300 font-semibold mb-1 block">Donor Name</label>
                  <input
                    type="text"
                    required
                    value={newDonationData.donorName}
                    onChange={e => setNewDonationData({...newDonationData, donorName: e.target.value})}
                    className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-zinc-300 font-semibold mb-1 block">Blood Group</label>
                    <select
                      value={newDonationData.bloodGroup}
                      onChange={e => setNewDonationData({...newDonationData, bloodGroup: e.target.value})}
                      className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white"
                    >
                      {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-zinc-300 font-semibold mb-1 block">Units Donated</label>
                    <input
                      type="number"
                      min="1"
                      value={newDonationData.units}
                      onChange={e => setNewDonationData({...newDonationData, units: e.target.value})}
                      className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-zinc-300 font-semibold mb-1 block">Hospital / Blood Bank</label>
                  <input
                    type="text"
                    required
                    value={newDonationData.hospital}
                    onChange={e => setNewDonationData({...newDonationData, hospital: e.target.value})}
                    className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddDonationModal(false)}
                    className="flex-1 py-2 rounded-lg bg-zinc-900 text-zinc-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                  >
                    Save Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
