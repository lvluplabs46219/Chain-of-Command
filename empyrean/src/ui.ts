// The Firm — Telegram-style legal ops messaging UI
export function renderDashboard(): string {
  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>The Firm</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet"/>
<style>
:root,[data-theme="dark"]{
  --bg:#170a1b;--surface:#1d0e23;--surface2:#2c1536;--surface3:#371a43;
  --line:#442154;--text:#feebff;--muted:#e0bfd2;--dim:#9a7a8e;
  --primary:#ff4db8;--accent:#e040a0;--secondary:#cda0fe;--online:#34d399;
  --msg-in:#2c1536;--msg-out:linear-gradient(135deg,#e040a0,#930864);
  --font:'DM Sans',system-ui,sans-serif;--mono:'JetBrains Mono',monospace;
}
[data-theme="light"]{
  --bg:#fff7fb;--surface:#ffefff;--surface2:#fde7ff;--surface3:#fae0ff;
  --line:#ddbfca;--text:#281330;--muted:#57414a;--dim:#8a707b;
  --primary:#af0a78;--accent:#e040a0;--secondary:#744aa2;--online:#10b981;
  --msg-in:#ffffff;--msg-out:linear-gradient(135deg,#e040a0,#af0a78);
}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:var(--font);background:var(--bg);color:var(--text);height:100vh;display:flex;overflow:hidden;font-size:14px;line-height:1.5}
button,input,textarea{font:inherit;color:inherit}
a{color:inherit;text-decoration:none}

