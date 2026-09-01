function RenderDoctorPatientCase(id) {
  const user = JSON.parse(localStorage.getItem('careforge_user'));
  const patient = window.MOCK_DATA.patients.find(p => p.id === id);

  if (!patient) return `<div class="p-8 text-center">Patient not found</div>`;

  return `
    ${RenderNavbar('Doctor Workstation', user.specialization, GetDoctorNav())}
    
    <main class="max-w-5xl mx-auto px-4 py-8 space-y-6">
      
      <!-- Back & Action Bar -->
      <div class="flex items-center justify-between">
        <a href="#doctor" class="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
          <i data-lucide="arrow-left" class="w-4 h-4"></i> Back to Dashboard
        </a>
        <div class="flex items-center gap-3">
          <button class="px-4 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50">
            Edit Information
          </button>
          <button class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm">
            Start Consultation
          </button>
        </div>
      </div>

      <!-- Patient Header Card -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-center justify-between">
        <div class="flex items-center gap-5">
          <div class="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 text-xl font-bold">
            ${patient.name.charAt(0)}
          </div>
          <div>
            <h1 class="text-2xl font-bold text-slate-900">${patient.name}</h1>
            <div class="flex flex-wrap items-center gap-4 text-sm text-slate-500 mt-1">
              <span>${patient.age} yrs, ${patient.gender}</span>
              <span>•</span>
              <span class="flex items-center gap-1"><i data-lucide="clock" class="w-4 h-4"></i> ${patient.appointmentTime}</span>
              <span>•</span>
              <span class="text-slate-700 font-medium">${patient.chiefComplaint}</span>
            </div>
          </div>
        </div>
        <div id="verification-status" class="text-right">
           <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
             <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
             AI-GENERATED DRAFT
           </span>
           <div class="text-[10px] text-slate-500 font-medium mt-1">Pending Doctor Review</div>
        </div>
      </div>

      <!-- Main Info & Actions -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <!-- Left Column: Case Details & Prescriptions -->
        <div class="md:col-span-2 space-y-6">
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <h2 class="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Clinical Details</h2>
            
            <div>
              <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Chief Complaint</h3>
              <p class="text-sm font-medium text-slate-800">${patient.chiefComplaint}</p>
            </div>
            
            <!-- Past Records -->
            <div class="pt-4 border-t border-slate-100">
              <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Past Medical Records</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <div class="text-[10px] font-bold text-slate-400">OLD PRESCRIPTIONS</div>
                  ${(patient.oldPrescriptions && patient.oldPrescriptions.length) ? patient.oldPrescriptions.map(r => `
                    <div class="flex items-center gap-2 p-2 bg-purple-50 border border-purple-100 rounded-lg">
                      <i data-lucide="pill" class="w-3.5 h-3.5 text-purple-500"></i>
                      <span class="text-[11px] font-bold text-slate-800">${r}</span>
                    </div>
                  `).join('') : '<div class="text-[11px] text-slate-400 italic">None on record.</div>'}
                </div>
                <div class="space-y-2">
                  <div class="text-[10px] font-bold text-slate-400">LAB & SCAN REPORTS</div>
                  ${(patient.documents && patient.documents.length) ? patient.documents.map(d => `
                    <div class="flex items-center gap-2 p-2 bg-blue-50 border border-blue-100 rounded-lg">
                      <i data-lucide="file-text" class="w-3.5 h-3.5 text-blue-500"></i>
                      <span class="text-[11px] font-bold text-slate-800">${d}</span>
                    </div>
                  `).join('') : '<div class="text-[11px] text-slate-400 italic">None on record.</div>'}
                </div>
              </div>
            </div>

            <!-- Prescription Form -->
            <div class="pt-4 border-t border-slate-100">
              <h3 class="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <i data-lucide="pill" class="w-4 h-4 text-[#0CA854]"></i> Add Prescription
              </h3>
              <form id="rx-form" class="space-y-3">
                <input type="text" id="rx-med" required placeholder="Medication (e.g. Amoxicillin 500mg)" class="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-800 focus:ring-2 focus:ring-[#0CA854] outline-none">
                <textarea id="rx-notes" required placeholder="Instructions (e.g. 1 tab PO TID x 7 days)" class="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-800 focus:ring-2 focus:ring-[#0CA854] outline-none" rows="2"></textarea>
                <div class="flex justify-end">
                  <button type="submit" class="px-4 py-2 bg-[#0F2942] hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-md transition-all">
                    Send to Patient
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div class="flex justify-between items-center bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
             <div class="text-sm text-emerald-800 font-bold flex items-center gap-2">
               <i data-lucide="check-circle" class="w-4 h-4"></i> Complete Consultation
             </div>
             <button id="btn-verify" class="px-6 py-2 rounded-xl bg-[#0CA854] hover:bg-[#087F3F] text-white font-bold text-sm shadow-md transition-all">
               Mark Completed
             </button>
          </div>
        </div>

        <!-- Right Column: Chat & Timeline -->
        <div class="space-y-6 flex flex-col">
          
          <!-- Sync Chat UI Injection -->
          <div id="doctor-chat-root" class="flex flex-col flex-1 min-h-[400px]">
            ${typeof RenderChatUI !== 'undefined' ? RenderChatUI(patient.id, 'DOCTOR', user.name) : ''}
          </div>

        </div>
      </div>
    </main>
  `;
}

function AttachDoctorPatientCaseListeners() {
  const patientId = window.location.hash.split('/').pop();
  
  if (typeof AttachChatListeners !== 'undefined') {
    AttachChatListeners();
  }

  const rxForm = document.getElementById('rx-form');
  if (rxForm) {
    rxForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const med = document.getElementById('rx-med').value;
      const notes = document.getElementById('rx-notes').value;
      const user = JSON.parse(localStorage.getItem('careforge_user'));
      window.SyncEngine.addPrescription(patientId, user.name, med, notes);
      
      // Clear form
      document.getElementById('rx-med').value = '';
      document.getElementById('rx-notes').value = '';
      
      // Optional toast
      alert('Prescription synced to patient successfully!');
    });
  }

  // Global listener for sync updates to refresh chat only
  window.addEventListener('careforge_sync_updated', () => {
    if (AppRouter.currentPath.startsWith('doctor/patient/')) {
      const user = JSON.parse(localStorage.getItem('careforge_user'));
      const chatRoot = document.getElementById('doctor-chat-root');
      if (chatRoot && typeof RenderChatUI !== 'undefined') {
        chatRoot.innerHTML = RenderChatUI(patientId, 'DOCTOR', user.name);
        AttachChatListeners();
        if (window.lucide) window.lucide.createIcons();
      }
    }
  });

  const verifyBtn = document.getElementById('btn-verify');
  if (verifyBtn) {
    verifyBtn.addEventListener('click', () => {
      const statusDiv = document.getElementById('verification-status');
      const user = JSON.parse(localStorage.getItem('careforge_user'));
      
      statusDiv.innerHTML = `
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
          <i data-lucide="check-circle" class="w-3.5 h-3.5"></i>
          Verified by ${user.name}
        </span>
        <div class="text-[10px] text-slate-500 font-medium mt-1">Status: Verified</div>
      `;
      
      verifyBtn.textContent = "Verified";
      verifyBtn.disabled = true;
      verifyBtn.classList.replace('bg-[#0CA854]', 'bg-slate-300');
      
      if (window.lucide) window.lucide.createIcons();
    });
  }
}
