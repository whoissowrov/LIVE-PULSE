import express from 'express';
import { Users, SosRequests, DonationHistory } from '../config/db.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Apply auth + admin guard to all routes in this router
router.use(protect, adminOnly);

// @route   GET /api/admin/stats
// @desc    Get complete administrative dashboard statistics
// @access  Admin Only
router.get('/stats', (req, res) => {
  try {
    const allUsers = Users.find();
    const allSos = SosRequests.find();
    const allDonations = DonationHistory.find();

    const totalUsers = allUsers.length;
    const totalDonors = allUsers.filter(u => u.isDonor).length;
    const verifiedDonors = allUsers.filter(u => u.isDonor && u.isVerifiedDonor).length;
    const availableDonors = allUsers.filter(u => u.isDonor && u.isAvailable !== false).length;
    const activeSos = allSos.filter(s => s.status === 'active').length;
    const fulfilledSos = allSos.filter(s => s.status === 'fulfilled').length;
    const totalDonationsRecorded = allDonations.length;

    // Blood Group breakdown
    const bloodGroupCounts = {
      'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0,
      'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0
    };
    allUsers.forEach(u => {
      if (u.bloodGroup && bloodGroupCounts[u.bloodGroup] !== undefined) {
        bloodGroupCounts[u.bloodGroup]++;
      }
    });

    // Urgency breakdown for active SOS
    const urgencyCounts = { critical: 0, high: 0, normal: 0 };
    allSos.filter(s => s.status === 'active').forEach(s => {
      if (urgencyCounts[s.urgentLevel] !== undefined) {
        urgencyCounts[s.urgentLevel]++;
      }
    });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalDonors,
        verifiedDonors,
        availableDonors,
        activeSos,
        fulfilledSos,
        totalDonationsRecorded,
        bloodGroupCounts,
        urgencyCounts
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ success: false, message: 'Server error generating stats.' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with filtering, search, and pagination
// @access  Admin Only
router.get('/users', (req, res) => {
  try {
    const { role, isDonor, bloodGroup, search, page = 1, limit = 50 } = req.query;

    let users = Users.find();

    if (role) {
      users = users.filter(u => u.role === role);
    }
    if (isDonor !== undefined) {
      const isD = isDonor === 'true';
      users = users.filter(u => Boolean(u.isDonor) === isD);
    }
    if (bloodGroup && bloodGroup !== 'ALL') {
      users = users.filter(u => u.bloodGroup === bloodGroup.toUpperCase());
    }
    if (search) {
      const q = search.toLowerCase();
      users = users.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone || '').includes(q) ||
        (u.location?.city || '').toLowerCase().includes(q)
      );
    }

    const total = users.length;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = users.slice(startIndex, startIndex + limitNum);

    // Strip sensitive passwords
    const safeUsers = paginated.map(({ password, ...u }) => u);

    res.json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      users: safeUsers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving users.' });
  }
});

// @route   PUT /api/admin/users/:id/verify
// @desc    Toggle donor verification badge
// @access  Admin Only
router.put('/users/:id/verify', (req, res) => {
  try {
    const user = Users.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const newStatus = !user.isVerifiedDonor;
    const updated = Users.findByIdAndUpdate(req.params.id, {
      isVerifiedDonor: newStatus,
      verifiedAt: newStatus ? new Date().toISOString() : null,
      verifiedBy: newStatus ? req.user.email : null
    });

    const { password: _, ...safeUser } = updated;
    res.json({
      success: true,
      message: `Donor verification ${newStatus ? 'granted' : 'revoked'} successfully!`,
      user: safeUser
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating verification.' });
  }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Change user role (e.g. promote to admin or demote to user)
// @access  Admin Only
router.put('/users/:id/role', (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: "Role must be 'user' or 'admin'." });
    }

    if (req.params.id === req.user.id && role !== 'admin') {
      return res.status(400).json({ success: false, message: 'You cannot demote your own admin account.' });
    }

    const updated = Users.findByIdAndUpdate(req.params.id, { role });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const { password: _, ...safeUser } = updated;
    res.json({
      success: true,
      message: `User role changed to ${role}.`,
      user: safeUser
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating role.' });
  }
});

// @route   PUT /api/admin/users/:id/ban
// @desc    Suspend or unsuspend a user account
// @access  Admin Only
router.put('/users/:id/ban', (req, res) => {
  try {
    const user = Users.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot ban an administrator account.' });
    }

    const newBanStatus = !user.isBanned;
    const updated = Users.findByIdAndUpdate(req.params.id, {
      isBanned: newBanStatus,
      bannedAt: newBanStatus ? new Date().toISOString() : null
    });

    const { password: _, ...safeUser } = updated;
    res.json({
      success: true,
      message: `User account has been ${newBanStatus ? 'suspended' : 'reactivated'}.`,
      user: safeUser
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error toggling ban.' });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Permanently delete a user account
// @access  Admin Only
router.delete('/users/:id', (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account.' });
    }

    const deleted = Users.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({
      success: true,
      message: `User ${deleted.name} (${deleted.email}) deleted permanently.`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting user.' });
  }
});

// @route   GET /api/admin/sos
// @desc    Get all emergency SOS requests
// @access  Admin Only
router.get('/sos', (req, res) => {
  try {
    const allSos = SosRequests.find();
    res.json({
      success: true,
      count: allSos.length,
      requests: allSos
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching SOS requests.' });
  }
});

// @route   POST /api/admin/users
// @desc    Admin directly creates a new user or donor
// @access  Admin Only
router.post('/users', async (req, res) => {
  try {
    const { name, email, password, phone, bloodGroup, role = 'user', isDonor = true, city, area, hospital } = req.body;

    if (!name || !email || !bloodGroup) {
      return res.status(400).json({ success: false, message: 'Name, email, and blood group are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = Users.findOne(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const newUser = Users.create({
      name: name.trim(),
      email: cleanEmail,
      password: password || 'pass123',
      phone: phone || '',
      bloodGroup: bloodGroup.toUpperCase(),
      role: ['user', 'admin'].includes(role) ? role : 'user',
      isDonor: Boolean(isDonor),
      isVerifiedDonor: true, // admin created is verified by default
      isAvailable: true,
      totalDonations: 0,
      location: {
        city: city || 'Dhaka',
        area: area || '',
        hospital: hospital || '',
        lat: 23.8103,
        lng: 90.4125
      }
    });

    const { password: _, ...safeUser } = newUser;
    res.status(201).json({ success: true, message: `User ${name} created by admin successfully.`, user: safeUser });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating user.' });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Admin updates any user profile
// @access  Admin Only
router.put('/users/:id', (req, res) => {
  try {
    const { name, email, phone, bloodGroup, role, isDonor, isAvailable, isVerifiedDonor, location } = req.body;
    const updates = {};
    if (name) updates.name = name.trim();
    if (email) updates.email = email.trim().toLowerCase();
    if (phone !== undefined) updates.phone = phone;
    if (bloodGroup) updates.bloodGroup = bloodGroup.toUpperCase();
    if (role) updates.role = role;
    if (isDonor !== undefined) updates.isDonor = Boolean(isDonor);
    if (isAvailable !== undefined) updates.isAvailable = Boolean(isAvailable);
    if (isVerifiedDonor !== undefined) updates.isVerifiedDonor = Boolean(isVerifiedDonor);
    if (location) updates.location = location;

    const updated = Users.findByIdAndUpdate(req.params.id, updates);
    if (!updated) return res.status(404).json({ success: false, message: 'User not found.' });

    const { password: _, ...safeUser } = updated;
    res.json({ success: true, message: 'User updated successfully.', user: safeUser });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating user.' });
  }
});

// @route   GET /api/admin/donations
// @desc    Get all donation records
// @access  Admin Only
router.get('/donations', (req, res) => {
  try {
    const all = DonationHistory.find();
    res.json({ success: true, count: all.length, donations: all });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching donations.' });
  }
});

// @route   POST /api/admin/donations
// @desc    Admin logs a donation
// @access  Admin Only
router.post('/donations', (req, res) => {
  try {
    const { donorName, bloodGroup, hospital, units, donationDate, recipientNotes } = req.body;
    const rec = DonationHistory.create({
      donorName: donorName || 'Verified Donor',
      bloodGroup: (bloodGroup || 'O+').toUpperCase(),
      hospital: hospital || 'Central Blood Bank',
      units: Number(units) || 1,
      donationDate: donationDate || new Date().toISOString(),
      recipientNotes: recipientNotes || 'Admin verified record',
      status: 'verified'
    });
    res.status(201).json({ success: true, message: 'Donation recorded.', donation: rec });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error logging donation.' });
  }
});

// @route   DELETE /api/admin/donations/:id
// @desc    Delete a donation record
// @access  Admin Only
router.delete('/donations/:id', (req, res) => {
  try {
    const deleted = DonationHistory.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Donation not found.' });
    res.json({ success: true, message: 'Donation record deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting donation.' });
  }
});

// @route   PUT /api/admin/sos/:id
// @desc    Update any emergency SOS request
// @access  Admin Only
router.put('/sos/:id', (req, res) => {
  try {
    const { patientName, bloodGroup, unitsNeeded, hospital, city, urgentLevel, status } = req.body;
    const updates = {};
    if (patientName) updates.patientName = patientName;
    if (bloodGroup) updates.bloodGroup = bloodGroup.toUpperCase();
    if (unitsNeeded) updates.unitsNeeded = Number(unitsNeeded);
    if (hospital) updates.hospital = hospital;
    if (city) updates.city = city;
    if (urgentLevel) updates.urgentLevel = urgentLevel;
    if (status) updates.status = status;

    const updated = SosRequests.findByIdAndUpdate(req.params.id, updates);
    if (!updated) return res.status(404).json({ success: false, message: 'SOS request not found.' });

    res.json({ success: true, message: 'SOS request updated.', request: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating SOS request.' });
  }
});

export default router;