.sidebar{width:320px;min-width:320px;background:var(--surface);border-right:1px solid var(--line);display:flex;flex-direction:column;height:100vh}
.side-head{padding:12px 14px;border-bottom:1px solid var(--line);display:flex;flex-direction:column;gap:8px}
.brand-row{display:flex;align-items:center;justify-content:space-between;gap:8px}
.brand{font-weight:700;font-size:1.05rem;letter-spacing:-0.02em}
.brand span{color:var(--primary)}
.practice{cursor:pointer;padding:8px 10px;border-radius:10px;background:var(--surface2);border:1px solid var(--line);transition:border-color .15s}
.practice:hover{border-color:var(--primary)}
.practice .lbl{font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--primary)}
.practice .name{font-weight:600;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.search{margin:10px 12px;padding:8px 12px;border-radius:999px;background:var(--surface2);border:1px solid var(--line);display:flex;align-items:center;gap:8px}
.search input{flex:1;background:transparent;border:none;outline:none;font-size:13px}
.cat{padding:12px 14px 6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--dim);display:flex;justify-content:space-between;align-items:center}
.cat button{background:none;border:none;color:var(--primary);cursor:pointer;font-size:11px;font-weight:600}
.list{flex:1;overflow-y:auto;padding:0 6px 12px}
.item{display:flex;gap:10px;padding:10px;border-radius:12px;cursor:pointer;transition:background .15s;align-items:center}
.item:hover,.item.active{background:var(--surface2)}
.av{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;flex-shrink:0;color:#fff}
.meta{min-width:0;flex:1}
.meta-top{display:flex;justify-content:space-between;gap:6px}
.meta-name{font-weight:600;font-size:13.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.meta-prev{font-size:12px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.side-foot{padding:12px 14px;border-top:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;gap:8px}
.user{display:flex;align-items:center;gap:8px}
.user-av{width:32px;height:32px;border-radius:10px;background:linear-gradient(135deg,var(--accent),var(--secondary));display:flex;align-items:center;justify-content:center;font-weight:700;font-size:11px}
.status{font-family:var(--mono);font-size:11px;color:var(--online);font-weight:600}

.main{flex:1;display:flex;flex-direction:column;min-width:0;height:100vh}
.top{padding:12px 18px;border-bottom:1px solid var(--line);background:var(--surface);display:flex;align-items:center;justify-content:space-between;gap:12px}
.top-title{font-weight:700;font-size:15px}
.top-sub{font-size:12px;color:var(--muted)}
.icon-btn{width:36px;height:36px;border-radius:999px;border:1px solid var(--line);background:var(--surface2);cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--primary)}
.icon-btn:hover{background:var(--surface3)}

.stream{flex:1;overflow-y:auto;padding:18px;display:flex;flex-direction:column;gap:12px}
.bubble{max-width:min(640px,85%);padding:10px 14px;border-radius:16px;font-size:13.5px;line-height:1.45}
.bubble.in{align-self:flex-start;background:var(--msg-in);border:1px solid var(--line);border-bottom-left-radius:4px}
.bubble.out{align-self:flex-end;background:var(--msg-out);color:#fff;border-bottom-right-radius:4px}
.bubble .who{font-size:11px;font-weight:700;margin-bottom:4px;opacity:.9}
.bubble .when{font-size:10px;opacity:.65;margin-top:6px;text-align:right;font-family:var(--mono)}
.bubble pre{margin-top:8px;padding:8px;border-radius:8px;background:rgba(0,0,0,.25);font-family:var(--mono);font-size:11px;overflow-x:auto;white-space:pre-wrap}

.composer{padding:12px 16px 16px;border-top:1px solid var(--line);background:var(--surface);display:flex;gap:10px;align-items:flex-end}
.composer textarea{flex:1;min-height:44px;max-height:140px;resize:none;padding:12px 14px;border-radius:14px;border:1px solid var(--line);background:var(--surface2);outline:none}
.composer textarea:focus{border-color:var(--primary)}
.send{height:44px;padding:0 18px;border-radius:999px;border:none;background:var(--accent);color:#fff;font-weight:700;cursor:pointer}
.send:hover{filter:brightness(1.08)}
.send:disabled{opacity:.45;cursor:not-allowed}
.members{font-size:11px;color:var(--dim);margin-top:2px}
.empty{text-align:center;color:var(--muted);padding:48px 24px;font-size:13px}
</style>
</head>
<body>
<aside class="sidebar">
  <div class="side-head">
    <div class="brand-row">
      <div class="brand">The <span>Firm</span></div>
      <button class="icon-btn" type="button" onclick="toggleTheme()" title="Theme">◐</button>
    </div>
    <div class="practice" onclick="renamePractice()" title="Rename practice">
      <div class="lbl">Active Practice</div>
      <div class="name" id="practiceName">Click to name your practice</div>
    </div>
  </div>
  <div class="search">
    <span style="opacity:.5">⌕</span>
    <input id="searchInput" placeholder="Search matters & channels…" oninput="filterList()"/>
  </div>
  <div class="cat">
    <span>Active Matters & Channels</span>
    <button type="button" onclick="alert('Open a new matter from your docket.')">+ Open Matter</button>
  </div>
  <div class="list" id="channelList"></div>
  <div class="cat">
    <span>Private Chambers</span>
    <button type="button" onclick="alert('Retain a specialist from the Skills directory.')">+ Retain</button>
  </div>
  <div class="list" id="dmList"></div>
  <div class="side-foot">
    <div class="user">
      <div class="user-av">MP</div>
      <div>
        <div style="font-weight:700;font-size:12.5px">Managing Partner</div>
        <div style="font-size:11px;color:var(--muted)">You</div>
      </div>
    </div>
    <span class="status" id="healthStatus">…</span>
  </div>
</aside>

<main class="main">
  <header class="top">
    <div>
      <div class="top-title" id="chatTitle">The Boardroom</div>
      <div class="top-sub" id="chatSub">Partner conference · multi-agent</div>
      <div class="members" id="chatMembers">Lead Counsel · Managing Partner · Research · Case Prep · Gateway · Appellate</div>
    </div>
    <div class="top-actions">
      <button class="icon-btn" type="button" title="Case briefs" onclick="alert('Case Briefs & Exhibits.')">📌</button>
    </div>
  </header>
  <div class="stream" id="stream"><div class="empty">Brief The Boardroom to begin.</div></div>
  <form class="composer" id="composer" onsubmit="return sendMsg(event)">
    <textarea id="input" rows="1" placeholder="Brief The Boardroom or type @ to message a specialist…"></textarea>
    <button class="send" type="submit" id="sendBtn">Send</button>
  </form>
</main>

<script>
const CHANNELS = [
  { id: 'general-swarm', name: 'The Boardroom', sub: 'Partner conference · multi-agent', members: 'YHWH · Michael · Gabriel · Raphael · Metatron · Seraphim', av: 'TB', color: 'linear-gradient(135deg,#e040a0,#744aa2)', preview: 'Strategy, research & draft in one thread' },
  { id: 'dev-scaffold', name: 'Evidence & Discovery Desk', sub: 'Document analysis thread', members: 'Raphael · Michael', av: 'ED', color: 'linear-gradient(135deg,#744aa2,#006388)', preview: 'Exhibits & discovery' },
  { id: 'security-audit', name: 'Compliance Review', sub: 'Risk & compliance channel', members: 'Seraphim · Metatron · Michael', av: 'CR', color: 'linear-gradient(135deg,#006388,#744aa2)', preview: 'Audit trail & checks' },
  { id: 'product-launch', name: 'Matter Strategy', sub: 'Case strategy channel', members: 'YHWH · Gabriel · Raphael', av: 'MS', color: 'linear-gradient(135deg,#cf3192,#e040a0)', preview: 'Theory of the case' },
];
const DMS = [
  { id: 'dm-yhwh', name: 'Lead Counsel Direct', sub: 'Private chambers · YHWH', members: 'YHWH (Lead Counsel)', av: 'YH', color: 'linear-gradient(135deg,#f5c842,#ff4d9e)', preview: 'Planning & directives' },
  { id: 'dm-michael', name: 'Managing Partner Desk', sub: 'Private chambers · Michael', members: 'Michael (Orchestrator)', av: 'MI', color: 'linear-gradient(135deg,#7c5cff,#3d8bff)', preview: 'Workflow coordination' },
  { id: 'dm-gabriel', name: 'Client Relations', sub: 'Private chambers · Gabriel', members: 'Gabriel (Messenger)', av: 'GA', color: 'linear-gradient(135deg,#00d4aa,#3d8bff)', preview: 'Comms & notices' },
  { id: 'dm-raphael', name: 'Case Prep Specialist', sub: 'Private chambers · Raphael', members: 'Raphael (Worker)', av: 'RA', color: 'linear-gradient(135deg,#ff8a3d,#f5c842)', preview: 'Drafting & automation' },
  { id: 'dm-metatron', name: 'Research Counsel', sub: 'Private chambers · Metatron', members: 'Metatron (Gateway)', av: 'ME', color: 'linear-gradient(135deg,#a855f7,#7c5cff)', preview: 'Routing & consensus' },
  { id: 'dm-seraphim', name: 'Appellate Oracle', sub: 'Private chambers · Seraphim', members: 'Seraphim (Vertex)', av: 'SE', color: 'linear-gradient(135deg,#ff4d9e,#7c5cff)', preview: 'Heavy reasoning' },
];

let activeId = 'general-swarm';

function $(id){ return document.getElementById(id); }

function renamePractice(){
  const cur = localStorage.getItem('firmPracticeName') || '';
  const next = prompt('Name your practice (e.g. Lamb & Associates Legal Ops)', cur);
  if (next === null) return;
  const name = next.trim() || 'Your Practice';
  localStorage.setItem('firmPracticeName', name);
  $('practiceName').textContent = name;
  document.title = 'The Firm — ' + name;
}
(function initPractice(){
  const n = localStorage.getItem('firmPracticeName');
  if (n){ $('practiceName').textContent = n; document.title = 'The Firm — ' + n; }
})();

function toggleTheme(){
  const html = document.documentElement;
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('firmTheme', next);
}
(function(){ const t = localStorage.getItem('firmTheme'); if (t) document.documentElement.setAttribute('data-theme', t); })();

function renderLists(){
  const q = ($('searchInput').value || '').toLowerCase();
  const mk = (arr, el) => {
    el.innerHTML = arr.filter(c => !q || c.name.toLowerCase().includes(q)).map(c => `
      <div class="item ${c.id===activeId?'active':''}" data-id="${c.id}" onclick="selectChat('${c.id}')">
        <div class="av" style="background:${c.color}">${c.av}</div>
        <div class="meta">
          <div class="meta-top"><span class="meta-name">${c.name}</span></div>
          <div class="meta-prev">${c.preview}</div>
        </div>
      </div>`).join('');
  };
  mk(CHANNELS, $('channelList'));
  mk(DMS, $('dmList'));
}
function filterList(){ renderLists(); }

function findChat(id){
  return CHANNELS.find(c=>c.id===id) || DMS.find(c=>c.id===id);
}

function selectChat(id){
  activeId = id;
  const c = findChat(id);
  if (!c) return;
  $('chatTitle').textContent = c.name;
  $('chatSub').textContent = c.sub;
  $('chatMembers').textContent = 'Members: ' + c.members;
  renderLists();
  loadMessages();
}

async function loadMessages(){
  const stream = $('stream');
  try {
    const res = await fetch('/api/messages?chatId=' + encodeURIComponent(activeId));
    const data = await res.json();
    const msgs = Array.isArray(data) ? data : (data.messages || []);
    if (!msgs.length){
      stream.innerHTML = '<div class="empty">No messages yet. Brief this chamber to begin.</div>';
      return;
    }
    stream.innerHTML = msgs.map(m => {
      const out = m.isOutgoing || m.senderId === 'user';
      const who = out ? 'You' : (m.senderName || m.senderId || 'Associate');
      const code = m.code ? '<pre>'+escapeHtml(String(m.code))+'</pre>' : '';
      return `<div class="bubble ${out?'out':'in'}"><div class="who">${escapeHtml(who)}</div>${formatText(m.text||'')}${code}<div class="when">${escapeHtml(m.timestamp||'')}</div></div>`;
    }).join('');
    stream.scrollTop = stream.scrollHeight;
  } catch (e) {
    stream.innerHTML = '<div class="empty">Could not load messages. Is The Firm server running?</div>';
  }
}

function escapeHtml(s){
  return String(s).replace(/&/g,'&').replace(/</g,'<').replace(/>/g,'>');
}
function formatText(t){
  return escapeHtml(t).replace(/\\n/g,'<br/>').replace(/\\*\\*([^*]+)\\*\\*/g,'<strong>$1</strong>');
}

async function sendMsg(e){
  e.preventDefault();
  const input = $('input');
  const text = input.value.trim();
  if (!text) return;
  $('sendBtn').disabled = true;
  try {
    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, chatId: activeId })
    });
    input.value = '';
    await loadMessages();
    setTimeout(loadMessages, 800);
    setTimeout(loadMessages, 2200);
  } catch (err) {
    alert('Send failed: ' + err);
  } finally {
    $('sendBtn').disabled = false;
    input.focus();
  }
  return false;
}

async function ping(){
  try {
    const r = await fetch('/api/health');
    const j = await r.json();
    $('healthStatus').textContent = j.status === 'ok' ? 'Online' : 'Degraded';
  } catch {
    $('healthStatus').textContent = 'Offline';
  }
}

renderLists();
selectChat('general-swarm');
ping();
setInterval(ping, 15000);
setInterval(() => { if (document.visibilityState === 'visible') loadMessages(); }, 4000);

$('input').addEventListener('keydown', (ev) => {
  if (ev.key === 'Enter' && !ev.shiftKey){ ev.preventDefault(); sendMsg(ev); }
});
</script>
</body>
</html>`;
}
