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

// @route   DELETE /api/admin/sos/:id
// @desc    Permanently delete an SOS request
// @access  Admin Only
router.delete('/sos/:id', (req, res) => {
  try {
    const deleted = SosRequests.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'SOS Request not found.' });
    }
    res.json({
      success: true,
      message: 'Emergency request deleted permanently.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting SOS request.' });
  }
});

export default router;
