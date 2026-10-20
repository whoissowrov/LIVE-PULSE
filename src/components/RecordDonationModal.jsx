import React, { useState } from 'react';
import { X, Calendar, Clock, Hospital, Droplet, Sparkles, ShieldCheck, HeartHandshake, CheckCircle2 } from 'lucide-react';

export default function RecordDonationModal({ isOpen, onClose, onSave, currentUser }) {
  const todayStr = new Date().toISOString().split('T')[0];
  const nowTime = new Date().toTimeString().slice(0, 5);

  const [donationDate, setDonationDate] = useState(todayStr);
  const [donationTime, setDonationTime] = useState(nowTime);
  const [hospital, setHospital] = useState('');
  const [units, setUnits] = useState(1);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  // Real-time calculation of recovery & next eligible date (90 days standard)
  const calcEligibleDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      const eligible = new Date(d.getTime() + 90 * 24 * 60 * 60 * 1000);
      return eligible.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return '';
    }
  };

  const isEligibleNow = (dateStr) => {
    if (!dateStr) return false;
    try {
      const d = new Date(dateStr);
      const eligible = new Date(d.getTime() + 90 * 24 * 60 * 60 * 1000);
      return Date.now() >= eligible.getTime();
    } catch (e) {
      return false;
    }
  };

  const getDaysRemaining = (dateStr) => {
    if (!dateStr) return 0;
    try {
      const d = new Date(dateStr);
      const eligible = new Date(d.getTime() + 90 * 24 * 60 * 60 * 1000);
      const diff = eligible.getTime() - Date.now();
      return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    } catch (e) {
      return 0;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      donationDate,
      donationTime,
      hospital: hospital.trim() || 'Central Blood Bank / Hospital',
      units: Number(units) || 1,
      notes: notes.trim()
    });
    onClose();
  };

  const eligibleDateFormatted = calcEligibleDate(donationDate);
  const eligibleNow = isEligibleNow(donationDate);
  const daysRemaining = getDaysRemaining(donationDate);

  return (
    <div className="modal-overlay active" onClick={(e) => e.target.classList.contains('modal-overlay') && onClose()}>
      <div className="modal-box" style={{ maxWidth: '520px', borderRadius: '20px' }}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Droplet className="w-5 h-5 text-red-500 fill-current" />
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>
              Record Blood Donation Date
            </h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ padding: '22px' }}>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Add your blood donation date and time. LifePulse will automatically track your 90-day recovery period and notify you via automated website messages when you are eligible to donate again!
            </p>

            {/* Donation Date & Time inputs */}
            <div className="form-row-2" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: '5px' }}>
                  <Calendar className="w-3.5 h-3.5 inline mr-1 text-red-500" />
                  Donation Date <span className="req">*</span>
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={donationDate}
                  max={todayStr}
                  onChange={(e) => setDonationDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: '5px' }}>
                  <Clock className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                  Donation Time
                </label>
                <input
                  type="time"
                  className="form-input"
                  value={donationTime}
                  onChange={(e) => setDonationTime(e.target.value)}
                />
              </div>
            </div>

            {/* Hospital / Clinic & Units */}
            <div className="form-row-2" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: '5px' }}>
                  <Hospital className="w-3.5 h-3.5 inline mr-1 text-red-500" />
                  Hospital or Blood Center
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. City General Hospital / Red Crescent"
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: '5px' }}>
                  Units Donated
                </label>
                <select
                  className="form-select"
                  value={units}
                  onChange={(e) => setUnits(Number(e.target.value))}
                >
                  <option value={1}>1 Bag (450ml)</option>
                  <option value={2}>2 Bags (900ml)</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: '5px' }}>
                Recipient or Donation Notes (Optional)
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Emergency surgery donor / Routine camp donation"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Automated Recovery Live Calculation Preview Card */}
            <div
              style={{
                background: eligibleNow ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                border: eligibleNow ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: '14px',
                padding: '14px',
                marginBottom: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Sparkles className={`w-4 h-4 ${eligibleNow ? 'text-emerald-400' : 'text-amber-400'}`} />
                <strong style={{ fontSize: '0.88rem', color: '#fff' }}>
                  Automated Eligibility & Recovery Schedule:
                </strong>
              </div>

              <div style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                <div>• Whole Blood Recovery Standard: <strong>90 Days</strong></div>
                <div>
                  • Next Eligible Donation Date:{' '}
                  <span style={{ color: eligibleNow ? 'var(--success)' : '#fbbf24', fontWeight: 700 }}>
                    {eligibleDateFormatted}
                  </span>
                </div>
                <div style={{ marginTop: '4px', fontSize: '0.78rem', color: eligibleNow ? '#a7f3d0' : '#fca5a5' }}>
                  {eligibleNow ? (
                    <span>
                      <CheckCircle2 className="w-3.5 h-3.5 inline mr-1 text-emerald-400" />
                      More than 90 days have passed. You are <strong>currently eligible</strong> to donate again!
                    </span>
                  ) : (
                    <span>
                      <Clock className="w-3.5 h-3.5 inline mr-1 text-amber-400" />
                      Recovery in progress: <strong>{daysRemaining} days remaining</strong>. LifePulse will automatically notify you via website message when the time arrives.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div
            className="modal-footer"
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              padding: '14px 22px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <HeartHandshake className="w-4 h-4" />
              <span>Save & Activate Auto Notification</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
