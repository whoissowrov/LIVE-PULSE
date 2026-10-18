import React, { useEffect, useRef } from 'react';
import { Compass, MapPin } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function LiveMap({ donors, requests, currentUser }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Reset container if Leaflet previously touched it
    if (mapContainerRef.current._leaflet_id) {
      mapContainerRef.current._leaflet_id = null;
    }
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch (e) {
        // ignore
      }
      mapInstanceRef.current = null;
    }

    const centerLat = currentUser?.lat || 40.73061;
    const centerLng = currentUser?.lng || -73.935242;

    try {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: false
      }).setView([centerLat, centerLng], 12);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    } catch (err) {
      console.warn('Leaflet initialization warning:', err);
    }

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          // ignore
        }
        mapInstanceRef.current = null;
      }
      if (mapContainerRef.current) {
        mapContainerRef.current._leaflet_id = null;
      }
    };
  }, []);

  // Update markers whenever donors or requests change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    // Add Donors
    donors.forEach((donor) => {
      if (!donor.lat || !donor.lng) return;

      const donorIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="
            background: linear-gradient(135deg, #10b981, #059669);
            width: 32px; height: 32px; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            color: #fff; font-weight: 800; font-size: 0.78rem;
            border: 2px solid #fff; box-shadow: 0 4px 12px rgba(16,185,129,0.5);
          ">
            ${donor.bloodGroup}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([donor.lat, donor.lng], { icon: donorIcon }).addTo(layer);
      marker.bindPopup(`
        <div class="popup-inner">
          <span style="font-size:0.7rem; font-weight:700; color:var(--success); text-transform:uppercase;">Registered Donor</span>
          <h4>${donor.name} (${donor.bloodGroup})</h4>
          <p><i class="fas fa-map-marker-alt"></i> ${donor.city} • ${donor.area}</p>
          <p><i class="fas fa-tint"></i> ${donor.donationsCount} donations • ${donor.status === 'available' ? 'Available' : 'Busy'}</p>
          <a href="tel:${donor.phone}" class="btn btn-primary btn-sm" style="margin-top:6px; width:100%;">Call Donor</a>
        </div>
      `);
    });

    // Add Emergency SOS Requests
    requests.forEach((req) => {
      if (!req.lat || !req.lng) return;

      const sosIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="
            background: linear-gradient(135deg, #ef4444, #991b1b);
            width: 38px; height: 38px; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            color: #fff; font-weight: 800; font-size: 0.8rem;
            border: 2px solid #fff; box-shadow: 0 0 22px rgba(239,68,68,0.85);
            animation: pulse-sos 1.8s infinite;
          ">
            SOS
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19]
      });

      const marker = L.marker([req.lat, req.lng], { icon: sosIcon }).addTo(layer);
      marker.bindPopup(`
        <div class="popup-inner">
          <span style="font-size:0.72rem; font-weight:800; color:var(--primary); text-transform:uppercase;">🚨 Urgent Blood Request</span>
          <h4>${req.patientName} (${req.bloodGroup} • ${req.units} Units)</h4>
          <p><i class="fas fa-hospital"></i> ${req.hospital}</p>
          <p><i class="fas fa-clock"></i> ${req.requiredWithin}</p>
          <a href="tel:${req.phone}" class="btn btn-primary btn-sm" style="margin-top:6px; width:100%;">Respond to SOS</a>
        </div>
      `);
    });
  }, [donors, requests]);

  const flyTo = (lat, lng) => {
    if (mapInstanceRef.current && lat && lng) {
      mapInstanceRef.current.flyTo([lat, lng], 14, { duration: 1.2 });
    }
  };

  return (
    <section className="map-section" id="mapSection">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">
            <Compass className="w-3.5 h-3.5 inline mr-1" />
            Real-Time Radar
          </span>
          <h2 className="section-title">Live Geolocation Network Map</h2>
          <p className="section-description">
            View donors, hospital emergency requests, and blood centers pinned across exact coordinates. Click any item to center and connect immediately.
          </p>
        </div>

        <div className="map-wrapper interactive-card">
          <div className="map-sidebar">
            <h4>
              <Compass className="w-4 h-4 text-red-500 inline mr-2" />
              Network Radar
            </h4>

            <div className="map-legend">
              <div className="legend-item">
                <div className="legend-color legend-donor" />
                <span>Registered Donor (Available)</span>
              </div>
              <div className="legend-item">
                <div className="legend-color legend-sos" />
                <span>Urgent Emergency SOS</span>
              </div>
              <div className="legend-item">
                <div className="legend-color legend-bank" />
                <span>Blood Center / Hospital</span>
              </div>
            </div>

            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>
              Pinned Locations
            </div>

            <div className="map-pinned-list">
              {/* Emergency SOS First */}
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="map-list-item"
                  style={{ borderColor: 'rgba(239, 68, 68, 0.45)' }}
                  onClick={() => flyTo(req.lat, req.lng)}
                >
                  <div className="map-list-title">
                    <span style={{ color: '#fca5a5' }}>🚨 {req.patientName}</span>
                    <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{req.bloodGroup}</span>
                  </div>
                  <div className="map-list-subtitle">{req.hospital}</div>
                </div>
              ))}

              {/* Donors */}
              {donors.map((d) => (
                <div key={d.id} className="map-list-item" onClick={() => flyTo(d.lat, d.lng)}>
                  <div className="map-list-title">
                    <span>{d.name}</span>
                    <span style={{ color: 'var(--success)', fontWeight: 800 }}>{d.bloodGroup}</span>
                  </div>
                  <div className="map-list-subtitle">
                    {d.city} ({d.area})
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div ref={mapContainerRef} id="leafletMap" style={{ width: '100%', height: '100%', minHeight: '450px' }} />
        </div>
      </div>
    </section>
  );
}
