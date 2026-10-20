import React from 'react';
import { Phone, MessageCircle, Hospital, MapPin, Clock, User, Bell } from 'lucide-react';

export default function SosRequests({ requests }) {
  return (
    <section id="requestsSection">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">
            <Bell className="w-3.5 h-3.5 inline mr-1" />
            Critical Urgency
          </span>
          <h2 className="section-title">Active Emergency SOS Requests</h2>
          <p className="section-description">
            Patients currently in trauma surgery or critical care requiring immediate whole blood or platelet units. Respond directly if you are a compatible match nearby.
          </p>
        </div>

        {requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <p>No urgent blood requests at the moment. All partner hospitals are currently supplied.</p>
          </div>
        ) : (
          <div className="requests-grid">
            {requests.map((req) => (
              <div
                key={req.id}
                className={`request-card interactive-card ${req.urgency === 'critical' ? 'urgent' : ''}`}
              >
                <div>
                  <div className="request-header">
                    <div className="request-blood-badge">{req.bloodGroup}</div>
                    <span className={`request-urgency-tag urgency-${req.urgency}`}>{req.urgency}</span>
                  </div>

                  <div className="request-patient-info">
                    <h4>
                      {req.patientName} ({req.units} Unit{req.units > 1 ? 's' : ''})
                    </h4>
                    <div className="request-hospital-info">
                      <span>
                        <Hospital className="w-4 h-4 text-red-500 inline mr-1" /> {req.hospital}
                      </span>
                      <span>
                        <MapPin className="w-4 h-4 text-red-500 inline mr-1" />{' '}
                        {req.village ? `${req.village}, ` : ''}
                        {req.union ? `${req.union}, ` : ''}
                        {req.upazila ? `${req.upazila}, ` : ''}
                        {req.district || req.city || 'Bangladesh'}
                      </span>
                      <span>
                        <Clock className="w-4 h-4 text-red-500 inline mr-1" /> {req.requiredWithin}
                      </span>
                      <span>
                        <User className="w-4 h-4 text-red-500 inline mr-1" /> Contact: {req.contactPerson}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="request-footer">
                  <a href={`tel:${req.phone}`} className="btn btn-primary btn-sm">
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Now</span>
                  </a>
                  <a
                    href={`https://wa.me/${req.phone.replace(/[^0-9]/g, '')}?text=Hello,%20I%20am%20responding%20to%20the%20urgent%20blood%20request%20for%20${encodeURIComponent(req.patientName)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary btn-sm"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>WhatsApp</span>
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
