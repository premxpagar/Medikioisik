function RenderNavbar(title, subtitle, navItems = []) {
  const user = JSON.parse(localStorage.getItem('careforge_user')) || {};
  
  return `
    <header class="bg-white sticky top-0 z-40 border-b border-slate-200 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <!-- Brand & Context -->
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0F2942] to-slate-800 text-white flex items-center justify-center shadow-md">
            <i data-lucide="${user.role === 'DOCTOR' ? 'stethoscope' : 'building'}" class="w-5 h-5 text-emerald-400"></i>
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="text-xl font-black tracking-tight text-[#0F2942]">Care<span class="text-[#0CA854]">Forge</span></span>
            </div>
            <p class="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">${title}</p>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <nav class="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-2 md:pb-0">
          ${navItems.map(item => {
            const isActive = window.location.hash.slice(1) === item.path;
            return `
              <a href="#${item.path}" class="flex items-center gap-2 px-3.5 py-2 text-xs md:text-sm font-bold rounded-xl transition-all ${
                isActive 
                  ? 'bg-[#0F2942] text-white shadow-md' 
                  : 'text-slate-600 hover:text-[#0F2942] hover:bg-slate-100'
              }">
                <i data-lucide="${item.icon}" class="w-4 h-4"></i>
                <span>${item.label}</span>
              </a>
            `;
          }).join('')}
        </nav>
        
        <!-- User Profile & Logout -->
        <div class="flex items-center gap-4 border-l border-slate-200 pl-4">
          <div class="hidden sm:block text-right">
            <div class="text-sm font-bold text-slate-900">${user.name}</div>
            <div class="text-[10px] text-slate-500 font-medium">${subtitle}</div>
          </div>
          <button onclick="LogoutUser()" class="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 text-xs font-bold transition-colors" title="Logout">
            <i data-lucide="log-out" class="w-4 h-4"></i>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  `;
}
