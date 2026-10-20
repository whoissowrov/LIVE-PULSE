import express from 'express';
import { Users, DonationHistory, Notifications } from '../config/db.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Helper: Calculate 90-day recovery timeline
const getRecoveryInfo = (donationDate) => {
  if (!donationDate) return null;
  const donTime = new Date(donationDate).getTime();
  const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;
  const eligibleTime = donTime + ninetyDaysMs;
  const now = Date.now();
  const isEligible = now >= eligibleTime;
  const daysRemaining = Math.max(0, Math.ceil((eligibleTime - now) / (1000 * 60 * 60 * 24)));
  const daysElapsed = Math.floor((now - donTime) / (1000 * 60 * 60 * 24));
  const eligibleDate = new Date(eligibleTime).toISOString().split('T')[0];

  return {
    donationDate,
    eligibleDate,
    isEligible,
    daysRemaining,
    daysElapsed,
    progressPercent: Math.min(100, Math.max(0, Math.round((daysElapsed / 90) * 100)))
  };
};

// @route   PUT /api/users/profile
// @desc    Update user profile data
// @access  Private (User)
router.put('/profile', protect, (req, res) => {
  try {
    const { name, phone, bloodGroup, isDonor, isAvailable, avatarUrl, medicalInfo, lastDonationDate } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (phone !== undefined) updates.phone = phone.trim();
    if (bloodGroup !== undefined) updates.bloodGroup = bloodGroup.toUpperCase();
    if (isDonor !== undefined) updates.isDonor = Boolean(isDonor);
    if (isAvailable !== undefined) updates.isAvailable = Boolean(isAvailable);
    if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;
    if (medicalInfo !== undefined) updates.medicalInfo = medicalInfo;
    if (lastDonationDate !== undefined) updates.lastDonationDate = lastDonationDate;

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

// @route   POST /api/users/record-donation
// @desc    Donor records a blood donation date, tracks 90-day recovery, and generates automated website message
// @access  Private (User)
router.post('/record-donation', protect, (req, res) => {
  try {
    const { donationDate, donationTime, hospital, units, notes } = req.body;

    const effectiveDate = donationDate || new Date().toISOString().split('T')[0];
    const recovery = getRecoveryInfo(effectiveDate);

    // 1. Record in DonationHistory
    const record = DonationHistory.create({
      userId: req.user.id,
      donorName: req.user.name,
      bloodGroup: req.user.bloodGroup,
      donationDate: effectiveDate,
      donationTime: donationTime || 'Morning',
      hospital: hospital || 'Authorized Blood Donation Center',
      units: Number(units) || 1,
      recipientNotes: notes || 'Voluntary whole blood donation',
      status: 'verified'
    });

    // 2. Update user profile
    const currentCount = Number(req.user.totalDonations) || 0;
    const updated = Users.findByIdAndUpdate(req.user.id, {
      totalDonations: currentCount + 1,
      lastDonationDate: effectiveDate,
      // If still within 90-day recovery, set isAvailable = false
      isAvailable: recovery.isEligible
    });

    // 3. Automated Website Message (Notification)
    let autoMessage;
    if (recovery.isEligible) {
      autoMessage = Notifications.create({
        userId: req.user.id,
        title: '🎉 Recovery Completed: Eligible to Donate Again!',
        message: `Your 90-day recovery period from your blood donation on ${effectiveDate} is complete! You are in optimal health to donate again and save lives in emergencies.`,
        type: 'eligibility',
        read: false,
        metadata: {
          donationDate: effectiveDate,
          eligibleDate: recovery.eligibleDate,
          isEligible: true
        }
      });
    } else {
      autoMessage = Notifications.create({
        userId: req.user.id,
        title: '🩸 Blood Donation Recorded',
        message: `Thank you for saving lives on ${effectiveDate}! Your body needs 90 days to fully replenish red blood cells. You will be eligible to donate again on ${recovery.eligibleDate} (${recovery.daysRemaining} days remaining).`,
        type: 'donation',
        read: false,
        metadata: {
          donationDate: effectiveDate,
          eligibleDate: recovery.eligibleDate,
          daysRemaining: recovery.daysRemaining,
          isEligible: false
        }
      });

      // Post-care health tip
      Notifications.create({
        userId: req.user.id,
        title: '💧 Post-Donation Care Reminder',
        message: 'Drink plenty of water and electrolytes today, eat iron-rich foods, and avoid heavy workouts for the next 24 hours.',
        type: 'info',
        read: false
      });
    }

    const { password: _, ...safeUser } = updated;

    res.status(201).json({
      success: true,
      message: recovery.isEligible
        ? '🎉 Blood donation recorded! You have met the 90-day eligibility criteria.'
        : `🩸 Blood donation recorded! Next eligible donation date: ${recovery.eligibleDate} (${recovery.daysRemaining} days remaining).`,
      user: safeUser,
      donation: record,
      notification: autoMessage,
      recovery
    });
  } catch (error) {
    console.error('Record donation error:', error);
    res.status(500).json({ success: false, message: 'Server error recording donation date.' });
  }
});

// @route   GET /api/users/notifications
// @desc    Get all website notification messages for current user
// @access  Private (User)
router.get('/notifications', protect, (req, res) => {
  try {
    // Check if recovery interval has completed since user's last donation and auto-create eligibility message if needed
    if (req.user.lastDonationDate) {
      const recovery = getRecoveryInfo(req.user.lastDonationDate);
      if (recovery?.isEligible) {
        const existing = Notifications.findOne(n =>
          n.userId === req.user.id &&
          n.type === 'eligibility' &&
          n.metadata?.donationDate === req.user.lastDonationDate
        );

        if (!existing) {
          Notifications.create({
            userId: req.user.id,
            title: '🎉 Recovery Complete: Eligible to Donate Again!',
            message: `Your 90-day recovery interval since your donation on ${req.user.lastDonationDate} has finished. You are now fully eligible to donate blood again!`,
            type: 'eligibility',
            read: false,
            metadata: {
              donationDate: req.user.lastDonationDate,
              eligibleDate: recovery.eligibleDate,
              isEligible: true
            }
          });
        }
      }
    }

    const notifs = Notifications.find(n => n.userId === req.user.id);
    notifs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const unreadCount = notifs.filter(n => !n.read).length;

    res.json({
      success: true,
      count: notifs.length,
      unreadCount,
      notifications: notifs
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching notifications.' });
  }
});

// @route   PUT /api/users/notifications/:id/read
// @desc    Mark notification as read
// @access  Private (User)
router.put('/notifications/:id/read', protect, (req, res) => {
  try {
    const updated = Notifications.findByIdAndUpdate(req.params.id, { read: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }
    res.json({ success: true, notification: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating notification.' });
  }
});

// @route   DELETE /api/users/notifications
// @desc    Clear all notifications for user
// @access  Private (User)
router.delete('/notifications', protect, (req, res) => {
  try {
    const userNotifs = Notifications.find(n => n.userId === req.user.id);
    userNotifs.forEach(n => Notifications.findByIdAndDelete(n.id));
    res.json({ success: true, message: 'Notifications cleared.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error clearing notifications.' });
  }
});

// @route   PUT /api/users/location
// @desc    Upload user GPS location and address details
// @access  Private (User)
router.put('/location', protect, (req, res) => {
  try {
    const { lat, lng, city, area, address, hospital, division, district, upazila, union, village } = req.body;

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude coordinates are required.'
      });
    }

    const locationData = {
      division: division || req.user.location?.division || 'Dhaka',
      district: district || city || req.user.location?.district || req.user.location?.city || 'Dhaka',
      upazila: upazila !== undefined ? upazila : (req.user.location?.upazila || ''),
      union: union !== undefined ? union : (req.user.location?.union || ''),
      village: village !== undefined ? village : (req.user.location?.village || ''),
      city: district || city || req.user.location?.city || 'Dhaka',
      area: area || upazila || req.user.location?.area || '',
      address: address !== undefined ? address : (req.user.location?.address || ''),
      hospital: hospital !== undefined ? hospital : (req.user.location?.hospital || ''),
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      updatedAt: new Date().toISOString()
    };

    const userUpdates = {
      location: locationData
    };
    if (division) userUpdates.division = division;
    if (district) userUpdates.district = district;
    if (upazila !== undefined) userUpdates.upazila = upazila;
    if (union !== undefined) userUpdates.union = union;
    if (village !== undefined) userUpdates.village = village;

    const updated = Users.findByIdAndUpdate(req.user.id, userUpdates);

    const { password: _, ...safeUser } = updated;

    res.json({
      success: true,
      message: 'Bangladesh location and GPS coordinates saved successfully!',
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
