import express from 'express';
import { SosRequests } from '../config/db.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/sos
// @desc    List all active emergency blood requests
// @access  Public
router.get('/', (req, res) => {
  try {
    const { bloodGroup, status = 'active', city } = req.query;

    let requests = SosRequests.find(r => {
      if (status === 'all') return true;
      return r.status === status;
    });

    if (bloodGroup && bloodGroup !== 'ALL') {
      requests = requests.filter(r => r.bloodGroup === bloodGroup.toUpperCase());
    }

    if (city && city !== 'ALL') {
      requests = requests.filter(r => (r.city || '').toLowerCase() === city.toLowerCase());
    }

    // Sort by urgent priority and creation date
    const urgencyWeight = { critical: 3, high: 2, normal: 1 };
    requests.sort((a, b) => {
      const weightA = urgencyWeight[a.urgentLevel] || 1;
      const weightB = urgencyWeight[b.urgentLevel] || 1;
      if (weightB !== weightA) return weightB - weightA;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    console.error('Fetch SOS error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving emergency requests.' });
  }
});

// @route   POST /api/sos
// @desc    Create an emergency SOS blood request
// @access  Public / Authenticated
router.post('/', (req, res) => {
  try {
    const {
      patientName,
      bloodGroup,
      unitsNeeded,
      hospital,
      city,
      area,
      address,
      lat,
      lng,
      contactPhone,
      contactWhatsapp,
      urgentLevel,
      reason,
      requesterUserId
    } = req.body;

    if (!patientName || !bloodGroup || !hospital || !contactPhone) {
      return res.status(400).json({
        success: false,
        message: 'Patient name, blood group, hospital, and contact phone are required.'
      });
    }

    const newRequest = SosRequests.create({
      patientName: patientName.trim(),
      bloodGroup: bloodGroup.toUpperCase(),
      unitsNeeded: Number(unitsNeeded) || 1,
      hospital: hospital.trim(),
      city: city || 'Dhaka',
      area: area || '',
      address: address || '',
      coordinates: {
        lat: lat ? parseFloat(lat) : 23.8103,
        lng: lng ? parseFloat(lng) : 90.4125
      },
      contactPhone: contactPhone.trim(),
      contactWhatsapp: contactWhatsapp ? contactWhatsapp.trim() : contactPhone.trim(),
      urgentLevel: ['critical', 'high', 'normal'].includes(urgentLevel) ? urgentLevel : 'high',
      reason: reason || 'Urgent requirement',
      status: 'active',
      pledgedUnits: 0,
      requesterUserId: requesterUserId || null
    });

    res.status(201).json({
      success: true,
      message: 'Emergency SOS broadcasted successfully!',
      request: newRequest
    });
  } catch (error) {
    console.error('Create SOS error:', error);
    res.status(500).json({ success: false, message: 'Server error broadcasting SOS.' });
  }
});

// @route   PUT /api/sos/:id/status
// @desc    Update SOS request status (fulfilled, cancelled, active)
// @access  Private
router.put('/:id/status', protect, (req, res) => {
  try {
    const { status } = req.body;
    const request = SosRequests.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'SOS Request not found.' });
    }

    // Only creator or admin can update status
    if (req.user.role !== 'admin' && request.requesterUserId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this request.' });
    }

    const updated = SosRequests.findByIdAndUpdate(req.params.id, {
      status,
      resolvedAt: status === 'fulfilled' ? new Date().toISOString() : null
    });

    res.json({
      success: true,
      message: `Request marked as ${status}.`,
      request: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating status.' });
  }
});

export default router;
