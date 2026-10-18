import React, { useEffect, useRef, useState } from 'react';
import { Compass, MapPin, Layers, Crosshair, Search, Phone, MessageSquare, AlertTriangle, RefreshCw, ZoomIn, ExternalLink } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function LiveMap({ donors = [], requests = [], currentUser }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const tileLayerRef = useRef(null);

  const [mapTheme, setMapTheme] = useState('google'); // 'google' | 'satellite' | 'terrain' | 'embed'
  const [selectedBlood, setSelectedBlood] = useState('');
  const [selectedType, setSelectedType] = useState('all'); // 'all' | 'donors' | 'sos'
  const [sidebarQuery, setSidebarQuery] = useState('');
  const [activeCity, setActiveCity] = useState('Dhaka');
  const [locating, setLocating] = useState(false);

  // Helper to get Google Maps Tile URL and options
  const getGoogleTileConfig = (theme) => {
    if (theme === 'satellite') {
      return {
        url: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
        subdomains: ['0', '1', '2', '3'],
        attribution: '&copy; Google Maps Satellite'
      };
    }
    if (theme === 'terrain') {
      return {
        url: 'https://mt{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
        subdomains: ['0', '1', '2', '3'],
        attribution: '&copy; Google Maps Terrain'
      };
    }
    // Default: Official Google Maps Standard Roadmap
    return {
      url: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
      subdomains: ['0', '1', '2', '3'],
      attribution: '&copy; Google Maps'
    };
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (mapTheme === 'embed') return;
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

    const centerLat = currentUser?.lat || 23.7806;
    const centerLng = currentUser?.lng || 90.3952;

    try {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
        attributionControl: true
      }).setView([centerLat, centerLng], 12);

      const tileConfig = getGoogleTileConfig(mapTheme);
      const tileLayer = L.tileLayer(tileConfig.url, {
        attribution: tileConfig.attribution,
        subdomains: tileConfig.subdomains,
        maxZoom: 20
      }).addTo(map);

      tileLayerRef.current = tileLayer;
      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;

      // Force recalculate sizes so tiles never fail or stay grey
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
  }, [mapTheme === 'embed']);

  // Switch Tile Layer when theme changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || mapTheme === 'embed') return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const tileConfig = getGoogleTileConfig(mapTheme);
    const newLayer = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      subdomains: tileConfig.subdomains,
      maxZoom: 20
    }).addTo(map);

    tileLayerRef.current = newLayer;
    map.invalidateSize();
  }, [mapTheme]);

  // Update Markers when donors, requests, or filters change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer || mapTheme === 'embed') return;

    layer.clearLayers();

    // 1. Add Donors
    if (selectedType === 'all' || selectedType === 'donors') {
      donors.forEach((donor) => {
        if (!donor.lat || !donor.lng) return;
        if (selectedBlood && donor.bloodGroup !== selectedBlood) return;

        const latLng = [Number(donor.lat), Number(donor.lng)];
        const isAvailable = donor.status === 'available';

        const donorIcon = L.divIcon({
          className: 'custom-map-marker',
          html: `
            <div style="
              background: ${isAvailable ? 'linear-gradient(135deg, #10b981, #047857)' : 'linear-gradient(135deg, #f59e0b, #d97706)'};
              width: 36px; height: 36px; border-radius: 50%;
              display: flex; align-items: center; justify-content: center;
              color: #fff; font-weight: 800; font-size: 0.82rem;
              border: 2.5px solid #fff; box-shadow: 0 4px 16px ${isAvailable ? 'rgba(16,185,129,0.7)' : 'rgba(245,158,11,0.7)'};
              cursor: pointer;
            ">
              ${donor.bloodGroup}
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });

        const marker = L.marker(latLng, { icon: donorIcon }).addTo(layer);
        marker.bindPopup(`
          <div style="font-family:'Plus Jakarta Sans',sans-serif; min-width:220px; color:#1e293b; padding:4px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <span style="font-size:0.72rem; font-weight:800; color:#059669; background:#dcfce7; padding:3px 8px; border-radius:6px; text-transform:uppercase;">
                ${isAvailable ? '🟢 Available Volunteer' : '🟡 Busy / Resting'}
              </span>
              <span style="font-size:0.9rem; font-weight:800; color:#ef4444;">${donor.bloodGroup}</span>
            </div>
            <h4 style="margin:0 0 4px 0; font-size:1.1rem; font-weight:700; color:#0f172a;">${donor.name}</h4>
            <p style="margin:0 0 4px 0; font-size:0.82rem; color:#475569;">📍 ${donor.city || 'City'} • ${donor.area || 'Metro Area'}</p>
            <p style="margin:0 0 12px 0; font-size:0.76rem; color:#64748b;">🩸 ${donor.donationsCount || 0} Successful Donations</p>
            <div style="display:flex; gap:8px;">
              <a href="tel:${donor.phone}" style="flex:1; background:#ef4444; color:#fff; padding:8px 0; text-align:center; border-radius:8px; font-size:0.82rem; font-weight:700; text-decoration:none;">
                Call Donor
              </a>
              <a href="https://wa.me/${(donor.phone || '').replace(/[^0-9]/g, '')}" target="_blank" style="flex:1; background:#10b981; color:#fff; padding:8px 0; text-align:center; border-radius:8px; font-size:0.82rem; font-weight:700; text-decoration:none;">
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

        const sosIcon = L.divIcon({
          className: 'custom-map-marker',
          html: `
            <div style="
              background: linear-gradient(135deg, #ef4444, #991b1b);
              width: 40px; height: 40px; border-radius: 50%;
              display: flex; align-items: center; justify-content: center;
              color: #fff; font-weight: 800; font-size: 0.82rem;
              border: 3px solid #fff; box-shadow: 0 0 26px rgba(239,68,68,0.95);
              animation: pulse-sos 1.6s infinite;
              cursor: pointer;
            ">
              SOS
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        });

        const marker = L.marker(latLng, { icon: sosIcon }).addTo(layer);
        marker.bindPopup(`
          <div style="font-family:'Plus Jakarta Sans',sans-serif; min-width:240px; color:#1e293b; padding:4px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <span style="font-size:0.72rem; font-weight:800; color:#dc2626; background:#fee2e2; padding:3px 8px; border-radius:6px; text-transform:uppercase;">
                🚨 Urgent Blood Needed
              </span>
              <span style="font-size:0.95rem; font-weight:800; color:#dc2626;">${req.bloodGroup}</span>
            </div>
            <h4 style="margin:0 0 4px 0; font-size:1.1rem; font-weight:700; color:#0f172a;">${req.patientName} (${req.units || 1} Unit${(req.units || 1) > 1 ? 's' : ''})</h4>
            <p style="margin:0 0 4px 0; font-size:0.82rem; color:#475569;">🏥 ${req.hospital}</p>
            <p style="margin:0 0 12px 0; font-size:0.78rem; color:#dc2626; font-weight:600;">⏱️ Required: ${req.requiredWithin || 'Immediate'}</p>
            <a href="tel:${req.phone}" style="display:block; background:#dc2626; color:#fff; padding:9px 0; text-align:center; border-radius:8px; font-size:0.84rem; font-weight:700; text-decoration:none;">
              Respond to SOS Now
            </a>
          </div>
        `);
      });
    }
  }, [donors, requests, selectedBlood, selectedType, mapTheme]);

  const flyTo = (lat, lng, zoom = 15, cityName = '') => {
    if (cityName) setActiveCity(cityName);
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
          flyTo(latitude, longitude, 14, 'Current Location');

          const userIcon = L.divIcon({
            className: 'user-gps-marker',
            html: `
              <div style="
                background: #0ea5e9; width: 22px; height: 22px;
                border-radius: 50%; border: 3px solid #fff;
                box-shadow: 0 0 18px #0ea5e9;
                animation: pulse 1.5s infinite;
              "></div>
            `,
            iconSize: [22, 22],
            iconAnchor: [11, 11]
          });
          L.marker([latitude, longitude], { icon: userIcon })
            .addTo(map)
            .bindPopup('<b>📍 Your Current GPS Location</b>')
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
            Official Google Map Radar
          </span>
          <h2 className="section-title">Live Geolocation Network Map</h2>
          <p className="section-description">
            Powered by high-resolution Google Maps. Locate verified blood donors, hospitals, and critical emergency SOS calls with real-time GPS navigation.
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
              style={{ padding: '6px 14px', fontSize: '0.82rem', fontWeight: 600 }}
              onClick={() => flyTo(23.7806, 90.3952, 13, 'Dhaka')}
              title="Jump to Dhaka & Bangladesh Donors"
            >
              📍 Dhaka & Regional
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ padding: '6px 14px', fontSize: '0.82rem', fontWeight: 600 }}
              onClick={() => flyTo(40.7306, -73.9352, 12, 'New York')}
              title="Jump to New York Donors"
            >
              📍 New York Metro
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ padding: '6px 14px', fontSize: '0.82rem', fontWeight: 600 }}
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
                padding: '6px 14px',
                fontSize: '0.82rem',
                fontWeight: 600,
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

            {/* Google Map Mode Switcher */}
            <div
              style={{
                display: 'flex',
                background: 'rgba(0,0,0,0.5)',
                padding: '3px',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <button
                type="button"
                onClick={() => setMapTheme('google')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '7px',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: mapTheme === 'google' ? 'var(--primary)' : 'transparent',
                  color: '#fff'
                }}
              >
                🗺️ Google Map
              </button>
              <button
                type="button"
                onClick={() => setMapTheme('satellite')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '7px',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: mapTheme === 'satellite' ? 'var(--primary)' : 'transparent',
                  color: '#fff'
                }}
              >
                🛰️ Satellite
              </button>
              <button
                type="button"
                onClick={() => setMapTheme('terrain')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '7px',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: mapTheme === 'terrain' ? 'var(--primary)' : 'transparent',
                  color: '#fff'
                }}
              >
                ⛰️ Terrain
              </button>
              <button
                type="button"
                onClick={() => setMapTheme('embed')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '7px',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: mapTheme === 'embed' ? 'linear-gradient(135deg, #0ea5e9, #2563eb)' : 'transparent',
                  color: '#fff'
                }}
              >
                🔍 Google Live Search
              </button>
            </div>
          </div>
        </div>

        {/* Map Body Wrapper */}
        <div className="map-wrapper interactive-card" style={{ borderRadius: '0 0 20px 20px', minHeight: '560px' }}>
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
                    onClick={() => {
                      if (mapTheme === 'embed') setMapTheme('google');
                      flyTo(req.lat, req.lng, 15, req.city);
                    }}
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
                    onClick={() => {
                      if (mapTheme === 'embed') setMapTheme('google');
                      flyTo(d.lat, d.lng, 15, d.city);
                    }}
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

          {/* Map Display: Either Official Google Map Tiles OR Direct Google Maps Live Embed */}
          {mapTheme === 'embed' ? (
            <div style={{ position: 'relative', width: '100%', height: '560px', background: '#07090e' }}>
              <iframe
                title="Google Maps Live Hospital & Blood Bank Search"
                src={`https://www.google.com/maps?q=blood+bank+hospital+emergency+${encodeURIComponent(activeCity || 'Dhaka')}&output=embed&z=13`}
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'contrast(1.05)' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(15, 23, 42, 0.85)',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  fontSize: '0.78rem',
                  color: '#38bdf8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backdropFilter: 'blur(8px)'
                }}
              >
                <span>Google Maps Live Search: {activeCity}</span>
                <a
                  href={`https://www.google.com/maps/search/blood+bank+hospital+${encodeURIComponent(activeCity)}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#fff', display: 'flex', alignItems: 'center' }}
                  title="Open full Google Maps in new tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ) : (
            <div
              ref={mapContainerRef}
              id="leafletMap"
              style={{
                width: '100%',
                height: '560px',
                minHeight: '560px',
                background: '#e5e7eb',
                position: 'relative',
                zIndex: 1
              }}
            />
          )}
        </div>
      </div>
    </section>
  );
}
