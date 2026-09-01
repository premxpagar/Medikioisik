function GetDoctorNav() {
  return [
    { label: 'Dashboard', path: 'doctor', icon: 'layout-dashboard' },
    { label: 'Alerts', path: 'doctor/alerts', icon: 'bell' }
  ];
}

function RenderDoctorHome() {
  const user = JSON.parse(localStorage.getItem('careforge_user'));
  const patients = window.MOCK_DATA.patients.filter(p => p.doctor === user.name);
  
  const readyCount = patients.filter(p => p.status === 'Ready for Review').length;
  const underConsultCount = patients.filter(p => p.status === 'Under Consultation').length;
  const completedCount = patients.filter(p => p.status === 'Completed').length;

  return `
    ${RenderNavbar('Doctor Workstation', user.specialization, GetDoctorNav())}
    
    <main class="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      <!-- Top Summary Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <span class="text-slate-500 text-xs font-bold uppercase tracking-wider">Today's Patients</span>
          <span class="text-3xl font-black text-slate-900 mt-2">${patients.length}</span>
        </div>
        <div class="bg-emerald-50 p-6 rounded-2xl border border-emerald-200 shadow-sm flex flex-col">
          <span class="text-emerald-700 text-xs font-bold uppercase tracking-wider">Ready for Review</span>
          <span class="text-3xl font-black text-emerald-700 mt-2">${readyCount}</span>
        </div>
        <div class="bg-amber-50 p-6 rounded-2xl border border-amber-200 shadow-sm flex flex-col">
          <span class="text-amber-700 text-xs font-bold uppercase tracking-wider">Under Consultation</span>
          <span class="text-3xl font-black text-amber-700 mt-2">${underConsultCount}</span>
        </div>
        <div class="bg-blue-50 p-6 rounded-2xl border border-blue-200 shadow-sm flex flex-col">
          <span class="text-blue-700 text-xs font-bold uppercase tracking-wider">Completed</span>
          <span class="text-3xl font-black text-blue-700 mt-2">${completedCount}</span>
        </div>
      </div>

      <!-- Main Section -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 class="text-lg font-bold text-slate-900">Today's Consultations</h2>
        </div>
        
        <div class="divide-y divide-slate-100">
          ${patients.map(p => `
            <div class="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                  <i data-lucide="user" class="w-6 h-6"></i>
                </div>
                <div>
                  <h3 class="text-base font-bold text-slate-900">${p.name}</h3>
                  <div class="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span>${p.age} years</span>
                    <span>•</span>
                    <span class="flex items-center gap-1"><i data-lucide="clock" class="w-3 h-3"></i> ${p.appointmentTime}</span>
                  </div>
                  <div class="text-sm font-medium text-slate-700 mt-1">
                    ${p.chiefComplaint}
                  </div>
                </div>
              </div>
              
              <div class="flex flex-col md:items-end gap-2 text-right">
                <span class="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                  p.status === 'Ready for Review' ? 'bg-emerald-100 text-emerald-700' :
                  p.status === 'Under Consultation' ? 'bg-amber-100 text-amber-700' :
                  'bg-blue-100 text-blue-700'
                }">
                  ${p.status}
                </span>
                <a href="#doctor/patient/${p.id}" class="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors">
                  View Case
                </a>
              </div>
            </div>
          `).join('')}
          
          ${patients.length === 0 ? `<div class="p-8 text-center text-slate-500">No patients scheduled for today.</div>` : ''}
        </div>
      </div>
    </main>
  `;
}

function AttachDoctorHomeListeners() {}
