import React from 'react';
import {
  MapPin,
  Hospital,
  Droplet,
  Compass,
  AlertTriangle,
  Layers,
  ArrowRight,
  Sparkles,
  Users,
  Activity,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function HomeExplorePortals({
  onNavigate,
  donorsCount = 0,
  requestsCount = 0
}) {
  const portals = [
    {
      id: 'districts',
      href: 'districts.html',
      title: 'District & Village Tracker',
      bnTitle: 'জেলা, উপজেলা ও গ্রাম ট্র্যাকার',
      badge: '64 ZILLAS • 495+ UPAZILAS',
      badgeColor: 'emerald',
      icon: MapPin,
      iconColor: '#10b981',
      bgGlow: 'rgba(16, 185, 129, 0.12)',
      borderColor: 'rgba(16, 185, 129, 0.3)',
      description:
        'Explore registered blood donors and user login activity categorized across all 64 districts, upazilas, and villages throughout Bangladesh.',
      stats: '64 Districts • Real-Time Logins',
      actionText: 'Open District Tracker Page'
    },
    {
      id: 'hospitals',
      href: 'hospitals.html',
      title: 'Hospitals & Blood Banks',
      bnTitle: 'হাসপাতাল ও রক্ত সঞ্চালন কেন্দ্র',
      badge: '24/7 BLOOD BANKS • HOTLINES',
      badgeColor: 'sky',
      icon: Hospital,
      iconColor: '#0ea5e9',
      bgGlow: 'rgba(14, 165, 233, 0.12)',
      borderColor: 'rgba(14, 165, 233, 0.3)',
      description:
        'Nationwide directory of medical colleges, district 250-bed general hospitals, and certified transfusion centers with direct calling and GPS navigation.',
      stats: '60+ Centers • GPS Directions',
      actionText: 'Open Hospitals Page'
    },
    {
      id: 'donors',
      href: 'donors.html',
      title: 'Find Donors Directory',
      bnTitle: 'রক্তদাতা অনুসন্ধান ডিরেক্টরি',
      badge: 'VERIFIED LIFE SAVERS',
      badgeColor: 'rose',
      icon: Droplet,
      iconColor: '#f43f5e',
      bgGlow: 'rgba(244, 63, 94, 0.12)',
      borderColor: 'rgba(244, 63, 94, 0.3)',
      description:
        'Search verified volunteer donors across Bangladesh by blood group (A+, B+, O+, AB+), division, district, and availability with direct calling.',
      stats: `${donorsCount} Active Donors Available`,
      actionText: 'Search Donors Page'
    },
    {
      id: 'map',
      href: 'map.html',
      title: 'Live Geolocation Radar Map',
      bnTitle: 'লাইভ গুগল ম্যাপ রাডার',
      badge: 'OFFICIAL GOOGLE MAPS',
      badgeColor: 'indigo',
      icon: Compass,
      iconColor: '#6366f1',
      bgGlow: 'rgba(99, 102, 241, 0.12)',
      borderColor: 'rgba(99, 102, 241, 0.3)',
      description:
        'Interactive Google Map visualizing donors, medical institutions, and emergency SOS requests across Bangladesh with live GPS directions.',
      stats: 'High-Res Tiles • GPS Navigation',
      actionText: 'Explore Live Map Page'
    },
    {
      id: 'requests',
      href: 'urgent.html',
      title: 'Emergency Blood SOS',
      bnTitle: 'জরুরী রক্তের আবেদন',
      badge: 'CRITICAL EMERGENCY BROADCAST',
      badgeColor: 'red',
      icon: AlertTriangle,
      iconColor: '#ef4444',
      bgGlow: 'rgba(239, 68, 68, 0.15)',
      borderColor: 'rgba(239, 68, 68, 0.35)',
      description:
        'Real-time broadcast for patients in critical need of immediate blood transfusions in hospitals across Bangladesh. Post or respond to SOS calls.',
      stats: `${requestsCount} Active Urgent Calls`,
      actionText: 'View Emergency SOS Page'
    },
    {
      id: 'compatibility',
      href: 'compatibility.html',
      title: 'Compatibility & Eligibility',
      bnTitle: 'রক্তের সামঞ্জস্য ও যোগ্যতা কুইজ',
      badge: 'CLINICAL GUIDELINES',
      badgeColor: 'amber',
      icon: Layers,
      iconColor: '#f59e0b',
      bgGlow: 'rgba(245, 158, 11, 0.12)',
      borderColor: 'rgba(245, 158, 11, 0.3)',
      description:
        'Understand who can donate blood to whom with our scientific compatibility matrix, and verify your donation eligibility with a 60-second quiz.',
      stats: 'ABO / Rh Matrix • 60-Sec Quiz',
      actionText: 'Open Compatibility Page'
    }
  ];

  return (
    <section className="section bg-pattern" id="explorePortalsSection">
      <div className="container">
        {/* Section Header */}
        <div className="section-header text-center">
          <div className="pill-badge mb-3">
            <span className="pulse-dot" />
            <span>SEPARATE DEDICATED PORTALS</span>
          </div>
          <h2 className="section-title">
            Explore Dedicated <span className="gradient-text">LifePulse Sections</span>
          </h2>
          <p className="section-subtitle">
            Click on any category to open it directly in its separate page with complete details, interactive filtering, and real-time records.
          </p>
        </div>

        {/* Portals Grid */}
        <div className="home-portals-grid">
          {portals.map((portal) => {
            const Icon = portal.icon;
            return (
              <div
                key={portal.id}
                className="home-portal-card interactive-card"
                onClick={() => onNavigate(portal.id)}
                style={{
                  '--portal-border': portal.borderColor,
                  '--portal-glow': portal.bgGlow,
                  cursor: 'pointer'
                }}
              >
                <div className="portal-card-head">
                  <div
                    className="portal-icon-wrap"
                    style={{ background: portal.bgGlow, color: portal.iconColor }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`portal-badge badge-${portal.badgeColor}`}>
                    {portal.badge}
                  </span>
                </div>

                <h3 className="portal-title">{portal.title}</h3>
                {portal.bnTitle && <p className="portal-bn-title">{portal.bnTitle}</p>}

                <p className="portal-description">{portal.description}</p>

                <div className="portal-footer">
                  <span className="portal-stats">{portal.stats}</span>
                  <a
                    href={portal.href}
                    className="btn btn-sm btn-primary portal-action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onNavigate) {
                        e.preventDefault();
                        onNavigate(portal.id);
                      }
                    }}
                  >
                    <span>{portal.actionText}</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
