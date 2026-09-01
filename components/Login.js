function RenderLogin() {
  return `
    <div class="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div class="max-w-md w-full bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0F2942] to-slate-800 text-white shadow-md mb-4">
            <i data-lucide="shield-check" class="w-8 h-8 text-emerald-400"></i>
          </div>
          <h2 class="text-2xl font-bold text-slate-900">CareForge</h2>
          <p class="text-sm text-slate-500 mt-1">Role-Based Demo Portal</p>
        </div>

        <div id="login-error" class="hidden mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center font-medium">
          Invalid email or password
        </div>

        <!-- Standard Login Form -->
        <form id="login-form" class="space-y-5">
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-700 uppercase">Email Address</label>
            <input type="email" id="login-email" required class="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-[#0CA854] outline-none" placeholder="demo@careforge.demo">
          </div>
          
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-700 uppercase">Password</label>
            <input type="password" id="login-password" required class="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-[#0CA854] outline-none" placeholder="••••••••">
          </div>

          <button type="submit" class="w-full py-3.5 rounded-xl bg-[#0CA854] hover:bg-[#087F3F] text-white font-bold text-base shadow-lg shadow-emerald-700/30 transition-all">
            Sign In
          </button>

          <div class="relative flex items-center py-2">
            <div class="flex-grow border-t border-slate-200"></div>
            <span class="flex-shrink-0 mx-4 text-slate-400 text-xs">OR</span>
            <div class="flex-grow border-t border-slate-200"></div>
          </div>

          <button type="button" id="btn-show-aadhar" class="w-full py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 mb-3">
            <i data-lucide="fingerprint" class="w-5 h-5 text-indigo-500"></i>
            Register / Login with Aadhar
          </button>
          
          <button type="button" id="btn-show-phone" class="w-full py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2">
            <i data-lucide="smartphone" class="w-5 h-5 text-emerald-500"></i>
            Login with Phone Number
          </button>
        </form>

        <!-- Aadhar Login Flow -->
        <div id="aadhar-flow" class="hidden space-y-5">
          <div class="text-center mb-4">
             <h3 class="font-bold text-slate-900">Aadhar Verification</h3>
             <p class="text-xs text-slate-500">Enter your 12-digit Aadhar number</p>
          </div>
          
          <div id="aadhar-step-1" class="space-y-4">
            <input type="text" id="aadhar-number" maxlength="14" placeholder="XXXX-XXXX-XXXX" class="w-full px-4 py-3 text-center tracking-widest rounded-xl border border-slate-300 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 outline-none">
            <button type="button" id="btn-send-otp" class="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all">
              Send OTP
            </button>
            <button type="button" class="btn-back-login w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-700">Back to Email Login</button>
          </div>

          <div id="aadhar-step-2" class="hidden space-y-4">
            <p class="text-[11px] text-center text-emerald-600 bg-emerald-50 py-2 rounded-lg border border-emerald-100 font-bold">OTP sent to Aadhar linked mobile number!</p>
            <input type="text" id="aadhar-otp" maxlength="6" placeholder="Enter 6-digit OTP (Any number for demo)" class="w-full px-4 py-3 text-center tracking-widest rounded-xl border border-slate-300 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 outline-none">
            <button type="button" id="btn-verify-otp" class="w-full py-3.5 rounded-xl bg-[#0CA854] hover:bg-[#087F3F] text-white font-bold text-sm shadow-md transition-all">
              Verify & Login
            </button>
          </div>
        </div>

        <!-- Phone Login Flow -->
        <div id="phone-flow" class="hidden space-y-5">
          <div class="text-center mb-4">
             <h3 class="font-bold text-slate-900">Phone Verification</h3>
             <p class="text-xs text-slate-500">Enter your 10-digit mobile number</p>
          </div>
          
          <div id="phone-step-1" class="space-y-4">
            <div class="flex items-center gap-2">
              <div class="px-4 py-3 bg-slate-100 border border-slate-300 rounded-xl font-bold text-slate-600">+91</div>
              <input type="text" id="phone-number" maxlength="10" placeholder="9876543210" class="flex-1 px-4 py-3 tracking-widest rounded-xl border border-slate-300 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 outline-none">
            </div>
            <button type="button" id="btn-send-phone-otp" class="w-full py-3.5 rounded-xl bg-[#0CA854] hover:bg-[#087F3F] text-white font-bold text-sm shadow-md transition-all">
              Send OTP
            </button>
            <button type="button" class="btn-back-login w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-700">Back to Email Login</button>
          </div>

          <div id="phone-step-2" class="hidden space-y-4">
            <p class="text-[11px] text-center text-emerald-600 bg-emerald-50 py-2 rounded-lg border border-emerald-100 font-bold">OTP sent to your mobile via SMS!</p>
            <input type="text" id="phone-otp" maxlength="6" placeholder="Enter 6-digit OTP (Any number for demo)" class="w-full px-4 py-3 text-center tracking-widest rounded-xl border border-slate-300 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 outline-none">
            <button type="button" id="btn-verify-phone-otp" class="w-full py-3.5 rounded-xl bg-[#0CA854] hover:bg-[#087F3F] text-white font-bold text-sm shadow-md transition-all">
              Verify & Login
            </button>
          </div>
        </div>

        <div class="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
          <p class="font-bold mb-2">Demo Credentials:</p>
          <ul class="space-y-1 opacity-80">
            <li>Patient: patient@careforge.demo / patient123</li>
            <li>Doctor: doctor@careforge.demo / doctor123</li>
            <li>Org: admin@careforge.demo / admin123</li>
          </ul>
        </div>
      </div>
    </div>
  `;
}

