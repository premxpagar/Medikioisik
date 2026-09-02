function RenderLogin() {
  return `
    <div class="login-root min-h-screen flex items-center justify-center p-4 relative overflow-hidden">

      <!-- Gradient Background -->
      <div class="login-bg-gradient"></div>

      <!-- Decorative blobs -->
      <div class="login-blob login-blob-1"></div>
      <div class="login-blob login-blob-2"></div>
      <div class="login-blob login-blob-3"></div>

      <!-- Floating particles -->
      <div class="login-particle" style="top:12%;left:8%;animation-delay:0s;width:6px;height:6px;"></div>
      <div class="login-particle" style="top:30%;left:90%;animation-delay:1.2s;width:4px;height:4px;"></div>
      <div class="login-particle" style="top:68%;left:5%;animation-delay:2.1s;width:8px;height:8px;"></div>
      <div class="login-particle" style="top:80%;left:80%;animation-delay:0.7s;width:5px;height:5px;"></div>
      <div class="login-particle" style="top:50%;left:50%;animation-delay:1.8s;width:3px;height:3px;"></div>

      <!-- Card -->
      <div class="login-card relative z-10 w-full max-w-md">

        <!-- Glass logo header -->
        <div class="login-card-header text-center mb-7">
          <div class="login-logo-ring mx-auto mb-4">
            <div class="login-logo-inner">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-9 h-9 text-white drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </div>
          </div>
          <h1 class="login-title">MediKiosik</h1>
          <p class="login-subtitle">AI-Assisted Healthcare Portal</p>

          <!-- Pill badges -->
          <div class="flex items-center justify-center gap-2 mt-3">
            <span class="login-badge">🏥 OPD</span>
            <span class="login-badge">💊 Pharmacy</span>
            <span class="login-badge">🩺 Telemedicine</span>
          </div>
        </div>

        <!-- Error message -->
        <div id="login-error" class="hidden mb-4 p-3 rounded-2xl bg-red-500/10 border border-red-400/30 text-red-700 text-sm text-center font-semibold backdrop-blur-sm">
          ⚠️ Invalid credentials. Please try again.
        </div>

        <!-- Standard Login Form -->
        <form id="login-form" class="space-y-4">
          <div class="login-field-group">
            <label class="login-label">Email Address</label>
            <div class="login-input-wrap">
              <svg class="login-input-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/></svg>
              <input type="email" id="login-email" required class="login-input" placeholder="demo@careforge.demo">
            </div>
          </div>

          <div class="login-field-group">
            <label class="login-label">Password</label>
            <div class="login-input-wrap">
              <svg class="login-input-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
              <input type="password" id="login-password" required class="login-input" placeholder="••••••••">
            </div>
          </div>

          <button type="submit" class="login-btn-primary">
            <span>Sign In Securely</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
          </button>

          <!-- Divider -->
          <div class="login-divider">
            <div class="login-divider-line"></div>
            <span class="login-divider-text">or continue with</span>
            <div class="login-divider-line"></div>
          </div>

          <!-- Alt login buttons -->
          <button type="button" id="btn-show-aadhar" class="login-btn-alt">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-indigo-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"/></svg>
            <span>Login with Aadhar (OTP)</span>
          </button>

          <button type="button" id="btn-show-phone" class="login-btn-alt">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
            <span>Login with Mobile Number</span>
          </button>
        </form>

        <!-- Aadhar Login Flow -->
        <div id="aadhar-flow" class="hidden space-y-4">
          <div class="text-center mb-2">
            <div class="login-flow-icon-ring mx-auto mb-3 bg-indigo-100">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"/></svg>
            </div>
            <h3 class="font-black text-slate-900 text-base">Aadhar Verification</h3>
            <p class="text-xs text-slate-500 mt-0.5">Enter your 12-digit Aadhar number</p>
          </div>

          <div id="aadhar-step-1" class="space-y-3">
            <input type="text" id="aadhar-number" maxlength="14" placeholder="XXXX-XXXX-XXXX"
              class="login-input text-center tracking-widest font-bold">
            <button type="button" id="btn-send-otp" class="login-btn-primary" style="background: linear-gradient(135deg, #6366f1, #4f46e5);">
              <span>Send OTP</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
            </button>
            <button type="button" class="btn-back-login login-btn-ghost">← Back to Email Login</button>
          </div>

          <div id="aadhar-step-2" class="hidden space-y-3">
            <div class="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold text-center">
              ✅ OTP sent to Aadhar-linked mobile number!
            </div>
            <input type="text" id="aadhar-otp" maxlength="6" placeholder="Enter 6-digit OTP"
              class="login-input text-center tracking-[0.5em] font-black text-lg">
            <button type="button" id="btn-verify-otp" class="login-btn-primary">
              <span>Verify & Login</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </button>
          </div>
        </div>

        <!-- Phone Login Flow -->
        <div id="phone-flow" class="hidden space-y-4">
          <div class="text-center mb-2">
            <div class="login-flow-icon-ring mx-auto mb-3 bg-emerald-100">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
            </div>
            <h3 class="font-black text-slate-900 text-base">Mobile Verification</h3>
            <p class="text-xs text-slate-500 mt-0.5">Enter your 10-digit mobile number</p>
          </div>

          <div id="phone-step-1" class="space-y-3">
            <div class="flex items-center gap-2">
              <div class="login-phone-prefix">🇮🇳 +91</div>
              <input type="text" id="phone-number" maxlength="10" placeholder="9876543210"
                class="login-input flex-1 tracking-widest font-bold">
            </div>
            <button type="button" id="btn-send-phone-otp" class="login-btn-primary">
              <span>Send OTP</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
            </button>
            <button type="button" class="btn-back-login login-btn-ghost">← Back to Email Login</button>
          </div>

          <div id="phone-step-2" class="hidden space-y-3">
            <div class="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold text-center">
              ✅ OTP sent to your mobile via SMS!
            </div>
            <input type="text" id="phone-otp" maxlength="6" placeholder="Enter 6-digit OTP"
              class="login-input text-center tracking-[0.5em] font-black text-lg">
            <button type="button" id="btn-verify-phone-otp" class="login-btn-primary">
              <span>Verify & Login</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </button>
          </div>
        </div>

        <!-- Demo credentials -->
        <div class="login-demo-box mt-6">
          <div class="flex items-center gap-2 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span class="text-xs font-black text-emerald-900 uppercase tracking-wide">Demo Credentials</span>
          </div>
          <div class="grid grid-cols-1 gap-1">
            <div class="login-cred-row">
              <span class="login-cred-role">👤 Patient</span>
              <span class="login-cred-val">patient@careforge.demo / patient123</span>
            </div>
            <div class="login-cred-row">
              <span class="login-cred-role">🩺 Doctor</span>
              <span class="login-cred-val">doctor@careforge.demo / doctor123</span>
            </div>
            <div class="login-cred-row">
              <span class="login-cred-role">🏢 Admin</span>
              <span class="login-cred-val">admin@careforge.demo / admin123</span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <p class="text-center text-[11px] text-white/50 mt-5">
          Secured by ABDM · HIPAA Compliant · End-to-End Encrypted
        </p>
      </div>

      <style>
        /* ===== Login Page Styles ===== */
        .login-root {
          font-family: 'Inter', system-ui, sans-serif;
        }

        /* Gradient background */
        .login-bg-gradient {
          position: fixed;
          inset: 0;
          background: linear-gradient(
            135deg,
            #064e2e 0%,
            #0a7a46 18%,
            #0CA854 36%,
            #34d480 52%,
            #a7f3d0 70%,
            #ecfdf5 84%,
            #ffffff 100%
          );
          z-index: 0;
        }

        /* Decorative blobs */
        .login-blob {
          position: fixed;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: 1;
          animation: loginBlobFloat 8s ease-in-out infinite;
        }
        .login-blob-1 {
          width: 420px; height: 420px;
          background: radial-gradient(circle, rgba(12,168,84,0.35), transparent 70%);
          top: -80px; left: -100px;
          animation-duration: 9s;
        }
        .login-blob-2 {
          width: 320px; height: 320px;
          background: radial-gradient(circle, rgba(52,212,128,0.25), transparent 70%);
          bottom: -60px; right: -80px;
          animation-duration: 7s; animation-delay: 2s;
        }
        .login-blob-3 {
          width: 200px; height: 200px;
          background: radial-gradient(circle, rgba(255,255,255,0.18), transparent 70%);
          top: 40%; left: 60%;
          animation-duration: 11s; animation-delay: 1s;
        }
        @keyframes loginBlobFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(15px, -20px) scale(1.04); }
          66% { transform: translate(-10px, 12px) scale(0.97); }
        }

        /* Floating particles */
        .login-particle {
          position: fixed;
          border-radius: 50%;
          background: rgba(255,255,255,0.6);
          z-index: 2;
          animation: loginParticleFloat 6s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes loginParticleFloat {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.6; }
          50% { transform: translateY(-18px) scale(1.2); opacity: 1; }
        }

        /* Card */
        .login-card {
          background: rgba(255,255,255,0.88);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-radius: 28px;
          border: 1.5px solid rgba(255,255,255,0.7);
          padding: 2rem 2rem 1.5rem;
          box-shadow:
            0 32px 80px rgba(6,78,46,0.18),
            0 8px 24px rgba(12,168,84,0.10),
            inset 0 1px 0 rgba(255,255,255,0.9);
          animation: loginCardIn 0.5s cubic-bezier(0.175,0.885,0.32,1.275) forwards;
        }
        @keyframes loginCardIn {
          0% { transform: translateY(28px) scale(0.96); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }

        /* Logo ring */
        .login-logo-ring {
          width: 72px; height: 72px;
          border-radius: 22px;
          background: linear-gradient(135deg, #064e2e 0%, #0CA854 60%, #34d480 100%);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 28px rgba(12,168,84,0.45), 0 2px 6px rgba(6,78,46,0.2);
          position: relative;
        }
        .login-logo-ring::before {
          content: '';
          position: absolute; inset: -3px;
          border-radius: 25px;
          background: linear-gradient(135deg, rgba(12,168,84,0.4), rgba(255,255,255,0.3));
          z-index: -1;
        }
        .login-logo-inner {
          display: flex; align-items: center; justify-content: center;
        }

        /* Title */
        .login-title {
          font-size: 1.6rem;
          font-weight: 900;
          background: linear-gradient(135deg, #064e2e, #0CA854);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.02em;
          margin-top: 0.25rem;
        }
        .login-subtitle {
          font-size: 0.78rem;
          color: #64748b;
          font-weight: 500;
          margin-top: 2px;
        }

        /* Pill badges */
        .login-badge {
          font-size: 10px;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 99px;
          background: linear-gradient(135deg, rgba(12,168,84,0.12), rgba(52,212,128,0.08));
          border: 1px solid rgba(12,168,84,0.25);
          color: #065f46;
        }

        /* Field group */
        .login-field-group { display: flex; flex-direction: column; gap: 5px; }
        .login-label {
          font-size: 11px;
          font-weight: 700;
          color: #374151;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .login-input-wrap { position: relative; }
        .login-input-icon {
          position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
          width: 17px; height: 17px; color: #9ca3af; pointer-events: none;
        }
        .login-input {
          width: 100%;
          padding: 12px 14px 12px 40px;
          border-radius: 14px;
          border: 1.5px solid rgba(12,168,84,0.2);
          background: rgba(255,255,255,0.85);
          color: #0f172a;
          font-size: 14px;
          outline: none;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(12,168,84,0.06);
          font-family: inherit;
        }
        .login-input:focus {
          border-color: #0CA854;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(12,168,84,0.12), 0 2px 8px rgba(12,168,84,0.08);
        }
        .login-input::placeholder { color: #9ca3af; }

        /* Primary button */
        .login-btn-primary {
          width: 100%;
          padding: 13px 20px;
          border-radius: 14px;
          background: linear-gradient(135deg, #064e2e 0%, #0CA854 55%, #34d480 100%);
          color: #fff;
          font-weight: 800;
          font-size: 14px;
          border: none;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 6px 20px rgba(12,168,84,0.38), 0 2px 6px rgba(6,78,46,0.2);
          transition: all 0.2s;
          letter-spacing: 0.01em;
          font-family: inherit;
          position: relative; overflow: hidden;
        }
        .login-btn-primary::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent 60%);
          border-radius: inherit;
        }
        .login-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(12,168,84,0.45), 0 4px 10px rgba(6,78,46,0.2);
        }
        .login-btn-primary:active { transform: translateY(0); }

        /* Alt button */
        .login-btn-alt {
          width: 100%;
          padding: 11px 16px;
          border-radius: 14px;
          background: rgba(255,255,255,0.75);
          border: 1.5px solid rgba(12,168,84,0.18);
          color: #1e293b;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 9px;
          transition: all 0.2s;
          backdrop-filter: blur(8px);
          font-family: inherit;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .login-btn-alt:hover {
          background: rgba(255,255,255,0.95);
          border-color: rgba(12,168,84,0.4);
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(12,168,84,0.12);
        }

        /* Ghost button */
        .login-btn-ghost {
          width: 100%;
          padding: 9px;
          background: transparent;
          border: none;
          color: #64748b;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: color 0.2s;
          font-family: inherit;
        }
        .login-btn-ghost:hover { color: #0CA854; }

        /* Divider */
        .login-divider {
          display: flex; align-items: center; gap: 10px;
          margin: 4px 0;
        }
        .login-divider-line {
          flex: 1; height: 1px;
          background: linear-gradient(to right, transparent, rgba(12,168,84,0.2), transparent);
        }
        .login-divider-text { font-size: 11px; color: #94a3b8; font-weight: 600; white-space: nowrap; }

        /* Flow icon ring */
        .login-flow-icon-ring {
          width: 52px; height: 52px;
          border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
        }

        /* Phone prefix */
        .login-phone-prefix {
          padding: 12px 14px;
          border-radius: 14px;
          border: 1.5px solid rgba(12,168,84,0.2);
          background: rgba(12,168,84,0.06);
          font-size: 13px;
          font-weight: 700;
          color: #064e2e;
          white-space: nowrap;
        }

        /* Demo box */
        .login-demo-box {
          background: linear-gradient(135deg, rgba(6,78,46,0.07), rgba(12,168,84,0.05));
          border: 1px solid rgba(12,168,84,0.2);
          border-radius: 16px;
          padding: 12px 14px;
        }
        .login-cred-row {
          display: flex; align-items: center; gap: 8px;
          padding: 4px 0;
        }
        .login-cred-role {
          font-size: 11px; font-weight: 700; color: #065f46;
          min-width: 62px;
        }
        .login-cred-val {
          font-size: 10.5px; color: #374151; font-family: 'Courier New', monospace;
          background: rgba(255,255,255,0.7);
          padding: 2px 7px; border-radius: 6px;
          border: 1px solid rgba(12,168,84,0.12);
        }
      </style>
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

  // Send OTP (Aadhar)
  document.getElementById('btn-send-otp')?.addEventListener('click', () => {
    const val = aadharInput.value.replace(/\D/g, '');
    if (val.length !== 12) {
      alert('Please enter a valid 12-digit Aadhar number.');
      return;
    }
    document.getElementById('aadhar-step-1').classList.add('hidden');
    document.getElementById('aadhar-step-2').classList.remove('hidden');
  });

  // Send OTP (Phone)
  document.getElementById('btn-send-phone-otp')?.addEventListener('click', () => {
    const val = phoneInput.value;
    if (val.length !== 10) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }
    document.getElementById('phone-step-1').classList.add('hidden');
    document.getElementById('phone-step-2').classList.remove('hidden');
  });

  // Verify OTP — complete patient login
  const completePatientLogin = () => {
    const user = window.MOCK_DATA.auth.users.find(u => u.role === 'PATIENT');
    localStorage.setItem('careforge_user', JSON.stringify(user));
    window.location.hash = '#';
  };

  document.getElementById('btn-verify-otp')?.addEventListener('click', () => {
    const otp = document.getElementById('aadhar-otp').value;
    if (otp.length < 4) { alert('Please enter the OTP.'); return; }
    completePatientLogin();
  });

  document.getElementById('btn-verify-phone-otp')?.addEventListener('click', () => {
    const otp = document.getElementById('phone-otp').value;
    if (otp.length < 4) { alert('Please enter the OTP.'); return; }
    completePatientLogin();
  });
}

function LogoutUser() {
  localStorage.removeItem('careforge_user');
  window.location.hash = '#login';
}
