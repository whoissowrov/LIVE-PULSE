# LIVE-PULSE 🩸
> Modern Emergency Blood Donation & Real-Time Donor Matching Platform

LifePulse is a decentralized blood donation network application built with **React**, **Vite**, **Leaflet Maps**, and luxury aesthetics. It empowers donors to register, upload their health data and live geolocation coordinates, discover nearby compatible donors, and broadcast urgent emergency SOS blood requests.

---

## 🌟 Key Features

1. **User Authentication & Profile Center**:
   - Register and login as Blood Donor or Patient / Hospital Coordinator.
   - Profile management with blood group, vitals, medical history, and verified digital donor ID card.
   - Real-time availability toggle switch (*Available to Donate* vs *Recently Donated*).

2. **Upload Health Data & Geolocation Tracking**:
   - Upload personal data, contact information, profile/ID photo, and last donation history.
   - **Automatic GPS Location Capture**: Integrated with HTML5 Geolocation API (`navigator.geolocation`) to record live coordinates.
   - Manual address, city, neighborhood, and nearest hospital inputs.

3. **Emergency SOS Requests**:
   - Broadcast urgent blood requests with urgency levels (*Critical - Next 2 Hours*, *Urgent - 24 Hours*, or *Standard*).
   - 1-click **Call** and **WhatsApp** direct contact buttons.

4. **Interactive Radar Map (Leaflet.js)**:
   - Live dark-mode map plotting active donors, emergency SOS patient locations, and blood banks.
   - Pinned location sidebar with click-to-fly map animation.

5. **Bespoke Interactive Custom Cursor**:
   - Dual-layer glowing crimson droplet core with smooth magnetic trailing ring.
   - Dynamic scaling on buttons, interactive cards, and input fields.
   - Micro blood droplet ripple pulse on click.
   - Ambient bioluminescent plasma particles floating in the background.

6. **Blood Compatibility Matrix & Eligibility Screening**:
   - Interactive compatibility calculator showing who can donate to whom.
   - 1-minute donor health eligibility checklist.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite
- **Styling**: Vanilla CSS, Glassmorphism & Custom Properties
- **Mapping**: Leaflet.js
- **Icons**: Lucide React
- **Storage**: Browser LocalStorage persistence

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/whoissowrov/LIVE-PULSE.git
cd LIVE-PULSE
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run development server
```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

### 4. Build for production
```bash
npm run build
```

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
