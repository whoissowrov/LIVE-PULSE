import React, { useState, useEffect } from 'react';
import { Droplet, PlusCircle, UserCircle, UserPlus, LogIn, Menu, X } from 'lucide-react';

export default function Navbar({ currentUser, onOpenAuth, onOpenSos, onOpenUpload, onOpenAdmin }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isAdmin = currentUser?.role === 'admin';

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container nav-container">
        <a href="#home" className="brand-logo">
          <div className="brand-icon">
            <Droplet className="w-5 h-5 fill-current" />
          </div>
          <span>Life<strong>Pulse</strong></span>
        </a>

        <nav>
          <ul className={`nav-menu ${menuOpen ? 'active' : ''}`}>
            <li><a href="#home" onClick={() => setMenuOpen(false)}>Home</a></li>
            {currentUser && (
              <li><a href="#dashboardSection" onClick={() => setMenuOpen(false)}>My Profile & Data</a></li>
            )}
            <li><a href="#requestsSection" onClick={() => setMenuOpen(false)}>Urgent SOS</a></li>
            <li><a href="#donorsSection" onClick={() => setMenuOpen(false)}>Find Donors</a></li>
            <li><a href="#mapSection" onClick={() => setMenuOpen(false)}>Live Map</a></li>
            <li><a href="#compatibilitySection" onClick={() => setMenuOpen(false)}>Compatibility</a></li>

            {/* Admin Console option: ONLY shown when logged in as Admin */}
            {isAdmin && (
              <li>
                <a
                  href="#admin"
                  onClick={(e) => {
                    e.preventDefault();
                    setMenuOpen(false);
                    onOpenAdmin();
                  }}
                  style={{ color: '#fbbf24', fontWeight: 700 }}
                >
                  🛡️ Admin Console
                </a>
              </li>
            )}

            {/* Mobile login & register links */}
            {!currentUser && (
              <>
                <li className="mobile-only-item">
                  <a
                    href="#login"
                    onClick={(e) => {
                      e.preventDefault();
                      setMenuOpen(false);
                      onOpenAuth('login');
                    }}
                  >
                    🔑 Sign In
                  </a>
                </li>
                <li className="mobile-only-item">
                  <a
                    href="#register"
                    onClick={(e) => {
                      e.preventDefault();
                      setMenuOpen(false);
                      onOpenAuth('register');
                    }}
                    style={{ color: 'var(--primary)', fontWeight: 600 }}
                  >
                    ✨ Register
                  </a>
                </li>
              </>
            )}
          </ul>
        </nav>

        <div className="nav-actions">
          {/* Admin master button: ONLY visible when logged in as Administrator */}
          {isAdmin && (
            <button
              className="btn btn-sm"
              onClick={onOpenAdmin}
              style={{
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(239, 68, 68, 0.25))',
                border: '1px solid rgba(245, 158, 11, 0.5)',
                color: '#fbbf24',
                fontWeight: 700
              }}
              title="Open Admin Master Control Console"
            >
              🛡️ Admin Console
            </button>
          )}

          <button className="btn btn-outline-danger btn-sm" onClick={onOpenSos}>
            <PlusCircle className="w-4 h-4" />
            <span>Post SOS</span>
          </button>

          {currentUser ? (
            <div
              className="user-profile-badge"
              style={{ display: 'flex' }}
              onClick={onOpenUpload}
              title="Click to view & upload your data/location"
            >
              <div className="user-avatar-mini">
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt={currentUser.name} />
                ) : (
                  currentUser.name.charAt(0)
                )}
              </div>
              <div className="user-info-mini">
                <span className="user-name-mini">{currentUser.name.split(' ')[0]}</span>
                <span className="user-group-tag">{currentUser.bloodGroup}</span>
              </div>
            </div>
          ) : (
            <div className="auth-buttons-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => onOpenAuth('login')}
                style={{ padding: '6px 14px', fontWeight: 600 }}
                title="Log into your existing LifePulse or Admin account"
              >
                <LogIn className="w-3.5 h-3.5 mr-1" />
                <span>Login</span>
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => onOpenAuth('register')}
                style={{ padding: '6px 16px', fontWeight: 600 }}
                title="Register as a new Donor or Patient"
              >
                <UserPlus className="w-3.5 h-3.5 mr-1" />
                <span>Register</span>
              </button>
            </div>
          )}

          <button
            className="mobile-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
}
