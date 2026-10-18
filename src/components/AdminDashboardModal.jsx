import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
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
  Hospital
} from 'lucide-react';
import api from '../api';

export default function AdminDashboardModal({ isOpen, onClose, currentUser, showToast }) {
  const [activeTab, setActiveTab] = useState('users');
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [sosList, setSosList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('ALL');

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const statsRes = await api.getAdminStats();
      if (statsRes?.success) {
        setStats(statsRes.stats);
      }

      const usersRes = await api.getAdminUsers();
      if (usersRes?.success) {
        setUsersList(usersRes.users);
      }

      const sosRes = await api.getAdminSos();
      if (sosRes?.success) {
        setSosList(sosRes.requests);
      }
    } catch (err) {
      console.warn('API error, using local fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVerify = async (userId) => {
    try {
      const res = await api.verifyDonor(userId);
      if (res?.success) {
        setUsersList(prev => prev.map(u => u.id === userId ? res.user : u));
        showToast(res.message, 'success');
        loadData();
      } else {
        showToast(res?.message || 'Verification failed.', 'danger');
      }
    } catch (err) {
      showToast('Error updating verification.', 'danger');
    }
  };

  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const res = await api.changeUserRole(userId, newRole);
      if (res?.success) {
        setUsersList(prev => prev.map(u => u.id === userId ? res.user : u));
        showToast(res.message, 'success');
      } else {
        showToast(res?.message || 'Role change failed.', 'danger');
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
      } else {
        showToast(res?.message || 'Ban toggle failed.', 'danger');
      }
    } catch (err) {
      showToast('Error modifying account status.', 'danger');
    }
  };

  const handleDeleteUser = async (userId, name) => {
    if (!window.confirm(`Are you sure you want to delete user ${name}? This action is irreversible.`)) return;
    try {
      const res = await api.deleteUser(userId);
      if (res?.success) {
        setUsersList(prev => prev.filter(u => u.id !== userId));
        showToast(`User ${name} permanently deleted.`, 'info');
        loadData();
      } else {
        showToast(res?.message || 'Delete failed.', 'danger');
      }
    } catch (err) {
      showToast('Error deleting user.', 'danger');
    }
  };

  const handleDeleteSos = async (sosId) => {
    if (!window.confirm('Delete this emergency SOS broadcast permanently?')) return;
    try {
      const res = await api.deleteSos(sosId);
      if (res?.success) {
        setSosList(prev => prev.filter(s => s.id !== sosId));
        showToast('Emergency SOS removed.', 'info');
        loadData();
      } else {
        showToast(res?.message || 'Delete failed.', 'danger');
      }
    } catch (err) {
      showToast('Error deleting SOS.', 'danger');
    }
  };

  if (!isOpen) return null;

  const filteredUsers = usersList.filter(u => {
    const matchesSearch =
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.location?.city?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBlood = selectedBloodGroup === 'ALL' || u.bloodGroup === selectedBloodGroup;
    return matchesSearch && matchesBlood;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-zinc-950/95 border border-red-500/30 rounded-2xl shadow-2xl shadow-red-950/50 p-6 max-h-[90vh] flex flex-col overflow-hidden text-zinc-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-rose-900 flex items-center justify-center shadow-lg shadow-red-600/30 text-white">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-white">LifePulse Admin Control Center</h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-950/80 text-red-400 border border-red-800/50">
                  Root Admin
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Connected to Express Backend API (Port 5000) &bull; Logged in as: {currentUser?.email || 'admin@lifepulse.org'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={loading}
              title="Refresh Data"
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-red-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Row */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-zinc-400">Total Users</p>
                <p className="text-lg font-bold text-white">{stats.totalUsers}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-zinc-400">Registered Donors</p>
                <p className="text-lg font-bold text-red-400">{stats.totalDonors}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-zinc-400">Verified Donors</p>
                <p className="text-lg font-bold text-emerald-400">{stats.verifiedDonors}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-zinc-400">Active SOS Alerts</p>
                <p className="text-lg font-bold text-amber-400">{stats.activeSos}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Selector */}
        <div className="flex items-center gap-3 border-b border-zinc-800 pb-2 mb-4">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'users'
                ? 'bg-red-600/20 text-red-400 border border-red-600/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Users className="w-4 h-4" />
            Users & Donors ({filteredUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('sos')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'sos'
                ? 'bg-red-600/20 text-red-400 border border-red-600/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <BadgeAlert className="w-4 h-4" />
            Emergency SOS Broadcasts ({sosList.length})
          </button>
        </div>

        {/* TAB 1: USERS & DONORS */}
        {activeTab === 'users' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search donor by name, email, city..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                {['ALL', 'O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(bg => (
                  <button
                    key={bg}
                    onClick={() => setSelectedBloodGroup(bg)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-all ${
                      selectedBloodGroup === bg
                        ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                        : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                    }`}
                  >
                    {bg}
                  </button>
                ))}
              </div>
            </div>

            {/* Users Table */}
            <div className="flex-1 overflow-y-auto border border-zinc-800/80 rounded-xl bg-zinc-900/30">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/80 text-zinc-400 font-semibold sticky top-0">
                    <th className="py-2.5 px-3">Donor / User</th>
                    <th className="py-2.5 px-3">Blood</th>
                    <th className="py-2.5 px-3">Location & Hospital</th>
                    <th className="py-2.5 px-3">Role & Status</th>
                    <th className="py-2.5 px-3 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-zinc-500">
                        No donors or users found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-zinc-800/40 transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-zinc-200 flex items-center gap-2">
                            {u.name}
                            {u.isVerifiedDonor && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" title="Verified Donor" />
                            )}
                            {u.isBanned && (
                              <span className="px-1.5 py-0.2 bg-red-950 text-red-400 border border-red-800 text-[10px] rounded">
                                BANNED
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
                            {/* Verify Button */}
                            <button
                              onClick={() => handleToggleVerify(u.id)}
                              title={u.isVerifiedDonor ? 'Revoke Verification' : 'Verify Donor Badge'}
                              className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                                u.isVerifiedDonor
                                  ? 'bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900 border border-emerald-800/50'
                                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                              }`}
                            >
                              {u.isVerifiedDonor ? 'Verified ✓' : 'Verify'}
                            </button>

                            {/* Promote / Demote */}
                            <button
                              onClick={() => handleToggleRole(u.id, u.role)}
                              title="Toggle Admin/User Role"
                              className="px-2 py-1 rounded text-[11px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                            >
                              {u.role === 'admin' ? 'Demote' : 'Make Admin'}
                            </button>

                            {/* Ban / Unban */}
                            <button
                              onClick={() => handleToggleBan(u.id)}
                              title={u.isBanned ? 'Unban Account' : 'Suspend Account'}
                              className={`p-1 rounded transition-colors ${
                                u.isBanned ? 'bg-amber-950 text-amber-400' : 'text-zinc-500 hover:text-amber-400'
                              }`}
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              title="Permanently Delete Account"
                              className="p-1 rounded text-zinc-500 hover:text-red-400 transition-colors"
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

        {/* TAB 2: EMERGENCY SOS BROADCASTS */}
        {activeTab === 'sos' && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {sosList.length === 0 ? (
              <div className="py-12 text-center text-zinc-500">
                No emergency SOS requests in the system.
              </div>
            ) : (
              sosList.map(sos => (
                <div
                  key={sos.id}
                  className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-600/20 text-red-400 flex items-center justify-center font-black text-sm border border-red-600/30">
                      {sos.bloodGroup}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-zinc-100">{sos.patientName}</h4>
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
                        {sos.hospital} &bull; {sos.city} &bull; {sos.unitsNeeded} Units Required
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-2">
                        <Phone className="w-3 h-3 text-emerald-400" />
                        Contact: {sos.contactPhone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleDeleteSos(sos.id)}
                      className="px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete Alert
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
}
