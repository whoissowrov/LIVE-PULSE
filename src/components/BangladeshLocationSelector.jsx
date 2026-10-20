import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Sparkles, ChevronDown, Check, Building2, Home } from 'lucide-react';
import {
  BANGLADESH_DIVISIONS,
  BANGLADESH_DISTRICTS,
  getDistrictsByDivision,
  getDistrictByName,
  getUpazilasByDistrict,
  getUnionSuggestions,
  getVillageSuggestions
} from '../data/bangladeshGeoData';

export default function BangladeshLocationSelector({
  division = 'Dhaka',
  district = 'Dhaka',
  upazila = '',
  union = '',
  village = '',
  onChange,
  required = false,
  compact = false,
  showVillage = true,
  showUnion = true,
  helperText = 'Select your exact location in Bangladesh to match with nearest emergency patients and blood banks.'
}) {
  const [selectedDivision, setSelectedDivision] = useState(division || 'Dhaka');
  const [selectedDistrict, setSelectedDistrict] = useState(district || 'Dhaka');
  const [selectedUpazila, setSelectedUpazila] = useState(upazila || '');
  const [selectedUnion, setSelectedUnion] = useState(union || '');
  const [selectedVillage, setSelectedVillage] = useState(village || '');
  const [isCustomUnion, setIsCustomUnion] = useState(false);

  // Synchronize internal state if props change from outside
  useEffect(() => {
    if (division) setSelectedDivision(division);
  }, [division]);

  useEffect(() => {
    if (district) setSelectedDistrict(district);
  }, [district]);

  useEffect(() => {
    if (upazila !== undefined) setSelectedUpazila(upazila);
  }, [upazila]);

  useEffect(() => {
    if (union !== undefined) setSelectedUnion(union);
  }, [union]);

  useEffect(() => {
    if (village !== undefined) setSelectedVillage(village);
  }, [village]);

  // Available districts for the selected division
  const availableDistricts = selectedDivision
    ? getDistrictsByDivision(selectedDivision)
    : BANGLADESH_DISTRICTS;

  // Available upazilas for the selected district
  const availableUpazilas = selectedDistrict
    ? getUpazilasByDistrict(selectedDistrict)
    : [];

  // Union suggestions
  const unionPresets = selectedDistrict && selectedUpazila
    ? getUnionSuggestions(selectedDistrict, selectedUpazila)
    : [];

  // Village suggestions
  const villageSuggestions = getVillageSuggestions(selectedUpazila, selectedUnion);

  // Emit updates whenever any field changes
  const triggerChange = (newValues) => {
    const nextState = {
      division: newValues.division !== undefined ? newValues.division : selectedDivision,
      district: newValues.district !== undefined ? newValues.district : selectedDistrict,
      upazila: newValues.upazila !== undefined ? newValues.upazila : selectedUpazila,
      union: newValues.union !== undefined ? newValues.union : selectedUnion,
      village: newValues.village !== undefined ? newValues.village : selectedVillage
    };

    // Find GPS coordinates of the district
    const distObj = getDistrictByName(nextState.district);
    if (distObj) {
      nextState.lat = distObj.lat;
      nextState.lng = distObj.lng;
    }

    // Consolidated city and area strings for backwards compatibility
    nextState.city = nextState.district;
    const areaParts = [];
    if (nextState.village) areaParts.push(nextState.village);
    if (nextState.union) areaParts.push(nextState.union);
    if (nextState.upazila) areaParts.push(nextState.upazila);
    nextState.area = areaParts.join(', ') || nextState.upazila || nextState.district;

    if (onChange) {
      onChange(nextState);
    }
  };

  const handleDivisionChange = (divName) => {
    setSelectedDivision(divName);
    const districtsInDiv = getDistrictsByDivision(divName);
    const firstDist = districtsInDiv[0]?.name || 'Dhaka';
    setSelectedDistrict(firstDist);

    const upazilasInDist = getUpazilasByDistrict(firstDist);
    const firstUpazila = upazilasInDist[0] || '';
    setSelectedUpazila(firstUpazila);

    triggerChange({
      division: divName,
      district: firstDist,
      upazila: firstUpazila,
      union: '',
      village: ''
    });
  };

  const handleDistrictChange = (distName) => {
    setSelectedDistrict(distName);
    const distObj = getDistrictByName(distName);
    const divName = distObj?.division || selectedDivision;
    if (divName !== selectedDivision) {
      setSelectedDivision(divName);
    }

    const upazilasInDist = getUpazilasByDistrict(distName);
    const firstUpazila = upazilasInDist[0] || '';
    setSelectedUpazila(firstUpazila);

    triggerChange({
      division: divName,
      district: distName,
      upazila: firstUpazila,
      union: '',
      village: ''
    });
  };

  const handleUpazilaChange = (upzName) => {
    setSelectedUpazila(upzName);
    triggerChange({ upazila: upzName });
  };

  const handleUnionChange = (uName) => {
    if (uName === '__CUSTOM__') {
      setIsCustomUnion(true);
      setSelectedUnion('');
    } else {
      setIsCustomUnion(false);
      setSelectedUnion(uName);
      triggerChange({ union: uName });
    }
  };

  const handleVillageChange = (vName) => {
    setSelectedVillage(vName);
    triggerChange({ village: vName });
  };

  return (
    <div className="bangladesh-location-picker" style={{ margin: '8px 0' }}>
      {/* Title & Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <MapPin className="w-4 h-4 text-red-500" />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
            Bangladesh Location (বাংলাদেশ লোকেশন)
          </span>
          {required && <span className="req">*</span>}
        </div>
        <span
          style={{
            fontSize: '0.7rem',
            padding: '2px 8px',
            borderRadius: '999px',
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#34d399',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            fontWeight: 700
          }}
        >
          64 Zillas & 495+ Upazilas
        </span>
      </div>

      {helperText && !compact && (
        <p style={{ margin: '0 0 10px 0', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
          {helperText}
        </p>
      )}

      {/* Row 1: Division & Zilla (District) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: compact ? '1fr 1fr' : '1fr 1.3fr',
          gap: '10px',
          marginBottom: '10px'
        }}
      >
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '4px', color: '#cbd5e1' }}>
            Division (বিভাগ)
          </label>
          <select
            className="form-select"
            style={{ fontSize: '0.85rem', padding: '8px 10px' }}
            value={selectedDivision}
            onChange={(e) => handleDivisionChange(e.target.value)}
          >
            {BANGLADESH_DIVISIONS.map((div) => (
              <option key={div.id} value={div.name}>
                {div.name} ({div.bnName})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '4px', color: '#cbd5e1' }}>
            Zilla / District (জেলা) {required && <span className="req">*</span>}
          </label>
          <select
            className="form-select"
            style={{ fontSize: '0.85rem', padding: '8px 10px' }}
            value={selectedDistrict}
            onChange={(e) => handleDistrictChange(e.target.value)}
            required={required}
          >
            {availableDistricts.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name} ({d.bnName})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 2: Upazila / Upo-zella & Union / Ward */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: showUnion ? '1.2fr 1fr' : '1fr',
          gap: '10px',
          marginBottom: '10px'
        }}
      >
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '4px', color: '#cbd5e1' }}>
            Upazila / Thana (উপজেলা / থানা) {required && <span className="req">*</span>}
          </label>
          <select
            className="form-select"
            style={{ fontSize: '0.85rem', padding: '8px 10px' }}
            value={selectedUpazila}
            onChange={(e) => handleUpazilaChange(e.target.value)}
            required={required}
          >
            <option value="">Select Upazila...</option>
            {availableUpazilas.map((upz) => (
              <option key={upz} value={upz}>
                {upz}
              </option>
            ))}
          </select>
        </div>

        {showUnion && (
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '4px', color: '#cbd5e1' }}>
              Union / Ward (ইউনিয়ন / ওয়ার্ড)
            </label>
            {isCustomUnion ? (
              <div style={{ display: 'flex', gap: '4px' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ fontSize: '0.85rem', padding: '8px 10px' }}
                  placeholder="Enter Union / Ward"
                  value={selectedUnion}
                  onChange={(e) => {
                    setSelectedUnion(e.target.value);
                    triggerChange({ union: e.target.value });
                  }}
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '0 8px', fontSize: '0.75rem' }}
                  onClick={() => setIsCustomUnion(false)}
                  title="Choose from presets"
                >
                  List
                </button>
              </div>
            ) : (
              <select
                className="form-select"
                style={{ fontSize: '0.85rem', padding: '8px 10px' }}
                value={selectedUnion}
                onChange={(e) => handleUnionChange(e.target.value)}
              >
                <option value="">Select Union / Ward (Optional)...</option>
                {unionPresets.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
                <option value="__CUSTOM__">✏️ Type Custom Union / Ward...</option>
              </select>
            )}
          </div>
        )}
      </div>

      {/* Row 3: Village / Mahalla / Area */}
      {showVillage && (
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '4px', color: '#cbd5e1' }}>
            Village / Mahalla / Para (গ্রাম / মহল্লা / পাড়া)
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              list={`village-suggestions-${selectedDistrict}-${selectedUpazila}`}
              className="form-input"
              style={{ fontSize: '0.85rem', padding: '8px 10px' }}
              placeholder="e.g. Purba Para, Mirpur-10, Bazar Area, College Road"
              value={selectedVillage}
              onChange={(e) => handleVillageChange(e.target.value)}
            />
            <datalist id={`village-suggestions-${selectedDistrict}-${selectedUpazila}`}>
              {villageSuggestions.map((v, i) => (
                <option key={i} value={v} />
              ))}
            </datalist>
          </div>
        </div>
      )}

      {/* Live Formatted Summary Pill */}
      {(selectedDistrict || selectedUpazila) && (
        <div
          style={{
            marginTop: '8px',
            padding: '7px 12px',
            borderRadius: '10px',
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.78rem',
            color: '#fca5a5'
          }}
        >
          <Home className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <strong>Selected:</strong> {selectedVillage ? `${selectedVillage}, ` : ''}
            {selectedUnion ? `${selectedUnion}, ` : ''}
            {selectedUpazila ? `${selectedUpazila}, ` : ''}
            <strong>{selectedDistrict}</strong> ({selectedDivision})
          </span>
        </div>
      )}
    </div>
  );
}
