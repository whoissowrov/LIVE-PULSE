import express from 'express';
import { Users } from '../config/db.js';

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
