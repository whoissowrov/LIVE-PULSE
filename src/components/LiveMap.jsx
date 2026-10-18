import React, { useEffect, useRef, useState } from 'react';
import { Compass, MapPin, Layers, Crosshair, Search, Phone, MessageSquare, AlertTriangle, RefreshCw, ZoomIn } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function LiveMap({ donors = [], requests = [], currentUser }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const tileLayerRef = useRef(null);

  const [mapTheme, setMapTheme] = useState('dark'); // 'dark' | 'streets' | 'satellite'
  const [selectedBlood, setSelectedBlood] = useState('');
  const [selectedType, setSelectedType] = useState('all'); // 'all' | 'donors' | 'sos'
  const [sidebarQuery, setSidebarQuery] = useState('');
  const [locating, setLocating] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapContainerRef.current._leaflet_id) {
      mapContainerRef.current._leaflet_id = null;
    }
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch (e) {}
      mapInstanceRef.current = null;
    }

    // Default to Dhaka if currentUser is in Dhaka or undefined, or New York if US
    const centerLat = currentUser?.lat || 23.7806;
    const centerLng = currentUser?.lng || 90.3952;

    try {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
        attributionControl: true
      }).setView([centerLat, centerLng], 12);

      // Create primary tile layer
      const getTileUrl = (theme) => {
        if (theme === 'streets') return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        if (theme === 'satellite') return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
        return 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png';
      };

      const tileLayer = L.tileLayer(getTileUrl(mapTheme), {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO / Esri',
        subdomains: mapTheme === 'satellite' ? [] : 'abcd',
        maxZoom: 19
      }).addTo(map);

      tileLayerRef.current = tileLayer;
      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;

      // Force recalculate sizes to avoid grey tiles
      setTimeout(() => map.invalidateSize(), 150);
      setTimeout(() => map.invalidateSize(), 500);
      setTimeout(() => map.invalidateSize(), 1200);

      const handleResize = () => map.invalidateSize();
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        try {
          map.remove();
        } catch (e) {}
        mapInstanceRef.current = null;
      };
    } catch (err) {
      console.warn('Leaflet initialization warning:', err);
    }
  }, []);

  // Update Tile Layer when mapTheme changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let url = 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png';
    let subdomains = 'abcd';
    if (mapTheme === 'streets') {
      url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    } else if (mapTheme === 'satellite') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      subdomains = '';
    }

    const newLayer = L.tileLayer(url, {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO / Esri',
      subdomains: subdomains || 'abcd',
      maxZoom: 19
    }).addTo(map);

    tileLayerRef.current = newLayer;
    map.invalidateSize();
  }, [mapTheme]);

  // Update Markers when donors, requests, or filters change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();
    const bounds = L.latLngBounds();
    let hasCoords = false;

    // 1. Add Donors
    if (selectedType === 'all' || selectedType === 'donors') {
      donors.forEach((donor) => {
        if (!donor.lat || !donor.lng) return;
        if (selectedBlood && donor.bloodGroup !== selectedBlood) return;

        const latLng = [Number(donor.lat), Number(donor.lng)];
        bounds.extend(latLng);
        hasCoords = true;

        const isAvailable = donor.status === 'available';
        const donorIcon = L.divIcon({
          className: 'custom-map-marker',
          html: `
            <div style="
              background: ${isAvailable ? 'linear-gradient(135deg, #10b981, #047857)' : 'linear-gradient(135deg, #f59e0b, #d97706)'};
              width: 34px; height: 34px; border-radius: 50%;
              display: flex; align-items: center; justify-content: center;
              color: #fff; font-weight: 800; font-size: 0.82rem;
              border: 2px solid #fff; box-shadow: 0 4px 14px ${isAvailable ? 'rgba(16,185,129,0.6)' : 'rgba(245,158,11,0.6)'};
              transition: transform 0.2s;
              cursor: pointer;
            ">
              ${donor.bloodGroup}
            </div>
          `,
          iconSize: [34, 34],
          iconAnchor: [17, 17]
        });

        const marker = L.marker(latLng, { icon: donorIcon }).addTo(layer);
        marker.bindPopup(`
          <div style="font-family:'Plus Jakarta Sans',sans-serif; min-width:210px; color:#1e293b;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <span style="font-size:0.7rem; font-weight:800; color:#059669; background:#dcfce7; padding:2px 7px; border-radius:6px; text-transform:uppercase;">
                ${isAvailable ? '🟢 Available Donor' : '🟡 Busy / Donated'}
              </span>
              <span style="font-size:0.85rem; font-weight:800; color:#ef4444;">${donor.bloodGroup}</span>
            </div>
            <h4 style="margin:0 0 4px 0; font-size:1.05rem; font-weight:700; color:#0f172a;">${donor.name}</h4>
            <p style="margin:0 0 4px 0; font-size:0.8rem; color:#475569;">📍 ${donor.city || 'City'} • ${donor.area || 'Metro Area'}</p>
            <p style="margin:0 0 10px 0; font-size:0.75rem; color:#64748b;">🩸 ${donor.donationsCount || 0} Successful Donations</p>
            <div style="display:flex; gap:6px;">
              <a href="tel:${donor.phone}" style="flex:1; background:#ef4444; color:#fff; padding:7px 0; text-align:center; border-radius:8px; font-size:0.8rem; font-weight:700; text-decoration:none;">
                Call Donor
              </a>
              <a href="https://wa.me/${(donor.phone || '').replace(/[^0-9]/g, '')}" target="_blank" style="flex:1; background:#10b981; color:#fff; padding:7px 0; text-align:center; border-radius:8px; font-size:0.8rem; font-weight:700; text-decoration:none;">
                WhatsApp
              </a>
            </div>
          </div>
        `);
      });
    }

    // 2. Add Emergency SOS Requests
    if (selectedType === 'all' || selectedType === 'sos') {
      requests.forEach((req) => {
        if (!req.lat || !req.lng) return;
        if (selectedBlood && req.bloodGroup !== selectedBlood) return;

        const latLng = [Number(req.lat), Number(req.lng)];
        bounds.extend(latLng);
        hasCoords = true;

        const sosIcon = L.divIcon({
          className: 'custom-map-marker',
          html: `
            <div style="
              background: linear-gradient(135deg, #ef4444, #991b1b);
              width: 38px; height: 38px; border-radius: 50%;
              display: flex; align-items: center; justify-content: center;
              color: #fff; font-weight: 800; font-size: 0.8rem;
              border: 2.5px solid #fff; box-shadow: 0 0 24px rgba(239,68,68,0.9);
              animation: pulse-sos 1.6s infinite;
              cursor: pointer;
            ">
              SOS
            </div>
          `,
          iconSize: [38, 38],
          iconAnchor: [19, 19]
        });

        const marker = L.marker(latLng, { icon: sosIcon }).addTo(layer);
        marker.bindPopup(`
          <div style="font-family:'Plus Jakarta Sans',sans-serif; min-width:230px; color:#1e293b;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <span style="font-size:0.7rem; font-weight:800; color:#dc2626; background:#fee2e2; padding:2px 7px; border-radius:6px; text-transform:uppercase;">
                🚨 Urgent Blood Needed
              </span>
              <span style="font-size:0.9rem; font-weight:800; color:#dc2626;">${req.bloodGroup}</span>
            </div>
            <h4 style="margin:0 0 4px 0; font-size:1.05rem; font-weight:700; color:#0f172a;">${req.patientName} (${req.units || 1} Unit${(req.units || 1) > 1 ? 's' : ''})</h4>
            <p style="margin:0 0 4px 0; font-size:0.8rem; color:#475569;">🏥 ${req.hospital}</p>
            <p style="margin:0 0 10px 0; font-size:0.75rem; color:#dc2626; font-weight:600;">⏱️ Required: ${req.requiredWithin || 'Immediate'}</p>
            <a href="tel:${req.phone}" style="display:block; background:#dc2626; color:#fff; padding:8px 0; text-align:center; border-radius:8px; font-size:0.82rem; font-weight:700; text-decoration:none;">
              Respond to SOS Now
            </a>
          </div>
        `);
      });
    }
  }, [donors, requests, selectedBlood, selectedType]);

  const flyTo = (lat, lng, zoom = 15) => {
    if (mapInstanceRef.current && lat && lng) {
      mapInstanceRef.current.flyTo([Number(lat), Number(lng)], zoom, { duration: 1.2 });
      mapInstanceRef.current.invalidateSize();
    }
  };

  const fitAllMarkers = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const bounds = L.latLngBounds();
    let count = 0;
    donors.forEach((d) => {
      if (d.lat && d.lng) {
        bounds.extend([Number(d.lat), Number(d.lng)]);
        count++;
      }
    });
    requests.forEach((r) => {
      if (r.lat && r.lng) {
        bounds.extend([Number(r.lat), Number(r.lng)]);
        count++;
      }
    });

    if (count > 0) {
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
    }
  };

  const locateUserGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const { latitude, longitude } = pos.coords;
        const map = mapInstanceRef.current;
        if (map) {
          flyTo(latitude, longitude, 14);

          // Drop user pin
          const userIcon = L.divIcon({
            className: 'user-gps-marker',
            html: `
              <div style="
                background: #0ea5e9; width: 22px; height: 22px;
                border-radius: 50%; border: 3px solid #fff;
                box-shadow: 0 0 16px #0ea5e9;
                animation: pulse 1.5s infinite;
              "></div>
            `,
            iconSize: [22, 22],
            iconAnchor: [11, 11]
          });
          L.marker([latitude, longitude], { icon: userIcon })
            .addTo(map)
            .bindPopup('<b>📍 Your Current Location</b>')
            .openPopup();
        }
      },
      (err) => {
        setLocating(false);
        alert('Could not retrieve your location: ' + err.message);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Filtered sidebar items
  const filteredDonors = donors.filter((d) => {
    if (selectedBlood && d.bloodGroup !== selectedBlood) return false;
    if (!sidebarQuery) return true;
    const q = sidebarQuery.toLowerCase();
    return (
      d.name?.toLowerCase().includes(q) ||
      d.city?.toLowerCase().includes(q) ||
      d.area?.toLowerCase().includes(q) ||
      d.bloodGroup?.toLowerCase().includes(q)
    );
  });

  const filteredRequests = requests.filter((r) => {
    if (selectedBlood && r.bloodGroup !== selectedBlood) return false;
    if (!sidebarQuery) return true;
    const q = sidebarQuery.toLowerCase();
    return (
      r.patientName?.toLowerCase().includes(q) ||
      r.hospital?.toLowerCase().includes(q) ||
      r.city?.toLowerCase().includes(q) ||
      r.bloodGroup?.toLowerCase().includes(q)
    );
  });

  return (
    <section className="map-section" id="mapSection">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">
            <Compass className="w-3.5 h-3.5 inline mr-1 text-red-500" />
            Interactive Live Radar
          </span>
          <h2 className="section-title">Live Geolocation Network Map</h2>
          <p className="section-description">
            Real-time interactive radar displaying registered blood donors, hospitals, and critical emergency SOS requests. Select any location or jump directly to your region.
          </p>
        </div>

        {/* Map Control Bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-bright)',
            borderRadius: '16px 16px 0 0',
            padding: '14px 20px',
            borderBottom: 'none'
          }}
        >
          {/* City & Regional Jumpers */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Quick Jump:</span>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ padding: '5px 12px', fontSize: '0.8rem' }}
              onClick={() => flyTo(23.7806, 90.3952, 12)}
              title="Jump to Dhaka & Bangladesh Donors"
            >
              📍 Dhaka & Regional
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ padding: '5px 12px', fontSize: '0.8rem' }}
              onClick={() => flyTo(40.7306, -73.9352, 12)}
              title="Jump to New York Donors"
            >
              📍 New York Metro
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ padding: '5px 12px', fontSize: '0.8rem' }}
              onClick={fitAllMarkers}
              title="Fit all markers in view"
            >
              <ZoomIn className="w-3.5 h-3.5 mr-1" />
              Fit All Pins
            </button>
            <button
              type="button"
              className="btn btn-sm"
              style={{
                padding: '5px 12px',
                fontSize: '0.8rem',
                background: 'rgba(14, 165, 233, 0.2)',
                color: '#38bdf8',
                border: '1px solid rgba(14, 165, 233, 0.4)'
              }}
              onClick={locateUserGPS}
              title="Detect your device GPS"
            >
              <Crosshair className={`w-3.5 h-3.5 mr-1 ${locating ? 'animate-spin' : ''}`} />
              {locating ? 'Locating...' : 'My Location'}
            </button>
          </div>

          {/* Layer and Filter Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Blood Filter */}
            <select
              className="form-control"
              style={{ padding: '6px 12px', fontSize: '0.82rem', width: 'auto', minWidth: '130px' }}
              value={selectedBlood}
              onChange={(e) => setSelectedBlood(e.target.value)}
            >
              <option value="">All Blood Groups</option>
              <option value="O+">O+ Only</option>
              <option value="O-">O- Only</option>
              <option value="A+">A+ Only</option>
              <option value="A-">A- Only</option>
              <option value="B+">B+ Only</option>
              <option value="B-">B- Only</option>
              <option value="AB+">AB+ Only</option>
              <option value="AB-">AB- Only</option>
            </select>

            {/* Type Filter */}
            <select
              className="form-control"
              style={{ padding: '6px 12px', fontSize: '0.82rem', width: 'auto' }}
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">Donors & SOS</option>
              <option value="donors">Donors Only</option>
              <option value="sos">Urgent SOS Only</option>
            </select>

            {/* Map Theme Buttons */}
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: '2px', borderRadius: '8px' }}>
              <button
                type="button"
                onClick={() => setMapTheme('dark')}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: mapTheme === 'dark' ? 'var(--primary)' : 'transparent',
                  color: '#fff'
                }}
              >
                Dark
              </button>
              <button
                type="button"
                onClick={() => setMapTheme('streets')}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: mapTheme === 'streets' ? 'var(--primary)' : 'transparent',
                  color: '#fff'
                }}
              >
                Street
              </button>
              <button
                type="button"
                onClick={() => setMapTheme('satellite')}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: mapTheme === 'satellite' ? 'var(--primary)' : 'transparent',
                  color: '#fff'
                }}
              >
                Satellite
              </button>
            </div>
          </div>
        </div>

        {/* Map Body Wrapper */}
        <div className="map-wrapper interactive-card" style={{ borderRadius: '0 0 20px 20px' }}>
          {/* Interactive Radar Sidebar */}
          <div className="map-sidebar">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
                <Compass className="w-4 h-4 text-red-500 inline mr-1" />
                Live Network ({filteredDonors.length + filteredRequests.length})
              </h4>
            </div>

            {/* Legend */}
            <div className="map-legend" style={{ marginBottom: '14px', background: 'rgba(0,0,0,0.25)', padding: '10px', borderRadius: '8px' }}>
              <div className="legend-item">
                <div className="legend-color legend-donor" />
                <span>Available Volunteer Donors</span>
              </div>
              <div className="legend-item">
                <div className="legend-color legend-sos" />
                <span>Active Hospital Emergency SOS</span>
              </div>
            </div>

            {/* Search list query */}
            <div className="input-with-icon" style={{ marginBottom: '12px' }}>
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                className="form-control"
                placeholder="Search pins..."
                value={sidebarQuery}
                onChange={(e) => setSidebarQuery(e.target.value)}
                style={{ padding: '8px 12px 8px 38px', fontSize: '0.82rem' }}
              />
            </div>

            {/* List of Pinned Locations */}
            <div className="map-pinned-list" style={{ overflowY: 'auto', flex: 1 }}>
              {/* Emergency SOS First */}
              {(selectedType === 'all' || selectedType === 'sos') &&
                filteredRequests.map((req) => (
                  <div
                    key={req.id}
                    className="map-list-item"
                    style={{ borderColor: 'rgba(239, 68, 68, 0.45)', background: 'rgba(239, 68, 68, 0.08)' }}
                    onClick={() => flyTo(req.lat, req.lng, 15)}
                  >
                    <div className="map-list-title">
                      <span style={{ color: '#fca5a5', fontWeight: 700 }}>🚨 {req.patientName}</span>
                      <span style={{ color: '#ef4444', fontWeight: 800 }}>{req.bloodGroup}</span>
                    </div>
                    <div className="map-list-subtitle" style={{ fontSize: '0.78rem' }}>
                      🏥 {req.hospital} • {req.city}
                    </div>
                  </div>
                ))}

              {/* Donors */}
              {(selectedType === 'all' || selectedType === 'donors') &&
                filteredDonors.map((d) => (
                  <div
                    key={d.id}
                    className="map-list-item"
                    onClick={() => flyTo(d.lat, d.lng, 15)}
                  >
                    <div className="map-list-title">
                      <span style={{ fontWeight: 600 }}>{d.name}</span>
                      <span style={{ color: 'var(--success)', fontWeight: 800 }}>{d.bloodGroup}</span>
                    </div>
                    <div className="map-list-subtitle" style={{ fontSize: '0.78rem' }}>
                      📍 {d.city} ({d.area}) • {d.status === 'available' ? '🟢 Available' : '🟡 Busy'}
                    </div>
                  </div>
                ))}

              {filteredDonors.length === 0 && filteredRequests.length === 0 && (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No pinned locations match your search or filter.
                </div>
              )}
            </div>
          </div>

          {/* Leaflet Map Canvas */}
          <div
            ref={mapContainerRef}
            id="leafletMap"
            style={{
              width: '100%',
              height: '560px',
              minHeight: '560px',
              background: '#07090e',
              position: 'relative',
              zIndex: 1
            }}
          />
        </div>
      </div>
    </section>
  );
}
