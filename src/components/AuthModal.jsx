import React, { useState } from 'react';
import { X, Lock, ArrowRight, UserPlus, Zap } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onLogin, onRegister, onDemoLogin }) {
  const [tab, setTab] = useState('login');
  const [loginEmail, setLoginEmail] = useState('sarah.chen@example.com');
  const [loginPassword, setLoginPassword] = useState('password123');

  const [regData, setRegData] = useState({
    name: '',
    email: '',
    password: '',
    bloodGroup: 'O+',
    role: 'donor',
    phone: '',
    city: 'New York'
  });

  if (!isOpen) return null;

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    onLogin(loginEmail, loginPassword);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    onRegister(regData);
  };

  return (
    <div className="modal-overlay active" onClick={(e) => e.target.classList.contains('modal-overlay') && onClose()}>
      <div className="modal-box" style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <h3>
            <Lock className="w-5 h-5 text-red-500 mr-2" />
            Member Access
          </h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-body">
          {/* Quick Demo Access Buttons */}
          <div className="demo-auth-box">
            <p style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Instant One-Click Demo Access:</span>
            </p>
            <div className="demo-buttons-row">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ flex: 1 }}
                onClick={() => onDemoLogin('sarah.chen@example.com')}
              >
                👤 Sarah (Donor O-)
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ flex: 1 }}
                onClick={() => onDemoLogin('alex.rivera@example.com')}
              >
                🏥 Alex (Hospital A+)
              </button>
            </div>
          </div>

          {/* Modal Tabs */}
          <div className="modal-tabs">
            <button
              className={`modal-tab-btn ${tab === 'login' ? 'active' : ''}`}
              onClick={() => setTab('login')}
            >
              Sign In
            </button>
            <button
              className={`modal-tab-btn ${tab === 'register' ? 'active' : ''}`}
              onClick={() => setTab('register')}
            >
              Create Account
            </button>
          </div>

          {tab === 'login' ? (
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }}>
                <ArrowRight className="w-4 h-4" />
                <span>Sign In to Account</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name <span className="req">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Jordan Smith"
                  value={regData.name}
                  onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address <span className="req">*</span></label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="jordan@example.com"
                  value={regData.email}
                  onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password <span className="req">*</span></label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Minimum 6 characters"
                  value={regData.password}
                  onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Blood Group <span className="req">*</span></label>
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
                  <label className="form-label">Role <span className="req">*</span></label>
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

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+1 555-0199"
                    value={regData.phone}
                    onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="New York"
                    value={regData.city}
                    onChange={(e) => setRegData({ ...regData, city: e.target.value })}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }}>
                <UserPlus className="w-4 h-4" />
                <span>Complete Registration</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
