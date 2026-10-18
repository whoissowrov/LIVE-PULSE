import React from 'react';
import { Droplet, Headset } from 'lucide-react';

export default function Footer({ onOpenUpload, onOpenAdmin }) {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="#home" className="brand-logo" style={{ marginBottom: '10px' }}>
              <div className="brand-icon">
                <Droplet className="w-5 h-5 fill-current" />
              </div>
              <span>Life<strong>Pulse</strong></span>
            </a>
            <p>
              An open community lifeline bridging blood donors, emergency patients, and blood banks with real-time location matching.
            </p>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Emergency Hotline: <strong>+1 (800) RED-CROSS</strong>
            </div>
          </div>

          <div className="footer-col">
            <h5>Quick Actions</h5>
            <ul>
              <li>
                <a href="#dashboardSection" onClick={(e) => { e.preventDefault(); onOpenUpload(); }}>
                  Upload My Location & Data
                </a>
              </li>
              <li><a href="#requestsSection">Emergency SOS List</a></li>
              <li><a href="#donorsSection">Find Donors Directory</a></li>
              <li><a href="#mapSection">Live Radar Map</a></li>
              <li>
                <a
                  href="#admin"
                  onClick={(e) => { e.preventDefault(); onOpenAdmin && onOpenAdmin(); }}
                  style={{ color: '#f87171', fontWeight: 600 }}
                >
                  🛡️ Admin & Staff Portal
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Information</h5>
            <ul>
              <li><a href="#compatibilitySection">Compatibility Matrix</a></li>
              <li><a href="#eligibilityForm">Eligibility Quiz</a></li>
              <li><a href="#">Safe Donation Guidelines</a></li>
              <li><a href="#">Hospital Partnerships</a></li>
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
