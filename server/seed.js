import bcrypt from 'bcryptjs';
import { readDb, writeDb } from './config/db.js';

export const seedDatabase = async () => {
  const db = readDb();

  // Check if admin already exists
  const hasAdmin = db.users && db.users.some(u => u.role === 'admin');

  if (hasAdmin) {
    return;
  }

  console.log('🌱 Initializing LifePulse Database with default Admin...');

  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('admin123', salt);

  const adminUser = {
    id: 'admin_primary_01',
    name: 'System Administrator',
    email: 'admin@lifepulse.org',
    password: adminPassword,
    phone: '+880 1711-000000',
    bloodGroup: 'O+',
    role: 'admin',
    isDonor: false,
    isVerifiedDonor: true,
    isAvailable: false,
    totalDonations: 0,
    location: {
      city: 'Dhaka',
      area: 'Dhanmondi',
      address: 'LifePulse Headquarters, Road 27',
      hospital: 'Central Hospital',
      lat: 23.7461,
      lng: 90.3742
    },
    createdAt: new Date().toISOString()
  };

  db.users = [adminUser];
  if (!db.sosRequests) db.sosRequests = [];
  if (!db.donationHistory) db.donationHistory = [];
  if (!db.notifications) db.notifications = [];
  writeDb(db);
  console.log('✅ LifePulse database initialized successfully!');
  console.log('👑 Admin Account: admin@lifepulse.org | Password: admin123');
};

if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase().then(() => process.exit(0));
}
