/**
 * LifePulse - Modern Blood Donation & Emergency Matching Application
 * Full Client-Side Platform with Authentication, Geolocation, Profile Data Upload,
 * Interactive Leaflet Map, SOS Blood Requests, and Blood Compatibility Matching.
 */

// ==========================================================================
// 1. Initial State & Data Seeding
// ==========================================================================
const STORAGE_KEYS = {
  USERS: 'lifepulse_users',
  CURRENT_USER: 'lifepulse_current_user',
  REQUESTS: 'lifepulse_requests',
  DONORS: 'lifepulse_donors',
  CAMPS: 'lifepulse_camps'
};

const DEFAULT_USERS = [];

const DEFAULT_DONORS = [];

const DEFAULT_REQUESTS = [];


const BLOOD_COMPATIBILITY = {
  'A+': { canDonateTo: ['A+', 'AB+'], canReceiveFrom: ['A+', 'A-', 'O+', 'O-'] },
  'O+': { canDonateTo: ['O+', 'A+', 'B+', 'AB+'], canReceiveFrom: ['O+', 'O-'] },
  'B+': { canDonateTo: ['B+', 'AB+'], canReceiveFrom: ['B+', 'B-', 'O+', 'O-'] },
  'AB+': { canDonateTo: ['AB+'], canReceiveFrom: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  'A-': { canDonateTo: ['A+', 'A-', 'AB+', 'AB-'], canReceiveFrom: ['A-', 'O-'] },
  'O-': { canDonateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], canReceiveFrom: ['O-'] },
  'B-': { canDonateTo: ['B+', 'B-', 'AB+', 'AB-'], canReceiveFrom: ['B-', 'O-'] },
  'AB-': { canDonateTo: ['AB+', 'AB-'], canReceiveFrom: ['AB-', 'A-', 'B-', 'O-'] }
};

// ==========================================================================
// 2. Application State Controller
// ==========================================================================
class LifePulseApp {
  constructor() {
    this.map = null;
    this.markersGroup = null;
    this.initStorage();
    this.currentUser = this.loadCurrentUser();
    this.initDOM();
    this.bindEvents();
    this.renderAll();
    this.initMap();
    this.initCustomCursor();
    this.initAmbientCanvas();
  }

  initStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.DONORS)) {
      localStorage.setItem(STORAGE_KEYS.DONORS, JSON.stringify(DEFAULT_DONORS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.REQUESTS)) {
      localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(DEFAULT_REQUESTS));
    }
    // Start with clean visitor state (no default logged-in user)
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }

  getUsers() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
  }

  saveUsers(users) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  getDonors() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.DONORS)) || [];
  }

  saveDonors(donors) {
    localStorage.setItem(STORAGE_KEYS.DONORS, JSON.stringify(donors));
  }

  getRequests() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.REQUESTS)) || [];
  }

  saveRequests(reqs) {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(reqs));
  }

  loadCurrentUser() {
    const userStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return userStr ? JSON.parse(userStr) : null;
  }

  setCurrentUser(user) {
    this.currentUser = user;
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
    this.updateUserUI();
    this.renderDonors();
    this.updateMapMarkers();
  }

  // ==========================================================================
  // 3. DOM & UI Elements
  // ==========================================================================
  initDOM() {
    // Nav elements
    this.navbar = document.getElementById('navbar');
    this.authBtnNav = document.getElementById('authBtnNav');
    this.userBadgeNav = document.getElementById('userBadgeNav');
    this.navUserName = document.getElementById('navUserName');
    this.navUserGroup = document.getElementById('navUserGroup');
    this.navUserAvatar = document.getElementById('navUserAvatar');

    // Dashboard elements
    this.dashboardSection = document.getElementById('dashboardSection');
    this.dashAvatar = document.getElementById('dashAvatar');
    this.dashName = document.getElementById('dashName');
    this.dashBloodBadge = document.getElementById('dashBloodBadge');
    this.dashRoleBadge = document.getElementById('dashRoleBadge');
    this.dashLocation = document.getElementById('dashLocation');
    this.dashPhone = document.getElementById('dashPhone');
    this.dashEmail = document.getElementById('dashEmail');
    this.dashWeightAge = document.getElementById('dashWeightAge');
    this.dashLastDonated = document.getElementById('dashLastDonated');
    this.dashDonationsCount = document.getElementById('dashDonationsCount');
    this.dashEmergencyContact = document.getElementById('dashEmergencyContact');
    this.dashHemoglobin = document.getElementById('dashHemoglobin');
    this.dashAvailabilityToggle = document.getElementById('dashAvailabilityToggle');
    this.dashCardName = document.getElementById('dashCardName');
    this.dashCardBlood = document.getElementById('dashCardBlood');
    this.dashCardCity = document.getElementById('dashCardCity');
    this.dashCardAvatar = document.getElementById('dashCardAvatar');

    // Directory & Lists
    this.requestsList = document.getElementById('requestsList');
    this.donorsList = document.getElementById('donorsList');
    this.mapPinnedList = document.getElementById('mapPinnedList');

    // Search & Filter
    this.filterBloodGroup = document.getElementById('filterBloodGroup');
    this.filterCity = document.getElementById('filterCity');
    this.filterAvailability = document.getElementById('filterAvailability');
    this.filterCompatibility = document.getElementById('filterCompatibility');
    this.quickSearchBtn = document.getElementById('quickSearchBtn');

    // Modals
    this.authModal = document.getElementById('authModal');
    this.uploadDataModal = document.getElementById('uploadDataModal');
    this.sosModal = document.getElementById('sosModal');

    // Forms
    this.loginForm = document.getElementById('loginForm');
    this.registerForm = document.getElementById('registerForm');
    this.uploadDataForm = document.getElementById('uploadDataForm');
    this.sosForm = document.getElementById('sosForm');

    // Location & Geo Elements
    this.geoDetectBtn = document.getElementById('geoDetectBtn');
    this.geoStatusText = document.getElementById('geoStatusText');
    this.inputLat = document.getElementById('inputLat');
    this.inputLng = document.getElementById('inputLng');
    this.inputCity = document.getElementById('inputCity');
    this.inputArea = document.getElementById('inputArea');
    this.inputAddress = document.getElementById('inputAddress');
    this.inputHospital = document.getElementById('inputHospital');

    // Avatar Upload
    this.avatarFileInput = document.getElementById('avatarFileInput');
    this.avatarUploadBox = document.getElementById('avatarUploadBox');
    this.avatarPreviewImg = document.getElementById('avatarPreviewImg');
    this.avatarDataHidden = document.getElementById('avatarDataHidden');

    // Compatibility Calculator
    this.compatSelect = document.getElementById('compatSelect');
    this.compatGiveList = document.getElementById('compatGiveList');
    this.compatReceiveList = document.getElementById('compatReceiveList');

    // Eligibility form
    this.eligibilityForm = document.getElementById('eligibilityForm');
    this.eligibilityResult = document.getElementById('eligibilityResult');

    // Custom Cursor & Ambient Canvas
    this.cursorDot = document.getElementById('cursorDot');
    this.cursorRing = document.getElementById('cursorRing');
    this.cursorRippleContainer = document.getElementById('cursorRippleContainer');
    this.ambientCanvas = document.getElementById('ambientCanvas');
  }

  // ==========================================================================
  // 4. Event Listeners
  // ==========================================================================
  bindEvents() {
    // Window scroll for sticky glass nav
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        this.navbar.classList.add('scrolled');
      } else {
        this.navbar.classList.remove('scrolled');
      }
    });

    // Mobile nav toggle
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');
    if (mobileToggle && navMenu) {
      mobileToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
      });
    }

    // Auth Button in Nav
    if (this.authBtnNav) {
      this.authBtnNav.addEventListener('click', () => this.openModal(this.authModal));
    }

    // User Badge in Nav -> scrolls to dashboard or opens upload modal
    if (this.userBadgeNav) {
      this.userBadgeNav.addEventListener('click', () => {
        const dash = document.getElementById('dashboardSection');
        if (dash) {
          dash.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    // Modal close buttons
    document.querySelectorAll('.modal-close-btn, .modal-cancel-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal-overlay');
        if (modal) this.closeModal(modal);
      });
    });

    // Close modal on click outside
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeModal(modal);
      });
    });

    // Switch between Login and Register tabs in Auth modal
    const tabLogin = document.getElementById('tabLogin');
    const tabRegister = document.getElementById('tabRegister');
    if (tabLogin && tabRegister) {
      tabLogin.addEventListener('click', () => {
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        this.loginForm.style.display = 'block';
        this.registerForm.style.display = 'none';
      });
      tabRegister.addEventListener('click', () => {
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        this.loginForm.style.display = 'none';
        this.registerForm.style.display = 'block';
      });
    }

    // Demo Logins
    const btnDemoDonor = document.getElementById('btnDemoDonor');
    const btnDemoHospital = document.getElementById('btnDemoHospital');
    if (btnDemoDonor) {
      btnDemoDonor.addEventListener('click', () => {
        this.closeModal(this.authModal);
      });
    }
    if (btnDemoHospital) {
      btnDemoHospital.addEventListener('click', () => {
        this.closeModal(this.authModal);
      });
    }

    // Login Form Submit
    if (this.loginForm) {
      this.loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const pass = document.getElementById('loginPassword').value.trim();
        if (this.loginUser(email, pass)) {
          this.closeModal(this.authModal);
        }
      });
    }

    // Register Form Submit
    if (this.registerForm) {
      this.registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleRegister();
      });
    }

    // Logout Button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        this.setCurrentUser(null);
        this.showToast('Logged out successfully.', 'info');
      });
    }

    // Open Upload / Edit Data Modal Buttons
    const openUploadDataBtn = document.getElementById('openUploadDataBtn');
    const heroUploadBtn = document.getElementById('heroUploadBtn');
    if (openUploadDataBtn) {
      openUploadDataBtn.addEventListener('click', () => this.openUploadDataModal());
    }
    if (heroUploadBtn) {
      heroUploadBtn.addEventListener('click', () => {
        if (!this.currentUser) {
          this.openModal(this.authModal);
          this.showToast('Please login or create an account first to upload your donor data and location.', 'info');
        } else {
          this.openUploadDataModal();
        }
      });
    }

    // Upload & Save Profile Data Form Submit
    if (this.uploadDataForm) {
      this.uploadDataForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSaveProfileData();
      });
    }

    // Avatar File Picker
    if (this.avatarUploadBox && this.avatarFileInput) {
      this.avatarUploadBox.addEventListener('click', () => this.avatarFileInput.click());
      this.avatarFileInput.addEventListener('change', (e) => this.handleAvatarSelected(e));
    }

    // Geolocation Auto-Detect Button (HTML5 Geolocation API)
    if (this.geoDetectBtn) {
      this.geoDetectBtn.addEventListener('click', () => this.detectUserLocation());
    }

    // Availability switch in Dashboard
    if (this.dashAvailabilityToggle) {
      this.dashAvailabilityToggle.addEventListener('change', (e) => {
        if (this.currentUser) {
          this.currentUser.availableNow = e.target.checked;
          this.updateUserInDB(this.currentUser);
          this.syncUserToDonorList(this.currentUser);
          this.renderDonors();
          this.updateMapMarkers();
          this.showToast(`Status updated to: ${e.target.checked ? 'Available to donate' : 'Temporarily unavailable'}`, 'success');
        }
      });
    }

    // Open SOS Request Modal Buttons
    const openSosBtn = document.getElementById('openSosBtn');
    const heroSosBtn = document.getElementById('heroSosBtn');
    if (openSosBtn) {
      openSosBtn.addEventListener('click', () => this.openModal(this.sosModal));
    }
    if (heroSosBtn) {
      heroSosBtn.addEventListener('click', () => this.openModal(this.sosModal));
    }

    // SOS Form Submit
    if (this.sosForm) {
      this.sosForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleCreateSosRequest();
      });
    }

    // Filters & Search
    if (this.filterBloodGroup) {
      this.filterBloodGroup.addEventListener('change', () => this.renderDonors());
    }
    if (this.filterCity) {
      this.filterCity.addEventListener('input', () => this.renderDonors());
    }
    if (this.filterAvailability) {
      this.filterAvailability.addEventListener('change', () => this.renderDonors());
    }
    if (this.filterCompatibility) {
      this.filterCompatibility.addEventListener('change', () => this.renderDonors());
    }
    if (this.quickSearchBtn) {
      this.quickSearchBtn.addEventListener('click', () => {
        const bg = document.getElementById('quickBloodGroup').value;
        const city = document.getElementById('quickCity').value;
        if (this.filterBloodGroup) this.filterBloodGroup.value = bg;
        if (this.filterCity) this.filterCity.value = city;
        this.renderDonors();
        document.getElementById('donorsSection').scrollIntoView({ behavior: 'smooth' });
      });
    }

    // Quick blood chips click in Hero
    document.querySelectorAll('.blood-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const group = chip.dataset.group;
        if (group && this.filterBloodGroup) {
          this.filterBloodGroup.value = group;
          this.renderDonors();
          document.getElementById('donorsSection').scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    // Compatibility Calculator select
    if (this.compatSelect) {
      this.compatSelect.addEventListener('change', () => this.updateCompatibilityDisplay());
    }

    // Eligibility Form
    if (this.eligibilityForm) {
      this.eligibilityForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleCheckEligibility();
      });
    }
  }

  // ==========================================================================
  // 5. Authentication Engine
  // ==========================================================================
  loginUser(email, password) {
    const users = this.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      this.showToast('No account found with this email. Please register.', 'danger');
      return false;
    }
    if (user.password && user.password !== password) {
      this.showToast('Invalid password. Try "password123" for demo accounts.', 'danger');
      return false;
    }

    this.setCurrentUser(user);
    this.showToast(`Welcome back, ${user.name}! You can now update your data and location.`, 'success');
    return true;
  }

  handleRegister() {
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value.trim();
    const bloodGroup = document.getElementById('regBloodGroup').value;
    const role = document.getElementById('regRole').value;
    const phone = document.getElementById('regPhone').value.trim();
    const city = document.getElementById('regCity').value.trim();

    if (!name || !email || !password || !bloodGroup) {
      this.showToast('Please fill all required fields.', 'danger');
      return;
    }

    const users = this.getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      this.showToast('An account with this email already exists. Please sign in.', 'danger');
      return;
    }

    const newUser = {
      id: 'user_' + Date.now(),
      email,
      password,
      name,
      role,
      bloodGroup,
      age: 25,
      gender: 'Prefer not to say',
      weight: 65,
      phone: phone || '+1 555-0100',
      whatsapp: phone || '+1 555-0100',
      emergencyContact: 'Family (+1 555-0101)',
      city: city || 'New York',
      area: 'Central District',
      address: 'Downtown Avenue',
      lat: 40.7128 + (Math.random() - 0.5) * 0.08,
      lng: -74.0060 + (Math.random() - 0.5) * 0.08,
      nearestHospital: 'Metro General Hospital',
      lastDonationDate: '',
      totalDonations: 1,
      availableNow: true,
      hemoglobin: '14.0',
      notes: 'New member ready to save lives.',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`
    };

    users.push(newUser);
    this.saveUsers(users);

    // If role is donor, add to donors directory immediately
    if (role === 'donor') {
      this.syncUserToDonorList(newUser);
    }

    this.setCurrentUser(newUser);
    this.closeModal(this.authModal);
    this.showToast(`Account created! Welcome to LifePulse, ${name}!`, 'success');
  }

  updateUserInDB(user) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      users[index] = user;
    } else {
      users.push(user);
    }
    this.saveUsers(users);
  }

  syncUserToDonorList(user) {
    let donors = this.getDonors();
    const existingIndex = donors.findIndex(d => d.userId === user.id);

    const donorItem = {
      id: existingIndex !== -1 ? donors[existingIndex].id : 'donor_' + Date.now(),
      userId: user.id,
      name: user.name,
      bloodGroup: user.bloodGroup,
      city: user.city || 'Local Area',
      area: user.area || user.city,
      lat: parseFloat(user.lat) || 40.7128,
      lng: parseFloat(user.lng) || -74.0060,
      phone: user.phone,
      status: user.availableNow ? 'available' : 'unavailable',
      lastDonated: user.lastDonationDate ? user.lastDonationDate : 'Recently',
      donationsCount: user.totalDonations || 1,
      verified: true,
      avatar: user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.name)}`
    };

    if (existingIndex !== -1) {
      donors[existingIndex] = donorItem;
    } else {
      donors.unshift(donorItem);
    }
    this.saveDonors(donors);
  }

  // ==========================================================================
  // 6. User Profile & Data Upload Handler (Key Requirement!)
  // ==========================================================================
  openUploadDataModal() {
    if (!this.currentUser) {
      this.openModal(this.authModal);
      return;
    }

    const u = this.currentUser;
    // Populate form fields with current user data
    document.getElementById('inputName').value = u.name || '';
    document.getElementById('inputBloodGroup').value = u.bloodGroup || 'O+';
    document.getElementById('inputAge').value = u.age || 25;
    document.getElementById('inputGender').value = u.gender || 'Female';
    document.getElementById('inputWeight').value = u.weight || 60;
    document.getElementById('inputPhone').value = u.phone || '';
    document.getElementById('inputWhatsapp').value = u.whatsapp || u.phone || '';
    document.getElementById('inputEmergencyContact').value = u.emergencyContact || '';
    document.getElementById('inputHemoglobin').value = u.hemoglobin || '';
    document.getElementById('inputTotalDonations').value = u.totalDonations || 1;
    document.getElementById('inputLastDonated').value = u.lastDonationDate || '';
    document.getElementById('inputNotes').value = u.notes || '';
    document.getElementById('inputAvailable').checked = !!u.availableNow;

    // Location fields
    this.inputCity.value = u.city || '';
    this.inputArea.value = u.area || '';
    this.inputAddress.value = u.address || '';
    this.inputHospital.value = u.nearestHospital || '';
    this.inputLat.value = u.lat || '';
    this.inputLng.value = u.lng || '';

    // Avatar preview
    if (u.avatar) {
      this.avatarPreviewImg.src = u.avatar;
      this.avatarPreviewImg.style.display = 'block';
      this.avatarDataHidden.value = u.avatar;
    } else {
      this.avatarPreviewImg.style.display = 'none';
      this.avatarDataHidden.value = '';
    }

    this.geoStatusText.textContent = u.lat && u.lng 
      ? `Current coordinates: ${parseFloat(u.lat).toFixed(4)}, ${parseFloat(u.lng).toFixed(4)}`
      : 'Click to detect your current location via GPS';

    this.openModal(this.uploadDataModal);
  }

  handleAvatarSelected(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      this.showToast('Please select an image smaller than 4MB.', 'danger');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      this.avatarPreviewImg.src = dataUrl;
      this.avatarPreviewImg.style.display = 'block';
      this.avatarDataHidden.value = dataUrl;
      this.showToast('Photo selected! Click "Save & Upload Data" below to finalize.', 'info');
    };
    reader.readAsDataURL(file);
  }

  detectUserLocation() {
    if (!navigator.geolocation) {
      this.showToast('Geolocation is not supported by your browser.', 'danger');
      return;
    }

    this.geoStatusText.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Detecting your real-time coordinates...';

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        this.inputLat.value = lat.toFixed(6);
        this.inputLng.value = lng.toFixed(6);

        this.geoStatusText.innerHTML = `<i class="fas fa-check-circle" style="color:var(--success)"></i> Location captured: <b>${lat.toFixed(4)}, ${lng.toFixed(4)}</b>`;
        
        // If city is empty, fill a friendly name based on detected location
        if (!this.inputCity.value) {
          this.inputCity.value = 'My Current City';
        }
        if (!this.inputArea.value) {
          this.inputArea.value = 'Nearby Area';
        }

        this.showToast('GPS coordinates successfully captured and attached to your profile!', 'success');
      },
      (error) => {
        let errorMsg = 'Could not retrieve coordinates. ';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMsg += 'Permission denied by user. Enter city & area manually below.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg += 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMsg += 'Request timed out.';
            break;
          default:
            errorMsg += error.message;
        }
        this.geoStatusText.innerHTML = `<span style="color:#f87171">${errorMsg}</span>`;
        this.showToast(errorMsg, 'danger');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  handleSaveProfileData() {
    if (!this.currentUser) return;

    // Gather updated data
    const updated = {
      ...this.currentUser,
      name: document.getElementById('inputName').value.trim() || this.currentUser.name,
      bloodGroup: document.getElementById('inputBloodGroup').value,
      age: parseInt(document.getElementById('inputAge').value) || this.currentUser.age,
      gender: document.getElementById('inputGender').value,
      weight: parseFloat(document.getElementById('inputWeight').value) || this.currentUser.weight,
      phone: document.getElementById('inputPhone').value.trim(),
      whatsapp: document.getElementById('inputWhatsapp').value.trim(),
      emergencyContact: document.getElementById('inputEmergencyContact').value.trim(),
      hemoglobin: document.getElementById('inputHemoglobin').value.trim(),
      totalDonations: parseInt(document.getElementById('inputTotalDonations').value) || this.currentUser.totalDonations,
      lastDonationDate: document.getElementById('inputLastDonated').value,
      notes: document.getElementById('inputNotes').value.trim(),
      availableNow: document.getElementById('inputAvailable').checked,
      
      // Location data
      city: this.inputCity.value.trim() || 'New York',
      area: this.inputArea.value.trim() || 'Central',
      address: this.inputAddress.value.trim(),
      nearestHospital: this.inputHospital.value.trim(),
      lat: parseFloat(this.inputLat.value) || this.currentUser.lat || 40.7128,
      lng: parseFloat(this.inputLng.value) || this.currentUser.lng || -74.0060,

      // Avatar
      avatar: this.avatarDataHidden.value || this.currentUser.avatar
    };

    this.setCurrentUser(updated);
    this.updateUserInDB(updated);
    this.syncUserToDonorList(updated);

    this.closeModal(this.uploadDataModal);
    this.showToast('Profile data and location successfully uploaded & live on LifePulse!', 'success');

    // Pan map to user's updated location
    if (this.map && updated.lat && updated.lng) {
      this.map.flyTo([updated.lat, updated.lng], 13);
    }
  }

  // ==========================================================================
  // 7. Emergency SOS Requests Handler
  // ==========================================================================
  handleCreateSosRequest() {
    const patientName = document.getElementById('sosPatient').value.trim();
    const bloodGroup = document.getElementById('sosBloodGroup').value;
    const units = parseInt(document.getElementById('sosUnits').value) || 1;
    const hospital = document.getElementById('sosHospital').value.trim();
    const city = document.getElementById('sosCity').value.trim();
    const contactPerson = document.getElementById('sosContact').value.trim();
    const phone = document.getElementById('sosPhone').value.trim();
    const urgency = document.getElementById('sosUrgency').value;

    if (!patientName || !bloodGroup || !hospital || !phone) {
      this.showToast('Please fill all required SOS request fields.', 'danger');
      return;
    }

    const newReq = {
      id: 'req_' + Date.now(),
      patientName,
      bloodGroup,
      units,
      hospital,
      city: city || 'City Center',
      contactPerson: contactPerson || 'Family / Attendant',
      phone,
      urgency,
      requiredWithin: urgency === 'critical' ? 'Urgent: Next 2 Hours' : (urgency === 'urgent' ? 'Within 24 Hours' : 'Upcoming Surgery'),
      lat: 40.7300 + (Math.random() - 0.5) * 0.09,
      lng: -73.9800 + (Math.random() - 0.5) * 0.09,
      dateAdded: 'Just now',
      verified: true
    };

    const requests = this.getRequests();
    requests.unshift(newReq);
    this.saveRequests(requests);

    this.closeModal(this.sosModal);
    this.renderRequests();
    this.updateMapMarkers();
    this.sosForm.reset();

    this.showToast(`🚨 SOS Blood Request for ${bloodGroup} posted to all nearby donors!`, 'danger');

    // Scroll to requests
    document.getElementById('requestsSection').scrollIntoView({ behavior: 'smooth' });
  }

  // ==========================================================================
  // 8. Render Views (UI Updating)
  // ==========================================================================
  renderAll() {
    this.updateUserUI();
    this.renderRequests();
    this.renderDonors();
    this.updateCompatibilityDisplay();
  }

  updateUserUI() {
    const u = this.currentUser;
    if (u) {
      // Navbar logged-in state
      if (this.authBtnNav) this.authBtnNav.style.display = 'none';
      if (this.userBadgeNav) {
        this.userBadgeNav.style.display = 'flex';
        this.navUserName.textContent = u.name.split(' ')[0];
        this.navUserGroup.textContent = u.bloodGroup;
        if (u.avatar) {
          this.navUserAvatar.innerHTML = `<img src="${u.avatar}" alt="${u.name}">`;
        } else {
          this.navUserAvatar.textContent = u.name.charAt(0);
        }
      }

      // Show Dashboard Section
      if (this.dashboardSection) {
        this.dashboardSection.style.display = 'block';
        this.dashName.textContent = u.name;
        this.dashBloodBadge.textContent = u.bloodGroup;
        this.dashRoleBadge.textContent = u.role.toUpperCase();
        this.dashLocation.innerHTML = `<i class="fas fa-map-marker-alt" style="color:var(--primary)"></i> ${u.city || 'Location not set'}${u.area ? ' (' + u.area + ')' : ''}`;
        this.dashPhone.textContent = u.phone || 'Not provided';
        this.dashEmail.textContent = u.email;
        this.dashWeightAge.textContent = `${u.age || 25} yrs • ${u.weight || 60} kg • ${u.gender || 'Unspecified'}`;
        this.dashLastDonated.textContent = u.lastDonationDate || 'Not recorded';
        this.dashDonationsCount.textContent = `${u.totalDonations || 0} times (Approx ${((u.totalDonations || 0) * 3)} lives saved)`;
        this.dashEmergencyContact.textContent = u.emergencyContact || 'None listed';
        this.dashHemoglobin.textContent = u.hemoglobin ? `${u.hemoglobin} g/dL` : 'Normal range';
        this.dashAvailabilityToggle.checked = !!u.availableNow;

        // Card Preview
        this.dashCardName.textContent = u.name;
        this.dashCardBlood.textContent = u.bloodGroup;
        this.dashCardCity.textContent = `${u.city || 'New York'}, ID: LP-${u.id.slice(-4)}`;
        if (u.avatar) {
          this.dashAvatar.innerHTML = `<img src="${u.avatar}" alt="${u.name}">`;
          this.dashCardAvatar.src = u.avatar;
        } else {
          this.dashAvatar.textContent = u.name.charAt(0);
          this.dashCardAvatar.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(u.name)}`;
        }
      }
    } else {
      // Logged out state
      if (this.authBtnNav) this.authBtnNav.style.display = 'inline-flex';
      if (this.userBadgeNav) this.userBadgeNav.style.display = 'none';
      if (this.dashboardSection) this.dashboardSection.style.display = 'none';
    }
  }

  renderRequests() {
    const requests = this.getRequests();
    if (!this.requestsList) return;

    if (requests.length === 0) {
      this.requestsList.innerHTML = `
        <div style="grid-column: 1/-1; text-align:center; padding: 40px; color: var(--text-muted);">
          <i class="fas fa-check-circle" style="font-size: 2.5rem; color: var(--success); margin-bottom: 12px;"></i>
          <p>No urgent blood requests at the moment. All hospital banks are currently supplied.</p>
        </div>
      `;
      return;
    }

    this.requestsList.innerHTML = requests.map(req => `
      <div class="request-card ${req.urgency === 'critical' ? 'urgent' : ''}">
        <div>
          <div class="request-header">
            <div class="request-blood-badge">${req.bloodGroup}</div>
            <span class="request-urgency-tag urgency-${req.urgency}">${req.urgency}</span>
          </div>
          <div class="request-patient-info">
            <h4>${req.patientName} (${req.units} Unit${req.units > 1 ? 's' : ''})</h4>
            <div class="request-hospital-info">
              <span><i class="fas fa-hospital"></i> ${req.hospital}</span>
              <span><i class="fas fa-map-marker-alt"></i> ${req.city}</span>
              <span><i class="fas fa-clock"></i> ${req.requiredWithin}</span>
              <span><i class="fas fa-user"></i> Contact: ${req.contactPerson}</span>
            </div>
          </div>
        </div>
        <div class="request-footer">
          <a href="tel:${req.phone}" class="btn btn-primary btn-sm">
            <i class="fas fa-phone-alt"></i> Call Now
          </a>
          <a href="https://wa.me/${req.phone.replace(/[^0-9]/g, '')}?text=Hello,%20I%20am%20responding%20to%20the%20urgent%20blood%20request%20for%20${encodeURIComponent(req.patientName)}" 
             target="_blank" class="btn btn-secondary btn-sm">
            <i class="fab fa-whatsapp"></i> WhatsApp
          </a>
        </div>
      </div>
    `).join('');
  }

  renderDonors() {
    const donors = this.getDonors();
    if (!this.donorsList) return;

    const groupFilter = this.filterBloodGroup ? this.filterBloodGroup.value : '';
    const cityFilter = this.filterCity ? this.filterCity.value.toLowerCase().trim() : '';
    const availFilter = this.filterAvailability ? this.filterAvailability.value : '';
    const compatFilter = this.filterCompatibility ? this.filterCompatibility.value : '';

    let filtered = donors.filter(d => {
      // Blood Group filter
      if (groupFilter && d.bloodGroup !== groupFilter) return false;
      // City search
      if (cityFilter && !d.city.toLowerCase().includes(cityFilter) && !d.area.toLowerCase().includes(cityFilter) && !d.name.toLowerCase().includes(cityFilter)) {
        return false;
      }
      // Availability filter
      if (availFilter && d.status !== availFilter) return false;
      // Can donate to my recipient group
      if (compatFilter) {
        const canReceive = BLOOD_COMPATIBILITY[compatFilter]?.canReceiveFrom || [];
        if (!canReceive.includes(d.bloodGroup)) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      this.donorsList.innerHTML = `
        <div style="grid-column: 1/-1; text-align:center; padding: 48px; background: var(--bg-card); border-radius: var(--radius-xl); border: 1px solid var(--border-subtle);">
          <i class="fas fa-search" style="font-size: 2.4rem; color: var(--text-subtle); margin-bottom: 14px;"></i>
          <h4 style="font-size: 1.2rem; margin-bottom: 6px;">No donors match your criteria</h4>
          <p style="color: var(--text-muted); font-size: 0.9rem;">Try selecting "All Blood Groups" or broadening your city search.</p>
        </div>
      `;
      return;
    }

    this.donorsList.innerHTML = filtered.map(d => `
      <div class="donor-card">
        <div>
          <div class="donor-top">
            <div class="donor-avatar-wrap">
              <div class="donor-avatar">
                ${d.avatar ? `<img src="${d.avatar}" alt="${d.name}">` : d.name.charAt(0)}
              </div>
              <div class="donor-status-dot status-${d.status}"></div>
            </div>
            <div class="donor-meta">
              <h4>${d.name} ${d.verified ? '<i class="fas fa-check-circle" style="color:var(--info); font-size: 0.85rem;" title="Verified Donor"></i>' : ''}</h4>
              <div class="donor-location">
                <i class="fas fa-map-marker-alt"></i> ${d.city} (${d.area})
              </div>
            </div>
            <div class="donor-blood-tag">${d.bloodGroup}</div>
          </div>
          <div class="donor-stats-pills">
            <span class="donor-pill"><i class="fas fa-tint" style="color:var(--primary)"></i> ${d.donationsCount} donations</span>
            <span class="donor-pill"><i class="fas fa-calendar-alt"></i> Last: ${d.lastDonated}</span>
            <span class="donor-pill"><i class="fas fa-circle" style="color:${d.status === 'available' ? 'var(--success)' : 'var(--warning)'}; font-size: 0.6rem;"></i> ${d.status === 'available' ? 'Available Now' : 'Recently Donated'}</span>
          </div>
        </div>
        <div class="donor-actions">
          <a href="tel:${d.phone}" class="btn btn-outline-danger btn-sm">
            <i class="fas fa-phone-alt"></i> Call
          </a>
          <a href="https://wa.me/${d.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(d.name)},%20I%20saw%20your%20profile%20on%20LifePulse%20and%20am%20seeking%20blood%20donation." 
             target="_blank" class="btn btn-secondary btn-sm">
            <i class="fab fa-whatsapp"></i> Chat
          </a>
        </div>
      </div>
    `).join('');
  }

  // ==========================================================================
  // 9. Interactive Leaflet Map Integration
  // ==========================================================================
  initMap() {
    const mapContainer = document.getElementById('leafletMap');
    if (!mapContainer || typeof L === 'undefined') return;

    // Default center on NYC coordinates or user coordinates
    const defaultLat = this.currentUser && this.currentUser.lat ? this.currentUser.lat : 40.730610;
    const defaultLng = this.currentUser && this.currentUser.lng ? this.currentUser.lng : -73.935242;

    this.map = L.map('leafletMap', {
      zoomControl: true,
      scrollWheelZoom: false
    }).setView([defaultLat, defaultLng], 12);

    // Dark Tile Layer (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(this.map);

    this.markersGroup = L.layerGroup().addTo(this.map);
    this.updateMapMarkers();
  }

  updateMapMarkers() {
    if (!this.map || !this.markersGroup) return;

    this.markersGroup.clearLayers();
    const donors = this.getDonors();
    const requests = this.getRequests();

    if (this.mapPinnedList) {
      this.mapPinnedList.innerHTML = '';
    }

    // Add Donor Markers
    donors.forEach(donor => {
      if (!donor.lat || !donor.lng) return;

      const donorIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="
            background: linear-gradient(135deg, #10b981, #059669);
            width: 32px; height: 32px; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            color: #fff; font-weight: 800; font-size: 0.78rem;
            border: 2px solid #fff; box-shadow: 0 4px 12px rgba(16,185,129,0.5);
          ">
            ${donor.bloodGroup}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([donor.lat, donor.lng], { icon: donorIcon }).addTo(this.markersGroup);
      
      marker.bindPopup(`
        <div class="popup-inner">
          <span style="font-size:0.7rem; font-weight:700; color:var(--success); text-transform:uppercase;">Registered Donor</span>
          <h4>${donor.name} (${donor.bloodGroup})</h4>
          <p><i class="fas fa-map-marker-alt"></i> ${donor.city} • ${donor.area}</p>
          <p><i class="fas fa-tint"></i> ${donor.donationsCount} donations • ${donor.status === 'available' ? 'Available' : 'Busy'}</p>
          <a href="tel:${donor.phone}" class="btn btn-primary btn-sm" style="margin-top:6px; width:100%;"><i class="fas fa-phone-alt"></i> Contact Donor</a>
        </div>
      `);

      // Add to sidebar list
      if (this.mapPinnedList) {
        const item = document.createElement('div');
        item.className = 'map-list-item';
        item.innerHTML = `
          <div class="map-list-title">
            <span>${donor.name}</span>
            <span style="color:var(--success); font-weight:800;">${donor.bloodGroup}</span>
          </div>
          <div class="map-list-subtitle">${donor.city} (${donor.area})</div>
        `;
        item.addEventListener('click', () => {
          this.map.flyTo([donor.lat, donor.lng], 14);
          marker.openPopup();
        });
        this.mapPinnedList.appendChild(item);
      }
    });

    // Add Emergency SOS Request Markers (Red pulsing icon)
    requests.forEach(req => {
      if (!req.lat || !req.lng) return;

      const sosIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="
            background: linear-gradient(135deg, #ef4444, #991b1b);
            width: 38px; height: 38px; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            color: #fff; font-weight: 800; font-size: 0.82rem;
            border: 2px solid #fff; box-shadow: 0 0 20px rgba(239,68,68,0.8);
            animation: pulse-sos 1.8s infinite;
          ">
            SOS
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19]
      });

      const marker = L.marker([req.lat, req.lng], { icon: sosIcon }).addTo(this.markersGroup);

      marker.bindPopup(`
        <div class="popup-inner">
          <span style="font-size:0.72rem; font-weight:800; color:var(--primary); text-transform:uppercase;">🚨 Urgent Blood Request</span>
          <h4>${req.patientName} (${req.bloodGroup} • ${req.units} Units)</h4>
          <p><i class="fas fa-hospital"></i> ${req.hospital}</p>
          <p><i class="fas fa-clock"></i> ${req.requiredWithin}</p>
          <a href="tel:${req.phone}" class="btn btn-primary btn-sm" style="margin-top:6px; width:100%;"><i class="fas fa-phone-alt"></i> Respond to SOS</a>
        </div>
      `);

      // Add to sidebar list top
      if (this.mapPinnedList) {
        const item = document.createElement('div');
        item.className = 'map-list-item';
        item.style.borderColor = 'rgba(239, 68, 68, 0.4)';
        item.innerHTML = `
          <div class="map-list-title">
            <span style="color:#fca5a5;">🚨 SOS: ${req.patientName}</span>
            <span style="color:var(--primary); font-weight:800;">${req.bloodGroup}</span>
          </div>
          <div class="map-list-subtitle">${req.hospital}</div>
        `;
        item.addEventListener('click', () => {
          this.map.flyTo([req.lat, req.lng], 14);
          marker.openPopup();
        });
        this.mapPinnedList.prepend(item);
      }
    });
  }

  // ==========================================================================
  // 10. Compatibility Calculator
  // ==========================================================================
  updateCompatibilityDisplay() {
    if (!this.compatSelect || !this.compatGiveList || !this.compatReceiveList) return;
    const selected = this.compatSelect.value;
    const data = BLOOD_COMPATIBILITY[selected] || BLOOD_COMPATIBILITY['O+'];

    this.compatGiveList.innerHTML = data.canDonateTo.map(type => `
      <span class="blood-chip" style="background:var(--primary-subtle); border-color:var(--primary-border); color:#fca5a5; font-weight:800;">
        ${type}
      </span>
    `).join('');

    this.compatReceiveList.innerHTML = data.canReceiveFrom.map(type => `
      <span class="blood-chip" style="background:rgba(16, 185, 129, 0.12); border-color:rgba(16, 185, 129, 0.3); color:#6ee7b7; font-weight:800;">
        ${type}
      </span>
    `).join('');
  }

  // ==========================================================================
  // 11. Eligibility Quiz Handler
  // ==========================================================================
  handleCheckEligibility() {
    const ageChecked = document.getElementById('qAge').checked;
    const weightChecked = document.getElementById('qWeight').checked;
    const healthChecked = document.getElementById('qHealth').checked;
    const intervalChecked = document.getElementById('qInterval').checked;
    const travelChecked = document.getElementById('qTravel').checked;

    const isEligible = ageChecked && weightChecked && healthChecked && intervalChecked && travelChecked;

    if (this.eligibilityResult) {
      this.eligibilityResult.style.display = 'block';
      if (isEligible) {
        this.eligibilityResult.innerHTML = `
          <div style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); padding: 18px; border-radius: var(--radius-md); text-align: center;">
            <i class="fas fa-check-circle" style="font-size: 2.2rem; color: var(--success); margin-bottom: 8px;"></i>
            <h4 style="color: #6ee7b7; font-size: 1.15rem; margin-bottom: 4px;">You Are Eligible to Donate Blood!</h4>
            <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 12px;">Thank you for your willingness to save lives. Upload your data and register as an active donor today!</p>
            <button type="button" class="btn btn-primary btn-sm" onclick="app.openUploadDataModal()">Register as Active Donor</button>
          </div>
        `;
      } else {
        this.eligibilityResult.innerHTML = `
          <div style="background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); padding: 18px; border-radius: var(--radius-md); text-align: center;">
            <i class="fas fa-exclamation-triangle" style="font-size: 2.2rem; color: var(--warning); margin-bottom: 8px;"></i>
            <h4 style="color: #fcd34d; font-size: 1.15rem; margin-bottom: 4px;">Temporary Deferral Detected</h4>
            <p style="font-size: 0.88rem; color: var(--text-muted);">One or more criteria were not met (e.g. interval between donations or health conditions). Please consult a donation counselor before scheduling.</p>
          </div>
        `;
      }
    }
  }

  // ==========================================================================
  // 12. Modal & Toast Utilities
  // ==========================================================================
  openModal(modal) {
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  closeModal(modal) {
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconClass = 'fa-info-circle';
    if (type === 'success') iconClass = 'fa-check-circle';
    if (type === 'danger') iconClass = 'fa-exclamation-circle';

    toast.innerHTML = `
      <i class="fas ${iconClass} toast-icon"></i>
      <div style="flex:1;">${message}</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // ==========================================================================
  // 13. Bespoke Luxury Interactive Cursor System
  // ==========================================================================
  initCustomCursor() {
    if (!this.cursorDot || !this.cursorRing) return;

    // Check if device supports hover/fine pointer
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let isVisible = false;

    // Immediate tracking for dot, smooth lerp for ring
    const render = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;

      this.cursorRing.style.left = `${ringX}px`;
      this.cursorRing.style.top = `${ringY}px`;

      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      this.cursorDot.style.left = `${mouseX}px`;
      this.cursorDot.style.top = `${mouseY}px`;

      if (!isVisible) {
        isVisible = true;
        this.cursorDot.classList.remove('cursor-hidden');
        this.cursorRing.classList.remove('cursor-hidden');
      }
    });

    document.addEventListener('mouseleave', () => {
      isVisible = false;
      this.cursorDot.classList.add('cursor-hidden');
      this.cursorRing.classList.add('cursor-hidden');
    });

    document.addEventListener('mouseenter', () => {
      isVisible = true;
      this.cursorDot.classList.remove('cursor-hidden');
      this.cursorRing.classList.remove('cursor-hidden');
    });

    // Hover detection on interactive elements
    document.addEventListener('mouseover', (e) => {
      const target = e.target;
      const isInput = target.closest('input[type="text"], input[type="email"], input[type="password"], input[type="number"], input[type="tel"], textarea');
      const isClickable = target.closest('a, button, select, .btn, .blood-chip, .user-profile-badge, .map-list-item, .card, .donor-card, .request-card, .switch, label, .modal-close-btn, .file-upload-box');

      if (isInput) {
        this.cursorRing.classList.add('cursor-text');
        this.cursorDot.classList.add('cursor-hover');
      } else if (isClickable) {
        this.cursorRing.classList.add('cursor-hover');
        this.cursorDot.classList.add('cursor-hover');
      }
    });

    document.addEventListener('mouseout', (e) => {
      const target = e.target;
      const isInput = target.closest('input, textarea');
      const isClickable = target.closest('a, button, select, .btn, .blood-chip, .user-profile-badge, .map-list-item, .card, .donor-card, .request-card, .switch, label, .modal-close-btn, .file-upload-box');

      if (isInput || isClickable) {
        this.cursorRing.classList.remove('cursor-hover', 'cursor-text');
        this.cursorDot.classList.remove('cursor-hover');
      }
    });

    // Micro blood-drop click ripple effect
    window.addEventListener('mousedown', (e) => {
      if (!this.cursorRippleContainer) return;
      const ripple = document.createElement('div');
      ripple.className = 'cursor-ripple';
      ripple.style.left = `${e.clientX}px`;
      ripple.style.top = `${e.clientY}px`;
      this.cursorRippleContainer.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  }

  // ==========================================================================
  // 14. Luxury Ambient Floating Plasma Particles
  // ==========================================================================
  initAmbientCanvas() {
    const canvas = this.ambientCanvas;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const count = Math.min(24, Math.floor(window.innerWidth / 50));
    const colors = [
      'rgba(239, 68, 68, ',
      'rgba(244, 63, 94, ',
      'rgba(185, 28, 28, '
    ];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 28 + 12,
        color: colors[Math.floor(Math.random() * colors.length)],
        baseAlpha: Math.random() * 0.12 + 0.04,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        angle: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.01 + 0.005
      });
    }

    let mouseX = width / 2;
    let mouseY = height / 2;
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.angle += p.speed;
        p.x += p.vx + Math.cos(p.angle) * 0.2;
        p.y += p.vy + Math.sin(p.angle) * 0.2;

        // Subtle interactive deflection from cursor
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140 && dist > 0) {
          p.x += (dx / dist) * 0.8;
          p.y += (dy / dist) * 0.8;
        }

        // Screen boundary wrap
        if (p.x < -p.radius) p.x = width + p.radius;
        if (p.x > width + p.radius) p.x = -p.radius;
        if (p.y < -p.radius) p.y = height + p.radius;
        if (p.y > height + p.radius) p.y = -p.radius;

        // Radial glow drawing
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        grad.addColorStop(0, `${p.color}${p.baseAlpha})`);
        grad.addColorStop(0.7, `${p.color}${p.baseAlpha * 0.4})`);
        grad.addColorStop(1, `${p.color}0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }
}

// Global initialization
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new LifePulseApp();
});
