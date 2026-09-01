function RenderOrgAlerts() {
  const user = JSON.parse(localStorage.getItem('careforge_user'));
  const alerts = window.MOCK_DATA.alerts;

  return `
    ${RenderNavbar('Organization Portal', user.organization, GetOrgNav())}
    
    <main class="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 class="text-2xl font-bold text-slate-900">${alerts.length} Priority Alerts</h1>
      </div>

      <div class="space-y-4">
        ${alerts.map(a => `
          <div class="bg-white rounded-2xl border-l-4 border-red-500 border-y border-r border-y-slate-200 border-r-slate-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="flex items-start gap-4">
              <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 mt-1">
                <i data-lucide="shield-alert" class="w-5 h-5"></i>
              </div>
              <div>
                <h3 class="text-base font-bold text-slate-900">${a.patient}</h3>
                <p class="text-sm font-medium text-red-600 mt-1">${a.message}</p>
                <div class="flex items-center gap-3 text-xs text-slate-500 mt-2">
                  <span class="flex items-center gap-1"><i data-lucide="clock" class="w-3.5 h-3.5"></i> ${a.time}</span>
                  <span>•</span>
                  <span class="flex items-center gap-1"><i data-lucide="stethoscope" class="w-3.5 h-3.5"></i> ${a.doctor}</span>
                </div>
              </div>
            </div>
            
            <div class="flex gap-2 self-end md:self-auto">
              <button class="px-4 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                Resolve
              </button>
            </div>
          </div>
        `).join('')}
        
        ${alerts.length === 0 ? `
          <div class="p-8 bg-white rounded-2xl border border-slate-200 text-center text-slate-500 shadow-sm">
            No operational alerts at this time.
          </div>
        ` : ''}
      </div>
    </main>
  `;
}

function AttachOrgAlertsListeners() {}
