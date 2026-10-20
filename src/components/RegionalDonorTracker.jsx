import React, { useState, useMemo } from 'react';
import {
  Activity,
  MapPin,
  Users,
  Compass,
  Search,
  Layers,
  Globe,
  ChevronRight,
  ChevronDown,
  Sparkles,
  ArrowRight,
  Flame,
  TrendingUp,
  CheckCircle2,
  Clock,
  Droplet
} from 'lucide-react';
import { BANGLADESH_DISTRICTS, BANGLADESH_DIVISIONS } from '../data/bangladeshGeoData';

export default function RegionalDonorTracker({
  donors = [],
  users = [],
  loginActivities = [],
  onSelectLocationFilter,
  onOpenAuth
}) {
  const [selectedDivision, setSelectedDivision] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedDistrict, setExpandedDistrict] = useState(null);
  const [expandedUpazila, setExpandedUpazila] = useState(null);
  const [sortBy, setSortBy] = useState('donors'); // 'donors' | 'logins' | 'name'

  // Aggregate user and donor data by District, Upazila, and Village
  const regionalData = useMemo(() => {
    // Start with all 64 districts from bangladeshGeoData so all districts are trackable
    const distMap = {};
    BANGLADESH_DISTRICTS.forEach((d) => {
      distMap[d.name] = {
        name: d.name,
        bnName: d.bnName,
        division: d.division,
        lat: d.lat,
        lng: d.lng,
        allUpazilas: d.upazilas || [],
        registeredDonors: 0,
        loggedInDonors: 0,
        totalLogins: 0,
        availableNow: 0,
        bloodGroups: { 'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0 },
        upazilasData: {},
        lastActive: null
      };
      // Pre-initialize upazilas
      (d.upazilas || []).forEach((upz) => {
        distMap[d.name].upazilasData[upz] = {
          name: upz,
          district: d.name,
          registeredDonors: 0,
          loggedInDonors: 0,
          totalLogins: 0,
          availableNow: 0,
          bloodGroups: {},
          villages: {},
          lastActive: null
        };
      });
    });

    // Count user logins from users array & loginActivities
    const donorSet = new Set(donors.map((d) => d.userId || d.id));

    // Process all users/donors
    const activeContributors = donors.length > 0 ? donors : users.filter((u) => u.isDonor);

    activeContributors.forEach((item) => {
      const dist = item.district || item.location?.district || item.city || item.location?.city || 'Dhaka';
      const upz = item.upazila || item.location?.upazila || (distMap[dist]?.allUpazilas?.[0] || 'Central Upazila');
      const vil = item.village || item.location?.village || item.union || item.location?.union || 'General Ward';
      const bg = item.bloodGroup || 'O+';
      const isAvail = item.status === 'available' || item.availableNow !== false || item.isAvailable !== false;
      const logins = Number(item.loginCount) || (item.lastLoginAt ? 1 : 1);
      const lastLogin = item.lastLoginAt || item.updatedAt || null;

      // Ensure district exists in map (fallback if custom naming)
      if (!distMap[dist]) {
        distMap[dist] = {
          name: dist,
          bnName: dist,
          division: item.division || 'Dhaka',
          allUpazilas: [upz],
          registeredDonors: 0,
          loggedInDonors: 0,
          totalLogins: 0,
          availableNow: 0,
          bloodGroups: { 'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0 },
          upazilasData: {},
          lastActive: null
        };
      }

      const dRef = distMap[dist];
      dRef.registeredDonors += 1;
      dRef.totalLogins += logins;
      if (item.lastLoginAt) dRef.loggedInDonors += 1;
      if (isAvail) dRef.availableNow += 1;
      if (dRef.bloodGroups[bg] !== undefined) {
        dRef.bloodGroups[bg] += 1;
      }
      if (lastLogin && (!dRef.lastActive || new Date(lastLogin) > new Date(dRef.lastActive))) {
        dRef.lastActive = lastLogin;
      }

      // Ensure upazila exists
      if (!dRef.upazilasData[upz]) {
        dRef.upazilasData[upz] = {
          name: upz,
          district: dist,
          registeredDonors: 0,
          loggedInDonors: 0,
          totalLogins: 0,
          availableNow: 0,
          bloodGroups: {},
          villages: {},
          lastActive: null
        };
      }

      const uRef = dRef.upazilasData[upz];
      uRef.registeredDonors += 1;
      uRef.totalLogins += logins;
      if (item.lastLoginAt) uRef.loggedInDonors += 1;
      if (isAvail) uRef.availableNow += 1;
      uRef.bloodGroups[bg] = (uRef.bloodGroups[bg] || 0) + 1;
      if (lastLogin && (!uRef.lastActive || new Date(lastLogin) > new Date(uRef.lastActive))) {
        uRef.lastActive = lastLogin;
      }

      // Ensure village exists
      if (!uRef.villages[vil]) {
        uRef.villages[vil] = {
          name: vil,
          upazila: upz,
          district: dist,
          registeredDonors: 0,
          availableNow: 0,
          bloodGroups: {},
          totalLogins: 0,
          lastActive: null
        };
      }

      const vRef = uRef.villages[vil];
      vRef.registeredDonors += 1;
      vRef.totalLogins += logins;
      if (isAvail) vRef.availableNow += 1;
      vRef.bloodGroups[bg] = (vRef.bloodGroups[bg] || 0) + 1;
      if (lastLogin && (!vRef.lastActive || new Date(lastLogin) > new Date(vRef.lastActive))) {
        vRef.lastActive = lastLogin;
      }
    });

    // Calculate totals
    const districtsArray = Object.values(distMap);
    const totalDonors = districtsArray.reduce((acc, d) => acc + d.registeredDonors, 0);
    const totalLoginsCount = districtsArray.reduce((acc, d) => acc + d.totalLogins, 0);
    const totalActiveLogins = districtsArray.reduce((acc, d) => acc + d.loggedInDonors, 0);
    const totalAvailable = districtsArray.reduce((acc, d) => acc + d.availableNow, 0);
    const activeDistrictsCount = districtsArray.filter((d) => d.registeredDonors > 0 || d.totalLogins > 0).length;

    // Count active upazilas and villages
    let activeUpazilasCount = 0;
    let activeVillagesCount = 0;
    districtsArray.forEach((d) => {
      Object.values(d.upazilasData).forEach((u) => {
        if (u.registeredDonors > 0 || u.totalLogins > 0) {
          activeUpazilasCount += 1;
          activeVillagesCount += Object.keys(u.villages).length;
        }
      });
    });

    return {
      districts: districtsArray,
      totalDonors,
      totalLoginsCount,
      totalActiveLogins,
      totalAvailable,
      activeDistrictsCount,
      activeUpazilasCount,
      activeVillagesCount
    };
  }, [donors, users, loginActivities]);

  // Filtered and sorted districts
  const filteredDistricts = useMemo(() => {
    let list = regionalData.districts;

    // Filter by division
    if (selectedDivision !== 'ALL') {
      list = list.filter((d) => d.division.toLowerCase() === selectedDivision.toLowerCase());
    }

    // Filter by search query (matches District, Upazila, or Village)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((d) => {
        const matchDistrict = d.name.toLowerCase().includes(q) || d.bnName.includes(q);
        const matchUpazila = d.allUpazilas.some((u) => u.toLowerCase().includes(q));
        const matchVillage = Object.values(d.upazilasData).some((u) =>
          Object.keys(u.villages).some((v) => v.toLowerCase().includes(q))
        );
        return matchDistrict || matchUpazila || matchVillage;
      });
    }

    // Sort
    return [...list].sort((a, b) => {
      if (sortBy === 'donors') {
        if (b.registeredDonors !== a.registeredDonors) {
          return b.registeredDonors - a.registeredDonors;
        }
        return b.totalLogins - a.totalLogins;
      }
      if (sortBy === 'logins') {
        return b.totalLogins - a.totalLogins;
      }
      return a.name.localeCompare(b.name);
    });
  }, [regionalData.districts, selectedDivision, searchQuery, sortBy]);

  // Format relative timestamp
  const formatTimeAgo = (isoString) => {
    if (!isoString) return 'Active this week';
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const mins = Math.floor(diffMs / 60000);
      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    } catch (e) {
      return 'Recently';
    }
  };

  const handleToggleDistrict = (distName) => {
    if (expandedDistrict === distName) {
      setExpandedDistrict(null);
      setExpandedUpazila(null);
    } else {
      setExpandedDistrict(distName);
      setExpandedUpazila(null);
    }
  };

  const handleToggleUpazila = (upzName) => {
    setExpandedUpazila(expandedUpazila === upzName ? null : upzName);
  };

  return (
    <section id="regionalTracker" className="regional-tracker-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-tag">
            <Activity className="w-3.5 h-3.5 inline mr-1 text-red-500 animate-pulse" />
            Nationwide Blood Registry & Login Tracker
          </span>
          <h2 className="section-title">
            Bangladesh Regional Blood Donors & Login Tracker
          </h2>
          <p className="section-description">
            Live geographic breakdown of registered blood donors and active logins categorized across
            Bangladesh's <strong>64 Districts (Zillas)</strong>, <strong>495+ Upazilas (Upo-zella)</strong>, and <strong>Villages</strong>.
            Verify blood readiness in your community for immediate surgical and emergency response.
          </p>
        </div>

        {/* 4 Summary Metric Cards */}
        <div className="regional-metrics-grid">
          <div className="metric-box interactive-card">
            <div className="metric-icon-wrap bg-red-subtle text-red-400">
              <Droplet className="w-6 h-6" />
            </div>
            <div className="metric-content">
              <span className="metric-label">Registered Donors</span>
              <h3 className="metric-value">{regionalData.totalDonors}</h3>
              <span className="metric-subtext">Across 8 Divisions</span>
            </div>
          </div>

          <div className="metric-box interactive-card">
            <div className="metric-icon-wrap bg-emerald-subtle text-emerald-400">
              <Activity className="w-6 h-6" />
            </div>
            <div className="metric-content">
              <span className="metric-label">Logged-In Donors</span>
              <h3 className="metric-value">{regionalData.totalActiveLogins}</h3>
              <span className="metric-subtext">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
                Active User Logins Recorded
              </span>
            </div>
          </div>

          <div className="metric-box interactive-card">
            <div className="metric-icon-wrap bg-blue-subtle text-sky-400">
              <Compass className="w-6 h-6" />
            </div>
            <div className="metric-content">
              <span className="metric-label">Districts Active</span>
              <h3 className="metric-value">
                {regionalData.activeDistrictsCount} <span className="metric-max">/ 64</span>
              </h3>
              <span className="metric-subtext">Zillas with Donors Ready</span>
            </div>
          </div>

          <div className="metric-box interactive-card">
            <div className="metric-icon-wrap bg-purple-subtle text-purple-400">
              <Layers className="w-6 h-6" />
            </div>
            <div className="metric-content">
              <span className="metric-label">Upazilas & Villages</span>
              <h3 className="metric-value">
                {regionalData.activeUpazilasCount} <span className="metric-max">Upazilas</span>
              </h3>
              <span className="metric-subtext">
                {regionalData.activeVillagesCount} Verified Village/Wards
              </span>
            </div>
          </div>
        </div>

        {/* Live Activity Stream Ticker */}
        {loginActivities.length > 0 && (
          <div className="live-activity-stream-banner">
            <div className="stream-badge">
              <Flame className="w-3.5 h-3.5 text-amber-400 inline mr-1" />
              Recent Donor Activity:
            </div>
            <div className="stream-scroll">
              {loginActivities.slice(0, 5).map((act, i) => (
                <span key={act.id || i} className="stream-item">
                  <span className="stream-blood-tag">{act.bloodGroup || 'Blood Donor'}</span>
                  <span className="stream-loc">
                    {act.village ? `${act.village}, ` : ''}
                    {act.upazila ? `${act.upazila}, ` : ''}
                    {act.district || 'Dhaka'}
                  </span>
                  <span className="stream-time">
                    <Clock className="w-3 h-3 inline mr-0.5 opacity-70" />
                    {formatTimeAgo(act.timestamp)}
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Filter and Search Navigation Bar */}
        <div className="regional-control-bar interactive-card">
          {/* Search box */}
          <div className="regional-search-wrapper">
            <Search className="regional-search-icon w-4 h-4" />
            <input
              type="text"
              placeholder="Search by District (e.g. Dhaka, Bogura), Upazila (e.g. Savar, Hathazari), or Village..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="regional-search-input"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="clear-search-btn"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort selection */}
          <div className="regional-sort-wrapper">
            <span className="sort-label">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="regional-select"
            >
              <option value="donors">Most Donors First</option>
              <option value="logins">Most Active Logins</option>
              <option value="name">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Division Filter Pills */}
        <div className="division-pills-row">
          <button
            className={`division-pill ${selectedDivision === 'ALL' ? 'active' : ''}`}
            onClick={() => setSelectedDivision('ALL')}
          >
            All Bangladesh (64 Zillas)
          </button>
          {BANGLADESH_DIVISIONS.map((div) => {
            const countInDiv = regionalData.districts.filter((d) => d.division === div.name).reduce((acc, d) => acc + d.registeredDonors, 0);
            return (
              <button
                key={div.id}
                className={`division-pill ${selectedDivision === div.name ? 'active' : ''}`}
                onClick={() => setSelectedDivision(div.name)}
              >
                {div.name} ({div.bnName})
                {countInDiv > 0 && <span className="pill-counter">{countInDiv}</span>}
              </button>
            );
          })}
        </div>

        {/* 3-Tier Regional Explorer Content */}
        <div className="district-cards-list">
          {filteredDistricts.length === 0 ? (
            <div className="empty-tracker-notice">
              <MapPin className="w-8 h-8 text-muted mx-auto mb-2 opacity-50" />
              <p>No districts or upazilas match "{searchQuery}".</p>
              <button
                className="btn btn-secondary btn-sm mt-3"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDivision('ALL');
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredDistricts.map((dist) => {
              const isExpanded = expandedDistrict === dist.name;
              const hasDonors = dist.registeredDonors > 0;
              const upazilasWithDonors = Object.values(dist.upazilasData).filter(
                (u) => u.registeredDonors > 0 || u.totalLogins > 0
              );

              return (
                <div
                  key={dist.name}
                  className={`district-accordion-card interactive-card ${isExpanded ? 'expanded' : ''} ${hasDonors ? 'has-donors' : ''}`}
                >
                  {/* District Row Header */}
                  <div
                    className="district-row-header"
                    onClick={() => handleToggleDistrict(dist.name)}
                  >
                    <div className="district-info-left">
                      <div className="district-pin-icon">
                        <MapPin className={`w-5 h-5 ${hasDonors ? 'text-red-500' : 'text-slate-500'}`} />
                      </div>
                      <div>
                        <div className="district-title-wrap">
                          <h4 className="district-name">
                            {dist.name} <span className="district-bn">{dist.bnName}</span>
                          </h4>
                          <span className="district-division-tag">{dist.division} Division</span>
                        </div>
                        <div className="district-stats-chips">
                          <span className="stat-chip donor-chip">
                            <Users className="w-3.5 h-3.5 inline mr-1 text-red-400" />
                            <strong>{dist.registeredDonors}</strong> Registered Donor{dist.registeredDonors === 1 ? '' : 's'}
                          </span>
                          <span className="stat-chip login-chip">
                            <Activity className="w-3.5 h-3.5 inline mr-1 text-emerald-400" />
                            <strong>{dist.loggedInDonors}</strong> Logged In ({dist.totalLogins} total sessions)
                          </span>
                          {dist.availableNow > 0 && (
                            <span className="stat-chip available-chip">
                              <span className="avail-dot"></span>
                              {dist.availableNow} Ready Now
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="district-info-right">
                      {/* Mini Blood Group Badges */}
                      <div className="district-blood-pills">
                        {['A+', 'O+', 'B+', 'AB+'].map((bg) => {
                          const count = dist.bloodGroups[bg] || 0;
                          return (
                            <span
                              key={bg}
                              className={`mini-blood-pill ${count > 0 ? 'active' : 'zero'}`}
                              title={`${bg}: ${count} donor(s)`}
                            >
                              <strong>{bg}</strong> {count}
                            </span>
                          );
                        })}
                      </div>

                      <button
                        className="toggle-expand-btn"
                        aria-label="Toggle Upazila details"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-red-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-slate-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Level 2 & 3: Upazilas and Villages */}
                  {isExpanded && (
                    <div className="district-expanded-body">
                      <div className="upazila-section-meta">
                        <div className="meta-text">
                          <span className="font-semibold text-white">
                            Sub-Districts (Upazilas / Upo-zella) in {dist.name}:
                          </span>{' '}
                          Showing {dist.allUpazilas.length} total upazilas across {dist.name} District.
                        </div>
                        {onSelectLocationFilter && hasDonors && (
                          <button
                            className="btn btn-secondary btn-xs filter-directory-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectLocationFilter({ division: dist.division, district: dist.name });
                              const el = document.getElementById('donorsSection');
                              if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }}
                          >
                            <Users className="w-3 h-3 mr-1 inline" />
                            Filter Donors in {dist.name}
                          </button>
                        )}
                      </div>

                      <div className="upazilas-grid">
                        {dist.allUpazilas.map((upzName) => {
                          const uData = dist.upazilasData[upzName] || {
                            name: upzName,
                            registeredDonors: 0,
                            loggedInDonors: 0,
                            totalLogins: 0,
                            availableNow: 0,
                            bloodGroups: {},
                            villages: {}
                          };
                          const isUpzExpanded = expandedUpazila === upzName;
                          const hasUpzDonors = uData.registeredDonors > 0;
                          const villagesList = Object.values(uData.villages || {});

                          return (
                            <div
                              key={upzName}
                              className={`upazila-card ${isUpzExpanded ? 'upz-active' : ''} ${hasUpzDonors ? 'has-upz-donors' : 'no-upz-donors'}`}
                            >
                              <div
                                className="upazila-card-header"
                                onClick={() => handleToggleUpazila(upzName)}
                              >
                                <div className="upazila-title-row">
                                  <span className="upazila-name">{upzName}</span>
                                  <span className={`upz-badge ${hasUpzDonors ? 'bg-emerald' : 'bg-subtle'}`}>
                                    {uData.registeredDonors} Donor{uData.registeredDonors === 1 ? '' : 's'}
                                  </span>
                                </div>

                                <div className="upazila-stats-row">
                                  <span className="upz-meta-stat">
                                    <Activity className="w-3 h-3 inline mr-1 text-emerald-400" />
                                    {uData.totalLogins} Login{uData.totalLogins === 1 ? '' : 's'}
                                  </span>
                                  {villagesList.length > 0 && (
                                    <span className="upz-meta-stat text-purple-300">
                                      {villagesList.length} Village{villagesList.length === 1 ? '' : 's'}
                                    </span>
                                  )}
                                  <span className="upz-expand-icon">
                                    {isUpzExpanded ? '▲' : '▼'}
                                  </span>
                                </div>
                              </div>

                              {/* Level 3: Village / Union Breakdown for this Upazila */}
                              {isUpzExpanded && (
                                <div className="villages-breakdown-panel">
                                  {villagesList.length === 0 ? (
                                    <div className="village-empty-prompt">
                                      <p className="text-xs text-muted">
                                        No registered donors or logins recorded in {upzName} yet.
                                      </p>
                                      {onOpenAuth && (
                                        <button
                                          className="btn btn-primary btn-xs mt-2"
                                          onClick={() => onOpenAuth('register')}
                                        >
                                          <Sparkles className="w-3 h-3 mr-1 inline" />
                                          Be the First Donor from {upzName}
                                        </button>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="village-items-list">
                                      <span className="village-list-label">
                                        Villages / Mahallas / Wards in {upzName}:
                                      </span>
                                      {villagesList.map((vil) => (
                                        <div key={vil.name} className="village-item-row">
                                          <div className="village-name-group">
                                            <span className="village-bullet"></span>
                                            <span className="village-name">{vil.name}</span>
                                          </div>
                                          <div className="village-badges">
                                            <span className="badge-donors">
                                              {vil.registeredDonors} Donor{vil.registeredDonors === 1 ? '' : 's'}
                                            </span>
                                            <span className="badge-logins">
                                              {vil.totalLogins} Login{vil.totalLogins === 1 ? '' : 's'}
                                            </span>
                                            {Object.entries(vil.bloodGroups).map(([bg, cnt]) => (
                                              <span key={bg} className="badge-bg-mini">
                                                {bg}: {cnt}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Call to Action for Underrepresented Districts */}
        <div className="tracker-footer-cta interactive-card">
          <div className="cta-content">
            <Globe className="w-7 h-7 text-red-500 mb-2" />
            <h4 className="cta-title">Help Us Cover Every Village in Bangladesh</h4>
            <p className="cta-description">
              LifePulse is dedicated to establishing immediate 30-minute blood availability in every upazila and village across all 64 districts.
              Register as an emergency voluntary donor to light up your village on the nationwide map.
            </p>
          </div>
          <div className="cta-action">
            {onOpenAuth && (
              <button
                className="btn btn-primary btn-md shadow-glow"
                onClick={() => onOpenAuth('register')}
              >
                <Droplet className="w-4 h-4 mr-1.5" />
                Register as Blood Donor
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