function AttachLoginListeners() {
  const loginForm = document.getElementById('login-form');
  const aadharFlow = document.getElementById('aadhar-flow');
  const phoneFlow = document.getElementById('phone-flow');
  
  // Standard Email Login
  loginForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    const user = window.MOCK_DATA.auth.users.find(u => u.email === email && u.password === password);
    
    if (user) {
      localStorage.setItem('careforge_user', JSON.stringify(user));
      window.location.hash = '#';
    } else {
      document.getElementById('login-error').classList.remove('hidden');
    }
  });

  // Flow Toggles
  document.getElementById('btn-show-aadhar')?.addEventListener('click', () => {
    loginForm.classList.add('hidden');
    aadharFlow.classList.remove('hidden');
  });

  document.getElementById('btn-show-phone')?.addEventListener('click', () => {
    loginForm.classList.add('hidden');
    phoneFlow.classList.remove('hidden');
  });

  document.querySelectorAll('.btn-back-login').forEach(btn => {
    btn.addEventListener('click', () => {
      aadharFlow.classList.add('hidden');
      phoneFlow.classList.add('hidden');
      loginForm.classList.remove('hidden');
    });
  });

  // Aadhar Number Input Formatting
  const aadharInput = document.getElementById('aadhar-number');
  aadharInput?.addEventListener('input', (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 12) val = val.substring(0, 12);
    let formatted = val;
    if (val.length > 8) formatted = val.substring(0,4) + '-' + val.substring(4,8) + '-' + val.substring(8);
    else if (val.length > 4) formatted = val.substring(0,4) + '-' + val.substring(4);
    e.target.value = formatted;
  });

  // Phone Number Input Formatting
  const phoneInput = document.getElementById('phone-number');
  phoneInput?.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '').substring(0, 10);
  });

  // Send OTP
  document.getElementById('btn-send-otp')?.addEventListener('click', () => {
    const val = aadharInput.value.replace(/\D/g, '');
    if (val.length !== 12) {
      alert("Please enter a valid 12-digit Aadhar number.");
      return;
    }
    document.getElementById('aadhar-step-1').classList.add('hidden');
    document.getElementById('aadhar-step-2').classList.remove('hidden');
  });

  document.getElementById('btn-send-phone-otp')?.addEventListener('click', () => {
    const val = phoneInput.value;
    if (val.length !== 10) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }
    document.getElementById('phone-step-1').classList.add('hidden');
    document.getElementById('phone-step-2').classList.remove('hidden');
  });

  // Verify OTP
  const completePatientLogin = () => {
    const user = window.MOCK_DATA.auth.users.find(u => u.role === 'PATIENT');
    localStorage.setItem('careforge_user', JSON.stringify(user));
    window.location.hash = '#';
  };

  document.getElementById('btn-verify-otp')?.addEventListener('click', () => {
    const otp = document.getElementById('aadhar-otp').value;
    if (otp.length < 4) { alert("Please enter the OTP."); return; }
    completePatientLogin();
  });

  document.getElementById('btn-verify-phone-otp')?.addEventListener('click', () => {
    const otp = document.getElementById('phone-otp').value;
    if (otp.length < 4) { alert("Please enter the OTP."); return; }
    completePatientLogin();
  });
}

function LogoutUser() {
  localStorage.removeItem('careforge_user');
  window.location.hash = '#login';
}
