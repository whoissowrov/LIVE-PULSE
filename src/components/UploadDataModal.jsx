import React, { useState, useEffect, useRef } from 'react';
import { X, UploadCloud, Crosshair, Camera, CheckCircle2, AlertCircle, Save } from 'lucide-react';

export default function UploadDataModal({ isOpen, onClose, currentUser, onSave, showToast }) {
  const [formData, setFormData] = useState({
    name: '',
    bloodGroup: 'O+',
    age: 26,
    gender: 'Female',
    weight: 60,
    phone: '',
    whatsapp: '',
    emergencyContact: '',
    city: '',
    area: '',
    address: '',
    nearestHospital: '',
    lat: '',
    lng: '',
    hemoglobin: '',
    totalDonations: 1,
    lastDonationDate: '',
    notes: '',
    availableNow: true,
    avatar: ''
  });

  const [geoStatus, setGeoStatus] = useState('');
  const [isDetectingGeo, setIsDetectingGeo] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        bloodGroup: currentUser.bloodGroup || 'O+',
        age: currentUser.age || 26,
        gender: currentUser.gender || 'Female',
        weight: currentUser.weight || 60,
        phone: currentUser.phone || '',
        whatsapp: currentUser.whatsapp || currentUser.phone || '',
        emergencyContact: currentUser.emergencyContact || '',
        city: currentUser.city || 'New York',
        area: currentUser.area || '',
        address: currentUser.address || '',
        nearestHospital: currentUser.nearestHospital || '',
        lat: currentUser.lat || '',
        lng: currentUser.lng || '',
        hemoglobin: currentUser.hemoglobin || '',
        totalDonations: currentUser.totalDonations || 1,
        lastDonationDate: currentUser.lastDonationDate || '',
        notes: currentUser.notes || '',
        availableNow: currentUser.availableNow !== undefined ? currentUser.availableNow : true,
        avatar: currentUser.avatar || ''
      });
      setGeoStatus(
        currentUser.lat && currentUser.lng
          ? `Saved coordinates: ${Number(currentUser.lat).toFixed(4)}, ${Number(currentUser.lng).toFixed(4)}`
          : 'Click "Detect GPS" to auto-fetch coordinates'
      );
    }
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAvatarFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      showToast('Please choose an image under 4MB', 'danger');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData((prev) => ({ ...prev, avatar: event.target.result }));
      showToast('Profile photo loaded! Click Save to apply.', 'info');
    };
    reader.readAsDataURL(file);
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser.', 'danger');
      return;
    }

    setIsDetectingGeo(true);
    setGeoStatus('Detecting your GPS position...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setFormData((prev) => ({
          ...prev,
          lat: lat.toFixed(6),
          lng: lng.toFixed(6),
          city: prev.city || 'My Detected City',
          area: prev.area || 'Nearby District'
        }));
        setIsDetectingGeo(false);
        setGeoStatus(`GPS Acquired: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        showToast('📍 Exact coordinates acquired and attached to your profile!', 'success');
      },
      (err) => {
        setIsDetectingGeo(false);
        setGeoStatus('Could not read GPS automatically. Please enter city/area manually below.');
        showToast('GPS access denied or timed out. Enter location manually.', 'danger');
      },
      { timeout: 9000, enableHighAccuracy: true }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="modal-overlay active" onClick={(e) => e.target.classList.contains('modal-overlay') && onClose()}>
      <div className="modal-box" style={{ maxWidth: '680px' }}>
        <div className="modal-header">
          <h3>
            <UploadCloud className="w-5 h-5 text-red-500 mr-2" />
            Upload Donor Data & Location
          </h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            {/* Avatar Photo Upload */}
            <div className="form-group">
              <label className="form-label">Profile / ID Photo</label>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleAvatarFile}
              />
              <div
                className="file-upload-box"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
              >
                <Camera className="upload-icon" />
                <strong style={{ color: '#fff' }}>Click to Upload Donor Picture</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  PNG, JPG, or WEBP (Max 4MB)
                </span>
              </div>

              {formData.avatar && (
                <div className="avatar-preview-container">
                  <img src={formData.avatar} alt="Preview" className="avatar-preview-img" style={{ display: 'block' }} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Your picture is ready to be published on the live donor map and verified registry.
                  </span>
                </div>
              )}
            </div>

            {/* Personal Data */}
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Full Name <span className="req">*</span></label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Blood Group <span className="req">*</span></label>
                <select
                  name="bloodGroup"
                  className="form-select"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  required
                >
                  <option value="A+">A Positive (A+)</option>
                  <option value="A-">A Negative (A-)</option>
                  <option value="B+">B Positive (B+)</option>
                  <option value="B-">B Negative (B-)</option>
                  <option value="AB+">AB Positive (AB+)</option>
                  <option value="AB-">AB Negative (AB-)</option>
                  <option value="O+">O Positive (O+)</option>
                  <option value="O-">O Negative (O-)</option>
                </select>
              </div>
            </div>

            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">Age</label>
                <input
                  type="number"
                  name="age"
                  className="form-input"
                  min="18"
                  max="75"
                  value={formData.age}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Gender</label>
                <select name="gender" className="form-select" value={formData.gender} onChange={handleChange}>
                  <option>Female</option>
                  <option>Male</option>
                  <option>Non-binary / Other</option>
                  <option>Prefer not to say</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  className="form-input"
                  min="45"
                  max="180"
                  value={formData.weight}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Contact Data */}
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Phone Number <span className="req">*</span></label>
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">WhatsApp Number</label>
                <input
                  type="tel"
                  name="whatsapp"
                  className="form-input"
                  placeholder="+1 (555) 000-0000"
                  value={formData.whatsapp}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Emergency Contact Name & Phone</label>
              <input
                type="text"
                name="emergencyContact"
                className="form-input"
                placeholder="e.g. David Miller (+1 555-888-9999)"
                value={formData.emergencyContact}
                onChange={handleChange}
              />
            </div>

            {/* Location Section */}
            <div style={{ margin: '24px 0 16px', borderTop: '1px solid var(--border-subtle)', paddingTop: '18px' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Crosshair className="w-4 h-4 text-red-500" />
                <span>Location & Geolocation Coordinates</span>
              </h4>

              <div className="geo-action-box">
                <div>
                  <strong style={{ fontSize: '0.9rem', color: '#fff' }}>Automatic Geolocation</strong>
                  <div className="geo-action-text">{geoStatus}</div>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={detectLocation}
                  disabled={isDetectingGeo}
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  <span>{isDetectingGeo ? 'Detecting...' : 'Detect GPS'}</span>
                </button>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">City <span className="req">*</span></label>
                  <input
                    type="text"
                    name="city"
                    className="form-input"
                    placeholder="e.g. New York, Brooklyn, Chicago"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Neighborhood / Area</label>
                  <input
                    type="text"
                    name="area"
                    className="form-input"
                    placeholder="e.g. Upper East Side, Downtown"
                    value={formData.area}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Street Address / Landmark</label>
                <input
                  type="text"
                  name="address"
                  className="form-input"
                  placeholder="e.g. 120 Tech Way, Suite 4B"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nearest Hospital or Medical Center</label>
                <input
                  type="text"
                  name="nearestHospital"
                  className="form-input"
                  placeholder="e.g. Mount Sinai Hospital, Bellevue"
                  value={formData.nearestHospital}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    name="lat"
                    className="form-input"
                    placeholder="Auto-detected or custom"
                    value={formData.lat}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    name="lng"
                    className="form-input"
                    placeholder="Auto-detected or custom"
                    value={formData.lng}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Health & History */}
            <div style={{ margin: '20px 0 16px', borderTop: '1px solid var(--border-subtle)', paddingTop: '18px' }}>
              <div className="form-row-3">
                <div className="form-group">
                  <label className="form-label">Total Donations</label>
                  <input
                    type="number"
                    name="totalDonations"
                    className="form-input"
                    min="0"
                    value={formData.totalDonations}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Donation Date</label>
                  <input
                    type="date"
                    name="lastDonationDate"
                    className="form-input"
                    value={formData.lastDonationDate}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Hemoglobin (g/dL)</label>
                  <input
                    type="text"
                    name="hemoglobin"
                    className="form-input"
                    placeholder="e.g. 13.8"
                    value={formData.hemoglobin}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Medical Notes / Allergies</label>
                <textarea
                  name="notes"
                  className="form-textarea"
                  placeholder="Dietary preferences, medical clearances, or comments for blood coordinators..."
                  value={formData.notes}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group" style={{ marginTop: '14px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="availableNow"
                    checked={formData.availableNow}
                    onChange={handleChange}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                  />
                  <span><strong>I am available to receive emergency donation requests</strong> in my area</span>
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <Save className="w-4 h-4" />
                <span>Save & Upload Data</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
