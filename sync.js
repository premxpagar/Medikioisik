// Simulated Sync Engine using LocalStorage
// Allows real-time syncing between tabs without a real backend

window.SyncEngine = {
  getStore() {
    const defaultStore = {
      chats: [],
      prescriptions: [],
      patients: window.MOCK_DATA?.patients || [],
      pharmacyOrders: (window.MEDIKIOSIK_PHARMACY && window.MEDIKIOSIK_PHARMACY.sampleOrders) || [],
      appointments: [
        {
          id: "apt-101",
          patientId: "pat-1",
          patientName: "Rahul Sharma",
          doctorName: "Dr. Ananya Sharma",
          dept: "General Medicine & Triage",
          date: "Today",
          time: "10:30 AM",
          mode: "video", // 'in-person' | 'video' | 'hybrid'
          status: "Confirmed",
          fee: 400,
          room: "OPD Room 04",
          videoRoomUrl: "https://meet.careforge.live/dr-ananya-sharma-room",
          complaint: "Routine health checkup & blood sugar review"
        },
        {
          id: "apt-102",
          patientId: "pat-101",
          patientName: "Rajesh Kumar Sharma",
          doctorName: "Dr. Ashok Seth",
          dept: "Cardiology & Heart Care",
          date: "Tomorrow",
          time: "11:00 AM",
          mode: "hybrid",
          status: "Confirmed",
          fee: 950,
          room: "OPD Room 12",
          videoRoomUrl: "https://meet.careforge.live/dr-ashok-seth-room",
          complaint: "Cardiology follow-up & ECG consultation"
        }
      ]
    };
    const stored = localStorage.getItem('careforge_sync_store');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (!parsed.patients) {
        parsed.patients = window.MOCK_DATA?.patients || [];
      }
      if (!parsed.pharmacyOrders) {
        parsed.pharmacyOrders = (window.MEDIKIOSIK_PHARMACY && window.MEDIKIOSIK_PHARMACY.sampleOrders) || [];
      }
      if (!parsed.appointments) {
        parsed.appointments = defaultStore.appointments;
      }
      this.saveStore(parsed); // Save the migration
      return parsed;
    }
    return defaultStore;
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

  requestPhysicalVerification(patientId, doctorName, instructions, hospitalName) {
    const store = this.getStore();
    const hosp = hospitalName || "MHSSCE Healthcare Center & Hospital, Byculla, Mumbai";
    const inst = instructions || "Please report to Room 04 (General Medicine OPD) for direct physical examination, vital signs check, and document verification.";
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const nowDate = new Date().toLocaleDateString();

    let targetPatient = null;
    store.patients = store.patients.map(p => {
      if (p.id === patientId || p.token === patientId) {
        targetPatient = p;
        return {
          ...p,
          status: 'Physical Verification Required',
          physicalVerification: {
            requested: true,
            hospital: hosp,
            doctor: doctorName,
            time: nowTime,
            date: nowDate,
            instructions: inst
          }
        };
      }
      return p;
    });

    // Also send an automated priority system chat message
    store.chats.push({
      id: Date.now(),
      patientId: patientId,
      doctorName: doctorName,
      sender: 'DOCTOR',
      text: `🏥 URGENT PHYSICAL VERIFICATION: Dr. ${doctorName} has requested you to visit ${hosp} for in-person examination. Please proceed to OPD Room 04 with your token slip.`,
      time: nowTime
    });

    // Save global notice for broadcast to all patient home sessions
    const notice = {
      patientId,
      patientName: targetPatient?.name || 'Patient',
      doctor: doctorName,
      hospital: hosp,
      instructions: inst,
      time: nowTime,
      date: nowDate
    };
    localStorage.setItem('careforge_physical_notice', JSON.stringify(notice));

    this.saveStore(store);
    return notice;
  },

  getPhysicalVerification(patientId) {
    const store = this.getStore();
    const pat = store.patients.find(p => p.id === patientId || p.token === patientId);
    return pat?.physicalVerification || null;
  },

  getGlobalPhysicalNotice() {
    try {
      const n = localStorage.getItem('careforge_physical_notice');
      return n ? JSON.parse(n) : null;
    } catch(e) {
      return null;
    }
  },

  addPharmacyOrder(order) {
    const store = this.getStore();
    if (!store.pharmacyOrders) store.pharmacyOrders = [];
    store.pharmacyOrders.unshift(order);
    this.saveStore(store);
    return order;
  },

  getPharmacyOrders(patientId) {
    const store = this.getStore();
    const orders = store.pharmacyOrders || [];
    if (!patientId) return orders;
    return orders.filter(o => o.patientId === patientId || !o.patientId);
  },

  updatePharmacyOrderStatus(orderId, newStatus) {
    const store = this.getStore();
    if (store.pharmacyOrders) {
      store.pharmacyOrders = store.pharmacyOrders.map(o => {
        if (o.orderId === orderId) {
          return { ...o, status: newStatus };
        }
        return o;
      });
      this.saveStore(store);
    }
  },

  addAppointment(apt) {
    const store = this.getStore();
    if (!store.appointments) store.appointments = [];
    store.appointments.unshift(apt);
    this.saveStore(store);
    return apt;
  },

  getAppointments(patientId) {
    const store = this.getStore();
    const apts = store.appointments || [];
    if (!patientId) return apts;
    return apts.filter(a => a.patientId === patientId || !a.patientId);
  },

  cancelAppointment(aptId) {
    const store = this.getStore();
    if (store.appointments) {
      store.appointments = store.appointments.map(a => {
        if (a.id === aptId) {
          return { ...a, status: 'Cancelled' };
        }
        return a;
      });
      this.saveStore(store);
    }
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
