import express from 'express';
import { Users, LoginActivity } from '../config/db.js';

const router = express.Router();

// Helper: Haversine distance in KM
const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

// @route   GET /api/donors
// @desc    Search and filter public donors (with proximity sorting)
// @access  Public
router.get('/', (req, res) => {
  try {
    const { bloodGroup, city, availableOnly, search, lat, lng, radiusKm } = req.query;

    let donors = Users.find(u => u.isDonor && !u.isBanned);

    // Filter by blood group
    if (bloodGroup && bloodGroup !== 'ALL') {
      const targetGroup = bloodGroup.toUpperCase();
      donors = donors.filter(d => d.bloodGroup === targetGroup);
    }

    // Filter by city
    if (city && city !== 'ALL') {
      const targetCity = city.toLowerCase();
      donors = donors.filter(d => (d.location?.city || '').toLowerCase() === targetCity);
    }

    // Filter by availability
    if (availableOnly === 'true' || availableOnly === true) {
      donors = donors.filter(d => d.isAvailable !== false);
    }

    // Filter by search keyword (name, area, city)
    if (search) {
      const q = search.toLowerCase();
      donors = donors.filter(d =>
        d.name.toLowerCase().includes(q) ||
        (d.location?.city || '').toLowerCase().includes(q) ||
        (d.location?.area || '').toLowerCase().includes(q) ||
        (d.location?.hospital || '').toLowerCase().includes(q)
      );
    }

    // Proximity calculation if coordinates provided
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);

      donors = donors.map(d => {
        const donorLat = d.location?.lat;
        const donorLng = d.location?.lng;
        let distanceKm = null;
        if (donorLat && donorLng) {
          distanceKm = calculateDistanceKm(userLat, userLng, donorLat, donorLng);
        }
        return { ...d, distanceKm };
      });

      // Filter by radius if provided
      if (radiusKm) {
        const maxDist = parseFloat(radiusKm);
        donors = donors.filter(d => d.distanceKm !== null && d.distanceKm <= maxDist);
      }

      // Sort nearest first
      donors.sort((a, b) => {
        if (a.distanceKm === null) return 1;
        if (b.distanceKm === null) return -1;
        return a.distanceKm - b.distanceKm;
      });
    }

    // Sanitize output (remove sensitive password)
    const publicDonors = donors.map(({ password, ...donor }) => donor);

    res.json({
      success: true,
      count: publicDonors.length,
      donors: publicDonors
    });
  } catch (error) {
    console.error('Fetch donors error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving donors.' });
  }
});

// @route   GET /api/donors/regional-stats
// @desc    Get counts of registered donors and user logins categorized by district, upazila, and village
// @access  Public
router.get('/regional-stats', (req, res) => {
  try {
    const { district, upazila, division } = req.query;
    const allUsers = Users.find(u => !u.isBanned);
    const donors = allUsers.filter(u => u.isDonor);
    const loginLogs = (typeof LoginActivity?.find === 'function' ? LoginActivity.find() : []) || [];

    // Grouping by District
    const districtMap = {};
    let totalLogins = 0;

    donors.forEach(d => {
      const dist = d.district || d.location?.district || d.location?.city || 'Dhaka';
      const upz = d.upazila || d.location?.upazila || 'General Upazila';
      const vil = d.village || d.location?.village || d.union || d.location?.union || 'Central Area';
      const div = d.division || d.location?.division || 'Dhaka';
      const bg = d.bloodGroup || 'Unknown';
      const isAvailable = d.isAvailable !== false;
      const logins = Number(d.loginCount) || (d.lastLoginAt ? 1 : 0);
      totalLogins += logins;

      // 1. District level
      if (!districtMap[dist]) {
        districtMap[dist] = {
          district: dist,
          division: div,
          registeredDonors: 0,
          loggedInDonors: 0,
          totalLogins: 0,
          availableNow: 0,
          bloodGroups: { 'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0 },
          upazilas: {},
          lastLoginAt: d.lastLoginAt || d.updatedAt || null
        };
      }
      districtMap[dist].registeredDonors += 1;
      districtMap[dist].totalLogins += logins;
      if (d.lastLoginAt) districtMap[dist].loggedInDonors += 1;
      if (isAvailable) districtMap[dist].availableNow += 1;
      if (districtMap[dist].bloodGroups[bg] !== undefined) {
        districtMap[dist].bloodGroups[bg] += 1;
      }
      if (d.lastLoginAt && (!districtMap[dist].lastLoginAt || new Date(d.lastLoginAt) > new Date(districtMap[dist].lastLoginAt))) {
        districtMap[dist].lastLoginAt = d.lastLoginAt;
      }

      // 2. Upazila level inside District
      if (!districtMap[dist].upazilas[upz]) {
        districtMap[dist].upazilas[upz] = {
          upazila: upz,
          district: dist,
          division: div,
          registeredDonors: 0,
          loggedInDonors: 0,
          totalLogins: 0,
          availableNow: 0,
          bloodGroups: {},
          villages: {}
        };
      }
      const uRef = districtMap[dist].upazilas[upz];
      uRef.registeredDonors += 1;
      uRef.totalLogins += logins;
      if (d.lastLoginAt) uRef.loggedInDonors += 1;
      if (isAvailable) uRef.availableNow += 1;
      uRef.bloodGroups[bg] = (uRef.bloodGroups[bg] || 0) + 1;

      // 3. Village level inside Upazila
      if (!uRef.villages[vil]) {
        uRef.villages[vil] = {
          village: vil,
          upazila: upz,
          district: dist,
          registeredDonors: 0,
          availableNow: 0,
          bloodGroups: {},
          totalLogins: 0,
          lastActive: d.lastLoginAt || null
        };
      }
      const vRef = uRef.villages[vil];
      vRef.registeredDonors += 1;
      vRef.totalLogins += logins;
      if (isAvailable) vRef.availableNow += 1;
      vRef.bloodGroups[bg] = (vRef.bloodGroups[bg] || 0) + 1;
    });

    // Recent login activity stream
    const recentActivity = loginLogs.slice(0, 15).map(l => ({
      id: l.id,
      userName: l.userName ? `${l.userName.slice(0, 4)}***` : 'Donor',
      bloodGroup: l.bloodGroup,
      division: l.division,
      district: l.district,
      upazila: l.upazila,
      village: l.village,
      action: l.action || 'login',
      timestamp: l.timestamp || l.createdAt
    }));

    res.json({
      success: true,
      summary: {
        totalRegisteredDonors: donors.length,
        totalLoggedInDonors: donors.filter(d => d.lastLoginAt).length,
        totalLoginsRecorded: totalLogins,
        districtsCovered: Object.keys(districtMap).length,
        availableNowCount: donors.filter(d => d.isAvailable !== false).length
      },
      districts: Object.values(districtMap),
      recentActivity
    });
  } catch (error) {
    console.error('Regional stats error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving regional stats.' });
  }
});

// @route   GET /api/donors/:id
// @desc    Get donor profile details
// @access  Public
router.get('/:id', (req, res) => {
  try {
    const donor = Users.findById(req.params.id);

    if (!donor || !donor.isDonor || donor.isBanned) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found or inactive.'
      });
    }

    const { password, ...publicProfile } = donor;
    res.json({ success: true, donor: publicProfile });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching donor.' });
  }
});

export default router;
