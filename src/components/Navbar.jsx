import React, { useState, useEffect } from 'react';
import {
  Droplet,
  PlusCircle,
  UserCircle,
  Menu,
  X,
  Hospital,
  AlertTriangle,
  Layers,
  ShieldCheck,
  ChevronRight,
  Activity
} from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';

export default function Navbar({
  currentUser,
  currentPage = 'home',
  onNavigate,
  onOpenAuth,
  onOpenSos,
  onOpenUpload,
  onOpenAdmin,
  notifications = [],
  onMarkNotificationRead,
  onClearNotifications
}) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 25);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && menuOpen) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const isAdmin = currentUser?.role === 'admin';

  const handleNavClick = (page) => {
    setMenuOpen(false);
    if (onNavigate) {
      onNavigate(page);
    }
  };

  const navCategories = [
    {
      id: 'hospitals',
      label: 'Hospitals',
      fullLabel: 'Hospitals & Blood Banks',
      icon: Hospital,
      href: 'hospitals.html',
      desc: 'Nationwide Centers with GPS & Hotlines'
    },
    {
      id: 'donors',
      label: 'Find Donors',
      fullLabel: 'Verified Donors Directory',
      icon: Droplet,
      href: 'donors.html',
      desc: 'Search Volunteer Donors by Blood Group'
    },
    {
      id: 'requests',
      label: 'Urgent SOS',
      fullLabel: 'Emergency Blood SOS',
      icon: AlertTriangle,
      href: 'urgent.html',
      isEmergency: true,
      desc: 'Live Emergency Transfusion Broadcasts'
    },
    {
      id: 'compatibility',
      label: 'Compatibility',
      fullLabel: 'Compatibility & Quiz',
      icon: Layers,
      href: 'compatibility.html',
      desc: 'Clinical Compatibility Matrix & Quiz'
    }
  ];

  return (
    <>
      <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container nav-container">
          {/* Brand Logo */}
          <a
            href="index.html"
            className="brand-logo"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('home');
            }}
            title="LifePulse Bangladesh Emergency Blood Network"
          >
            <div className="brand-icon">
              <Droplet className="w-5 h-5 fill-current" />
            </div>
            <span>Life<strong>Pulse</strong></span>
          </a>

          {/* Desktop Navigation Menu */}
          <nav className="desktop-nav" aria-label="Main Navigation">
            <ul className="nav-menu">
              {navCategories.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <li key={item.id}>
                    <a
                      href={item.href}
                      className={`nav-link-pill ${isActive ? 'active-nav-link' : ''} ${item.isEmergency ? 'emergency-nav-pill' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavClick(item.id);
                      }}
                      title={item.desc}
                    >
                      <Icon className="w-4 h-4 nav-pill-icon" />
                      <span>{item.label}</span>
                      {item.isEmergency && <span className="nav-pulse-dot" />}
                    </a>
                  </li>
                );
              })}

              {/* Logged in User Profile Tab */}
              {currentUser && (
                <li>
                  <a
                    href="index.html#/dashboard"
                    className={`nav-link-pill ${currentPage === 'dashboard' ? 'active-nav-link' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick('dashboard');
                    }}
                    title="My Profile, Donation Records & Location"
                  >
                    <UserCircle className="w-4 h-4 nav-pill-icon text-rose-400" />
                    <span>My Profile</span>
                  </a>
                </li>
              )}

              {/* Admin Console Tab: ONLY visible when logged in as Admin */}
              {isAdmin && (
                <li>
                  <a
                    href="#admin"
                    className="nav-link-pill admin-nav-pill"
                    onClick={(e) => {
                      e.preventDefault();
                      onOpenAdmin();
                    }}
                    title="Admin Master Control Console"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Admin</span>
                  </a>
                </li>
              )}
            </ul>
          </nav>

          {/* Nav Actions (Buttons & Profile) */}
          <div className="nav-actions">
            {/* Post SOS Button */}
            <button
              type="button"
              className="btn btn-outline-danger btn-sm nav-sos-btn"
              onClick={onOpenSos}
              title="Broadcast Emergency Blood Request"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="btn-text">Post SOS</span>
            </button>

            {/* Website Messages / Notifications Bell for logged-in donor */}
            {currentUser && (
              <NotificationDropdown
                notifications={notifications}
                onMarkAsRead={onMarkNotificationRead}
                onClearAll={onClearNotifications}
              />
            )}

            {/* Member Profile or Login Button */}
            {currentUser ? (
              <div
                className="user-profile-badge"
                onClick={onOpenUpload}
                title="Click to view & upload your health data/location"
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
              <button
                type="button"
                className="btn btn-primary btn-sm nav-auth-btn"
                onClick={() => onOpenAuth('login')}
                title="Login or Register for LifePulse"
              >
                <UserCircle className="w-4 h-4" />
                <span className="btn-text">Login / Register</span>
              </button>
            )}

            {/* Mobile Menu Hamburger Toggle */}
            <button
              type="button"
              className={`mobile-toggle-btn ${menuOpen ? 'active' : ''}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle Navigation Menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          RESPONSIVE MOBILE DRAWER MENU & BACKDROP
          ========================================================================= */}
      {menuOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setMenuOpen(false)}>
          <div
            className="mobile-drawer-sheet"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Drawer"
          >
            {/* Drawer Header */}
            <div className="mobile-drawer-header">
              <div className="brand-logo" style={{ fontSize: '1.25rem' }}>
                <div className="brand-icon" style={{ width: '34px', height: '34px', fontSize: '1rem' }}>
                  <Droplet className="w-4 h-4 fill-current" />
                </div>
                <span>Life<strong>Pulse</strong></span>
              </div>
              <button
                type="button"
                className="mobile-drawer-close-btn"
                onClick={() => setMenuOpen(false)}
                aria-label="Close Navigation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile User Profile or Auth Card */}
            <div className="mobile-drawer-user-card">
              {currentUser ? (
                <div className="mobile-user-box">
                  <div className="mobile-user-avatar">
                    {currentUser.avatar ? (
                      <img src={currentUser.avatar} alt={currentUser.name} />
                    ) : (
                      currentUser.name.charAt(0)
                    )}
                  </div>
                  <div className="mobile-user-info">
                    <h4>{currentUser.name}</h4>
                    <p>
                      Blood: <strong>{currentUser.bloodGroup}</strong> •{' '}
                      {currentUser.district || 'Dhaka'}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    onClick={() => {
                      setMenuOpen(false);
                      handleNavClick('dashboard');
                    }}
                  >
                    Dashboard
                  </button>
                </div>
              ) : (
                <div className="mobile-guest-box">
                  <p className="mobile-guest-title">Save Lives Across Bangladesh</p>
                  <p className="mobile-guest-subtitle">
                    Register as a donor, track login sessions, or broadcast urgent requests.
                  </p>
                  <div className="mobile-guest-btns">
                    <button
                      type="button"
                      className="btn btn-sm btn-primary w-full"
                      onClick={() => {
                        setMenuOpen(false);
                        onOpenAuth('login');
                      }}
                    >
                      <UserCircle className="w-4 h-4 mr-1" />
                      <span>Login / Register</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Quick Action: Post Emergency SOS */}
            <div className="mobile-drawer-quick-action">
              <button
                type="button"
                className="btn btn-danger-sos w-full"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenSos();
                }}
              >
                <AlertTriangle className="w-4 h-4 mr-1" />
                <span>Broadcast Emergency SOS Request</span>
              </button>
            </div>

            {/* Category Navigation Links List */}
            <div className="mobile-drawer-nav-section">
              <span className="mobile-drawer-section-title">SEPARATE CATEGORY PAGES</span>
              <ul className="mobile-nav-list">
                {navCategories.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <li key={item.id}>
                      <a
                        href={item.href}
                        className={`mobile-nav-item ${isActive ? 'active' : ''}`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleNavClick(item.id);
                        }}
                      >
                        <div className={`mobile-nav-icon-wrap ${isActive ? 'active' : ''}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="mobile-nav-content">
                          <div className="mobile-nav-title-row">
                            <span className="mobile-nav-title">
                              {item.fullLabel || item.label}
                            </span>
                            {item.isEmergency && (
                              <span className="mobile-emergency-tag">LIVE SOS</span>
                            )}
                          </div>
                          <span className="mobile-nav-desc">{item.desc}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 mobile-nav-arrow" />
                      </a>
                    </li>
                  );
                })}

                {isAdmin && (
                  <li>
                    <a
                      href="#admin"
                      className="mobile-nav-item admin-item"
                      onClick={(e) => {
                        e.preventDefault();
                        setMenuOpen(false);
                        onOpenAdmin();
                      }}
                    >
                      <div className="mobile-nav-icon-wrap admin">
                        <ShieldCheck className="w-5 h-5 text-amber-400" />
                      </div>
                      <div className="mobile-nav-content">
                        <span className="mobile-nav-title" style={{ color: '#fbbf24' }}>
                          🛡️ Admin Master Console
                        </span>
                        <span className="mobile-nav-desc">Manage platform alerts &amp; data</span>
                      </div>
                      <ChevronRight className="w-4 h-4 mobile-nav-arrow" />
                    </a>
                  </li>
                )}
              </ul>
            </div>

            {/* Mobile Drawer Footer */}
            <div className="mobile-drawer-footer">
              <p>National Emergency Hotline: <strong>999 / 16263</strong></p>
              <p style={{ color: 'var(--text-subtle)', fontSize: '0.75rem', marginTop: '4px' }}>
                LifePulse Bangladesh Blood Donation Network
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
