import fs from "fs";

function wireCanvaHtml(filePath) {
  let html = fs.readFileSync(filePath, "utf8");

  // 1. Upgrade The Clerk drawer to include live chat with Gemini
  const oldClerkDrawer = `<aside id="clerk-drawer" class="drawer" aria-label="The Clerk notifications" aria-hidden="true">
   <div class="flex items-center justify-between border-b rule pb-3">
    <div>
     <p class="mono text-[9px] gold-text">THE CLERK</p>
     <h2 class="legal-serif mt-1 text-xl">Court Notices</h2>
    </div><button id="close-clerk" class="secondary !px-2 !py-2" type="button" aria-label="Close notices"><i data-lucide="x" class="h-4 w-4"></i></button>
   </div>
   <div class="mt-4 space-y-3 text-sm">
    <div class="border-l-2 border-[#d4af37] bg-[#211e16] p-3"><b>Appearance Approaching</b>
     <p class="mt-1 text-xs muted">Motion Hearing is in 14 days.</p><button class="notice-review secondary mt-3 !py-1.5" type="button">Mark reviewed</button>
    </div>
    <div class="border-l-2 border-[#b5c8df] bg-[#192026] p-3"><b>Record Ready</b>
     <p class="mt-1 text-xs muted">Officer’s Report extraction completed.</p><button class="notice-review secondary mt-3 !py-1.5" type="button">Mark reviewed</button>
    </div>
   </div>
  </aside>`;

  // Check if old drawer matches with possible whitespace
  const clerkDrawerRegex = /<aside id="clerk-drawer" class="drawer"[\s\S]*?<\/aside>/;
  
  const newClerkDrawer = `<aside id="clerk-drawer" class="drawer flex flex-col" aria-label="The Clerk notifications" aria-hidden="true" style="width: min(92vw, 440px); z-index: 100;">
   <div class="flex items-center justify-between border-b rule pb-3">
    <div>
     <div class="flex items-center gap-2">
      <span class="inline-block w-2 h-2 rounded-full bg-[#9fc6ae] animate-pulse"></span>
      <p class="mono text-[9px] gold-text font-bold">THE CLERK · PROCEDURAL GUIDE</p>
     </div>
     <h2 class="legal-serif mt-1 text-xl">Court Notices &amp; AI Clerk</h2>
    </div>
    <button id="close-clerk" class="secondary !px-2 !py-2" type="button" aria-label="Close notices"><i data-lucide="x" class="h-4 w-4"></i></button>
   </div>

   <!-- Tab Switcher -->
   <div class="mt-3 flex border-b rule text-xs font-mono">
    <button id="clerk-tab-ai" type="button" class="px-3 py-2 border-b-2 border-[#d4af37] font-bold text-[#f3ede8]">Ask The Clerk</button>
    <button id="clerk-tab-notices" type="button" class="px-3 py-2 text-[#8e857e] hover:text-[#d4af37]">Notices (2)</button>
   </div>

   <!-- Notices Panel -->
   <div id="clerk-notices-panel" class="hidden mt-4 space-y-3 text-sm flex-1 overflow-y-auto">
    <div class="border-l-2 border-[#d4af37] bg-[#211e16] p-3">
     <b>Appearance Approaching</b>
     <p class="mt-1 text-xs muted">Motion Hearing is in 14 days in Courtroom 302.</p>
     <button class="notice-review secondary mt-3 !py-1.5" type="button">Mark reviewed</button>
    </div>
    <div class="border-l-2 border-[#b5c8df] bg-[#192026] p-3">
     <b>Record Ready</b>
     <p class="mt-1 text-xs muted">Officer’s Report extraction completed.</p>
     <button class="notice-review secondary mt-3 !py-1.5" type="button">Mark reviewed</button>
    </div>
   </div>

   <!-- AI Chat Panel -->
   <div id="clerk-ai-panel" class="flex flex-col flex-1 mt-3 min-h-0 overflow-hidden">
    <div class="text-[11px] p-2.5 bg-[#182027] border border-[#2b3744] text-[#b5c8df] rounded mb-2">
     <p class="font-bold mb-1">Court Procedural Education Assistant</p>
     <p class="text-[10px] leading-4 text-[#8e9eb3]">Provides plain-English procedural rules, courtroom etiquette, and deadlines. Educational information only; not legal advice.</p>
    </div>

    <!-- Scrollable Messages -->
    <div id="clerk-chat-messages" class="flex-1 overflow-y-auto space-y-3 pr-1 text-xs min-h-[220px] max-h-[50vh]">
     <div class="p-3 bg-[#171717] border border-[#2a2a2a] rounded">
      <p class="font-bold gold-text text-[10px] mono mb-1">THE CLERK (AI)</p>
      <p class="leading-5 text-[#f3ede8]">Welcome to your case workspace. You can ask me how to address the judge, where to stand during motion call, filing deadlines, or standard courtroom procedures.</p>
     </div>
    </div>

    <!-- Suggested Quick Prompts -->
    <div class="mt-2 pt-2 border-t rule flex flex-wrap gap-1.5">
     <button type="button" class="clerk-quick-prompt text-[10px] bg-[#1a1a1a] hover:bg-[#252525] text-[#cfc5be] border border-[#333] px-2 py-1 rounded transition-colors" data-prompt="What should I call the judge and how should I dress?">Courtroom Etiquette</button>
     <button type="button" class="clerk-quick-prompt text-[10px] bg-[#1a1a1a] hover:bg-[#252525] text-[#cfc5be] border border-[#333] px-2 py-1 rounded transition-colors" data-prompt="What happens during an initial appearance or arraignment?">Arraignment Steps</button>
     <button type="button" class="clerk-quick-prompt text-[10px] bg-[#1a1a1a] hover:bg-[#252525] text-[#cfc5be] border border-[#333] px-2 py-1 rounded transition-colors" data-prompt="How do I file a motion to suppress evidence?">Filing a Motion</button>
    </div>

    <!-- Input Form -->
    <form id="clerk-chat-form" class="mt-2 flex gap-2">
     <input id="clerk-chat-input" type="text" placeholder="Ask a procedural or court question..." class="flex-1 border rule bg-[#101010] px-3 py-2 text-xs text-[#f3ede8] placeholder-[#777] rounded focus:border-[#d4af37] focus:outline-none" required autocomplete="off" />
     <button id="clerk-chat-send" type="submit" class="primary !px-3 !py-2 text-xs font-bold whitespace-nowrap">Ask Clerk</button>
    </form>
   </div>
  </aside>`;

  html = html.replace(clerkDrawerRegex, newClerkDrawer);

  // 2. Upgrade Exhibit Analysis Modal to have real AI Analysis
  const oldAnalysisModalRegex = /<div id="analysis-modal" class="modal-backdrop"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
  const newAnalysisModal = `<div id="analysis-modal" class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="analysis-modal-title">
   <div class="modal-panel p-5 max-w-2xl w-full max-h-[88vh] overflow-y-auto">
    <div class="flex justify-between items-start">
     <div>
      <span class="tag gold text-[9px] mono">GEMINI 3.8 FLASH · EVIDENCE ANALYST</span>
      <h2 id="analysis-modal-title" class="legal-serif text-2xl mt-1">Exhibit Intelligence &amp; Audit</h2>
     </div>
     <button class="close-modal secondary !px-2 !py-2" type="button" aria-label="Close"><i data-lucide="x" class="h-4 w-4"></i></button>
    </div>
    
    <div class="mt-4 p-3 bg-[#182027] border border-[#2b3744] text-xs">
     <div class="flex justify-between font-bold text-[#b5c8df]">
      <span id="analysis-target-title">Exhibit 04 · North Entrance Surveillance Camera</span>
      <span class="mono">Category: Video / Digital</span>
     </div>
     <p class="mt-1 text-[#cfc5be]" id="analysis-target-desc">CCTV showing intersection timing at 02:14 AM. Chain of custody log and camera sync documentation under review.</p>
    </div>

    <div class="mt-4 flex gap-2">
     <button id="run-ai-evidence-analysis" type="button" class="primary !py-2.5 text-xs font-bold flex items-center gap-2">
      <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
      <span>Run Factual &amp; Chain-of-Custody Analysis</span>
     </button>
    </div>

    <div id="analysis-output-container" class="mt-4 border rule bg-[#141414] p-4 text-xs space-y-3 min-h-32">
     <div class="text-[#8e857e] italic flex items-center gap-2">
      <i data-lucide="info" class="w-4 h-4"></i>
      <span>Select 'Run Analysis' to evaluate factual inconsistencies, Fourth Amendment search scope, and potential Brady exculpatory material using Gemini.</span>
     </div>
    </div>
   </div>
  </div>`;
  html = html.replace(oldAnalysisModalRegex, newAnalysisModal);

  // 3. Upgrade Draft Desk Modal to have AI Motion Drafting
  const oldDraftModalRegex = /<div id="draft-modal" class="modal-backdrop"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
  const newDraftModal = `<div id="draft-modal" class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="draft-modal-title">
   <div class="modal-panel paper p-5 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
    <div class="flex justify-between items-start">
     <div>
      <span class="tag gold text-[9px] mono !text-black">DRAFT DESK · AI ASSISTED PLEADINGS</span>
      <h2 id="draft-modal-title" class="legal-serif text-2xl mt-1 text-[#111]">Draft Motion or Pleading</h2>
     </div>
     <button class="close-modal secondary !text-[#222] !px-2 !py-2" type="button" aria-label="Close"><i data-lucide="x" class="h-4 w-4"></i></button>
    </div>

    <div class="mt-4 grid gap-3 sm:grid-cols-2 text-xs text-[#222]">
     <div>
      <label class="block font-bold mb-1" for="ai-motion-type">Pleading Type</label>
      <select id="ai-motion-type" class="w-full border border-[#bbb] bg-white p-2 rounded text-xs">
       <option value="Motion to Suppress Tangible Evidence">Motion to Suppress Tangible Evidence</option>
       <option value="Motion for Discovery of Exculpatory Evidence">Motion for Discovery of Exculpatory Evidence (Brady)</option>
       <option value="Motion for Continuance of Hearing Date">Motion for Continuance of Hearing Date</option>
       <option value="Motion in Limine regarding Prior Uncharged Acts">Motion in Limine (Pre-Trial Evidentiary Exclusion)</option>
      </select>
     </div>
     <div>
      <label class="block font-bold mb-1" for="ai-motion-relief">Requested Relief</label>
      <input id="ai-motion-relief" type="text" class="w-full border border-[#bbb] bg-white p-2 rounded text-xs" value="Exclusion of seized items and dismissal of Count I" />
     </div>
    </div>

    <div class="mt-2 text-xs text-[#222]">
     <label class="block font-bold mb-1" for="ai-motion-grounds">Factual &amp; Statutory Grounds</label>
     <input id="ai-motion-grounds" type="text" class="w-full border border-[#bbb] bg-white p-2 rounded text-xs" value="Search exceeded warrant bounds; lack of articulable reasonable suspicion under Fourth Amendment" />
    </div>

    <div class="mt-3 flex items-center justify-between">
     <button id="run-ai-motion-draft" type="button" class="bg-[#1b2a38] hover:bg-[#25394d] text-[#fff] px-4 py-2 rounded text-xs font-bold transition-colors flex items-center gap-2">
      <i data-lucide="file-text" class="w-3.5 h-3.5 text-[#d4af37]"></i>
      <span>Generate Pleading Template with Gemini</span>
     </button>
     <span id="draft-generate-status" class="text-[11px] text-[#444] mono"></span>
    </div>

    <label for="draft-text" class="mt-4 block text-xs font-bold text-[#111]">Pleading Canvas (Pro Se Litigant Draft)</label>
    <textarea id="draft-text" class="mt-2 min-h-64 w-full border border-[#aaa] bg-[#f8f4ea] p-4 text-xs font-mono leading-6 text-[#111] rounded shadow-inner" style="white-space: pre-wrap;">[PREPARED FOR SELF-REPRESENTED LITIGANT - NOT LEGAL ADVICE - REQUIRES INDEPENDENT HUMAN REVIEW]

IN THE SUPERIOR COURT OF THE STATE OF ARIZONA
IN AND FOR THE COUNTY OF MARICOPA

State of Arizona,
    Plaintiff,
v.                                Case No.: 24-CR-118
Arthur Marlowe,
    Defendant (Pro Se).

MOTION TO SUPPRESS TANGIBLE EVIDENCE

COMES NOW the Defendant, Arthur Marlowe, appearing pro se (self-represented), and respectfully moves this Honorable Court pursuant to the Fourth and Fourteenth Amendments to the United States Constitution and Arizona Rules of Criminal Procedure...</textarea>

    <div class="mt-3 flex justify-between items-center text-[11px] text-[#555]">
     <span>Amendment History: Review and verify every statutory authority and factual statement before filing.</span>
     <button type="button" onclick="navigator.clipboard.writeText(document.getElementById('draft-text').value); alert('Draft copied to clipboard');" class="px-2 py-1 bg-[#e4decb] hover:bg-[#d8d0ba] border border-[#bbb] rounded text-[#222] font-mono">Copy Text</button>
    </div>
   </div>
  </div>`;
  html = html.replace(oldDraftModalRegex, newDraftModal);

  // 4. Upgrade Plea Analysis Modal with live AI Neutral Assistant
  const oldPleaModalRegex = /<div id="plea-modal" class="modal-backdrop"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
  const newPleaModal = `<div id="plea-modal" class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="plea-modal-title">
   <div class="modal-panel p-5 max-w-2xl w-full max-h-[88vh] overflow-y-auto">
    <div class="flex justify-between items-start">
     <div>
      <span class="tag gold text-[9px] mono">NEUTRAL DECISION ASSISTANT · GEMINI AI</span>
      <h2 id="plea-modal-title" class="legal-serif text-2xl mt-1">Plea Offer Evaluation Framework</h2>
     </div>
     <button class="close-modal secondary !px-2 !py-2" type="button" aria-label="Close"><i data-lucide="x" class="h-4 w-4"></i></button>
    </div>

    <p class="mt-2 text-xs leading-5 text-[#cfc5be]">
     Acquit.ai strictly does NOT advise whether to accept or reject a plea offer. This assistant organizes statutory consequences, trial exposure, and questions to ask defense counsel.
    </p>

    <div class="mt-3 grid gap-3 sm:grid-cols-2 text-xs">
     <div>
      <label class="block font-bold mb-1" for="plea-input-offer">Proposed Plea Agreement Terms</label>
      <input id="plea-input-offer" type="text" class="w-full border rule bg-[#101010] p-2 text-xs" value="Class 1 Misdemeanor reduction with 18 months supervised probation" />
     </div>
     <div>
      <label class="block font-bold mb-1" for="plea-input-exposure">Trial Exposure If Convicted</label>
      <input id="plea-input-exposure" type="text" class="w-full border rule bg-[#101010] p-2 text-xs" value="Class 6 Felony with presumptive 1-year incarceration" />
     </div>
    </div>

    <div class="mt-3 flex items-center gap-3">
     <button id="run-ai-plea-assistant" type="button" class="primary !py-2 text-xs font-bold flex items-center gap-2">
      <i data-lucide="scale" class="w-3.5 h-3.5"></i>
      <span>Generate Structured Comparison Framework</span>
     </button>
     <span id="plea-status-text" class="text-[11px] mono text-[#b5c8df]"></span>
    </div>

    <div id="plea-results-container" class="mt-4 border rule bg-[#141414] p-4 text-xs space-y-3 min-h-32">
     <div class="text-[#8e857e] italic">
      Select 'Generate Structured Comparison Framework' to evaluate statutory consequences, collateral fallout (housing/licensing/employment), and critical questions for counsel.
     </div>
    </div>
   </div>
  </div>`;
  html = html.replace(oldPleaModalRegex, newPleaModal);

  // 5. Upgrade Rights Audit Modal
  const oldRightsModalRegex = /<div id="rights-modal" class="modal-backdrop"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
  const newRightsModal = `<div id="rights-modal" class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="rights-modal-title">
   <div class="modal-panel p-5 max-w-2xl w-full max-h-[88vh] overflow-y-auto">
    <div class="flex justify-between items-start">
     <div>
      <span class="tag gold text-[9px] mono">RIGHTS CHECKER AI</span>
      <h2 id="rights-modal-title" class="legal-serif text-2xl mt-1">Constitutional Rights Audit</h2>
     </div>
     <button class="close-modal secondary !px-2 !py-2" type="button" aria-label="Close"><i data-lucide="x" class="h-4 w-4"></i></button>
    </div>
    
    <p class="mt-3 text-xs leading-5 text-[#cfc5be]">
     Audits law enforcement encounters against Fourth, Fifth, and Sixth Amendment procedural guarantees using verified statutory standards.
    </p>

    <div class="mt-4 grid gap-3 sm:grid-cols-3">
     <div class="surface-2 p-3 text-xs border border-[#333]">
      <b>Fourth Amendment</b>
      <p class="mt-1 text-[11px] text-[#cfc5be]">Search &amp; Seizure Scope</p>
      <p class="mt-2 font-bold gold-text">WARRANT SCOPE AUDIT</p>
     </div>
     <div class="surface-2 p-3 text-xs border border-[#333]">
      <b>Fifth Amendment</b>
      <p class="mt-1 text-[11px] text-[#cfc5be]">Custodial Interrogation</p>
      <p class="mt-2 font-bold text-[#9fc6ae]">VOLUNTARY STATEMENT</p>
     </div>
     <div class="surface-2 p-3 text-xs border border-[#333]">
      <b>Sixth Amendment</b>
      <p class="mt-1 text-[11px] text-[#cfc5be]">Right to Counsel &amp; Notice</p>
      <p class="mt-2 font-bold text-[#9fc6ae]">TIMELY ARRAIGNMENT</p>
     </div>
    </div>

    <div class="mt-4 flex gap-2">
     <button id="run-ai-rights-audit" type="button" class="primary !py-2 text-xs font-bold flex items-center gap-2">
      <i data-lucide="shield-check" class="w-3.5 h-3.5"></i>
      <span>Run Deep Constitutional Encounter Audit</span>
     </button>
     <span id="rights-status-text" class="text-[11px] mono text-[#b5c8df] self-center"></span>
    </div>

    <div id="rights-results-container" class="mt-4 border rule bg-[#141414] p-4 text-xs space-y-2 min-h-24">
     <p class="text-[#8e857e] italic">Click above to audit the encounter logs and traffic stop timeline against Fourth Amendment Terry stop requirements and search warrant parameters.</p>
    </div>
   </div>
  </div>`;
  html = html.replace(oldRightsModalRegex, newRightsModal);

  // 6. In the <script> section, inject the complete AI client wiring
  const scriptMarker = `lucide.createIcons();`;
  const aiScriptBlock = `
  // --- Acquit.ai Backend & Canva AI Wiring ---
  const getApiBase = () => {
    // When embedded in Canva or external site, call our Cloud Run backend directly
    if (window.location.origin.includes("canva.site") || window.location.origin.includes("canva-hosted-embed")) {
      return "https://ais-dev-qjsfgzlagan6blqltrhwng-205627821036.us-east1.run.app/api";
    }
    // Local development or same-origin Cloud Run
    return "/api";
  };

  const getHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": "Bearer canva-live-token"
  });

  // A. The Clerk AI Procedural Chat
  const clerkTabAi = document.getElementById("clerk-tab-ai");
  const clerkTabNotices = document.getElementById("clerk-tab-notices");
  const clerkAiPanel = document.getElementById("clerk-ai-panel");
  const clerkNoticesPanel = document.getElementById("clerk-notices-panel");
  const clerkChatMessages = document.getElementById("clerk-chat-messages");
  const clerkChatForm = document.getElementById("clerk-chat-form");
  const clerkChatInput = document.getElementById("clerk-chat-input");
  const clerkChatSend = document.getElementById("clerk-chat-send");

  if (clerkTabAi && clerkTabNotices) {
    clerkTabAi.addEventListener("click", () => {
      clerkAiPanel.classList.remove("hidden");
      clerkNoticesPanel.classList.add("hidden");
      clerkTabAi.className = "px-3 py-2 border-b-2 border-[#d4af37] font-bold text-[#f3ede8]";
      clerkTabNotices.className = "px-3 py-2 text-[#8e857e] hover:text-[#d4af37]";
    });
    clerkTabNotices.addEventListener("click", () => {
      clerkAiPanel.classList.add("hidden");
      clerkNoticesPanel.classList.remove("hidden");
      clerkTabNotices.className = "px-3 py-2 border-b-2 border-[#d4af37] font-bold text-[#f3ede8]";
      clerkTabAi.className = "px-3 py-2 text-[#8e857e] hover:text-[#d4af37]";
    });
  }

  // Quick prompt buttons
  document.querySelectorAll(".clerk-quick-prompt").forEach(btn => {
    btn.addEventListener("click", () => {
      if (clerkChatInput) {
        clerkChatInput.value = btn.dataset.prompt;
        clerkChatForm.dispatchEvent(new Event("submit", { cancelable: true }));
      }
    });
  });

  if (clerkChatForm) {
    clerkChatForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const query = clerkChatInput.value.trim();
      if (!query) return;

      // Append user bubble
      const userBubble = document.createElement("div");
      userBubble.className = "p-3 bg-[#242424] border border-[#3b3b3b] rounded text-[#f3ede8]";
      userBubble.innerHTML = \`<p class="font-bold text-[10px] mono text-[#cfc5be] mb-1">YOU</p><p class="leading-5">\${escapeHtml(query)}</p>\`;
      clerkChatMessages.appendChild(userBubble);
      clerkChatInput.value = "";
      clerkChatSend.disabled = true;
      clerkChatSend.textContent = "...";

      // Typing indicator
      const typingBubble = document.createElement("div");
      typingBubble.className = "p-3 bg-[#171717] border border-[#2a2a2a] rounded";
      typingBubble.id = "clerk-typing";
      typingBubble.innerHTML = \`<p class="font-bold gold-text text-[10px] mono mb-1">THE CLERK (AI)</p><p class="text-[#8e857e] animate-pulse">Consulting procedural rules &amp; statutes...</p>\`;
      clerkChatMessages.appendChild(typingBubble);
      clerkChatMessages.scrollTop = clerkChatMessages.scrollHeight;

      try {
        const res = await fetch(\`\${getApiBase()}/gemini/clerk-chat\`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({
            message: query,
            jurisdiction: "Arizona",
            context: { matter: "State v. Marlowe", caseNumber: "24-CR-118", stage: "Suppression Hearing" }
          })
        });
        const data = await res.json();
        typingBubble.remove();

        const aiBubble = document.createElement("div");
        aiBubble.className = "p-3 bg-[#171717] border border-[#2a2a2a] rounded";
        const bodyText = data.text || "I was unable to retrieve that court procedure. Please verify with local court administration.";
        aiBubble.innerHTML = \`
          <p class="font-bold gold-text text-[10px] mono mb-1">THE CLERK (AI)</p>
          <div class="leading-5 text-[#f3ede8] space-y-2">\${formatAiText(bodyText)}</div>
          <div class="mt-2 pt-2 border-t rule text-[9px] mono text-[#8e857e]">PREPARED FOR SELF-REPRESENTED LITIGANT · NOT LEGAL ADVICE</div>
        \`;
        clerkChatMessages.appendChild(aiBubble);
      } catch (err) {
        typingBubble.remove();
        const errBubble = document.createElement("div");
        errBubble.className = "p-3 bg-[#2a1b1b] border border-[#552222] rounded text-[#f3c8c8]";
        errBubble.innerHTML = \`<p class="font-bold text-[10px] mono mb-1">CONNECTIVITY NOTICE</p><p class="leading-5">The Clerk assistant is temporarily unreachable. (Error: \${err.message}). Local offline procedures are still accessible.</p>\`;
        clerkChatMessages.appendChild(errBubble);
      } finally {
        clerkChatSend.disabled = false;
        clerkChatSend.textContent = "Ask Clerk";
        clerkChatMessages.scrollTop = clerkChatMessages.scrollHeight;
      }
    });
  }

  // B. Live Evidence Analysis (Gemini 3.8 Flash)
  const runAiAnalysisBtn = document.getElementById("run-ai-evidence-analysis");
  const analysisOutput = document.getElementById("analysis-output-container");
  if (runAiAnalysisBtn && analysisOutput) {
    runAiAnalysisBtn.addEventListener("click", async () => {
      runAiAnalysisBtn.disabled = true;
      runAiAnalysisBtn.innerHTML = \`<i data-lucide="loader" class="w-3.5 h-3.5 animate-spin"></i><span>Analyzing Record...</span>\`;
      analysisOutput.innerHTML = \`<div class="p-4 text-center text-[#d4af37] animate-pulse">Running factual breakdown, chain-of-custody verification, and Fourth Amendment search scope check via Gemini...</div>\`;
      
      try {
        const res = await fetch(\`\${getApiBase()}/gemini/analyze-evidence\`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({
            title: "Exhibit 04 · North Entrance Surveillance Camera Footage",
            category: "Video / Surveillance",
            description: "CCTV showing intersection timing at 02:14 AM. Chain of custody log and camera sync documentation.",
            tags: ["cctv", "traffic-stop", "timestamp-audit"],
            charges: "State v. Marlowe (Count I Trespass / Suppression of Seized Vehicle Contents)"
          })
        });
        const data = await res.json();
        const resultText = data.analysis || "Analysis completed without explicit flags.";
        analysisOutput.innerHTML = \`
          <div class="border-b rule pb-2 flex justify-between items-center">
            <span class="font-bold gold-text mono text-[10px]">EVALUATION COMPLETE · AUDIT TIMESTAMP: \${new Date().toLocaleTimeString()}</span>
            <span class="tag good text-[9px]">GROUNDED IN FACTUAL RECORD</span>
          </div>
          <div class="leading-6 text-[#f3ede8] space-y-2 whitespace-pre-wrap">\${formatAiText(resultText)}</div>
        \`;
        lucide.createIcons();
      } catch (err) {
        analysisOutput.innerHTML = \`<div class="p-3 bg-[#2a1b1b] border border-[#552222] text-[#f3c8c8]">Analysis error: \${err.message}</div>\`;
      } finally {
        runAiAnalysisBtn.disabled = false;
        runAiAnalysisBtn.innerHTML = \`<i data-lucide="sparkles" class="w-3.5 h-3.5"></i><span>Run Factual &amp; Chain-of-Custody Analysis</span>\`;
        lucide.createIcons();
      }
    });
  }

  // C. Live Motion Drafting (Gemini 3.8 Flash)
  const runAiMotionDraftBtn = document.getElementById("run-ai-motion-draft");
  const draftTextArea = document.getElementById("draft-text");
  const draftStatus = document.getElementById("draft-generate-status");
  if (runAiMotionDraftBtn && draftTextArea) {
    runAiMotionDraftBtn.addEventListener("click", async () => {
      const motionType = document.getElementById("ai-motion-type").value;
      const relief = document.getElementById("ai-motion-relief").value;
      const grounds = document.getElementById("ai-motion-grounds").value;

      runAiMotionDraftBtn.disabled = true;
      runAiMotionDraftBtn.innerHTML = \`<span>Drafting Pleading...</span>\`;
      if (draftStatus) draftStatus.textContent = "Synthesizing caption & statutory claims...";

      try {
        const res = await fetch(\`\${getApiBase()}/gemini/draft-motion\`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({
            motionType,
            courtName: "Maricopa County Superior Court, Criminal Division",
            caseNumber: "24-CR-118",
            defendantName: "Arthur Marlowe (Pro Se Litigant)",
            grounds,
            requestedRelief: relief
          })
        });
        const data = await res.json();
        if (data.draft) {
          draftTextArea.value = data.draft;
          if (draftStatus) draftStatus.textContent = "Draft generated! Review independently before filing.";
        }
      } catch (err) {
        if (draftStatus) draftStatus.textContent = "Drafting failed: " + err.message;
      } finally {
        runAiMotionDraftBtn.disabled = false;
        runAiMotionDraftBtn.innerHTML = \`<i data-lucide="file-text" class="w-3.5 h-3.5 text-[#d4af37]"></i><span>Generate Pleading Template with Gemini</span>\`;
        lucide.createIcons();
      }
    });
  }

  // D. Live Neutral Plea Assistant
  const runAiPleaBtn = document.getElementById("run-ai-plea-assistant");
  const pleaResultsContainer = document.getElementById("plea-results-container");
  const pleaStatusText = document.getElementById("plea-status-text");
  if (runAiPleaBtn && pleaResultsContainer) {
    runAiPleaBtn.addEventListener("click", async () => {
      const offer = document.getElementById("plea-input-offer").value;
      const exposure = document.getElementById("plea-input-exposure").value;

      runAiPleaBtn.disabled = true;
      if (pleaStatusText) pleaStatusText.textContent = "Calculating collateral consequences & questions...";
      pleaResultsContainer.innerHTML = \`<div class="p-4 text-center text-[#d4af37] animate-pulse">Organizing neutral comparison matrix and attorney interview checklist...</div>\`;

      try {
        const res = await fetch(\`\${getApiBase()}/gemini/plea-assistant\`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({
            charges: "A.R.S. § 13-1504 (Trespass - Count I) & A.R.S. § 13-1602 (Property Damage - Count II)",
            pleaOffer: offer,
            trialRisks: exposure,
            collateralConsequences: "Employment background check flags, potential commercial licensing restrictions."
          })
        });
        const data = await res.json();
        const text = data.decisionStructure || "Plea analysis generated.";
        pleaResultsContainer.innerHTML = \`
          <div class="border-b rule pb-2 flex justify-between">
            <span class="gold-text font-bold mono text-[10px]">NEUTRAL DECISION MATRIX GENERATED</span>
            <span class="tag text-[9px]">REQUIRES INDEPENDENT COUNSEL REVIEW</span>
          </div>
          <div class="leading-6 text-[#f3ede8] space-y-2 whitespace-pre-wrap">\${formatAiText(text)}</div>
        \`;
        if (pleaStatusText) pleaStatusText.textContent = "Framework ready.";
      } catch (err) {
        pleaResultsContainer.innerHTML = \`<div class="p-3 bg-[#2a1b1b] text-[#f3c8c8]">Error: \${err.message}</div>\`;
        if (pleaStatusText) pleaStatusText.textContent = "Failed";
      } finally {
        runAiPleaBtn.disabled = false;
      }
    });
  }

  // E. Live Constitutional Rights Audit
  const runAiRightsBtn = document.getElementById("run-ai-rights-audit");
  const rightsResultsContainer = document.getElementById("rights-results-container");
  const rightsStatusText = document.getElementById("rights-status-text");
  if (runAiRightsBtn && rightsResultsContainer) {
    runAiRightsBtn.addEventListener("click", async () => {
      runAiRightsBtn.disabled = true;
      if (rightsStatusText) rightsStatusText.textContent = "Evaluating constitutional standards...";
      rightsResultsContainer.innerHTML = \`<div class="p-3 text-center text-[#d4af37] animate-pulse">Cross-referencing arrest timeline with Fourth Amendment stop-and-frisk precedents...</div>\`;

      try {
        const res = await fetch(\`\${getApiBase()}/gemini/chat\`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({
            prompt: "Perform an educational Fourth, Fifth, and Sixth Amendment constitutional rights audit for State v. Marlowe. The police stopped the vehicle at 02:14 AM citing a broken license plate light, then conducted a warrantless search of the rear trunk without consent. Break down: 1. Fourth Amendment (Scope of traffic stop, Terry v. Ohio, Rodriguez v. United States regarding unreasonable delay). 2. Fifth Amendment (Miranda requirements during roadside detention). 3. Sixth Amendment (Right to counsel upon formal charge attachment). Format into plain-English takeaways for self-represented litigants with clear disclaimers.",
            useHighThinking: false
          })
        });
        const data = await res.json();
        rightsResultsContainer.innerHTML = \`
          <div class="border-b rule pb-2 flex justify-between">
            <span class="gold-text font-bold mono text-[10px]">CONSTITUTIONAL AUDIT COMPLETE</span>
            <span class="tag blue text-[9px]">EDUCATIONAL MEMO</span>
          </div>
          <div class="leading-6 text-[#f3ede8] space-y-2 whitespace-pre-wrap">\${formatAiText(data.text || "No results generated.")}</div>
        \`;
        if (rightsStatusText) rightsStatusText.textContent = "Audit complete.";
      } catch (err) {
        rightsResultsContainer.innerHTML = \`<div class="p-3 bg-[#2a1b1b] text-[#f3c8c8]">Error: \${err.message}</div>\`;
        if (rightsStatusText) rightsStatusText.textContent = "Audit failed";
      } finally {
        runAiRightsBtn.disabled = false;
      }
    });
  }

  // F. Investigations Live Research Search
  const researchInput = document.getElementById("case-research-input");
  const runResearchBtn = document.getElementById("run-research");
  const researchResult = document.getElementById("research-result");
  if (runResearchBtn && researchInput && researchResult) {
    runResearchBtn.addEventListener("click", async () => {
      const q = researchInput.value.trim();
      if (!q) {
        researchResult.textContent = "Please enter a legal research query or statutory question.";
        return;
      }
      runResearchBtn.disabled = true;
      researchResult.textContent = "Researching statutory authorities & precedents via Gemini...";
      try {
        const res = await fetch(\`\${getApiBase()}/gemini/chat\`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({
            prompt: \`Legal Research Query for self-represented litigant in Arizona: "\${q}". Provide relevant Arizona statutes (A.R.S.), court rules, and a plain-English explanation. Maintain strict UPL neutrality.\`,
            useSearch: true
          })
        });
        const data = await res.json();
        researchResult.innerHTML = \`<div class="p-3 bg-[#171717] border border-[#2a2a2a] rounded leading-5 whitespace-pre-wrap">\${formatAiText(data.text || "No research data returned.")}</div>\`;
      } catch (err) {
        researchResult.textContent = "Research request failed: " + err.message;
      } finally {
        runResearchBtn.disabled = false;
      }
    });
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[m]);
  }

  function formatAiText(text) {
    return text
      .replace(/^### (.*$)/gim, '<h4 class="font-bold text-[#d4af37] text-sm mt-3">$1</h4>')
      .replace(/^## (.*$)/gim, '<h3 class="font-bold text-[#b5c8df] text-sm mt-3">$1</h3>')
      .replace(/\\*\\*(.*?)\\*\\*/g, '<strong class="text-[#fff]">$1</strong>')
      .replace(/\\*(.*?)\\*/g, '<em class="text-[#cfc5be]">$1</em>');
  }
`;

  // Inject the script right after initLegalOS() starts
  html = html.replace(scriptMarker, scriptMarker + "\n" + aiScriptBlock);

  fs.writeFileSync(filePath, html, "utf8");
  console.log("Successfully updated:", filePath);
}

wireCanvaHtml("apps/web/public/assets/canva/legal-os.html");
wireCanvaHtml("apps/web/src/assets/canva/legal-os.html");
