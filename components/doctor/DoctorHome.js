function GetDoctorNav() {
  return [
    { label: 'Dashboard', path: 'doctor', icon: 'layout-dashboard' },
    { label: 'Alerts', path: 'doctor/alerts', icon: 'bell' }
  ];
}

function RenderDoctorHome() {
  const user = JSON.parse(localStorage.getItem('careforge_user'));
  const allPatients = window.MOCK_DATA.patients || [];
  // Show patients assigned to this doctor, or all if none match (fallback for demo)
  const assignedPatients = allPatients.filter(p => p.doctor === user.name || p.doctorName === user.name);
  const patients = assignedPatients.length > 0 ? assignedPatients : allPatients;
  
  const readyCount = patients.filter(p => p.status === 'Ready for Review' || p.status === 'Waiting').length;
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
          <span class="text-xs text-slate-500">Live Kiosk & Online Queue</span>
        </div>
        
        <div class="divide-y divide-slate-100">
          ${patients.map(p => {
            const hasPhysicalVerify = p.status === 'Physical Verification Required' || p.physicalVerification?.requested;
            return `
            <div class="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                  <i data-lucide="user" class="w-6 h-6"></i>
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="text-base font-bold text-slate-900">${p.name}</h3>
                    ${p.token ? `<span class="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">${p.token}</span>` : ''}
                    ${hasPhysicalVerify ? `
                      <span class="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                        <i data-lucide="building-2" class="w-3 h-3 text-amber-600"></i> MHSSCE Physical Verification
                      </span>
                    ` : ''}
                  </div>
                  <div class="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span>${p.age} years, ${p.gender || 'Patient'}</span>
                    <span>•</span>
                    <span class="flex items-center gap-1"><i data-lucide="clock" class="w-3 h-3"></i> ${p.appointmentTime || p.checkInTime || 'Just Now'}</span>
                  </div>
                  <div class="text-sm font-medium text-slate-700 mt-1">
                    ${p.chiefComplaint || 'Pre-consultation review'}
                  </div>
                </div>
              </div>
              
              <div class="flex flex-col md:items-end gap-2 text-right">
                <span class="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                  p.status === 'Ready for Review' || p.status === 'Waiting' ? 'bg-emerald-100 text-emerald-700' :
                  p.status === 'Physical Verification Required' ? 'bg-amber-100 text-amber-800' :
                  p.status === 'Under Consultation' ? 'bg-blue-100 text-blue-700' :
                  'bg-slate-100 text-slate-700'
                }">
                  ${p.status}
                </span>
                <div class="flex items-center gap-2 mt-1">
                  <a href="#doctor/patient/${p.id}" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0F2942] hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-colors">
                    <span>Open Case & Actions</span>
                    <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
                  </a>
                </div>
              </div>
            </div>
          `;}).join('')}
          
          ${patients.length === 0 ? `<div class="p-8 text-center text-slate-500">No patients scheduled for today.</div>` : ''}
        </div>
      </div>

      <!-- Nearest Hospitals & Location Factor Referral Directory -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
              <i data-lucide="navigation" class="w-4 h-4 text-[#0CA854]"></i>
              Emergency & Tertiary Referral Network (Location Factor)
            </h3>
            <p class="text-xs text-slate-500 mt-0.5">Geospatial proximity to MHSSCE Hospital, Byculla for patient transfers & physical visits</p>
          </div>
          <span class="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto">
            📍 Central Node: Byculla Hub (0.0 km)
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          ${(window.MEDIKIOSIK_DATA?.nearestHospitals || []).map(h => `
            <div class="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between space-y-3">
              <div class="space-y-1.5">
                <div class="flex items-start justify-between gap-2">
                  <span class="text-xs font-black text-slate-900 line-clamp-1">${h.name}</span>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${h.badgeColor}">${h.distanceKm} km</span>
                </div>
                <div class="text-[11px] font-semibold text-[#0CA854]">${h.tagline}</div>
                <div class="text-[11px] text-slate-500 leading-tight">${h.address}</div>
                <div class="pt-2 flex flex-wrap gap-1">
                  ${h.specialties.slice(0, 3).map(s => `
                    <span class="text-[9px] px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600 font-medium">${s}</span>
                  `).join('')}
                </div>
              </div>

              <div class="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                <span class="text-slate-600 font-bold">ICU Beds: <strong class="text-emerald-700">${h.icuBedsAvailable}</strong></span>
                <a href="${h.mapQuery}" target="_blank" class="text-blue-600 font-bold hover:underline flex items-center gap-1">
                  Directions <i data-lucide="external-link" class="w-3 h-3"></i>
                </a>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </main>
  `;
}

function AttachDoctorHomeListeners() {}
