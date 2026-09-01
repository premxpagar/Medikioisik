function GetOrgNav() {
  return [
    { label: 'Dashboard', path: 'organization', icon: 'layout-dashboard' },
    { label: 'Doctors', path: 'organization/doctors', icon: 'stethoscope' },
    { label: 'Patients', path: 'organization/patients', icon: 'users' },
    { label: 'Appointments', path: 'organization/appointments', icon: 'calendar' },
    { label: 'Alerts', path: 'organization/alerts', icon: 'bell' }
  ];
}

function RenderOrgHome() {
  const user = JSON.parse(localStorage.getItem('careforge_user'));
  const metrics = window.MOCK_DATA.organization.metrics;
  const appointments = window.MOCK_DATA.appointments;

  return `
    ${RenderNavbar('Organization Portal', user.organization, GetOrgNav())}
    
    <main class="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      <!-- Top Summary Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <span class="text-slate-500 text-xs font-bold uppercase tracking-wider">Today's Appointments</span>
          <span class="text-3xl font-black text-slate-900 mt-2">${metrics.todayAppointments}</span>
        </div>
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <span class="text-slate-500 text-xs font-bold uppercase tracking-wider">Active Doctors</span>
          <span class="text-3xl font-black text-slate-900 mt-2">${metrics.activeDoctors}</span>
        </div>
        <div class="bg-emerald-50 p-6 rounded-2xl border border-emerald-200 shadow-sm flex flex-col">
          <span class="text-emerald-700 text-xs font-bold uppercase tracking-wider">Ready for Consultation</span>
          <span class="text-3xl font-black text-emerald-700 mt-2">${metrics.readyForConsultation}</span>
        </div>
        <div class="bg-red-50 p-6 rounded-2xl border border-red-200 shadow-sm flex flex-col">
          <span class="text-red-700 text-xs font-bold uppercase tracking-wider">Priority Alerts</span>
          <span class="text-3xl font-black text-red-700 mt-2">${metrics.priorityAlerts}</span>
        </div>
      </div>

      <!-- Main Section -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 class="text-lg font-bold text-slate-900">Today's Overview</h2>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-slate-600">
            <thead class="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th class="px-6 py-4">Time</th>
                <th class="px-6 py-4">Patient</th>
                <th class="px-6 py-4">Doctor</th>
                <th class="px-6 py-4">Department</th>
                <th class="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${appointments.map(a => `
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="px-6 py-4 font-medium text-slate-900">${a.time}</td>
                  <td class="px-6 py-4 font-bold text-slate-900">${a.patient}</td>
                  <td class="px-6 py-4">${a.doctor}</td>
                  <td class="px-6 py-4">${a.department}</td>
                  <td class="px-6 py-4 text-right">
                    <span class="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      a.status === 'Ready' ? 'bg-emerald-100 text-emerald-700' :
                      a.status === 'Waiting' ? 'bg-amber-100 text-amber-700' :
                      a.status === 'Under Consultation' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-700'
                    }">
                      ${a.status}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  `;
}

function AttachOrgHomeListeners() {}
