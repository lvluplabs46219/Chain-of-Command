import Head from 'next/head';

const TailwindConfig = `
  tailwind.config = {
    darkMode: "class",
    theme: {
      extend: {
        colors: {
          "inverse-on-surface": "#313030",
          "secondary-fixed-dim": "#b5c8df",
          "primary-fixed-dim": "#c6c6c9",
          "surface": "#141313",
          "error": "#ffb4ab",
          "inverse-surface": "#e5e2e1",
          "on-surface": "#e5e2e1",
          "tertiary-container": "#201b17",
          "surface-bright": "#3a3939",
          "on-secondary-container": "#a4b7cd",
          "outline": "#8f9194",
          "primary": "#c6c6c9",
          "on-tertiary-fixed-variant": "#4c4641",
          "on-tertiary": "#352f2b",
          "secondary-container": "#36485b",
          "surface-container-low": "#1c1b1b",
          "on-background": "#e5e2e1",
          "inverse-primary": "#5d5e61",
          "surface-container": "#201f1f",
          "surface-tint": "#c6c6c9",
          "on-secondary": "#203243",
          "on-primary-fixed-variant": "#454749",
          "on-primary": "#2f3133",
          "on-error": "#690005",
          "surface-dim": "#141313",
          "secondary-fixed": "#d1e4fb",
          "error-container": "#93000a",
          "surface-container-highest": "#353435",
          "secondary": "#b5c8df",
          "tertiary-fixed": "#ebe0da",
          "tertiary-fixed-dim": "#cfc5be",
          "surface-container-lowest": "#0e0e0e",
          "tertiary": "#cfc5be",
          "on-primary-container": "#838486",
          "on-secondary-fixed": "#091d2e",
          "surface-container-high": "#2a2a2a",
          "outline-variant": "#44474a",
          "on-primary-fixed": "#1a1c1e",
          "on-surface-variant": "#c5c6ca",
          "on-tertiary-fixed": "#201b17",
          "on-tertiary-container": "#8b837d",
          "background": "#141313",
          "on-error-container": "#ffdad6",
          "primary-fixed": "#e2e2e5",
          "primary-container": "#1a1c1e",
          "on-secondary-fixed-variant": "#36485b",
          "surface-variant": "#353435"
        },
        borderRadius: {
          DEFAULT: "0.25rem",
          lg: "0.5rem",
          xl: "0.75rem",
          full: "9999px"
        },
        spacing: {
          "margin-safe": "32px",
          xs: "4px",
          lg: "24px",
          sm: "8px",
          gutter: "16px",
          base: "4px",
          xl: "40px",
          md: "16px"
        },
        fontFamily: {
          "headline-lg": ["Domine"],
          "data-mono": ["JetBrains Mono"],
          "body-md": ["Hanken Grotesk"],
          "body-lg": ["Hanken Grotesk"],
          "label-caps": ["Hanken Grotesk"],
          "headline-lg-mobile": ["Domine"],
          "display-case": ["Domine"],
          "headline-md": ["Domine"]
        },
        fontSize: {
          "headline-lg": ["32px", { lineHeight: "40px", fontWeight: "600" }],
          "data-mono": ["14px", { lineHeight: "20px", fontWeight: "500" }],
          "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
          "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
          "label-caps": ["12px", { lineHeight: "16px", letterSpacing: "0.08em", fontWeight: "700" }],
          "headline-lg-mobile": ["24px", { lineHeight: "32px", fontWeight: "600" }],
          "display-case": ["40px", { lineHeight: "48px", letterSpacing: "-0.02em", fontWeight: "700" }],
          "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }]
        }
      }
    }
  };
`;

const CustomStyles = `
  /* Custom scrollbar for data dense areas */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  ::-webkit-scrollbar-track {
    background: #141313;
  }
  ::-webkit-scrollbar-thumb {
    background: #353435;
    border-radius: 0px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #44474a;
  }
`;

