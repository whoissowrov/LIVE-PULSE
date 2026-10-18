import React from 'react';
import { Edit3, LogOut, MapPin, Phone, Mail, Award, ShieldCheck, Heart, HeartHandshake } from 'lucide-react';

export default function UserDashboard({ currentUser, onOpenUpload, onLogout, onToggleAvailability }) {
  if (!currentUser) return null;

  return (
    <section className="dashboard-section" id="dashboardSection">
      <div className="container">
        <div className="dashboard-card interactive-card">
          {/* Top Profile Summary */}
          <div className="dashboard-hero-row">
            <div className="user-profile-summary">
              <div className="user-avatar-large">
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt={currentUser.name} />
                ) : (
                  currentUser.name.charAt(0)
                )}
              </div>
              <div className="user-details-title">
                <div className="user-name-title">
                  <span>{currentUser.name}</span>
                  <span className="blood-badge">{currentUser.bloodGroup}</span>
                  <span className="user-role-badge">{currentUser.role?.toUpperCase() || 'DONOR'}</span>
                </div>
                <div className="user-location-text">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <span>
                    {currentUser.city || 'Location not set'}
                    {currentUser.area ? ` (${currentUser.area})` : ''}
                    {currentUser.lat && currentUser.lng ? ` • GPS: ${Number(currentUser.lat).toFixed(3)}, ${Number(currentUser.lng).toFixed(3)}` : ''}
                  </span>
                </div>
              </div>
            </div>

            <div className="dashboard-action-buttons">
              <button className="btn btn-primary" onClick={onOpenUpload}>
                <Edit3 className="w-4 h-4" />
                <span>Upload & Edit My Data / Location</span>
              </button>
              <button className="btn btn-secondary" onClick={onLogout}>
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Grid Information */}
          <div className="dashboard-grid">
            {/* Col 1: Personal & Contact */}
            <div className="dash-box">
              <div className="dash-box-header">
                <h4>
                  <Phone className="w-4 h-4 text-red-500" />
                  <span>Personal & Contact Info</span>
                </h4>
              </div>
              <div className="dash-data-list">
                <div className="data-row">
                  <span className="data-key">Mobile Phone:</span>
                  <span className="data-val">{currentUser.phone || 'Not provided'}</span>
                </div>
                <div className="data-row">
                  <span className="data-key">Email:</span>
                  <span className="data-val">{currentUser.email}</span>
                </div>
                <div className="data-row">
                  <span className="data-key">Vitals:</span>
                  <span className="data-val">
                    {currentUser.age || 26} yrs • {currentUser.weight || 60} kg • {currentUser.gender || 'Female'}
                  </span>
                </div>
                <div className="data-row">
                  <span className="data-key">Emergency Contact:</span>
                  <span className="data-val">{currentUser.emergencyContact || 'None listed'}</span>
                </div>
              </div>
            </div>

            {/* Col 2: Health & Record */}
            <div className="dash-box">
              <div className="dash-box-header">
                <h4>
                  <Heart className="w-4 h-4 text-red-500" />
                  <span>Health & Donation Record</span>
                </h4>
              </div>
              <div className="dash-data-list">
                <div className="data-row">
                  <span className="data-key">Total Donations:</span>
                  <span className="data-val" style={{ color: 'var(--success)' }}>
                    {currentUser.totalDonations || 0} times (Approx {(currentUser.totalDonations || 0) * 3} lives saved)
                  </span>
                </div>
                <div className="data-row">
                  <span className="data-key">Last Donated:</span>
                  <span className="data-val">{currentUser.lastDonationDate || 'Not recorded'}</span>
                </div>
                <div className="data-row">
                  <span className="data-key">Hemoglobin:</span>
                  <span className="data-val">
                    {currentUser.hemoglobin ? `${currentUser.hemoglobin} g/dL` : 'Normal range'}
                  </span>
                </div>
              </div>

              {/* Live Availability Toggle Switch */}
              <div className="availability-toggle-wrap">
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={!!currentUser.availableNow}
                    onChange={(e) => onToggleAvailability(e.target.checked)}
                  />
                  <span className="slider" />
                </label>
                <div>
                  <strong style={{ fontSize: '0.9rem', color: '#fff' }}>Available for Emergency Calls</strong>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                    {currentUser.availableNow ? '🟢 Active on live radar map' : '🟡 Temporarily resting / busy'}
                  </p>
                </div>
              </div>
            </div>

            {/* Col 3: Digital Donor ID Card */}
            <div className="dash-box" style={{ padding: '16px' }}>
              <div className="donor-id-card">
                <div className="donor-id-header">
                  <span className="donor-id-title">
                    <Award className="w-3.5 h-3.5 inline mr-1 text-red-500" />
                    Verified Donor Card
                  </span>
                  <span className="blood-badge">{currentUser.bloodGroup}</span>
                </div>
                <div className="donor-id-body">
                  <div className="donor-id-avatar">
                    <img
                      src={
                        currentUser.avatar ||
                        `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(currentUser.name)}`
                      }
                      alt="Donor"
                    />
                  </div>
                  <div className="donor-id-meta">
                    <h5>{currentUser.name}</h5>
                    <p>{currentUser.city || 'New York'}, ID: LP-{currentUser.id?.slice(-4) || '8841'}</p>
                    <p style={{ color: 'var(--success)', fontWeight: 700, fontSize: '0.72rem', marginTop: '4px' }}>
                      <ShieldCheck className="w-3.5 h-3.5 inline mr-1" />
                      Blood Tested & Verified
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
