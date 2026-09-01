function RenderChatUI(patientId, currentUserRole, doctorName = "Doctor") {
  const messages = window.SyncEngine.getMessages(patientId);
  const user = JSON.parse(localStorage.getItem('careforge_user'));
  
  return `
    <div id="chat-container" class="flex flex-col min-h-[300px] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-1">
      <div class="px-4 py-3 bg-[#0F2942] text-white flex items-center justify-between">
        <h3 class="font-bold text-sm flex items-center gap-2">
          <i data-lucide="message-square" class="w-4 h-4"></i>
          Chat Consultation
        </h3>
      </div>
      
      <div id="chat-messages" class="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        ${messages.length === 0 ? `<div class="text-center text-xs text-slate-500 mt-4">Start the conversation...</div>` : ''}
        ${messages.map(m => {
          const isMe = m.sender === currentUserRole;
          return `
            <div class="flex flex-col ${isMe ? 'items-end' : 'items-start'}">
              <div class="px-3 py-2 rounded-xl text-sm max-w-[85%] ${
                isMe ? 'bg-[#0CA854] text-white rounded-tr-none shadow-sm shadow-emerald-700/20' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
              }">
                ${m.text}
              </div>
              <span class="text-[10px] text-slate-500 mt-1">${m.time}</span>
            </div>
          `;
        }).join('')}
      </div>

      <div class="p-3 bg-white border-t border-slate-200">
        <form id="chat-form" class="flex items-center gap-2" data-patient-id="${patientId}" data-role="${currentUserRole}" data-doctor="${doctorName}">
          <input type="text" id="chat-input" class="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#0CA854] outline-none" placeholder="Type a message..." autocomplete="off">
          <button type="submit" class="p-2 bg-[#0F2942] hover:bg-slate-800 text-white rounded-lg transition-colors">
            <i data-lucide="send" class="w-4 h-4"></i>
          </button>
        </form>
      </div>
    </div>
  `;
}

function AttachChatListeners() {
  const form = document.getElementById('chat-form');
  if (form && !form.hasAttribute('data-listeners-attached')) {
    form.setAttribute('data-listeners-attached', 'true');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('chat-input');
      const text = input.value.trim();
      if (!text) return;

      const patientId = form.getAttribute('data-patient-id');
      const role = form.getAttribute('data-role');
      const docName = form.getAttribute('data-doctor');

      window.SyncEngine.addMessage(patientId, docName, role, text);
      input.value = '';
    });
  }

  // Auto-scroll to bottom
  const msgs = document.getElementById('chat-messages');
  if (msgs) {
    msgs.scrollTop = msgs.scrollHeight;
  }
}
