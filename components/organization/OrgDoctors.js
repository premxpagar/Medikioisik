function RenderOrgDoctors() {
  const user = JSON.parse(localStorage.getItem('careforge_user'));
  const doctors = window.MOCK_DATA.doctors;

  return `
    ${RenderNavbar('Organization Portal', user.organization, GetOrgNav())}
    
    <main class="max-w-7xl mx-auto px-4 py-8 space-y-6">
      
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-slate-900">Doctors</h1>
        <button id="btn-add-doctor" class="px-5 py-2.5 bg-[#0F2942] hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-md transition-all flex items-center gap-2">
          <i data-lucide="plus" class="w-4 h-4"></i> Add Doctor
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        ${doctors.map(d => `
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all">
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-4">
                <div class="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                  <i data-lucide="stethoscope" class="w-7 h-7"></i>
                </div>
                <div>
                  <h3 class="text-lg font-bold text-slate-900">${d.name}</h3>
                  <p class="text-sm font-semibold text-[#0CA854]">${d.specialization}</p>
                </div>
              </div>
              <span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700">
                ${d.status}
              </span>
            </div>
            
            <div class="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-600">
              <span class="flex items-center gap-1.5"><i data-lucide="users" class="w-4 h-4"></i> ${d.patientsToday} Patients Today</span>
            </div>
          </div>
        `).join('')}
      </div>
    </main>

    <!-- Add Doctor Modal -->
    <div id="modal-add-doctor" class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm hidden items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 class="text-lg font-bold text-slate-900">Add New Doctor</h2>
          <button id="btn-close-modal" class="text-slate-400 hover:text-slate-700">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>
        <form id="form-add-doctor" class="p-6 space-y-4">
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-700 uppercase">Doctor Name</label>
            <input type="text" id="doc-name" required class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-[#0CA854] outline-none">
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-700 uppercase">Email</label>
            <input type="email" id="doc-email" required class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-[#0CA854] outline-none">
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-700 uppercase">Specialization</label>
              <input type="text" id="doc-spec" required class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-[#0CA854] outline-none">
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-700 uppercase">Department</label>
              <input type="text" id="doc-dept" required class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-[#0CA854] outline-none">
            </div>
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-700 uppercase">Phone</label>
            <input type="text" id="doc-phone" required class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-[#0CA854] outline-none">
          </div>
          <div class="pt-4 flex justify-end">
            <button type="submit" class="px-6 py-2.5 bg-[#0CA854] hover:bg-[#087F3F] text-white rounded-xl font-bold shadow-md transition-all">
              Add Doctor
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function AttachOrgDoctorsListeners() {
  const modal = document.getElementById('modal-add-doctor');
  
  document.getElementById('btn-add-doctor')?.addEventListener('click', () => {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  });

  document.getElementById('btn-close-modal')?.addEventListener('click', () => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  });

  document.getElementById('form-add-doctor')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const docName = document.getElementById('doc-name').value;
    const docEmail = document.getElementById('doc-email').value;
    const docSpec = document.getElementById('doc-spec').value;
    const docDept = document.getElementById('doc-dept').value;
    const docPhone = document.getElementById('doc-phone').value;

    window.MOCK_DATA.doctors.push({
      id: 'doc-' + Date.now(),
      name: docName,
      email: docEmail,
      specialization: docSpec,
      department: docDept,
      phone: docPhone,
      patientsToday: 0,
      status: 'Active'
    });

    AppRouter.handleRoute(); // re-render
  });
}
