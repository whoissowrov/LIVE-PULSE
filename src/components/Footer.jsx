import React from 'react';
import { Droplet, Headset } from 'lucide-react';

export default function Footer({ onOpenUpload, onOpenAuth, currentUser, onOpenAdmin, onNavigate }) {
  const isAdmin = currentUser?.role === 'admin';

  const handleLink = (page) => {
    if (onNavigate) {
      onNavigate(page);
    }
  };

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <a
              href="#/"
              className="brand-logo"
              style={{ marginBottom: '10px' }}
              onClick={(e) => {
                e.preventDefault();
                handleLink('home');
              }}
            >
              <div className="brand-icon">
                <Droplet className="w-5 h-5 fill-current" />
              </div>
              <span>Life<strong>Pulse</strong></span>
            </a>
            <p>
              An open community lifeline bridging blood donors, emergency patients, and blood banks with real-time location matching across all 64 districts of Bangladesh.
            </p>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Bangladesh Emergency Hotline: <strong>999 / 16263</strong>
            </div>
          </div>

          <div className="footer-col">
            <h5>Dedicated Category Pages</h5>
            <ul>
              <li>
                <a
                  href="districts.html"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLink('districts');
                  }}
                >
                  🏙️ District &amp; Village Tracker
                </a>
              </li>
              <li>
                <a
                  href="hospitals.html"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLink('hospitals');
                  }}
                >
                  🏥 BD Hospitals &amp; Blood Banks
                </a>
              </li>
              <li>
                <a
                  href="donors.html"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLink('donors');
                  }}
                >
                  🩸 Find Donors Directory
                </a>
              </li>
              <li>
                <a
                  href="map.html"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLink('map');
                  }}
                >
                  🗺️ Live Geolocation Map
                </a>
              </li>
              <li>
                <a
                  href="urgent.html"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLink('requests');
                  }}
                >
                  🚨 Emergency SOS Broadcast
                </a>
              </li>
              {!currentUser ? (
                <li>
                  <a href="#login" onClick={(e) => { e.preventDefault(); onOpenAuth && onOpenAuth('login'); }}>
                    Member Access / Sign In
                  </a>
                </li>
              ) : isAdmin ? (
                <li>
                  <a
                    href="#admin"
                    onClick={(e) => { e.preventDefault(); onOpenAdmin && onOpenAdmin(); }}
                    style={{ color: '#fbbf24', fontWeight: 600 }}
                  >
                    🛡️ Admin Console
                  </a>
                </li>
              ) : null}
            </ul>
          </div>

          <div className="footer-col">
            <h5>Information &amp; Guidance</h5>
            <ul>
              <li>
                <a
                  href="compatibility.html"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLink('compatibility');
                  }}
                >
                  Compatibility Matrix
                </a>
              </li>
              <li>
                <a
                  href="compatibility.html"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLink('compatibility');
                  }}
                >
                  Eligibility Quiz
                </a>
              </li>
              <li>
                <a
                  href="#/dashboard"
                  onClick={(e) => {
                    e.preventDefault();
                    if (!currentUser) onOpenAuth && onOpenAuth('login');
                    else handleLink('dashboard');
                  }}
                >
                  My Profile &amp; Location
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Emergency Support</h5>
            <ul>
              <li>
                <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Headset className="w-4 h-4" /> 24/7 Dispatch Ready
                </span>
              </li>
              <li><span style={{ color: 'var(--text-muted)' }}>Encrypted & Private</span></li>
              <li><span style={{ color: 'var(--text-muted)' }}>Community Powered</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div>&copy; 2026 LifePulse Blood Network. Powered by React. Every donor is a hero.</div>
          <div style={{ display: 'flex', gap: '18px' }}>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Medical Disclaimer</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
