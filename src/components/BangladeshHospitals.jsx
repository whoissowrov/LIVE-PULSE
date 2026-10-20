import React, { useState, useMemo } from 'react';
import {
  Hospital,
  MapPin,
  Phone,
  Navigation,
  ExternalLink,
  Search,
  Filter,
  ShieldCheck,
  Droplet,
  Clock,
  Compass,
  ArrowUpRight,
  Crosshair,
  Sparkles,
  Building2,
  AlertCircle,
  X,
  Layers,
  LayoutGrid,
  ChevronDown,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import {
  BANGLADESH_HOSPITALS,
  getHospitalGoogleMapsUrl
} from '../data/bangladeshHospitalsData';
import { BANGLADESH_DIVISIONS, BANGLADESH_DISTRICTS, getUpazilasByDistrict } from '../data/bangladeshGeoData';

export default function BangladeshHospitals({ onLocateOnMap }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [selectedUpazila, setSelectedUpazila] = useState('ALL');
  const [selectedSector, setSelectedSector] = useState('ALL'); // 'ALL' | 'GOVT' | 'NON_GOVT' | 'SADAR' | 'SPECIALIZED'
  const [only247Blood, setOnly247Blood] = useState(false);
  const [onlyTrauma, setOnlyTrauma] = useState(false);
  const [viewMode, setViewMode] = useState('district'); // 'district' | 'grid'
  const [visibleCount, setVisibleCount] = useState(24);

  // Available districts for current division filter
  const availableDistricts = useMemo(() => {
    if (selectedDivision === 'ALL') {
      return BANGLADESH_DISTRICTS;
    }
    return BANGLADESH_DISTRICTS.filter(
      (d) => d.division.toLowerCase() === selectedDivision.toLowerCase()
    );
  }, [selectedDivision]);

  // Available upazilas for currently selected district
  const availableHospitalUpazilas = useMemo(() => {
    if (selectedDistrict === 'ALL') return [];
    const fromHospitals = Array.from(
      new Set(
        BANGLADESH_HOSPITALS.filter(
          (h) => h.district.toLowerCase() === selectedDistrict.toLowerCase()
        )
          .map((h) => h.upazila)
          .filter(Boolean)
      )
    );
    const fromGeo = getUpazilasByDistrict(selectedDistrict) || [];
    return Array.from(new Set([...fromHospitals, ...fromGeo])).sort();
  }, [selectedDistrict]);

  // Filtered hospitals
  const filteredHospitals = useMemo(() => {
    let list = BANGLADESH_HOSPITALS;

    // Division filter
    if (selectedDivision !== 'ALL') {
      list = list.filter(
        (h) => h.division.toLowerCase() === selectedDivision.toLowerCase()
      );
    }

    // District filter
    if (selectedDistrict !== 'ALL') {
      list = list.filter(
        (h) => h.district.toLowerCase() === selectedDistrict.toLowerCase()
      );
    }

    // Upazila filter
    if (selectedUpazila !== 'ALL') {
      list = list.filter(
        (h) => h.upazila && h.upazila.toLowerCase() === selectedUpazila.toLowerCase()
      );
    }

    // Sector Filter: Government vs Non-Government vs Sadar General vs Specialized
    if (selectedSector === 'GOVT') {
      list = list.filter((h) =>
        h.type.toLowerCase().includes('government medical college')
      );
    } else if (selectedSector === 'NON_GOVT') {
      list = list.filter(
        (h) =>
          h.type.toLowerCase().includes('non-government') ||
          h.type.toLowerCase().includes('private')
      );
    } else if (selectedSector === 'SADAR') {
      list = list.filter((h) =>
        h.type.toLowerCase().includes('general hospital') ||
        h.type.toLowerCase().includes('district')
      );
    } else if (selectedSector === 'SPECIALIZED') {
      list = list.filter((h) =>
        h.type.toLowerCase().includes('specialized') ||
        h.type.toLowerCase().includes('institute') ||
        h.type.toLowerCase().includes('military') ||
        h.type.toLowerCase().includes('certified blood')
      );
    }

    // 24/7 Blood Bank filter
    if (only247Blood) {
      list = list.filter(
        (h) =>
          h.bloodBankAvailable &&
          (h.operatingHours?.toLowerCase().includes('24/7') ||
            h.facilities?.some((f) => f.toLowerCase().includes('24/7 blood') || f.toLowerCase().includes('blood')))
      );
    }

    // Trauma unit filter
    if (onlyTrauma) {
      list = list.filter(
        (h) =>
          h.hasEmergencyUnit ||
          h.facilities?.some(
            (f) =>
              f.toLowerCase().includes('trauma') ||
              f.toLowerCase().includes('emergency') ||
              f.toLowerCase().includes('icu')
          )
      );
    }

    // Text search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          (h.bnName && h.bnName.includes(q)) ||
          h.district.toLowerCase().includes(q) ||
          h.upazila.toLowerCase().includes(q) ||
          h.address.toLowerCase().includes(q) ||
          h.type.toLowerCase().includes(q) ||
          h.facilities?.some((f) => f.toLowerCase().includes(q))
      );
    }

    return list;
  }, [searchQuery, selectedDivision, selectedDistrict, selectedSector, only247Blood, onlyTrauma]);

  // Overall directory statistics
  const stats = useMemo(() => {
    const total = BANGLADESH_HOSPITALS.length;
    const bloodCenters = BANGLADESH_HOSPITALS.filter(
      (h) => h.bloodBankAvailable
    ).length;
    const govtColleges = BANGLADESH_HOSPITALS.filter((h) =>
      h.type.toLowerCase().includes('government medical college')
    ).length;
    const pvtColleges = BANGLADESH_HOSPITALS.filter((h) =>
      h.type.toLowerCase().includes('non-government') ||
      h.type.toLowerCase().includes('private')
    ).length;
    const coveredDistricts = new Set(BANGLADESH_HOSPITALS.map((h) => h.district.toLowerCase())).size;
    return { total, bloodCenters, govtColleges, pvtColleges, coveredDistricts };
  }, []);

  // District-wise grouping of filtered hospitals
  const districtWiseGroups = useMemo(() => {
    const groups = {};
    filteredHospitals.forEach((h) => {
      const distKey = h.district;
      if (!groups[distKey]) {
        const geoDist = BANGLADESH_DISTRICTS.find(
          (d) => d.name.toLowerCase() === distKey.toLowerCase()
        );
        groups[distKey] = {
          district: distKey,
          bnName: geoDist?.bnName || '',
          division: h.division,
          lat: geoDist?.lat || h.lat,
          lng: geoDist?.lng || h.lng,
          hospitals: []
        };
      }
      groups[distKey].hospitals.push(h);
    });

    return Object.values(groups).sort((a, b) => a.district.localeCompare(b.district));
  }, [filteredHospitals]);

  const handleDivisionChange = (divName) => {
    setSelectedDivision(divName);
    setSelectedDistrict('ALL');
    setSelectedUpazila('ALL');
    setVisibleCount(24);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedDivision('ALL');
    setSelectedDistrict('ALL');
    setSelectedUpazila('ALL');
    setSelectedSector('ALL');
    setOnly247Blood(false);
    setOnlyTrauma(false);
    setVisibleCount(24);
  };

  const handleFocusOnMap = (hospital) => {
    window.dispatchEvent(
      new CustomEvent('lifepulse:focus-hospital', { detail: hospital })
    );

    if (onLocateOnMap) {
      onLocateOnMap(hospital);
    }

    const mapElement = document.getElementById('mapSection');
    if (mapElement) {
      mapElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedDivision !== 'ALL' ||
    selectedDistrict !== 'ALL' ||
    selectedUpazila !== 'ALL' ||
    selectedSector !== 'ALL' ||
    only247Blood ||
    onlyTrauma;

  // Helper for sector pill styling
  const getSectorBadge = (type) => {
    const t = type.toLowerCase();
    if (t.includes('government medical college')) {
      return { label: 'Govt Medical College', className: 'sector-badge-govt', icon: ShieldCheck };
    }
    if (t.includes('non-government') || t.includes('private')) {
      return { label: 'Non-Govt / Private Medical', className: 'sector-badge-pvt', icon: Building2 };
    }
    if (t.includes('district') || t.includes('general hospital')) {
      return { label: 'District Sadar Hospital', className: 'sector-badge-sadar', icon: Hospital };
    }
    return { label: 'Specialized Institute', className: 'sector-badge-special', icon: Sparkles };
  };

  return (
    <section className="section bg-pattern" id="hospitalsSection">
      <div className="container">
        {/* Section Header */}
        <div className="section-header text-center">
          <div className="pill-badge mb-3">
            <span className="pulse-dot" />
            <span>NATIONWIDE DISTRICT-WISE MEDICAL &amp; BLOOD TRANSFUSION DIRECTORY</span>
          </div>
          <h2 className="section-title">
            All Government &amp; Non-Government Hospitals of <span className="gradient-text">Bangladesh</span>
          </h2>
          <p className="section-subtitle">
            Comprehensive district-wise directory of 37 Government Medical Colleges, 32+ Non-Government / Private Medical College Hospitals, and 250-bed District Sadar General Hospitals across all 64 Zillas. Call emergency hotlines or get direct Google Maps navigation.
          </p>
        </div>

        {/* Directory Stat Counters */}
        <div className="bd-hospitals-stat-grid">
          <div className="bd-hosp-stat-card">
            <div className="bd-hosp-stat-icon text-sky-400">
              <Hospital className="w-6 h-6" />
            </div>
            <div>
              <div className="bd-hosp-stat-val">{stats.total}+</div>
              <div className="bd-hosp-stat-label">Hospitals &amp; Medical Centers</div>
            </div>
          </div>

          <div className="bd-hosp-stat-card">
            <div className="bd-hosp-stat-icon text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="bd-hosp-stat-val">{stats.govtColleges}</div>
              <div className="bd-hosp-stat-label">Govt Medical Colleges</div>
            </div>
          </div>

          <div className="bd-hosp-stat-card">
            <div className="bd-hosp-stat-icon text-amber-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="bd-hosp-stat-val">{stats.pvtColleges}+</div>
              <div className="bd-hosp-stat-label">Non-Govt / Private Colleges</div>
            </div>
          </div>

          <div className="bd-hosp-stat-card">
            <div className="bd-hosp-stat-icon text-rose-500">
              <Droplet className="w-6 h-6" />
            </div>
            <div>
              <div className="bd-hosp-stat-val">{stats.coveredDistricts} of 64</div>
              <div className="bd-hosp-stat-label">Districts Fully Covered</div>
            </div>
          </div>
        </div>

        {/* Search & Filter Hub */}
        <div className="bd-hospitals-control-hub interactive-card">
          {/* Top Search Bar */}
          <div className="bd-hospitals-search-row">
            <div className="input-with-icon flex-1">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                className="form-control"
                placeholder="Search by hospital name, Bengali name (যেমন: ঢাকা মেডিকেল, বারডেম), district, or facility..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setVisibleCount(24);
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* District Dropdown */}
            <div className="bd-hospitals-district-select">
              <select
                className="form-control"
                value={selectedDistrict}
                onChange={(e) => {
                  setSelectedDistrict(e.target.value);
                  setSelectedUpazila('ALL');
                  setVisibleCount(24);
                }}
              >
                <option value="ALL">
                  {selectedDivision === 'ALL'
                    ? 'All 64 Districts (সব জেলা)'
                    : `All Districts in ${selectedDivision}`}
                </option>
                {availableDistricts.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name} ({d.bnName})
                  </option>
                ))}
              </select>
            </div>

            {/* Upazila Dropdown */}
            <div className="bd-hospitals-district-select">
              <select
                className="form-control"
                value={selectedUpazila}
                onChange={(e) => {
                  setSelectedUpazila(e.target.value);
                  setVisibleCount(24);
                }}
                disabled={selectedDistrict === 'ALL'}
                style={{
                  opacity: selectedDistrict === 'ALL' ? 0.65 : 1,
                  cursor: selectedDistrict === 'ALL' ? 'not-allowed' : 'pointer'
                }}
              >
                <option value="ALL">
                  {selectedDistrict === 'ALL'
                    ? 'All Upazilas (উপজেলা)'
                    : `All Upazilas in ${selectedDistrict} (সকল উপজেলা)`}
                </option>
                {availableHospitalUpazilas.map((upz) => (
                  <option key={upz} value={upz}>
                    {upz}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sector Selector Tabs: Government vs Non-Government vs District Sadar */}
          <div className="bd-sector-filter-tabs">
            <button
              type="button"
              className={`sector-tab ${selectedSector === 'ALL' ? 'active' : ''}`}
              onClick={() => setSelectedSector('ALL')}
            >
              <Layers className="w-4 h-4" />
              <span>All Facilities ({BANGLADESH_HOSPITALS.length})</span>
            </button>
            <button
              type="button"
              className={`sector-tab govt ${selectedSector === 'GOVT' ? 'active' : ''}`}
              onClick={() => setSelectedSector('GOVT')}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Govt Medical Colleges ({stats.govtColleges})</span>
            </button>
            <button
              type="button"
              className={`sector-tab pvt ${selectedSector === 'NON_GOVT' ? 'active' : ''}`}
              onClick={() => setSelectedSector('NON_GOVT')}
            >
              <Building2 className="w-4 h-4 text-sky-400" />
              <span>Non-Govt / Private ({stats.pvtColleges})</span>
            </button>
            <button
              type="button"
              className={`sector-tab sadar ${selectedSector === 'SADAR' ? 'active' : ''}`}
              onClick={() => setSelectedSector('SADAR')}
            >
              <Hospital className="w-4 h-4 text-purple-400" />
              <span>District Sadar Hospitals</span>
            </button>
            <button
              type="button"
              className={`sector-tab special ${selectedSector === 'SPECIALIZED' ? 'active' : ''}`}
              onClick={() => setSelectedSector('SPECIALIZED')}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Specialized Institutes</span>
            </button>
          </div>

          {/* Division Filter Pills */}
          <div className="bd-hospitals-division-pills">
            <button
              type="button"
              className={`division-pill ${selectedDivision === 'ALL' ? 'active' : ''}`}
              onClick={() => handleDivisionChange('ALL')}
            >
              All Bangladesh ({BANGLADESH_HOSPITALS.length})
            </button>
            {BANGLADESH_DIVISIONS.map((div) => {
              const count = BANGLADESH_HOSPITALS.filter(
                (h) => h.division.toLowerCase() === div.name.toLowerCase()
              ).length;
              return (
                <button
                  key={div.id}
                  type="button"
                  className={`division-pill ${
                    selectedDivision.toLowerCase() === div.name.toLowerCase() ? 'active' : ''
                  }`}
                  onClick={() => handleDivisionChange(div.name)}
                >
                  {div.name} <span className="pill-count">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Filter Toggles & Actions */}
          <div className="bd-hospitals-toggles-row">
            <div className="toggle-chips-group">
              <button
                type="button"
                className={`toggle-chip ${only247Blood ? 'active' : ''}`}
                onClick={() => setOnly247Blood(!only247Blood)}
              >
                <Droplet className="w-4 h-4 text-rose-500" />
                <span>24/7 Blood Transfusion</span>
              </button>

              <button
                type="button"
                className={`toggle-chip ${onlyTrauma ? 'active' : ''}`}
                onClick={() => setOnlyTrauma(!onlyTrauma)}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Trauma &amp; Emergency Units</span>
              </button>
            </div>

            {/* View Mode Switcher: District-Wise vs Card Grid */}
            <div className="view-mode-toggle-group">
              <button
                type="button"
                className={`view-mode-btn ${viewMode === 'district' ? 'active' : ''}`}
                onClick={() => setViewMode('district')}
                title="View Organized District-by-District"
              >
                <MapPin className="w-4 h-4 mr-1 text-emerald-400" />
                <span>District-Wise View</span>
              </button>

              <button
                type="button"
                className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="View All Centers in Standard Grid"
              >
                <LayoutGrid className="w-4 h-4 mr-1 text-sky-400" />
                <span>All Grid View</span>
              </button>
            </div>

            <div className="filter-summary-actions">
              <span className="results-badge">
                {viewMode === 'district'
                  ? `${districtWiseGroups.length} Districts • ${filteredHospitals.length} Centers`
                  : `Showing ${Math.min(visibleCount, filteredHospitals.length)} of ${filteredHospitals.length} Centers`}
              </span>

              {hasActiveFilters && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={handleClearFilters}
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick District Jump Bar (When in District View) */}
        {viewMode === 'district' && districtWiseGroups.length > 1 && (
          <div className="district-quick-jump-strip">
            <span className="jump-label">Quick Jump to District:</span>
            <div className="jump-chips-wrap">
              {districtWiseGroups.map((group) => (
                <a
                  key={group.district}
                  href={`#district-${group.district.toLowerCase()}`}
                  className="jump-chip"
                >
                  {group.district} ({group.hospitals.length})
                </a>
              ))}
            </div>
          </div>
        )}

        {/* ==============================================================
            VIEW 1: DISTRICT-WISE GROUPED VIEW
            ============================================================== */}
        {viewMode === 'district' ? (
          filteredHospitals.length === 0 ? (
            <div className="bd-hospitals-empty interactive-card">
              <div className="empty-icon-wrap">
                <Hospital className="w-12 h-12 text-slate-500" />
              </div>
              <h3>No Hospitals Found Matching Your Filter</h3>
              <p>
                We couldn't find any medical facilities matching "{searchQuery}". Try clearing filters or selecting another division.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleClearFilters}
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="district-groups-container">
              {districtWiseGroups.map((group) => (
                <div
                  key={group.district}
                  id={`district-${group.district.toLowerCase()}`}
                  className="district-group-block"
                >
                  {/* District Header Banner */}
                  <div className="district-group-header">
                    <div className="district-group-title-col">
                      <div className="district-pin-icon">
                        <MapPin className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="district-group-heading">
                          {group.district} District {group.bnName && <span className="district-bn-tag">({group.bnName})</span>}
                        </h3>
                        <p className="district-group-sub">
                          {group.division} Division • {group.hospitals.length} Registered Medical Centers
                        </p>
                      </div>
                    </div>

                    <div className="district-group-counters">
                      <span className="counter-pill govt">
                        <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                        {group.hospitals.filter((h) => h.type.toLowerCase().includes('government')).length} Govt
                      </span>
                      <span className="counter-pill pvt">
                        <Building2 className="w-3.5 h-3.5 mr-1" />
                        {group.hospitals.filter((h) => h.type.toLowerCase().includes('non-government') || h.type.toLowerCase().includes('private')).length} Private / Non-Govt
                      </span>
                      <span className="counter-pill upz">
                        <Navigation className="w-3.5 h-3.5 mr-1 text-purple-300" />
                        {new Set(group.hospitals.map((h) => h.upazila).filter(Boolean)).size || 1} Upazilas
                      </span>
                      <span className="counter-pill blood">
                        <Droplet className="w-3.5 h-3.5 mr-1 text-rose-400" />
                        {group.hospitals.filter((h) => h.bloodBankAvailable).length} Blood Banks
                      </span>
                    </div>
                  </div>

                  {/* Hospitals Grid for this District */}
                  <div className="bd-hospitals-grid">
                    {group.hospitals.map((h) => {
                      const badge = getSectorBadge(h.type);
                      const BadgeIcon = badge.icon;
                      return (
                        <div key={h.id} className="bd-hospital-card interactive-card">
                          {/* Card Header */}
                          <div className="bd-hosp-card-head">
                            <div className="bd-hosp-icon-badge">
                              <BadgeIcon className="w-5 h-5" />
                            </div>
                            <div className="bd-hosp-type-wrap">
                              <span className={`bd-hosp-type-pill ${badge.className}`}>
                                {h.type}
                              </span>
                              {h.bloodBankAvailable && (
                                <span className="bd-hosp-transfusion-badge">
                                  <span className="pulse-dot-green" />
                                  24/7 Blood Bank
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Hospital Names */}
                          <h4 className="bd-hosp-name">{h.name}</h4>
                          {h.bnName && <p className="bd-hosp-bn-name">{h.bnName}</p>}

                          {/* Location Badges */}
                          <div className="bd-hosp-meta-row">
                            <span className="meta-badge location">
                              <MapPin className="w-3.5 h-3.5" />
                              {h.upazila ? `${h.upazila}, ` : ''}{h.district}
                            </span>
                            <span className="meta-badge hours">
                              <Clock className="w-3.5 h-3.5" />
                              {h.operatingHours || '24/7 Emergency Care'}
                            </span>
                          </div>

                          {/* Detailed Address */}
                          <p className="bd-hosp-address">
                            <strong>Address:</strong> {h.address}
                          </p>

                          {/* Key Facilities Chips */}
                          {h.facilities && h.facilities.length > 0 && (
                            <div className="bd-hosp-facilities">
                              {h.facilities.slice(0, 4).map((facility, idx) => (
                                <span key={idx} className="facility-chip">
                                  {facility}
                                </span>
                              ))}
                              {h.facilities.length > 4 && (
                                <span className="facility-chip more">
                                  +{h.facilities.length - 4} more
                                </span>
                              )}
                            </div>
                          )}

                          {/* Action Buttons Row */}
                          <div className="bd-hosp-actions">
                            <a
                              href={`tel:${h.emergencyHotline || h.phone}`}
                              className="btn btn-sm btn-danger bd-action-btn"
                              title={`Call Emergency Hotline ${h.emergencyHotline || h.phone}`}
                            >
                              <Phone className="w-4 h-4" />
                              <span>Hotline</span>
                            </a>

                            <a
                              href={getHospitalGoogleMapsUrl(h)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-secondary bd-action-btn"
                              title="Open Turn-by-Turn Driving Directions in Google Maps"
                            >
                              <Navigation className="w-4 h-4 text-emerald-400" />
                              <span>Directions</span>
                            </a>

                            <button
                              type="button"
                              className="btn btn-sm btn-outline-info bd-action-btn"
                              onClick={() => handleFocusOnMap(h)}
                              title="View and focus on the Live Interactive Map"
                            >
                              <Compass className="w-4 h-4 text-sky-400" />
                              <span>Live Map</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* ==============================================================
             VIEW 2: STANDARD ALL CENTERS GRID VIEW
             ============================================================== */
          filteredHospitals.length === 0 ? (
            <div className="bd-hospitals-empty interactive-card">
              <div className="empty-icon-wrap">
                <Hospital className="w-12 h-12 text-slate-500" />
              </div>
              <h3>No Hospitals Found Matching Your Filter</h3>
              <p>
                We couldn't find any medical facilities matching "{searchQuery}". Try clearing filters or selecting another division.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleClearFilters}
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="bd-hospitals-grid">
                {filteredHospitals.slice(0, visibleCount).map((h) => {
                  const badge = getSectorBadge(h.type);
                  const BadgeIcon = badge.icon;
                  return (
                    <div key={h.id} className="bd-hospital-card interactive-card">
                      {/* Card Header */}
                      <div className="bd-hosp-card-head">
                        <div className="bd-hosp-icon-badge">
                          <BadgeIcon className="w-5 h-5" />
                        </div>
                        <div className="bd-hosp-type-wrap">
                          <span className={`bd-hosp-type-pill ${badge.className}`}>
                            {h.type}
                          </span>
                          {h.bloodBankAvailable && (
                            <span className="bd-hosp-transfusion-badge">
                              <span className="pulse-dot-green" />
                              24/7 Blood Bank
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Hospital Names */}
                      <h4 className="bd-hosp-name">{h.name}</h4>
                      {h.bnName && <p className="bd-hosp-bn-name">{h.bnName}</p>}

                      {/* Location Badges */}
                      <div className="bd-hosp-meta-row">
                        <span className="meta-badge location">
                          <MapPin className="w-3.5 h-3.5" />
                          {h.upazila ? `${h.upazila}, ` : ''}{h.district} ({h.division})
                        </span>
                        <span className="meta-badge hours">
                          <Clock className="w-3.5 h-3.5" />
                          {h.operatingHours || '24/7 Emergency Care'}
                        </span>
                      </div>

                      {/* Detailed Address */}
                      <p className="bd-hosp-address">
                        <strong>Address:</strong> {h.address}
                      </p>

                      {/* Key Facilities Chips */}
                      {h.facilities && h.facilities.length > 0 && (
                        <div className="bd-hosp-facilities">
                          {h.facilities.slice(0, 4).map((facility, idx) => (
                            <span key={idx} className="facility-chip">
                              {facility}
                            </span>
                          ))}
                          {h.facilities.length > 4 && (
                            <span className="facility-chip more">
                              +{h.facilities.length - 4} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Action Buttons Row */}
                      <div className="bd-hosp-actions">
                        <a
                          href={`tel:${h.emergencyHotline || h.phone}`}
                          className="btn btn-sm btn-danger bd-action-btn"
                          title={`Call Emergency Hotline ${h.emergencyHotline || h.phone}`}
                        >
                          <Phone className="w-4 h-4" />
                          <span>Hotline</span>
                        </a>

                        <a
                          href={getHospitalGoogleMapsUrl(h)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-secondary bd-action-btn"
                          title="Open Turn-by-Turn Driving Directions in Google Maps"
                        >
                          <Navigation className="w-4 h-4 text-emerald-400" />
                          <span>Directions</span>
                        </a>

                        <button
                          type="button"
                          className="btn btn-sm btn-outline-info bd-action-btn"
                          onClick={() => handleFocusOnMap(h)}
                          title="View and focus on the Live Interactive Map"
                        >
                          <Compass className="w-4 h-4 text-sky-400" />
                          <span>Live Map</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Load More Button in Grid View */}
              {filteredHospitals.length > visibleCount && (
                <div className="text-center mt-4">
                  <button
                    type="button"
                    className="btn btn-secondary btn-lg"
                    onClick={() => setVisibleCount((prev) => prev + 24)}
                  >
                    Load More Hospitals ({filteredHospitals.length - visibleCount} Remaining)
                  </button>
                </div>
              )}
            </>
          )
        )}
      </div>
    </section>
  );
}
