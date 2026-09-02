/**
 * MediKiosik — Mock Razorpay Checkout Gateway
 * Provides an authentic Razorpay Web Standard Checkout Experience
 */

(function() {
  // Global Razorpay Mock Object
  window.RazorpayCheckout = {
    isOpen: false,
    currentOptions: null,

    open: function(options) {
      this.currentOptions = Object.assign({
        key: 'rzp_test_medikiosik_live_2026',
        amount: 50000, // Amount in paise (e.g. 50000 = ₹500.00)
        currency: 'INR',
        name: 'MediKiosik Healthcare',
        description: 'Hospital OPD & Pharmacy Consultation',
        image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=120&auto=format&fit=crop&q=80',
        order_id: `order_MK${Date.now().toString().slice(-6)}`,
        prefill: {
          name: 'Aditya Verma',
          email: 'aditya.verma@example.com',
          contact: '+919820144556'
        },
        theme: {
          color: '#072F5F'
        },
        handler: function(response) {
          console.log('Payment Successful:', response);
        },
        modal: {
          ondismiss: function() {
            console.log('Checkout dismissed');
          }
        }
      }, options);

      this.isOpen = true;
      this.activeTab = 'upi'; // 'upi' | 'card' | 'netbanking' | 'wallet'
      this.render();
    },

    close: function() {
      const modal = document.getElementById('rzp-mock-checkout-overlay');
      if (modal) {
        modal.classList.add('opacity-0', 'pointer-events-none');
        setTimeout(() => {
          modal.remove();
          this.isOpen = false;
        }, 200);
      }
      if (this.currentOptions && this.currentOptions.modal && typeof this.currentOptions.modal.ondismiss === 'function') {
        this.currentOptions.modal.ondismiss();
      }
    },

    render: function() {
      const existing = document.getElementById('rzp-mock-checkout-overlay');
      if (existing) existing.remove();

      const opt = this.currentOptions;
      const formattedAmount = (typeof opt.amountFormatted === 'number' || typeof opt.amountFormatted === 'string') 
        ? Number(opt.amountFormatted).toFixed(2) 
        : (opt.amount >= 100 ? (opt.amount / 100).toFixed(2) : Number(opt.amount).toFixed(2));

      const overlay = document.createElement('div');
      overlay.id = 'rzp-mock-checkout-overlay';
      overlay.className = 'fixed inset-0 z-[99999] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200';
      
      overlay.innerHTML = `
        <div id="rzp-modal-card" class="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
          
          <!-- Razorpay Header Bar -->
          <div class="bg-gradient-to-r from-[#0c2340] via-[#072F5F] to-[#0c2340] text-white p-4 sm:p-5 flex items-center justify-between border-b border-blue-900/50 relative">
            <div class="flex items-center gap-3.5">
              <div class="w-11 h-11 rounded-xl bg-white/10 p-1 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner flex-shrink-0">
                <i data-lucide="shield-check" class="w-6 h-6 text-emerald-400"></i>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-bold text-sm sm:text-base text-white tracking-tight">${opt.name}</span>
                  <span class="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-blue-500/30 text-blue-200 border border-blue-400/30">Test Mode</span>
                </div>
                <p class="text-xs text-blue-200/80">${opt.description}</p>
              </div>
            </div>

            <!-- Total Amount Display -->
            <div class="text-right">
              <div class="text-[10px] uppercase tracking-wider text-blue-300 font-semibold">Total Payable</div>
              <div class="text-xl sm:text-2xl font-black text-white tracking-tight">₹${formattedAmount}</div>
            </div>

            <!-- Close Button -->
            <button id="rzp-btn-close" class="absolute -top-1 right-2 p-2 text-blue-300 hover:text-white transition-colors" title="Cancel Payment">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>

          <!-- Razorpay Security Sub-banner -->
          <div class="bg-[#f2f7ff] px-4 py-2 border-b border-blue-100 flex items-center justify-between text-[11px] text-blue-900">
            <div class="flex items-center gap-1.5 font-semibold">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Trusted 256-bit SSL Encrypted Payment</span>
            </div>
            <div class="flex items-center gap-1.5 text-blue-700 font-bold">
              <span>Razorpay</span>
              <span class="text-[9px] bg-blue-100 text-blue-800 px-1 rounded">VERIFIED</span>
            </div>
          </div>

          <!-- Body: Left Tabs + Right Content -->
          <div class="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-y-auto min-h-[340px]">
            
            <!-- Payment Methods Menu (4 Cols) -->
            <div class="md:col-span-4 bg-slate-50 border-r border-slate-200 p-2 space-y-1">
              <button data-tab="upi" class="rzp-tab-btn w-full text-left p-3 rounded-xl flex items-center justify-between transition-all ${this.activeTab === 'upi' ? 'bg-white shadow-xs text-blue-900 font-bold border-l-4 border-blue-600' : 'text-slate-600 hover:bg-slate-100 font-medium'} text-xs">
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    <i data-lucide="qr-code" class="w-4 h-4"></i>
                  </div>
                  <div>
                    <div>UPI / QR</div>
                    <div class="text-[10px] text-slate-400 font-normal">GPay, PhonePe, Paytm</div>
                  </div>
                </div>
                <i data-lucide="chevron-right" class="w-3.5 h-3.5 text-slate-400"></i>
              </button>

              <button data-tab="card" class="rzp-tab-btn w-full text-left p-3 rounded-xl flex items-center justify-between transition-all ${this.activeTab === 'card' ? 'bg-white shadow-xs text-blue-900 font-bold border-l-4 border-blue-600' : 'text-slate-600 hover:bg-slate-100 font-medium'} text-xs">
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    <i data-lucide="credit-card" class="w-4 h-4"></i>
                  </div>
                  <div>
                    <div>Cards</div>
                    <div class="text-[10px] text-slate-400 font-normal">Credit / Debit Card</div>
                  </div>
                </div>
                <i data-lucide="chevron-right" class="w-3.5 h-3.5 text-slate-400"></i>
              </button>

              <button data-tab="netbanking" class="rzp-tab-btn w-full text-left p-3 rounded-xl flex items-center justify-between transition-all ${this.activeTab === 'netbanking' ? 'bg-white shadow-xs text-blue-900 font-bold border-l-4 border-blue-600' : 'text-slate-600 hover:bg-slate-100 font-medium'} text-xs">
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    <i data-lucide="landmark" class="w-4 h-4"></i>
                  </div>
                  <div>
                    <div>Netbanking</div>
                    <div class="text-[10px] text-slate-400 font-normal">All Major Indian Banks</div>
                  </div>
                </div>
                <i data-lucide="chevron-right" class="w-3.5 h-3.5 text-slate-400"></i>
              </button>

              <button data-tab="wallet" class="rzp-tab-btn w-full text-left p-3 rounded-xl flex items-center justify-between transition-all ${this.activeTab === 'wallet' ? 'bg-white shadow-xs text-blue-900 font-bold border-l-4 border-blue-600' : 'text-slate-600 hover:bg-slate-100 font-medium'} text-xs">
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                    <i data-lucide="wallet" class="w-4 h-4"></i>
                  </div>
                  <div>
                    <div>Wallets</div>
                    <div class="text-[10px] text-slate-400 font-normal">Amazon Pay, Paytm</div>
                  </div>
                </div>
                <i data-lucide="chevron-right" class="w-3.5 h-3.5 text-slate-400"></i>
              </button>
            </div>

            <!-- Main Interactive Content (8 Cols) -->
            <div id="rzp-tab-content-container" class="md:col-span-8 p-4 sm:p-5 flex flex-col justify-between">
              ${this.renderTabContent(this.activeTab, formattedAmount)}
            </div>

          </div>

          <!-- Bottom Footer Bar -->
          <div class="bg-slate-50 border-t border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div class="flex items-center gap-2 text-slate-500 text-[11px]">
              <i data-lucide="lock" class="w-3.5 h-3.5 text-emerald-600"></i>
              <span>PCI-DSS Certified · 100% Safe Payment</span>
            </div>

            <!-- Quick Simulator Controls for Demo -->
            <div class="flex items-center gap-2">
              <button id="rzp-quick-pay-success" class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs transition-colors flex items-center gap-1">
                <i data-lucide="zap" class="w-3.5 h-3.5"></i>
                <span>Fast Mock Pay (Success)</span>
              </button>
            </div>
          </div>

        </div>
      `;

      document.body.appendChild(overlay);
      if (window.lucide) window.lucide.createIcons();

      this.attachListeners(formattedAmount);
    },

    renderTabContent: function(tab, formattedAmount) {
      if (tab === 'upi') {
        return `
          <div class="space-y-4">
            <div>
              <h4 class="font-bold text-slate-900 text-sm">Scan & Pay via UPI</h4>
              <p class="text-[11px] text-slate-500">Scan QR using Google Pay, PhonePe, Paytm, BHIM, or any UPI App</p>
            </div>

            <!-- QR Code Card -->
            <div class="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/40">
              <div class="relative bg-white p-2.5 rounded-xl shadow-xs border border-blue-100 flex-shrink-0">
                <!-- Mock QR Code SVG -->
                <svg class="w-32 h-32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="100" height="100" fill="white"/>
                  <!-- Position markers -->
                  <rect x="5" y="5" width="28" height="28" rx="4" stroke="#072F5F" stroke-width="4"/>
                  <rect x="11" y="11" width="16" height="16" rx="2" fill="#072F5F"/>
                  <rect x="67" y="5" width="28" height="28" rx="4" stroke="#072F5F" stroke-width="4"/>
                  <rect x="73" y="11" width="16" height="16" rx="2" fill="#072F5F"/>
                  <rect x="5" y="67" width="28" height="28" rx="4" stroke="#072F5F" stroke-width="4"/>
                  <rect x="11" y="73" width="16" height="16" rx="2" fill="#072F5F"/>
                  <!-- Data Dots -->
                  <rect x="38" y="8" width="6" height="6" fill="#0CA854"/>
                  <rect x="48" y="8" width="6" height="6" fill="#072F5F"/>
                  <rect x="38" y="18" width="6" height="6" fill="#072F5F"/>
                  <rect x="48" y="18" width="6" height="6" fill="#0CA854"/>
                  <rect x="38" y="28" width="6" height="6" fill="#072F5F"/>
                  <rect x="8" y="38" width="6" height="6" fill="#072F5F"/>
                  <rect x="18" y="38" width="6" height="6" fill="#0CA854"/>
                  <rect x="28" y="38" width="6" height="6" fill="#072F5F"/>
                  <rect x="38" y="38" width="24" height="24" rx="4" fill="#072F5F"/>
                  <rect x="44" y="44" width="12" height="12" rx="2" fill="#0CA854"/>
                  <rect x="67" y="38" width="6" height="6" fill="#072F5F"/>
                  <rect x="77" y="38" width="6" height="6" fill="#0CA854"/>
                  <rect x="87" y="38" width="6" height="6" fill="#072F5F"/>
                  <rect x="38" y="67" width="6" height="6" fill="#072F5F"/>
                  <rect x="48" y="67" width="6" height="6" fill="#0CA854"/>
                  <rect x="58" y="67" width="6" height="6" fill="#072F5F"/>
                  <rect x="67" y="67" width="6" height="6" fill="#0CA854"/>
                  <rect x="77" y="77" width="6" height="6" fill="#072F5F"/>
                  <rect x="87" y="87" width="6" height="6" fill="#0CA854"/>
                </svg>
                <div class="text-[9px] text-center font-bold text-slate-500 mt-1">UPI QR CODE</div>
              </div>

              <div class="space-y-2 flex-1">
                <div class="text-xs font-bold text-slate-800">Scan code with any UPI app</div>
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="px-2 py-0.5 rounded bg-white text-[10px] font-bold text-slate-700 border border-slate-200 shadow-2xs">GPay</span>
                  <span class="px-2 py-0.5 rounded bg-white text-[10px] font-bold text-slate-700 border border-slate-200 shadow-2xs">PhonePe</span>
                  <span class="px-2 py-0.5 rounded bg-white text-[10px] font-bold text-slate-700 border border-slate-200 shadow-2xs">Paytm</span>
                  <span class="px-2 py-0.5 rounded bg-white text-[10px] font-bold text-slate-700 border border-slate-200 shadow-2xs">BHIM</span>
                </div>
                <div class="text-[11px] text-slate-500 flex items-center gap-1">
                  <i data-lucide="clock" class="w-3.5 h-3.5 text-amber-600"></i>
                  <span>QR expires in <strong id="rzp-qr-timer" class="text-slate-800">14:59</strong></span>
                </div>
              </div>
            </div>

            <!-- Or Enter UPI ID -->
            <div class="space-y-2 pt-1 border-t border-slate-100">
              <label class="block text-xs font-bold text-slate-700">Or Enter UPI ID / VPA</label>
              <div class="flex gap-2">
                <input type="text" id="rzp-upi-id-input" placeholder="e.g. aditya@okhdfcbank" value="${this.currentOptions.prefill?.contact ? '9820144556@paytm' : 'aditya@okhdfcbank'}" class="flex-1 p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 font-medium" />
                <button id="rzp-btn-pay-upi" class="px-4 py-2.5 rounded-xl bg-[#072F5F] hover:bg-[#0c2340] text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5">
                  <span>Pay ₹${formattedAmount}</span>
                </button>
              </div>
            </div>
          </div>
        `;
      } else if (tab === 'card') {
        return `
          <div class="space-y-3.5">
            <div>
              <h4 class="font-bold text-slate-900 text-sm">Credit / Debit Card</h4>
              <p class="text-[11px] text-slate-500">Supports Visa, Mastercard, RuPay, Maestro & Diners Club</p>
            </div>

            <form id="rzp-card-form" class="space-y-3">
              <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">Card Number</label>
                <div class="relative">
                  <input type="text" id="rzp-card-num" maxlength="19" placeholder="4532 8920 1122 3344" value="4111 2222 3333 4444" class="w-full p-2.5 pl-9 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-blue-600" />
                  <i data-lucide="credit-card" class="w-4 h-4 text-slate-400 absolute left-2.5 top-3"></i>
                  <span class="absolute right-2.5 top-2.5 px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">VISA</span>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-1">Expiry Date</label>
                  <input type="text" id="rzp-card-exp" maxlength="5" placeholder="MM/YY" value="08/29" class="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-blue-600" />
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-1">CVV / CVC</label>
                  <input type="password" id="rzp-card-cvv" maxlength="4" placeholder="•••" value="882" class="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-blue-600" />
                </div>
              </div>

              <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">Cardholder Name</label>
                <input type="text" id="rzp-card-name" value="${this.currentOptions.prefill?.name || 'Aditya Verma'}" class="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-600" />
              </div>

              <label class="flex items-center gap-2 cursor-pointer text-[11px] text-slate-600 pt-1">
                <input type="checkbox" checked class="rounded text-blue-600 focus:ring-blue-500" />
                <span>Save card securely for future payments as per RBI guidelines</span>
              </label>

              <button type="submit" class="w-full py-3 rounded-xl bg-[#072F5F] hover:bg-[#0c2340] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-2">
                <i data-lucide="lock" class="w-3.5 h-3.5"></i>
                <span>Pay ₹${formattedAmount}</span>
              </button>
            </form>
          </div>
        `;
      } else if (tab === 'netbanking') {
        return `
          <div class="space-y-4">
            <div>
              <h4 class="font-bold text-slate-900 text-sm">Netbanking</h4>
              <p class="text-[11px] text-slate-500">Select your bank to proceed with direct netbanking</p>
            </div>

            <div class="grid grid-cols-3 gap-2">
              <label class="p-2.5 rounded-xl border-2 border-blue-600 bg-blue-50/50 flex flex-col items-center justify-center gap-1 cursor-pointer text-center">
                <input type="radio" name="rzp-bank" value="HDFC" checked class="hidden" />
                <div class="w-7 h-7 rounded-lg bg-blue-900 text-white font-black text-[10px] flex items-center justify-center">HDFC</div>
                <span class="text-[11px] font-bold text-slate-800">HDFC Bank</span>
              </label>

              <label class="p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white flex flex-col items-center justify-center gap-1 cursor-pointer text-center">
                <input type="radio" name="rzp-bank" value="SBI" class="hidden" />
                <div class="w-7 h-7 rounded-lg bg-sky-600 text-white font-black text-[10px] flex items-center justify-center">SBI</div>
                <span class="text-[11px] font-medium text-slate-700">SBI Bank</span>
              </label>

              <label class="p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white flex flex-col items-center justify-center gap-1 cursor-pointer text-center">
                <input type="radio" name="rzp-bank" value="ICICI" class="hidden" />
                <div class="w-7 h-7 rounded-lg bg-orange-600 text-white font-black text-[10px] flex items-center justify-center">ICICI</div>
                <span class="text-[11px] font-medium text-slate-700">ICICI Bank</span>
              </label>

              <label class="p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white flex flex-col items-center justify-center gap-1 cursor-pointer text-center">
                <input type="radio" name="rzp-bank" value="AXIS" class="hidden" />
                <div class="w-7 h-7 rounded-lg bg-purple-800 text-white font-black text-[10px] flex items-center justify-center">AXIS</div>
                <span class="text-[11px] font-medium text-slate-700">Axis Bank</span>
              </label>

              <label class="p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white flex flex-col items-center justify-center gap-1 cursor-pointer text-center">
                <input type="radio" name="rzp-bank" value="KOTAK" class="hidden" />
                <div class="w-7 h-7 rounded-lg bg-red-600 text-white font-black text-[10px] flex items-center justify-center">KTK</div>
                <span class="text-[11px] font-medium text-slate-700">Kotak Bank</span>
              </label>

              <label class="p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white flex flex-col items-center justify-center gap-1 cursor-pointer text-center">
                <input type="radio" name="rzp-bank" value="PNB" class="hidden" />
                <div class="w-7 h-7 rounded-lg bg-amber-700 text-white font-black text-[10px] flex items-center justify-center">PNB</div>
                <span class="text-[11px] font-medium text-slate-700">PNB</span>
              </label>
            </div>

            <button id="rzp-btn-pay-bank" class="w-full py-3 rounded-xl bg-[#072F5F] hover:bg-[#0c2340] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2">
              <span>Continue to Secure Bank Gateway · ₹${formattedAmount}</span>
            </button>
          </div>
        `;
      } else if (tab === 'wallet') {
        return `
          <div class="space-y-4">
            <div>
              <h4 class="font-bold text-slate-900 text-sm">Wallets</h4>
              <p class="text-[11px] text-slate-500">Link & pay using supported Indian digital wallets</p>
            </div>

            <div class="space-y-2">
              <label class="p-3 rounded-xl border-2 border-blue-600 bg-blue-50/40 flex items-center justify-between cursor-pointer">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-amber-500 text-white font-black text-xs flex items-center justify-center">a</div>
                  <span class="text-xs font-bold text-slate-900">Amazon Pay</span>
                </div>
                <input type="radio" name="rzp-wallet" value="AmazonPay" checked class="text-blue-600" />
              </label>

              <label class="p-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-white flex items-center justify-between cursor-pointer">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-sky-600 text-white font-black text-xs flex items-center justify-center">P</div>
                  <span class="text-xs font-medium text-slate-800">Paytm Wallet</span>
                </div>
                <input type="radio" name="rzp-wallet" value="Paytm" class="text-blue-600" />
              </label>

              <label class="p-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-white flex items-center justify-between cursor-pointer">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center">M</div>
                  <span class="text-xs font-medium text-slate-800">MobiKwik</span>
                </div>
                <input type="radio" name="rzp-wallet" value="MobiKwik" class="text-blue-600" />
              </label>
            </div>

            <button id="rzp-btn-pay-wallet" class="w-full py-3 rounded-xl bg-[#072F5F] hover:bg-[#0c2340] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2">
              <span>Pay with Wallet · ₹${formattedAmount}</span>
            </button>
          </div>
        `;
      }
      return '';
    },

    attachListeners: function(formattedAmount) {
      const self = this;

      // Close Button
      document.getElementById('rzp-btn-close')?.addEventListener('click', () => {
        if (confirm('Are you sure you want to cancel the Razorpay payment?')) {
          self.close();
        }
      });

      // Tab switching
      document.querySelectorAll('.rzp-tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const tab = btn.getAttribute('data-tab');
          self.activeTab = tab;
          self.render();
        });
      });

      // Card Form submission
      document.getElementById('rzp-card-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        self.triggerPaymentProcess('Card Payment (Visa **** 4444)');
      });

      // UPI Pay button
      document.getElementById('rzp-btn-pay-upi')?.addEventListener('click', () => {
        const upiId = document.getElementById('rzp-upi-id-input')?.value || 'aditya@okhdfcbank';
        self.triggerPaymentProcess(`UPI (${upiId})`);
      });

      // Bank Pay button
      document.getElementById('rzp-btn-pay-bank')?.addEventListener('click', () => {
        const selectedBank = document.querySelector('input[name="rzp-bank"]:checked')?.value || 'HDFC Bank';
        self.triggerPaymentProcess(`Netbanking (${selectedBank})`);
      });

      // Wallet Pay button
      document.getElementById('rzp-btn-pay-wallet')?.addEventListener('click', () => {
        const selectedWallet = document.querySelector('input[name="rzp-wallet"]:checked')?.value || 'Amazon Pay';
        self.triggerPaymentProcess(`Wallet (${selectedWallet})`);
      });

      // Quick Pay Demo button
      document.getElementById('rzp-quick-pay-success')?.addEventListener('click', () => {
        self.triggerPaymentProcess('Instant UPI Test');
      });
    },

    triggerPaymentProcess: function(paymentMethodName) {
      const container = document.getElementById('rzp-tab-content-container');
      if (!container) return;

      const randomPayId = `pay_Rzp${Math.random().toString(36).substring(2, 9).toUpperCase()}${Date.now().toString().slice(-4)}`;
      const randomOrderId = this.currentOptions.order_id || `order_${Math.random().toString(36).substring(2, 10)}`;
      const opt = this.currentOptions;

      // Show Razorpay Processing Screen
      container.innerHTML = `
        <div class="h-full flex flex-col items-center justify-center py-8 space-y-4 text-center animate-in fade-in">
          <div class="relative">
            <div class="w-16 h-16 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin"></div>
            <div class="absolute inset-0 flex items-center justify-center">
              <i data-lucide="shield-check" class="w-6 h-6 text-blue-600"></i>
            </div>
          </div>

          <div class="space-y-1">
            <h4 class="font-bold text-slate-900 text-sm">Contacting Banking Gateway...</h4>
            <p class="text-xs text-slate-500">Authorizing ₹${(opt.amount / 100).toFixed(2)} with ${paymentMethodName}</p>
            <p class="text-[10px] text-slate-400">Please do not refresh or press back button</p>
          </div>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();

      // Step 2: Simulate Payment Success after 1.6 seconds
      setTimeout(() => {
        container.innerHTML = `
          <div class="h-full flex flex-col items-center justify-center py-6 space-y-3 text-center animate-in zoom-in-95">
            <div class="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/20">
              <i data-lucide="check" class="w-8 h-8 stroke-[3]"></i>
            </div>

            <div class="space-y-1">
              <h4 class="font-black text-slate-900 text-base text-emerald-700">Payment Successful!</h4>
              <p class="text-xs font-semibold text-slate-700">Payment ID: <code class="bg-slate-100 px-1.5 py-0.5 rounded text-blue-800 font-mono font-bold">${randomPayId}</code></p>
              <div class="text-[11px] text-slate-500 pt-1">Redirecting back to hospital portal...</div>
            </div>
          </div>
        `;
        if (window.lucide) window.lucide.createIcons();

        // Trigger user callback after brief celebration display
        setTimeout(() => {
          const responsePayload = {
            razorpay_payment_id: randomPayId,
            razorpay_order_id: randomOrderId,
            razorpay_signature: `sig_${Math.random().toString(36).substring(2, 15)}`,
            method: paymentMethodName,
            status: 'captured',
            amount: opt.amount
          };

          const modal = document.getElementById('rzp-mock-checkout-overlay');
          if (modal) modal.remove();
          this.isOpen = false;

          if (opt && typeof opt.handler === 'function') {
            opt.handler(responsePayload);
          }
        }, 1200);

      }, 1600);
    }
  };

  // Also define standard window.Razorpay constructor for standard SDK drop-in compatibility
  window.Razorpay = function(options) {
    return {
      open: function() {
        window.RazorpayCheckout.open(options);
      },
      close: function() {
        window.RazorpayCheckout.close();
      }
    };
  };

})();