export default function CaseTimelineEventRecord() {
  return (
    <>
      <Head>
        <title>Event Record - Acquit.ai</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          href="https://fonts.googleapis.com/css2?family=Domine:wght@400;500;600;700&family=Hanken+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
        <script dangerouslySetInnerHTML={{ __html: TailwindConfig }} />
        <style dangerouslySetInnerHTML={{ __html: CustomStyles }} />
      </Head>

      <div className="bg-background text-on-surface font-body-md min-h-screen flex flex-col md:flex-row overflow-x-hidden selection:bg-secondary selection:text-on-secondary">
        {/* Mobile Top App Bar */}
        <header className="md:hidden flex justify-between items-center w-full px-gutter h-16 bg-surface-container-low border-b border-outline-variant z-50 fixed top-0 w-full">
          <div className="flex items-center gap-4">
            <button className="text-primary hover:bg-surface-variant p-2 rounded-DEFAULT transition-colors">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <span className="text-headline-md font-headline-md-mobile font-bold text-on-surface">Acquit.ai</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="text-primary hover:bg-surface-variant p-2 rounded-DEFAULT transition-colors">
              <span className="material-symbols-outlined">search</span>
            </button>
          </div>
        </header>

        {/* Side Navigation */}
        <nav className="hidden md:flex fixed left-0 top-0 bottom-0 flex-col z-40 bg-surface-container w-[280px] border-r border-outline-variant transition-all duration-200 ease-in-out">
          <div className="p-lg border-b border-outline-variant">
            <div className="flex items-center gap-md mb-lg">
              <div className="w-12 h-12 bg-surface-variant border border-outline flex items-center justify-center rounded-DEFAULT">
                <span className="material-symbols-outlined text-secondary text-2xl">account_balance</span>
              </div>
              <div>
                <h1 className="text-headline-md font-headline-md font-bold text-on-surface tracking-tight">Legal OS</h1>
                <p className="text-data-mono font-data-mono text-on-surface-variant text-sm">Matter 2024-772B</p>
              </div>
            </div>
            <button className="w-full bg-secondary text-on-secondary font-label-caps text-label-caps py-sm px-md flex items-center justify-center gap-2 border border-secondary hover:bg-surface hover:text-secondary transition-colors">
              <span className="material-symbols-outlined text-sm">add</span>
              New Filing
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-md">
            <ul className="flex flex-col gap-1 px-sm">
              <li>
                <a className="flex items-center gap-md px-md py-sm text-on-surface-variant font-medium hover:bg-surface-container-high hover:text-on-surface transition-colors rounded-sm group" href="#">
                  <span className="material-symbols-outlined text-outline group-hover:text-on-surface transition-colors">dashboard</span>
                  <span className="text-label-caps font-label-caps">Command Center</span>
                </a>
              </li>
              <li>
                <a className="flex items-center gap-md px-md py-sm text-on-surface border-l-4 border-secondary bg-surface-variant font-bold rounded-sm group" href="#">
                  <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>gavel</span>
                  <span className="text-label-caps font-label-caps">The Docket</span>
                </a>
              </li>
              <li>
                <a className="flex items-center gap-md px-md py-sm text-on-surface-variant font-medium hover:bg-surface-container-high hover:text-on-surface transition-colors rounded-sm group" href="#">
                  <span className="material-symbols-outlined text-outline group-hover:text-on-surface transition-colors">groups</span>
                  <span className="text-label-caps font-label-caps">Chambers</span>
                </a>
              </li>
              <li>
                <a className="flex items-center gap-md px-md py-sm text-on-surface-variant font-medium hover:bg-surface-container-high hover:text-on-surface transition-colors rounded-sm group" href="#">
                  <span className="material-symbols-outlined text-outline group-hover:text-on-surface transition-colors">menu_book</span>
                  <span className="text-label-caps font-label-caps">Law Library</span>
                </a>
              </li>
              <li>
                <a className="flex items-center gap-md px-md py-sm text-on-surface-variant font-medium hover:bg-surface-container-high hover:text-on-surface transition-colors rounded-sm group" href="#">
                  <span className="material-symbols-outlined text-outline group-hover:text-on-surface transition-colors">folder_shared</span>
                  <span className="text-label-caps font-label-caps">Record Room</span>
                </a>
              </li>
            </ul>
          </div>
          <div className="p-md border-t border-outline-variant mt-auto">
            <ul className="flex flex-col gap-1 px-sm">
              <li>
                <a className="flex items-center gap-md px-md py-sm text-on-surface-variant font-medium hover:bg-surface-container-high hover:text-on-surface transition-colors rounded-sm group" href="#">
                  <span className="material-symbols-outlined text-outline group-hover:text-on-surface transition-colors">help</span>
                  <span className="text-label-caps font-label-caps">Support</span>
                </a>
              </li>
              <li>
                <a className="flex items-center gap-md px-md py-sm text-on-surface-variant font-medium hover:bg-surface-container-high hover:text-on-surface transition-colors rounded-sm group" href="#">
                  <span className="material-symbols-outlined text-outline group-hover:text-on-surface transition-colors">archive</span>
                  <span className="text-label-caps font-label-caps">Archive</span>
                </a>
              </li>
            </ul>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 md:ml-[280px] mt-16 md:mt-0 min-h-screen flex flex-col bg-background relative">
          {/* Top App Bar (Desktop) */}
          <header className="hidden md:flex justify-between items-center w-full px-lg h-16 bg-surface-container-low border-b border-outline-variant sticky top-0 z-30">
            <div className="flex items-center gap-lg">
              <span className="text-headline-md font-headline-md font-bold text-on-surface">Acquit.ai</span>
              <nav className="flex gap-1 h-full items-end pb-1">
                <a className="text-on-surface-variant font-label-caps text-label-caps px-md py-xs hover:bg-surface-variant hover:text-on-surface transition-colors rounded-sm" href="#">
                  File
                </a>
                <a className="text-on-surface-variant font-label-caps text-label-caps px-md py-xs hover:bg-surface-variant hover:text-on-surface transition-colors rounded-sm" href="#">
                  Edit
                </a>
                <a className="text-on-surface-variant font-label-caps text-label-caps px-md py-xs hover:bg-surface-variant hover:text-on-surface transition-colors rounded-sm" href="#">
                  View
                </a>
                <a className="text-primary border-b-2 border-primary font-label-caps text-label-caps px-md py-xs pb-0 mb-[-5px]" href="#">
                  Matter
                </a>
                <a className="text-on-surface-variant font-label-caps text-label-caps px-md py-xs hover:bg-surface-variant hover:text-on-surface transition-colors rounded-sm" href="#">
                  Account
                </a>
              </nav>
            </div>
            <div className="flex items-center gap-md">
              <div className="relative flex items-center bg-surface border border-outline-variant focus-within:border-primary transition-colors h-8">
                <span className="material-symbols-outlined text-outline px-2 text-sm">search</span>
                <input
                  className="bg-transparent border-none text-data-mono font-data-mono text-sm text-on-surface focus:ring-0 placeholder:text-outline w-48 py-1 px-0 h-full"
                  placeholder="Search records..."
                  type="text"
                />
              </div>
              <button className="text-on-surface-variant hover:bg-surface-variant hover:text-on-surface p-1 rounded-sm transition-colors">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button className="text-on-surface-variant hover:bg-surface-variant hover:text-on-surface p-1 rounded-sm transition-colors">
                <span className="material-symbols-outlined">settings</span>
              </button>
              <button className="text-on-surface-variant hover:bg-surface-variant hover:text-on-surface p-1 rounded-sm transition-colors">
                <span className="material-symbols-outlined">account_circle</span>
              </button>
            </div>
          </header>

          {/* Page Header */}
          <div className="px-lg py-md border-b border-outline-variant bg-surface flex items-center justify-between">
            <div className="flex flex-col gap-xs">
              <div className="flex items-center gap-2 text-data-mono font-data-mono text-sm text-on-surface-variant">
                <a className="hover:text-primary transition-colors flex items-center gap-1" href="#">
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  Back to Chronology
                </a>
                <span className="text-outline">/</span>
                <span>Event EV-2023-08-14</span>
              </div>
              <h2 className="text-headline-lg font-headline-lg text-on-surface flex items-center gap-3">
                Arrest & Initial Search
                <span className="inline-flex items-center px-2 py-0.5 border border-error text-error text-[10px] font-label-caps uppercase tracking-wider rounded-sm bg-error-container/20">
                  Critical Status
                </span>
              </h2>
            </div>
            <div className="flex items-center gap-sm">
              <button className="flex items-center gap-2 px-md py-sm border border-outline-variant text-on-surface font-label-caps text-label-caps hover:bg-surface-variant transition-colors">
                <span className="material-symbols-outlined text-[18px]">print</span>
                Print Record
              </button>
              <button className="flex items-center gap-2 px-md py-sm bg-secondary text-on-secondary border border-secondary font-label-caps text-label-caps hover:bg-surface hover:text-secondary transition-colors">
                <span className="material-symbols-outlined text-[18px]">edit_document</span>
                Edit Meta
              </button>
            </div>
          </div>

          {/* Scrollable Content Canvas */}
          <div className="flex-1 overflow-y-auto p-lg flex flex-col xl:flex-row gap-lg">
            {/* Left Column: Event Details */}
            <div className="w-full xl:w-7/12 flex flex-col gap-lg">
              {/* Core Metadata Box */}
              <div className="border border-outline-variant bg-surface flex flex-col">
                <div className="bg-secondary-container px-md py-sm flex items-center justify-between border-b border-outline-variant">
                  <h3 className="text-label-caps font-label-caps text-on-secondary-container tracking-widest uppercase">Event Record Manifest</h3>
                  <div className="flex items-center gap-2 text-data-mono font-data-mono text-on-secondary-container text-xs">
                    <span className="material-symbols-outlined text-[14px]">lock</span>
                    Secure Entry
                  </div>
                </div>
                <div className="p-md grid grid-cols-1 md:grid-cols-2 gap-md bg-surface-dim">
                  {/* Date/Time Anchor */}
                  <div className="flex flex-col gap-xs col-span-2 md:col-span-1 border-b md:border-b-0 md:border-r border-outline-variant pb-md md:pb-0 md:pr-md">
                    <span className="text-data-mono font-data-mono text-outline text-xs uppercase tracking-wider">Temporal Anchor</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-headline-md font-headline-md text-on-surface">Aug 14, 2023</span>
                      <span className="text-data-mono font-data-mono text-secondary">23:42 EST</span>
                    </div>
                    <span className="text-body-md font-body-md text-on-surface-variant mt-1 flex items-center gap-2">
                      <span className="material-symbols-outlined text-outline text-[16px]">location_on</span>
                      1422 Westlake Ave, Dist 9
                    </span>
                  </div>
                  {/* Status Toggles */}
                  <div className="flex flex-col gap-sm col-span-2 md:col-span-1 md:pl-md justify-center">
                    <div className="flex items-center justify-between p-sm border border-outline-variant bg-surface">
                      <span className="text-data-mono font-data-mono text-sm text-on-surface-variant">Factual Dispute</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input className="sr-only peer" type="checkbox" defaultChecked />
                        <div className="w-9 h-5 bg-surface-variant peer-focus:outline-none border border-outline-variant rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-on-surface after:border-outline-variant after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-secondary"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between p-sm border border-outline-variant bg-surface">
                      <span className="text-data-mono font-data-mono text-sm text-on-surface-variant">Evidentiary Motion</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input className="sr-only peer" type="checkbox" />
                        <div className="w-9 h-5 bg-surface-variant peer-focus:outline-none border border-outline-variant rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-on-surface after:border-outline-variant after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-secondary"></div>
                      </label>
                    </div>
                  </div>
                </div>
                {/* Description Narrative */}
                <div className="p-md border-t border-outline-variant bg-surface">
                  <span className="text-data-mono font-data-mono text-outline text-xs uppercase tracking-wider mb-sm block">Narrative Transcription</span>
                  <p className="text-body-md font-body-md text-on-surface leading-relaxed">
                    Officers executed a no-knock warrant at the primary residence. Defendant was apprehended in the living room area. Subsequent sweep of the premises yielded items tagged as EV-01 through EV-04. The defense contends the scope of the search exceeded the mandate of the warrant, specifically regarding the secondary structure (detached garage).
                  </p>
                </div>
              </div>

              {/* Linked Evidence Grid */}
              <div className="flex flex-col gap-sm">
                <h3 className="text-label-caps font-label-caps text-on-surface-variant tracking-widest uppercase flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">inventory_2</span>
                  Admitted Exhibits & Assets
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  {/* Evidence Card 1 */}
                  <div className="border border-outline-variant bg-surface-container-low hover:bg-surface-variant transition-colors group cursor-pointer flex">
                    <div
                      className="w-24 h-24 bg-surface-container flex-shrink-0 border-r border-outline-variant relative overflow-hidden flex items-center justify-center"
                      style={{
                        backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBMLLQSiaSwCvrqqdodWjjs1MV1eVAOAw1nlR0fOb7p_gd3ZdFiZz8rcnIDH8aIXJmGzzpM13T-03tdNhzwbN8voMXCqhTDAGnfn9WmYKKXVlPffwGhpliUZ5QSRkVc9bnPpYywjoKpVrorFKIcQ63NGWKOw6entQj-iztxmbnWzwpZyCjmfZ6itWRSX0lDOXrSozGeccPmOtLONURURd_JtfMZr4ET37Le7PVR4KQxhPc5AuvVKK8oCQ')",
                        backgroundSize: "cover",
                        backgroundPosition: "center"
                      }}
                    >
                      <div className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:opacity-100 transition-opacity mix-blend-luminosity"></div>
                    </div>
                    <div className="p-sm flex flex-col justify-between flex-1">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-data-mono font-data-mono text-secondary text-xs">EXH-04A</span>
                          <span className="material-symbols-outlined text-outline text-[16px]">open_in_new</span>
                        </div>
                        <h4 className="text-body-md font-body-md font-medium text-on-surface mt-1 truncate">Seized Mobile Device</h4>
                      </div>
                      <span className="inline-flex w-fit items-center px-1.5 py-0.5 border border-outline text-outline text-[10px] font-data-mono rounded-sm">
                        Chain verified
                      </span>
                    </div>
                  </div>
                  {/* Evidence Card 2 */}
                  <div className="border border-outline-variant bg-surface-container-low hover:bg-surface-variant transition-colors group cursor-pointer flex">
                    <div className="w-24 h-24 bg-surface-container flex-shrink-0 border-r border-outline-variant relative flex items-center justify-center text-outline group-hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-3xl">description</span>
                    </div>
                    <div className="p-sm flex flex-col justify-between flex-1">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-data-mono font-data-mono text-secondary text-xs">DOC-112</span>
                          <span className="material-symbols-outlined text-outline text-[16px]">open_in_new</span>
                        </div>
                        <h4 className="text-body-md font-body-md font-medium text-on-surface mt-1 truncate">Warrant Execution Log</h4>
                      </div>
                      <span className="inline-flex w-fit items-center px-1.5 py-0.5 border border-error text-error text-[10px] font-data-mono rounded-sm bg-error-container/10">
                        Disputed signature
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Inspector Panel */}
            <div className="w-full xl:w-5/12 flex flex-col gap-lg">
              {/* AI Strategy Context */}
              <div className="border border-primary-fixed-dim/30 bg-surface relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent pointer-events-none"></div>
                <div className="px-md py-sm border-b border-primary-fixed-dim/30 flex items-center justify-between bg-surface-container-low relative z-10">
                  <h3 className="text-label-caps font-label-caps text-secondary tracking-widest uppercase flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">psychology</span>
                    Machine Inference
                  </h3>
                  <span className="text-data-mono font-data-mono text-outline text-[10px]">Model: GPT-Legal-v4</span>
                </div>
                <div className="p-md relative z-10 flex flex-col gap-md">
                  <div className="flex gap-sm">
                    <div className="w-1 bg-secondary rounded-full flex-shrink-0"></div>
                    <p className="text-body-md font-body-md text-on-surface">
                      This event constitutes the primary vulnerability in the prosecution's timeline. The 14-minute gap between the recorded arrival time on the dispatch log and the execution time on the warrant log suggests irregular procedure.
                    </p>
                  </div>
                  <div className="border-t border-outline-variant pt-md">
                    <span className="text-data-mono font-data-mono text-outline text-xs uppercase tracking-wider mb-sm block">
                      Suggested Defensive Vectors
                    </span>
                    <ul className="flex flex-col gap-2">
                      <li className="flex items-start gap-2 text-sm text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer group/item">
                        <span className="material-symbols-outlined text-secondary text-[16px] mt-0.5 group-hover/item:scale-110 transition-transform">
                          subdirectory_arrow_right
                        </span>
                        <span className="font-data-mono">Draft motion to suppress (4th Amendment violation) based on detached structure perimeter.</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer group/item">
                        <span className="material-symbols-outlined text-secondary text-[16px] mt-0.5 group-hover/item:scale-110 transition-transform">
                          subdirectory_arrow_right
                        </span>
                        <span className="font-data-mono">Subpoena dispatch officer for testimony regarding the 23:28 vs 23:42 discrepancy.</span>
                      </li>
                    </ul>
                  </div>
                  <button className="w-full py-2 border border-secondary text-secondary font-label-caps text-label-caps hover:bg-secondary/10 transition-colors flex items-center justify-center gap-2 mt-2">
                    <span className="material-symbols-outlined text-[16px]">bolt</span>
                    Generate Draft Motion
                  </button>
                </div>
              </div>

              {/* Chronology Mini-Map */}
              <div className="border border-outline-variant bg-surface flex flex-col flex-1">
                <div className="bg-surface-container-low px-md py-sm border-b border-outline-variant">
                  <h3 className="text-label-caps font-label-caps text-on-surface-variant tracking-widest uppercase">Local Chronology</h3>
                </div>
                <div className="p-md flex-1 relative">
                  <div className="absolute left-[35px] top-md bottom-md w-px bg-outline-variant"></div>
                  <ul className="flex flex-col gap-lg relative z-10">
                    {/* Previous Event */}
                    <li className="flex gap-md opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                      <div className="w-10 text-right mt-0.5">
                        <span className="text-data-mono font-data-mono text-xs text-outline block">22:15</span>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-surface-variant border-2 border-outline-variant mt-1.5 flex-shrink-0 relative -ml-[5px]"></div>
                      <div>
                        <p className="text-sm font-body-md text-on-surface">Warrant Issued by Judge Harkin</p>
                      </div>
                    </li>
                    {/* Current Event */}
                    <li className="flex gap-md">
                      <div className="w-10 text-right mt-0.5">
                        <span className="text-data-mono font-data-mono text-xs text-secondary font-bold block">23:42</span>
                      </div>
                      <div className="w-4 h-4 rounded-full bg-surface border-2 border-secondary mt-0.5 flex-shrink-0 relative -ml-[9px] shadow-[0_0_0_2px_#141313] flex items-center justify-center">
                        <div className="w-1 h-1 bg-secondary rounded-full"></div>
                      </div>
                      <div>
                        <p className="text-sm font-body-md text-on-surface font-bold border-b border-secondary pb-0.5 inline-block">
                          Arrest & Initial Search
                        </p>
                      </div>
                    </li>
                    {/* Next Event */}
                    <li className="flex gap-md opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                      <div className="w-10 text-right mt-0.5">
                        <span className="text-data-mono font-data-mono text-xs text-outline block">01:30</span>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-surface-variant border-2 border-outline-variant mt-1.5 flex-shrink-0 relative -ml-[5px]"></div>
                      <div>
                        <p className="text-sm font-body-md text-on-surface">Booking at Central Precinct</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}