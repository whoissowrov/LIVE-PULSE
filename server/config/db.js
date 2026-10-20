import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial DB Schema
const defaultData = {
  users: [],
  sosRequests: [],
  donationHistory: [],
  notifications: [],
  loginActivity: []
};

// Read database
export const readDb = () => {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
      return defaultData;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw || '{}');
  } catch (error) {
    console.error('Error reading database file:', error);
    return defaultData;
  }
};

// Write database atomically
export const writeDb = (data) => {
  try {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (error) {
    console.error('Error writing database file:', error);
    throw error;
  }
};

// Generic Collection helper
export const getCollection = (collectionName) => {
  return {
    find: (predicate = () => true) => {
      const db = readDb();
      const list = db[collectionName] || [];
      return list.filter(predicate);
    },
    findOne: (predicate) => {
      const db = readDb();
      const list = db[collectionName] || [];
      return list.find(predicate) || null;
    },
    findById: (id) => {
      const db = readDb();
      const list = db[collectionName] || [];
      return list.find(item => item.id === id || item._id === id) || null;
    },
    create: (record) => {
      const db = readDb();
      if (!db[collectionName]) db[collectionName] = [];
      const newRecord = {
        id: record.id || `lp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...record
      };
      db[collectionName].unshift(newRecord);
      writeDb(db);
      return newRecord;
    },
    findByIdAndUpdate: (id, updates) => {
      const db = readDb();
      const list = db[collectionName] || [];
      const index = list.findIndex(item => item.id === id || item._id === id);
      if (index === -1) return null;

      list[index] = {
        ...list[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      writeDb(db);
      return list[index];
    },
    findByIdAndDelete: (id) => {
      const db = readDb();
      const list = db[collectionName] || [];
      const index = list.findIndex(item => item.id === id || item._id === id);
      if (index === -1) return null;

      const deleted = list.splice(index, 1)[0];
      writeDb(db);
      return deleted;
    },
    count: (predicate = () => true) => {
      const db = readDb();
      const list = db[collectionName] || [];
      return list.filter(predicate).length;
    }
  };
};

export const Users = getCollection('users');
export const SosRequests = getCollection('sosRequests');
export const DonationHistory = getCollection('donationHistory');
export const Notifications = getCollection('notifications');
export const LoginActivity = getCollection('loginActivity');
export default { Users, SosRequests, DonationHistory, Notifications, LoginActivity };
