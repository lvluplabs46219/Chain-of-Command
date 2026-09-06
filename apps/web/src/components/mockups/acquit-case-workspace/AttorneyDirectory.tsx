import React from 'react';

export function AttorneyDirectory() {
  return (
    <div className="flex flex-col min-h-screen bg-surface">
      

<header className="bg-surface-container-low dark:bg-surface-container-low text-primary dark:text-primary docked full-width top-0 border-b border-outline-variant flat no shadows flex justify-between items-center w-full px-gutter h-16 sticky z-50">
<div className="flex items-center gap-6">
<h1 className="text-headline-md font-headline-md font-bold text-on-surface dark:text-on-surface">Acquit.ai</h1>

<nav className="hidden md:flex items-center gap-4">
<a className="text-on-surface-variant text-body-md font-body-md hover:bg-surface-variant hover:text-on-surface px-3 py-2 rounded-DEFAULT transition-all" href="#">File</a>
<a className="text-on-surface-variant text-body-md font-body-md hover:bg-surface-variant hover:text-on-surface px-3 py-2 rounded-DEFAULT transition-all" href="#">Edit</a>
<a className="text-on-surface-variant text-body-md font-body-md hover:bg-surface-variant hover:text-on-surface px-3 py-2 rounded-DEFAULT transition-all" href="#">View</a>
<a className="text-on-surface-variant text-body-md font-body-md hover:bg-surface-variant hover:text-on-surface px-3 py-2 rounded-DEFAULT transition-all" href="#">Matter</a>
<a className="text-on-surface-variant text-body-md font-body-md hover:bg-surface-variant hover:text-on-surface px-3 py-2 rounded-DEFAULT transition-all" href="#">Account</a>
</nav>
</div>

<div className="flex items-center gap-2">
<button aria-label="notifications" className="p-2 text-on-surface-variant hover:bg-surface-variant hover:text-on-surface rounded-full transition-colors active:scale-95 duration-75">
<span className="material-symbols-outlined">notifications</span>
</button>
<button aria-label="settings" className="p-2 text-on-surface-variant hover:bg-surface-variant hover:text-on-surface rounded-full transition-colors active:scale-95 duration-75">
<span className="material-symbols-outlined">settings</span>
</button>
<button aria-label="account_circle" className="p-2 text-on-surface-variant hover:bg-surface-variant hover:text-on-surface rounded-full transition-colors active:scale-95 duration-75">
<span className="material-symbols-outlined">account_circle</span>
</button>
</div>
</header>
<div className="flex flex-1 relative overflow-hidden">

<aside className="bg-surface-container dark:bg-surface-container text-secondary dark:text-secondary docked left-0 h-screen w-[280px] border-r border-outline-variant flat no shadows fixed left-0 top-16 bottom-0 flex flex-col z-40 hidden md:flex">

<div className="p-6 border-b border-outline-variant">
<div className="flex items-center gap-4 mb-4">
<div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center border border-outline-variant overflow-hidden">
<img alt="Firm Seal" className="w-full h-full object-cover" data-alt="A macro shot of a debossed metallic firm seal on dark charcoal legal paper. The seal is intricate with classic scales of justice, rendered in a brutalist, high-contrast style. Dark mode aesthetic, institutional feel." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzLNiAaIeEKJ9oM6o1zdbZAKAonTHRTX0RuRea2h3lfpzpJYAD8nxnPlXIJL1ycJ-pHqDmZlSFLS2Cs1xrJCoQSrRTEkbJWJP4buPQbS2EbI_jHkhROBBIod7ktIQObNMTRx8sLrqgGvL_uHCRUbXyd3p9Xrlys6ftXbpADkxxxFqqkuz3zxsMM7Lx3QiAzXYxynuaT_0VcuwChbK5fMEyjCMEGdPslgOlJIxDSHJSJ4vNEZIHpqsX7w"/>
</div>
<div>
<h2 className="text-label-caps font-label-caps tracking-widest text-on-surface">Legal OS</h2>
<p className="text-data-mono font-data-mono text-on-surface-variant text-xs mt-1">Matter 2024-772B</p>
</div>
</div>
<button className="w-full py-2 bg-legal-gold text-surface font-data-mono text-data-mono font-bold hover:brightness-110 transition-all border border-legal-gold uppercase tracking-wider" style={{ backgroundColor: "#D4AF37", color: "#141313", borderColor: "#D4AF37" }}>New Filing</button>
</div>

<nav className="flex-1 py-4 flex flex-col gap-1 overflow-y-auto">
<a className="flex items-center gap-4 px-6 py-3 text-on-surface-variant font-medium text-label-caps font-label-caps hover:bg-surface-container-high hover:text-on-surface transition-all duration-200 ease-in-out" href="#">
<span className="material-symbols-outlined text-[20px]">dashboard</span>
<span>Command Center</span>
</a>
<a className="flex items-center gap-4 px-6 py-3 text-on-surface-variant font-medium text-label-caps font-label-caps hover:bg-surface-container-high hover:text-on-surface transition-all duration-200 ease-in-out" href="#">
<span className="material-symbols-outlined text-[20px]">gavel</span>
<span>The Docket</span>
</a>

<a className="flex items-center gap-4 px-6 py-3 text-on-surface border-l-4 border-secondary bg-surface-variant font-bold text-label-caps font-label-caps transition-all duration-200 ease-in-out" href="#">
<span className="material-symbols-outlined text-[20px]">groups</span>
<span>Chambers</span>
</a>
<a className="flex items-center gap-4 px-6 py-3 text-on-surface-variant font-medium text-label-caps font-label-caps hover:bg-surface-container-high hover:text-on-surface transition-all duration-200 ease-in-out" href="#">
<span className="material-symbols-outlined text-[20px]">menu_book</span>
<span>Law Library</span>
</a>
<a className="flex items-center gap-4 px-6 py-3 text-on-surface-variant font-medium text-label-caps font-label-caps hover:bg-surface-container-high hover:text-on-surface transition-all duration-200 ease-in-out" href="#">
<span className="material-symbols-outlined text-[20px]">folder_shared</span>
<span>Record Room</span>
</a>
</nav>

<div className="mt-auto border-t border-outline-variant py-4 flex flex-col gap-1">
<a className="flex items-center gap-4 px-6 py-2 text-on-surface-variant font-medium text-label-caps font-label-caps hover:bg-surface-container-high hover:text-on-surface transition-all duration-200 ease-in-out" href="#">
<span className="material-symbols-outlined text-[18px]">help</span>
<span>Support</span>
</a>
<a className="flex items-center gap-4 px-6 py-2 text-on-surface-variant font-medium text-label-caps font-label-caps hover:bg-surface-container-high hover:text-on-surface transition-all duration-200 ease-in-out" href="#">
<span className="material-symbols-outlined text-[18px]">archive</span>
<span>Archive</span>
</a>
</div>
</aside>

<main className="flex-1 ml-0 md:ml-[280px] p-gutter md:p-lg h-[calc(100vh-64px)] overflow-y-auto flex flex-col md:flex-row gap-lg">

<div className="w-full md:w-1/3 lg:w-1/4 flex flex-col gap-6 shrink-0">

<div>
<h2 className="text-display-case font-display-case text-on-surface mb-2">Counsel Directory</h2>
<p className="text-body-md font-body-md text-on-surface-variant">Identify and engage verified legal professionals across jurisdictions.</p>
</div>

<div className="border border-outline-variant bg-surface-container p-6 flex flex-col gap-4 relative">
<div className="absolute top-0 left-0 w-1 h-full bg-surface-variant"></div>
<h3 className="text-label-caps font-label-caps text-on-surface tracking-widest uppercase border-b border-outline-variant pb-2 mb-2 flex items-center gap-2">
<span className="material-symbols-outlined text-sm">filter_list</span> Narrow Your Search
                    </h3>

<div className="flex flex-col gap-1">
<label className="text-data-mono font-data-mono text-xs text-on-surface-variant uppercase">Name or Firm</label>
<div className="relative">
<span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
<input className="w-full bg-surface-dim border-b border-outline-variant px-8 py-2 text-data-mono font-data-mono text-on-surface focus:outline-none focus:border-on-surface transition-colors placeholder-on-surface-variant/50" placeholder="e.g. Smith &amp; Associates" type="text" />
</div>
</div>

<div className="flex flex-col gap-1">
<label className="text-data-mono font-data-mono text-xs text-on-surface-variant uppercase">Practice Area</label>
<select className="w-full bg-surface-dim border-b border-outline-variant px-2 py-2 text-data-mono font-data-mono text-on-surface focus:outline-none focus:border-on-surface appearance-none cursor-pointer">
<option>All Areas</option>
<option>Corporate Litigation</option>
<option>Intellectual Property</option>
<option>Criminal Defense</option>
<option>Family Law</option>
</select>
</div>

<div className="flex flex-col gap-1">
<label className="text-data-mono font-data-mono text-xs text-on-surface-variant uppercase">Jurisdiction (Bar)</label>
<select className="w-full bg-surface-dim border-b border-outline-variant px-2 py-2 text-data-mono font-data-mono text-on-surface focus:outline-none focus:border-on-surface appearance-none cursor-pointer">
<option>Any State</option>
<option>New York</option>
<option>California</option>
<option>Texas</option>
</select>
</div>

<div className="flex flex-col gap-1">
<label className="text-data-mono font-data-mono text-xs text-on-surface-variant uppercase">Language</label>
<select className="w-full bg-surface-dim border-b border-outline-variant px-2 py-2 text-data-mono font-data-mono text-on-surface focus:outline-none focus:border-on-surface appearance-none cursor-pointer">
<option>English</option>
<option>Spanish</option>
<option>Mandarin</option>
</select>
</div>
<button className="mt-4 w-full py-2 border border-outline-variant text-data-mono font-data-mono text-on-surface hover:bg-surface-variant transition-colors uppercase tracking-wider text-xs">Apply Filters</button>
</div>
</div>

<div className="flex-1 flex flex-col gap-6">

<div className="border border-outline-variant bg-surface-container-high p-4 flex items-start gap-4">
<span className="material-symbols-outlined text-on-surface-variant mt-1">info</span>
<div>
<h4 className="text-data-mono font-data-mono text-on-surface font-bold uppercase mb-1">Directory Notice</h4>
<p className="text-body-md font-body-md text-on-surface-variant text-sm">This index is provided as a raw directory for informational purposes only. It does not constitute an endorsement, recommendation, or referral by Acquit.ai. Users must independently verify credentials.</p>
</div>
</div>

<div className="flex flex-col gap-4">

<article className="border border-legal-gold bg-surface-container p-6 relative flex flex-col gap-4" style={{ color: "#D4AF37" }}>
<div className="absolute top-0 right-0 bg-legal-gold text-surface px-2 py-1 text-[10px] font-data-mono uppercase font-bold flex items-center gap-1" style={{ color: "#D4AF37" }}>
<span className="material-symbols-outlined text-[12px]">star</span> Featured Listing
                        </div>
<div className="flex items-start justify-between">
<div>
<h3 className="text-headline-md font-headline-md text-on-surface mb-1">Eleanor Vance, Esq.</h3>
<p className="text-data-mono font-data-mono text-secondary">Vance &amp; Partners LLP</p>
</div>
<div className="flex items-center gap-2 border border-[#2C3E50] px-3 py-1 rounded-full bg-surface-variant/50">
<span className="material-symbols-outlined text-sm legal-gold" style={{ color: "#D4AF37" }}>verified</span>
<span className="text-label-caps font-label-caps text-on-surface">NY Bar Verified</span>
</div>
</div>
<div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-outline-variant">
<div>
<span className="block text-data-mono font-data-mono text-[10px] text-on-surface-variant uppercase mb-1">Practice Areas</span>
<span className="text-body-md font-body-md text-on-surface text-sm">Corporate M&amp;A, Securities</span>
</div>
<div>
<span className="block text-data-mono font-data-mono text-[10px] text-on-surface-variant uppercase mb-1">Admissions</span>
<span className="text-body-md font-body-md text-on-surface text-sm">NY, SDNY, EDNY</span>
</div>
<div>
<span className="block text-data-mono font-data-mono text-[10px] text-on-surface-variant uppercase mb-1">Experience</span>
<span className="text-body-md font-body-md text-on-surface text-sm">15+ Years</span>
</div>
<div>
<span className="block text-data-mono font-data-mono text-[10px] text-on-surface-variant uppercase mb-1">Contact</span>
<button className="text-data-mono font-data-mono text-secondary hover:underline text-sm flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">mail</span> Request Dossier
                                </button>
</div>
</div>
</article>

<article className="border border-outline-variant bg-surface-container p-6 relative flex flex-col gap-4 hover:border-on-surface-variant transition-colors group">
<div className="flex items-start justify-between">
<div>
<h3 className="text-headline-md font-headline-md text-on-surface mb-1 group-hover:text-primary transition-colors">Marcus T. Reed</h3>
<p className="text-data-mono font-data-mono text-on-surface-variant">Reed Defense Group</p>
</div>
<div className="flex items-center gap-2 border border-[#2C3E50] px-3 py-1 rounded-full">
<span className="material-symbols-outlined text-sm text-secondary">shield</span>
<span className="text-label-caps font-label-caps text-on-surface-variant">CA Bar Verified</span>
</div>
</div>
<div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-outline-variant border-dashed">
<div>
<span className="block text-data-mono font-data-mono text-[10px] text-on-surface-variant uppercase mb-1">Practice Areas</span>
<span className="text-body-md font-body-md text-on-surface text-sm">White Collar, Criminal Defense</span>
</div>
<div>
<span className="block text-data-mono font-data-mono text-[10px] text-on-surface-variant uppercase mb-1">Admissions</span>
<span className="text-body-md font-body-md text-on-surface text-sm">CA, 9th Circuit</span>
</div>
<div>
<span className="block text-data-mono font-data-mono text-[10px] text-on-surface-variant uppercase mb-1">Experience</span>
<span className="text-body-md font-body-md text-on-surface text-sm">22 Years</span>
</div>
<div>
<span className="block text-data-mono font-data-mono text-[10px] text-on-surface-variant uppercase mb-1">Contact</span>
<button className="text-data-mono font-data-mono text-on-surface-variant hover:text-on-surface transition-colors text-sm flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">mail</span> Connect
                                </button>
</div>
</div>
</article>

<article className="border border-outline-variant bg-surface-container p-6 relative flex flex-col gap-4 hover:border-on-surface-variant transition-colors group">
<div className="flex items-start justify-between">
<div>
<h3 className="text-headline-md font-headline-md text-on-surface mb-1 group-hover:text-primary transition-colors">Sarah Jenkins</h3>
<p className="text-data-mono font-data-mono text-on-surface-variant">Jenkins &amp; Associates</p>
</div>
<div className="flex items-center gap-2 border border-[#2C3E50] px-3 py-1 rounded-full">
<span className="material-symbols-outlined text-sm text-secondary">shield</span>
<span className="text-label-caps font-label-caps text-on-surface-variant">TX Bar Verified</span>
</div>
</div>
<div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-outline-variant border-dashed">
<div>
<span className="block text-data-mono font-data-mono text-[10px] text-on-surface-variant uppercase mb-1">Practice Areas</span>
<span className="text-body-md font-body-md text-on-surface text-sm">Intellectual Property, Patents</span>
</div>
<div>
<span className="block text-data-mono font-data-mono text-[10px] text-on-surface-variant uppercase mb-1">Admissions</span>
<span className="text-body-md font-body-md text-on-surface text-sm">TX, USPTO</span>
</div>
<div>
<span className="block text-data-mono font-data-mono text-[10px] text-on-surface-variant uppercase mb-1">Experience</span>
<span className="text-body-md font-body-md text-on-surface text-sm">8 Years</span>
</div>
<div>
<span className="block text-data-mono font-data-mono text-[10px] text-on-surface-variant uppercase mb-1">Contact</span>
<button className="text-data-mono font-data-mono text-on-surface-variant hover:text-on-surface transition-colors text-sm flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">mail</span> Connect
                                </button>
</div>
</div>
</article>

<div className="mt-8 border-t-2 border-[#2C3E50] pt-6">
<div className="flex items-center gap-3 mb-4">
<span className="material-symbols-outlined text-primary">volunteer_activism</span>
<h3 className="text-headline-md font-headline-md text-on-surface">Pro Bono &amp; Legal Aid</h3>
</div>
<p className="text-body-md font-body-md text-on-surface-variant mb-4 max-w-2xl">Access organizations providing free or low-cost legal assistance for qualifying individuals and non-profits.</p>
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<a className="border border-outline-variant p-4 hover:bg-surface-variant transition-colors flex justify-between items-center group" href="#">
<div>
<h4 className="text-data-mono font-data-mono text-on-surface font-bold">National Legal Aid Defender Assoc.</h4>
<p className="text-label-caps font-label-caps text-on-surface-variant text-[10px] mt-1">Nationwide Resources</p>
</div>
<span className="material-symbols-outlined text-on-surface-variant group-hover:text-on-surface">arrow_forward</span>
</a>
<a className="border border-outline-variant p-4 hover:bg-surface-variant transition-colors flex justify-between items-center group" href="#">
<div>
<h4 className="text-data-mono font-data-mono text-on-surface font-bold">State Bar Pro Bono Directory</h4>
<p className="text-label-caps font-label-caps text-on-surface-variant text-[10px] mt-1">Select Jurisdiction First</p>
</div>
<span className="material-symbols-outlined text-on-surface-variant group-hover:text-on-surface">arrow_forward</span>
</a>
</div>
</div>
</div>
</div>
</main>
</div>

    </div>
  );
}
