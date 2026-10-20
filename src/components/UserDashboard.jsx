import React from 'react';
import {
  Edit3,
  LogOut,
  MapPin,
  Phone,
  Mail,
  Award,
  ShieldCheck,
  Heart,
  HeartHandshake,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  Bell,
  Droplet
} from 'lucide-react';

export default function UserDashboard({
  currentUser,
  onOpenUpload,
  onLogout,
  onToggleAvailability,
  onOpenRecordDonation,
  notifications = [],
  onMarkNotificationRead
}) {
  if (!currentUser) return null;

  // Recovery calculation based on 90-day standard
  const calcRecovery = () => {
    if (!currentUser.lastDonationDate) {
      return {
        hasDate: false,
        isEligible: true,
        daysRemaining: 0,
        daysElapsed: 90,
        percent: 100,
        eligibleDateFormatted: 'Eligible Today'
      };
    }

    try {
      const donTime = new Date(currentUser.lastDonationDate).getTime();
      const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;
      const eligibleTime = donTime + ninetyDaysMs;
      const now = Date.now();
      const isEligible = now >= eligibleTime;
      const daysElapsed = Math.floor((now - donTime) / (1000 * 60 * 60 * 24));
      const daysRemaining = Math.max(0, Math.ceil((eligibleTime - now) / (1000 * 60 * 60 * 24)));
      const percent = Math.min(100, Math.max(0, Math.round((daysElapsed / 90) * 100)));
      const eligibleDateObj = new Date(eligibleTime);
      const eligibleDateFormatted = eligibleDateObj.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      return {
        hasDate: true,
        isEligible,
        daysRemaining,
        daysElapsed,
        percent,
        eligibleDateFormatted
      };
    } catch (e) {
      return {
        hasDate: false,
        isEligible: true,
        daysRemaining: 0,
        daysElapsed: 90,
        percent: 100,
        eligibleDateFormatted: 'Eligible Today'
      };
    }
  };

  const recovery = calcRecovery();

  const userMessages = notifications.filter((n) => n.userId === currentUser.id || !n.userId).slice(0, 3);

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
                  <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span>
                    {currentUser.village ? `${currentUser.village}, ` : ''}
                    {currentUser.union ? `${currentUser.union}, ` : ''}
                    {currentUser.upazila ? `${currentUser.upazila}, ` : ''}
                    <strong>{currentUser.district || currentUser.city || 'Dhaka'}</strong>
                    {currentUser.division && currentUser.division !== (currentUser.district || currentUser.city) ? ` (${currentUser.division})` : ''}
                    {currentUser.lat && currentUser.lng
                      ? ` • GPS: ${Number(currentUser.lat).toFixed(3)}, ${Number(currentUser.lng).toFixed(3)}`
                      : ''}
                  </span>
                </div>
              </div>
            </div>

            <div className="dashboard-action-buttons">
              <button
                className="btn btn-primary"
                onClick={onOpenRecordDonation}
                style={{
                  background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
                  boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)'
                }}
                title="Add your latest blood donation date and schedule automatic recovery alerts"
              >
                <Droplet className="w-4 h-4 fill-current" />
                <span>Record Donation Date</span>
              </button>

              <button className="btn btn-secondary" onClick={onOpenUpload}>
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile & Location</span>
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

            {/* Col 2: Health & Donation Record */}
            <div className="dash-box">
              <div className="dash-box-header">
                <h4>
                  <Heart className="w-4 h-4 text-red-500" />
                  <span>Health & Donation Record</span>
                </h4>
                <button
                  type="button"
                  onClick={onOpenRecordDonation}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#f87171',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  + Add Date
                </button>
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
                  <span className="data-val" style={{ fontWeight: 700 }}>
                    {currentUser.lastDonationDate || 'Not recorded yet'}
                  </span>
                </div>
                <div className="data-row">
                  <span className="data-key">Next Eligible Date:</span>
                  <span
                    className="data-val"
                    style={{
                      color: recovery.isEligible ? 'var(--success)' : '#fbbf24',
                      fontWeight: 700
                    }}
                  >
                    {recovery.eligibleDateFormatted}
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
                    <p>{currentUser.upazila ? `${currentUser.upazila}, ` : ''}{currentUser.district || currentUser.city || 'Dhaka'}, ID: LP-{currentUser.id?.slice(-4) || '8841'}</p>
                    <p style={{ color: 'var(--success)', fontWeight: 700, fontSize: '0.72rem', marginTop: '4px' }}>
                      <ShieldCheck className="w-3.5 h-3.5 inline mr-1" />
                      Blood Tested & Verified
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Blood Donation Timeline & Recovery Tracker Banner */}
          <div
            style={{
              marginTop: '16px',
              padding: '18px 20px',
              borderRadius: '16px',
              background: recovery.isEligible
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(15, 23, 42, 0.6))'
                : 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(15, 23, 42, 0.6))',
              border: recovery.isEligible
                ? '1px solid rgba(16, 185, 129, 0.3)'
                : '1px solid rgba(245, 158, 11, 0.3)'
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: recovery.isEligible ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {recovery.isEligible ? (
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Clock className="w-5 h-5 text-amber-400" />
                  )}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: '#fff' }}>
                    {recovery.isEligible
                      ? '🎉 You Are Eligible to Donate Blood Again!'
                      : '⏳ Blood Donation Recovery Cycle Active'}
                  </h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {recovery.hasDate
                      ? `Last donation recorded: ${currentUser.lastDonationDate} • Recovery standard: 90 Days`
                      : 'No donation recorded yet. Record your donation date to activate automated eligibility notifications!'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={onOpenRecordDonation}
                  style={{ padding: '7px 14px', fontSize: '0.82rem' }}
                >
                  <Calendar className="w-3.5 h-3.5 mr-1 inline" />
                  <span>{recovery.hasDate ? 'Update Donation Date' : 'Set Donation Date'}</span>
                </button>
              </div>
            </div>

            {/* Progress bar */}
            {recovery.hasDate && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '6px' }}>
                  <span>
                    {recovery.isEligible
                      ? '90 of 90 Days Completed (Fully Replenished)'
                      : `${recovery.daysElapsed} of 90 Days Completed`}
                  </span>
                  <span style={{ fontWeight: 700, color: recovery.isEligible ? 'var(--success)' : '#fbbf24' }}>
                    {recovery.isEligible ? '100% Ready' : `${recovery.daysRemaining} Days Until Eligible`}
                  </span>
                </div>
                <div
                  style={{
                    height: '8px',
                    borderRadius: '999px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    overflow: 'hidden'
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${recovery.percent}%`,
                      background: recovery.isEligible
                        ? 'linear-gradient(90deg, #10b981, #059669)'
                        : 'linear-gradient(90deg, #f59e0b, #ef4444)',
                      borderRadius: '999px',
                      transition: 'width 0.6s ease'
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Website Messages & Automated Alerts Box */}
          {userMessages.length > 0 && (
            <div
              style={{
                marginTop: '16px',
                padding: '16px 20px',
                borderRadius: '16px',
                background: 'rgba(15, 23, 42, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Bell className="w-4 h-4 text-red-500" />
                <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: '#fff' }}>
                  Recent Website Messages & Automated Alerts
                </h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {userMessages.map((msg) => (
                  <div
                    key={msg.id}
                    onClick={() => onMarkNotificationRead && onMarkNotificationRead(msg.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: msg.read ? 'rgba(255, 255, 255, 0.02)' : 'rgba(239, 68, 68, 0.08)',
                      border: msg.read
                        ? '1px solid rgba(255, 255, 255, 0.04)'
                        : '1px solid rgba(239, 68, 68, 0.25)',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ marginTop: '2px' }}>
                      {msg.type === 'eligibility' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Droplet className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '0.84rem', color: msg.read ? '#cbd5e1' : '#fff' }}>
                          {msg.title}
                        </strong>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString() : 'Today'}
                        </span>
                      </div>
                      <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: msg.read ? '#94a3b8' : '#e2e8f0', lineHeight: 1.4 }}>
                        {msg.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
