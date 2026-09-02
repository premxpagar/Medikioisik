function RenderLogin() {
  return `
    <div class="lp-root">

      <!-- Background accent shape -->
      <div class="lp-bg-shape"></div>

      <!-- Card -->
      <div class="lp-card">

        <!-- Logo + Brand -->
        <div class="lp-header">
          <div class="lp-logo">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lp-logo-icon">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <h1 class="lp-brand">MediKiosik</h1>
          <p class="lp-tagline">AI-Assisted Pre-Consultation System</p>
        </div>

        <!-- Error -->
        <div id="login-error" class="lp-error hidden">
          Invalid email or password. Please try again.
        </div>

        <!-- ── Email / Password Form ── -->
        <form id="login-form" class="lp-form">
          <div class="lp-field">
            <label class="lp-label" for="login-email">Email Address</label>
            <input type="email" id="login-email" required class="lp-input" placeholder="patient@careforge.demo" autocomplete="email">
          </div>

          <div class="lp-field">
            <label class="lp-label" for="login-password">Password</label>
            <input type="password" id="login-password" required class="lp-input" placeholder="Enter your password" autocomplete="current-password">
          </div>

          <button type="submit" class="lp-btn-primary">Sign In</button>

          <div class="lp-divider">
            <span>or sign in with</span>
          </div>

          <div class="lp-alt-row">
            <button type="button" id="btn-show-aadhar" class="lp-btn-alt">
              <svg xmlns="http://www.w3.org/2000/svg" class="lp-btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"/></svg>
              Aadhar OTP
            </button>
            <button type="button" id="btn-show-phone" class="lp-btn-alt">
              <svg xmlns="http://www.w3.org/2000/svg" class="lp-btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
              Mobile OTP
            </button>
          </div>
        </form>

        <!-- ── Aadhar Flow ── -->
        <div id="aadhar-flow" class="lp-form hidden">
          <div class="lp-flow-header">
            <div class="lp-flow-badge" style="background:#f0eeff;color:#4338ca;">
              <svg xmlns="http://www.w3.org/2000/svg" class="lp-btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3"/></svg>
            </div>
            <div>
              <h3 class="lp-flow-title">Aadhar Verification</h3>
              <p class="lp-flow-sub">Enter your 12-digit Aadhar number</p>
            </div>
          </div>

          <div id="aadhar-step-1" class="lp-form">
            <div class="lp-field">
              <label class="lp-label">Aadhar Number</label>
              <input type="text" id="aadhar-number" maxlength="14" placeholder="XXXX-XXXX-XXXX" class="lp-input lp-mono">
            </div>
            <button type="button" id="btn-send-otp" class="lp-btn-primary">Send OTP</button>
            <button type="button" class="btn-back-login lp-btn-ghost">← Back to email login</button>
          </div>

          <div id="aadhar-step-2" class="lp-form hidden">
            <div class="lp-otp-notice">OTP sent to your Aadhar-linked mobile</div>
            <div class="lp-field">
              <label class="lp-label">Enter OTP</label>
              <input type="text" id="aadhar-otp" maxlength="6" placeholder="• • • • • •" class="lp-input lp-mono lp-otp-input">
            </div>
            <button type="button" id="btn-verify-otp" class="lp-btn-primary">Verify &amp; Sign In</button>
          </div>
        </div>

        <!-- ── Phone Flow ── -->
        <div id="phone-flow" class="lp-form hidden">
          <div class="lp-flow-header">
            <div class="lp-flow-badge" style="background:#f0fdf4;color:#166534;">
              <svg xmlns="http://www.w3.org/2000/svg" class="lp-btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
            </div>
            <div>
              <h3 class="lp-flow-title">Mobile Verification</h3>
              <p class="lp-flow-sub">Enter your 10-digit mobile number</p>
            </div>
          </div>

          <div id="phone-step-1" class="lp-form">
            <div class="lp-field">
              <label class="lp-label">Mobile Number</label>
              <div class="lp-phone-row">
                <span class="lp-phone-code">+91</span>
                <input type="text" id="phone-number" maxlength="10" placeholder="9876543210" class="lp-input lp-mono lp-phone-field">
              </div>
            </div>
            <button type="button" id="btn-send-phone-otp" class="lp-btn-primary">Send OTP</button>
            <button type="button" class="btn-back-login lp-btn-ghost">← Back to email login</button>
          </div>

          <div id="phone-step-2" class="lp-form hidden">
            <div class="lp-otp-notice">OTP sent to your mobile via SMS</div>
            <div class="lp-field">
              <label class="lp-label">Enter OTP</label>
              <input type="text" id="phone-otp" maxlength="6" placeholder="• • • • • •" class="lp-input lp-mono lp-otp-input">
            </div>
            <button type="button" id="btn-verify-phone-otp" class="lp-btn-primary">Verify &amp; Sign In</button>
          </div>
        </div>

        <!-- Demo credentials -->
        <div class="lp-demo">
          <p class="lp-demo-title">Demo credentials</p>
          <div class="lp-demo-grid">
            <div class="lp-demo-row">
              <span class="lp-demo-role">Patient</span>
              <code class="lp-demo-code">patient@careforge.demo · patient123</code>
            </div>
            <div class="lp-demo-row">
              <span class="lp-demo-role">Doctor</span>
              <code class="lp-demo-code">doctor@careforge.demo · doctor123</code>
            </div>
            <div class="lp-demo-row">
              <span class="lp-demo-role">Admin</span>
              <code class="lp-demo-code">admin@careforge.demo · admin123</code>
            </div>
          </div>
        </div>

      </div>

      <!-- Footer -->
      <p class="lp-footer">ABDM Compliant &nbsp;·&nbsp; HIPAA Safe &nbsp;·&nbsp; End-to-End Encrypted</p>

      <style>
        /* ── Reset & Root ── */
        .lp-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
          background-color: #F5F0E8;
          position: relative;
          overflow: hidden;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        /* Subtle background shape — purely geometric, no blobs */
        .lp-bg-shape {
          position: fixed;
          top: -120px;
          right: -120px;
          width: 420px;
          height: 420px;
          border-radius: 50%;
          background-color: #E8E0D0;
          pointer-events: none;
          z-index: 0;
        }

        /* ── Card ── */
        .lp-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 420px;
          background: #FFFFFF;
          border: 1px solid #E2DDD6;
          border-radius: 20px;
          padding: 36px 32px 28px;
          box-shadow: 0 4px 24px rgba(30, 27, 75, 0.07), 0 1px 4px rgba(30, 27, 75, 0.04);
        }

        /* ── Header ── */
        .lp-header {
          text-align: center;
          margin-bottom: 28px;
        }

        .lp-logo {
          width: 52px;
          height: 52px;
          background-color: #1E1B4B;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 14px;
        }
        .lp-logo-icon {
          width: 26px;
          height: 26px;
          color: #FFFFFF;
          stroke-width: 2;
        }

        .lp-brand {
          font-size: 22px;
          font-weight: 800;
          color: #1E1B4B;
          letter-spacing: -0.03em;
          margin: 0;
        }
        .lp-tagline {
          font-size: 12px;
          color: #9B9184;
          margin: 4px 0 0;
          font-weight: 500;
        }

        /* ── Error ── */
        .lp-error {
          background: #FEF2F2;
          border: 1px solid #FECACA;
          color: #B91C1C;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 16px;
          text-align: center;
        }

        /* ── Form ── */
        .lp-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .lp-field {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .lp-label {
          font-size: 11.5px;
          font-weight: 700;
          color: #4B4740;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .lp-input {
          width: 100%;
          padding: 11px 13px;
          border: 1.5px solid #DDD8D0;
          border-radius: 10px;
          font-size: 14px;
          color: #1a1817;
          background: #FDFCFB;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          font-family: inherit;
          box-sizing: border-box;
        }
        .lp-input:focus {
          border-color: #1E1B4B;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(30, 27, 75, 0.08);
        }
        .lp-input::placeholder { color: #C0BAB2; }

        .lp-mono { font-family: 'Courier New', Courier, monospace; letter-spacing: 0.08em; }
        .lp-otp-input { text-align: center; font-size: 20px; letter-spacing: 0.3em; }

        /* ── Buttons ── */
        .lp-btn-primary {
          width: 100%;
          padding: 12px;
          background-color: #1E1B4B;
          color: #FFFFFF;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: background-color 0.15s, transform 0.1s;
          font-family: inherit;
          letter-spacing: 0.01em;
        }
        .lp-btn-primary:hover { background-color: #2D2A60; }
        .lp-btn-primary:active { transform: scale(0.99); }

        .lp-alt-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .lp-btn-alt {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 11px 10px;
          border: 1.5px solid #DDD8D0;
          border-radius: 10px;
          background: #FDFCFB;
          color: #3D3A35;
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s;
          font-family: inherit;
        }
        .lp-btn-alt:hover {
          border-color: #1E1B4B;
          background: #F7F5F2;
          color: #1E1B4B;
        }
        .lp-btn-icon {
          width: 15px;
          height: 15px;
          flex-shrink: 0;
        }

        .lp-btn-ghost {
          width: 100%;
          background: none;
          border: none;
          color: #9B9184;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          padding: 4px 0;
          font-family: inherit;
          transition: color 0.15s;
        }
        .lp-btn-ghost:hover { color: #1E1B4B; }

        /* ── Divider ── */
        .lp-divider {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #C0BAB2;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.04em;
        }
        .lp-divider::before, .lp-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background-color: #E8E2DA;
        }

        /* ── Flow sub-sections ── */
        .lp-flow-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-bottom: 16px;
          border-bottom: 1px solid #F0EBE3;
          margin-bottom: 4px;
        }
        .lp-flow-badge {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .lp-flow-title {
          font-size: 15px;
          font-weight: 700;
          color: #1a1817;
          margin: 0;
        }
        .lp-flow-sub {
          font-size: 11.5px;
          color: #9B9184;
          margin: 2px 0 0;
        }

        .lp-otp-notice {
          background: #F0FAF5;
          border: 1px solid #BBF7D0;
          color: #15803D;
          border-radius: 8px;
          padding: 9px 13px;
          font-size: 12px;
          font-weight: 600;
          text-align: center;
        }

        .lp-phone-row {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .lp-phone-code {
          padding: 11px 13px;
          border: 1.5px solid #DDD8D0;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          color: #4B4740;
          background: #F7F5F2;
          white-space: nowrap;
        }
        .lp-phone-field { flex: 1; }

        /* ── Demo box ── */
        .lp-demo {
          margin-top: 20px;
          padding: 14px;
          background: #FAF8F5;
          border: 1px solid #EAE4DA;
          border-radius: 12px;
        }
        .lp-demo-title {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #9B9184;
          margin: 0 0 8px;
        }
        .lp-demo-grid { display: flex; flex-direction: column; gap: 5px; }
        .lp-demo-row {
          display: flex;
          align-items: baseline;
          gap: 8px;
          flex-wrap: wrap;
        }
        .lp-demo-role {
          font-size: 11px;
          font-weight: 700;
          color: #1E1B4B;
          min-width: 44px;
        }
        .lp-demo-code {
          font-family: 'Courier New', Courier, monospace;
          font-size: 10.5px;
          color: #5C574F;
          background: #EEEAE3;
          padding: 1px 6px;
          border-radius: 4px;
        }

        /* ── Footer ── */
        .lp-footer {
          position: relative;
          z-index: 1;
          margin-top: 18px;
          font-size: 10.5px;
          color: #B5AFA6;
          text-align: center;
          font-weight: 500;
        }

        /* hidden utility */
        .hidden { display: none !important; }
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

  // Aadhar Number Formatting
  const aadharInput = document.getElementById('aadhar-number');
  aadharInput?.addEventListener('input', (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 12) val = val.substring(0, 12);
    if (val.length > 8) val = val.substring(0,4) + '-' + val.substring(4,8) + '-' + val.substring(8);
    else if (val.length > 4) val = val.substring(0,4) + '-' + val.substring(4);
    e.target.value = val;
  });

  // Phone Formatting
  const phoneInput = document.getElementById('phone-number');
  phoneInput?.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '').substring(0, 10);
  });

  // Send OTP — Aadhar
  document.getElementById('btn-send-otp')?.addEventListener('click', () => {
    const val = aadharInput.value.replace(/\D/g, '');
    if (val.length !== 12) { alert('Please enter a valid 12-digit Aadhar number.'); return; }
    document.getElementById('aadhar-step-1').classList.add('hidden');
    document.getElementById('aadhar-step-2').classList.remove('hidden');
  });

  // Send OTP — Phone
  document.getElementById('btn-send-phone-otp')?.addEventListener('click', () => {
    const val = phoneInput.value;
    if (val.length !== 10) { alert('Please enter a valid 10-digit mobile number.'); return; }
    document.getElementById('phone-step-1').classList.add('hidden');
    document.getElementById('phone-step-2').classList.remove('hidden');
  });

  // Complete patient login helper
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
