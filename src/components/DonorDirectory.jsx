import React, { useState } from 'react';
import { Search, Phone, MessageCircle, MapPin, CheckCircle, Droplet, Calendar, Users } from 'lucide-react';
import { BLOOD_COMPATIBILITY } from '../data/mockData';

export default function DonorDirectory({ donors, initialFilters }) {
  const [bloodGroup, setBloodGroup] = useState(initialFilters?.bloodGroup || '');
  const [cityQuery, setCityQuery] = useState(initialFilters?.city || '');
  const [availability, setAvailability] = useState('');
  const [compatibility, setCompatibility] = useState('');

  const filtered = donors.filter((d) => {
    if (bloodGroup && d.bloodGroup !== bloodGroup) return false;
    if (cityQuery) {
      const q = cityQuery.toLowerCase().trim();
      const matchCity = d.city?.toLowerCase().includes(q);
      const matchArea = d.area?.toLowerCase().includes(q);
      const matchName = d.name?.toLowerCase().includes(q);
      if (!matchCity && !matchArea && !matchName) return false;
    }
    if (availability && d.status !== availability) return false;
    if (compatibility) {
      const canReceive = BLOOD_COMPATIBILITY[compatibility]?.canReceiveFrom || [];
      if (!canReceive.includes(d.bloodGroup)) return false;
    }
    return true;
  });

  return (
    <section id="donorsSection" style={{ background: 'rgba(13, 17, 23, 0.4)' }}>
      <div className="container">
        <div className="section-header">
          <span className="section-tag">
            <Users className="w-3.5 h-3.5 inline mr-1" />
            Verified Registry
          </span>
          <h2 className="section-title">Find Compatible Donors Near You</h2>
          <p className="section-description">
            Explore our real-time database of registered volunteers ready to donate in your area. Filter by group, proximity, or your required recipient compatibility.
          </p>
        </div>

        {/* Filters */}
        <div className="search-control-bar interactive-card">
          <div className="filter-grid">
            <div className="input-with-icon">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                className="form-control"
                placeholder="Search by city, neighborhood, or donor name..."
                value={cityQuery}
                onChange={(e) => setCityQuery(e.target.value)}
              />
            </div>

            <div>
              <select
                className="form-control"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
              >
                <option value="">All Blood Groups</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div>
              <select
                className="form-control"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="available">🟢 Available Now</option>
                <option value="busy">🟡 Recently Donated</option>
              </select>
            </div>

            <div>
              <select
                className="form-control"
                value={compatibility}
                onChange={(e) => setCompatibility(e.target.value)}
              >
                <option value="">Filter by Recipient Type</option>
                <option value="A+">Can give to A+</option>
                <option value="O-">Can give to O-</option>
                <option value="B+">Can give to B+</option>
                <option value="AB+">Can give to AB+</option>
              </select>
            </div>
          </div>
        </div>

        {/* Donors Cards */}
        {filtered.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '48px',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <Search className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <h4 style={{ fontSize: '1.2rem', marginBottom: '6px' }}>No donors found</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Try selecting "All Blood Groups" or broadening your city search.
            </p>
          </div>
        ) : (
          <div className="donors-grid">
            {filtered.map((d) => (
              <div key={d.id} className="donor-card interactive-card">
                <div>
                  <div className="donor-top">
                    <div className="donor-avatar-wrap">
                      <div className="donor-avatar">
                        {d.avatar ? (
                          <img src={d.avatar} alt={d.name} />
                        ) : (
                          d.name.charAt(0)
                        )}
                      </div>
                      <div className={`donor-status-dot status-${d.status}`} />
                    </div>

                    <div className="donor-meta">
                      <h4>
                        {d.name}{' '}
                        {d.verified && (
                          <CheckCircle className="w-4 h-4 text-sky-400 inline" title="Verified Donor" />
                        )}
                      </h4>
                      <div className="donor-location">
                        <MapPin className="w-3.5 h-3.5 text-red-500 inline mr-1" />
                        {d.city} ({d.area})
                      </div>
                    </div>

                    <div className="donor-blood-tag">{d.bloodGroup}</div>
                  </div>

                  <div className="donor-stats-pills">
                    <span className="donor-pill">
                      <Droplet className="w-3 h-3 text-red-500 inline mr-1" />
                      {d.donationsCount} donations
                    </span>
                    <span className="donor-pill">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      Last: {d.lastDonated}
                    </span>
                    <span className="donor-pill">
                      <span
                        style={{
                          display: 'inline-block',
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: d.status === 'available' ? 'var(--success)' : 'var(--warning)',
                          marginRight: '6px'
                        }}
                      />
                      {d.status === 'available' ? 'Available' : 'Busy'}
                    </span>
                  </div>
                </div>

                <div className="donor-actions">
                  <a href={`tel:${d.phone}`} className="btn btn-outline-danger btn-sm">
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>
                  <a
                    href={`https://wa.me/${d.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(d.name)},%20I%20saw%20your%20profile%20on%20LifePulse%20and%20am%20seeking%20blood%20donation.`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary btn-sm"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Chat</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
