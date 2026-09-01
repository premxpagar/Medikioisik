function RenderOrgAppointments() {
  const user = JSON.parse(localStorage.getItem('careforge_user'));
  const appointments = window.MOCK_DATA.appointments;

  return `
    ${RenderNavbar('Organization Portal', user.organization, GetOrgNav())}
    
    <main class="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 class="text-2xl font-bold text-slate-900">Today's Appointments</h1>
        <div class="flex items-center gap-2">
          <select id="appt-filter" class="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-[#0CA854] outline-none">
            <option value="All">All Appointments</option>
            <option value="Waiting">Waiting</option>
            <option value="Ready">Ready</option>
            <option value="Under Consultation">Under Consultation</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
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
            <tbody id="appt-table-body" class="divide-y divide-slate-100">
              ${appointments.map(a => generateApptRow(a)).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  `;
}

function generateApptRow(a) {
  return `
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
          a.status === 'Completed' ? 'bg-slate-100 text-slate-700' :
          'bg-slate-100 text-slate-700'
        }">
          ${a.status}
        </span>
      </td>
    </tr>
  `;
}

function AttachOrgAppointmentsListeners() {
  document.getElementById('appt-filter')?.addEventListener('change', (e) => {
    const filter = e.target.value;
    const body = document.getElementById('appt-table-body');
    const filtered = filter === 'All' 
      ? window.MOCK_DATA.appointments 
      : window.MOCK_DATA.appointments.filter(a => a.status === filter);
      
    body.innerHTML = filtered.map(a => generateApptRow(a)).join('');
  });
}
