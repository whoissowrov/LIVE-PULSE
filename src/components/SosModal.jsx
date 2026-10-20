import React, { useState } from 'react';
import { X, AlertTriangle, Send } from 'lucide-react';
import BangladeshLocationSelector from './BangladeshLocationSelector';

export default function SosModal({ isOpen, onClose, onSubmitSos }) {
  const [formData, setFormData] = useState({
    patientName: '',
    bloodGroup: 'O-',
    units: 2,
    hospital: '',
    division: 'Dhaka',
    district: 'Dhaka',
    upazila: '',
    union: '',
    village: '',
    city: 'Dhaka',
    area: '',
    lat: 23.8103,
    lng: 90.4125,
    contactPerson: '',
    phone: '',
    urgency: 'critical'
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmitSos(formData);
    onClose();
  };

  return (
    <div className="modal-overlay active" onClick={(e) => e.target.classList.contains('modal-overlay') && onClose()}>
      <div className="modal-box" style={{ maxWidth: '540px' }}>
        <div className="modal-header">
          <h3>
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            Broadcast Emergency SOS
          </h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
            This will immediately publish your SOS to all nearby compatible donors and plot your emergency marker on the live radar.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Patient Name <span className="req">*</span></label>
                <input
                  type="text"
                  name="patientName"
                  className="form-input"
                  placeholder="e.g. Michael Brown"
                  value={formData.patientName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Blood Group Needed <span className="req">*</span></label>
                <select
                  name="bloodGroup"
                  className="form-select"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  required
                >
                  <option value="O-">O Negative (O-)</option>
                  <option value="O+">O Positive (O+)</option>
                  <option value="A+">A Positive (A+)</option>
                  <option value="A-">A Negative (A-)</option>
                  <option value="B+">B Positive (B+)</option>
                  <option value="B-">B Negative (B-)</option>
                  <option value="AB+">AB Positive (AB+)</option>
                  <option value="AB-">AB Negative (AB-)</option>
                </select>
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Units Needed <span className="req">*</span></label>
                <input
                  type="number"
                  name="units"
                  className="form-input"
                  min="1"
                  max="10"
                  value={formData.units}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Urgency Level <span className="req">*</span></label>
                <select
                  name="urgency"
                  className="form-select"
                  value={formData.urgency}
                  onChange={handleChange}
                  required
                >
                  <option value="critical">🚨 Critical (Next 2 Hours)</option>
                  <option value="urgent">⚠️ Urgent (Within 24 Hours)</option>
                  <option value="standard">Standard (Scheduled Surgery)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Hospital / Clinic & Ward <span className="req">*</span></label>
              <input
                type="text"
                name="hospital"
                className="form-input"
                placeholder="e.g. Dhaka Medical College Hospital, ICU Ward 4"
                value={formData.hospital}
                onChange={handleChange}
                required
              />
            </div>

            {/* Bangladeshi Location Selector */}
            <BangladeshLocationSelector
              division={formData.division}
              district={formData.district}
              upazila={formData.upazila}
              union={formData.union}
              village={formData.village}
              onChange={(loc) => {
                setFormData((prev) => ({
                  ...prev,
                  division: loc.division,
                  district: loc.district,
                  upazila: loc.upazila,
                  union: loc.union,
                  village: loc.village,
                  city: loc.city,
                  area: loc.area,
                  lat: loc.lat || prev.lat,
                  lng: loc.lng || prev.lng
                }));
              }}
              helperText="Pinpoint the exact Bangladeshi Zilla, Upazila, and Union/Village where the patient requires blood."
              required
            />

            <div className="form-row-2" style={{ marginTop: '10px' }}>
              <div className="form-group">
                <label className="form-label">Contact Person / Attendant</label>
                <input
                  type="text"
                  name="contactPerson"
                  className="form-input"
                  placeholder="e.g. Patient Relative / Doctor"
                  value={formData.contactPerson}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Emergency Phone Number <span className="req">*</span></label>
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  placeholder="01711-XXXXXX or +880 1..."
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-danger-sos">
                <Send className="w-4 h-4" />
                <span>Broadcast Emergency SOS</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
