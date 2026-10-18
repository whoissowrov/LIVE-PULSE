import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Users } from '../config/db.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'lifepulse_super_secret_jwt_key_2026_blood_save_lives';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '30d';

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

// @route   POST /api/auth/register
// @desc    Register a new user / donor
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, bloodGroup, city, area, address, isDonor } = req.body;

    if (!name || !email || !password || !bloodGroup) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password, and blood group.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = Users.findOne(u => u.email.toLowerCase() === cleanEmail);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = Users.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      phone: phone || '',
      bloodGroup: bloodGroup.toUpperCase(),
      role: 'user', // default role
      isDonor: isDonor !== undefined ? Boolean(isDonor) : true,
      isVerifiedDonor: false,
      isAvailable: true,
      lastDonationDate: null,
      totalDonations: 0,
      avatarUrl: '',
      location: {
        city: city || 'Dhaka',
        area: area || '',
        address: address || '',
        hospital: '',
        lat: 23.8103, // Default center
        lng: 90.4125
      },
      medicalInfo: {
        weight: null,
        age: null,
        hbLevel: null,
        allergies: '',
        notes: ''
      }
    });

    const token = generateToken(newUser.id, newUser.role);
    const { password: _, ...safeUser } = newUser;

    res.status(201).json({
      success: true,
      message: 'Account registered successfully!',
      token,
      user: safeUser
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user / admin
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = Users.findOne(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: 'This account has been suspended by an administrator.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Update last login timestamp
    Users.findByIdAndUpdate(user.id, { lastLoginAt: new Date().toISOString() });

    const token = generateToken(user.id, user.role);
    const { password: _, ...safeUser } = user;

    res.json({
      success: true,
      message: user.role === 'admin' ? 'Welcome back, Administrator!' : 'Login successful!',
      token,
      user: safeUser
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// @route   GET /api/auth/me
// @desc    Get currently logged in user profile
// @access  Private
router.get('/me', protect, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

export default router;
