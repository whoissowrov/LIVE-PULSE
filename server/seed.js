import bcrypt from 'bcryptjs';
import { readDb, writeDb } from './config/db.js';

export const seedDatabase = async () => {
  const db = readDb();

  // Check if admin already exists
  const hasAdmin = db.users && db.users.some(u => u.role === 'admin');

  if (hasAdmin && db.users.length > 2) {
    return;
  }

  console.log('🌱 Seeding LifePulse Database with default Admin & Donors...');

  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('admin123', salt);
  const donorPassword = await bcrypt.hash('donor123', salt);

  const initialUsers = [
    {
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
    },
    {
      id: 'donor_01',
      name: 'Dr. Sarah Rahman',
      email: 'sarah.rahman@example.com',
      password: donorPassword,
      phone: '+880 1812-345678',
      bloodGroup: 'O+',
      role: 'user',
      isDonor: true,
      isVerifiedDonor: true,
      isAvailable: true,
      totalDonations: 6,
      lastDonationDate: '2026-08-14T00:00:00.000Z',
      location: {
        city: 'Dhaka',
        area: 'Gulshan-2',
        address: 'Road 84, House 12',
        hospital: 'United Hospital',
        lat: 23.7925,
        lng: 90.4078
      },
      medicalInfo: { weight: 64, age: 29, hbLevel: 13.5, allergies: 'None' },
      createdAt: new Date().toISOString()
    },
    {
      id: 'donor_02',
      name: 'Tanvir Hossain',
      email: 'tanvir.hossain@example.com',
      password: donorPassword,
      phone: '+880 1719-876543',
      bloodGroup: 'A+',
      role: 'user',
      isDonor: true,
      isVerifiedDonor: true,
      isAvailable: true,
      totalDonations: 4,
      lastDonationDate: '2026-07-20T00:00:00.000Z',
      location: {
        city: 'Dhaka',
        area: 'Dhanmondi',
        address: 'Road 9/A, House 45',
        hospital: 'Square Hospitals Ltd',
        lat: 23.7533,
        lng: 90.3789
      },
      medicalInfo: { weight: 72, age: 26, hbLevel: 14.2, allergies: 'None' },
      createdAt: new Date().toISOString()
    },
    {
      id: 'donor_03',
      name: 'Nusrat Jahan',
      email: 'nusrat.jahan@example.com',
      password: donorPassword,
      phone: '+880 1914-567890',
      bloodGroup: 'B+',
      role: 'user',
      isDonor: true,
      isVerifiedDonor: true,
      isAvailable: true,
      totalDonations: 3,
      lastDonationDate: '2026-09-02T00:00:00.000Z',
      location: {
        city: 'Dhaka',
        area: 'Banani',
        address: 'Block E, Road 11',
        hospital: 'Kurmitola General Hospital',
        lat: 23.7937,
        lng: 90.4043
      },
      medicalInfo: { weight: 58, age: 24, hbLevel: 12.8, allergies: 'Penicillin' },
      createdAt: new Date().toISOString()
    },
    {
      id: 'donor_04',
      name: 'Arif Chowdhury',
      email: 'arif.chowdhury@example.com',
      password: donorPassword,
      phone: '+880 1515-678901',
      bloodGroup: 'O-',
      role: 'user',
      isDonor: true,
      isVerifiedDonor: true,
      isAvailable: true,
      totalDonations: 8,
      lastDonationDate: '2026-06-11T00:00:00.000Z',
      location: {
        city: 'Dhaka',
        area: 'Uttara Sector 7',
        address: 'Road 3, House 19',
        hospital: 'Kuwait Bangladesh Friendship Govt Hospital',
        lat: 23.8682,
        lng: 90.3982
      },
      medicalInfo: { weight: 76, age: 33, hbLevel: 14.8, allergies: 'None' },
      createdAt: new Date().toISOString()
    },
    {
      id: 'donor_05',
      name: 'Fariha Akter',
      email: 'fariha.akter@example.com',
      password: donorPassword,
      phone: '+880 1612-456789',
      bloodGroup: 'AB+',
      role: 'user',
      isDonor: true,
      isVerifiedDonor: false,
      isAvailable: true,
      totalDonations: 1,
      lastDonationDate: '2026-05-18T00:00:00.000Z',
      location: {
        city: 'Chittagong',
        area: 'GEC Circle',
        address: 'CDA Avenue',
        hospital: 'Chittagong Medical College Hospital',
        lat: 22.3569,
        lng: 91.8215
      },
      medicalInfo: { weight: 55, age: 22, hbLevel: 13.0, allergies: 'None' },
      createdAt: new Date().toISOString()
    }
  ];

  const initialSos = [
    {
      id: 'sos_demo_01',
      patientName: 'Rahim Sheikh (Cardiology Emergency)',
      bloodGroup: 'O-',
      unitsNeeded: 2,
      hospital: 'National Heart Foundation Hospital',
      city: 'Dhaka',
      area: 'Mirpur-2',
      address: 'Plot 4, Road 2, Section 2',
      coordinates: { lat: 23.8041, lng: 90.3653 },
      contactPhone: '+880 1711-223344',
      contactWhatsapp: '+8801711223344',
      urgentLevel: 'critical',
      reason: 'Emergency Open Heart Surgery scheduled in 3 hours',
      status: 'active',
      pledgedUnits: 0,
      createdAt: new Date().toISOString()
    },
    {
      id: 'sos_demo_02',
      patientName: 'Amena Begum (Postpartum Hemorrhage)',
      bloodGroup: 'B+',
      unitsNeeded: 3,
      hospital: 'Dhaka Medical College Hospital',
      city: 'Dhaka',
      area: 'Bakshibazar',
      address: 'DMCH Ward 12, Gynae Emergency',
      coordinates: { lat: 23.7258, lng: 90.3976 },
      contactPhone: '+880 1819-998877',
      contactWhatsapp: '+8801819998877',
      urgentLevel: 'critical',
      reason: 'Urgent blood needed post-delivery complications',
      status: 'active',
      pledgedUnits: 1,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: 'sos_demo_03',
      patientName: 'Farhan Kabir (Thalassemia Routine)',
      bloodGroup: 'A+',
      unitsNeeded: 1,
      hospital: 'Bangladesh Thalassemia Samity Hospital',
      city: 'Dhaka',
      area: 'Green Road',
      address: '28/1 Green Road',
      coordinates: { lat: 23.7489, lng: 90.3842 },
      contactPhone: '+880 1611-334455',
      contactWhatsapp: '+8801611334455',
      urgentLevel: 'high',
      reason: 'Monthly transfusion for 9 year old patient',
      status: 'active',
      pledgedUnits: 0,
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
    }
  ];

  db.users = initialUsers;
  db.sosRequests = initialSos;
  writeDb(db);
  console.log('✅ LifePulse database seeded successfully!');
  console.log('👑 Admin Account: admin@lifepulse.org | Password: admin123');
};

if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase().then(() => process.exit(0));
}
