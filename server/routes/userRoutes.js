import express from 'express';
import { Users, DonationHistory } from '../config/db.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   PUT /api/users/profile
// @desc    Update user profile data
// @access  Private (User)
router.put('/profile', protect, (req, res) => {
  try {
    const { name, phone, bloodGroup, isDonor, isAvailable, avatarUrl, medicalInfo } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (phone !== undefined) updates.phone = phone.trim();
    if (bloodGroup !== undefined) updates.bloodGroup = bloodGroup.toUpperCase();
    if (isDonor !== undefined) updates.isDonor = Boolean(isDonor);
    if (isAvailable !== undefined) updates.isAvailable = Boolean(isAvailable);
    if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;
    if (medicalInfo !== undefined) updates.medicalInfo = medicalInfo;

    const updated = Users.findByIdAndUpdate(req.user.id, updates);
    const { password: _, ...safeUser } = updated;

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: safeUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Server error updating profile.' });
  }
});

// @route   PUT /api/users/location
// @desc    Upload user GPS location and address details
// @access  Private (User)
router.put('/location', protect, (req, res) => {
  try {
    const { lat, lng, city, area, address, hospital } = req.body;

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude coordinates are required.'
      });
    }

    const locationData = {
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      city: city || req.user.location?.city || 'Dhaka',
      area: area || '',
      address: address || '',
      hospital: hospital || '',
      updatedAt: new Date().toISOString()
    };

    const updated = Users.findByIdAndUpdate(req.user.id, {
      location: locationData
    });

    const { password: _, ...safeUser } = updated;

    res.json({
      success: true,
      message: 'Location data saved and synchronized successfully!',
      location: locationData,
      user: safeUser
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ success: false, message: 'Server error saving location.' });
  }
});

// @route   GET /api/users/history
// @desc    Get user's past donation history
// @access  Private (User)
router.get('/history', protect, (req, res) => {
  try {
    const history = DonationHistory.find(d => d.userId === req.user.id);
    res.json({
      success: true,
      count: history.length,
      history
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching donation history.' });
  }
});

// @route   POST /api/users/history
// @desc    Record a new blood donation
// @access  Private (User)
router.post('/history', protect, (req, res) => {
  try {
    const { donationDate, hospital, units, recipientNotes } = req.body;

    const record = DonationHistory.create({
      userId: req.user.id,
      donorName: req.user.name,
      bloodGroup: req.user.bloodGroup,
      donationDate: donationDate || new Date().toISOString(),
      hospital: hospital || 'City Blood Center',
      units: Number(units) || 1,
      recipientNotes: recipientNotes || 'Routine donation',
      status: 'verified'
    });

    // Update user's donation count & last donation date
    const currentCount = Number(req.user.totalDonations) || 0;
    Users.findByIdAndUpdate(req.user.id, {
      totalDonations: currentCount + 1,
      lastDonationDate: record.donationDate
    });

    res.status(201).json({
      success: true,
      message: 'Donation recorded successfully! Thank you for saving a life.',
      donation: record
    });
  } catch (error) {
    console.error('Record donation error:', error);
    res.status(500).json({ success: false, message: 'Server error recording donation.' });
  }
});

export default router;
