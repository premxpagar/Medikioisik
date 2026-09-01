// Simulated Sync Engine using LocalStorage
// Allows real-time syncing between tabs without a real backend

window.SyncEngine = {
  getStore() {
    const defaultStore = {
      chats: [],
      prescriptions: [],
      patients: window.MOCK_DATA?.patients || []
    };
    const stored = localStorage.getItem('careforge_sync_store');
    return stored ? JSON.parse(stored) : defaultStore;
  },

  saveStore(data) {
    localStorage.setItem('careforge_sync_store', JSON.stringify(data));
    // Trigger custom event for same-tab updates
    window.dispatchEvent(new Event('careforge_sync_updated'));
  },

  addMessage(patientId, doctorName, sender, text) {
    const store = this.getStore();
    store.chats.push({
      id: Date.now(),
      patientId,
      doctorName,
      sender, // 'PATIENT' or 'DOCTOR'
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    this.saveStore(store);
  },

  getMessages(patientId) {
    const store = this.getStore();
    return store.chats.filter(c => c.patientId === patientId);
  },

  addPrescription(patientId, doctorName, medication, notes) {
    const store = this.getStore();
    store.prescriptions.push({
      id: Date.now(),
      patientId,
      doctorName,
      medication,
      notes,
      date: new Date().toLocaleDateString()
    });
    this.saveStore(store);
  },

  getPrescriptions(patientId) {
    const store = this.getStore();
    return store.prescriptions.filter(p => p.patientId === patientId);
  },

  addPatient(patient) {
    const store = this.getStore();
    // Add to the beginning of the list
    store.patients.unshift(patient);
    this.saveStore(store);
    // Update the global mock data pointer
    if (window.MOCK_DATA) {
      window.MOCK_DATA.patients = store.patients;
    }
  },

  getPatients() {
    return this.getStore().patients;
  },

  init() {
    // Listen for storage events from OTHER tabs
    window.addEventListener('storage', (e) => {
      if (e.key === 'careforge_sync_store') {
        window.dispatchEvent(new Event('careforge_sync_updated'));
      }
    });

    // When store updates, re-render the current view to reflect new chats/prescriptions
    window.addEventListener('careforge_sync_updated', () => {
      if (typeof AppRouter !== 'undefined' && AppRouter.currentPath) {
        // We trigger a re-render. To avoid losing form state, we'll only update specific DOM elements
        // The individual components will listen to this event.
      }
    });

    // On init, set the global MOCK_DATA to the synced patients
    if (window.MOCK_DATA) {
      window.MOCK_DATA.patients = this.getPatients();
    }
  }
};

window.SyncEngine.init();
