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
    const panelChat = document.getElementById('panel-chat');
    const panelRx = document.getElementById('panel-rx');
    const panelInsurance = document.getElementById('panel-insurance');

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
    tabChat.onclick = () => {
      tabChat.className = "flex-1 py-3 text-xs font-bold text-[#0CA854] border-b-2 border-[#0CA854]";
      tabRx.className = "flex-1 py-3 text-xs font-bold text-slate-500 hover:text-slate-700";
      tabInsurance.className = "flex-1 py-3 text-xs font-bold text-slate-500 hover:text-slate-700";
      
      panelChat.classList.remove('hidden');
      panelChat.classList.add('flex');
      panelRx.classList.add('hidden');
      panelRx.classList.remove('flex');
      panelInsurance.classList.add('hidden');
      panelInsurance.classList.remove('flex');
    };

    tabRx.onclick = () => {
      tabRx.className = "flex-1 py-3 text-xs font-bold text-[#0CA854] border-b-2 border-[#0CA854]";
      tabChat.className = "flex-1 py-3 text-xs font-bold text-slate-500 hover:text-slate-700";
      tabInsurance.className = "flex-1 py-3 text-xs font-bold text-slate-500 hover:text-slate-700";
      
      panelRx.classList.remove('hidden');
      panelRx.classList.add('flex');
      panelChat.classList.add('hidden');
      panelChat.classList.remove('flex');
      panelInsurance.classList.add('hidden');
      panelInsurance.classList.remove('flex');
    };

    tabInsurance.onclick = () => {
      tabInsurance.className = "flex-1 py-3 text-xs font-bold text-[#0CA854] border-b-2 border-[#0CA854]";
      tabChat.className = "flex-1 py-3 text-xs font-bold text-slate-500 hover:text-slate-700";
      tabRx.className = "flex-1 py-3 text-xs font-bold text-slate-500 hover:text-slate-700";
      
      panelInsurance.classList.remove('hidden');
      panelInsurance.classList.add('flex');
      panelChat.classList.add('hidden');
      panelChat.classList.remove('flex');
      panelRx.classList.add('hidden');
      panelRx.classList.remove('flex');
    };

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
      panelRx.innerHTML = `<div class="text-center text-xs text-slate-500 mt-4">No prescriptions received yet.</div>`;
    } else {
      panelRx.innerHTML = rxs.map(rx => `
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div class="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
            <span class="text-xs font-bold text-[#0CA854]"><i data-lucide="pill" class="inline w-3 h-3"></i> Prescription</span>
            <span class="text-[10px] text-slate-400">${rx.date}</span>
          </div>
          <h4 class="font-bold text-slate-900 text-sm">${rx.medication}</h4>
          <p class="text-xs text-slate-600 mt-1">${rx.notes}</p>
          <div class="text-[10px] text-slate-500 mt-2 italic">Prescribed by ${rx.doctorName}</div>
        </div>
      `).join('');
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
  }
};

// Start router
AppRouter.init();
