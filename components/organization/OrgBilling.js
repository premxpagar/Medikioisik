function RenderOrgBilling() {
  const user = JSON.parse(localStorage.getItem('careforge_user'));
  // Use synced patients if available, else fallback
  const patients = window.MOCK_DATA.patients || [];

  return `
    ${RenderNavbar('Organization Portal', user.organization, GetOrgNav())}
    
    <main class="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-slate-900">Billing & Insurance Claims</h1>
        <button class="px-4 py-2 bg-[#0CA854] hover:bg-[#087F3F] text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-2">
          <i data-lucide="download" class="w-4 h-4"></i> Export Report
        </button>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-slate-600">
            <thead class="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th class="px-6 py-4">Patient</th>
                <th class="px-6 py-4">Provider / Policy</th>
                <th class="px-6 py-4">Bill Amount</th>
                <th class="px-6 py-4">Claim Status</th>
                <th class="px-6 py-4 text-right">Payment</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${patients.map(p => {
                const b = p.billing || {
                  amount: 0,
                  insuranceProvider: 'N/A',
                  policyNumber: 'N/A',
                  claimStatus: 'N/A',
                  paymentStatus: 'N/A'
                };
                return `
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="px-6 py-4">
                    <div class="font-bold text-slate-900">${p.name}</div>
                    <div class="text-[10px] text-slate-500 mt-0.5">ID: ${p.id.toUpperCase()}</div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="font-medium text-slate-900">${b.insuranceProvider}</div>
                    <div class="text-[10px] text-slate-500 mt-0.5">${b.policyNumber}</div>
                  </td>
                  <td class="px-6 py-4 font-bold text-slate-800">
                    ₹${b.amount.toFixed(2)}
                  </td>
                  <td class="px-6 py-4">
                    <span class="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      b.claimStatus === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                      b.claimStatus === 'Rejected' ? 'bg-rose-100 text-rose-700' :
                      b.claimStatus === 'Pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-700'
                    }">
                      ${b.claimStatus}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right">
                      <div class="flex items-center justify-end gap-2">
                        <span class="inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${
                          b.paymentStatus === 'Paid' ? 'text-emerald-600 border border-emerald-200 bg-emerald-50' : 
                          b.paymentStatus === 'Unpaid' ? 'text-rose-600 border border-rose-200 bg-rose-50' :
                          'text-slate-600 border border-slate-200 bg-slate-50'
                        }">
                          ${b.paymentStatus}
                        </span>
                        ${b.paymentStatus === 'Unpaid' ? `
                          <button data-patient-id="${p.id}" data-amount="${b.amount}" class="btn-org-pay-bill px-2.5 py-1 rounded-md bg-[#072F5F] hover:bg-[#0c2340] text-white text-[10px] font-bold shadow-xs flex items-center gap-1 transition-all">
                            <i data-lucide="credit-card" class="w-3 h-3"></i>
                            <span>Pay (Razorpay)</span>
                          </button>
                        ` : ''}
                      </div>
                    </td>
                  </tr>
                `}).join('')}
              </tbody>
            </table>
            ${patients.length === 0 ? `<div class="p-8 text-center text-slate-500">No billing records found.</div>` : ''}
          </div>
        </div>
      </main>
    `;
  }

  function AttachOrgBillingListeners() {
    document.querySelectorAll('.btn-org-pay-bill').forEach(btn => {
      btn.addEventListener('click', () => {
        const patientId = btn.getAttribute('data-patient-id');
        const amount = parseFloat(btn.getAttribute('data-amount')) || 500;
        const patient = (window.MOCK_DATA.patients || []).find(p => p.id === patientId);

        if (window.RazorpayCheckout) {
          window.RazorpayCheckout.open({
            amount: Math.round(amount * 100),
            name: 'MediKiosik Hospital Billing',
            description: `OPD Consultation & Claim Clearance for ${patient?.name || 'Patient'}`,
            order_id: `order_BILL_${patientId}_${Date.now().toString().slice(-4)}`,
            prefill: {
              name: patient?.name || 'Aditya Verma',
              contact: patient?.phone || '+919820144556'
            },
            handler: function(response) {
              if (patient && patient.billing) {
                patient.billing.paymentStatus = 'Paid';
                patient.billing.claimStatus = 'Approved';
                patient.billing.razorpayId = response.razorpay_payment_id;
              }
              alert(`Payment Successful (${response.razorpay_payment_id})! Patient ${patient?.name} bill marked as PAID.`);
              if (typeof window.RouterNavigate === 'function') {
                window.RouterNavigate(window.location.hash || '#organization/billing');
              } else if (typeof renderApp === 'function') {
                renderApp();
              }
            }
          });
        }
      });
    });
  }
