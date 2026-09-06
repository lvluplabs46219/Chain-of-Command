import React from 'react';

export function CaseWorkspace() {
  return (
    <div className="flex flex-col h-screen overflow-hidden text-body-md font-body-md antialiased selection:bg-secondary selection:text-on-secondary bg-surface text-on-surface">
      

<header className="bg-surface-container-low dark:bg-surface-container-low border-b border-outline-variant w-full shrink-0 z-50">
<div className="flex justify-between items-center w-full px-gutter h-16">
<div className="flex items-center gap-lg">
<div className="text-headline-md font-headline-md font-bold text-on-surface dark:text-on-surface tracking-tight">Acquit.ai</div>
<nav className="hidden md:flex gap-sm">
<button className="text-on-surface-variant px-sm py-xs hover:bg-surface-variant hover:text-on-surface rounded text-data-mono font-data-mono transition-colors">File</button>
<button className="text-on-surface-variant px-sm py-xs hover:bg-surface-variant hover:text-on-surface rounded text-data-mono font-data-mono transition-colors">Edit</button>
<button className="text-on-surface-variant px-sm py-xs hover:bg-surface-variant hover:text-on-surface rounded text-data-mono font-data-mono transition-colors">View</button>
<button className="text-on-surface-variant px-sm py-xs hover:bg-surface-variant hover:text-on-surface rounded text-data-mono font-data-mono transition-colors">Matter</button>
<button className="text-on-surface-variant px-sm py-xs hover:bg-surface-variant hover:text-on-surface rounded text-data-mono font-data-mono transition-colors">Account</button>
</nav>
</div>
<div className="flex items-center gap-sm">

<div className="relative hidden lg:block mr-sm">
<span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
<input className="bg-surface-container border border-outline-variant text-on-surface pl-[32px] pr-sm py-[4px] rounded text-data-mono font-data-mono w-48 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all placeholder:text-on-surface-variant" placeholder="Search Matter..." type="text" />
</div>
<button className="text-primary dark:text-primary p-xs rounded hover:bg-surface-variant hover:text-on-surface transition-colors">
<span className="material-symbols-outlined">notifications</span>
</button>
<button className="text-primary dark:text-primary p-xs rounded hover:bg-surface-variant hover:text-on-surface transition-colors">
<span className="material-symbols-outlined">settings</span>
</button>
<button className="text-primary dark:text-primary p-xs rounded hover:bg-surface-variant hover:text-on-surface transition-colors">
<span className="material-symbols-outlined">account_circle</span>
</button>
</div>
</div>
</header>
<div className="flex flex-1 overflow-hidden">

<aside className="hidden md:flex bg-surface-container dark:bg-surface-container border-r border-outline-variant w-[280px] shrink-0 flex-col justify-between z-40 transition-all duration-200 ease-in-out">
<div className="flex flex-col">

<div className="p-gutter border-b border-outline-variant flex items-center gap-md">
<div className="w-10 h-10 rounded bg-surface-variant flex items-center justify-center border border-outline-variant">
<span className="material-symbols-outlined text-on-surface-variant">balance</span>
</div>
<div>
<div className="text-label-caps font-label-caps tracking-widest text-on-surface uppercase">Legal OS</div>
<div className="text-data-mono font-data-mono text-on-surface-variant text-[12px]">Matter 2024-772B</div>
</div>
</div>

<div className="p-sm border-b border-outline-variant">
<button className="w-full bg-surface-variant text-on-surface hover:bg-surface-container-high border border-outline-variant rounded py-sm px-md flex items-center justify-center gap-sm transition-all duration-200 group">
<span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">add</span>
<span className="text-label-caps font-label-caps tracking-widest uppercase">Court Watch</span>
</button>
</div>

<nav className="flex flex-col py-sm">
<a className="flex items-center gap-md px-gutter py-sm text-on-surface border-l-4 border-secondary bg-surface-variant font-bold transition-all duration-200" href="#">
<span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
<span className="text-label-caps font-label-caps tracking-widest uppercase">Command Center</span>
</a>
<a className="flex items-center gap-md px-gutter py-sm text-on-surface-variant font-medium hover:bg-surface-container-high hover:text-on-surface border-l-4 border-transparent transition-all duration-200" href="#">
<span className="material-symbols-outlined">gavel</span>
<span className="text-label-caps font-label-caps tracking-widest uppercase">The Docket</span>
</a>
<a className="flex items-center gap-md px-gutter py-sm text-on-surface-variant font-medium hover:bg-surface-container-high hover:text-on-surface border-l-4 border-transparent transition-all duration-200" href="#">
<span className="material-symbols-outlined">groups</span>
<span className="text-label-caps font-label-caps tracking-widest uppercase">Chambers</span>
</a>
<a className="flex items-center gap-md px-gutter py-sm text-on-surface-variant font-medium hover:bg-surface-container-high hover:text-on-surface border-l-4 border-transparent transition-all duration-200" href="#">
<span className="material-symbols-outlined">menu_book</span>
<span className="text-label-caps font-label-caps tracking-widest uppercase">Law Library</span>
</a>
<a className="flex items-center gap-md px-gutter py-sm text-on-surface-variant font-medium hover:bg-surface-container-high hover:text-on-surface border-l-4 border-transparent transition-all duration-200" href="#">
<span className="material-symbols-outlined">folder_shared</span>
<span className="text-label-caps font-label-caps tracking-widest uppercase">Record Room</span>
</a>
</nav>
</div>

<div className="border-t border-outline-variant p-sm flex flex-col gap-xs">
<a className="flex items-center gap-md px-sm py-sm text-on-surface-variant font-medium hover:bg-surface-container-high hover:text-on-surface rounded transition-all duration-200" href="#">
<span className="material-symbols-outlined text-[18px]">help</span>
<span className="text-label-caps font-label-caps tracking-widest uppercase">Support</span>
</a>
<a className="flex items-center gap-md px-sm py-sm text-on-surface-variant font-medium hover:bg-surface-container-high hover:text-on-surface rounded transition-all duration-200" href="#">
<span className="material-symbols-outlined text-[18px]">archive</span>
<span className="text-label-caps font-label-caps tracking-widest uppercase">Archive</span>
</a>
</div>
</aside>

<main className="flex-1 overflow-y-auto bg-surface flex flex-col relative pb-xl">

<div className="bg-error-container text-on-error-container px-gutter py-sm flex items-center justify-between border-b border-error/30 shrink-0">
<div className="flex items-center gap-md">
<span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
<div>
<span className="text-label-caps font-label-caps uppercase font-bold tracking-widest mr-sm">Deadline Alert:</span>
<span className="text-data-mono font-data-mono text-[13px]">Motion to Dismiss response due in 48 hours (Oct 24, 17:00 EST).</span>
</div>
</div>
<button className="text-on-error-container hover:text-error transition-colors">
<span className="material-symbols-outlined text-[18px]">close</span>
</button>
</div>
<div className="p-lg max-w-[1400px] w-full mx-auto flex flex-col gap-lg flex-1">

<section className="bg-surface-container border border-outline-variant p-lg rounded flex flex-col gap-sm relative overflow-hidden group">
<div className="absolute top-0 right-0 p-md opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
<span className="material-symbols-outlined text-[120px]">account_balance</span>
</div>
<div className="flex items-start justify-between relative z-10">
<div className="flex flex-col gap-xs">
<div className="flex items-center gap-sm mb-xs">
<span className="bg-secondary/10 text-secondary border border-secondary/30 px-sm py-[2px] rounded text-data-mono font-data-mono text-[11px] flex items-center gap-xs">
<span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                                    ACTIVE
                                </span>
<span className="text-data-mono font-data-mono text-on-surface-variant text-[13px]">#2024-CR-04821</span>
</div>
<h1 className="text-display-case font-display-case text-on-surface m-0 leading-none">State v. Doe</h1>
<p className="text-data-mono font-data-mono text-on-surface-variant mt-sm">Superior Court of California, County of San Francisco</p>
</div>
<div className="flex flex-col items-end gap-sm">
<button className="bg-secondary text-on-secondary px-md py-sm rounded text-label-caps font-label-caps tracking-widest uppercase hover:bg-secondary-fixed transition-colors font-bold shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)]">
                                View Full Dossier
                            </button>
</div>
</div>
</section>

<section className="grid grid-cols-2 lg:grid-cols-4 gap-md">

<div className="bg-surface-container border border-outline-variant p-md rounded flex flex-col gap-sm hover:bg-surface-container-high transition-colors cursor-pointer">
<div className="flex justify-between items-center text-on-surface-variant">
<span className="text-label-caps font-label-caps uppercase tracking-widest">Charges</span>
<span className="material-symbols-outlined text-[18px]">gavel</span>
</div>
<div className="text-headline-lg font-headline-lg text-on-surface">2</div>
<div className="text-data-mono font-data-mono text-error text-[12px]">Felony level</div>
</div>

<div className="bg-surface-container border border-outline-variant p-md rounded flex flex-col gap-sm hover:bg-surface-container-high transition-colors cursor-pointer hard-shadow-active border-secondary/50">
<div className="flex justify-between items-center text-secondary">
<span className="text-label-caps font-label-caps uppercase tracking-widest">Hearing</span>
<span className="material-symbols-outlined text-[18px]">calendar_today</span>
</div>
<div className="text-headline-lg font-headline-lg text-on-surface">14d</div>
<div className="text-data-mono font-data-mono text-on-surface-variant text-[12px]">Pre-trial Conf.</div>
</div>

<div className="bg-surface-container border border-outline-variant p-md rounded flex flex-col gap-sm hover:bg-surface-container-high transition-colors cursor-pointer">
<div className="flex justify-between items-center text-on-surface-variant">
<span className="text-label-caps font-label-caps uppercase tracking-widest">Records</span>
<span className="material-symbols-outlined text-[18px]">folder_copy</span>
</div>
<div className="text-headline-lg font-headline-lg text-on-surface">23</div>
<div className="text-data-mono font-data-mono text-secondary text-[12px]">+3 this week</div>
</div>

<div className="bg-surface-container border border-outline-variant p-md rounded flex flex-col gap-sm hover:bg-surface-container-high transition-colors cursor-pointer">
<div className="flex justify-between items-center text-on-surface-variant">
<span className="text-label-caps font-label-caps uppercase tracking-widest">Tasks</span>
<span className="material-symbols-outlined text-[18px]">checklist</span>
</div>
<div className="text-headline-lg font-headline-lg text-on-surface">7</div>
<div className="text-data-mono font-data-mono text-error text-[12px]">2 overdue</div>
</div>
</section>

<div className="grid grid-cols-1 lg:grid-cols-12 gap-lg flex-1 min-h-0">

<section className="lg:col-span-7 flex flex-col bg-surface-container border border-outline-variant rounded overflow-hidden">
<div className="bg-surface-container-high px-md py-sm border-b border-outline-variant flex justify-between items-center">
<h2 className="text-label-caps font-label-caps tracking-widest uppercase text-on-surface">Chronology Rail</h2>
<button className="text-on-surface-variant hover:text-on-surface text-data-mono font-data-mono text-[12px] flex items-center gap-xs">
<span className="material-symbols-outlined text-[14px]">filter_list</span> Filter
                            </button>
</div>
<div className="p-md flex-1 overflow-y-auto scrollbar-hide relative">

<div className="absolute left-[27px] top-md bottom-md w-[2px] bg-outline-variant/30"></div>
<div className="flex flex-col gap-lg relative z-10">

<div className="flex gap-md group">
<div className="w-6 h-6 rounded-full bg-surface border-2 border-secondary flex items-center justify-center shrink-0 mt-1 shadow-[0_0_8px_rgba(181,200,223,0.5)] z-10">
<div className="w-2 h-2 rounded-full bg-secondary"></div>
</div>
<div className="flex-1 bg-surface-variant/30 border border-outline-variant/50 p-sm rounded group-hover:border-secondary/50 transition-colors">
<div className="flex justify-between items-start mb-xs">
<span className="text-data-mono font-data-mono text-secondary text-[12px]">Today, 09:30 AM</span>
<span className="bg-surface-container-highest text-on-surface-variant px-xs py-[2px] rounded text-[10px] font-data-mono uppercase">Filing</span>
</div>
<div className="text-body-md font-body-md text-on-surface font-medium">Defense filed Motion to Suppress Evidence</div>
<div className="text-data-mono font-data-mono text-on-surface-variant text-[12px] mt-xs flex items-center gap-xs">
<span className="material-symbols-outlined text-[14px]">attach_file</span> doc_442_motion.pdf
                                        </div>
</div>
</div>

<div className="flex gap-md group">
<div className="w-6 h-6 rounded-full bg-surface border-2 border-outline-variant flex items-center justify-center shrink-0 mt-1 z-10"></div>
<div className="flex-1 bg-surface-variant/10 border border-outline-variant/30 p-sm rounded group-hover:border-outline-variant transition-colors opacity-80">
<div className="flex justify-between items-start mb-xs">
<span className="text-data-mono font-data-mono text-on-surface-variant text-[12px]">Oct 20, 14:15 PM</span>
<span className="bg-surface-container-highest text-on-surface-variant px-xs py-[2px] rounded text-[10px] font-data-mono uppercase">Discovery</span>
</div>
<div className="text-body-md font-body-md text-on-surface font-medium">Prosecution provided Batch #3 Discovery</div>
<div className="text-data-mono font-data-mono text-on-surface-variant text-[12px] mt-xs">142 pages indexed by AI Chambers.</div>
</div>
</div>

<div className="flex gap-md group">
<div className="w-6 h-6 rounded-full bg-surface border-2 border-outline-variant flex items-center justify-center shrink-0 mt-1 z-10"></div>
<div className="flex-1 bg-surface-variant/10 border border-outline-variant/30 p-sm rounded group-hover:border-outline-variant transition-colors opacity-80">
<div className="flex justify-between items-start mb-xs">
<span className="text-data-mono font-data-mono text-on-surface-variant text-[12px]">Oct 15, 10:00 AM</span>
<span className="bg-surface-container-highest text-on-surface-variant px-xs py-[2px] rounded text-[10px] font-data-mono uppercase">Hearing</span>
</div>
<div className="text-body-md font-body-md text-on-surface font-medium">Arraignment Hearing Concluded</div>
<div className="text-data-mono font-data-mono text-on-surface-variant text-[12px] mt-xs">Plea entered: Not Guilty. Bail set at $50,000.</div>
</div>
</div>
</div>
</div>
</section>

<section className="lg:col-span-5 flex flex-col bg-surface-container border border-outline-variant rounded overflow-hidden">
<div className="bg-surface-container-high px-md py-sm border-b border-outline-variant flex justify-between items-center">
<h2 className="text-label-caps font-label-caps tracking-widest uppercase text-on-surface flex items-center gap-sm">
<span className="material-symbols-outlined text-[16px]">groups</span> Chambers Roster
                            </h2>
</div>
<div className="p-md flex flex-col gap-sm flex-1 overflow-y-auto">

<div className="border border-outline-variant bg-surface rounded p-sm flex items-start gap-md">
<div className="w-10 h-10 rounded bg-secondary/10 border border-secondary flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-secondary">psychology</span>
</div>
<div className="flex-1 min-w-0">
<div className="flex justify-between items-center mb-xs">
<span className="text-label-caps font-label-caps text-on-surface uppercase">Paralegal AI</span>
<span className="flex items-center gap-xs text-[10px] text-data-mono font-data-mono text-secondary"><span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span> Analyzing</span>
</div>
<p className="text-data-mono font-data-mono text-[12px] text-on-surface-variant truncate">Processing Discovery Batch #3...</p>
<div className="w-full bg-surface-container-highest h-1 mt-sm rounded overflow-hidden">
<div className="bg-secondary h-full w-[65%]"></div>
</div>
</div>
</div>

<div className="border border-outline-variant bg-surface rounded p-sm flex items-start gap-md opacity-70">
<div className="w-10 h-10 rounded bg-surface-variant border border-outline flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-on-surface-variant">edit_document</span>
</div>
<div className="flex-1 min-w-0">
<div className="flex justify-between items-center mb-xs">
<span className="text-label-caps font-label-caps text-on-surface uppercase">Drafting Agent</span>
<span className="flex items-center gap-xs text-[10px] text-data-mono font-data-mono text-on-surface-variant">Idle</span>
</div>
<p className="text-data-mono font-data-mono text-[12px] text-on-surface-variant truncate">Awaiting prompt for next motion.</p>
</div>
</div>

<div className="border border-outline-variant bg-surface rounded p-sm flex items-start gap-md opacity-70">
<div className="w-10 h-10 rounded bg-surface-variant border border-outline flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-on-surface-variant">policy</span>
</div>
<div className="flex-1 min-w-0">
<div className="flex justify-between items-center mb-xs">
<span className="text-label-caps font-label-caps text-on-surface uppercase">Precedent Researcher</span>
<span className="flex items-center gap-xs text-[10px] text-data-mono font-data-mono text-on-surface-variant">Standby</span>
</div>
<p className="text-data-mono font-data-mono text-[12px] text-on-surface-variant truncate">Last run: 4hrs ago (CA Penal Code § 1538.5)</p>
</div>
</div>
</div>
</section>
</div>

<section className="bg-surface-container border border-outline-variant rounded p-sm flex items-center gap-md shrink-0">
<span className="bg-surface-variant px-sm py-[2px] rounded text-label-caps font-label-caps tracking-widest text-on-surface-variant uppercase shrink-0">System Log</span>
<div className="flex-1 overflow-hidden relative h-6">
<div className="absolute inset-0 flex flex-col justify-center text-data-mono font-data-mono text-[12px] text-on-surface-variant truncate animate-[slideUp_4s_ease-in-out_infinite]">
                            [10:42:01] System: Synchronized with Court E-File API.
                        </div>
</div>
</section>
</div>
</main>
</div>



    </div>
  );
}
