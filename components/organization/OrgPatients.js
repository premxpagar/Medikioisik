function RenderOrgPatients() {
  const user = JSON.parse(localStorage.getItem('careforge_user'));
  const patients = window.MOCK_DATA.patients;

  return `
    ${RenderNavbar('Organization Portal', user.organization, GetOrgNav())}
    
    <main class="max-w-7xl mx-auto px-4 py-8 space-y-6 relative">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-slate-900">Patient Operations</h1>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-slate-600">
            <thead class="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th class="px-6 py-4">Patient</th>
                <th class="px-6 py-4">Age / Gender</th>
                <th class="px-6 py-4">Appointment</th>
                <th class="px-6 py-4">Records on File</th>
                <th class="px-6 py-4 text-right">Status & Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${patients.map(p => `
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="px-6 py-4">
                    <div class="font-bold text-slate-900">${p.name}</div>
                    <div class="text-[10px] text-slate-500 mt-0.5">ID: ${p.id.toUpperCase()}</div>
                  </td>
                  <td class="px-6 py-4 text-slate-700">${p.age}y, ${p.gender}</td>
                  <td class="px-6 py-4">
                    <div class="font-medium text-slate-900">${p.appointmentTime}</div>
                    <div class="text-[10px] text-slate-500 mt-0.5">${p.doctor}</div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="space-y-1">
                      ${p.documents && p.documents.length ? `
                        <div class="flex items-center gap-1.5 text-[11px] text-slate-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 w-max">
                          <i data-lucide="file-text" class="w-3 h-3 text-blue-500"></i> ${p.documents.length} Lab Report(s)
                        </div>
                      ` : ''}
                      ${p.oldPrescriptions && p.oldPrescriptions.length ? `
                        <div class="flex items-center gap-1.5 text-[11px] text-slate-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100 w-max">
                          <i data-lucide="pill" class="w-3 h-3 text-purple-500"></i> ${p.oldPrescriptions.length} Old Prescription(s)
                        </div>
                      ` : ''}
                      ${(!p.documents || !p.documents.length) && (!p.oldPrescriptions || !p.oldPrescriptions.length) ? `
                        <span class="text-[11px] text-slate-400 italic">No prior records</span>
                      ` : ''}
                    </div>
                  </td>
                  <td class="px-6 py-4 text-right space-y-2">
                    <div class="flex justify-end gap-2 items-center">
                      <span class="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        p.status === 'Ready for Review' ? 'bg-emerald-100 text-emerald-700' :
                        p.status === 'Under Consultation' ? 'bg-amber-100 text-amber-700' :
                        p.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-700'
                      }">
                        ${p.status}
                      </span>
                      <button data-pat-id="${p.id}" class="btn-view-history px-3 py-1.5 rounded-lg bg-[#0F2942] hover:bg-slate-800 text-white text-[11px] font-bold shadow-sm transition-all flex items-center gap-1.5">
                        <i data-lucide="history" class="w-3 h-3"></i> View History
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <!-- Patient History Modal -->
    <div id="history-modal" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm hidden items-center justify-center p-4">
      <div class="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] shadow-2xl flex flex-col">
        <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-2xl">
          <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
            <i data-lucide="folder-clock" class="w-5 h-5 text-[#0CA854]"></i>
            Patient Medical History
          </h2>
          <button id="close-history-modal" class="text-slate-400 hover:text-red-500 transition-colors">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>
        <div id="history-modal-content" class="p-6 overflow-y-auto space-y-6">
          <!-- Populated by JS -->
        </div>
      </div>
    </div>
  `;
}

function AttachOrgPatientsListeners() {
  const modal = document.getElementById('history-modal');
  const closeBtn = document.getElementById('close-history-modal');
  const content = document.getElementById('history-modal-content');

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    });
  }

  document.querySelectorAll('.btn-view-history').forEach(btn => {
    btn.addEventListener('click', () => {
      const patId = btn.getAttribute('data-pat-id');
      const p = window.MOCK_DATA.patients.find(x => x.id === patId);
      if (!p || !modal || !content) return;

      const docsHTML = (p.documents && p.documents.length) ? p.documents.map(d => `
        <div class="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl">
          <i data-lucide="file-text" class="w-4 h-4 text-blue-500"></i>
          <span class="text-xs font-bold text-slate-800">${d}</span>
        </div>
      `).join('') : '<div class="text-xs text-slate-400 italic">No lab reports found.</div>';

      const rxHTML = (p.oldPrescriptions && p.oldPrescriptions.length) ? p.oldPrescriptions.map(r => `
        <div class="flex items-center gap-2 p-3 bg-purple-50 border border-purple-100 rounded-xl">
          <i data-lucide="pill" class="w-4 h-4 text-purple-500"></i>
          <span class="text-xs font-bold text-slate-800">${r}</span>
        </div>
      `).join('') : '<div class="text-xs text-slate-400 italic">No old prescriptions found.</div>';

      content.innerHTML = `
        <div class="flex justify-between items-start mb-2">
          <div>
            <h3 class="font-black text-xl text-slate-900">${p.name}</h3>
            <p class="text-xs text-slate-500 font-medium">Age: ${p.age} | Gender: ${p.gender} | ID: ${p.id.toUpperCase()}</p>
          </div>
        </div>
        
        <div class="space-y-4">
          <h4 class="text-sm font-bold text-slate-800 border-b pb-2">Past Prescriptions</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            ${rxHTML}
          </div>
        </div>

        <div class="space-y-4 pt-2">
          <h4 class="text-sm font-bold text-slate-800 border-b pb-2">Lab & Scan Reports</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            ${docsHTML}
          </div>
        </div>
      `;

      if (window.lucide) window.lucide.createIcons();
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    });
  });
}
