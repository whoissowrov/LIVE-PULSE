import React, { useState } from 'react';
import { Calculator, ArrowUp, ArrowDown, Network } from 'lucide-react';
import { BLOOD_COMPATIBILITY } from '../data/mockData';

export default function CompatibilityMatrix() {
  const [selectedGroup, setSelectedGroup] = useState('O+');
  const compatData = BLOOD_COMPATIBILITY[selectedGroup] || BLOOD_COMPATIBILITY['O+'];

  return (
    <section id="compatibilitySection">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">
            <Network className="w-3.5 h-3.5 inline mr-1" />
            Science & Genetics
          </span>
          <h2 className="section-title">Blood Group Compatibility Matrix</h2>
          <p className="section-description">
            Discover who you can safely donate blood to and from which compatible donor groups you can receive life-saving transfusions.
          </p>
        </div>

        <div className="compatibility-grid">
          {/* Interactive Calculator */}
          <div className="compat-calc-card interactive-card">
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: '10px' }}>
              <Calculator className="w-5 h-5 text-red-500 inline mr-2" />
              Compatibility Calculator
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
              Select your blood group to see whom you can save and who can donate to you.
            </p>

            <div className="form-group">
              <label className="form-label">Select Blood Group:</label>
              <select
                className="form-control"
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                style={{ fontSize: '1.05rem', fontWeight: 700 }}
              >
                <option value="O-">O Negative (O-) — Universal Whole Blood Donor</option>
                <option value="O+">O Positive (O+) — Most Common</option>
                <option value="A+">A Positive (A+)</option>
                <option value="A-">A Negative (A-)</option>
                <option value="B+">B Positive (B+)</option>
                <option value="B-">B Negative (B-)</option>
                <option value="AB+">AB Positive (AB+) — Universal Recipient</option>
                <option value="AB-">AB Negative (AB-)</option>
              </select>
            </div>

            <div className="compat-result-display">
              <div style={{ marginBottom: '16px' }}>
                <h5 style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  <ArrowUp className="w-4 h-4 text-red-500 inline mr-1" />
                  CAN DONATE BLOOD TO:
                </h5>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {compatData.canDonateTo.map((type) => (
                    <span
                      key={type}
                      className="blood-chip"
                      style={{
                        background: 'var(--primary-subtle)',
                        borderColor: 'var(--primary-border)',
                        color: '#fca5a5',
                        fontWeight: 800
                      }}
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h5 style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  <ArrowDown className="w-4 h-4 text-emerald-400 inline mr-1" />
                  CAN RECEIVE BLOOD FROM:
                </h5>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {compatData.canReceiveFrom.map((type) => (
                    <span
                      key={type}
                      className="blood-chip"
                      style={{
                        background: 'rgba(16, 185, 129, 0.12)',
                        borderColor: 'rgba(16, 185, 129, 0.3)',
                        color: '#6ee7b7',
                        fontWeight: 800
                      }}
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Table Reference */}
          <div className="matrix-table-wrap interactive-card">
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '14px' }}>
              Full Compatibility Reference
            </h4>
            <table className="matrix-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Can Donate To</th>
                  <th>Can Receive From</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>O-</td>
                  <td>Everyone (All Groups)</td>
                  <td>O- only</td>
                </tr>
                <tr>
                  <td>O+</td>
                  <td>O+, A+, B+, AB+</td>
                  <td>O+, O-</td>
                </tr>
                <tr>
                  <td>A-</td>
                  <td>A+, A-, AB+, AB-</td>
                  <td>A-, O-</td>
                </tr>
                <tr>
                  <td>A+</td>
                  <td>A+, AB+</td>
                  <td>A+, A-, O+, O-</td>
                </tr>
                <tr>
                  <td>B-</td>
                  <td>B+, B-, AB+, AB-</td>
                  <td>B-, O-</td>
                </tr>
                <tr>
                  <td>B+</td>
                  <td>B+, AB+</td>
                  <td>B+, B-, O+, O-</td>
                </tr>
                <tr>
                  <td>AB-</td>
                  <td>AB+, AB-</td>
                  <td>AB-, A-, B-, O-</td>
                </tr>
                <tr>
                  <td>AB+</td>
                  <td>AB+ only</td>
                  <td>Everyone (All Groups)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
