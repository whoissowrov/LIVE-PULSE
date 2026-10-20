import React, { useState } from 'react';
import { MapPin, Navigation, AlertTriangle, Search, Activity, Heart, ShieldCheck, Compass, Hospital } from 'lucide-react';
import { BANGLADESH_DISTRICTS, getUpazilasByDistrict } from '../data/bangladeshGeoData';

export default function Hero({ onOpenUpload, onOpenSos, onQuickSearch, onNavigate, platformAlert }) {
  const [targetGroup, setTargetGroup] = useState('O+');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedUpazila, setSelectedUpazila] = useState('');

  const availableUpazilas = selectedDistrict
    ? getUpazilasByDistrict(selectedDistrict)
    : [];

  const handleSearch = (e) => {
    e.preventDefault();
    const cityQuery = selectedUpazila
      ? `${selectedUpazila}, ${selectedDistrict}`
      : selectedDistrict;
    onQuickSearch({
      bloodGroup: targetGroup,
      district: selectedDistrict,
      upazila: selectedUpazila,
      city: cityQuery
    });
    if (onNavigate) {
      onNavigate('donors');
    } else {
      const targetSection = document.getElementById('donorsSection');
      if (targetSection) targetSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleChipClick = (group) => {
    setTargetGroup(group);
    const cityQuery = selectedUpazila
      ? `${selectedUpazila}, ${selectedDistrict}`
      : selectedDistrict;
    onQuickSearch({
      bloodGroup: group,
      district: selectedDistrict,
      upazila: selectedUpazila,
      city: cityQuery
    });
    if (onNavigate) {
      onNavigate('donors');
    } else {
      const targetSection = document.getElementById('donorsSection');
      if (targetSection) targetSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="hero-section" id="home">
        <div className="hero-glow-1" />
        <div className="hero-glow-2" />
        <div className="container hero-grid">
          <div className="hero-content">
            <div className="pill-badge">
              <span className="pulse-dot" />
              <span>Every 2 seconds, someone in your city needs blood</span>
            </div>

            <h1 className="hero-title">
              Donate Blood. <br />
              <span className="gradient-text">Share Your Location.</span> <br />
              Save Lives Instantly.
            </h1>

            <p className="hero-subtitle">
              Join our real-time donor network. Log in, upload your health profile and live GPS location to connect directly with patients and medical centers in immediate need.
            </p>

            <div className="hero-cta-group">
              <button className="btn btn-primary btn-lg" onClick={onOpenUpload}>
                <MapPin className="w-5 h-5" />
                <span>Upload My Data & Location</span>
              </button>

              <button className="btn btn-danger-sos btn-lg" onClick={onOpenSos}>
                <AlertTriangle className="w-5 h-5" />
                <span>Request Emergency Blood</span>
              </button>

              <button
                className="btn btn-secondary btn-lg"
                onClick={() => {
                  if (onNavigate) onNavigate('districts');
                  else {
                    const el = document.getElementById('regionalTracker');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                <Activity className="w-5 h-5 text-emerald-400" />
                <span>District & Village Tracker</span>
              </button>

              <button
                className="btn btn-secondary btn-lg"
                onClick={() => {
                  if (onNavigate) onNavigate('hospitals');
                  else {
                    const el = document.getElementById('hospitalsSection');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                <Hospital className="w-5 h-5 text-sky-400" />
                <span>All BD Hospitals &amp; Locations</span>
              </button>

              <button
                className="btn btn-secondary btn-lg"
                onClick={() => {
                  if (onNavigate) onNavigate('donors');
                  else {
                    const el = document.getElementById('donorsSection');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                <Search className="w-5 h-5" />
                <span>Search Donors</span>
              </button>

              <button
                className="btn btn-secondary btn-lg"
                onClick={() => {
                  if (onNavigate) onNavigate('map');
                  else {
                    const el = document.getElementById('mapSection');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                <Compass className="w-5 h-5 text-red-400" />
                <span>Explore Live Map</span>
              </button>
            </div>

            <div className="hero-stats-row">
              <div className="stat-item">
                <h3>14,850<span>+</span></h3>
                <p>Verified Life Savers</p>
              </div>
              <div className="stat-item">
                <h3>3,420<span>+</span></h3>
                <p>Successful Matches</p>
              </div>
              <div className="stat-item">
                <h3>&lt; 15<span> min</span></h3>
                <p>Average Match Speed</p>
              </div>
            </div>
          </div>

          {/* Hero Quick Finder Glass Card */}
          <div className="hero-card-wrap">
            <div className="hero-glass-card interactive-card">
              <div className="hero-card-header">
                <div className="card-title-group">
                  <h3>Quick Blood Finder</h3>
                  <p>Locate donors matching your exact blood group</p>
                </div>
                <div
                  className="live-indicator"
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    const el = document.getElementById('mapSection');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  title="Click to view full Live Radar Map"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                  <span>LIVE RADAR MAP</span>
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                CRITICAL DEMAND TODAY:
              </div>
              <div className="urgent-blood-chips">
                <div className="blood-chip needed" onClick={() => handleChipClick('O-')}>
                  <span>O-</span> <span className="label">Universal</span>
                </div>
                <div className="blood-chip needed" onClick={() => handleChipClick('B+')}>
                  <span>B+</span> <span className="label">High</span>
                </div>
                <div className="blood-chip" onClick={() => handleChipClick('A+')}>
                  <span>A+</span> <span className="label">Normal</span>
                </div>
                <div className="blood-chip" onClick={() => handleChipClick('AB+')}>
                  <span>AB+</span> <span className="label">Universal</span>
                </div>
                <div className="blood-chip" onClick={() => handleChipClick('O+')}>
                  <span>O+</span> <span className="label">Common</span>
                </div>
              </div>

              <div className="quick-donor-finder-box">
                <form className="quick-finder-form" onSubmit={handleSearch}>
                  <div>
                    <label className="form-label-compact">Target Blood Group</label>
                    <select
                      className="form-control"
                      value={targetGroup}
                      onChange={(e) => setTargetGroup(e.target.value)}
                    >
                      <option value="">Any Compatible Blood Group</option>
                      <option value="A+">A Positive (A+)</option>
                      <option value="A-">A Negative (A-)</option>
                      <option value="B+">B Positive (B+)</option>
                      <option value="B-">B Negative (B-)</option>
                      <option value="AB+">AB Positive (AB+)</option>
                      <option value="AB-">AB Negative (AB-)</option>
                      <option value="O+">O Positive (O+)</option>
                      <option value="O-">O Negative (O-)</option>
                    </select>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label className="form-label-compact" style={{ margin: 0 }}>
                        District / Zilla (জেলা)
                      </label>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        64 Districts
                      </span>
                    </div>
                    <div className="input-with-icon">
                      <MapPin className="w-4 h-4 text-red-500" />
                      <select
                        className="form-control"
                        value={selectedDistrict}
                        onChange={(e) => {
                          setSelectedDistrict(e.target.value);
                          setSelectedUpazila('');
                        }}
                      >
                        <option value="">All / Select District (সব জেলা)</option>
                        {BANGLADESH_DISTRICTS.map((d) => (
                          <option key={d.id} value={d.name}>
                            {d.name} ({d.bnName}) - {d.division}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label className="form-label-compact" style={{ margin: 0 }}>
                        Upazila / Sub-District (উপজেলা)
                      </label>
                      {selectedDistrict && availableUpazilas.length > 0 && (
                        <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>
                          {availableUpazilas.length} Upazilas
                        </span>
                      )}
                    </div>
                    <div className="input-with-icon">
                      <Navigation className="w-4 h-4 text-emerald-400" />
                      <select
                        className="form-control"
                        value={selectedUpazila}
                        onChange={(e) => setSelectedUpazila(e.target.value)}
                        disabled={!selectedDistrict}
                        style={{
                          opacity: !selectedDistrict ? 0.65 : 1,
                          cursor: !selectedDistrict ? 'not-allowed' : 'pointer'
                        }}
                      >
                        <option value="">
                          {selectedDistrict
                            ? `All Upazilas in ${selectedDistrict} (সকল উপজেলা)`
                            : 'Select District first (প্রথমে জেলা নির্বাচন করুন)'}
                        </option>
                        {availableUpazilas.map((upz) => (
                          <option key={upz} value={upz}>
                            {upz}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '6px' }}>
                    <Search className="w-4 h-4" />
                    <span>Find Donors In This Area</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
  );
}
