// MediKiosik — AI-Assisted Pre-Consultation System
// Core Interactive Application Engine

(function() {
  'use strict';

  // --- App State ---
  const state = {
    currentTab: 'portal', // 'portal' | 'kiosk' | 'doctor' | 'docViewer'
    portal: {
      selectedDeptId: 'gen-med',
      doctorSearchText: '',
      selectedDoctorForBooking: null
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
        doctorName: 'Dr. Ananya Sharma',
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
      department: p.department || 'General Medicine & Triage',
      doctorName: p.doctorName || 'Dr. Ananya Sharma',
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
      status: 'Waiting'
    };

    state.kiosk.generatedToken = tokenObj;

    if (triageLevel === 'EMERGENCY_RED_FLAG') {
      state.doctor.patients.unshift(tokenObj);
    } else {
      state.doctor.patients.push(tokenObj);
    }

    state.doctor.selectedPatientId = tokenObj.id;
    state.kiosk.step = 7;
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
    const tabs = [
      { id: 'portal', label: 'OPD Portal', icon: 'hospital', badge: '' },
      { id: 'kiosk', label: 'Patient Kiosk (Check-in)', icon: 'tablet', badge: 'Touch & Voice' }
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
          ${t.badge ? `<span class="text-[10px] px-1.5 py-0.5 rounded-full font-bold ${isActive ? 'bg-white text-[#0CA854]' : 'bg-slate-200 text-slate-600'}">${t.badge}</span>` : ''}
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
      renderKioskStep();
      attachKioskListeners();
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
    const depts = window.MEDIKIOSIK_DATA.departments;
    const selectedDept = depts.find(d => d.id === state.portal.selectedDeptId) || depts[0];
    const doctors = window.MEDIKIOSIK_DATA.doctors;

    const filteredDoctors = doctors.filter(doc => {
      if (state.portal.doctorSearchText) {
        const q = state.portal.doctorSearchText.toLowerCase();
        return doc.name.toLowerCase().includes(q) || doc.dept.toLowerCase().includes(q) || doc.specialty.toLowerCase().includes(q);
      }
      return true;
    });

    return `
      <div class="space-y-12 pb-16">
        <!-- Hero Section -->
        <section class="relative rounded-3xl overflow-hidden shadow-sm bg-white/70 backdrop-blur-3xl border border-white p-8 md:p-12">
          <div class="absolute -right-20 -bottom-20 w-96 h-96 bg-slate-200/50 rounded-full blur-3xl pointer-events-none"></div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-10 items-center relative z-10">
            <!-- Text Content -->
            <div class="space-y-6">
              <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/60 backdrop-blur-md border border-slate-200 text-xs font-bold text-slate-700">
                <span class="w-2 h-2 rounded-full bg-[#0CA854] animate-ping"></span>
                Smart Pre-Consultation System for High-Volume OPDs
              </div>

              <h1 class="text-3xl md:text-5xl font-black tracking-tight leading-tight text-slate-900">
                Fast-Track Your Hospital Visit with <br/>
                <span class="text-[#0CA854]">MediKiosik Smart Check-in</span>
              </h1>

              <p class="text-slate-600 text-sm md:text-base leading-relaxed">
                No more waiting in long queues to explain your medical history. Speak or tap in <strong>Hindi or English</strong>, provide your old prescriptions, and get a structured doctor summary in seconds.
              </p>

              <div class="flex flex-wrap items-center gap-4 pt-2">
                <button id="hero-start-checkin-btn" class="flex items-center gap-3 px-7 py-4 rounded-xl bg-[#0CA854] hover:bg-[#087F3F] text-white font-extrabold text-sm md:text-base shadow-lg shadow-emerald-700/20 transition-all hover:scale-105 active:scale-95">
                  <i data-lucide="tablet" class="w-5 h-5"></i>
                  <span>Start Patient Pre-Checkin (Touch & Voice)</span>
                </button>
              </div>

              <!-- Impact Metrics -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-200">
                <div>
                  <div class="text-2xl md:text-3xl font-black text-slate-900">60 Sec</div>
                  <div class="text-xs text-slate-500">Doctor Briefing Time</div>
                </div>
                <div>
                  <div class="text-2xl md:text-3xl font-black text-[#0CA854]">Hindi + English</div>
                  <div class="text-xs text-slate-500">Voice & Touch Guided</div>
                </div>
                <div>
                  <div class="text-2xl md:text-3xl font-black text-slate-900">Secure Sync</div>
                  <div class="text-xs text-slate-500">Instant Records</div>
                </div>
                <div>
                  <div class="text-2xl md:text-3xl font-black text-slate-700">Easy Access</div>
                  <div class="text-xs text-slate-500">Walk-in Friendly</div>
                </div>
              </div>
            </div>

            <!-- Hero Image (Liquid Glass Style) -->
            <div class="hidden md:block relative group">
              <div class="absolute -inset-2 bg-slate-200/50 rounded-3xl blur-2xl group-hover:bg-slate-300/50 transition-all"></div>
              <img src="/neutral_glass_doctor_1788294019521.jpg" alt="Doctor and Patient Consultation" class="relative z-10 w-full h-[400px] object-cover rounded-3xl shadow-lg border border-white/50 group-hover:scale-[1.02] transition-transform duration-500" />
            </div>
          </div>
        </section>

        <!-- How MediKiosik Works (3 Simple Steps for Patients & Doctors) -->
        <section class="space-y-6">
          <div class="text-center max-w-2xl mx-auto space-y-2">
            <span class="text-xs font-bold text-[#0CA854] tracking-widest uppercase">Simple & Intuitive</span>
            <h2 class="text-2xl md:text-3xl font-extrabold text-slate-900">How MediKiosik Works</h2>
            <p class="text-xs text-slate-500">Designed specifically for OPD patients with no smartphone or login required.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Step 1 -->
            <div class="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div class="w-12 h-12 rounded-xl bg-emerald-100 text-[#0CA854] flex items-center justify-center font-black text-lg">
                1
              </div>
              <h3 class="font-bold text-slate-900 text-base">Speak or Tap Symptoms</h3>
              <p class="text-xs text-slate-600 leading-relaxed">
                Choose Hindi or English. Speak your symptoms or tap touch buttons. MediKiosik asks relevant follow-up questions about duration and pain.
              </p>
            </div>

            <!-- Step 2 -->
            <div class="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div class="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-black text-lg">
                2
              </div>
              <h3 class="font-bold text-slate-900 text-base">Scan Old Prescriptions & Reports</h3>
              <p class="text-xs text-slate-600 leading-relaxed">
                Place old doctor slips or blood test reports on the kiosk scanner. AI OCR automatically extracts medications, past diagnoses, and lab values.
              </p>
            </div>

            <!-- Step 3 -->
            <div class="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div class="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-black text-lg">
                3
              </div>
              <h3 class="font-bold text-slate-900 text-base">Doctor Reviews Summary in 30s</h3>
              <p class="text-xs text-slate-600 leading-relaxed">
                The doctor sees a clean, structured summary before you walk in, allowing them to focus entirely on examination and treatment.
              </p>
            </div>
          </div>
        </section>

        <!-- OPD Departments & Available Clinicians -->
        <section class="space-y-6">
          <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span class="text-xs font-bold text-[#0CA854] tracking-widest uppercase">Hospital Services</span>
              <h2 class="text-2xl md:text-3xl font-extrabold text-slate-900">OPD Clinical Departments</h2>
            </div>
            <p class="text-xs text-slate-500 max-w-md">Select your department below to start pre-consultation check-in.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${depts.map(d => `
              <div class="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-lg transition-all space-y-4 flex flex-col justify-between">
                <div class="space-y-3">
                  <div class="flex items-center justify-between">
                    <div class="w-10 h-10 rounded-xl ${d.color} flex items-center justify-center font-bold">
                      <i data-lucide="${d.icon}" class="w-5 h-5"></i>
                    </div>
                    <span class="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">${d.room}</span>
                  </div>

                  <div>
                    <h3 class="text-lg font-bold text-slate-900">${d.name}</h3>
                    <p class="text-xs font-semibold text-[#0CA854]">${d.hindiName}</p>
                    <p class="text-xs text-slate-600 mt-1 leading-relaxed">${d.shortDesc}</p>
                  </div>

                  <div class="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between font-medium">
                    <span>Doctors: <strong>${d.keyDoctors.split(',')[0]}</strong></span>
                    <span class="text-emerald-700 font-bold">${d.avgWaitTime}</span>
                  </div>
                </div>

                <button data-dept-name="${d.name}" class="btn-checkin-dept w-full py-2.5 rounded-xl bg-slate-900 hover:bg-[#0CA854] text-white text-xs font-bold transition-colors flex items-center justify-center gap-2">
                  <span>Check-in to ${d.name.split(' ')[0]}</span>
                  <i data-lucide="arrow-right" class="w-4 h-4"></i>
                </button>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- Doctors on Duty -->
        <section class="space-y-6">
          <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span class="text-xs font-bold text-[#0CA854] tracking-widest uppercase">OPD Schedule</span>
              <h2 class="text-2xl md:text-3xl font-extrabold text-slate-900">Doctors Available Today</h2>
            </div>
            <div class="w-full md:w-72">
              <input id="portal-doc-search" type="text" placeholder="Search doctor by name or department..." class="w-full px-4 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 outline-none focus:border-[#0CA854]" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            ${filteredDoctors.map(d => `
              <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between space-y-4">
                <div class="space-y-3">
                  <div class="relative h-48 w-full rounded-xl overflow-hidden bg-slate-100">
                    <img src="${d.image}" alt="${d.name}" class="w-full h-full object-cover object-top" />
                    <div class="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-sm text-white text-[11px] px-2 py-0.5 rounded font-bold">
                      ★ ${d.rating}
                    </div>
                  </div>

                  <div>
                    <h4 class="font-bold text-slate-900 text-base">${d.name}</h4>
                    <p class="text-xs font-semibold text-[#0CA854]">${d.specialty}</p>
                    <p class="text-[11px] text-slate-500">${d.degrees}</p>
                  </div>

                  <div class="text-xs text-slate-600 space-y-1 pt-1 border-t border-slate-100">
                    <div class="flex items-center gap-1.5"><i data-lucide="clock" class="w-3.5 h-3.5 text-slate-400"></i> ${d.opdTiming}</div>
                    <div class="flex items-center gap-1.5"><i data-lucide="map-pin" class="w-3.5 h-3.5 text-slate-400"></i> ${d.room}</div>
                  </div>
                </div>

                <button data-doc-id="${d.id}" class="btn-checkin-with-doctor w-full py-2.5 rounded-xl bg-[#0CA854] hover:bg-[#087F3F] text-white text-xs font-bold transition-colors flex items-center justify-center gap-2">
                  <i data-lucide="tablet" class="w-4 h-4"></i>
                  <span>Pre-Checkin with Doctor</span>
                </button>
              </div>
            `).join('')}
          </div>
        </section>
      </div>
    `;
  }

  function attachPortalListeners() {
    $('#hero-start-checkin-btn')?.addEventListener('click', () => {
      state.currentTab = 'kiosk';
      renderApp();
    });

    $('#hero-open-doc-btn')?.addEventListener('click', () => {
      state.currentTab = 'doctor';
      renderApp();
    });

    $$('.btn-checkin-dept').forEach(btn => {
      btn.addEventListener('click', () => {
        const dept = btn.getAttribute('data-dept-name');
        state.kiosk.patient.department = dept;
        state.currentTab = 'kiosk';
        renderApp();
      });
    });

    $$('.btn-checkin-with-doctor').forEach(btn => {
      btn.addEventListener('click', () => {
        const docId = btn.getAttribute('data-doc-id');
        const doc = window.MEDIKIOSIK_DATA.doctors.find(d => d.id === docId);
        if (doc) {
          state.kiosk.patient.doctorName = doc.name;
          state.kiosk.patient.department = doc.dept;
          state.currentTab = 'kiosk';
          renderApp();
        }
      });
    });

    $('#portal-doc-search')?.addEventListener('input', (e) => {
      state.portal.doctorSearchText = e.target.value;
      renderActiveTab();
    });
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
        if (e.target.files && e.target.files.length > 0) {
          processOCRDocument('prescription'); // Default simulation
        }
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
        </div>
      `;

      // Show Chat Overlay when OPD is booked
      const overlay = document.getElementById('patient-portal-overlay');
      if (overlay) {
        overlay.classList.remove('hidden');
        overlay.classList.add('flex');
      }

      $('#btn-print-token')?.addEventListener('click', () => {
        window.print();
      });

      $('#btn-reset-kiosk')?.addEventListener('click', () => {
        if (overlay) {
          overlay.classList.add('hidden');
          overlay.classList.remove('flex');
        }

        state.kiosk.step = 1;
        state.kiosk.isRedFlagTriggered = false;
        state.kiosk.patient = {
          name: '',
          age: '',
          gender: 'Male',
          phone: '',
          abhaId: '',
          department: 'General Medicine & Triage',
          doctorName: 'Dr. Ananya Sharma',
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
          <div class="p-3.5 rounded-xl bg-white border border-emerald-300 shadow-sm flex items-start justify-between gap-3">
            <div class="space-y-1">
              <div class="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                <i data-lucide="check-circle-2" class="w-4 h-4 text-[#0CA854]"></i>
                <span>${doc.title}</span>
              </div>
              <p class="text-[11px] text-slate-600 line-clamp-2">${doc.ocrSnippet}</p>
            </div>
            <span class="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">OCR OK</span>
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
