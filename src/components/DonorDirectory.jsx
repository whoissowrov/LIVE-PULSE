import React, { useState, useEffect } from 'react';
import { Search, Phone, MessageCircle, MapPin, CheckCircle, Droplet, Calendar, Users, Filter, Navigation } from 'lucide-react';
import { BLOOD_COMPATIBILITY } from '../data/mockData';
import { BANGLADESH_DIVISIONS, BANGLADESH_DISTRICTS, getDistrictsByDivision, getUpazilasByDistrict } from '../data/bangladeshGeoData';

export default function DonorDirectory({ donors, initialFilters }) {
  const [bloodGroup, setBloodGroup] = useState(initialFilters?.bloodGroup || '');
  const [cityQuery, setCityQuery] = useState(initialFilters?.city || '');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState(initialFilters?.district || '');
  const [selectedUpazila, setSelectedUpazila] = useState(initialFilters?.upazila || '');
  const [availability, setAvailability] = useState('');
  const [compatibility, setCompatibility] = useState('');

  // Synchronize when initialFilters change from hero or parent navigation
  useEffect(() => {
    if (initialFilters) {
      if (initialFilters.bloodGroup !== undefined) setBloodGroup(initialFilters.bloodGroup);
      if (initialFilters.district !== undefined) setSelectedDistrict(initialFilters.district);
      if (initialFilters.upazila !== undefined) setSelectedUpazila(initialFilters.upazila);
      if (initialFilters.city !== undefined && !initialFilters.district) setCityQuery(initialFilters.city);
    }
  }, [initialFilters]);

  const availableDistricts = selectedDivision
    ? getDistrictsByDivision(selectedDivision)
    : BANGLADESH_DISTRICTS;

  const availableUpazilas = selectedDistrict
    ? getUpazilasByDistrict(selectedDistrict)
    : [];

  const filtered = donors.filter((d) => {
    if (bloodGroup && d.bloodGroup !== bloodGroup) return false;
    if (selectedDivision) {
      const matchDiv = (d.division && d.division.toLowerCase() === selectedDivision.toLowerCase()) ||
        availableDistricts.some(dist => dist.name.toLowerCase() === (d.district || d.city || '').toLowerCase());
      if (!matchDiv) return false;
    }
    if (selectedDistrict) {
      const qDist = selectedDistrict.toLowerCase();
      const matchDist = (d.district && d.district.toLowerCase() === qDist) ||
        (d.city && d.city.toLowerCase() === qDist);
      if (!matchDist) return false;
    }
    if (selectedUpazila) {
      const qUpz = selectedUpazila.toLowerCase();
      const matchUpz = (d.upazila && d.upazila.toLowerCase() === qUpz) ||
        (d.area && d.area.toLowerCase().includes(qUpz));
      if (!matchUpz) return false;
    }
    if (cityQuery) {
      const q = cityQuery.toLowerCase().trim();
      const matchCity = d.city?.toLowerCase().includes(q);
      const matchDistrict = d.district?.toLowerCase().includes(q);
      const matchUpazila = d.upazila?.toLowerCase().includes(q);
      const matchUnion = d.union?.toLowerCase().includes(q);
      const matchVillage = d.village?.toLowerCase().includes(q);
      const matchArea = d.area?.toLowerCase().includes(q);
      const matchName = d.name?.toLowerCase().includes(q);
      if (!matchCity && !matchDistrict && !matchUpazila && !matchUnion && !matchVillage && !matchArea && !matchName) return false;
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
          <div className="filter-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            <div className="input-with-icon">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                className="form-control"
                placeholder="Search Zilla, Upazila, Village, or Name..."
                value={cityQuery}
                onChange={(e) => setCityQuery(e.target.value)}
              />
            </div>

            {/* Division Filter */}
            <div>
              <select
                className="form-control"
                value={selectedDivision}
                onChange={(e) => {
                  setSelectedDivision(e.target.value);
                  setSelectedDistrict('');
                }}
              >
                <option value="">All Divisions (সব বিভাগ)</option>
                {BANGLADESH_DIVISIONS.map((div) => (
                  <option key={div.id} value={div.name}>
                    {div.name} ({div.bnName})
                  </option>
                ))}
              </select>
            </div>

            {/* Zilla / District Filter */}
            <div>
              <select
                className="form-control"
                value={selectedDistrict}
                onChange={(e) => {
                  setSelectedDistrict(e.target.value);
                  setSelectedUpazila('');
                }}
              >
                <option value="">All Zillas (সব জেলা)</option>
                {availableDistricts.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name} ({d.bnName})
                  </option>
                ))}
              </select>
            </div>

            {/* Upazila / Sub-District Filter */}
            <div>
              <select
                className="form-control"
                value={selectedUpazila}
                onChange={(e) => setSelectedUpazila(e.target.value)}
                disabled={!selectedDistrict}
              >
                <option value="">
                  {selectedDistrict
                    ? `All Upazilas in ${selectedDistrict} (সকল উপজেলা)`
                    : 'All Upazilas (উপজেলা)'}
                </option>
                {availableUpazilas.map((upz) => (
                  <option key={upz} value={upz}>
                    {upz}
                  </option>
                ))}
              </select>
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
            <h4 style={{ fontSize: '1.2rem', marginBottom: '6px' }}>
              {donors.length === 0 ? 'No registered donors yet' : 'No donors found'}
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {donors.length === 0
                ? 'Be the first life-saver! Click "Upload My Data & Location" to register as an active volunteer donor.'
                : 'Try selecting "All Zillas" or "All Blood Groups" to broaden your search across Bangladesh.'}
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
                      <div className="donor-location" title="Bangladeshi District & Upazila">
                        <MapPin className="w-3.5 h-3.5 text-red-500 inline mr-1 flex-shrink-0" />
                        <span>
                          {d.village ? `${d.village}, ` : ''}
                          {d.upazila ? `${d.upazila}, ` : ''}
                          <strong>{d.district || d.city || 'Dhaka'}</strong>
                          {d.division && d.division !== (d.district || d.city) ? ` (${d.division})` : ''}
                        </span>
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
