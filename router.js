// Simple hash-based router
const AppRouter = {
  currentPath: '',
  
  init() {
    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('load', () => this.handleRoute());
    this.handleRoute();
  },

  handleRoute() {
    this.currentPath = window.location.hash.slice(1) || '/';
    
    // Auth check
    const user = JSON.parse(localStorage.getItem('careforge_user'));
    
    // Redirect unauthenticated to login
    if (!user && this.currentPath !== 'login') {
      window.location.hash = '#login';
      return;
    }

    // Role-based redirects for root
    if (user && (this.currentPath === '/' || this.currentPath === 'login')) {
      if (user.role === 'PATIENT') window.location.hash = '#patient';
      else if (user.role === 'DOCTOR') window.location.hash = '#doctor';
      else if (user.role === 'ORGANIZATION') window.location.hash = '#organization';
      return;
    }

    const appRoot = document.getElementById('app-root');
    const legacyApp = document.getElementById('legacy-patient-app');

    // Reset view visibility
    appRoot.style.display = 'none';
    legacyApp.style.display = 'none';
    appRoot.innerHTML = '';

    if (this.currentPath === 'login') {
      appRoot.style.display = 'block';
      appRoot.innerHTML = RenderLogin();
      AttachLoginListeners();
    } else if (this.currentPath === 'patient') {
      legacyApp.style.display = 'flex';
      this.initPatientSyncUI();
    } else if (this.currentPath.startsWith('doctor')) {
      appRoot.style.display = 'block';
      appRoot.innerHTML = this.renderDoctorRoutes();
      this.attachDoctorListeners();
    } else if (this.currentPath.startsWith('organization')) {
      appRoot.style.display = 'block';
      appRoot.innerHTML = this.renderOrganizationRoutes();
      this.attachOrganizationListeners();
    } else {
      // 404
      appRoot.style.display = 'block';
      appRoot.innerHTML = `<div class="p-8 text-center text-slate-500">Page not found</div>`;
    }

    // Re-initialize lucide icons if available
    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  renderDoctorRoutes() {
    if (this.currentPath === 'doctor') return RenderDoctorHome();
    if (this.currentPath === 'doctor/alerts') return RenderDoctorAlerts();
    if (this.currentPath.startsWith('doctor/patient/')) {
      const id = this.currentPath.split('/').pop();
      return RenderDoctorPatientCase(id);
    }
    return RenderDoctorHome();
  },

  attachDoctorListeners() {
    if (this.currentPath === 'doctor') AttachDoctorHomeListeners();
    else if (this.currentPath === 'doctor/alerts') AttachDoctorAlertsListeners();
    else if (this.currentPath.startsWith('doctor/patient/')) AttachDoctorPatientCaseListeners();
  },

  renderOrganizationRoutes() {
    if (this.currentPath === 'organization') return RenderOrgHome();
    if (this.currentPath === 'organization/doctors') return RenderOrgDoctors();
    if (this.currentPath === 'organization/patients') return RenderOrgPatients();
    if (this.currentPath === 'organization/appointments') return RenderOrgAppointments();
    if (this.currentPath === 'organization/billing') return RenderOrgBilling();
    if (this.currentPath === 'organization/alerts') return RenderOrgAlerts();
    return RenderOrgHome();
  },

  attachOrganizationListeners() {
    if (this.currentPath === 'organization') AttachOrgHomeListeners();
    else if (this.currentPath === 'organization/doctors') AttachOrgDoctorsListeners();
    else if (this.currentPath === 'organization/patients') AttachOrgPatientsListeners();
    else if (this.currentPath === 'organization/appointments') AttachOrgAppointmentsListeners();
    else if (this.currentPath === 'organization/billing') AttachOrgBillingListeners();
    else if (this.currentPath === 'organization/alerts') AttachOrgAlertsListeners();
  },

  initPatientSyncUI() {
    const user = JSON.parse(localStorage.getItem('careforge_user'));
    if (!user || user.role !== 'PATIENT') return;

    const overlay = document.getElementById('patient-portal-overlay');
    const toggleBtn = document.getElementById('btn-patient-sync');
    const panel = document.getElementById('patient-sync-panel');
    const tabChat = document.getElementById('tab-chat');
    const tabRx = document.getElementById('tab-rx');
    const tabInsurance = document.getElementById('tab-insurance');
    const tabHistory = document.getElementById('tab-history');
    const panelChat = document.getElementById('panel-chat');
    const panelRx = document.getElementById('panel-rx');
    const panelInsurance = document.getElementById('panel-insurance');
    const panelHistory = document.getElementById('panel-history');

    const TAB_ACTIVE = 'flex-1 py-2.5 text-[10px] font-bold text-[#0CA854] border-b-2 border-[#0CA854]';
    const TAB_INACTIVE = 'flex-1 py-2.5 text-[10px] font-bold text-slate-500 hover:text-slate-700';

    function showPanel(active) {
      [panelChat, panelRx, panelInsurance, panelHistory].forEach(p => { p.classList.add('hidden'); p.classList.remove('flex'); });
      active.classList.remove('hidden');
      active.classList.add('flex');
    }
    function setActiveTab(active) {
      [tabChat, tabRx, tabInsurance, tabHistory].forEach(t => { if(t) t.className = TAB_INACTIVE; });
      if(active) active.className = TAB_ACTIVE;
    }

    // The overlay button is hidden by default.
    // It will be shown by app.js when the patient completes OPD booking (step 6).

    // Toggle panel
    toggleBtn.onclick = () => {
      if (panel.classList.contains('hidden')) {
        panel.classList.remove('hidden');
        panel.classList.add('flex');
        this.renderPatientSync(user.id);
      } else {
        panel.classList.add('hidden');
        panel.classList.remove('flex');
      }
    };

    // Tab switching
    tabChat.onclick = () => { setActiveTab(tabChat); showPanel(panelChat); this.renderPatientSync(user.id); };
    tabRx.onclick = () => { setActiveTab(tabRx); showPanel(panelRx); this.renderPatientSync(user.id); };
    tabInsurance.onclick = () => { setActiveTab(tabInsurance); showPanel(panelInsurance); this.renderPatientSync(user.id); };
    if (tabHistory) {
      tabHistory.onclick = () => { setActiveTab(tabHistory); showPanel(panelHistory); this.renderConsultationHistory(); };
    }

    // Global listener for cross-tab sync updates
    window.addEventListener('careforge_sync_updated', () => {
      if (this.currentPath === 'patient' && !panel.classList.contains('hidden')) {
        this.renderPatientSync(user.id);
      }
    });
  },

  renderPatientSync(patientId) {
    const panelChat = document.getElementById('panel-chat');
    const panelRx = document.getElementById('panel-rx');
    const rxs = window.SyncEngine.getPrescriptions(patientId);

    // Render Chat
    if (typeof RenderChatUI !== 'undefined') {
      panelChat.innerHTML = RenderChatUI(patientId, 'PATIENT', 'Doctor');
      if (typeof AttachChatListeners !== 'undefined') AttachChatListeners();
    }

    // Render RX
    if (rxs.length === 0) {
      panelRx.innerHTML = `
        <div class="text-center p-6 space-y-3">
          <div class="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <i data-lucide="pill" class="w-6 h-6"></i>
          </div>
          <div class="text-xs font-bold text-slate-600">No prescriptions received yet</div>
          <p class="text-[10px] text-slate-400">Prescriptions issued by doctor will appear here and can be ordered directly for home delivery.</p>
          <button onclick="if(window.SwitchToPharmacyTab){ window.SwitchToPharmacyTab(); document.getElementById('patient-sync-panel').classList.add('hidden'); }" class="px-4 py-2 rounded-xl bg-[#0CA854] text-white text-xs font-bold shadow-sm">
            Browse Pharmacy & Healthcare Essentials
          </button>
        </div>
      `;
    } else {
      panelRx.innerHTML = `
        <div class="space-y-3">
          <div class="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-2">
            <div class="text-[11px] text-emerald-900 font-bold flex items-center gap-1.5">
              <i data-lucide="truck" class="w-4 h-4 text-[#0CA854]"></i>
              <span>30-Min Fast Home Delivery Active</span>
            </div>
            <button onclick="if(window.SwitchToPharmacyTab){ window.SwitchToPharmacyTab(); document.getElementById('patient-sync-panel').classList.add('hidden'); }" class="px-2.5 py-1 rounded-lg bg-[#0CA854] hover:bg-[#087F3F] text-white text-[10px] font-black shadow-xs">
              Go to Pharmacy
            </button>
          </div>

          ${rxs.map(rx => `
            <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
              <div class="flex items-center justify-between border-b border-slate-100 pb-2">
                <span class="text-xs font-bold text-[#0CA854] flex items-center gap-1">
                  <i data-lucide="pill" class="w-3.5 h-3.5"></i> Prescription Slip
                </span>
                <span class="text-[10px] text-slate-400 font-mono">${rx.date}</span>
              </div>
              <h4 class="font-bold text-slate-900 text-sm">${rx.medication}</h4>
              <p class="text-xs text-slate-600">${rx.notes}</p>
              <div class="text-[10px] text-slate-500 italic">Prescribed by ${rx.doctorName}</div>
              
              <div class="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span class="text-[10px] font-bold text-emerald-700">15% Concession Available</span>
                <button onclick="if(window.OrderRxToPharmacy){ window.OrderRxToPharmacy('${encodeURIComponent(rx.medication).replace(/'/g, "\\'")}', '${encodeURIComponent(rx.doctorName).replace(/'/g, "\\'")}'); document.getElementById('patient-sync-panel').classList.add('hidden'); }" class="px-3 py-1.5 rounded-lg bg-[#0F2942] hover:bg-[#0CA854] text-white font-bold text-[10px] flex items-center gap-1 shadow-sm transition-colors">
                  <i data-lucide="shopping-bag" class="w-3 h-3"></i>
                  <span>Order Home Delivery</span>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    // Render Insurance
    const panelInsurance = document.getElementById('panel-insurance');
    const patObj = window.MOCK_DATA.patients.find(p => p.id === patientId);
    if (patObj && patObj.billing) {
      const b = patObj.billing;
      panelInsurance.innerHTML = `
        <div class="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex flex-col gap-1 items-center text-center">
          <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Bill Amount</span>
          <span class="text-3xl font-black text-slate-900">₹${b.amount.toFixed(2)}</span>
          <span class="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase mt-1 ${b.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}">${b.paymentStatus}</span>
        </div>
        
        <div class="space-y-4 pt-4 border-t border-slate-100">
          <h3 class="text-sm font-bold text-slate-900">Insurance Claim Status</h3>
          
          <div class="flex justify-between items-center text-sm">
            <span class="text-slate-500 font-medium">Provider</span>
            <span class="font-bold text-slate-900">${b.insuranceProvider}</span>
          </div>
          <div class="flex justify-between items-center text-sm">
            <span class="text-slate-500 font-medium">Policy No.</span>
            <span class="font-mono text-slate-700 text-xs">${b.policyNumber}</span>
          </div>
          <div class="flex justify-between items-center text-sm">
            <span class="text-slate-500 font-medium">Claim Status</span>
            <span class="inline-flex px-2 py-1 rounded-md text-xs font-bold ${
              b.claimStatus === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
              b.claimStatus === 'Rejected' ? 'bg-rose-100 text-rose-700' :
              'bg-amber-100 text-amber-700'
            }">${b.claimStatus}</span>
          </div>
        </div>
        
        <div class="mt-auto pt-4">
          <button class="w-full py-3 bg-[#0F2942] hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition-all">
            Pay Remaining Balance
          </button>
        </div>
      `;
    } else {
      panelInsurance.innerHTML = `<div class="text-center text-xs text-slate-500 mt-4">No billing information found.</div>`;
    }

    if (window.lucide) window.lucide.createIcons();
  },

  renderConsultationHistory() {
    const panel = document.getElementById('panel-history');
    if (!panel) return;

    // Get all patients who were checked in on this device (have token)
    const allPats = window.SyncEngine ? window.SyncEngine.getPatients() : [];
    const visits = allPats.filter(p => p.token);

    if (!visits.length) {
      panel.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full p-6 text-center gap-3">
          <i data-lucide="folder-open" class="w-10 h-10 text-slate-300"></i>
          <p class="text-sm font-bold text-slate-500">No past consultations found</p>
          <p class="text-xs text-slate-400">Complete a check-in to see your history here.</p>
        </div>`;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    panel.innerHTML = `
      <div class="p-4 space-y-4">
        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          ${visits.length} Visit(s) on this device
        </p>
        ${visits.map((p, i) => {
          const rxs = window.SyncEngine.getPrescriptions(p.id);
          const chats = window.SyncEngine.getMessages(p.id);
          const isEmergency = p.triageLevel === 'EMERGENCY_RED_FLAG';
          const isUrgent = p.triageLevel === 'URGENT';
          return `
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <!-- Visit Header -->
              <div class="p-4 flex items-start justify-between gap-2">
                <div>
                  <div class="font-black text-slate-900 text-sm">${p.name}</div>
                  <div class="text-[10px] text-slate-500 mt-0.5">${p.checkInTime || ''} · ${p.doctorName || p.doctor || 'Doctor'}</div>
                  <div class="font-bold text-[11px] text-slate-700 mt-1">${p.chiefComplaint || 'OPD Visit'}</div>
                </div>
                <div class="text-right flex-shrink-0">
                  <div class="text-xs font-black text-slate-800">${p.token}</div>
                  <span class="inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold uppercase mt-1 ${isEmergency ? 'bg-rose-100 text-rose-700' : isUrgent ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}">
                    ${isEmergency ? 'EMERGENCY' : isUrgent ? 'URGENT' : 'ROUTINE'}
                  </span>
                </div>
              </div>

              <!-- Prescriptions -->
              ${rxs.length > 0 ? `
                <div class="border-t border-slate-100 px-4 py-3 space-y-2 bg-purple-50/40">
                  <div class="text-[10px] font-bold text-purple-700 uppercase flex items-center gap-1">
                    <i data-lucide="pill" class="w-3 h-3"></i> Medicines Prescribed
                  </div>
                  ${rxs.map(rx => `
                    <div class="bg-white border border-purple-100 rounded-lg p-2.5">
                      <div class="font-bold text-[11px] text-slate-900">${rx.medication}</div>
                      <div class="text-[10px] text-slate-600 mt-0.5">${rx.notes}</div>
                      <div class="text-[9px] text-slate-400 mt-1 italic">Dr. ${rx.doctorName} · ${rx.date}</div>
                    </div>
                  `).join('')}
                </div>
              ` : ''}

              <!-- Chat History -->
              ${chats.length > 0 ? `
                <div class="border-t border-slate-100 px-4 py-3 space-y-2 bg-slate-50/60">
                  <div class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                    <i data-lucide="message-circle" class="w-3 h-3"></i> Consultation Chat (${chats.length} messages)
                  </div>
                  <div class="space-y-1.5 max-h-[120px] overflow-y-auto">
                    ${chats.map(m => `
                      <div class="flex ${m.sender === 'PATIENT' ? 'justify-end' : 'justify-start'}">
                        <div class="px-2.5 py-1.5 rounded-lg text-[10px] max-w-[75%] ${m.sender === 'PATIENT' ? 'bg-[#0CA854] text-white' : 'bg-white border border-slate-200 text-slate-800'}">
                          ${m.text}
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}

              ${rxs.length === 0 && chats.length === 0 ? `
                <div class="border-t border-slate-100 px-4 py-3 text-[11px] text-slate-400 italic">No prescriptions or chats recorded for this visit.</div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  }
};

// Start router
AppRouter.init();
