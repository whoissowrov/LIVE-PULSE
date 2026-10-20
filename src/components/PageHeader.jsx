import React from 'react';
import {
  ArrowLeft,
  Home,
  ChevronRight,
  Compass,
  MapPin,
  Hospital,
  Droplet,
  AlertTriangle,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';

export default function PageHeader({
  title,
  subtitle,
  badge,
  icon: Icon,
  currentPage,
  onNavigate
}) {
  const pageUrls = {
    home: 'index.html',
    districts: 'districts.html',
    hospitals: 'hospitals.html',
    donors: 'donors.html',
    map: 'map.html',
    requests: 'urgent.html',
    compatibility: 'compatibility.html'
  };

  const navTabs = [
    { id: 'districts', label: 'Districts & Villages', icon: MapPin, href: 'districts.html' },
    { id: 'hospitals', label: 'Hospitals & Blood Banks', icon: Hospital, href: 'hospitals.html' },
    { id: 'donors', label: 'Find Donors', icon: Droplet, href: 'donors.html' },
    { id: 'map', label: 'Live Map', icon: Compass, href: 'map.html' },
    { id: 'requests', label: 'Urgent SOS', icon: AlertTriangle, href: 'urgent.html' },
    { id: 'compatibility', label: 'Compatibility', icon: Layers, href: 'compatibility.html' }
  ];

  return (
    <div className="page-header-wrapper">
      <div className="container">
        {/* Breadcrumb & Back Button Bar */}
        <div className="page-breadcrumb-bar">
          <a
            href="index.html"
            className="btn btn-sm btn-secondary back-home-btn"
            onClick={(e) => {
              if (onNavigate) {
                e.preventDefault();
                onNavigate('home');
              }
            }}
            title="Return to Home Portal"
          >
            <ArrowLeft className="w-4 h-4 mr-1 text-red-400" />
            <span>← Back to Home Page</span>
          </a>

          <div className="breadcrumb-trail">
            <a
              href="index.html"
              className="breadcrumb-crumb link"
              onClick={(e) => {
                if (onNavigate) {
                  e.preventDefault();
                  onNavigate('home');
                }
              }}
            >
              <Home className="w-3.5 h-3.5 mr-1" />
              <span>Home</span>
            </a>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="breadcrumb-crumb current">{title}</span>
          </div>
        </div>

        {/* Page Title & Subtitle Card */}
        <div className="page-hero-card">
          <div className="page-hero-content">
            {badge && (
              <div className="pill-badge mb-2">
                <span className="pulse-dot" />
                <span>{badge}</span>
              </div>
            )}
            <div className="page-hero-title-row">
              {Icon && (
                <div className="page-hero-icon-wrap">
                  <Icon className="w-7 h-7 text-rose-500" />
                </div>
              )}
              <h1 className="page-hero-title">{title}</h1>
            </div>
            {subtitle && <p className="page-hero-subtitle">{subtitle}</p>}
          </div>

          {/* Quick Page Switcher Pills */}
          <div className="page-quick-tabs">
            <span className="quick-tabs-label">Separate Pages:</span>
            <div className="quick-tabs-list">
              {navTabs.map((tab) => {
                const TabIcon = tab.icon;
                const isActive = currentPage === tab.id;
                return (
                  <a
                    key={tab.id}
                    href={tab.href}
                    className={`quick-tab-btn ${isActive ? 'active' : ''}`}
                    onClick={(e) => {
                      if (onNavigate) {
                        e.preventDefault();
                        onNavigate(tab.id);
                      }
                    }}
                  >
                    <TabIcon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
