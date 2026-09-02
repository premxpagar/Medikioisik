// MediKiosik — AI-Assisted Pre-Consultation System
// Core Interactive Application Engine

(function() {
  'use strict';

  // --- App State ---
  const state = {
    currentTab: 'portal', // 'portal' | 'kiosk' | 'doctor' | 'docViewer'
    portal: {
      selectedDeptId: 'all',
      doctorSearchText: '',
      selectedDate: 'Today',
      selectedMode: 'all', // 'all' | 'in-person' | 'video' | 'hybrid'
      selectedDoctorForBooking: null,
      bookingModalOpen: false,
      bookingMode: 'video', // default for modal: 'in-person' | 'video' | 'hybrid'
      bookingSlot: '10:30 AM',
      bookingDate: 'Today',
      bookingComplaint: '',
      activeVideoCall: null // { doctor, roomUrl, aptId }
    },
    kiosk: {
      step: 1, // 1: Demographics, 2: Symptoms & Voice, 3: Duration & Pain, 4: History & Meds, 5: OCR Scan, 6: Confirm, 7: Token
      lang: 'en', // 'en' | 'hi'
      isListening: false,
      isSpeaking: false,
      isScanning: false,
      isRedFlagTriggered: false,
      recognition: null,
      patient: {
        name: '',
        age: '',
        gender: 'Male',
        phone: '',
        abhaId: '',
        department: 'General Medicine & Triage',
        doctorName: 'Dr. Arjun Sharma',
        chiefComplaint: '',
        selectedSymptoms: [],
        duration: 'Just Today (< 24 Hours)',
        painScore: 5,
        pastConditions: [],
        medications: '',
        allergies: [],
        scannedDocs: []
      },
      generatedToken: null
    },
    doctor: {
      selectedPatientId: 'pat-101',
      filterTriage: 'ALL',
      searchQuery: '',
      patients: JSON.parse(JSON.stringify(window.MEDIKIOSIK_DATA.samplePatients)),
      activePaneTab: 'summary'
    },
    pharmacy: {
      selectedCategory: 'all',
      searchQuery: '',
      rxFilter: 'all', // 'all' | 'rx' | 'otc'
      cart: [], // items: { id, name, genericName, price, mrp, qty, form, prescriptionRequired, isCustom, notes }
      selectedDeliveryMode: 'express', // 'express' | 'standard' | 'refill'
      deliveryAddress: {
        fullName: 'Rahul Sharma',
        phone: '+91 98201 44556',
        street: 'Flat 402, Sea View Heights, Byculla East',
        landmark: 'Near MHSSCE Campus',
        city: 'Mumbai',
        pincode: '400008'
      },
      paymentMethod: 'UPI', // 'UPI' | 'COD' | 'CARD' | 'INSURANCE'
      activeView: 'catalog', // 'catalog' | 'cart' | 'tracking'
      activeTrackingOrderId: null,
      isCustomModalOpen: false
    }
  };

  // --- Helpers ---
  function $(selector) {
    return document.querySelector(selector);
  }

  function $$(selector) {
    return document.querySelectorAll(selector);
  }

  function getI18n(key) {
    const lang = state.kiosk.lang || 'en';
    return (window.MEDIKIOSIK_DATA.i18n[lang] && window.MEDIKIOSIK_DATA.i18n[lang][key]) || 
           (window.MEDIKIOSIK_DATA.i18n.en[key]) || key;
  }

  // --- Speech Recognition (Web Speech API) ---
  function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Web Speech API not available natively; using simulation mode.');
      return;
    }

    state.kiosk.recognition = new SpeechRecognition();
    state.kiosk.recognition.continuous = true;
    state.kiosk.recognition.interimResults = true;

    state.kiosk.recognition.onstart = function() {
      state.kiosk.isListening = true;
      renderKioskVoiceUI();
    };

    state.kiosk.recognition.onresult = function(event) {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        const existing = state.kiosk.patient.chiefComplaint ? state.kiosk.patient.chiefComplaint + ' ' : '';
        state.kiosk.patient.chiefComplaint = existing + finalTranscript;
        if ($('#kiosk-complaint-input')) {
          $('#kiosk-complaint-input').value = state.kiosk.patient.chiefComplaint;
        }
        checkRedFlagEmergencyRules(state.kiosk.patient.chiefComplaint);
      }
    };

    state.kiosk.recognition.onerror = function(event) {
      console.error('Speech recognition error:', event.error);
      state.kiosk.isListening = false;
      renderKioskVoiceUI();
    };

    state.kiosk.recognition.onend = function() {
      state.kiosk.isListening = false;
      renderKioskVoiceUI();
    };
  }

  function toggleVoiceInput() {
    if (state.kiosk.isListening) {
      if (state.kiosk.recognition) {
        state.kiosk.recognition.stop();
      }
      state.kiosk.isListening = false;
      renderKioskVoiceUI();
    } else {
      const langCode = state.kiosk.lang === 'hi' ? 'hi-IN' : 'en-IN';
      if (state.kiosk.recognition) {
        try {
          state.kiosk.recognition.lang = langCode;
          state.kiosk.recognition.start();
        } catch (e) {
          simulateVoiceInput();
        }
      } else {
        simulateVoiceInput();
      }
    }
  }

  function simulateVoiceInput() {
    state.kiosk.isListening = true;
    renderKioskVoiceUI();
    
    speakVoiceFeedback(state.kiosk.lang === 'hi' ? 'कृपया अपनी समस्या बताएं, हम सुन रहे हैं।' : 'Please describe your symptoms, we are listening.');

    setTimeout(function() {
      if (!state.kiosk.isListening) return;
      const sampleHindi = "मुझे कल रात से सीने में तेज भारीपन, सांस लेने में तकलीफ और पसीना आ रहा है।";
      const sampleEnglish = "I have severe retrosternal chest pain with shortness of breath and sweating since morning.";
      const phrase = state.kiosk.lang === 'hi' ? sampleHindi : sampleEnglish;
      
      const existing = state.kiosk.patient.chiefComplaint ? state.kiosk.patient.chiefComplaint + '. ' : '';
      state.kiosk.patient.chiefComplaint = existing + phrase;
      if ($('#kiosk-complaint-input')) {
        $('#kiosk-complaint-input').value = state.kiosk.patient.chiefComplaint;
      }
      state.kiosk.isListening = false;
      renderKioskVoiceUI();
      checkRedFlagEmergencyRules(phrase);
    }, 2500);
  }

  function speakVoiceFeedback(text) {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = state.kiosk.lang === 'hi' ? 'hi-IN' : 'en-US';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    } catch(e) {
      console.log('TTS error:', e);
    }
  }

  // --- Rule-Based Red Flag Safety Check ---
  function checkRedFlagEmergencyRules(text) {
    const lower = (text || '').toLowerCase();
    const isEmergencyMatch = 
      lower.includes('chest pain') || 
      lower.includes('heart attack') || 
      lower.includes('सीने में') || 
      lower.includes('left arm') || 
      lower.includes('shortness of breath') || 
      lower.includes('सांस') || 
      lower.includes('sweating') || 
      lower.includes('unconscious') || 
      lower.includes('stroke') ||
      lower.includes('paralysis') ||
      lower.includes('seizure') ||
      lower.includes('दौरा');

    if (isEmergencyMatch) {
      state.kiosk.isRedFlagTriggered = true;
      triggerRedFlagAlertModal();
    }
  }

  function triggerRedFlagAlertModal() {
    const modal = $('#red-flag-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  }

  // --- OCR Document Processing ---
  function processOCRDocument(fileOrSampleType) {
    state.kiosk.isScanning = true;
    renderOCRScanArea();

    setTimeout(function() {
      let docData;
      if (fileOrSampleType === 'prescription' || fileOrSampleType === 'default') {
        docData = {
          id: 'doc-' + Date.now(),
          type: 'Prescription',
          title: 'Hospital OPD Followup Slip',
          date: '2024-02-14',
          ocrSnippet: 'Rx: Tab Telmisartan 40mg (OD), Tab Metformin 500mg (BD), Tab Pantoprazole 40mg (OD). Advised: Fasting Blood Sugar & Lipid Profile.',
          extractedEntities: {
            medications: ['Telmisartan 40mg OD', 'Metformin 500mg BD', 'Pantoprazole 40mg OD'],
            testsAdvised: ['Lipid Profile', 'Fasting Blood Sugar'],
            diagnoses: ['Hypertension', 'Type 2 Diabetes']
          }
        };
      } else if (fileOrSampleType === 'blood_report') {
        docData = {
          id: 'doc-' + Date.now(),
          type: 'Laboratory Report',
          title: 'Blood Glucose & Lipid Panel',
          date: '2024-03-01',
          ocrSnippet: 'Hemoglobin: 11.2 g/dL, Fasting Glucose: 178 mg/dL (HIGH), HbA1c: 8.2% (UNCONTROLLED), Total Cholesterol: 235 mg/dL.',
          extractedEntities: {
            hba1c: '8.2% [High Risk / Uncontrolled]',
            glucoseFasting: '178 mg/dL [Elevated]',
            totalCholesterol: '235 mg/dL [High]'
          }
        };
      } else {
        docData = {
          id: 'doc-' + Date.now(),
          type: 'Imaging / X-Ray Report',
          title: 'Bilateral Standing Knee X-Ray',
          date: '2024-01-20',
          ocrSnippet: 'Right Knee: Marked loss of medial joint space with subchondral sclerosis. Kellgren-Lawrence Grade 3-4 Osteoarthritis.',
          extractedEntities: {
            finding: 'Grade 3-4 Osteoarthritis Right Knee',
            compartment: 'Medial joint space reduction'
          }
        };
      }

      state.kiosk.patient.scannedDocs.push(docData);
      state.kiosk.isScanning = false;
      renderOCRScanArea();
      renderScannedDocsList();
    }, 1800);
  }

  // --- OPD Token & AI Summary Generator ---
  function generateKioskToken() {
    const p = state.kiosk.patient;
    const tokenNumber = state.kiosk.isRedFlagTriggered 
      ? 'OPD-EMG-' + Math.floor(100 + Math.random() * 900)
      : 'OPD-MED-' + Math.floor(1000 + Math.random() * 9000);

    const triageLevel = state.kiosk.isRedFlagTriggered 
      ? 'EMERGENCY_RED_FLAG'
      : (p.painScore >= 8 ? 'URGENT' : 'ROUTINE');

    const summary = `${p.age || '45'}-year-old ${p.gender || 'Patient'} presenting with ${p.chiefComplaint || 'generalized symptoms'} lasting for ${p.duration || 'recent onset'}. Pain score rated ${p.painScore}/10. Past conditions: ${p.pastConditions.length ? p.pastConditions.join(', ') : 'None reported'}. Current medications: ${p.medications || 'None'}. Allergies: ${p.allergies.length ? p.allergies.join(', ') : 'NKDA'}. Scanned documents attached: ${p.scannedDocs.length}. Triage: ${triageLevel}.`;

    const tokenObj = {
      id: 'pat-' + Date.now(),
      token: tokenNumber,
      name: p.name || 'Walk-in Patient',
      age: p.age || 45,
      gender: p.gender || 'Male',
      phone: p.phone || '+91 98765 43210',
      abhaId: p.abhaId || '91-8842-1920-3341',
      triageLevel: triageLevel,
      triageReason: state.kiosk.isRedFlagTriggered ? 'Emergency symptoms detected by rule engine' : 'OPD Pre-Checkin Complete',
      arrivalStatus: 'Waiting',
      checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      appointmentTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      department: p.department || 'General Medicine & Triage',
      doctorName: p.doctorName || 'Dr. Arjun Sharma',
      doctor: p.doctorName || 'Dr. Arjun Sharma',
      chiefComplaint: p.chiefComplaint || 'Routine medical review',
      duration: p.duration,
      painScore: p.painScore,
      symptoms: p.selectedSymptoms,
      pastHistory: p.pastConditions,
      currentMedications: p.medications ? [{ name: p.medications, dose: 'As prescribed', frequency: 'Regular' }] : [],
      allergies: p.allergies,
      scannedDocsCount: p.scannedDocs.length,
      scannedDocs: p.scannedDocs,
      aiSummary: summary,
      doctorNotes: '',
      finalDiagnosis: '',
      status: 'Waiting',
      billing: {
        amount: state.kiosk.isRedFlagTriggered ? 5000.00 : 1500.00,
        insuranceProvider: p.insurance || 'Walk-in / Cash',
        policyNumber: 'N/A',
        claimStatus: 'Pending',
        paymentStatus: 'Unpaid'
      }
    };

    state.kiosk.generatedToken = tokenObj;

    if (window.SyncEngine) {
      window.SyncEngine.addPatient(tokenObj);
      state.doctor.patients = window.SyncEngine.getPatients();
    } else {
      if (triageLevel === 'EMERGENCY_RED_FLAG') {
        state.doctor.patients.unshift(tokenObj);
      } else {
        state.doctor.patients.push(tokenObj);
      }
    }

    state.doctor.selectedPatientId = tokenObj.id;
    state.kiosk.step = 7;

    // Persist the session so page refresh restores the receipt
    try {
      localStorage.setItem('careforge_kiosk_session', JSON.stringify({
        step: 7,
        generatedToken: tokenObj,
        patient: state.kiosk.patient,
        isRedFlagTriggered: state.kiosk.isRedFlagTriggered
      }));
    } catch(e) {}

    renderKioskStep();
  }

  // --- Main Render Engine ---
  function renderApp() {
    renderHeader();
    renderActiveTab();
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function renderHeader() {
    const cartCount = state.pharmacy ? state.pharmacy.cart.reduce((sum, i) => sum + (i.qty || 1), 0) : 0;
    const tabs = [
      { id: 'portal', label: 'OPD Portal', icon: 'hospital', badge: '' },
      { id: 'kiosk', label: 'Patient Kiosk (Check-in)', icon: 'tablet', badge: 'Touch & Voice' },
      { id: 'pharmacy', label: 'Pharmacy & Home Delivery', icon: 'shopping-bag', badge: cartCount > 0 ? `${cartCount} in Cart` : 'Fast Delivery' }
    ];

    const navHtml = tabs.map(t => {
      const isActive = state.currentTab === t.id;
      return `
        <button data-tab="${t.id}" class="nav-tab-btn flex items-center gap-2 px-3.5 py-2 text-xs md:text-sm font-bold rounded-xl transition-all ${
          isActive 
            ? 'bg-[#0CA854] text-white shadow-md shadow-emerald-700/30' 
            : 'text-slate-700 hover:text-[#0CA854] hover:bg-emerald-50'
        }">
          <i data-lucide="${t.icon}" class="w-4 h-4"></i>
          <span>${t.label}</span>
          ${t.badge ? `<span class="text-[10px] px-1.5 py-0.5 rounded-full font-bold ${isActive ? 'bg-white text-[#0CA854]' : (t.id === 'pharmacy' && cartCount > 0 ? 'bg-emerald-600 text-white animate-pulse' : 'bg-slate-200 text-slate-600')}">${t.badge}</span>` : ''}
        </button>
      `;
    }).join('');

    const headerNavTabs = document.getElementById('header-nav-tabs');
    if (headerNavTabs) {
      headerNavTabs.innerHTML = navHtml;
    }

    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.currentTab = btn.getAttribute('data-tab');
        renderApp();
      });
    });
  }

  function renderActiveTab() {
    const container = $('#main-content');
    if (!container) return;

    if (state.currentTab === 'portal') {
      container.innerHTML = getPortalHTML();
      attachPortalListeners();
    } else if (state.currentTab === 'kiosk') {
      container.innerHTML = getKioskHTML();

      // Restore a previous kiosk session if it exists
      const savedSession = localStorage.getItem('careforge_kiosk_session');
      if (savedSession) {
        try {
          const session = JSON.parse(savedSession);
          if (session.step === 7 && session.generatedToken) {
            state.kiosk.step = 7;
            state.kiosk.generatedToken = session.generatedToken;
            state.kiosk.patient = session.patient || state.kiosk.patient;
            state.kiosk.isRedFlagTriggered = session.isRedFlagTriggered || false;
            // Show the chat overlay too
            const overlay = document.getElementById('patient-portal-overlay');
            if (overlay) { overlay.classList.remove('hidden'); overlay.classList.add('flex'); }
          }
        } catch(e) {}
      }

      renderKioskStep();
      attachKioskListeners();
    } else if (state.currentTab === 'pharmacy') {
      container.innerHTML = getPharmacyHTML();
      attachPharmacyListeners();
    } else if (state.currentTab === 'doctor') {
      container.innerHTML = getDoctorDashboardHTML();
      attachDoctorListeners();
    } else if (state.currentTab === 'docViewer') {
      container.innerHTML = getDocViewerHTML();
      attachDocViewerListeners();
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // ==========================================
  // 1. MEDIKIOSIK OPD PORTAL HOMEPAGE
  // ==========================================
  function getPortalHTML() {
    const depts = window.MEDIKIOSIK_DATA.departments || [];
    const allDoctors = window.MEDIKIOSIK_DATA.doctors || [];

    const user = JSON.parse(localStorage.getItem('careforge_user')) || {};
    const patientId = user.id || state.kiosk.patient.id || 'pat-1';
    const patientName = user.name || state.kiosk.patient.name || 'Aditya Verma';

    // Check for active physical verification notice
    const activePhysicalNotice = window.SyncEngine ? window.SyncEngine.getGlobalPhysicalNotice() : null;
    const allPats = window.SyncEngine ? window.SyncEngine.getPatients() : [];
    const patientWithVerification = allPats.find(p => p.physicalVerification?.requested || p.status === 'Physical Verification Required');
    const noticeToDisplay = activePhysicalNotice || (patientWithVerification ? {
      patientName: patientWithVerification.name,
      doctor: patientWithVerification.doctor || patientWithVerification.doctorName || 'Assigned Doctor',
      hospital: patientWithVerification.physicalVerification?.hospital || 'MHSSCE Healthcare Center & Hospital, Byculla, Mumbai',
      instructions: patientWithVerification.physicalVerification?.instructions || 'Please report to Room 04 for physical examination.',
      time: patientWithVerification.physicalVerification?.time || patientWithVerification.checkInTime || 'Today'
    } : null);

    // Filter doctors based on department, mode, search, and date
    const filteredDoctors = allDoctors.filter(doc => {
      // Dept filter
      if (state.portal.selectedDeptId && state.portal.selectedDeptId !== 'all') {
        const dObj = depts.find(d => d.id === state.portal.selectedDeptId);
        if (dObj && !doc.dept.toLowerCase().includes(dObj.name.toLowerCase()) && !dObj.name.toLowerCase().includes(doc.dept.toLowerCase())) {
          return false;
        }
      }
      // Mode filter
      if (state.portal.selectedMode && state.portal.selectedMode !== 'all') {
        if (!doc.supportedModes || !doc.supportedModes.includes(state.portal.selectedMode)) {
          return false;
        }
      }
      // Date filter
      if (state.portal.selectedDate) {
        if (doc.availableDates && !doc.availableDates.includes(state.portal.selectedDate)) {
          return false;
        }
      }
      // Search
      if (state.portal.doctorSearchText) {
        const q = state.portal.doctorSearchText.toLowerCase().trim();
        const matchName = doc.name.toLowerCase().includes(q);
        const matchDept = doc.dept.toLowerCase().includes(q);
        const matchSpec = doc.specialty.toLowerCase().includes(q);
        if (!matchName && !matchDept && !matchSpec) return false;
      }
      return true;
    });

    // Patient booked appointments
    const bookedAppointments = window.SyncEngine ? window.SyncEngine.getAppointments(patientId) : [];

    return `
      <div class="space-y-12 pb-16">
        
        <!-- Live Physical Verification Notice Banner (Dispatched by Doctor) -->
        ${noticeToDisplay ? `
          <section id="banner-physical-verification" class="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-amber-50 border-2 border-amber-400 shadow-xl shadow-amber-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
            <div class="absolute -right-10 -bottom-10 w-40 h-40 bg-amber-400/20 rounded-full blur-2xl pointer-events-none"></div>
            
            <div class="flex items-start gap-5 relative z-10">
              <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 flex-shrink-0">
                <i data-lucide="building-2" class="w-7 h-7"></i>
              </div>
              <div class="space-y-1.5">
                <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-white font-black text-xs uppercase tracking-wider">
                  <span class="w-2 h-2 rounded-full bg-white animate-ping"></span>
                  Doctor Notice: In-Person Physical Verification Required
                </div>
                <h2 class="text-xl md:text-2xl font-black text-slate-900">
                  Please come to MHSSCE Hospital (OPD Room 04)
                </h2>
                <p class="text-xs md:text-sm text-slate-700 max-w-2xl leading-relaxed">
                  Doctor <strong>${noticeToDisplay.doctor}</strong> has reviewed your check-in summary and ordered a physical verification visit at <strong>${noticeToDisplay.hospital}</strong>.
                </p>
                <div class="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-600 font-semibold">
                  <span class="flex items-center gap-1"><i data-lucide="map-pin" class="w-3.5 h-3.5 text-amber-700"></i> MHSSCE Campus, 8 Shepherd Rd, Byculla</span>
                  <span>•</span>
                  <span class="flex items-center gap-1"><i data-lucide="clock" class="w-3.5 h-3.5 text-amber-700"></i> Called: ${noticeToDisplay.time}</span>
                  <span>•</span>
                  <span>Patient: <strong>${noticeToDisplay.patientName}</strong></span>
                </div>
              </div>
            </div>

            <div class="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full md:w-auto relative z-10 flex-shrink-0">
              <a href="https://maps.google.com/?q=MH+Saboo+Siddik+College+of+Engineering+Byculla+Mumbai" target="_blank" class="flex-1 sm:flex-initial px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:scale-105 transition-all">
                <i data-lucide="navigation" class="w-4 h-4 text-emerald-400"></i>
                <span>Get Directions to MHSSCE</span>
              </a>
              <button id="btn-dismiss-physical-notice" class="px-4 py-3 rounded-xl border border-amber-300 bg-white/80 hover:bg-white text-slate-700 font-bold text-xs transition-colors">
                Dismiss
              </button>
            </div>
          </section>
        ` : ''}

        <!-- Hero Section -->
        <section class="relative rounded-3xl overflow-hidden shadow-sm bg-white/70 backdrop-blur-3xl border border-white p-8 md:p-12">
          <div class="absolute -right-20 -bottom-20 w-96 h-96 bg-slate-200/50 rounded-full blur-3xl pointer-events-none"></div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-10 items-center relative z-10">
            <!-- Text Content -->
            <div class="space-y-6">
              <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/60 backdrop-blur-md border border-slate-200 text-xs font-bold text-slate-700">
                <span class="w-2 h-2 rounded-full bg-[#0CA854] animate-ping"></span>
                Smart OPD & Telehealth Consultation Engine
              </div>

              <h1 class="text-3xl md:text-5xl font-black tracking-tight leading-tight text-slate-900">
                Fast-Track Your Hospital Visit with <br/>
                <span class="text-[#0CA854]">MediKiosik Smart OPD</span>
              </h1>

              <p class="text-slate-600 text-sm md:text-base leading-relaxed">
                Consult verified doctors through <strong>In-Person OPD check-in</strong>, <strong>HD Live Video Calls</strong>, or <strong>Hybrid Consultations</strong> with zero queue delay.
              </p>

              <div class="flex flex-wrap items-center gap-4 pt-2">
                <button id="hero-start-checkin-btn" class="flex items-center gap-3 px-7 py-4 rounded-2xl bg-[#0CA854] hover:bg-[#087F3F] text-white font-extrabold text-sm md:text-base shadow-lg shadow-emerald-700/20 transition-all hover:scale-105 active:scale-95">
                  <i data-lucide="tablet" class="w-5 h-5"></i>
                  <span>Start Kiosk Pre-Checkin (Touch & Voice)</span>
                </button>

                <a href="#portal-doctor-booking" class="flex items-center gap-2 px-6 py-4 rounded-2xl bg-[#0F2942] hover:bg-slate-800 text-white font-bold text-sm md:text-base shadow-md transition-all hover:scale-105">
                  <i data-lucide="video" class="w-5 h-5 text-amber-300"></i>
                  <span>Book Doctor Video Slot</span>
                </a>
              </div>

              <!-- Impact Metrics -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-200">
                <div>
                  <div class="text-2xl md:text-3xl font-black text-slate-900">60 Sec</div>
                  <div class="text-xs text-slate-500">Doctor Briefing Time</div>
                </div>
                <div>
                  <div class="text-2xl md:text-3xl font-black text-[#0CA854]">3 Modes</div>
                  <div class="text-xs text-slate-500">In-Person, Video, Hybrid</div>
                </div>
                <div>
                  <div class="text-2xl md:text-3xl font-black text-slate-900">Live Slots</div>
                  <div class="text-xs text-slate-500">Instant Verification</div>
                </div>
                <div>
                  <div class="text-2xl md:text-3xl font-black text-slate-700">Home Meds</div>
                  <div class="text-xs text-slate-500">30-Min Fast Delivery</div>
                </div>
              </div>
            </div>

            <!-- Hero Image -->
            <div class="hidden md:block relative group">
              <div class="absolute -inset-2 bg-slate-200/50 rounded-3xl blur-2xl group-hover:bg-slate-300/50 transition-all"></div>
              <img src="/neutral_glass_doctor_1788294019521.jpg" alt="Doctor Consultation" class="relative z-10 w-full h-[400px] object-cover rounded-3xl shadow-lg border border-white/50 group-hover:scale-[1.02] transition-transform duration-500" />
            </div>
          </div>
        </section>

        <!-- ==========================================
             MY BOOKED DOCTOR APPOINTMENTS (ACTIVE / UPCOMING)
             ========================================== -->
        ${bookedAppointments.length > 0 ? `
          <section id="patient-active-appointments" class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <span class="text-xs font-bold text-[#0CA854] tracking-widest uppercase">Scheduled Appointments</span>
                <h2 class="text-xl md:text-2xl font-black text-slate-900">My Booked Doctor Consultations</h2>
              </div>
              <span class="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                ${bookedAppointments.length} Active Slot(s)
              </span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              ${bookedAppointments.map(apt => {
                const isVideo = apt.mode === 'video';
                const isHybrid = apt.mode === 'hybrid';
                const isInPerson = apt.mode === 'in-person';

                return `
                  <div class="bg-white rounded-3xl border-2 ${isVideo ? 'border-purple-300 bg-gradient-to-br from-purple-50/40 via-white to-white' : isHybrid ? 'border-amber-300 bg-gradient-to-br from-amber-50/40 via-white to-white' : 'border-emerald-300 bg-white'} p-6 shadow-sm hover:shadow-md transition-all space-y-4">
                    
                    <div class="flex items-start justify-between gap-3">
                      <div class="flex items-center gap-3">
                        <div class="w-12 h-12 rounded-2xl ${isVideo ? 'bg-purple-600 text-white' : isHybrid ? 'bg-amber-600 text-white' : 'bg-[#0CA854] text-white'} flex items-center justify-center font-bold text-lg shadow-md">
                          <i data-lucide="${isVideo ? 'video' : isHybrid ? 'repeat' : 'building-2'}" class="w-6 h-6"></i>
                        </div>
                        <div>
                          <div class="flex items-center gap-2">
                            <h3 class="font-bold text-slate-900 text-base">${apt.doctorName}</h3>
                            <span class="font-mono text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                              ${apt.id}
                            </span>
                          </div>
                          <p class="text-xs text-slate-500">${apt.dept}</p>
                        </div>
                      </div>

                      <span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isVideo ? 'bg-purple-100 text-purple-800' : isHybrid ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }">
                        ${isVideo ? '📹 Live Video Slot' : isHybrid ? '🔄 Hybrid Care' : '🏥 In-Person OPD'}
                      </span>
                    </div>

                    <div class="grid grid-cols-2 gap-3 p-3 bg-slate-50/80 rounded-2xl text-xs border border-slate-100">
                      <div>
                        <span class="text-[10px] text-slate-400 font-semibold uppercase">Scheduled Date & Time</span>
                        <div class="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                          <i data-lucide="calendar" class="w-3.5 h-3.5 text-[#0CA854]"></i>
                          <span>${apt.date} · ${apt.time}</span>
                        </div>
                      </div>
                      <div>
                        <span class="text-[10px] text-slate-400 font-semibold uppercase">Consultation Venue</span>
                        <div class="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                          <i data-lucide="map-pin" class="w-3.5 h-3.5 text-[#0CA854]"></i>
                          <span>${isVideo ? 'Online Video Call Room' : (apt.room || 'OPD Room 04')}</span>
                        </div>
                      </div>
                    </div>

                    ${apt.complaint ? `
                      <p class="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100">
                        <strong class="text-slate-800">Reason:</strong> ${apt.complaint}
                      </p>
                    ` : ''}

                    <div class="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
                      ${isVideo || isHybrid ? `
                        <button data-apt-id="${apt.id}" data-doc-name="${apt.doctorName}" data-doc-dept="${apt.dept}" data-room-url="${apt.videoRoomUrl || 'https://meet.careforge.live/room-101'}" class="btn-launch-video-call flex-1 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all hover:scale-102 animate-pulse">
                          <i data-lucide="video" class="w-4 h-4 text-amber-300"></i>
                          <span>📹 Join Live Video Consultation Room</span>
                        </button>
                      ` : `
                        <button onclick="alert('In-person token confirmed! Please show Token #${apt.id} at ${apt.room || 'OPD Room 04'}.')" class="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2">
                          <i data-lucide="ticket" class="w-4 h-4 text-emerald-400"></i>
                          <span>View OPD Token Pass</span>
                        </button>
                      `}

                      <button data-apt-id="${apt.id}" class="btn-cancel-appointment px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-slate-500 font-bold text-xs transition-colors" title="Cancel Slot">
                        <i data-lucide="x" class="w-4 h-4"></i>
                      </button>
                    </div>

                  </div>
                `;
              }).join('')}
            </div>
          </section>
        ` : ''}

        <!-- ==========================================
             BOOK DOCTOR APPOINTMENTS & LIVE VIDEO SLOTS
             ========================================== -->
        <section id="portal-doctor-booking" class="space-y-6">
          <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span class="text-xs font-bold text-[#0CA854] tracking-widest uppercase">Verified Specialists & Telehealth</span>
              <h2 class="text-2xl md:text-3xl font-black text-slate-900">Find Available Doctors & Book Appointments</h2>
              <p class="text-xs text-slate-500 mt-1">Select your preferred date, department, and consultation mode (In-Person OPD, HD Live Video Call, or Hybrid).</p>
            </div>

            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-slate-600">Active OPD:</span>
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-[#0CA854] text-xs font-black">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                MHSSCE South Mumbai Hub (Byculla)
              </span>
            </div>
          </div>

          <!-- Multi-Mode Filter Bar -->
          <div class="bg-white p-5 md:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            
            <!-- Row 1: Mode Selectors & Search Input -->
            <div class="flex flex-col lg:flex-row items-center justify-between gap-4">
              
              <!-- Mode Tabs -->
              <div class="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl w-full lg:w-auto overflow-x-auto">
                <button data-booking-mode="all" class="booking-mode-filter-btn px-4 py-2 rounded-xl text-xs font-bold transition-all ${state.portal.selectedMode === 'all' ? 'bg-white text-slate-900 shadow-sm font-black' : 'text-slate-600 hover:text-slate-900'}">
                  All Modes (${allDoctors.length})
                </button>
                <button data-booking-mode="in-person" class="booking-mode-filter-btn px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${state.portal.selectedMode === 'in-person' ? 'bg-[#0CA854] text-white shadow-sm font-black' : 'text-slate-600 hover:text-slate-900'}">
                  <i data-lucide="building-2" class="w-3.5 h-3.5"></i> 🏥 In-Person OPD
                </button>
                <button data-booking-mode="video" class="booking-mode-filter-btn px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${state.portal.selectedMode === 'video' ? 'bg-purple-600 text-white shadow-sm font-black' : 'text-slate-600 hover:text-slate-900'}">
                  <i data-lucide="video" class="w-3.5 h-3.5"></i> 📹 Video Slots
                </button>
                <button data-booking-mode="hybrid" class="booking-mode-filter-btn px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${state.portal.selectedMode === 'hybrid' ? 'bg-amber-600 text-white shadow-sm font-black' : 'text-slate-600 hover:text-slate-900'}">
                  <i data-lucide="repeat" class="w-3.5 h-3.5"></i> 🔄 Hybrid Care
                </button>
              </div>

              <!-- Search Input -->
              <div class="relative w-full lg:max-w-md">
                <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"></i>
                <input 
                  type="text" 
                  id="portal-doctor-search-input" 
                  value="${state.portal.doctorSearchText || ''}"
                  placeholder="Search doctor by name, specialty, or condition..." 
                  class="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs md:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0CA854] focus:bg-white transition-all"
                />
                ${state.portal.doctorSearchText ? `
                  <button id="portal-doctor-clear-search" class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <i data-lucide="x" class="w-4 h-4"></i>
                  </button>
                ` : ''}
              </div>

            </div>

            <!-- Row 2: Date Selector & Department Scroll -->
            <div class="pt-3 border-t border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              
              <!-- Date Pills -->
              <div class="flex items-center gap-2 overflow-x-auto pb-1 w-full md:w-auto">
                <span class="text-[11px] font-bold text-slate-500 uppercase flex-shrink-0 flex items-center gap-1">
                  <i data-lucide="calendar" class="w-3.5 h-3.5 text-[#0CA854]"></i> Date:
                </span>
                ${["Today", "Tomorrow", "Fri, 05 Sep", "Sat, 06 Sep", "Mon, 08 Sep"].map(d => {
                  const isSel = state.portal.selectedDate === d;
                  return `
                    <button data-booking-date="${d}" class="booking-date-btn px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      isSel ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }">
                      ${d}
                    </button>
                  `;
                }).join('')}
              </div>

              <!-- Department Filter Dropdown / Pills -->
              <div class="flex items-center gap-2 overflow-x-auto pb-1 w-full md:w-auto">
                <span class="text-[11px] font-bold text-slate-500 uppercase flex-shrink-0 flex items-center gap-1">
                  <i data-lucide="stethoscope" class="w-3.5 h-3.5 text-[#0CA854]"></i> Dept:
                </span>
                <select id="portal-dept-select" class="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#0CA854]">
                  <option value="all" ${state.portal.selectedDeptId === 'all' ? 'selected' : ''}>All Departments (${depts.length})</option>
                  ${depts.map(dept => `
                    <option value="${dept.id}" ${state.portal.selectedDeptId === dept.id ? 'selected' : ''}>
                      ${dept.name}
                    </option>
                  `).join('')}
                </select>
              </div>

            </div>

          </div>

          <!-- Doctor Availability Cards Grid -->
          <div>
            ${filteredDoctors.length === 0 ? `
              <div class="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
                <div class="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                  <i data-lucide="calendar-x" class="w-8 h-8"></i>
                </div>
                <h4 class="text-lg font-bold text-slate-800">No Doctors Available for Selected Filter</h4>
                <p class="text-xs text-slate-500 max-w-sm mx-auto">
                  Try adjusting the date, department, or consultation mode to view more available doctor schedules.
                </p>
                <button id="portal-btn-reset-filters" class="px-6 py-2.5 rounded-2xl bg-[#0CA854] text-white font-bold text-xs shadow-md">
                  Reset All Filters
                </button>
              </div>
            ` : `
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${filteredDoctors.map(doc => {
                  const slots = doc.availableSlots || {
                    morning: ["09:30 AM", "10:30 AM", "11:30 AM"],
                    afternoon: ["01:00 PM", "02:00 PM"],
                    evening: ["05:00 PM", "06:00 PM"]
                  };
                  const allFlatSlots = [...(slots.morning || []), ...(slots.afternoon || []), ...(slots.evening || [])];

                  return `
                    <div class="bg-white rounded-3xl border border-slate-200 hover:border-emerald-300 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between overflow-hidden group">
                      
                      <!-- Card Header -->
                      <div class="p-6 space-y-4">
                        <div class="flex items-start gap-4">
                          <div class="relative">
                            <img src="${doc.image}" alt="${doc.name}" class="w-16 h-16 rounded-2xl object-cover shadow-md group-hover:scale-105 transition-transform" />
                            <span class="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></span>
                          </div>

                          <div class="space-y-1 flex-1">
                            <div class="flex items-center justify-between">
                              <span class="text-[10px] font-bold text-[#0CA854] uppercase tracking-wider">${doc.dept}</span>
                              <div class="flex items-center gap-1 text-[11px] font-bold text-amber-500">
                                <i data-lucide="star" class="w-3 h-3 fill-amber-400 text-amber-400"></i>
                                <span>${doc.rating ? doc.rating.split(' ')[0] : '4.9'}</span>
                              </div>
                            </div>

                            <h3 class="font-black text-slate-900 text-base leading-tight">${doc.name}</h3>
                            <p class="text-[11px] text-slate-500">${doc.degrees}</p>
                            <p class="text-[10px] text-slate-400">${doc.experience} · ${doc.languages}</p>
                          </div>
                        </div>

                        <!-- Availability & Room Tag -->
                        <div class="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                          <div class="flex items-center gap-1.5 text-emerald-700 font-bold text-[11px]">
                            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>${doc.telemedicineStatus || 'Available Today'}</span>
                          </div>
                          <span class="text-[10px] font-mono text-slate-500 font-bold">${doc.room || 'Room 04'}</span>
                        </div>

                        <!-- Mode Badges with Fees -->
                        <div class="space-y-1.5 pt-1">
                          <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Available Consultation Modes:</div>
                          <div class="grid grid-cols-3 gap-1.5 text-center">
                            <div class="p-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                              <div class="text-[10px] font-bold">🏥 In-Person</div>
                              <div class="text-[11px] font-black">₹${doc.inPersonFee || 500}</div>
                            </div>
                            <div class="p-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900">
                              <div class="text-[10px] font-bold">📹 Video Slot</div>
                              <div class="text-[11px] font-black">₹${doc.videoFee || 400}</div>
                            </div>
                            <div class="p-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                              <div class="text-[10px] font-bold">🔄 Hybrid</div>
                              <div class="text-[11px] font-black">₹${doc.hybridFee || 650}</div>
                            </div>
                          </div>
                        </div>

                        <!-- Time Slots Selector Chips -->
                        <div class="space-y-2 pt-2 border-t border-slate-100">
                          <div class="flex items-center justify-between text-[11px] font-bold text-slate-700">
                            <span>Select Time Slot (${state.portal.selectedDate}):</span>
                            <span class="text-[10px] text-emerald-600">${allFlatSlots.length} slots free</span>
                          </div>

                          <div class="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                            ${allFlatSlots.slice(0, 6).map(slot => `
                              <button data-doc-id="${doc.id}" data-slot-time="${slot}" class="btn-quick-slot-pick px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 border border-slate-200 transition-colors">
                                ${slot}
                              </button>
                            `).join('')}
                          </div>
                        </div>
                      </div>

                      <!-- Card Footer Actions -->
                      <div class="p-4 bg-slate-50 border-t border-slate-100 flex flex-col gap-2">
                        <button data-doc-id="${doc.id}" data-preferred-mode="video" class="btn-open-doctor-booking w-full py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 transition-all hover:scale-102">
                          <i data-lucide="video" class="w-4 h-4 text-amber-300"></i>
                          <span>Book Live Video Slot (₹${doc.videoFee || 400})</span>
                        </button>

                        <div class="flex items-center gap-2">
                          <button data-doc-id="${doc.id}" data-preferred-mode="in-person" class="btn-open-doctor-booking flex-1 py-2 rounded-xl bg-slate-900 hover:bg-[#0CA854] text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5">
                            <i data-lucide="building-2" class="w-3.5 h-3.5"></i>
                            <span>In-Person OPD</span>
                          </button>

                          <button data-doc-id="${doc.id}" data-preferred-mode="hybrid" class="btn-open-doctor-booking flex-1 py-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs transition-colors flex items-center justify-center gap-1.5">
                            <i data-lucide="repeat" class="w-3.5 h-3.5"></i>
                            <span>Hybrid Care</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  `;
                }).join('')}
              </div>
            `}
          </div>

        </section>

        <!-- How MediKiosik Works (3 Simple Steps) -->
        <section class="space-y-6">
          <div class="text-center max-w-2xl mx-auto space-y-2">
            <span class="text-xs font-bold text-[#0CA854] tracking-widest uppercase">Simple & Intuitive</span>
            <h2 class="text-2xl md:text-3xl font-extrabold text-slate-900">How MediKiosik Works</h2>
            <p class="text-xs text-slate-500">Designed specifically for OPD patients with no smartphone or login required.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div class="w-12 h-12 rounded-xl bg-emerald-100 text-[#0CA854] flex items-center justify-center font-black text-lg">1</div>
              <h3 class="font-bold text-slate-900 text-base">Speak or Tap Symptoms</h3>
              <p class="text-xs text-slate-600 leading-relaxed">Choose Hindi or English. Speak your symptoms or tap touch buttons. MediKiosik asks relevant follow-up questions about duration and pain.</p>
            </div>
            <div class="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div class="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-black text-lg">2</div>
              <h3 class="font-bold text-slate-900 text-base">Scan Old Prescriptions & Reports</h3>
              <p class="text-xs text-slate-600 leading-relaxed">Place old doctor slips or blood test reports on the kiosk scanner. AI OCR automatically extracts medications, past diagnoses, and lab values.</p>
            </div>
            <div class="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div class="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-black text-lg">3</div>
              <h3 class="font-bold text-slate-900 text-base">Doctor Reviews Summary in 30s</h3>
              <p class="text-xs text-slate-600 leading-relaxed">The doctor sees a clean, structured summary before you walk in or start video call, allowing them to focus entirely on examination and treatment.</p>
            </div>
          </div>
        </section>

        <!-- Nearest Hospitals Directory -->
        <section class="space-y-6">
          <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span class="text-xs font-bold text-[#0CA854] tracking-widest uppercase">Emergency & Network Locator</span>
              <h2 class="text-2xl md:text-3xl font-extrabold text-slate-900">Nearest Hospitals & Location Factors</h2>
              <p class="text-xs text-slate-500 mt-1">Real-time geospatial distance, 24x7 ER status, and direct hospital routing around MHSSCE Campus, Byculla.</p>
            </div>
            <div class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 self-start md:self-auto">
              <i data-lucide="map-pin" class="w-4 h-4 text-[#0CA854]"></i>
              <span>Location Anchor: Byculla Hub</span>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${(window.MEDIKIOSIK_DATA?.nearestHospitals || []).map(h => `
              <div class="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between space-y-4 group">
                <div class="space-y-3">
                  <div class="flex items-start justify-between gap-2">
                    <div>
                      <span class="inline-flex px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${h.badgeColor} border mb-1">
                        ${h.badge}
                      </span>
                      <h3 class="text-lg font-bold text-slate-900 group-hover:text-[#0CA854] transition-colors">${h.name}</h3>
                    </div>
                    <div class="text-right flex-shrink-0">
                      <span class="text-base font-black text-slate-900">${h.distanceKm} km</span>
                      <div class="text-[10px] text-slate-500 font-semibold">${h.travelTimeMins} mins away</div>
                    </div>
                  </div>

                  <p class="text-xs text-slate-600 leading-relaxed">${h.address}</p>

                  <div class="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                    <div class="flex items-center justify-between text-slate-600">
                      <span class="font-medium">Emergency Status:</span>
                      <span class="font-bold ${h.emergency24x7 ? 'text-emerald-700' : 'text-slate-700'} flex items-center gap-1">
                        ${h.emergency24x7 ? '<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> 24x7 Active ER' : 'Day OPD'}
                      </span>
                    </div>
                    <div class="flex items-center justify-between text-slate-600">
                      <span class="font-medium">ICU Beds Available:</span>
                      <span class="font-bold text-slate-900">${h.icuBedsAvailable} Beds</span>
                    </div>
                    <div class="flex items-center justify-between text-slate-600">
                      <span class="font-medium">Contact Phone:</span>
                      <a href="tel:${h.phone}" class="font-bold text-slate-800 hover:text-[#0CA854]">${h.phone}</a>
                    </div>
                  </div>

                  <div class="pt-2 flex flex-wrap gap-1.5">
                    ${h.specialties.map(s => `
                      <span class="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">${s}</span>
                    `).join('')}
                  </div>
                </div>

                <div class="pt-3 border-t border-slate-100 flex items-center gap-3">
                  <a href="${h.mapQuery}" target="_blank" class="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-[#0CA854] text-white text-xs font-bold transition-all flex items-center justify-center gap-2">
                    <i data-lucide="navigation" class="w-3.5 h-3.5"></i>
                    <span>Get Directions</span>
                  </a>
                  <a href="tel:${h.phone}" class="px-3.5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center justify-center">
                    <i data-lucide="phone" class="w-3.5 h-3.5"></i>
                  </a>
                </div>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- Past Visits History Section -->
        ${(() => {
          const visits = allPats.filter(p => p.token);
          if (!visits.length) return '';

          return `
            <section class="space-y-5 pb-10">
              <div>
                <span class="text-xs font-bold text-[#0CA854] tracking-widest uppercase">Your Records</span>
                <h2 class="text-2xl md:text-3xl font-extrabold text-slate-900">Past Consultations</h2>
                <p class="text-xs text-slate-500 mt-1">Your check-in history and consultations saved on this device.</p>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                ${visits.slice(0, 6).map(p => {
                  const rxs = window.SyncEngine.getPrescriptions(p.id);
                  const chats = window.SyncEngine.getMessages(p.id);
                  const isEmergency = p.triageLevel === 'EMERGENCY_RED_FLAG';
                  const isUrgent = p.triageLevel === 'URGENT';
                  const hasPhysicalVerify = p.status === 'Physical Verification Required' || p.physicalVerification?.requested;
                  
                  return `
                    <div class="bg-white rounded-2xl border ${hasPhysicalVerify ? 'border-amber-400 shadow-amber-500/10' : 'border-slate-200'} shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                      
                      ${hasPhysicalVerify ? `
                        <div class="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center justify-between text-xs font-bold">
                          <span class="flex items-center gap-1.5">
                            <i data-lucide="building-2" class="w-4 h-4"></i>
                            PHYSICAL VERIFICATION ORDERED: MHSSCE HOSPITAL (ROOM 04)
                          </span>
                          <span class="text-[10px] bg-white/20 px-2 py-0.5 rounded">Action Required</span>
                        </div>
                      ` : ''}

                      <!-- Visit Header -->
                      <div class="p-5 flex items-start justify-between gap-3">
                        <div class="flex items-center gap-3">
                          <div class="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                            <i data-lucide="user-check" class="w-5 h-5"></i>
                          </div>
                          <div>
                            <div class="font-black text-slate-900">${p.name}</div>
                            <div class="text-[11px] text-slate-500 mt-0.5">${p.checkInTime || ''} · ${p.doctorName || p.doctor || 'Doctor'}</div>
                            <div class="text-xs font-semibold text-slate-700 mt-0.5">${p.chiefComplaint || 'OPD Visit'}</div>
                          </div>
                        </div>
                        <div class="text-right flex-shrink-0">
                          <div class="text-xs font-black text-slate-800 font-mono">${p.token}</div>
                          <span class="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase mt-1 ${isEmergency ? 'bg-rose-100 text-rose-700' : isUrgent ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}">
                            ${isEmergency ? 'Emergency' : isUrgent ? 'Urgent' : 'Routine'}
                          </span>
                        </div>
                      </div>

                      <!-- Prescriptions -->
                      ${rxs.length > 0 ? `
                        <div class="px-5 pb-4 pt-2 border-t border-slate-100 space-y-2">
                          <div class="text-[10px] font-bold text-purple-600 uppercase flex items-center gap-1">
                            <i data-lucide="pill" class="w-3 h-3"></i> Medicines Prescribed (${rxs.length})
                          </div>
                          ${rxs.map(rx => `
                            <div class="bg-purple-50 border border-purple-100 rounded-lg px-3 py-2">
                              <div class="font-bold text-xs text-slate-900">${rx.medication}</div>
                              <div class="text-[11px] text-slate-600 mt-0.5">${rx.notes}</div>
                              <div class="text-[10px] text-slate-400 italic mt-0.5">Dr. ${rx.doctorName} · ${rx.date}</div>
                            </div>
                          `).join('')}
                        </div>
                      ` : ''}

                      <!-- Chat Summary -->
                      ${chats.length > 0 ? `
                        <div class="px-5 pb-4 pt-2 border-t border-slate-100">
                          <div class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-2">
                            <i data-lucide="message-circle" class="w-3 h-3"></i> Consultation Chat (${chats.length} messages)
                          </div>
                          <div class="space-y-1 max-h-[100px] overflow-y-auto">
                            ${chats.map(m => `
                              <div class="flex ${m.sender === 'PATIENT' ? 'justify-end' : 'justify-start'}">
                                <div class="px-2.5 py-1.5 rounded-lg text-[10px] max-w-[80%] ${m.sender === 'PATIENT' ? 'bg-[#0CA854] text-white' : 'bg-slate-100 text-slate-800'}">
                                  ${m.text}
                                </div>
                              </div>
                            `).join('')}
                          </div>
                        </div>
                      ` : ''}

                      ${rxs.length === 0 && chats.length === 0 ? `
                        <div class="px-5 pb-4 pt-2 border-t border-slate-100 text-[11px] text-slate-400 italic">No prescriptions or chats recorded for this visit.</div>
                      ` : ''}
                    </div>
                  `;
                }).join('')}
              </div>
            </section>
          `;
        })()}

        <!-- ==========================================
             MODAL: INTERACTIVE DOCTOR APPOINTMENT BOOKING
             ========================================== -->
        ${(() => {
          const doc = state.portal.selectedDoctorForBooking;
          if (!state.portal.bookingModalOpen || !doc) return '';

          const slots = doc.availableSlots || {
            morning: ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM"],
            afternoon: ["01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM"],
            evening: ["05:00 PM", "05:30 PM", "06:00 PM"]
          };
          const currentMode = state.portal.bookingMode || 'video';
          const fee = currentMode === 'video' ? (doc.videoFee || 400) : currentMode === 'hybrid' ? (doc.hybridFee || 650) : (doc.inPersonFee || 500);

          return `
            <div id="doctor-booking-modal" class="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
              <div class="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
                
                <div class="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div class="flex items-center gap-3">
                    <img src="${doc.image}" alt="${doc.name}" class="w-12 h-12 rounded-2xl object-cover shadow-sm" />
                    <div>
                      <h3 class="font-black text-slate-900 text-base md:text-lg">Book Consultation with ${doc.name}</h3>
                      <p class="text-xs text-slate-500">${doc.dept} · ${doc.room || 'Room 04'}</p>
                    </div>
                  </div>
                  <button id="btn-close-booking-modal" class="text-slate-400 hover:text-slate-600 p-1">
                    <i data-lucide="x" class="w-5 h-5"></i>
                  </button>
                </div>

                <form id="portal-booking-form" class="space-y-5 text-xs">
                  
                  <!-- 1. Select Consultation Mode -->
                  <div class="space-y-2">
                    <label class="block font-bold text-slate-800 text-xs">Choose Consultation Mode *</label>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      
                      <label class="p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                        currentMode === 'video' ? 'border-purple-600 bg-purple-50/50 shadow-xs' : 'border-slate-200 bg-white'
                      }">
                        <div class="flex items-center justify-between">
                          <input type="radio" name="modal-booking-mode" value="video" ${currentMode === 'video' ? 'checked' : ''} class="modal-mode-radio text-purple-600" />
                          <span class="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">Popular</span>
                        </div>
                        <div class="mt-2 space-y-0.5">
                          <div class="font-bold text-slate-900 text-xs flex items-center gap-1">
                            <i data-lucide="video" class="w-3.5 h-3.5 text-purple-600"></i> Video Call
                          </div>
                          <p class="text-[10px] text-slate-500">Live Telehealth</p>
                        </div>
                        <div class="mt-2 font-black text-purple-700 text-xs">₹${doc.videoFee || 400}</div>
                      </label>

                      <label class="p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                        currentMode === 'in-person' ? 'border-[#0CA854] bg-emerald-50/50 shadow-xs' : 'border-slate-200 bg-white'
                      }">
                        <div class="flex items-center justify-between">
                          <input type="radio" name="modal-booking-mode" value="in-person" ${currentMode === 'in-person' ? 'checked' : ''} class="modal-mode-radio text-[#0CA854]" />
                          <span class="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">OPD</span>
                        </div>
                        <div class="mt-2 space-y-0.5">
                          <div class="font-bold text-slate-900 text-xs flex items-center gap-1">
                            <i data-lucide="building-2" class="w-3.5 h-3.5 text-[#0CA854]"></i> In-Person
                          </div>
                          <p class="text-[10px] text-slate-500">Hospital Visit</p>
                        </div>
                        <div class="mt-2 font-black text-emerald-700 text-xs">₹${doc.inPersonFee || 500}</div>
                      </label>

                      <label class="p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                        currentMode === 'hybrid' ? 'border-amber-500 bg-amber-50/50 shadow-xs' : 'border-slate-200 bg-white'
                      }">
                        <div class="flex items-center justify-between">
                          <input type="radio" name="modal-booking-mode" value="hybrid" ${currentMode === 'hybrid' ? 'checked' : ''} class="modal-mode-radio text-amber-600" />
                          <span class="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">Best</span>
                        </div>
                        <div class="mt-2 space-y-0.5">
                          <div class="font-bold text-slate-900 text-xs flex items-center gap-1">
                            <i data-lucide="repeat" class="w-3.5 h-3.5 text-amber-600"></i> Hybrid
                          </div>
                          <p class="text-[10px] text-slate-500">Video + Hospital</p>
                        </div>
                        <div class="mt-2 font-black text-amber-700 text-xs">₹${doc.hybridFee || 650}</div>
                      </label>

                    </div>
                  </div>

                  <!-- 2. Select Date & Slot -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label class="block font-bold text-slate-800 mb-1">Appointment Date *</label>
                      <select id="modal-booking-date" class="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0CA854] font-semibold">
                        ${(doc.availableDates || ["Today", "Tomorrow", "Fri, 05 Sep"]).map(d => `
                          <option value="${d}" ${state.portal.bookingDate === d ? 'selected' : ''}>${d}</option>
                        `).join('')}
                      </select>
                    </div>

                    <div>
                      <label class="block font-bold text-slate-800 mb-1">Time Slot *</label>
                      <select id="modal-booking-slot" class="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0CA854] font-semibold">
                        <optgroup label="Morning Slots">
                          ${(slots.morning || []).map(s => `<option value="${s}" ${state.portal.bookingSlot === s ? 'selected' : ''}>${s}</option>`).join('')}
                        </optgroup>
                        <optgroup label="Afternoon Slots">
                          ${(slots.afternoon || []).map(s => `<option value="${s}" ${state.portal.bookingSlot === s ? 'selected' : ''}>${s}</option>`).join('')}
                        </optgroup>
                        <optgroup label="Evening Slots">
                          ${(slots.evening || []).map(s => `<option value="${s}" ${state.portal.bookingSlot === s ? 'selected' : ''}>${s}</option>`).join('')}
                        </optgroup>
                      </select>
                    </div>
                  </div>

                  <!-- 3. Symptoms / Chief Complaint -->
                  <div>
                    <label class="block font-bold text-slate-800 mb-1">Primary Symptoms / Reason for Consultation *</label>
                    <textarea id="modal-booking-complaint" required rows="2" placeholder="e.g. Experiencing persistent fever and chest tightness since yesterday..." class="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0CA854]">${state.portal.bookingComplaint || ''}</textarea>
                  </div>

                  <!-- 4. Patient Name & Phone -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label class="block font-bold text-slate-800 mb-1">Patient Name</label>
                      <input type="text" id="modal-patient-name" value="${patientName}" required class="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0CA854]" />
                    </div>
                    <div>
                      <label class="block font-bold text-slate-800 mb-1">Mobile Number (For Slot SMS & Video Link)</label>
                      <input type="text" id="modal-patient-phone" value="+91 98201 44556" required class="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0CA854]" />
                    </div>
                  </div>

                  <!-- 5. Fee Summary & Action -->
                  <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <div class="text-[10px] text-slate-400 uppercase font-semibold">Consultation Fee</div>
                      <div class="text-xl font-black text-slate-900">₹${fee.toFixed(2)}</div>
                      <div class="text-[10px] text-emerald-600 font-bold">ABDM Token Pass Generated</div>
                    </div>

                    <button type="submit" class="px-6 py-3.5 rounded-2xl ${
                      currentMode === 'video' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700' : 'bg-[#0CA854] hover:bg-[#087F3F]'
                    } text-white font-black text-xs shadow-lg transition-all hover:scale-102 flex items-center gap-2">
                      <i data-lucide="${currentMode === 'video' ? 'video' : 'check'}" class="w-4 h-4"></i>
                      <span>Confirm & Book ${currentMode === 'video' ? 'Video Slot' : currentMode === 'hybrid' ? 'Hybrid Care' : 'OPD Visit'}</span>
                    </button>
                  </div>

                </form>

              </div>
            </div>
          `;
        })()}

        <!-- ==========================================
             MODAL: LIVE TELEMEDICINE HD VIDEO CALL ROOM
             ========================================== -->
        ${(() => {
          const call = state.portal.activeVideoCall;
          if (!call) return '';

          return `
            <div id="telemedicine-video-modal" class="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between p-4 md:p-6 animate-in fade-in zoom-in duration-300">
              
              <!-- Video Room Top Bar -->
              <div class="flex items-center justify-between bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 border border-slate-800 text-white relative z-10">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center font-bold">
                    <i data-lucide="video" class="w-5 h-5 text-white"></i>
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <h3 class="font-black text-sm md:text-base text-white">${call.doctorName || 'Dr. Ananya Sharma'}</h3>
                      <span class="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase">
                        HD LIVE CALL ACTIVE
                      </span>
                    </div>
                    <p class="text-[11px] text-slate-400">${call.dept || 'General Medicine'} · CareForge ABDM Encrypted Room</p>
                  </div>
                </div>

                <div class="flex items-center gap-3">
                  <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 text-slate-200 text-xs font-mono font-bold">
                    <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span id="call-timer-display">04:18 Mins</span>
                  </div>

                  <button id="btn-end-video-call" class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-lg flex items-center gap-1.5 transition-all">
                    <i data-lucide="phone-off" class="w-4 h-4"></i>
                    <span>End Consultation</span>
                  </button>
                </div>
              </div>

              <!-- Main Video Stage -->
              <div class="relative flex-1 my-4 rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
                
                <!-- Doctor Main Video Stream (Simulated HD Feed) -->
                <div class="relative w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-4">
                  <div class="relative group">
                    <div class="w-36 h-36 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-emerald-500 shadow-2xl mx-auto">
                      <img src="${call.doctorImage || '/neutral_glass_doctor_1788294019521.jpg'}" alt="Doctor Stream" class="w-full h-full object-cover" />
                    </div>
                    <span class="absolute bottom-2 right-2 px-2.5 py-0.5 rounded-full bg-slate-900/90 text-emerald-400 border border-emerald-400/40 text-[10px] font-black uppercase flex items-center gap-1">
                      <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Doctor Speaking
                    </span>
                  </div>

                  <div class="space-y-1">
                    <h2 class="text-xl md:text-2xl font-black text-white">${call.doctorName || 'Dr. Ananya Sharma'}</h2>
                    <p class="text-xs text-slate-400 max-w-md mx-auto">
                      "Hello ${patientName}! I have reviewed your chief complaint. How are you feeling right now?"
                    </p>
                  </div>

                  <!-- Audio Waveform Visualizer Simulation -->
                  <div class="flex items-center gap-1.5 h-6">
                    <span class="w-1.5 h-3 bg-emerald-400 rounded-full animate-bounce"></span>
                    <span class="w-1.5 h-6 bg-emerald-400 rounded-full animate-pulse"></span>
                    <span class="w-1.5 h-4 bg-emerald-400 rounded-full animate-bounce"></span>
                    <span class="w-1.5 h-7 bg-emerald-400 rounded-full animate-pulse"></span>
                    <span class="w-1.5 h-3 bg-emerald-400 rounded-full animate-bounce"></span>
                  </div>
                </div>

                <!-- Self Video View (Patient Camera Stream) -->
                <div class="absolute bottom-4 right-4 w-32 md:w-48 h-24 md:h-36 rounded-2xl overflow-hidden border-2 border-slate-700 bg-slate-800 shadow-2xl flex items-center justify-center text-white">
                  <div class="text-center space-y-1 p-2">
                    <div class="w-8 h-8 rounded-full bg-emerald-600/30 text-emerald-400 mx-auto flex items-center justify-center font-bold text-xs">
                      ${patientName.charAt(0)}
                    </div>
                    <div class="text-[10px] font-bold text-slate-300 line-clamp-1">You (${patientName})</div>
                    <div class="text-[8px] text-emerald-400 font-mono">Camera HD Active</div>
                  </div>
                </div>

              </div>

              <!-- Meeting Controls Dock -->
              <div class="flex items-center justify-center gap-3 bg-slate-900/90 backdrop-blur-md rounded-2xl p-3 border border-slate-800 max-w-lg mx-auto w-full">
                <button onclick="this.classList.toggle('bg-rose-600'); this.classList.toggle('bg-slate-800')" class="w-12 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-all" title="Toggle Microphone">
                  <i data-lucide="mic" class="w-5 h-5"></i>
                </button>

                <button onclick="this.classList.toggle('bg-rose-600'); this.classList.toggle('bg-slate-800')" class="w-12 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-all" title="Toggle Camera">
                  <i data-lucide="video" class="w-5 h-5"></i>
                </button>

                <button onclick="alert('Doctor screen shared successfully.')" class="w-12 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-all" title="Share Screen">
                  <i data-lucide="monitor" class="w-5 h-5"></i>
                </button>

                <button onclick="alert('Doctor Prescription Pad generated and linked to your pharmacy cart.')" class="px-4 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all">
                  <i data-lucide="pill" class="w-4 h-4 text-white"></i>
                  <span class="hidden sm:inline">Rx Notepad</span>
                </button>

                <button id="btn-end-video-call-dock" class="w-12 h-12 rounded-xl bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center transition-all" title="End Call">
                  <i data-lucide="phone-off" class="w-5 h-5"></i>
                </button>
              </div>

            </div>
          `;
        })()}

      </div>
    `;
  }

  function attachPortalListeners() {
    // 1. Hero checkin button
    $('#hero-start-checkin-btn')?.addEventListener('click', () => {
      state.currentTab = 'kiosk';
      renderApp();
    });

    // 2. Dismiss physical verification notice
    $('#btn-dismiss-physical-notice')?.addEventListener('click', () => {
      localStorage.removeItem('careforge_physical_notice');
      const banner = document.getElementById('banner-physical-verification');
      if (banner) banner.style.display = 'none';
    });

    // 3. Mode filter buttons
    $$('.booking-mode-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.portal.selectedMode = btn.getAttribute('data-booking-mode');
        renderActiveTab();
      });
    });

    // 4. Date filter buttons
    $$('.booking-date-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.portal.selectedDate = btn.getAttribute('data-booking-date');
        renderActiveTab();
      });
    });

    // 5. Department Select dropdown
    $('#portal-dept-select')?.addEventListener('change', (e) => {
      state.portal.selectedDeptId = e.target.value;
      renderActiveTab();
    });

    // 6. Doctor Search Input
    const searchDocInput = $('#portal-doctor-search-input');
    if (searchDocInput) {
      searchDocInput.addEventListener('input', (e) => {
        state.portal.doctorSearchText = e.target.value;
        renderActiveTab();
        const newIn = $('#portal-doctor-search-input');
        if (newIn) {
          newIn.focus();
          newIn.setSelectionRange(newIn.value.length, newIn.value.length);
        }
      });
    }

    $('#portal-doctor-clear-search')?.addEventListener('click', () => {
      state.portal.doctorSearchText = '';
      renderActiveTab();
    });

    $('#portal-btn-reset-filters')?.addEventListener('click', () => {
      state.portal.selectedDeptId = 'all';
      state.portal.selectedMode = 'all';
      state.portal.selectedDate = 'Today';
      state.portal.doctorSearchText = '';
      renderActiveTab();
    });

    // 7. Quick Time Slot Click
    $$('.btn-quick-slot-pick').forEach(btn => {
      btn.addEventListener('click', () => {
        const docId = btn.getAttribute('data-doc-id');
        const slotTime = btn.getAttribute('data-slot-time');
        const doc = (window.MEDIKIOSIK_DATA.doctors || []).find(d => d.id === docId);
        if (doc) {
          state.portal.selectedDoctorForBooking = doc;
          state.portal.bookingSlot = slotTime;
          state.portal.bookingModalOpen = true;
          renderActiveTab();
        }
      });
    });

    // 8. Open Doctor Booking Modal
    $$('.btn-open-doctor-booking').forEach(btn => {
      btn.addEventListener('click', () => {
        const docId = btn.getAttribute('data-doc-id');
        const preferredMode = btn.getAttribute('data-preferred-mode') || 'video';
        const doc = (window.MEDIKIOSIK_DATA.doctors || []).find(d => d.id === docId);
        if (doc) {
          state.portal.selectedDoctorForBooking = doc;
          state.portal.bookingMode = preferredMode;
          state.portal.bookingModalOpen = true;
          renderActiveTab();
        }
      });
    });

    // 9. Close Booking Modal
    $('#btn-close-booking-modal')?.addEventListener('click', () => {
      state.portal.bookingModalOpen = false;
      renderActiveTab();
    });

    // 10. Booking Mode Radio in Modal
    $$('.modal-mode-radio').forEach(r => {
      r.addEventListener('change', (e) => {
        state.portal.bookingMode = e.target.value;
        renderActiveTab();
      });
    });

    // 11. Booking Date & Slot in Modal
    $('#modal-booking-date')?.addEventListener('change', (e) => {
      state.portal.bookingDate = e.target.value;
    });
    $('#modal-booking-slot')?.addEventListener('change', (e) => {
      state.portal.bookingSlot = e.target.value;
    });

    // 12. Submit Doctor Booking Form
    $('#portal-booking-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const doc = state.portal.selectedDoctorForBooking;
      if (!doc) return;

      const user = JSON.parse(localStorage.getItem('careforge_user')) || {};
      const patientId = user.id || state.kiosk.patient.id || 'pat-1';
      const patientName = $('#modal-patient-name')?.value || user.name || 'Aditya Verma';
      const mode = state.portal.bookingMode || 'video';
      const date = $('#modal-booking-date')?.value || state.portal.bookingDate || 'Today';
      const slot = $('#modal-booking-slot')?.value || state.portal.bookingSlot || '10:30 AM';
      const complaint = $('#modal-booking-complaint')?.value || 'General consultation';
      const fee = mode === 'video' ? (doc.videoFee || 400) : mode === 'hybrid' ? (doc.hybridFee || 650) : (doc.inPersonFee || 500);

      const aptId = `APT-${Math.floor(1000 + Math.random() * 9000)}`;
      const appointmentObj = {
        id: aptId,
        patientId: patientId,
        patientName: patientName,
        doctorId: doc.id,
        doctorName: doc.name,
        dept: doc.dept,
        date: date,
        time: slot,
        mode: mode,
        status: 'Confirmed',
        fee: fee,
        room: doc.room || 'OPD Room 04',
        videoRoomUrl: doc.videoRoomUrl || `https://meet.careforge.live/room-${aptId}`,
        complaint: complaint
      };

      if (window.SyncEngine) {
        window.SyncEngine.addAppointment(appointmentObj);
      }

      state.portal.bookingModalOpen = false;

      if (mode === 'video' || mode === 'hybrid') {
        alert(`Appointment ${aptId} confirmed! Live Video Consultation link generated.`);
      } else {
        alert(`In-Person OPD Token #${aptId} booked for ${doc.name} at ${doc.room || 'OPD Room 04'}!`);
      }

      renderActiveTab();
    });

    // 13. Cancel Appointment
    $$('.btn-cancel-appointment').forEach(btn => {
      btn.addEventListener('click', () => {
        const aptId = btn.getAttribute('data-apt-id');
        if (confirm(`Cancel appointment ${aptId}?`)) {
          if (window.SyncEngine) {
            window.SyncEngine.cancelAppointment(aptId);
          }
          renderActiveTab();
        }
      });
    });

    // 14. Launch Telemedicine Video Call Room
    $$('.btn-launch-video-call').forEach(btn => {
      btn.addEventListener('click', () => {
        const docName = btn.getAttribute('data-doc-name');
        const docDept = btn.getAttribute('data-doc-dept');
        const roomUrl = btn.getAttribute('data-room-url');
        const doc = (window.MEDIKIOSIK_DATA.doctors || []).find(d => d.name === docName);

        state.portal.activeVideoCall = {
          doctorName: docName,
          dept: docDept,
          doctorImage: doc?.image || '/neutral_glass_doctor_1788294019521.jpg',
          roomUrl: roomUrl
        };
        renderActiveTab();
      });
    });

    // 15. End Video Call
    $('#btn-end-video-call')?.addEventListener('click', () => {
      state.portal.activeVideoCall = null;
      renderActiveTab();
    });
    $('#btn-end-video-call-dock')?.addEventListener('click', () => {
      state.portal.activeVideoCall = null;
      renderActiveTab();
    });

    // Auto-refresh when sync triggers
    if (!window._careforge_portal_sync_attached) {
      window._careforge_portal_sync_attached = true;
      window.addEventListener('careforge_sync_updated', () => {
        if (state.currentTab === 'portal') {
          renderActiveTab();
        }
      });
    }
  }

  // ==========================================
  // 2. PATIENT MEDIKIOSK (TOUCH & VOICE KIOSK)
  // ==========================================
  function getKioskHTML() {
    const isHi = state.kiosk.lang === 'hi';

    return `
      <div class="max-w-4xl mx-auto space-y-6 pb-12">
        <!-- Kiosk Header -->
        <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-[#0CA854] text-white flex items-center justify-center shadow-lg shadow-emerald-600/30">
              <i data-lucide="tablet" class="w-8 h-8"></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-xl font-bold text-slate-900">${getI18n('kioskTitle')}</h2>
                <span class="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-emerald-100 text-[#0CA854]">OPD Kiosk #01</span>
              </div>
              <p class="text-xs text-slate-500 mt-0.5">${getI18n('touchVoiceSub')}</p>
            </div>
          </div>

          <!-- Language Switcher -->
          <div class="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl self-start md:self-auto">
            <button id="kiosk-lang-en" class="px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              !isHi ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }">
              English
            </button>
            <button id="kiosk-lang-hi" class="px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              isHi ? 'bg-[#0CA854] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }">
              हिन्दी (Hindi)
            </button>
          </div>
        </div>

        <!-- Progress Tracker -->
        <div class="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div class="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>Step ${state.kiosk.step} of 7: ${getStepTitle(state.kiosk.step)}</span>
            <span>${Math.round((state.kiosk.step / 7) * 100)}% Completed</span>
          </div>
          <div class="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-emerald-500 to-[#0CA854] rounded-full transition-all duration-300" style="width: ${(state.kiosk.step / 7) * 100}%"></div>
          </div>
        </div>

        <!-- Step Container -->
        <div id="kiosk-step-content" class="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 md:p-8 min-h-[480px] flex flex-col justify-between">
          <!-- Dynamic Step Content -->
        </div>
      </div>
    `;
  }

  function getStepTitle(step) {
    const titles = {
      1: getI18n('step1'),
      2: getI18n('step2'),
      3: getI18n('step3'),
      4: getI18n('step4'),
      5: getI18n('step5'),
      6: getI18n('step6'),
      7: getI18n('step7')
    };
    return titles[step] || '';
  }

  function renderKioskStep() {
    const container = $('#kiosk-step-content');
    if (!container) return;

    const p = state.kiosk.patient;
    const isHi = state.kiosk.lang === 'hi';

    if (state.kiosk.step === 1) {
      container.innerHTML = `
        <div class="space-y-6">
          <div class="border-b border-slate-100 pb-4">
            <h3 class="text-xl font-bold text-slate-900">${getI18n('step1')}</h3>
            <p class="text-xs text-slate-500 mt-1">Please enter your basic information or scan your ABHA Health Card.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-xs font-bold text-slate-700 uppercase">${getI18n('patientName')} *</label>
              <input id="input-pat-name" type="text" value="${p.name}" placeholder="e.g. Ramesh Chandra / अनीता देवी" class="w-full px-4 py-3.5 rounded-xl border border-slate-300 text-slate-900 text-base focus:ring-2 focus:ring-[#0CA854] outline-none" />
            </div>

            <div class="space-y-2">
              <label class="text-xs font-bold text-slate-700 uppercase">${getI18n('phoneOrAbha')}</label>
              <input id="input-pat-phone" type="text" value="${p.phone || p.abhaId}" placeholder="e.g. 9876543210 or 32-1123-4455-9001" class="w-full px-4 py-3.5 rounded-xl border border-slate-300 text-slate-900 text-base focus:ring-2 focus:ring-[#0CA854] outline-none" />
            </div>

            <div class="space-y-2">
              <label class="text-xs font-bold text-slate-700 uppercase">${getI18n('age')} *</label>
              <input id="input-pat-age" type="number" min="1" max="120" value="${p.age || ''}" placeholder="e.g. 48" class="w-full px-4 py-3.5 rounded-xl border border-slate-300 text-slate-900 text-base focus:ring-2 focus:ring-[#0CA854] outline-none" />
            </div>

            <div class="space-y-2">
              <label class="text-xs font-bold text-slate-700 uppercase">${getI18n('gender')}</label>
              <div class="grid grid-cols-3 gap-2">
                ${['Male', 'Female', 'Other'].map(g => `
                  <button type="button" class="gender-chip-btn py-3 rounded-xl border text-xs font-bold transition-all ${
                    p.gender === g ? 'bg-emerald-50 border-[#0CA854] text-[#0CA854]' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }" data-gender="${g}">
                    ${isHi ? (g === 'Male' ? 'पुरुष' : (g === 'Female' ? 'महिला' : 'अन्य')) : g}
                  </button>
                `).join('')}
              </div>
            </div>
          </div>

          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <div class="flex items-center gap-2">
              <i data-lucide="shield-check" class="w-4 h-4 text-[#0CA854]"></i>
              <span>ABDM ABHA Health ID Sync Enabled</span>
            </div>
            <button id="btn-quick-fill-demo" class="text-xs font-bold text-[#0CA854] hover:underline">
              ⚡ Quick Fill Sample Profile
            </button>
          </div>
        </div>

        <div class="pt-6 border-t border-slate-100 flex items-center justify-end">
          <button id="kiosk-next-1" class="kiosk-btn px-8 py-3.5 rounded-xl bg-[#0CA854] hover:bg-[#087F3F] text-white font-bold text-base shadow-lg shadow-emerald-700/30 flex items-center gap-2">
            <span>${getI18n('btnNext')}</span>
          </button>
        </div>
      `;

      $('#btn-quick-fill-demo')?.addEventListener('click', () => {
        state.kiosk.patient.name = isHi ? 'राजेश कुमार शर्मा' : 'Rajesh Kumar Sharma';
        state.kiosk.patient.age = 56;
        state.kiosk.patient.phone = '+91 98712 34567';
        state.kiosk.patient.abhaId = '32-9845-1120-4491';
        renderKioskStep();
      });

      $$('.gender-chip-btn').forEach(b => {
        b.addEventListener('click', () => {
          state.kiosk.patient.gender = b.getAttribute('data-gender');
          renderKioskStep();
        });
      });

      $('#kiosk-next-1')?.addEventListener('click', () => {
        state.kiosk.patient.name = $('#input-pat-name').value || 'Patient ' + Math.floor(Math.random() * 900);
        state.kiosk.patient.phone = $('#input-pat-phone').value || '+91 98000 11223';
        state.kiosk.patient.age = $('#input-pat-age').value || '45';
        state.kiosk.step = 2;
        renderKioskStep();
      });

    } else if (state.kiosk.step === 2) {
      container.innerHTML = `
        <div class="space-y-6">
          <div class="border-b border-slate-100 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <h3 class="text-xl font-bold text-slate-900">${getI18n('step2')}</h3>
              <p class="text-xs text-slate-500 mt-1">${getI18n('speakHelp')}</p>
            </div>
            <button id="kiosk-speak-guide-btn" class="self-start md:self-auto text-xs font-bold text-[#0CA854] bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5">
              <i data-lucide="volume-2" class="w-4 h-4"></i>
              <span>${isHi ? 'निर्देश सुनें' : 'Listen Voice Guide'}</span>
            </button>
          </div>

          <div class="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-[#0F2942] text-white flex flex-col items-center justify-center text-center space-y-4 shadow-xl">
            <div id="voice-mic-container" class="relative cursor-pointer">
              <div id="voice-pulse-ring" class="absolute -inset-4 rounded-full bg-[#0CA854]/30 ${state.kiosk.isListening ? 'voice-ripple' : 'hidden'}"></div>
              <button id="voice-mic-btn" class="relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                state.kiosk.isListening 
                  ? 'bg-red-500 shadow-xl shadow-red-500/50 scale-110' 
                  : 'bg-[#0CA854] hover:bg-[#087F3F] shadow-lg shadow-emerald-500/40'
              }">
                <i data-lucide="${state.kiosk.isListening ? 'mic-off' : 'mic'}" class="w-10 h-10 text-white"></i>
              </button>
            </div>

            <div>
              <div class="text-base font-bold">
                ${state.kiosk.isListening ? getI18n('listening') : getI18n('tapMicToSpeak')}
              </div>
              <div class="text-xs text-slate-300 mt-1">Supports Indian English, Hindi & Hinglish</div>
            </div>

            ${state.kiosk.isListening ? `
              <div class="flex items-center gap-1.5 h-8">
                <span class="w-1.5 bg-emerald-400 rounded-full wave-bar"></span>
                <span class="w-1.5 bg-emerald-400 rounded-full wave-bar"></span>
                <span class="w-1.5 bg-emerald-400 rounded-full wave-bar"></span>
                <span class="w-1.5 bg-emerald-400 rounded-full wave-bar"></span>
                <span class="w-1.5 bg-emerald-400 rounded-full wave-bar"></span>
                <span class="w-1.5 bg-emerald-400 rounded-full wave-bar"></span>
              </div>
            ` : ''}
          </div>

          <div class="space-y-2">
            <label class="text-xs font-bold text-slate-700 uppercase">Chief Complaint / मुख्य समस्या</label>
            <textarea id="kiosk-complaint-input" rows="3" placeholder="${isHi ? 'जैसे: 3 दिन से बुखार, खांसी और सीने में भारीपन है...' : 'e.g. Severe chest pain, fever and dry cough for 3 days...'}" class="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-[#0CA854] outline-none">${p.chiefComplaint}</textarea>
          </div>

          <div class="space-y-2">
            <label class="text-xs font-bold text-slate-700 uppercase">${getI18n('commonSymptomsTitle')}</label>
            <div class="flex flex-wrap gap-2">
              ${window.MEDIKIOSIK_DATA.symptomChips.map(chip => {
                const text = isHi ? chip.hi : chip.en;
                const isSelected = p.selectedSymptoms.includes(text);
                return `
                  <button type="button" class="symptom-chip-btn px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    isSelected 
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                      : (chip.isEmergency ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100')
                  }" data-symptom="${text}" data-emergency="${!!chip.isEmergency}">
                    ${chip.isEmergency ? '⚠️ ' : ''}${text}
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <div class="pt-6 border-t border-slate-100 flex items-center justify-between">
          <button id="kiosk-back-2" class="kiosk-btn px-6 py-3.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-sm">
            ${getI18n('btnBack')}
          </button>
          <button id="kiosk-next-2" class="kiosk-btn px-8 py-3.5 rounded-xl bg-[#0CA854] hover:bg-[#087F3F] text-white font-bold text-base shadow-lg shadow-emerald-700/30 flex items-center gap-2">
            <span>${getI18n('btnNext')}</span>
          </button>
        </div>
      `;

      $('#voice-mic-btn')?.addEventListener('click', toggleVoiceInput);
      
      $('#kiosk-speak-guide-btn')?.addEventListener('click', () => {
        speakVoiceFeedback(isHi ? 'कृपया माइक्रोफ़ोन दबाकर अपनी समस्या बताएं, या नीचे दिए गए लक्षणों को चुनें।' : 'Please tap the microphone and speak your problem or select from the symptom tags below.');
      });

      $('#kiosk-complaint-input')?.addEventListener('input', (e) => {
        state.kiosk.patient.chiefComplaint = e.target.value;
        checkRedFlagEmergencyRules(e.target.value);
      });

      $$('.symptom-chip-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const sym = btn.getAttribute('data-symptom');
          const isEmg = btn.getAttribute('data-emergency') === 'true';
          const idx = p.selectedSymptoms.indexOf(sym);
          if (idx > -1) {
            p.selectedSymptoms.splice(idx, 1);
          } else {
            p.selectedSymptoms.push(sym);
            if (!p.chiefComplaint.includes(sym)) {
              p.chiefComplaint = p.chiefComplaint ? p.chiefComplaint + ', ' + sym : sym;
            }
          }
          if (isEmg) {
            state.kiosk.isRedFlagTriggered = true;
            triggerRedFlagAlertModal();
          }
          renderKioskStep();
        });
      });

      $('#kiosk-back-2')?.addEventListener('click', () => {
        state.kiosk.step = 1;
        renderKioskStep();
      });

      $('#kiosk-next-2')?.addEventListener('click', () => {
        state.kiosk.patient.chiefComplaint = $('#kiosk-complaint-input').value;
        checkRedFlagEmergencyRules(state.kiosk.patient.chiefComplaint);
        state.kiosk.step = 3;
        renderKioskStep();
      });

    } else if (state.kiosk.step === 3) {
      container.innerHTML = `
        <div class="space-y-8">
          <div class="border-b border-slate-100 pb-4">
            <h3 class="text-xl font-bold text-slate-900">${getI18n('step3')}</h3>
            <p class="text-xs text-slate-500 mt-1">Specify how long this symptom has lasted and rate your discomfort level.</p>
          </div>

          <div class="space-y-3">
            <label class="text-xs font-bold text-slate-700 uppercase">${getI18n('durationQuestion')}</label>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              ${window.MEDIKIOSIK_DATA.durations.map(d => {
                const text = isHi ? d.hi : d.en;
                const isSelected = p.duration === text || p.duration === d.en;
                return `
                  <button type="button" class="duration-chip-btn p-4 rounded-xl border text-left font-semibold text-xs transition-all ${
                    isSelected 
                      ? 'bg-emerald-50 border-[#0CA854] text-[#0CA854] ring-2 ring-[#0CA854]/20' 
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }" data-duration="${text}">
                    <div class="font-bold text-sm text-slate-900 mb-0.5">${text}</div>
                    <div class="text-[11px] text-slate-500">${isHi ? 'समय अवधि' : 'Onset timeline'}</div>
                  </button>
                `;
              }).join('')}
            </div>
          </div>

          <div class="space-y-4 p-6 rounded-2xl bg-slate-50 border border-slate-200">
            <div class="flex items-center justify-between">
              <label class="text-xs font-bold text-slate-700 uppercase">${getI18n('painScaleQuestion')}</label>
              <span id="pain-score-display" class="px-3 py-1 rounded-full text-xs font-bold ${
                p.painScore >= 8 ? 'bg-red-100 text-red-700' : (p.painScore >= 5 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700')
              }">
                Score: ${p.painScore} / 10 (${getPainLabel(p.painScore, isHi)})
              </span>
            </div>

            <input id="pain-range-slider" type="range" min="1" max="10" value="${p.painScore}" class="w-full accent-[#0CA854] cursor-pointer h-3 bg-slate-200 rounded-lg" />

            <div class="flex justify-between text-[11px] font-bold text-slate-500">
              <span class="text-emerald-600">1-3: Mild (हल्का)</span>
              <span class="text-amber-600">4-6: Moderate (मध्यम)</span>
              <span class="text-orange-600">7-8: Severe (तीव्र)</span>
              <span class="text-red-600">9-10: Critical (असहनीय)</span>
            </div>
          </div>
        </div>

        <div class="pt-6 border-t border-slate-100 flex items-center justify-between">
          <button id="kiosk-back-3" class="kiosk-btn px-6 py-3.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-sm">
            ${getI18n('btnBack')}
          </button>
          <button id="kiosk-next-3" class="kiosk-btn px-8 py-3.5 rounded-xl bg-[#0CA854] hover:bg-[#087F3F] text-white font-bold text-base shadow-lg shadow-emerald-700/30 flex items-center gap-2">
            <span>${getI18n('btnNext')}</span>
          </button>
        </div>
      `;

      $$('.duration-chip-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          state.kiosk.patient.duration = btn.getAttribute('data-duration');
          renderKioskStep();
        });
      });

      $('#pain-range-slider')?.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        state.kiosk.patient.painScore = val;
        $('#pain-score-display').textContent = `Score: ${val} / 10 (${getPainLabel(val, isHi)})`;
        if (val >= 9) {
          state.kiosk.isRedFlagTriggered = true;
          triggerRedFlagAlertModal();
        }
      });

      $('#kiosk-back-3')?.addEventListener('click', () => {
        state.kiosk.step = 2;
        renderKioskStep();
      });

      $('#kiosk-next-3')?.addEventListener('click', () => {
        state.kiosk.step = 4;
        renderKioskStep();
      });

    } else if (state.kiosk.step === 4) {
      container.innerHTML = `
        <div class="space-y-6">
          <div class="border-b border-slate-100 pb-4">
            <h3 class="text-xl font-bold text-slate-900">${getI18n('step4')}</h3>
            <p class="text-xs text-slate-500 mt-1">Information regarding existing illnesses, ongoing prescriptions, and drug allergies.</p>
          </div>

          <div class="space-y-2">
            <label class="text-xs font-bold text-slate-700 uppercase">${getI18n('pastConditionsTitle')}</label>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              ${window.MEDIKIOSIK_DATA.pastDiseases.map(d => {
                const isSelected = p.pastConditions.includes(d.en);
                return `
                  <button type="button" class="past-dis-btn py-3 px-2 rounded-xl border text-xs font-bold transition-all text-center ${
                    isSelected ? 'bg-emerald-50 border-[#0CA854] text-[#0CA854]' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }" data-key="${d.en}">
                    ${d.en}
                  </button>
                `;
              }).join('')}
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-xs font-bold text-slate-700 uppercase">${getI18n('medsTitle')}</label>
            <input id="input-medications" type="text" value="${typeof p.medications === 'string' ? p.medications : ''}" placeholder="${isHi ? 'जैसे: टेलमिसार्टन 40mg, मेटफॉर्मिन 500mg...' : 'e.g. Telmisartan 40mg, Metformin 500mg...'}" class="w-full px-4 py-3.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-[#0CA854] outline-none" />
          </div>

          <div class="space-y-2">
            <label class="text-xs font-bold text-red-600 uppercase flex items-center gap-1">
              <i data-lucide="alert-triangle" class="w-3.5 h-3.5"></i>
              <span>${getI18n('allergiesTitle')}</span>
            </label>
            <div class="flex flex-wrap gap-2">
              ${window.MEDIKIOSIK_DATA.commonAllergies.map(a => {
                const text = isHi ? a.hi : a.en;
                const isSelected = p.allergies.includes(text);
                return `
                  <button type="button" class="allergy-chip-btn px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                    isSelected ? 'bg-red-50 border-red-500 text-red-600' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }" data-allergy="${text}">
                    ${text}
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <div class="pt-6 border-t border-slate-100 flex items-center justify-between">
          <button id="kiosk-back-4" class="kiosk-btn px-6 py-3.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-sm">
            ${getI18n('btnBack')}
          </button>
          <button id="kiosk-next-4" class="kiosk-btn px-8 py-3.5 rounded-xl bg-[#0CA854] hover:bg-[#087F3F] text-white font-bold text-base shadow-lg shadow-emerald-700/30 flex items-center gap-2">
            <span>${getI18n('btnNext')}</span>
          </button>
        </div>
      `;

      $$('.past-dis-btn').forEach(b => {
        b.addEventListener('click', () => {
          const k = b.getAttribute('data-key');
          const idx = p.pastConditions.indexOf(k);
          if (idx > -1) {
            p.pastConditions.splice(idx, 1);
          } else {
            p.pastConditions.push(k);
          }
          renderKioskStep();
        });
      });

      $$('.allergy-chip-btn').forEach(b => {
        b.addEventListener('click', () => {
          const a = b.getAttribute('data-allergy');
          const idx = p.allergies.indexOf(a);
          if (idx > -1) {
            p.allergies.splice(idx, 1);
          } else {
            p.allergies.push(a);
          }
          renderKioskStep();
        });
      });

      $('#kiosk-back-4')?.addEventListener('click', () => {
        state.kiosk.step = 3;
        renderKioskStep();
      });

      $('#kiosk-next-4')?.addEventListener('click', () => {
        state.kiosk.patient.medications = $('#input-medications').value;
        state.kiosk.step = 5;
        renderKioskStep();
      });

    } else if (state.kiosk.step === 5) {
      container.innerHTML = `
        <div class="space-y-6">
          <div class="border-b border-slate-100 pb-4">
            <h3 class="text-xl font-bold text-slate-900">${getI18n('scanDocumentTitle')}</h3>
            <p class="text-xs text-slate-500 mt-1">${getI18n('scanDocumentSub')}</p>
          </div>

          <div id="kiosk-ocr-scan-zone" class="p-8 rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#0CA854] bg-slate-50 flex flex-col items-center justify-center text-center space-y-4 transition-all relative overflow-hidden">
            <div id="ocr-scanner-laser" class="${state.kiosk.isScanning ? 'laser-beam' : 'hidden'}"></div>

            <div class="w-16 h-16 rounded-2xl bg-emerald-100 text-[#0CA854] flex items-center justify-center">
              <i data-lucide="${state.kiosk.isScanning ? 'loader-2' : 'scan-line'}" class="w-8 h-8 ${state.kiosk.isScanning ? 'animate-spin' : ''}"></i>
            </div>

            <div>
              <div class="text-base font-bold text-slate-900">
                ${state.kiosk.isScanning ? 'MediKiosik AI OCR Scanning...' : 'Place Prescription or Report under Kiosk Scanner'}
              </div>
              <div class="text-xs text-slate-500 mt-1">Supports Handwritten Prescriptions, Blood Reports, & Discharge Summaries</div>
            </div>

            <div class="flex items-center gap-3">
              <input type="file" id="hidden-file-input" class="hidden" accept="image/*,.pdf" />
              <button id="btn-trigger-upload" class="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2">
                <i data-lucide="upload" class="w-4 h-4"></i>
                <span>Upload From Device</span>
              </button>
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-xs font-bold text-slate-700 uppercase">${getI18n('chooseSampleDoc')}</label>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button data-doc-type="prescription" class="btn-sample-ocr p-3 rounded-xl border border-slate-200 hover:border-[#0CA854] bg-white text-left text-xs font-medium space-y-1 hover:shadow-md transition-all">
                <div class="font-bold text-slate-900 flex items-center gap-1.5 text-emerald-700">
                  <i data-lucide="file-text" class="w-4 h-4"></i> Sample OPD Prescription Slip
                </div>
                <div class="text-[11px] text-slate-500">Extracts Telmisartan, Metformin, BP readings</div>
              </button>

              <button data-doc-type="blood_report" class="btn-sample-ocr p-3 rounded-xl border border-slate-200 hover:border-purple-500 bg-white text-left text-xs font-medium space-y-1 hover:shadow-md transition-all">
                <div class="font-bold text-slate-900 flex items-center gap-1.5 text-purple-700">
                  <i data-lucide="activity" class="w-4 h-4"></i> Blood Glucose & Lipid Panel
                </div>
                <div class="text-[11px] text-slate-500">Extracts HbA1c (8.2%), Cholesterol, Glucose</div>
              </button>

              <button data-doc-type="xray_report" class="btn-sample-ocr p-3 rounded-xl border border-slate-200 hover:border-blue-500 bg-white text-left text-xs font-medium space-y-1 hover:shadow-md transition-all">
                <div class="font-bold text-slate-900 flex items-center gap-1.5 text-blue-700">
                  <i data-lucide="image" class="w-4 h-4"></i> Knee X-Ray Radiologist Report
                </div>
                <div class="text-[11px] text-slate-500">Extracts Grade 3-4 Osteoarthritis findings</div>
              </button>
            </div>
          </div>

          <div id="scanned-docs-list-container" class="space-y-2">
            ${getScannedDocsListHTML()}
          </div>
        </div>

        <div class="pt-6 border-t border-slate-100 flex items-center justify-between">
          <button id="kiosk-back-5" class="kiosk-btn px-6 py-3.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-sm">
            ${getI18n('btnBack')}
          </button>
          <button id="kiosk-next-5" class="kiosk-btn px-8 py-3.5 rounded-xl bg-[#0CA854] hover:bg-[#087F3F] text-white font-bold text-base shadow-lg shadow-emerald-700/30 flex items-center gap-2">
            <span>Review & Print Token →</span>
          </button>
        </div>
      `;

      $('#btn-trigger-upload')?.addEventListener('click', () => {
        const fileInput = document.getElementById('hidden-file-input');
        if (fileInput) fileInput.click();
      });

      $('#hidden-file-input')?.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(evt) {
          const dataUrl = evt.target.result;
          const isImage = file.type.startsWith('image/');

          // Build a real scanned doc entry with the actual file
          const docEntry = {
            title: file.name,
            ocrSnippet: `Uploaded file: ${file.name} (${(file.size / 1024).toFixed(1)} KB). AI extraction complete.`,
            dataUrl: dataUrl,   // base64 stored for preview
            isImage: isImage,
            extractedEntities: {
              finding: 'Uploaded Document',
              source: file.name
            }
          };

          // Remove any existing doc with same name
          state.kiosk.patient.scannedDocs = state.kiosk.patient.scannedDocs.filter(d => d.title !== file.name);
          state.kiosk.patient.scannedDocs.push(docEntry);
          state.kiosk.isScanning = false;
          renderOCRScanArea();
          renderScannedDocsList();

          // Reset file input so same file can be re-selected
          e.target.value = '';
        };

        // Show scanning animation while reading
        state.kiosk.isScanning = true;
        renderOCRScanArea();
        reader.readAsDataURL(file);
      });

      $$('.btn-sample-ocr').forEach(b => {
        b.addEventListener('click', () => {
          const type = b.getAttribute('data-doc-type');
          processOCRDocument(type);
        });
      });

      $('#kiosk-back-5')?.addEventListener('click', () => {
        state.kiosk.step = 4;
        renderKioskStep();
      });

      $('#kiosk-next-5')?.addEventListener('click', () => {
        generateKioskToken();
      });

    } else if (state.kiosk.step === 7) {
      const token = state.kiosk.generatedToken;
      const isRed = token.triageLevel === 'EMERGENCY_RED_FLAG';

      container.innerHTML = `
        <div class="space-y-6">
          <div class="text-center space-y-2">
            <div class="w-16 h-16 rounded-full ${isRed ? 'bg-red-100 text-red-600 red-flag-pulse' : 'bg-emerald-100 text-[#0CA854]'} mx-auto flex items-center justify-center">
              <i data-lucide="${isRed ? 'alert-octagon' : 'check-circle'}" class="w-8 h-8"></i>
            </div>
            <h3 class="text-2xl font-black text-slate-900">${getI18n('tokenGenerated')}</h3>
            <p class="text-xs text-slate-500">${getI18n('tokenMsg')}</p>
          </div>

          <div id="printable-token-slip" class="max-w-md mx-auto bg-white border-2 ${isRed ? 'border-red-500 shadow-red-100' : 'border-slate-900'} rounded-3xl p-6 shadow-2xl space-y-4">
            <div class="flex items-center justify-between border-b border-dashed border-slate-300 pb-3">
              <div>
                <div class="text-xs font-black text-[#0CA854]">MEDIKIOSIK OPD TOKEN</div>
                <div class="text-[10px] text-slate-500">AI Pre-Consultation Summary</div>
              </div>
              <div class="text-right">
                <span class="text-[10px] font-bold px-2 py-0.5 rounded ${isRed ? 'bg-red-600 text-white' : 'bg-slate-900 text-white'}">${token.triageLevel}</span>
              </div>
            </div>

            <div class="text-center py-2 bg-slate-50 rounded-2xl">
              <div class="text-xs font-bold text-slate-500">YOUR OPD TOKEN NUMBER</div>
              <div class="text-4xl font-black tracking-wider ${isRed ? 'text-red-600' : 'text-slate-900'} mt-1">${token.token}</div>
              <div class="text-[11px] text-slate-600 mt-1">Department: <strong>${token.department}</strong></div>
            </div>

            <div class="text-xs space-y-1.5 text-slate-700 pt-1">
              <div class="flex justify-between"><span class="text-slate-500">Patient:</span> <span class="font-bold">${token.name} (${token.age}y / ${token.gender})</span></div>
              <div class="flex justify-between"><span class="text-slate-500">ABHA ID:</span> <span class="font-mono text-[11px]">${token.abhaId}</span></div>
              <div class="flex justify-between"><span class="text-slate-500">Assigned Doctor:</span> <span class="font-bold text-[#0CA854]">${token.doctorName}</span></div>
              <div class="flex justify-between"><span class="text-slate-500">Time Checked-in:</span> <span>${token.checkInTime}</span></div>
            </div>

            <div class="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 text-xs space-y-1">
              <div class="font-bold text-[11px] text-emerald-800 flex items-center gap-1">
                <i data-lucide="sparkles" class="w-3.5 h-3.5"></i> AI Structured History Summary
              </div>
              <p class="text-[11px] text-slate-700 leading-relaxed">${token.aiSummary}</p>
            </div>
          </div>

          <div class="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button id="btn-print-token" class="kiosk-btn px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2">
              <i data-lucide="printer" class="w-4 h-4"></i>
              <span>Print Token Slip</span>
            </button>

            <button id="btn-reset-kiosk" class="kiosk-btn px-4 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold">
              New Patient
            </button>
          </div>

          <!-- Inline Chat with Doctor -->
          <div class="max-w-md mx-auto mt-4 w-full">
            <div class="flex items-center gap-3 mb-3 px-1">
              <div class="w-8 h-8 rounded-full bg-[#0CA854]/10 flex items-center justify-center">
                <i data-lucide="message-circle" class="w-4 h-4 text-[#0CA854]"></i>
              </div>
              <div>
                <h4 class="text-sm font-bold text-slate-900">Live Chat with ${token.doctorName}</h4>
                <p class="text-[10px] text-slate-500">Send a message — your doctor can respond from their dashboard</p>
              </div>
              <span class="ml-auto flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Live
              </span>
            </div>
            <div id="kiosk-chat-root" class="w-full"></div>
          </div>
        </div>
      `;

      // Show Chat Overlay when OPD is booked
      const overlay = document.getElementById('patient-portal-overlay');
      if (overlay) {
        overlay.classList.remove('hidden');
        overlay.classList.add('flex');
      }

      // Mount inline chat on receipt screen
      const kioskChatRoot = document.getElementById('kiosk-chat-root');
      const kioskToken = state.kiosk.generatedToken;
      function renderKioskChat() {
        if (kioskChatRoot && kioskToken && typeof RenderChatUI !== 'undefined') {
          kioskChatRoot.innerHTML = RenderChatUI(kioskToken.id, 'PATIENT', kioskToken.doctorName || 'Doctor');
          if (typeof AttachChatListeners !== 'undefined') AttachChatListeners();
          if (window.lucide) window.lucide.createIcons();
        }
      }
      renderKioskChat();

      // Listen for doctor replies and auto-refresh the inline chat
      window.addEventListener('careforge_sync_updated', function onKioskChatSync() {
        if (state.kiosk.step !== 7) {
          window.removeEventListener('careforge_sync_updated', onKioskChatSync);
          return;
        }
        renderKioskChat();
      });

      $('#btn-print-token')?.addEventListener('click', () => {
        window.print();
      });

      $('#btn-reset-kiosk')?.addEventListener('click', () => {
        if (overlay) {
          overlay.classList.add('hidden');
          overlay.classList.remove('flex');
        }

        // Clear saved session
        localStorage.removeItem('careforge_kiosk_session');

        state.kiosk.step = 1;
        state.kiosk.isRedFlagTriggered = false;
        state.kiosk.patient = {
          name: '',
          age: '',
          gender: 'Male',
          phone: '',
          abhaId: '',
          department: 'General Medicine & Triage',
          doctorName: 'Dr. Arjun Sharma',
          chiefComplaint: '',
          selectedSymptoms: [],
          duration: 'Just Today (< 24 Hours)',
          painScore: 5,
          pastConditions: [],
          medications: '',
          allergies: [],
          scannedDocs: []
        };
        state.kiosk.generatedToken = null;
        renderKioskStep();
      });
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function getScannedDocsListHTML() {
    if (!state.kiosk.patient.scannedDocs.length) {
      return `<div class="text-center py-4 text-xs text-slate-400">No documents scanned yet. You can skip or choose a sample above.</div>`;
    }

    return `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        ${state.kiosk.patient.scannedDocs.map(doc => `
          <div class="rounded-xl bg-white border border-emerald-300 shadow-sm overflow-hidden">
            ${doc.isImage && doc.dataUrl ? `
              <img src="${doc.dataUrl}" alt="${doc.title}" class="w-full h-32 object-cover bg-slate-100" />
            ` : ''}
            <div class="p-3 flex items-start justify-between gap-3">
              <div class="space-y-1 min-w-0">
                <div class="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                  <i data-lucide="check-circle-2" class="w-4 h-4 text-[#0CA854] flex-shrink-0"></i>
                  <span class="truncate">${doc.title}</span>
                </div>
                <p class="text-[11px] text-slate-600 line-clamp-2">${doc.ocrSnippet}</p>
              </div>
              <span class="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded flex-shrink-0">${doc.isImage ? 'IMG' : 'OCR OK'}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderOCRScanArea() {
    const laser = $('#ocr-scanner-laser');
    if (laser) {
      if (state.kiosk.isScanning) {
        laser.classList.remove('hidden');
      } else {
        laser.classList.add('hidden');
      }
    }
  }

  function renderScannedDocsList() {
    const container = $('#scanned-docs-list-container');
    if (container) {
      container.innerHTML = getScannedDocsListHTML();
      if (window.lucide) window.lucide.createIcons();
    }
  }

  function renderKioskVoiceUI() {
    const pulse = $('#voice-pulse-ring');
    const micBtn = $('#voice-mic-btn');
    if (pulse && micBtn) {
      if (state.kiosk.isListening) {
        pulse.classList.remove('hidden');
        micBtn.classList.add('bg-red-500', 'scale-110');
        micBtn.classList.remove('bg-[#0CA854]');
      } else {
        pulse.classList.add('hidden');
        micBtn.classList.remove('bg-red-500', 'scale-110');
        micBtn.classList.add('bg-[#0CA854]');
      }
    }
  }

  function getPainLabel(score, isHi) {
    if (score <= 3) return isHi ? 'हल्का' : 'Mild';
    if (score <= 6) return isHi ? 'मध्यम' : 'Moderate';
    if (score <= 8) return isHi ? 'तीव्र' : 'Severe';
    return isHi ? 'असहनीय' : 'Critical';
  }

  function attachKioskListeners() {
    $('#kiosk-lang-en')?.addEventListener('click', () => {
      state.kiosk.lang = 'en';
      renderActiveTab();
    });

    $('#kiosk-lang-hi')?.addEventListener('click', () => {
      state.kiosk.lang = 'hi';
      renderActiveTab();
    });
  }

  // ==========================================
  // 3. DOCTOR CLINICAL WORKSTATION
  // ==========================================
  function getDoctorDashboardHTML() {
    const patients = state.doctor.patients;
    const activePatient = patients.find(p => p.id === state.doctor.selectedPatientId) || patients[0];
    const filter = state.doctor.filterTriage;

    const filteredPatients = patients.filter(p => {
      if (filter !== 'ALL' && p.triageLevel !== filter) return false;
      if (state.doctor.searchQuery) {
        const q = state.doctor.searchQuery.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.token.toLowerCase().includes(q);
      }
      return true;
    });

    const isRed = activePatient.triageLevel === 'EMERGENCY_RED_FLAG';

    return `
      <div class="space-y-6 pb-12">
        <div class="bg-slate-900 text-white p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-[#0CA854] text-white flex items-center justify-center font-bold">
              <i data-lucide="stethoscope" class="w-6 h-6"></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-lg font-bold">MediKiosik Doctor Clinical Workstation</h2>
                <span class="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded font-mono">OPD-DOCTOR-PORTAL</span>
              </div>
              <p class="text-xs text-slate-400">Dr. Ananya Sharma | Senior Consultant (Room 04)</p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <div class="text-right">
              <div class="text-xs font-bold text-slate-300">OPD Patient Queue</div>
              <div class="text-sm font-extrabold text-emerald-400">${patients.length} Waiting (${patients.filter(p => p.triageLevel === 'EMERGENCY_RED_FLAG').length} Emergency)</div>
            </div>
            <button id="btn-refresh-queue" class="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors">
              <i data-lucide="refresh-cw" class="w-4 h-4"></i>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <!-- Queue Sidebar -->
          <div class="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4">
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <h3 class="font-bold text-sm text-slate-900">Today's Patient Queue</h3>
                <span class="text-xs text-slate-500 font-semibold">${filteredPatients.length} Active</span>
              </div>

              <div class="relative">
                <i data-lucide="search" class="w-4 h-4 absolute left-3 top-3 text-slate-400"></i>
                <input id="doc-search-queue" type="text" placeholder="Search by name or token..." value="${state.doctor.searchQuery}" class="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-[#0CA854]" />
              </div>

              <div class="flex flex-wrap gap-1.5 pt-1">
                ${[
                  { key: 'ALL', label: 'All' },
                  { key: 'EMERGENCY_RED_FLAG', label: '🚨 Red Flag' },
                  { key: 'URGENT', label: '⚠️ Urgent' },
                  { key: 'ROUTINE', label: '🟢 Routine' }
                ].map(f => `
                  <button class="triage-filter-btn px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    filter === f.key ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }" data-triage="${f.key}">
                    ${f.label}
                  </button>
                `).join('')}
              </div>
            </div>

            <div class="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              ${filteredPatients.map(p => {
                const isSelected = p.id === activePatient.id;
                const isPatRed = p.triageLevel === 'EMERGENCY_RED_FLAG';
                return `
                  <div data-pat-id="${p.id}" class="patient-queue-card cursor-pointer p-3.5 rounded-xl border transition-all ${
                    isSelected 
                      ? 'bg-emerald-50/70 border-[#0CA854] shadow-sm' 
                      : (isPatRed ? 'bg-red-50/60 border-red-300 hover:border-red-500' : 'bg-white border-slate-200 hover:border-slate-400')
                  }">
                    <div class="flex items-center justify-between mb-1">
                      <span class="font-mono text-[11px] font-extrabold ${isPatRed ? 'text-red-700 font-black' : 'text-slate-700'}">${p.token}</span>
                      <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isPatRed ? 'bg-red-600 text-white red-flag-pulse' : (p.triageLevel === 'URGENT' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700')
                      }">
                        ${p.triageLevel === 'EMERGENCY_RED_FLAG' ? '🚨 EMERGENCY' : p.triageLevel}
                      </span>
                    </div>

                    <div class="font-bold text-slate-900 text-sm">${p.name}</div>
                    <div class="text-xs text-slate-500">${p.age}y / ${p.gender} • Arrived ${p.checkInTime}</div>
                    <div class="text-xs text-slate-700 font-medium line-clamp-1 mt-1">${p.chiefComplaint}</div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Dossier Pane -->
          <div class="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl ${isRed ? 'bg-red-50 border border-red-300' : 'bg-slate-50 border border-slate-200'}">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <h3 class="text-xl font-extrabold text-slate-900">${activePatient.name}</h3>
                  <span class="text-xs font-mono bg-white px-2 py-0.5 rounded border font-semibold">${activePatient.token}</span>
                </div>
                <div class="text-xs text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
                  <span><strong>Age/Sex:</strong> ${activePatient.age} Yrs / ${activePatient.gender}</span>
                  <span><strong>Phone:</strong> ${activePatient.phone}</span>
                  <span><strong>ABHA:</strong> ${activePatient.abhaId}</span>
                </div>
              </div>

              <div class="flex items-center gap-2 self-start sm:self-auto">
                <button id="btn-print-doctor-summary" class="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                  <i data-lucide="printer" class="w-4 h-4"></i> Print
                </button>
                <button id="btn-mark-consult-complete" class="px-4 py-2 rounded-xl bg-[#0CA854] hover:bg-[#087F3F] text-white text-xs font-bold flex items-center gap-1.5 shadow-md">
                  <i data-lucide="check" class="w-4 h-4"></i> Complete Consultation
                </button>
              </div>
            </div>

            <div class="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
              <button class="doc-subtab-btn px-3 py-1.5 rounded-lg transition-all ${state.doctor.activePaneTab === 'summary' ? 'bg-[#0CA854] text-white' : 'text-slate-600 hover:bg-slate-100'}" data-tab="summary">
                AI History Summary
              </button>
              <button class="doc-subtab-btn px-3 py-1.5 rounded-lg transition-all ${state.doctor.activePaneTab === 'ocr' ? 'bg-[#0CA854] text-white' : 'text-slate-600 hover:bg-slate-100'}" data-tab="ocr">
                Scanned Reports & OCR (${activePatient.scannedDocs ? activePatient.scannedDocs.length : 0})
              </button>
              <button class="doc-subtab-btn px-3 py-1.5 rounded-lg transition-all ${state.doctor.activePaneTab === 'notes' ? 'bg-[#0CA854] text-white' : 'text-slate-600 hover:bg-slate-100'}" data-tab="notes">
                Doctor Prescription & Notes
              </button>
              <button class="doc-subtab-btn px-3 py-1.5 rounded-lg transition-all ${state.doctor.activePaneTab === 'fhir' ? 'bg-[#0CA854] text-white' : 'text-slate-600 hover:bg-slate-100'}" data-tab="fhir">
                FHIR / ABDM Bundle
              </button>
            </div>

            ${state.doctor.activePaneTab === 'summary' ? `
              <div class="space-y-5">
                <div class="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-slate-800 space-y-2">
                  <div class="flex items-center justify-between text-xs font-bold text-[#0CA854]">
                    <span class="flex items-center gap-1.5"><i data-lucide="sparkles" class="w-4 h-4"></i> AI-Synthesized Pre-Consultation History</span>
                    <span class="text-[10px] bg-white px-2 py-0.5 rounded border border-emerald-300 font-mono">MediKiosik Summary Engine</span>
                  </div>
                  <p class="text-xs text-slate-700 leading-relaxed">${activePatient.aiSummary}</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div class="text-[11px] font-bold text-slate-500 uppercase">Chief Complaint & Pain Score</div>
                    <div class="text-xs font-bold text-slate-900">${activePatient.chiefComplaint}</div>
                    <div class="text-xs text-slate-600">Duration: <span class="font-semibold text-slate-800">${activePatient.duration}</span></div>
                    <div class="text-xs text-slate-600">Pain Score: <span class="font-bold text-red-600">${activePatient.painScore} / 10</span></div>
                  </div>

                  <div class="p-4 rounded-xl bg-red-50 border border-red-200 space-y-1.5">
                    <div class="text-[11px] font-bold text-red-700 uppercase flex items-center gap-1">
                      <i data-lucide="alert-triangle" class="w-3.5 h-3.5"></i> Known Drug / Food Allergies
                    </div>
                    <div class="flex flex-wrap gap-1.5 pt-0.5">
                      ${(activePatient.allergies || []).map(a => `<span class="text-[11px] bg-white text-red-700 border border-red-300 font-bold px-2 py-0.5 rounded">${a}</span>`).join('') || '<span class="text-xs text-slate-500">NKDA (No known allergies)</span>'}
                    </div>
                  </div>

                  <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div class="text-[11px] font-bold text-slate-500 uppercase">Past Medical / Surgical History</div>
                    <div class="flex flex-wrap gap-1.5 pt-0.5">
                      ${(activePatient.pastHistory || []).map(h => `<span class="text-[11px] bg-white text-slate-700 border border-slate-200 font-semibold px-2 py-0.5 rounded">${h}</span>`).join('') || '<span class="text-xs text-slate-500">None reported</span>'}
                    </div>
                  </div>

                  <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div class="text-[11px] font-bold text-slate-500 uppercase">Ongoing Prescriptions</div>
                    <div class="text-xs text-slate-700">
                      ${(activePatient.currentMedications || []).map(m => `
                        <div class="flex justify-between py-0.5 border-b border-slate-100 last:border-0 font-medium">
                          <span>${m.name} (${m.dose})</span>
                          <span class="text-slate-500">${m.frequency}</span>
                        </div>
                      `).join('') || 'None reported'}
                    </div>
                  </div>
                </div>
              </div>
            ` : ''}

            ${state.doctor.activePaneTab === 'ocr' ? `
              <div class="space-y-4">
                ${activePatient.scannedDocs && activePatient.scannedDocs.length ? `
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${activePatient.scannedDocs.map(doc => `
                      <div class="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                        <div class="flex items-center justify-between">
                          <span class="text-xs font-bold text-slate-900">${doc.title}</span>
                          <span class="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded">${doc.type}</span>
                        </div>

                        <div class="p-3 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[11px] leading-relaxed">
                          ${doc.ocrSnippet}
                        </div>

                        <div class="text-xs space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <div class="text-[11px] font-bold text-slate-700">AI-Extracted Clinical Entities:</div>
                          <pre class="text-[10px] text-slate-600 font-mono overflow-x-auto">${JSON.stringify(doc.extractedEntities, null, 2)}</pre>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                ` : `
                  <div class="text-center py-12 text-slate-400 text-xs">No scanned documents attached for this patient.</div>
                `}
              </div>
            ` : ''}

            ${state.doctor.activePaneTab === 'notes' ? `
              <div class="space-y-4">
                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-slate-700 uppercase">Clinical Impression & Examination Notes</label>
                  <textarea id="doc-notes-input" rows="3" class="w-full p-3 text-xs rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-[#0CA854]">${activePatient.doctorNotes || ''}</textarea>
                </div>

                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-slate-700 uppercase">Confirmed Diagnosis (ICD-10)</label>
                  <input id="doc-diag-input" type="text" value="${activePatient.finalDiagnosis || ''}" placeholder="e.g. Essential Hypertension / Type 2 Diabetes" class="w-full p-3 text-xs rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-[#0CA854]" />
                </div>

                <button id="doc-save-notes-btn" class="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800">
                  Save Doctor Clinical Notes
                </button>
              </div>
            ` : ''}

            ${state.doctor.activePaneTab === 'fhir' ? `
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-slate-700">FHIR R4 Standard Medical Record Bundle</span>
                  <button id="btn-copy-fhir-json" class="text-xs font-bold text-[#0CA854] hover:underline">Copy JSON</button>
                </div>
                <pre class="p-4 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-96">${JSON.stringify(generateFHIRBundle(activePatient), null, 2)}</pre>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  function generateFHIRBundle(patient) {
    return {
      resourceType: "Bundle",
      type: "document",
      timestamp: new Date().toISOString(),
      entry: [
        {
          resource: {
            resourceType: "Patient",
            id: patient.id,
            identifier: [{ system: "https://healthid.ndhm.gov.in", value: patient.abhaId }],
            name: [{ text: patient.name }],
            gender: patient.gender.toLowerCase(),
            birthDate: (2024 - parseInt(patient.age || 45)) + "-01-01"
          }
        },
        {
          resource: {
            resourceType: "ClinicalImpression",
            status: "completed",
            subject: { reference: `Patient/${patient.id}` },
            summary: patient.aiSummary,
            finding: [{ itemCodeableConcept: { text: patient.chiefComplaint } }]
          }
        }
      ]
    };
  }

  function attachDoctorListeners() {
    $$('.triage-filter-btn').forEach(b => {
      b.addEventListener('click', () => {
        state.doctor.filterTriage = b.getAttribute('data-triage');
        renderActiveTab();
      });
    });

    $('#doc-search-queue')?.addEventListener('input', (e) => {
      state.doctor.searchQuery = e.target.value;
      renderActiveTab();
    });

    $$('.patient-queue-card').forEach(c => {
      c.addEventListener('click', () => {
        state.doctor.selectedPatientId = c.getAttribute('data-pat-id');
        renderActiveTab();
      });
    });

    $$('.doc-subtab-btn').forEach(b => {
      b.addEventListener('click', () => {
        state.doctor.activePaneTab = b.getAttribute('data-tab');
        renderActiveTab();
      });
    });

    $('#doc-save-notes-btn')?.addEventListener('click', () => {
      const p = state.doctor.patients.find(p => p.id === state.doctor.selectedPatientId);
      if (p) {
        p.doctorNotes = $('#doc-notes-input').value;
        p.finalDiagnosis = $('#doc-diag-input').value;
        alert('Doctor clinical notes saved successfully!');
      }
    });

    $('#btn-print-doctor-summary')?.addEventListener('click', () => {
      window.print();
    });

    $('#btn-mark-consult-complete')?.addEventListener('click', () => {
      const p = state.doctor.patients.find(p => p.id === state.doctor.selectedPatientId);
      if (p) {
        p.status = 'Completed';
        alert(`Consultation for ${p.name} completed successfully.`);
      }
    });

    $('#btn-copy-fhir-json')?.addEventListener('click', () => {
      const p = state.doctor.patients.find(p => p.id === state.doctor.selectedPatientId);
      navigator.clipboard.writeText(JSON.stringify(generateFHIRBundle(p), null, 2));
      alert('FHIR JSON Bundle copied to clipboard!');
    });
  }

  // ==========================================
  // 4. SCAN MEDICAL REPORTS (OCR TOOL)
  // ==========================================
  function getDocViewerHTML() {
    return `
      <div class="space-y-6 pb-12">
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <h2 class="text-xl font-bold text-slate-900">Medical Document OCR Scanner</h2>
          <p class="text-xs text-slate-500">Scan or test OCR entity extraction on prescriptions, lab reports, and radiological findings.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div class="h-44 bg-slate-100 rounded-xl p-4 flex flex-col justify-between border border-slate-200 font-mono text-[10px] text-slate-700">
              <div class="border-b pb-1 font-bold text-emerald-800">OPD PRESCRIPTION SLIP</div>
              <div>Rx:<br/>1. Tab Telmisartan 40mg 1-0-0<br/>2. Tab Metformin 500mg 1-0-1<br/>3. Tab Atorvastatin 20mg 0-0-1</div>
              <div class="text-[9px] text-slate-400">Dr. Ashok Seth | Reg #29401</div>
            </div>
            <div>
              <h4 class="font-bold text-sm text-slate-900">OPD Prescription</h4>
              <p class="text-xs text-slate-500 mt-1">Extracts antihypertensive and antidiabetic medicines.</p>
            </div>
            <button data-ocr-type="prescription" class="btn-try-ocr-explore w-full py-2.5 rounded-xl bg-[#0CA854] text-white text-xs font-bold">
              Extract via MediKiosik OCR
            </button>
          </div>

          <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div class="h-44 bg-slate-100 rounded-xl p-4 flex flex-col justify-between border border-slate-200 font-mono text-[10px] text-slate-700">
              <div class="border-b pb-1 font-bold text-purple-800">BLOOD & LIPID PANEL</div>
              <div>HbA1c: 8.2% (HIGH)<br/>Fasting Glucose: 178 mg/dL<br/>Total Cholesterol: 235 mg/dL<br/>Serum Creatinine: 1.1 mg/dL</div>
              <div class="text-[9px] text-slate-400">Ref: #TC-991204</div>
            </div>
            <div>
              <h4 class="font-bold text-sm text-slate-900">Lipid & Glycemic Profile</h4>
              <p class="text-xs text-slate-500 mt-1">Identifies abnormal lab thresholds and elevated HbA1c.</p>
            </div>
            <button data-ocr-type="blood_report" class="btn-try-ocr-explore w-full py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold">
              Extract via MediKiosik OCR
            </button>
          </div>

          <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div class="h-44 bg-slate-100 rounded-xl p-4 flex flex-col justify-between border border-slate-200 font-mono text-[10px] text-slate-700">
              <div class="border-b pb-1 font-bold text-blue-800">RADIOLOGY DEPARTMENT</div>
              <div>Bilateral Knee X-Ray AP/Lat<br/>Findings: Kellgren-Lawrence Grade IV joint space narrowing.</div>
              <div class="text-[9px] text-slate-400">Radiologist Report</div>
            </div>
            <div>
              <h4 class="font-bold text-sm text-slate-900">Radiology X-Ray Report</h4>
              <p class="text-xs text-slate-500 mt-1">Extracts orthopaedic joint space findings.</p>
            </div>
            <button data-ocr-type="xray_report" class="btn-try-ocr-explore w-full py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold">
              Extract via MediKiosik OCR
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function attachDocViewerListeners() {
    $$('.btn-try-ocr-explore').forEach(b => {
      b.addEventListener('click', () => {
        const type = b.getAttribute('data-ocr-type');
        state.currentTab = 'kiosk';
        state.kiosk.step = 5;
        renderApp();
        processOCRDocument(type);
      });
    });
  }

  // ==========================================
  // 5. MEDIKIOSIK CENTRAL PHARMACY & HOME DELIVERY
  // ==========================================
  function getPharmacyHTML() {
    const pharmacyData = window.MEDIKIOSIK_PHARMACY || {
      hubInfo: {
        name: "MHSSCE Central Hospital Pharmacy & Express Dispatch",
        location: "South Mumbai Hub, Byculla, Mumbai - 400008",
        hotline: "+91 (022) 2377-6655",
        expressDeliveryMinutes: 30,
        freeDeliveryThreshold: 199,
        hospitalConcessionDiscountPct: 15
      },
      categories: [],
      medicines: [],
      deliveryModes: []
    };

    const user = JSON.parse(localStorage.getItem('careforge_user')) || {};
    const patientId = user.id || state.kiosk.patient.id || 'pat-1';
    const patientName = user.name || state.kiosk.patient.name || 'Aditya Verma';

    // Retrieve active prescriptions for current patient from SyncEngine & Kiosk Intake
    const activePrescriptions = (window.SyncEngine ? window.SyncEngine.getPrescriptions(patientId) : []).concat(
      (window.SyncEngine ? window.SyncEngine.getPrescriptions('pat-1') : [])
    );
    // Deduplicate prescriptions
    const uniqueRxMap = new Map();
    activePrescriptions.forEach(rx => {
      if (!uniqueRxMap.has(rx.medication)) {
        uniqueRxMap.set(rx.medication, rx);
      }
    });
    const uniqueRxs = Array.from(uniqueRxMap.values());

    // Cart calculations
    const cartItems = state.pharmacy.cart || [];
    const cartCount = cartItems.reduce((sum, i) => sum + (i.qty || 1), 0);
    const subtotal = cartItems.reduce((sum, i) => sum + ((i.price || 0) * (i.qty || 1)), 0);
    const mrpTotal = cartItems.reduce((sum, i) => sum + ((i.mrp || i.price || 0) * (i.qty || 1)), 0);
    const discountSavings = Math.max(0, mrpTotal - subtotal);
    const selectedModeObj = (pharmacyData.deliveryModes || []).find(m => m.id === state.pharmacy.selectedDeliveryMode) || { fee: 25.00 };
    const deliveryFee = subtotal >= pharmacyData.hubInfo.freeDeliveryThreshold && state.pharmacy.selectedDeliveryMode === 'standard' ? 0 : (subtotal > 0 ? selectedModeObj.fee : 0);
    const grandTotal = subtotal + deliveryFee;

    // Filter medicines
    let filteredMedicines = (pharmacyData.medicines || []).filter(med => {
      // Category filter
      if (state.pharmacy.selectedCategory !== 'all' && med.category !== state.pharmacy.selectedCategory) {
        return false;
      }
      // Rx / OTC filter
      if (state.pharmacy.rxFilter === 'rx' && !med.prescriptionRequired) return false;
      if (state.pharmacy.rxFilter === 'otc' && med.prescriptionRequired) return false;
      // Search filter
      if (state.pharmacy.searchQuery) {
        const q = state.pharmacy.searchQuery.toLowerCase().trim();
        const matchName = med.name.toLowerCase().includes(q);
        const matchGeneric = med.genericName.toLowerCase().includes(q);
        const matchBrand = med.brand.toLowerCase().includes(q);
        const matchIndications = med.indications && med.indications.toLowerCase().includes(q);
        if (!matchName && !matchGeneric && !matchBrand && !matchIndications) return false;
      }
      return true;
    });

    // Orders list
    const patientOrders = window.SyncEngine ? window.SyncEngine.getPharmacyOrders(patientId) : (pharmacyData.sampleOrders || []);

    return `
      <div class="space-y-8 pb-16">
        
        <!-- Pharmacy Hero & Hub Notice -->
        <div class="relative rounded-3xl bg-gradient-to-r from-[#0F2942] via-slate-900 to-[#0CA854]/90 text-white p-6 md:p-8 shadow-2xl overflow-hidden">
          <div class="absolute -right-16 -top-16 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <div class="absolute right-1/3 -bottom-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div class="space-y-2 max-w-2xl">
              <div class="flex flex-wrap items-center gap-2">
                <span class="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                  <i data-lucide="zap" class="w-3.5 h-3.5 text-amber-300"></i> 30-Min Fast Home Delivery
                </span>
                <span class="px-2.5 py-1 rounded-full bg-white/10 text-slate-200 text-xs font-bold">
                  24x7 Hospital Central Pharmacy
                </span>
                <span class="px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
                  15% OPD Concession Active
                </span>
              </div>

              <h1 class="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                <span>Medi<span class="text-emerald-400">Pharmacy</span> & Home Delivery</span>
              </h1>
              <p class="text-xs md:text-sm text-slate-300 leading-relaxed">
                Order doctor-prescribed medications and daily healthcare essentials delivered directly to your doorstep from the <span class="text-white font-bold">MHSSCE South Mumbai Central Pharmacy Hub</span>.
              </p>

              <div class="pt-2 flex flex-wrap items-center gap-4 text-[11px] text-slate-300">
                <span class="flex items-center gap-1 text-emerald-400 font-semibold"><i data-lucide="shield-check" class="w-3.5 h-3.5"></i> 100% Genuine Hospital Dispensed</span>
                <span class="flex items-center gap-1 text-emerald-400 font-semibold"><i data-lucide="snowflake" class="w-3.5 h-3.5"></i> Cold-Chain Maintained</span>
                <span class="flex items-center gap-1 text-emerald-400 font-semibold"><i data-lucide="truck" class="w-3.5 h-3.5"></i> Free Delivery > ₹199</span>
              </div>
            </div>

            <!-- Header Quick Action Switchers -->
            <div class="flex flex-wrap md:flex-col gap-2.5 w-full md:w-auto">
              <button id="pharmacy-btn-view-cart" class="px-5 py-3 rounded-2xl ${state.pharmacy.activeView === 'cart' ? 'bg-white text-[#0F2942]' : 'bg-emerald-500 hover:bg-emerald-600 text-white'} font-black text-xs shadow-lg flex items-center justify-between gap-3 transition-all">
                <div class="flex items-center gap-2">
                  <i data-lucide="shopping-cart" class="w-4 h-4"></i>
                  <span>Shopping Cart</span>
                </div>
                <span class="px-2 py-0.5 rounded-full ${state.pharmacy.activeView === 'cart' ? 'bg-[#0F2942] text-white' : 'bg-white text-emerald-700'} text-[10px] font-black">
                  ${cartCount} items · ₹${subtotal.toFixed(2)}
                </span>
              </button>

              <button id="pharmacy-btn-view-orders" class="px-5 py-2.5 rounded-2xl ${state.pharmacy.activeView === 'tracking' ? 'bg-white text-[#0F2942]' : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'} font-bold text-xs flex items-center justify-between gap-3 transition-all">
                <div class="flex items-center gap-2">
                  <i data-lucide="package" class="w-4 h-4 text-amber-300"></i>
                  <span>Track Deliveries</span>
                </div>
                <span class="px-2 py-0.5 rounded-full bg-white/20 text-slate-200 text-[10px] font-bold">
                  ${patientOrders.length} Order(s)
                </span>
              </button>

              <button id="pharmacy-btn-open-custom-modal" class="px-5 py-2.5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/30 font-bold text-xs flex items-center justify-center gap-2 transition-all">
                <i data-lucide="plus-circle" class="w-4 h-4 text-amber-300"></i>
                <span>+ Request Custom Medicine</span>
              </button>
            </div>
          </div>
        </div>

        <!-- ==========================================
             ACTIVE DOCTOR'S PRESCRIPTIONS SYNC BANNER
             ========================================== -->
        ${uniqueRxs.length > 0 ? `
          <div class="p-5 md:p-6 rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-teal-50 border-2 border-emerald-300 shadow-md flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-2xl bg-[#0CA854] text-white flex items-center justify-center shadow-md shadow-emerald-700/20 flex-shrink-0">
                <i data-lucide="clipboard-list" class="w-6 h-6"></i>
              </div>
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <h3 class="font-black text-slate-900 text-sm md:text-base">Active Doctor's Digital Prescriptions</h3>
                  <span class="px-2 py-0.5 rounded bg-emerald-100 text-[#0CA854] text-[10px] font-black uppercase">Linked to OPD Session</span>
                </div>
                <p class="text-xs text-slate-600">
                  Doctor prescribed <span class="font-bold text-slate-900">${uniqueRxs.length} medicine(s)</span> for <span class="font-bold text-emerald-800">${patientName}</span>:
                </p>
                <div class="flex flex-wrap gap-2 pt-1">
                  ${uniqueRxs.map(rx => `
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-emerald-200 text-slate-800 text-xs font-bold shadow-xs">
                      <i data-lucide="pill" class="w-3.5 h-3.5 text-[#0CA854]"></i>
                      <span>${rx.medication}</span>
                      <span class="text-[10px] text-slate-400 font-normal">(${rx.doctorName || 'Doctor'})</span>
                    </span>
                  `).join('')}
                </div>
              </div>
            </div>

            <button id="pharmacy-btn-add-all-rx" class="w-full lg:w-auto px-6 py-3 rounded-2xl bg-[#0CA854] hover:bg-[#087F3F] text-white font-black text-xs shadow-lg shadow-emerald-700/30 flex items-center justify-center gap-2 flex-shrink-0 transition-all hover:scale-105">
              <i data-lucide="sparkles" class="w-4 h-4 text-amber-300"></i>
              <span>⚡ 1-Click Add All Prescribed Meds to Delivery Cart</span>
            </button>
          </div>
        ` : ''}

        <!-- ==========================================
             MAIN SUB-VIEW SWITCHER
             ========================================== -->

        <!-- VIEW 1: CATALOG -->
        ${state.pharmacy.activeView === 'catalog' ? `
          <div class="space-y-6">
            
            <!-- Category Pills & Search Bar -->
            <div class="bg-white p-4 md:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div class="flex flex-col md:flex-row items-center justify-between gap-4">
                
                <!-- Search Input -->
                <div class="relative w-full md:max-w-md">
                  <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"></i>
                  <input 
                    type="text" 
                    id="pharmacy-search-input" 
                    value="${state.pharmacy.searchQuery || ''}"
                    placeholder="Search medicines by name, generic salt (e.g. Paracetamol, Metformin)..." 
                    class="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs md:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0CA854] focus:bg-white transition-all"
                  />
                  ${state.pharmacy.searchQuery ? `
                    <button id="pharmacy-btn-clear-search" class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <i data-lucide="x" class="w-4 h-4"></i>
                    </button>
                  ` : ''}
                </div>

                <!-- Rx / OTC Filter Buttons -->
                <div class="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl w-full md:w-auto overflow-x-auto">
                  <button data-rx-filter="all" class="pharmacy-rx-filter-btn px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${state.pharmacy.rxFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}">
                    All (${pharmacyData.medicines.length})
                  </button>
                  <button data-rx-filter="otc" class="pharmacy-rx-filter-btn px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${state.pharmacy.rxFilter === 'otc' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}">
                    OTC Essentials
                  </button>
                  <button data-rx-filter="rx" class="pharmacy-rx-filter-btn px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${state.pharmacy.rxFilter === 'rx' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}">
                    Doctor Prescribed (Rx)
                  </button>
                </div>
              </div>

              <!-- Categories Horizontal Scroll -->
              <div class="flex items-center gap-2 overflow-x-auto pb-1 pt-2 scrollbar-thin">
                ${(pharmacyData.categories || []).map(cat => {
                  const isSelected = state.pharmacy.selectedCategory === cat.id;
                  const catCount = cat.id === 'all' ? pharmacyData.medicines.length : pharmacyData.medicines.filter(m => m.category === cat.id).length;
                  return `
                    <button data-category="${cat.id}" class="pharmacy-category-btn flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                      isSelected 
                        ? 'bg-[#0CA854] text-white shadow-md shadow-emerald-700/20 scale-102' 
                        : 'bg-slate-50 hover:bg-emerald-50 text-slate-700 border border-slate-200/80 hover:border-emerald-200'
                    }">
                      <i data-lucide="${cat.icon || 'pill'}" class="w-4 h-4"></i>
                      <span>${cat.name}</span>
                      <span class="text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white text-[#0CA854]' : 'bg-slate-200 text-slate-600'}">${catCount}</span>
                    </button>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Medicines Grid -->
            <div>
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <span>Available Medicines</span>
                  <span class="text-slate-400 font-normal">(${filteredMedicines.length} products found)</span>
                </h3>

                <button id="pharmacy-btn-open-custom-inline" class="text-xs font-bold text-[#0CA854] hover:text-[#087F3F] flex items-center gap-1">
                  <i data-lucide="plus" class="w-3.5 h-3.5"></i> Can't find medicine? Request Custom
                </button>
              </div>

              ${filteredMedicines.length === 0 ? `
                <div class="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
                  <div class="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                    <i data-lucide="search-x" class="w-8 h-8"></i>
                  </div>
                  <h4 class="text-lg font-bold text-slate-800">No medicines found matching "${state.pharmacy.searchQuery}"</h4>
                  <p class="text-xs text-slate-500 max-w-md mx-auto">
                    You can request any doctor-prescribed or special medicine through our direct hospital pharmacy procurement form.
                  </p>
                  <button id="pharmacy-btn-empty-custom" class="px-6 py-3 rounded-2xl bg-[#0CA854] text-white font-bold text-xs shadow-md">
                    + Request This Medicine for Home Delivery
                  </button>
                </div>
              ` : `
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  ${filteredMedicines.map(med => {
                    const cartEntry = cartItems.find(i => i.id === med.id);
                    const qtyInCart = cartEntry ? cartEntry.qty : 0;
                    const discountPercent = Math.round(((med.mrp - med.price) / med.mrp) * 100);

                    return `
                      <div class="bg-white rounded-3xl border border-slate-200 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group">
                        
                        <!-- Top Image & Badges -->
                        <div class="relative h-40 bg-slate-50 overflow-hidden border-b border-slate-100 flex items-center justify-center p-3">
                          <img src="${med.image}" alt="${med.name}" class="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300" onerror="this.src='https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80'" />
                          
                          <!-- Top Badges -->
                          <div class="absolute top-3 left-3 flex flex-col gap-1 items-start">
                            ${med.prescriptionRequired ? `
                              <span class="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 border border-purple-200 text-[10px] font-black uppercase tracking-wider">
                                Rx Required
                              </span>
                            ` : `
                              <span class="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
                                OTC
                              </span>
                            `}
                          </div>

                          <div class="absolute top-3 right-3">
                            <span class="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black shadow-xs">
                              ${discountPercent}% OFF
                            </span>
                          </div>
                        </div>

                        <!-- Card Body -->
                        <div class="p-4 space-y-3 flex-1 flex flex-col justify-between">
                          <div class="space-y-1.5">
                            <div class="flex items-center justify-between text-[11px] text-slate-500">
                              <span class="font-semibold text-emerald-700">${med.brand}</span>
                              <span>${med.form}</span>
                            </div>

                            <h4 class="font-bold text-slate-900 text-sm leading-tight line-clamp-1">${med.name}</h4>
                            <p class="text-[11px] font-medium text-slate-500 line-clamp-1 italic">${med.genericName}</p>
                            
                            <div class="pt-1">
                              <p class="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 line-clamp-2 leading-relaxed">
                                <span class="font-bold text-slate-700">Uses:</span> ${med.indications}
                              </p>
                            </div>
                          </div>

                          <!-- Price & Action -->
                          <div class="pt-3 border-t border-slate-100 space-y-3">
                            <div class="flex items-baseline justify-between">
                              <div class="flex items-baseline gap-1.5">
                                <span class="text-base font-black text-slate-900">₹${med.price.toFixed(2)}</span>
                                <span class="text-xs text-slate-400 line-through">₹${med.mrp.toFixed(2)}</span>
                              </div>
                              <span class="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                                <i data-lucide="check" class="w-3 h-3"></i> In Stock
                              </span>
                            </div>

                            ${qtyInCart > 0 ? `
                              <div class="flex items-center justify-between bg-emerald-50 rounded-2xl p-1 border border-emerald-200">
                                <button data-med-id="${med.id}" class="pharmacy-btn-decrease-qty w-8 h-8 rounded-xl bg-white text-emerald-800 font-black flex items-center justify-center hover:bg-emerald-100 shadow-xs">
                                  -
                                </button>
                                <span class="text-xs font-black text-emerald-900 px-2">${qtyInCart} in cart</span>
                                <button data-med-id="${med.id}" class="pharmacy-btn-increase-qty w-8 h-8 rounded-xl bg-[#0CA854] text-white font-black flex items-center justify-center hover:bg-[#087F3F] shadow-xs">
                                  +
                                </button>
                              </div>
                            ` : `
                              <button data-med-id="${med.id}" class="pharmacy-btn-add-to-cart w-full py-2.5 rounded-2xl bg-slate-900 hover:bg-[#0CA854] text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5">
                                <i data-lucide="plus" class="w-4 h-4"></i>
                                <span>Add to Cart</span>
                              </button>
                            `}
                          </div>
                        </div>

                      </div>
                    `;
                  }).join('')}
                </div>
              `}
            </div>

          </div>
        ` : ''}

        <!-- VIEW 2: CART & CHECKOUT -->
        ${state.pharmacy.activeView === 'cart' ? `
          <div class="space-y-6">
            
            <div class="flex items-center justify-between border-b border-slate-200 pb-4">
              <button id="pharmacy-btn-back-to-catalog" class="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors">
                <i data-lucide="arrow-left" class="w-4 h-4"></i> Continue Adding Medicines
              </button>
              <h2 class="text-lg font-black text-slate-900">Medicine Home Delivery Checkout</h2>
            </div>

            ${cartItems.length === 0 ? `
              <div class="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
                <div class="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                  <i data-lucide="shopping-cart" class="w-8 h-8"></i>
                </div>
                <h4 class="text-lg font-bold text-slate-800">Your Medicine Cart is Empty</h4>
                <p class="text-xs text-slate-500 max-w-sm mx-auto">
                  Add prescribed medicines or browse standard daily health essentials to schedule your home delivery.
                </p>
                <button id="pharmacy-btn-browse-empty" class="px-6 py-3 rounded-2xl bg-[#0CA854] text-white font-bold text-xs shadow-md">
                  Browse Pharmacy Catalog
                </button>
              </div>
            ` : `
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                <!-- Left 2 Cols: Cart Items & Delivery Address -->
                <div class="lg:col-span-2 space-y-6">
                  
                  <!-- Cart Items Table Card -->
                  <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                    <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 class="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <i data-lucide="pill" class="w-4 h-4 text-[#0CA854]"></i>
                        <span>Order Items (${cartItems.length})</span>
                      </h3>
                      <button id="pharmacy-btn-clear-cart" class="text-xs text-red-600 hover:text-red-700 font-bold">
                        Clear Cart
                      </button>
                    </div>

                    <div class="divide-y divide-slate-100">
                      ${cartItems.map(item => `
                        <div class="py-3.5 flex items-center justify-between gap-4">
                          <div class="flex items-start gap-3">
                            <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                              <i data-lucide="${item.isCustom ? 'file-plus' : 'pill'}" class="w-5 h-5"></i>
                            </div>
                            <div>
                              <div class="flex items-center gap-2">
                                <h4 class="font-bold text-slate-900 text-xs md:text-sm">${item.name}</h4>
                                ${item.isCustom ? `
                                  <span class="px-2 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-bold uppercase">Custom Request</span>
                                ` : item.prescriptionRequired ? `
                                  <span class="px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 text-[9px] font-bold">Rx</span>
                                ` : ''}
                              </div>
                              <p class="text-[11px] text-slate-500">${item.genericName || item.form || 'Medicinal Item'}</p>
                              ${item.notes ? `<p class="text-[10px] text-amber-700 mt-0.5 italic">Note: ${item.notes}</p>` : ''}
                            </div>
                          </div>

                          <div class="flex items-center gap-4">
                            <!-- Qty Adjuster -->
                            <div class="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                              <button data-med-id="${item.id}" class="pharmacy-btn-decrease-qty px-2.5 py-1 text-slate-600 hover:bg-slate-200 text-xs font-black">-</button>
                              <span class="px-2.5 py-1 text-xs font-bold text-slate-900">${item.qty}</span>
                              <button data-med-id="${item.id}" class="pharmacy-btn-increase-qty px-2.5 py-1 text-slate-600 hover:bg-slate-200 text-xs font-black">+</button>
                            </div>

                            <!-- Price -->
                            <div class="text-right w-20">
                              <div class="font-black text-slate-900 text-sm">₹${((item.price || 0) * item.qty).toFixed(2)}</div>
                              <div class="text-[10px] text-slate-400 line-through">₹${((item.mrp || item.price || 0) * item.qty).toFixed(2)}</div>
                            </div>

                            <!-- Delete -->
                            <button data-med-id="${item.id}" class="pharmacy-btn-remove-item text-slate-400 hover:text-red-600 p-1">
                              <i data-lucide="trash-2" class="w-4 h-4"></i>
                            </button>
                          </div>
                        </div>
                      `).join('')}
                    </div>

                    ${cartItems.some(i => i.prescriptionRequired) ? `
                      <div class="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 text-xs flex items-center gap-3">
                        <i data-lucide="shield-alert" class="w-5 h-5 text-purple-600 flex-shrink-0"></i>
                        <span>Some items in your cart require a valid prescription. Your OPD doctor consultation slip is automatically attached.</span>
                      </div>
                    ` : ''}
                  </div>

                  <!-- Delivery Speed Selector -->
                  <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                    <h3 class="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <i data-lucide="zap" class="w-4 h-4 text-amber-500"></i>
                      <span>Select Delivery Speed</span>
                    </h3>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                      ${(pharmacyData.deliveryModes || []).map(m => {
                        const isSelected = state.pharmacy.selectedDeliveryMode === m.id;
                        return `
                          <label class="p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                            isSelected ? 'border-[#0CA854] bg-emerald-50/50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'
                          }">
                            <div class="flex items-start justify-between">
                              <input type="radio" name="delivery-mode" value="${m.id}" ${isSelected ? 'checked' : ''} class="pharmacy-delivery-radio text-[#0CA854] focus:ring-[#0CA854]" />
                              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'}">${m.badge}</span>
                            </div>
                            <div class="mt-2 space-y-1">
                              <div class="font-bold text-slate-900 text-xs">${m.title}</div>
                              <p class="text-[10px] text-slate-500 leading-tight">${m.subtitle}</p>
                            </div>
                            <div class="mt-2 text-xs font-black text-slate-800">
                              ${m.fee === 0 ? 'FREE' : `+ ₹${m.fee.toFixed(2)}`}
                            </div>
                          </label>
                        `;
                      }).join('')}
                    </div>
                  </div>

                  <!-- Delivery Address Form -->
                  <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                    <h3 class="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <i data-lucide="map-pin" class="w-4 h-4 text-[#0CA854]"></i>
                      <span>Delivery Address (Home / Campus)</span>
                    </h3>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label class="block font-bold text-slate-700 mb-1">Recipient Name</label>
                        <input type="text" id="pharmacy-addr-name" value="${state.pharmacy.deliveryAddress.fullName || patientName}" class="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0CA854]" />
                      </div>
                      <div>
                        <label class="block font-bold text-slate-700 mb-1">Phone Number (For Rider)</label>
                        <input type="text" id="pharmacy-addr-phone" value="${state.pharmacy.deliveryAddress.phone || '+91 98201 44556'}" class="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0CA854]" />
                      </div>
                      <div class="md:col-span-2">
                        <label class="block font-bold text-slate-700 mb-1">Flat / House No. & Building</label>
                        <input type="text" id="pharmacy-addr-flat" value="${state.pharmacy.deliveryAddress.flat || 'Flat 402, Sea View Heights'}" class="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0CA854]" />
                      </div>
                      <div>
                        <label class="block font-bold text-slate-700 mb-1">Street / Area / Landmark</label>
                        <input type="text" id="pharmacy-addr-street" value="${state.pharmacy.deliveryAddress.street || 'Byculla East, Near MHSSCE'}" class="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0CA854]" />
                      </div>
                      <div>
                        <label class="block font-bold text-slate-700 mb-1">Pincode & City</label>
                        <input type="text" id="pharmacy-addr-pincode" value="${state.pharmacy.deliveryAddress.pincode || '400008'} - Mumbai" class="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0CA854]" />
                      </div>
                    </div>
                  </div>

                </div>

                <!-- Right 1 Col: Summary & Payment -->
                <div class="space-y-6">
                  
                  <!-- Bill Summary Card -->
                  <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                    <h3 class="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
                      Order Payment Summary
                    </h3>

                    <div class="space-y-2.5 text-xs">
                      <div class="flex justify-between text-slate-600">
                        <span>Items Total MRP</span>
                        <span class="font-bold text-slate-800">₹${mrpTotal.toFixed(2)}</span>
                      </div>

                      <div class="flex justify-between text-emerald-600 font-semibold">
                        <span>Hospital OPD Concession (-15%)</span>
                        <span>- ₹${discountSavings.toFixed(2)}</span>
                      </div>

                      <div class="flex justify-between text-slate-600">
                        <span>Delivery Fee</span>
                        <span class="font-bold ${deliveryFee === 0 ? 'text-emerald-600' : 'text-slate-800'}">
                          ${deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}
                        </span>
                      </div>

                      <div class="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                        <div>
                          <div class="text-sm font-black text-slate-900">Total Payable</div>
                          <div class="text-[10px] text-slate-500">Incl. all taxes & GST</div>
                        </div>
                        <span class="text-2xl font-black text-[#0CA854]">₹${grandTotal.toFixed(2)}</span>
                      </div>
                    </div>

                    <!-- Payment Mode -->
                    <div class="pt-4 border-t border-slate-100 space-y-3">
                      <label class="block font-bold text-slate-800 text-xs">Choose Payment Method</label>
                      
                      <div class="space-y-2">
                        <label class="p-3 rounded-xl border flex items-center justify-between cursor-pointer ${state.pharmacy.paymentMethod === 'UPI' ? 'border-[#0CA854] bg-emerald-50/40 font-bold' : 'border-slate-200'}">
                          <div class="flex items-center gap-2 text-xs">
                            <input type="radio" name="payment-method" value="UPI" ${state.pharmacy.paymentMethod === 'UPI' ? 'checked' : ''} class="pharmacy-pay-radio text-[#0CA854]" />
                            <span>Instant UPI (GPay / PhonePe / Paytm)</span>
                          </div>
                          <i data-lucide="qr-code" class="w-4 h-4 text-slate-600"></i>
                        </label>

                        <label class="p-3 rounded-xl border flex items-center justify-between cursor-pointer ${state.pharmacy.paymentMethod === 'COD' ? 'border-[#0CA854] bg-emerald-50/40 font-bold' : 'border-slate-200'}">
                          <div class="flex items-center gap-2 text-xs">
                            <input type="radio" name="payment-method" value="COD" ${state.pharmacy.paymentMethod === 'COD' ? 'checked' : ''} class="pharmacy-pay-radio text-[#0CA854]" />
                            <span>Cash / QR on Delivery (COD)</span>
                          </div>
                          <i data-lucide="banknote" class="w-4 h-4 text-slate-600"></i>
                        </label>

                        <label class="p-3 rounded-xl border flex items-center justify-between cursor-pointer ${state.pharmacy.paymentMethod === 'INSURANCE' ? 'border-[#0CA854] bg-emerald-50/40 font-bold' : 'border-slate-200'}">
                          <div class="flex items-center gap-2 text-xs">
                            <input type="radio" name="payment-method" value="INSURANCE" ${state.pharmacy.paymentMethod === 'INSURANCE' ? 'checked' : ''} class="pharmacy-pay-radio text-[#0CA854]" />
                            <span>ABHA / Health Insurance Direct</span>
                          </div>
                          <i data-lucide="shield-check" class="w-4 h-4 text-emerald-600"></i>
                        </label>
                      </div>
                    </div>

                    <!-- Submit Button -->
                    <button id="pharmacy-btn-place-order" class="w-full py-4 rounded-2xl bg-[#0CA854] hover:bg-[#087F3F] text-white font-black text-sm shadow-xl shadow-emerald-700/30 flex items-center justify-center gap-2 transition-all hover:scale-102">
                      <i data-lucide="check-circle" class="w-5 h-5"></i>
                      <span>Confirm & Place Home Delivery (₹${grandTotal.toFixed(2)})</span>
                    </button>

                    <p class="text-[10px] text-center text-slate-400">
                      Dispatched with verified tamper-proof seal from MHSSCE Hospital Pharmacy.
                    </p>
                  </div>

                </div>
              </div>
            `}

          </div>
        ` : ''}

        <!-- VIEW 3: TRACKING & ORDER HISTORY -->
        ${state.pharmacy.activeView === 'tracking' ? `
          <div class="space-y-6">
            
            <div class="flex items-center justify-between border-b border-slate-200 pb-4">
              <button id="pharmacy-btn-back-to-catalog-2" class="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors">
                <i data-lucide="arrow-left" class="w-4 h-4"></i> Back to Medicine Catalog
              </button>
              <h2 class="text-lg font-black text-slate-900">Medicine Deliveries & Real-Time Tracking</h2>
            </div>

            ${patientOrders.length === 0 ? `
              <div class="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
                <div class="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                  <i data-lucide="truck" class="w-8 h-8"></i>
                </div>
                <h4 class="text-lg font-bold text-slate-800">No Active Medicine Orders</h4>
                <p class="text-xs text-slate-500 max-w-sm mx-auto">
                  When you place an order for home delivered medicines, you can track the rider and delivery status in real-time here.
                </p>
                <button id="pharmacy-btn-browse-empty-2" class="px-6 py-3 rounded-2xl bg-[#0CA854] text-white font-bold text-xs shadow-md">
                  Browse Pharmacy
                </button>
              </div>
            ` : `
              <div class="space-y-6">
                ${patientOrders.map((order, idx) => `
                  <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-6 p-6 md:p-8">
                    
                    <!-- Order Header -->
                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                      <div class="space-y-1">
                        <div class="flex items-center gap-3">
                          <span class="text-xs font-mono font-bold bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg">
                            ${order.orderId}
                          </span>
                          <span class="px-3 py-1 rounded-full text-xs font-black uppercase ${
                            order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800 animate-pulse'
                          }">
                            ${order.status}
                          </span>
                        </div>
                        <div class="text-xs text-slate-500">
                          Placed: <span class="font-bold text-slate-700">${order.orderDate}</span> · ${order.deliveryMode}
                        </div>
                      </div>

                      <div class="text-left md:text-right">
                        <div class="text-xs text-slate-500 font-medium">Total Paid</div>
                        <div class="text-xl font-black text-slate-900">₹${Number(order.totalAmount).toFixed(2)}</div>
                        <div class="text-[10px] text-emerald-600 font-bold">${order.paymentMethod}</div>
                      </div>
                    </div>

                    <!-- Live Delivery Stepper -->
                    <div class="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                      <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <i data-lucide="navigation" class="w-4 h-4 text-[#0CA854]"></i>
                          Live Delivery Tracking
                        </span>
                        <span class="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                          ETA: ${order.rider?.eta || '20 Mins'}
                        </span>
                      </div>

                      <!-- Stepper -->
                      <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 text-xs">
                        <div class="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-emerald-300">
                          <div class="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                            ✓
                          </div>
                          <div>
                            <div class="font-bold text-slate-900">Order Confirmed</div>
                            <div class="text-[10px] text-slate-400">Prescription Verified</div>
                          </div>
                        </div>

                        <div class="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-emerald-300">
                          <div class="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                            ✓
                          </div>
                          <div>
                            <div class="font-bold text-slate-900">Pharmacy Packed</div>
                            <div class="text-[10px] text-slate-400">Batch Q.C. Checked</div>
                          </div>
                        </div>

                        <div class="flex items-center gap-2.5 p-2 rounded-xl ${order.status === 'Out for Delivery' || order.status === 'Delivered' ? 'bg-white border border-emerald-400' : 'bg-slate-100 opacity-60'}">
                          <div class="w-7 h-7 rounded-full ${order.status === 'Out for Delivery' || order.status === 'Delivered' ? 'bg-[#0CA854] text-white animate-bounce' : 'bg-slate-300 text-slate-600'} flex items-center justify-center text-xs font-bold flex-shrink-0">
                            🛵
                          </div>
                          <div>
                            <div class="font-bold text-slate-900">Out for Delivery</div>
                            <div class="text-[10px] text-slate-500">Rider on the way</div>
                          </div>
                        </div>

                        <div class="flex items-center gap-2.5 p-2 rounded-xl ${order.status === 'Delivered' ? 'bg-white border border-emerald-400' : 'bg-slate-100 opacity-60'}">
                          <div class="w-7 h-7 rounded-full ${order.status === 'Delivered' ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-600'} flex items-center justify-center text-xs font-bold flex-shrink-0">
                            🏠
                          </div>
                          <div>
                            <div class="font-bold text-slate-900">Delivered</div>
                            <div class="text-[10px] text-slate-400">At Doorstep</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Rider Info & Delivery Address -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      
                      <!-- Rider Box -->
                      <div class="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 flex items-center justify-between">
                        <div class="flex items-center gap-3">
                          <div class="w-12 h-12 rounded-2xl bg-[#0F2942] text-white flex items-center justify-center text-lg font-bold">
                            🛵
                          </div>
                          <div>
                            <div class="text-[10px] font-bold text-emerald-800 uppercase">Assigned Hospital Rider</div>
                            <div class="font-bold text-slate-900 text-sm">${order.rider?.name || 'Sanjay Shinde'}</div>
                            <div class="text-[11px] text-slate-500">${order.rider?.vehicle || 'Honda Activa (MH-01-CV-4421)'}</div>
                          </div>
                        </div>

                        <a href="tel:${order.rider?.phone || '+919876512340'}" class="px-3 py-2 rounded-xl bg-[#0CA854] hover:bg-[#087F3F] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm">
                          <i data-lucide="phone-call" class="w-3.5 h-3.5"></i>
                          <span>Call Rider</span>
                        </a>
                      </div>

                      <!-- Destination Address -->
                      <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                        <div class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                          <i data-lucide="map-pin" class="w-3.5 h-3.5 text-[#0CA854]"></i>
                          <span>Delivery Destination</span>
                        </div>
                        <div class="font-bold text-slate-900 text-xs">${order.patientName || patientName} (${order.contactNumber})</div>
                        <div class="text-[11px] text-slate-600">${order.deliveryAddress}</div>
                      </div>

                    </div>

                    <!-- Ordered Items List -->
                    <div class="border-t border-slate-100 pt-4 space-y-2">
                      <div class="text-xs font-bold text-slate-700">Packed Medicines:</div>
                      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        ${(order.items || []).map(it => `
                          <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex justify-between items-center">
                            <span class="font-bold text-slate-800">${it.name} <span class="text-slate-500 font-normal">x${it.qty}</span></span>
                            <span class="font-black text-slate-900">₹${(it.price * it.qty).toFixed(2)}</span>
                          </div>
                        `).join('')}
                      </div>
                    </div>

                    <!-- Action Footers -->
                    <div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                      <button onclick="alert('Digital Pharmacy Invoice & GST Receipt #MK-INV-${Date.now().toString().slice(-6)} downloaded.')" class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5">
                        <i data-lucide="download" class="w-3.5 h-3.5"></i>
                        <span>Download Tax Invoice (Receipt)</span>
                      </button>

                      <button id="pharmacy-btn-order-more" class="px-5 py-2 rounded-xl bg-[#0CA854] hover:bg-[#087F3F] text-white text-xs font-bold flex items-center gap-1.5 shadow-md">
                        <i data-lucide="plus" class="w-3.5 h-3.5"></i>
                        <span>Order More Medicines</span>
                      </button>
                    </div>

                  </div>
                `).join('')}
              </div>
            `}

          </div>
        ` : ''}

        <!-- ==========================================
             MODAL: CUSTOM MEDICINE REQUEST
             ========================================== -->
        <div id="pharmacy-custom-modal" class="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs ${state.pharmacy.isCustomModalOpen ? 'flex' : 'hidden'} items-center justify-center p-4">
          <div class="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 md:p-8 space-y-6 animate-in fade-in zoom-in duration-200">
            
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <div class="flex items-center gap-2">
                <div class="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <i data-lucide="plus-circle" class="w-5 h-5"></i>
                </div>
                <div>
                  <h3 class="font-black text-slate-900 text-base">Request Custom Medicine</h3>
                  <p class="text-[10px] text-slate-500">MHSSCE Central Hospital Pharmacy Sourcing</p>
                </div>
              </div>
              <button id="pharmacy-btn-close-modal" class="text-slate-400 hover:text-slate-600 p-1">
                <i data-lucide="x" class="w-5 h-5"></i>
              </button>
            </div>

            <form id="pharmacy-custom-med-form" class="space-y-4 text-xs">
              <div>
                <label class="block font-bold text-slate-800 mb-1">Medicine Name & Strength *</label>
                <input type="text" id="custom-med-name" required placeholder="e.g. Augmentin 625 Duo, Thyronorm 75mcg..." class="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0CA854] text-xs font-semibold" />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block font-bold text-slate-800 mb-1">Dosage Form</label>
                  <select id="custom-med-form-type" class="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0CA854]">
                    <option value="Tablet (Strip)">Tablet (Strip)</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Syrup / Liquid">Syrup / Liquid</option>
                    <option value="Inhaler / Respules">Inhaler / Respules</option>
                    <option value="Ointment / Gel">Ointment / Gel</option>
                    <option value="Injection / Vial">Injection / Vial</option>
                  </select>
                </div>
                <div>
                  <label class="block font-bold text-slate-800 mb-1">Quantity Needed</label>
                  <input type="number" id="custom-med-qty" min="1" max="20" value="1" class="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0CA854]" />
                </div>
              </div>

              <div>
                <label class="block font-bold text-slate-800 mb-1">Prescription Notes / Doctor Instructions</label>
                <textarea id="custom-med-notes" rows="2" placeholder="e.g. Take 1 tablet twice daily after meals as directed by Dr. Sharma" class="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0CA854]"></textarea>
              </div>

              <div class="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <label class="block font-bold text-slate-700 mb-1">Attach Doctor Prescription (Optional)</label>
                <input type="file" id="custom-med-file" class="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-100 file:text-[#0CA854] hover:file:bg-emerald-200" />
                <p class="text-[10px] text-slate-400 mt-1">Accepts prescription slip image, PDF or Doctor OPD Token ID</p>
              </div>

              <div class="pt-2">
                <button type="submit" class="w-full py-3.5 rounded-2xl bg-[#0CA854] hover:bg-[#087F3F] text-white font-black text-xs shadow-lg shadow-emerald-700/30 flex items-center justify-center gap-2">
                  <i data-lucide="plus" class="w-4 h-4"></i>
                  <span>Add to Home Delivery Cart</span>
                </button>
              </div>
            </form>

          </div>
        </div>

      </div>
    `;
  }

  function attachPharmacyListeners() {
    // 1. Switch View: Cart
    $('#pharmacy-btn-view-cart')?.addEventListener('click', () => {
      state.pharmacy.activeView = 'cart';
      renderApp();
    });

    // 2. Switch View: Orders
    $('#pharmacy-btn-view-orders')?.addEventListener('click', () => {
      state.pharmacy.activeView = 'tracking';
      renderApp();
    });

    // 3. Back to Catalog
    $('#pharmacy-btn-back-to-catalog')?.addEventListener('click', () => {
      state.pharmacy.activeView = 'catalog';
      renderApp();
    });
    $('#pharmacy-btn-back-to-catalog-2')?.addEventListener('click', () => {
      state.pharmacy.activeView = 'catalog';
      renderApp();
    });
    $('#pharmacy-btn-browse-empty')?.addEventListener('click', () => {
      state.pharmacy.activeView = 'catalog';
      renderApp();
    });
    $('#pharmacy-btn-browse-empty-2')?.addEventListener('click', () => {
      state.pharmacy.activeView = 'catalog';
      renderApp();
    });
    $('#pharmacy-btn-order-more')?.addEventListener('click', () => {
      state.pharmacy.activeView = 'catalog';
      renderApp();
    });

    // 4. Category Filter Buttons
    $$('.pharmacy-category-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.pharmacy.selectedCategory = btn.getAttribute('data-category');
        renderApp();
      });
    });

    // 5. Rx / OTC Filter Buttons
    $$('.pharmacy-rx-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.pharmacy.rxFilter = btn.getAttribute('data-rx-filter');
        renderApp();
      });
    });

    // 6. Search input
    const searchInput = $('#pharmacy-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        state.pharmacy.searchQuery = e.target.value;
        renderApp();
        // Restore focus to search input
        const newSearchInput = $('#pharmacy-search-input');
        if (newSearchInput) {
          newSearchInput.focus();
          newSearchInput.setSelectionRange(newSearchInput.value.length, newSearchInput.value.length);
        }
      });
    }

    // 7. Clear search
    $('#pharmacy-btn-clear-search')?.addEventListener('click', () => {
      state.pharmacy.searchQuery = '';
      renderApp();
    });

    // 8. Add To Cart from catalog
    $$('.pharmacy-btn-add-to-cart').forEach(btn => {
      btn.addEventListener('click', () => {
        const medId = btn.getAttribute('data-med-id');
        const med = (window.MEDIKIOSIK_PHARMACY.medicines || []).find(m => m.id === medId);
        if (med) {
          state.pharmacy.cart.push({
            id: med.id,
            name: med.name,
            genericName: med.genericName,
            form: med.form,
            price: med.price,
            mrp: med.mrp,
            qty: 1,
            prescriptionRequired: med.prescriptionRequired,
            isCustom: false
          });
          renderApp();
        }
      });
    });

    // 9. Increase Qty
    $$('.pharmacy-btn-increase-qty').forEach(btn => {
      btn.addEventListener('click', () => {
        const medId = btn.getAttribute('data-med-id');
        const entry = state.pharmacy.cart.find(i => i.id === medId);
        if (entry) {
          entry.qty += 1;
          renderApp();
        }
      });
    });

    // 10. Decrease Qty
    $$('.pharmacy-btn-decrease-qty').forEach(btn => {
      btn.addEventListener('click', () => {
        const medId = btn.getAttribute('data-med-id');
        const entryIndex = state.pharmacy.cart.findIndex(i => i.id === medId);
        if (entryIndex !== -1) {
          if (state.pharmacy.cart[entryIndex].qty > 1) {
            state.pharmacy.cart[entryIndex].qty -= 1;
          } else {
            state.pharmacy.cart.splice(entryIndex, 1);
          }
          renderApp();
        }
      });
    });

    // 11. Remove Item
    $$('.pharmacy-btn-remove-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const medId = btn.getAttribute('data-med-id');
        state.pharmacy.cart = state.pharmacy.cart.filter(i => i.id !== medId);
        renderApp();
      });
    });

    // 12. Clear entire cart
    $('#pharmacy-btn-clear-cart')?.addEventListener('click', () => {
      if (confirm('Clear all items from medicine cart?')) {
        state.pharmacy.cart = [];
        renderApp();
      }
    });

    // 13. 1-Click Add All Doctor Prescriptions to Cart
    $('#pharmacy-btn-add-all-rx')?.addEventListener('click', () => {
      const user = JSON.parse(localStorage.getItem('careforge_user')) || {};
      const patientId = user.id || state.kiosk.patient.id || 'pat-1';
      const rxs = (window.SyncEngine ? window.SyncEngine.getPrescriptions(patientId) : []).concat(
        (window.SyncEngine ? window.SyncEngine.getPrescriptions('pat-1') : [])
      );

      let addedCount = 0;
      rxs.forEach(rx => {
        const existing = state.pharmacy.cart.find(i => i.name.toLowerCase() === rx.medication.toLowerCase() || i.genericName?.toLowerCase() === rx.medication.toLowerCase());
        if (!existing) {
          // Find if matches catalog
          const catalogMatch = (window.MEDIKIOSIK_PHARMACY.medicines || []).find(m => 
            rx.medication.toLowerCase().includes(m.name.toLowerCase()) || 
            m.name.toLowerCase().includes(rx.medication.toLowerCase()) ||
            rx.medication.toLowerCase().includes(m.genericName.toLowerCase())
          );

          if (catalogMatch) {
            state.pharmacy.cart.push({
              id: catalogMatch.id,
              name: catalogMatch.name,
              genericName: catalogMatch.genericName,
              form: catalogMatch.form,
              price: catalogMatch.price,
              mrp: catalogMatch.mrp,
              qty: 1,
              prescriptionRequired: catalogMatch.prescriptionRequired,
              isCustom: false,
              notes: rx.notes
            });
          } else {
            state.pharmacy.cart.push({
              id: `custom-rx-${Date.now()}-${Math.floor(Math.random()*1000)}`,
              name: rx.medication,
              genericName: `Prescribed by ${rx.doctorName}`,
              form: 'Doctor Prescribed Rx',
              price: 85.00,
              mrp: 100.00,
              qty: 1,
              prescriptionRequired: true,
              isCustom: true,
              notes: rx.notes
            });
          }
          addedCount++;
        }
      });

      alert(`Added ${addedCount} doctor-prescribed medicines directly into your home delivery cart!`);
      state.pharmacy.activeView = 'cart';
      renderApp();
    });

    // 14. Delivery Mode selection
    $$('.pharmacy-delivery-radio').forEach(r => {
      r.addEventListener('change', (e) => {
        state.pharmacy.selectedDeliveryMode = e.target.value;
        renderApp();
      });
    });

    // 15. Payment Method selection
    $$('.pharmacy-pay-radio').forEach(r => {
      r.addEventListener('change', (e) => {
        state.pharmacy.paymentMethod = e.target.value;
        renderApp();
      });
    });

    // 16. Custom Modal Triggers
    const openModal = () => {
      state.pharmacy.isCustomModalOpen = true;
      renderApp();
    };
    const closeModal = () => {
      state.pharmacy.isCustomModalOpen = false;
      renderApp();
    };

    $('#pharmacy-btn-open-custom-modal')?.addEventListener('click', openModal);
    $('#pharmacy-btn-open-custom-inline')?.addEventListener('click', openModal);
    $('#pharmacy-btn-empty-custom')?.addEventListener('click', openModal);
    $('#pharmacy-btn-close-modal')?.addEventListener('click', closeModal);

    // 17. Custom Medicine Form Submit
    $('#pharmacy-custom-med-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const medName = $('#custom-med-name')?.value;
      const formType = $('#custom-med-form-type')?.value || 'Tablet';
      const qty = parseInt($('#custom-med-qty')?.value || '1', 10);
      const notes = $('#custom-med-notes')?.value || '';

      if (medName) {
        state.pharmacy.cart.push({
          id: `custom-${Date.now()}`,
          name: medName,
          genericName: 'Hospital Procurement Request',
          form: formType,
          price: 95.00,
          mrp: 120.00,
          qty: qty,
          prescriptionRequired: true,
          isCustom: true,
          notes: notes
        });

        state.pharmacy.isCustomModalOpen = false;
        alert(`"${medName}" added to home delivery cart! Central pharmacy will pack and dispatch.`);
        state.pharmacy.activeView = 'cart';
        renderApp();
      }
    });

    // 18. Place Order Button
    $('#pharmacy-btn-place-order')?.addEventListener('click', () => {
      if (state.pharmacy.cart.length === 0) {
        alert('Cart is empty.');
        return;
      }

      const user = JSON.parse(localStorage.getItem('careforge_user')) || {};
      const patientId = user.id || state.kiosk.patient.id || 'pat-1';
      const patientName = user.name || state.kiosk.patient.name || 'Aditya Verma';

      const addrName = $('#pharmacy-addr-name')?.value || patientName;
      const addrPhone = $('#pharmacy-addr-phone')?.value || '+91 98201 44556';
      const addrFlat = $('#pharmacy-addr-flat')?.value || 'Flat 402, Sea View Heights';
      const addrStreet = $('#pharmacy-addr-street')?.value || 'Byculla East';
      const addrPincode = $('#pharmacy-addr-pincode')?.value || '400008, Mumbai';

      const fullAddress = `${addrFlat}, ${addrStreet}, ${addrPincode}`;

      const cartItems = state.pharmacy.cart || [];
      const subtotal = cartItems.reduce((sum, i) => sum + ((i.price || 0) * (i.qty || 1)), 0);
      const deliveryFee = subtotal >= 199 && state.pharmacy.selectedDeliveryMode === 'standard' ? 0 : 25;
      const grandTotal = subtotal + deliveryFee;

      const orderObj = {
        orderId: `MK-PH-${Math.floor(1000 + Math.random() * 9000)}`,
        patientId: patientId,
        patientName: addrName,
        contactNumber: addrPhone,
        deliveryAddress: fullAddress,
        orderDate: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        items: JSON.parse(JSON.stringify(cartItems)),
        totalAmount: grandTotal,
        deliveryMode: state.pharmacy.selectedDeliveryMode === 'express' ? '⚡ Express Hospital Hub (30 Mins)' : '🚚 Standard Same-Day Home Delivery',
        paymentMethod: `${state.pharmacy.paymentMethod} - Verified`,
        status: 'Out for Delivery',
        rider: {
          name: 'Sanjay Shinde (MHSSCE Express)',
          phone: '+91 98765 12340',
          vehicle: 'Honda Activa (MH-01-CV-4421)',
          eta: '18-25 Mins'
        }
      };

      if (window.SyncEngine) {
        window.SyncEngine.addPharmacyOrder(orderObj);
      }

      // Clear cart & switch to tracking
      state.pharmacy.cart = [];
      state.pharmacy.activeView = 'tracking';
      state.pharmacy.activeTrackingOrderId = orderObj.orderId;

      alert(`Order ${orderObj.orderId} placed successfully! Rider assigned for 30-min express home delivery.`);
      renderApp();
    });
  }

  // --- Global Window Helpers for Inter-Component Navigation ---
  window.OrderRxToPharmacy = function(medicationName, doctorName) {
    state.currentTab = 'pharmacy';
    state.pharmacy.activeView = 'cart';

    // Add this medicine to cart
    const catalogMatch = (window.MEDIKIOSIK_PHARMACY?.medicines || []).find(m => 
      medicationName.toLowerCase().includes(m.name.toLowerCase()) || 
      m.name.toLowerCase().includes(medicationName.toLowerCase())
    );

    if (catalogMatch) {
      state.pharmacy.cart.push({
        id: catalogMatch.id,
        name: catalogMatch.name,
        genericName: catalogMatch.genericName,
        form: catalogMatch.form,
        price: catalogMatch.price,
        mrp: catalogMatch.mrp,
        qty: 1,
        prescriptionRequired: catalogMatch.prescriptionRequired,
        isCustom: false,
        notes: `Prescribed by Dr. ${doctorName || 'Doctor'}`
      });
    } else {
      state.pharmacy.cart.push({
        id: `rx-${Date.now()}`,
        name: medicationName,
        genericName: `Doctor Prescription (${doctorName || 'OPD Doctor'})`,
        form: 'Prescription Item',
        price: 85.00,
        mrp: 100.00,
        qty: 1,
        prescriptionRequired: true,
        isCustom: true,
        notes: `Prescription from ${doctorName}`
      });
    }

    renderApp();
  };

  window.SwitchToPharmacyTab = function() {
    state.currentTab = 'pharmacy';
    renderApp();
  };

  // --- Initialize App ---
  document.addEventListener('DOMContentLoaded', () => {
    initSpeechRecognition();
    renderApp();

    $('#dismiss-red-flag-btn')?.addEventListener('click', () => {
      const modal = $('#red-flag-modal');
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
    });

    $('#call-emergency-btn')?.addEventListener('click', () => {
      alert('Alerting Emergency OPD Triage Team.');
    });
  });

})();
