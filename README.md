# LIVE-PULSE 🩸
> Modern Emergency Blood Donation & Real-Time Donor Matching Platform (Frontend + Node.js/Express Backend)

LifePulse is a comprehensive blood donation network application built with **React**, **Vite**, **Node.js/Express**, **Leaflet Maps**, and luxury dark ruby aesthetics. It empowers donors to register, upload their health data and live geolocation coordinates, discover nearby compatible donors, and broadcast urgent emergency SOS blood requests — with a dedicated **Admin Management Console**.

---

## 🌟 Key Features

### 👤 User Features:
1. **User Authentication & Profiles**:
   - Register and login as Blood Donor or Patient / Hospital Coordinator.
   - Secure password hashing with `bcryptjs` and session authentication with JWT (`jsonwebtoken`).
   - Profile management with blood group, vitals, medical history, and verified digital donor ID card.
   - Real-time availability toggle switch (*Available to Donate* vs *Recently Donated*).

2. **Upload Health Data & Geolocation Tracking**:
   - Upload personal data, contact information, profile/ID photo, and last donation history.
   - **Automatic GPS Location Capture**: Integrated with HTML5 Geolocation API (`navigator.geolocation`) to record live coordinates.
   - Proximity search: find donors nearest to your GPS coordinates using Haversine distance calculations.

3. **Emergency SOS Requests**:
   - Broadcast urgent blood requests with urgency levels (*Critical - Next 2 Hours*, *Urgent - 24 Hours*, or *Standard*).
   - 1-click **Call** and **WhatsApp** direct contact buttons.

4. **Interactive Radar Map (Leaflet.js)**:
   - Live dark-mode map plotting active donors, emergency SOS patient locations, and blood banks.
   - Pinned location sidebar with click-to-fly map animation.

5. **Bespoke Interactive Custom Cursor & Aesthetics**:
   - Dual-layer glowing crimson droplet core with smooth magnetic trailing ring.
   - Ambient bioluminescent plasma particles floating in the background.

---

### 🛡️ Administrator Features:
1. **Admin Control Center**:
   - Live dashboard metrics: Total Registered Users, Total Donors, Verified Donors, Active SOS Requests, and Blood Group breakdown.
2. **User & Donor Management**:
   - Search and filter users by name, email, city, and blood group.
   - **1-Click Donor Verification**: Grant or revoke verified donor badges.
   - **Role Management**: Promote regular users to administrators or demote accounts.
   - **Moderation**: Suspend / ban accounts or permanently delete spam users.
3. **Emergency SOS Broadcast Control**:
   - Monitor all active and fulfilled blood requests across all hospitals and cities.
   - Mark emergency requests as resolved or remove them from the system.

---

## 👑 Default Admin Credentials

When the backend starts, it automatically provisions the root administrator:
- **Admin Email**: `admin@lifepulse.org`
- **Admin Password**: `admin123`
- **Role**: `admin`

*(You can also use the one-click **"🛡️ Admin"** button in the login modal).*

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Leaflet.js, Lucide Icons, Vanilla CSS Glassmorphism
- **Backend**: Node.js, Express.js, JWT, bcryptjs, CORS, Dotenv
- **Database**: Atomic JSON Persistence with automatic seeding (zero setup required, MongoDB ready via `.env`)

---

## 📡 REST API Endpoints

### 🔐 Auth Routes (`/api/auth`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user/donor | Public |
| `POST` | `/api/auth/login` | Login user or admin, receive JWT token | Public |
| `GET` | `/api/auth/me` | Fetch currently logged-in user profile | Authenticated |

### 👤 User Routes (`/api/users`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `PUT` | `/api/users/profile` | Update personal and medical details | Authenticated |
| `PUT` | `/api/users/location` | Upload GPS coordinates, city, area, hospital | Authenticated |
| `GET` | `/api/users/history` | Get past blood donations | Authenticated |
| `POST` | `/api/users/history` | Log a new blood donation | Authenticated |

### 🩸 Donor Directory (`/api/donors`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/donors` | Search donors by bloodGroup, city, and proximity (lat/lng) | Public |
| `GET` | `/api/donors/:id` | Get donor public profile | Public |

### 🚨 Emergency SOS (`/api/sos`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/sos` | Get active emergency blood requests | Public |
| `POST` | `/api/sos` | Broadcast new emergency blood request | Public / Auth |
| `PUT` | `/api/sos/:id/status`| Update status (`active`, `fulfilled`, `cancelled`) | Creator / Admin |

### 🛡️ Admin Routes (`/api/admin`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/admin/stats` | System overview stats & blood breakdown | **Admin Only** |
| `GET` | `/api/admin/users` | List, search, and paginate all users | **Admin Only** |
| `PUT` | `/api/admin/users/:id/verify` | Grant/revoke donor verification | **Admin Only** |
| `PUT` | `/api/admin/users/:id/role` | Change role (`user` / `admin`) | **Admin Only** |
| `PUT` | `/api/admin/users/:id/ban` | Suspend / activate account | **Admin Only** |
| `DELETE` | `/api/admin/users/:id` | Permanently delete user | **Admin Only** |
| `GET` | `/api/admin/sos` | List all emergency requests | **Admin Only** |
| `DELETE` | `/api/admin/sos/:id` | Delete emergency request | **Admin Only** |

---

## 🚀 Running the Project

### 1. Start the Backend API (Port 5000)
```bash
npm run server
```
*Backend runs on `http://localhost:5000` and creates `server/data/database.json`.*

### 2. Start the Frontend (Port 5173 or VS Code Live Server 5500)
```bash
npm run dev
```
*Or open with VS Code Live Server on `http://127.0.0.1:5500/index.html`.*

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
