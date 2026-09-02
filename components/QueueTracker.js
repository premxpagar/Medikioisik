/**
 * MediKiosik — OPD Live Queue & Appointment Tracker
 * Real-time crowd & queue management for patients post check-in
 */

(function() {
  'use strict';

  // --- Queue Engine: Simulates live OPD queue state ---
  window.QueueEngine = {
    // Mock OPD patients currently in queue ahead of each department
    _mockQueueBase: {
      'General Medicine & Triage': 12,
      'Cardiology & Heart Care': 6,
      'Orthopedics & Spine': 9,
      'Neurology & Brain': 4,
      'Dermatology & Skin': 8,
      'Pediatrics & Child Care': 7,
      'Gynecology & Women\'s Health': 5,
      'Ophthalmology & Eye Care': 3,
      'ENT (Ear, Nose & Throat)': 6,
      'Psychiatry & Mental Health': 2,
      'default': 8
    },

    // Avg mins per consultation
    _avgConsultMins: 8,

    /**
     * Returns queue info for a given token.
     * @param {object} token - The generated token object
     * @returns {object} queueInfo
     */
    getQueueInfo(token) {
      if (!token) return null;

      const store = window.SyncEngine ? window.SyncEngine.getStore() : { patients: [] };
      const allPatients = store.patients || [];

      // Patients registered before this token that are still Waiting or In Progress
      const tokenCheckIn = token.checkInTime || '00:00';
      const dept = token.department || '';

      // Filter for same department, still waiting
      const waitingBefore = allPatients.filter(p => {
        if (p.id === token.id) return false;
        if (p.department !== dept) return false;
        if (p.status === 'Completed' || p.status === 'Cancelled') return false;
        // Consider patients checked in before this one
        const pTime = p.checkInTime || '00:00';
        return pTime <= tokenCheckIn;
      });

      // Add mock base queue on top (simulating pre-existing OPD patients)
      const baseQueue = this._mockQueueBase[dept] || this._mockQueueBase['default'];
      const queuePosition = waitingBefore.length + baseQueue;

      // Triage bump: emergency patients go first
      const isUrgent = token.triageLevel === 'EMERGENCY_RED_FLAG';
      const effectivePosition = isUrgent ? 1 : Math.max(1, queuePosition - (isUrgent ? queuePosition : 0));

      const waitMinutes = isUrgent ? 0 : effectivePosition * this._avgConsultMins;
      const waitHours = Math.floor(waitMinutes / 60);
      const waitMins = waitMinutes % 60;

      // Scheduled appointment time vs estimated
      const slotTime = token.appointmentTime || token.bookingSlot || 'Today · 10:30 AM';
      const now = new Date();
      const estimatedCallTime = new Date(now.getTime() + waitMinutes * 60000);
      const estimatedTimeStr = estimatedCallTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Simulate a "currently being seen" patient (the one with token just before this)
      const currentlyServingNum = Math.max(1, effectivePosition - 1);

      // Status label based on position
      let statusLabel, statusColor, statusIcon;
      if (isUrgent) {
        statusLabel = 'Emergency — Immediate Attention';
        statusColor = 'red';
        statusIcon = 'alert-octagon';
      } else if (effectivePosition <= 3) {
        statusLabel = 'Almost There — Please be ready!';
        statusColor = 'amber';
        statusIcon = 'bell-ring';
      } else if (effectivePosition <= 7) {
        statusLabel = 'In Queue — Moderate Wait';
        statusColor = 'blue';
        statusIcon = 'clock';
      } else {
        statusLabel = 'In Queue — Please be seated';
        statusColor = 'emerald';
        statusIcon = 'sofa';
      }

      return {
        token: token.token,
        patientName: token.name,
        department: dept,
        doctorName: token.doctorName,
        room: token.room || 'OPD Room 04',
        consultationMode: token.consultationMode || 'in-person',
        triageLevel: token.triageLevel,
        isUrgent,
        queuePosition: effectivePosition,
        totalInQueue: effectivePosition + 3, // simulate more people behind
        currentlyServing: `Token #${currentlyServingNum}`,
        waitMinutes,
        waitHours,
        waitMins,
        estimatedCallTime: estimatedTimeStr,
        scheduledSlot: slotTime,
        statusLabel,
        statusColor,
        statusIcon,
        checkInTime: token.checkInTime,
        status: token.status || 'Waiting'
      };
    },

    /**
     * Simulate real-time queue progression (moves queue forward by 1 every 30s in mock)
     * In production this would listen to a WebSocket or poll an API.
     */
    startLiveUpdates(tokenId, callback) {
      const interval = setInterval(() => {
        if (!document.getElementById('queue-tracker-modal') && !document.getElementById('queue-status-badge')) {
          clearInterval(interval);
          return;
        }
        if (typeof callback === 'function') callback();
      }, 15000); // Refresh every 15 seconds
      return interval;
    }
  };

  // --- Queue Tracker UI ---
  window.QueueTracker = {
    _interval: null,
    _isOpen: false,

    open(token) {
      this._isOpen = true;
      this.render(token);

      // Start live simulation updates
      this._interval = window.QueueEngine.startLiveUpdates(token.id, () => {
        if (this._isOpen) this.refreshContent(token);
      });
    },

    close() {
      this._isOpen = false;
      clearInterval(this._interval);
      const modal = document.getElementById('queue-tracker-modal');
      if (modal) {
        modal.classList.add('opacity-0', 'scale-95');
        setTimeout(() => modal.remove(), 200);
      }
    },

    render(token) {
      const existing = document.getElementById('queue-tracker-modal');
      if (existing) existing.remove();

      const qi = window.QueueEngine.getQueueInfo(token);
      if (!qi) return;

      const modal = document.createElement('div');
      modal.id = 'queue-tracker-modal';
      modal.className = 'fixed inset-0 z-[99998] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 transition-all duration-200';

      modal.innerHTML = this.getModalHTML(qi, token);
      document.body.appendChild(modal);

      if (window.lucide) window.lucide.createIcons();
      this.attachListeners(token);
      this.startCountdownTimer(qi.waitMinutes);
      this.animateQueueBar(qi);
    },

    refreshContent(token) {
      const qi = window.QueueEngine.getQueueInfo(token);
      if (!qi) return;
      const contentEl = document.getElementById('queue-tracker-content');
      if (contentEl) {
        contentEl.innerHTML = this.getQueueContentHTML(qi);
        if (window.lucide) window.lucide.createIcons();
        this.animateQueueBar(qi);
      }
    },

    getModalHTML(qi, token) {
      const colorMap = {
        red: { bg: 'from-red-600 to-red-700', badge: 'bg-red-100 text-red-800 border-red-200', ring: 'ring-red-300', dot: 'bg-red-500' },
        amber: { bg: 'from-amber-500 to-orange-600', badge: 'bg-amber-100 text-amber-800 border-amber-200', ring: 'ring-amber-300', dot: 'bg-amber-500' },
        blue: { bg: 'from-blue-600 to-indigo-700', badge: 'bg-blue-100 text-blue-800 border-blue-200', ring: 'ring-blue-300', dot: 'bg-blue-500' },
        emerald: { bg: 'from-emerald-600 to-teal-700', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200', ring: 'ring-emerald-300', dot: 'bg-emerald-500' }
      };
      const c = colorMap[qi.statusColor] || colorMap.emerald;

      return `
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">

          <!-- Header -->
          <div class="bg-gradient-to-br ${c.bg} text-white p-5 sm:p-6 relative overflow-hidden">
            <div class="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10 pointer-events-none"></div>
            <div class="absolute -left-4 -bottom-6 w-20 h-20 rounded-full bg-white/5 pointer-events-none"></div>

            <div class="relative z-10 flex items-start justify-between">
              <div class="flex items-center gap-3.5">
                <!-- Animated Queue Icon -->
                <div class="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner border border-white/30 relative flex-shrink-0">
                  <i data-lucide="${qi.statusIcon}" class="w-6 h-6 text-white"></i>
                  <span class="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full ${c.dot} border-2 border-white animate-pulse"></span>
                </div>
                <div>
                  <h3 class="font-black text-white text-base sm:text-lg leading-tight">Live Queue Tracker</h3>
                  <p class="text-white/75 text-xs mt-0.5">${qi.department}</p>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <!-- Live indicator -->
                <div class="flex items-center gap-1.5 bg-white/20 px-2.5 py-1 rounded-full text-[11px] font-bold text-white">
                  <span class="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                  <span>LIVE</span>
                </div>
                <button id="queue-tracker-close" class="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all">
                  <i data-lucide="x" class="w-4 h-4 text-white"></i>
                </button>
              </div>
            </div>

            <!-- Token Display (Hero Number) -->
            <div class="relative z-10 mt-5 flex items-end justify-between">
              <div>
                <div class="text-white/60 text-[11px] font-bold uppercase tracking-wider">Your Token</div>
                <div class="text-4xl sm:text-5xl font-black text-white tracking-wider font-mono mt-0.5 drop-shadow-lg">${qi.token}</div>
              </div>
              <div class="text-right">
                <div class="text-white/60 text-[11px] font-bold uppercase tracking-wider">Your Position</div>
                <div class="text-4xl sm:text-5xl font-black text-white mt-0.5">#${qi.queuePosition}</div>
              </div>
            </div>
          </div>

          <!-- Dynamic Content Area -->
          <div id="queue-tracker-content" class="p-4 sm:p-5 space-y-4 max-h-[60vh] overflow-y-auto">
            ${this.getQueueContentHTML(qi)}
          </div>

          <!-- Footer -->
          <div class="bg-slate-50 border-t border-slate-100 px-4 py-3 flex items-center justify-between gap-3">
            <div class="text-[11px] text-slate-500 flex items-center gap-1.5">
              <i data-lucide="refresh-cw" class="w-3.5 h-3.5 text-emerald-600"></i>
              <span>Auto-refreshes every 15 seconds</span>
            </div>
            <button id="queue-tracker-close-bottom" class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all">
              Got it
            </button>
          </div>
        </div>
      `;
    },

    getQueueContentHTML(qi) {
      const waitStr = qi.waitHours > 0
        ? `${qi.waitHours}h ${qi.waitMins}m`
        : `${qi.waitMinutes} min${qi.waitMinutes !== 1 ? 's' : ''}`;

      const colorMap = {
        red: { bar: 'bg-red-500', text: 'text-red-600', badge: 'bg-red-50 text-red-800 border-red-200' },
        amber: { bar: 'bg-amber-500', text: 'text-amber-600', badge: 'bg-amber-50 text-amber-800 border-amber-200' },
        blue: { bar: 'bg-blue-500', text: 'text-blue-600', badge: 'bg-blue-50 text-blue-800 border-blue-200' },
        emerald: { bar: 'bg-emerald-500', text: 'text-emerald-600', badge: 'bg-emerald-50 text-emerald-800 border-emerald-200' }
      };
      const c = colorMap[qi.statusColor] || colorMap.emerald;

      const progressPct = Math.max(5, Math.min(95, Math.round(((qi.totalInQueue - qi.queuePosition) / qi.totalInQueue) * 100)));

      return `
        <!-- Status Banner -->
        <div class="p-3 rounded-2xl border flex items-center gap-3 ${c.badge}">
          <i data-lucide="${qi.statusIcon}" class="w-4 h-4 flex-shrink-0"></i>
          <span class="text-xs font-bold">${qi.statusLabel}</span>
        </div>

        <!-- Queue Progress Visualization -->
        <div class="space-y-2">
          <div class="flex items-center justify-between text-xs">
            <span class="text-slate-500 font-medium">Queue Progress</span>
            <span class="font-bold text-slate-700">${qi.totalInQueue - qi.queuePosition} of ${qi.totalInQueue} patients ahead cleared</span>
          </div>
          <div class="relative h-3 bg-slate-100 rounded-full overflow-hidden">
            <div id="queue-progress-bar" class="h-full ${c.bar} rounded-full transition-all duration-1000 ease-out" style="width: 0%"></div>
          </div>
          <div class="flex justify-between text-[10px] text-slate-400 font-medium">
            <span>Start of queue</span>
            <span>You (#${qi.queuePosition})</span>
            <span>Others behind</span>
          </div>
          <!-- Store target for animation -->
          <span id="queue-bar-target" data-pct="${progressPct}" class="hidden"></span>
        </div>

        <!-- Key Stats Grid -->
        <div class="grid grid-cols-2 gap-3">
          <!-- Wait Time -->
          <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div class="flex items-center gap-1.5 text-slate-500">
              <i data-lucide="timer" class="w-3.5 h-3.5"></i>
              <span class="text-[10px] font-bold uppercase tracking-wide">Est. Wait</span>
            </div>
            <div class="text-xl font-black ${c.text} font-mono" id="queue-wait-display">${waitStr}</div>
            <div class="text-[10px] text-slate-500">${qi.isUrgent ? 'Priority — Immediate' : 'Approximate'}</div>
          </div>

          <!-- Call Time -->
          <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div class="flex items-center gap-1.5 text-slate-500">
              <i data-lucide="clock-3" class="w-3.5 h-3.5"></i>
              <span class="text-[10px] font-bold uppercase tracking-wide">Expected At</span>
            </div>
            <div class="text-xl font-black text-slate-900 font-mono">${qi.estimatedCallTime}</div>
            <div class="text-[10px] text-slate-500">Estimated call time</div>
          </div>
        </div>

        <!-- Doctor & Room -->
        <div class="p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100/50 border border-slate-200 flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <i data-lucide="${qi.consultationMode === 'video' ? 'video' : 'stethoscope'}" class="w-5 h-5"></i>
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-bold text-slate-900 text-xs truncate">${qi.doctorName}</div>
            <div class="text-[11px] text-slate-500 truncate">${qi.consultationMode === 'video' ? 'Video Consultation — Online Room' : `${qi.room} · ${qi.department}`}</div>
          </div>
          <div class="flex-shrink-0">
            <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${qi.consultationMode === 'video' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'}">${qi.consultationMode}</span>
          </div>
        </div>

        <!-- Currently Serving -->
        <div class="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white">
          <div class="flex items-center gap-2 text-xs text-slate-600">
            <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span>Currently Being Seen</span>
          </div>
          <div class="text-xs font-black text-slate-900 font-mono">${qi.currentlyServing}</div>
        </div>

        <!-- Live Countdown Timer -->
        <div class="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white text-center space-y-1.5">
          <div class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Countdown to Your Turn</div>
          <div id="queue-countdown-display" class="text-2xl font-black font-mono tracking-widest text-white">
            ${qi.isUrgent ? '00:00' : `${String(qi.waitHours).padStart(2,'0')}:${String(qi.waitMins).padStart(2,'0')}:00`}
          </div>
          <div class="text-[11px] text-slate-400">hrs : mins : secs</div>
        </div>

        <!-- Scheduled slot reminder -->
        <div class="flex items-center gap-2.5 p-3 rounded-xl bg-blue-50 border border-blue-200">
          <i data-lucide="calendar-check" class="w-4 h-4 text-blue-600 flex-shrink-0"></i>
          <div class="text-[11px] text-blue-800">
            <span class="font-bold">Scheduled slot: </span>${qi.scheduledSlot}
          </div>
        </div>

        <!-- Tips -->
        <div class="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2">
          <i data-lucide="lightbulb" class="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5"></i>
          <p class="text-[11px] text-amber-800 leading-relaxed">
            <span class="font-bold">Tip:</span> Please keep your <strong>Token Slip</strong> & <strong>ABHA card</strong> ready. Stay near the OPD area — you'll be notified here when you're next.
          </p>
        </div>
      `;
    },

    attachListeners(token) {
      document.getElementById('queue-tracker-close')?.addEventListener('click', () => this.close());
      document.getElementById('queue-tracker-close-bottom')?.addEventListener('click', () => this.close());

      // Close on backdrop click
      const modal = document.getElementById('queue-tracker-modal');
      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) this.close();
        });
      }
    },

    animateQueueBar(qi) {
      const barTarget = document.getElementById('queue-bar-target');
      const bar = document.getElementById('queue-progress-bar');
      if (bar && barTarget) {
        const pct = parseInt(barTarget.getAttribute('data-pct')) || 0;
        setTimeout(() => {
          bar.style.width = `${pct}%`;
        }, 100);
      }
    },

    startCountdownTimer(waitMinutes) {
      let totalSeconds = waitMinutes * 60;

      function updateDisplay() {
        const el = document.getElementById('queue-countdown-display');
        if (!el) return;
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        el.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
        if (totalSeconds > 0) {
          totalSeconds--;
          setTimeout(updateDisplay, 1000);
        } else {
          el.textContent = '00:00:00';
          el.classList.add('text-emerald-400');
          el.closest('.space-y-1\\.5').querySelector('.text-slate-400').textContent = 'It\'s your turn! Please proceed.';
        }
      }

      updateDisplay();
    }
  };

  // --- Queue Status Badge (Floating button that opens tracker) ---
  window.QueueBadge = {
    show(token) {
      const existing = document.getElementById('queue-status-badge');
      if (existing) existing.remove();

      const qi = window.QueueEngine.getQueueInfo(token);
      if (!qi) return;

      const colorMap = {
        red: 'from-red-600 to-red-700',
        amber: 'from-amber-500 to-orange-600',
        blue: 'from-blue-600 to-indigo-700',
        emerald: 'from-emerald-600 to-teal-700'
      };
      const grad = colorMap[qi.statusColor] || colorMap.emerald;

      const badge = document.createElement('div');
      badge.id = 'queue-status-badge';
      badge.className = 'fixed bottom-6 left-6 z-[9999] flex flex-col items-start gap-0 group cursor-pointer';

      badge.innerHTML = `
        <div class="bg-gradient-to-br ${grad} text-white rounded-2xl shadow-2xl shadow-slate-900/40 p-3 sm:p-3.5 flex items-center gap-2.5 border border-white/20 backdrop-blur-md transition-transform duration-200 hover:scale-105 active:scale-95">
          <!-- Queue icon with pulse -->
          <div class="relative flex-shrink-0">
            <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <!-- Custom Queue/People icon -->
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <span class="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white text-[10px] font-black flex items-center justify-center shadow-lg" style="color: #0CA854">#${qi.queuePosition}</span>
          </div>
          <div class="hidden sm:block">
            <div class="text-[11px] font-black uppercase tracking-wider text-white/80">Queue Position</div>
            <div class="text-base font-black text-white leading-tight">Wait: ~${qi.waitMinutes}m</div>
          </div>
          <!-- Countdown chip -->
          <div class="hidden sm:flex flex-col items-end ml-1">
            <div class="text-[10px] text-white/60 font-semibold">Token</div>
            <div class="text-sm font-black text-white font-mono">${qi.token}</div>
          </div>
        </div>
        <!-- Tooltip on small screens -->
        <div class="sm:hidden absolute left-14 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-[11px] rounded-xl px-3 py-1.5 font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
          Queue #${qi.queuePosition} · ~${qi.waitMinutes} min wait
        </div>
      `;

      badge.addEventListener('click', () => {
        window.QueueTracker.open(token);
      });

      document.body.appendChild(badge);

      // Pulse animation via CSS
      badge.style.animation = 'queueBadgePop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';
    },

    hide() {
      const el = document.getElementById('queue-status-badge');
      if (el) el.remove();
    },

    update(token) {
      this.hide();
      this.show(token);
    }
  };

  // --- Inject keyframe animation style ---
  const style = document.createElement('style');
  style.id = 'queue-tracker-styles';
  style.textContent = `
    @keyframes queueBadgePop {
      0% { transform: scale(0.5) translateY(20px); opacity: 0; }
      100% { transform: scale(1) translateY(0); opacity: 1; }
    }

    #queue-tracker-modal .animate-in {
      animation: queueModalIn 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    }
    @keyframes queueModalIn {
      0% { transform: scale(0.92); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }

    #queue-tracker-content::-webkit-scrollbar {
      width: 4px;
    }
    #queue-tracker-content::-webkit-scrollbar-track {
      background: transparent;
    }
    #queue-tracker-content::-webkit-scrollbar-thumb {
      background: #e2e8f0;
      border-radius: 2px;
    }
  `;
  if (!document.getElementById('queue-tracker-styles')) {
    document.head.appendChild(style);
  }

})();
