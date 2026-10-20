import React, { useState, useEffect } from 'react';
import { X, Lock, ArrowRight, UserPlus, ShieldAlert, KeyRound, CheckCircle2, MapPin } from 'lucide-react';
import BangladeshLocationSelector from './BangladeshLocationSelector';

export default function AuthModal({ isOpen, initialTab = 'login', onClose, onLogin, onRegister, onDemoLogin }) {
  const [tab, setTab] = useState(initialTab || 'login');
  const [loginRole, setLoginRole] = useState('user'); // 'user' | 'admin'

  // User login state
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');

  // Admin login state
  const [adminEmail, setAdminEmail] = useState('admin@lifepulse.org');
  const [adminPassword, setAdminPassword] = useState('admin123');

  // Registration state
  const [regData, setRegData] = useState({
    name: '',
    email: '',
    password: '',
    bloodGroup: 'O+',
    role: 'donor',
    phone: '',
    division: 'Dhaka',
    district: 'Dhaka',
    upazila: 'Mirpur',
    union: '',
    village: '',
    city: 'Dhaka',
    area: 'Mirpur'
  });

  useEffect(() => {
    if (isOpen) {
      setTab(initialTab || 'login');
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleUserLoginSubmit = (e) => {
    e.preventDefault();
    onLogin(userEmail, userPassword);
  };

  const handleAdminLoginSubmit = (e) => {
    e.preventDefault();
    onLogin(adminEmail, adminPassword);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    onRegister(regData);
  };

  const fillAdminCredentials = () => {
    setAdminEmail('admin@lifepulse.org');
    setAdminPassword('admin123');
  };

  return (
    <div className="modal-overlay active" onClick={(e) => e.target.classList.contains('modal-overlay') && onClose()}>
      <div className="modal-box" style={{ maxWidth: '490px', borderRadius: '20px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {tab === 'login' && loginRole === 'admin' ? (
              <ShieldAlert className="w-5 h-5 text-amber-400" />
            ) : (
              <Lock className="w-5 h-5 text-red-500" />
            )}
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>
              {tab === 'login'
                ? (loginRole === 'admin' ? 'Administrator Clearance' : 'Member Sign In')
                : 'Create LifePulse Account'}
            </h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '22px' }}>
          {/* Main Top Navigation Tabs: Sign In vs Register */}
          <div className="modal-tabs" style={{ marginBottom: '18px' }}>
            <button
              type="button"
              className={`modal-tab-btn ${tab === 'login' ? 'active' : ''}`}
              onClick={() => setTab('login')}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`modal-tab-btn ${tab === 'register' ? 'active' : ''}`}
              onClick={() => setTab('register')}
            >
              Register Account
            </button>
          </div>

          {tab === 'login' ? (
            <>
              {/* Login Sub-role Switcher (User Login vs Admin Login) */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  background: 'rgba(15, 23, 42, 0.7)',
                  padding: '5px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  marginBottom: '18px'
                }}
              >
                <button
                  type="button"
                  onClick={() => setLoginRole('user')}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: loginRole === 'user' ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                    color: loginRole === 'user' ? '#fca5a5' : 'var(--text-muted)',
                    outline: loginRole === 'user' ? '1px solid rgba(239, 68, 68, 0.4)' : 'none'
                  }}
                >
                  👤 Donor / Member
                </button>
                <button
                  type="button"
                  onClick={() => setLoginRole('admin')}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: loginRole === 'admin' ? 'rgba(245, 158, 11, 0.25)' : 'transparent',
                    color: loginRole === 'admin' ? '#fbbf24' : 'var(--text-muted)',
                    outline: loginRole === 'admin' ? '1px solid rgba(245, 158, 11, 0.5)' : 'none'
                  }}
                >
                  🛡️ Administrator
                </button>
              </div>

              {loginRole === 'user' ? (
                /* Regular Member / Donor Login */
                <div>
                  {/* Bangladesh Nationwide Network Information Card */}
                  <div
                    style={{
                      background: 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      borderRadius: '12px',
                      padding: '11px 13px',
                      marginBottom: '14px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '9px'
                    }}
                  >
                    <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>🇧🇩</span>
                    <div style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.42 }}>
                      <strong style={{ color: '#fff' }}>Bangladesh Live Blood Donor Registry:</strong>
                      <p style={{ margin: '2px 0 0 0', color: 'var(--text-muted)' }}>
                        Instant donor & emergency blood SOS connections across all 64 Zillas, 495+ Upazilas, Unions, and Villages in Bangladesh.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleUserLoginSubmit}>
                    <div className="form-group" style={{ marginBottom: '14px' }}>
                      <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: '6px' }}>Email Address</label>
                      <input
                        type="email"
                        className="form-input"
                        placeholder="your.email@example.com"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: '16px' }}>
                      <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: '6px' }}>Password</label>
                      <input
                        type="password"
                        className="form-input"
                        placeholder="Enter your password"
                        value={userPassword}
                        onChange={(e) => setUserPassword(e.target.value)}
                        required
                      />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '10px' }}>
                      <ArrowRight className="w-4 h-4 mr-1" />
                      <span>Sign In to Account</span>
                    </button>
                  </form>
                </div>
              ) : (
                /* Administrator Clearance Login */
                <div>
                  <div
                    style={{
                      background: 'rgba(245, 158, 11, 0.08)',
                      border: '1px solid rgba(245, 158, 11, 0.25)',
                      borderRadius: '12px',
                      padding: '12px 14px',
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px'
                    }}
                  >
                    <KeyRound className="w-5 h-5 text-amber-400" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ fontSize: '0.8rem', color: '#fef3c7' }}>
                      <strong>Root Governance Portal</strong>
                      <p style={{ margin: '3px 0 0 0', opacity: 0.85 }}>
                        Authorized personnel only. Provides master control over users, donor registries, emergency alerts, and donation logs.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleAdminLoginSubmit}>
                    <div className="form-group" style={{ marginBottom: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <label className="form-label" style={{ fontSize: '0.85rem', margin: 0 }}>Admin Clearance Email</label>
                        <button
                          type="button"
                          onClick={fillAdminCredentials}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#fbbf24',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                          }}
                        >
                          Autofill Default Admin
                        </button>
                      </div>
                      <input
                        type="email"
                        className="form-input"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        required
                        style={{ borderColor: 'rgba(245, 158, 11, 0.4)' }}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: '18px' }}>
                      <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: '6px' }}>Clearance Password</label>
                      <input
                        type="password"
                        className="form-input"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        required
                        style={{ borderColor: 'rgba(245, 158, 11, 0.4)' }}
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-sm"
                      style={{
                        width: '100%',
                        padding: '11px',
                        background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                        color: '#fff',
                        fontWeight: 700,
                        border: 'none',
                        boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)'
                      }}
                    >
                      <ShieldAlert className="w-4 h-4 mr-1 inline" />
                      <span>Authenticate & Open Admin Console</span>
                    </button>
                  </form>
                </div>
              )}

              {/* Bottom switch to Register */}
              <div style={{ textAlign: 'center', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Don't have an account yet? </span>
                <button
                  type="button"
                  onClick={() => setTab('register')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    textDecoration: 'underline'
                  }}
                >
                  Register here
                </button>
              </div>
            </>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: '5px' }}>
                  Full Name <span className="req">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Jordan Smith"
                  value={regData.name}
                  onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: '5px' }}>
                  Email Address <span className="req">*</span>
                </label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="jordan@example.com"
                  value={regData.email}
                  onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: '5px' }}>
                  Password <span className="req">*</span>
                </label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Minimum 6 characters"
                  value={regData.password}
                  onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                  required
                />
              </div>

              <div className="form-row-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: '5px' }}>
                    Blood Group <span className="req">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={regData.bloodGroup}
                    onChange={(e) => setRegData({ ...regData, bloodGroup: e.target.value })}
                    required
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: '5px' }}>
                    Role <span className="req">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={regData.role}
                    onChange={(e) => setRegData({ ...regData, role: e.target.value })}
                    required
                  >
                    <option value="donor">Blood Donor</option>
                    <option value="recipient">Patient / Requester</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: '5px' }}>
                  Mobile Phone Number (+880)
                </label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="e.g. 01711-XXXXXX or +880 1819-..."
                  value={regData.phone}
                  onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                />
              </div>

              {/* Bangladeshi Zilla, Upazila, Union, and Village Cascade Selector */}
              <div style={{ marginBottom: '16px' }}>
                <BangladeshLocationSelector
                  division={regData.division}
                  district={regData.district}
                  upazila={regData.upazila}
                  union={regData.union}
                  village={regData.village}
                  onChange={(loc) => {
                    setRegData((prev) => ({
                      ...prev,
                      division: loc.division,
                      district: loc.district,
                      upazila: loc.upazila,
                      union: loc.union,
                      village: loc.village,
                      city: loc.city,
                      area: loc.area,
                      lat: loc.lat,
                      lng: loc.lng
                    }));
                  }}
                  helperText="Select your Division, Zilla, Upazila, and Village. When emergency blood requests are posted in your neighborhood, you will be notified immediately!"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '10px' }}>
                <UserPlus className="w-4 h-4 mr-1" />
                <span>Complete Registration</span>
              </button>

              <div style={{ textAlign: 'center', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Already registered? </span>
                <button
                  type="button"
                  onClick={() => setTab('login')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    textDecoration: 'underline'
                  }}
                >
                  Sign in here
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
