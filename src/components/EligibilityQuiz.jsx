import React, { useState } from 'react';
import { ClipboardCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export default function EligibilityQuiz({ onOpenUpload }) {
  const [answers, setAnswers] = useState({
    age: true,
    weight: true,
    health: true,
    interval: true,
    travel: true
  });

  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, checked } = e.target;
    setAnswers((prev) => ({ ...prev, [name]: checked }));
  };

  const handleVerify = (e) => {
    e.preventDefault();
    const isEligible = answers.age && answers.weight && answers.health && answers.interval && answers.travel;
    setResult(isEligible);
  };

  return (
    <section style={{ background: 'rgba(13, 17, 23, 0.4)' }}>
      <div className="container" style={{ maxWidth: '820px' }}>
        <div className="section-header">
          <span className="section-tag">
            <ClipboardCheck className="w-3.5 h-3.5 inline mr-1" />
            Self Assessment
          </span>
          <h2 className="section-title">Can You Donate Blood Today?</h2>
          <p className="section-description">
            Complete this 1-minute quick check. Medical screening is always performed by licensed staff prior to every donation.
          </p>
        </div>

        <div className="dash-box interactive-card" style={{ padding: '32px' }}>
          <form onSubmit={handleVerify}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '0.95rem' }}>
                <input
                  type="checkbox"
                  name="age"
                  checked={answers.age}
                  onChange={handleChange}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                />
                I am between 18 and 65 years old
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '0.95rem' }}>
                <input
                  type="checkbox"
                  name="weight"
                  checked={answers.weight}
                  onChange={handleChange}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                />
                I weigh at least 50 kg (110 lbs)
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '0.95rem' }}>
                <input
                  type="checkbox"
                  name="health"
                  checked={answers.health}
                  onChange={handleChange}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                />
                I am feeling healthy, well rested, and free of active cold or fever symptoms
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '0.95rem' }}>
                <input
                  type="checkbox"
                  name="interval"
                  checked={answers.interval}
                  onChange={handleChange}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                />
                It has been at least 56 days (8 weeks) since my last whole blood donation
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '0.95rem' }}>
                <input
                  type="checkbox"
                  name="travel"
                  checked={answers.travel}
                  onChange={handleChange}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                />
                No recent major surgical procedures or high-risk travel in the past 6 months
              </label>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              <ClipboardCheck className="w-4 h-4" />
              <span>Verify My Eligibility</span>
            </button>
          </form>

          {result !== null && (
            <div style={{ marginTop: '20px' }}>
              {result ? (
                <div
                  style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    padding: '18px',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'center'
                  }}
                >
                  <CheckCircle2 className="w-9 h-9 text-emerald-400 mx-auto mb-2" />
                  <h4 style={{ color: '#6ee7b7', fontSize: '1.15rem', marginBottom: '4px' }}>
                    You Are Eligible to Donate Blood!
                  </h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    Thank you for your willingness to save lives. Upload your data and register as an active donor today!
                  </p>
                  <button type="button" className="btn btn-primary btn-sm" onClick={onOpenUpload}>
                    Register as Active Donor
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    background: 'rgba(245, 158, 11, 0.15)',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                    padding: '18px',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'center'
                  }}
                >
                  <AlertCircle className="w-9 h-9 text-amber-400 mx-auto mb-2" />
                  <h4 style={{ color: '#fcd34d', fontSize: '1.15rem', marginBottom: '4px' }}>
                    Temporary Deferral Detected
                  </h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                    One or more health guidelines were not checked. Please consult a donation counselor before scheduling an appointment.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
