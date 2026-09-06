import Head from 'next/head';

const TailwindConfig = `
  tailwind.config = {
    darkMode: "class",
    theme: {
      extend: {
        colors: {
          "on-surface-variant": "#c5c6ca",
          "inverse-primary": "#5d5e61",
          "surface-container": "#201f1f",
          "secondary": "#b5c8df",
          "error-container": "#93000a",
          "primary-fixed": "#e2e2e5",
          "surface-variant": "#353435",
          "on-secondary-container": "#a4b7cd",
          "on-primary": "#2f3133",
          "secondary-container": "#36485b",
          "primary": "#c6c6c9",
          "on-background": "#e5e2e1",
          "surface": "#141313",
          "on-primary-container": "#838486",
          "primary-fixed-dim": "#c6c6c9",
          "inverse-surface": "#e5e2e1",
          "on-tertiary-fixed": "#201b17",
          "tertiary-container": "#201b17",
          "on-secondary-fixed-variant": "#36485b",
          "inverse-on-surface": "#313030",
          "primary-container": "#1a1c1e",
          "on-surface": "#e5e2e1",
          "secondary-fixed-dim": "#b5c8df",
          "on-primary-fixed-variant": "#454749",
          "on-primary-fixed": "#1a1c1e",
          "background": "#141313",
          "on-error": "#690005",
          "on-tertiary-container": "#8b837d",
          "tertiary-fixed-dim": "#cfc5be",
          "secondary-fixed": "#d1e4fb",
          "on-tertiary": "#352f2b",
          "outline": "#8f9194",
          "surface-container-high": "#2a2a2a",
          "tertiary-fixed": "#ebe0da",
          "error": "#ffb4ab",
          "on-secondary": "#203243",
          "tertiary": "#cfc5be",
          "outline-variant": "#44474a",
          "surface-dim": "#141313",
          "surface-container-highest": "#353435",
          "surface-container-lowest": "#0e0e0e",
          "surface-container-low": "#1c1b1b",
          "surface-bright": "#3a3939",
          "on-secondary-fixed": "#091d2e",
          "surface-tint": "#c6c6c9",
          "on-tertiary-fixed-variant": "#4c4641",
          "on-error-container": "#ffdad6"
        },
        borderRadius: {
          DEFAULT: "0.25rem",
          lg: "0.5rem",
          xl: "0.75rem",
          full: "9999px"
        },
        spacing: {
          sm: "8px",
          "margin-safe": "32px",
          base: "4px",
          gutter: "16px",
          xs: "4px",
          lg: "24px",
          xl: "40px",
          md: "16px"
        },
        fontFamily: {
          "headline-lg": ["Domine"],
          "headline-md": ["Domine"],
          "data-mono": ["JetBrains Mono"],
          "body-lg": ["Hanken Grotesk"],
          "display-case": ["Domine"],
          "body-md": ["Hanken Grotesk"],
          "headline-lg-mobile": ["Domine"],
          "label-caps": ["Hanken Grotesk"]
        },
        fontSize: {
          "headline-lg": ["32px", { lineHeight: "40px", fontWeight: "600" }],
          "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }],
          "data-mono": ["14px", { lineHeight: "20px", fontWeight: "500" }],
          "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
          "display-case": ["40px", { lineHeight: "48px", letterSpacing: "-0.02em", fontWeight: "700" }],
          "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
          "headline-lg-mobile": ["24px", { lineHeight: "32px", fontWeight: "600" }],
          "label-caps": ["12px", { lineHeight: "16px", letterSpacing: "0.08em", fontWeight: "700" }]
        }
      }
    }
  };
`;

const CustomStyles = `
  body { background-color: #141313; color: #e5e2e1; }
  .border-legal { border: 1px solid #2C3E50; }
  .shadow-active { box-shadow: 2px 2px 0px 0px #b5c8df; }
  .glass-panel { background: rgba(28, 27, 27, 0.7); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(68, 71, 74, 0.5); }
  .input-blank { border: none; border-bottom: 1px solid #44474a; background: transparent; border-radius: 0; padding-left: 0; padding-right: 0; }
  .input-blank:focus { border-bottom: 1px solid #b5c8df; box-shadow: none; outline: none; border: 1px solid #b5c8df; padding: 0.5rem; background: #201f1f; }
`;

export default function CaseTimelineLogEvent() {
  return (
    <>
      <Head>
        <title>Case Timeline - Log Event | Acquit.ai</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          href="https://fonts.googleapis.com/css2?family=Domine:wght@400;600;700&family=Hanken+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
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

      <div className="bg-background dark:bg-background text-on-surface font-body-md min-h-screen flex flex-col md:flex-row overflow-x-hidden antialiased selection:bg-secondary selection:text-on-secondary">
        {/* Side Navigation */}
        <nav className="hidden md:flex flex-col h-full py-md bg-background dark:bg-background text-primary dark:text-primary w-[280px] h-screen fixed left-0 top-0 border-r border-outline-variant z-40">
          <div className="px-lg mb-xl mt-lg">
            <h1 className="font-headline-lg text-headline-lg font-bold text-primary tracking-tighter uppercase">Acquit.ai</h1>
            <p className="font-data-mono text-data-mono text-on-surface-variant mt-xs">Senior Counsel</p>
          </div>
          <div className="px-lg mb-lg">
            <button className="w-full bg-secondary text-on-secondary font-label-caps text-label-caps py-sm px-md flex items-center justify-center gap-sm hover:bg-secondary-fixed transition-colors duration-150 rounded">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
              NEW FILING
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-sm space-y-1">
            <a className="flex items-center gap-md px-md py-sm rounded-r text-on-surface-variant font-medium hover:text-on-surface hover:bg-surface-container-high transition-colors duration-150 group" href="#">
              <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">dashboard</span>
              <span className="font-label-caps text-label-caps">Command Center</span>
            </a>
            <a className="flex items-center gap-md px-md py-sm rounded-r text-on-surface-variant font-medium hover:text-on-surface hover:bg-surface-container-high transition-colors duration-150 group" href="#">
              <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">gavel</span>
              <span className="font-label-caps text-label-caps">The Docket</span>
            </a>
            <a className="flex items-center gap-md px-md py-sm rounded-r text-on-surface-variant font-medium hover:text-on-surface hover:bg-surface-container-high transition-colors duration-150 group" href="#">
              <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">account_balance</span>
              <span className="font-label-caps text-label-caps">Chambers</span>
            </a>
            <a className="flex items-center gap-md px-md py-sm rounded-r text-on-surface-variant font-medium hover:text-on-surface hover:bg-surface-container-high transition-colors duration-150 group" href="#">
              <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">library_books</span>
              <span className="font-label-caps text-label-caps">Law Library</span>
            </a>
            <a className="flex items-center gap-md px-md py-sm rounded-r text-on-surface-variant font-medium hover:text-on-surface hover:bg-surface-container-high transition-colors duration-150 group" href="#">
              <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">folder_open</span>
              <span className="font-label-caps text-label-caps">Record Room</span>
            </a>
            <a className="flex items-center gap-md px-md py-sm rounded-r text-on-surface-variant font-medium hover:text-on-surface hover:bg-surface-container-high transition-colors duration-150 group" href="#">
              <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">policy</span>
              <span className="font-label-caps text-label-caps">Investigations</span>
            </a>
            <a className="flex items-center gap-md px-md py-sm rounded-r text-primary border-l-4 border-primary bg-secondary-container/30 font-bold hover:bg-surface-container-high transition-all duration-75 group relative" href="#">
              <span className="material-symbols-outlined text-primary">timeline</span>
              <span className="font-label-caps text-label-caps">Case Timeline</span>
            </a>
            <a className="flex items-center gap-md px-md py-sm rounded-r text-on-surface-variant font-medium hover:text-on-surface hover:bg-surface-container-high transition-colors duration-150 group" href="#">
              <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">visibility</span>
              <span className="font-label-caps text-label-caps">Court Watch</span>
            </a>
            <a className="flex items-center gap-md px-md py-sm rounded-r text-on-surface-variant font-medium hover:text-on-surface hover:bg-surface-container-high transition-colors duration-150 group" href="#">
              <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">groups</span>
              <span className="font-label-caps text-label-caps">Counsel Directory</span>
            </a>
            <a className="flex items-center gap-md px-md py-sm rounded-r text-on-surface-variant font-medium hover:text-on-surface hover:bg-surface-container-high transition-colors duration-150 group" href="#">
              <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">assignment</span>
              <span className="font-label-caps text-label-caps">Motions & Tasks</span>
            </a>
          </div>
          <div className="px-sm mt-auto border-t border-outline-variant pt-sm">
            <a className="flex items-center gap-md px-md py-sm rounded-r text-on-surface-variant font-medium hover:text-on-surface hover:bg-surface-container-high transition-colors duration-150 group" href="#">
              <span className="material-symbols-outlined text-outline group-hover:text-primary">settings</span>
              <span className="font-label-caps text-label-caps">Settings</span>
            </a>
            <a className="flex items-center gap-md px-md py-sm rounded-r text-on-surface-variant font-medium hover:text-on-surface hover:bg-surface-container-high transition-colors duration-150 group" href="#">
              <span className="material-symbols-outlined text-outline group-hover:text-primary">help</span>
              <span className="font-label-caps text-label-caps">Support</span>
            </a>
          </div>
        </nav>

        {/* Top App Bar */}
        <header className="flex justify-between items-center px-lg bg-surface-container-low dark:bg-surface-container-low text-primary dark:text-primary h-16 fixed top-0 right-0 left-0 md:left-[280px] z-30 border-b border-outline-variant">
          <div className="flex items-center gap-md">
            <button className="md:hidden text-on-surface-variant hover:text-primary p-xs">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="hidden md:flex items-center gap-lg">
              <a className="font-data-mono text-data-mono text-primary border-b-2 border-primary pb-1 ring-1 ring-primary transition-all duration-200 px-xs" href="#">
                Case: 2024-CV-8821
              </a>
              <a className="font-data-mono text-data-mono text-on-surface-variant hover:text-primary hover:bg-surface-bright dark:hover:bg-surface-bright px-xs py-1 rounded transition-colors" href="#">
                The Clerk
              </a>
            </div>
          </div>
          <div className="flex items-center gap-md">
            <div className="flex items-center gap-xs">
              <button aria-label="Notifications" className="p-sm text-on-surface-variant hover:text-primary hover:bg-surface-bright rounded-full transition-colors">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button aria-label="History" className="p-sm text-on-surface-variant hover:text-primary hover:bg-surface-bright rounded-full transition-colors">
                <span className="material-symbols-outlined">history</span>
              </button>
              <button aria-label="Search" className="p-sm text-on-surface-variant hover:text-primary hover:bg-surface-bright rounded-full transition-colors">
                <span className="material-symbols-outlined">search</span>
              </button>
            </div>
            <button className="hidden lg:flex items-center gap-xs bg-secondary-container/20 border border-secondary text-secondary font-label-caps text-label-caps px-md py-sm rounded hover:bg-secondary hover:text-on-secondary transition-colors">
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>draw</span>
              AFFIX SIGNATURE
            </button>
            <div className="w-8 h-8 rounded-full bg-surface-variant border border-outline flex items-center justify-center overflow-hidden">
              <img
                alt="Counsel Avatar"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJ7TpLvpkjkW6PK2UgFlFPRZsTIBodkTdYof-l0Krb-H7q_JTlYNeehiKZfY-KrG0UYSsu4peh_t_PzQBXGvZxQfE3s9d43-UGIAUuv0eqCkx_DBBvx8-U4pCs-pwCJ7wRdtwhaQlEydVojnZYbG82I5iRi_GY8fRXMGTXWDnYs48R_sUeB3CghSxmnshSBwCs52rk7j87f5BuZ6Z3an-Vqz21Bnr_UZz4MowjPxS0aqNZQpYMu09Jlg"
              />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col mt-16 md:ml-[280px] p-md lg:p-lg lg:flex-row gap-lg bg-surface-dim relative">
          <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-secondary-container/30 via-background to-background"></div>
          
          {/* Left Column: Form */}
          <div className="flex-1 flex flex-col gap-md max-w-3xl z-10">
            <div className="mb-sm">
              <nav className="flex text-on-surface-variant font-data-mono text-[12px] mb-xs">
                <a className="hover:text-primary" href="#">Timeline</a>
                <span className="mx-2">/</span>
                <span className="text-primary">Log Event</span>
              </nav>
              <h2 className="font-display-case text-display-case text-on-surface">Record Timeline Entry</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
                Append a formalized event to the official case chronology. All entries are cryptographically signed.
              </p>
            </div>
            <div className="glass-panel p-lg flex flex-col gap-lg flex-1 border-legal">
              <div className="flex items-center justify-between border-b border-outline-variant pb-sm">
                <div className="flex items-center gap-sm">
                  <span className="material-symbols-outlined text-secondary">edit_document</span>
                  <h3 className="font-headline-md text-headline-md text-primary uppercase tracking-wide text-[16px]">Entry Details</h3>
                </div>
                <div className="flex items-center gap-xs font-data-mono text-[12px] text-on-surface-variant bg-surface-container-high px-2 py-1 rounded">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                  DRAFT MODE
                </div>
              </div>
              <form className="flex flex-col gap-xl">
                {/* Row 1: Timestamp & Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-caps text-label-caps text-on-surface-variant">Timestamp</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-0 top-2 text-outline">calendar_month</span>
                      <input
                        className="input-blank font-data-mono text-data-mono w-full pl-8 pb-1 text-on-surface"
                        placeholder="YYYY-MM-DD HH:MM"
                        type="text"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-caps text-label-caps text-on-surface-variant">Event Category</label>
                    <div className="relative">
                      <select className="input-blank font-data-mono text-data-mono w-full pb-1 text-on-surface appearance-none bg-transparent">
                        <option className="bg-surface-container" disabled selected value="">
                          Select Category...
                        </option>
                        <option className="bg-surface-container" value="arrest">
                          Arrest / Apprehension
                        </option>
                        <option className="bg-surface-container" value="filing">
                          Court Filing
                        </option>
                        <option className="bg-surface-container" value="hearing">
                          Hearing / Proceeding
                        </option>
                        <option className="bg-surface-container" value="discovery">
                          Discovery Produced
                        </option>
                        <option className="bg-surface-container" value="misc">
                          Miscellaneous / Other
                        </option>
                      </select>
                      <span className="material-symbols-outlined absolute right-0 top-1 text-outline pointer-events-none">
                        arrow_drop_down
                      </span>
                    </div>
                  </div>
                </div>
                {/* Row 2: Narrative */}
                <div className="flex flex-col gap-xs">
                  <label className="font-label-caps text-label-caps text-on-surface-variant flex justify-between">
                    Narrative Description
                    <span className="text-outline font-data-mono normal-case">0 / 500</span>
                  </label>
                  <textarea
                    className="input-blank font-body-md text-body-md w-full min-h-[120px] resize-none text-on-surface"
                    placeholder="Detail the specific occurrences, facts, or claims pertaining to this event..."
                  ></textarea>
                </div>
                {/* Row 3: Evidence Link */}
                <div className="flex flex-col gap-xs p-md bg-surface-container-low border border-outline-variant">
                  <label className="font-label-caps text-label-caps text-on-surface-variant flex items-center gap-sm">
                    <span className="material-symbols-outlined text-[16px]">link</span>
                    Attach Evidence (Exhibit Locker)
                  </label>
                  <div className="relative mt-2">
                    <select className="input-blank font-data-mono text-data-mono w-full pb-1 text-secondary appearance-none bg-transparent cursor-pointer">
                      <option className="bg-surface-container" disabled selected value="">
                        Select exhibit to link...
                      </option>
                      <option className="bg-surface-container" value="exhibit_a">
                        EX-A: Surveillance Footage (24-CV-8821-A)
                      </option>
                      <option className="bg-surface-container" value="exhibit_b">
                        EX-B: Forensic Report (24-CV-8821-B)
                      </option>
                      <option className="bg-surface-container" value="exhibit_c">
                        EX-C: Witness Statement (Smith)
                      </option>
                    </select>
                    <span className="material-symbols-outlined absolute right-0 top-1 text-outline pointer-events-none">
                      arrow_drop_down
                    </span>
                  </div>
                </div>
              </form>
            </div>
            {/* Action Bar */}
            <div className="flex justify-end gap-md mt-auto pt-md">
              <button className="px-lg py-sm border border-outline text-on-surface font-data-mono text-data-mono hover:bg-surface-container-high transition-colors">
                DISCARD
              </button>
              <button className="px-lg py-sm bg-primary text-on-primary font-label-caps text-label-caps font-bold flex items-center gap-sm hover:bg-primary-fixed shadow-active transition-all">
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>save</span>
                COMMIT TO RECORD
              </button>
            </div>
          </div>

          {/* Right Column: Inspector Panel */}
          <div className="hidden lg:flex flex-col w-[350px] shrink-0 border-l border-outline-variant pl-lg z-10 h-full sticky top-24">
            <h3 className="font-headline-md text-[18px] text-primary uppercase tracking-wide border-b border-outline-variant pb-sm mb-md flex items-center gap-sm">
              <span className="material-symbols-outlined">preview</span>
              Chronology Preview
            </h3>
            <p className="font-body-md text-[14px] text-on-surface-variant mb-lg">
              This is how the event will appear in the finalized case timeline.
            </p>
            {/* Preview Node */}
            <div className="relative pl-lg py-md">
              <div className="absolute left-[11px] top-0 bottom-0 w-[2px] bg-outline-variant"></div>
              <div className="absolute left-0 top-5 w-6 h-6 rounded-full border-2 border-secondary bg-surface-container-low flex items-center justify-center z-10">
                <div className="w-2 h-2 rounded-full bg-secondary animate-pulse"></div>
              </div>
              <div className="bg-surface-container border border-outline-variant p-md">
                <div className="font-data-mono text-[12px] text-secondary mb-xs opacity-70">PENDING TIMESTAMP</div>
                <div className="font-headline-md text-[16px] text-primary mb-sm leading-tight">Pending Category</div>
                <div className="font-body-md text-[14px] text-on-surface-variant line-clamp-3 italic opacity-50">
                  Narrative preview will appear here as you type...
                </div>
                <div className="mt-md pt-sm border-t border-outline-variant/50 flex items-center gap-xs text-[12px] font-data-mono text-outline">
                  <span className="material-symbols-outlined text-[14px]">attachment</span>
                  No exhibit linked
                </div>
              </div>
            </div>
            {/* Dummy Previous Event */}
            <div className="relative pl-lg py-md opacity-40">
              <div className="absolute left-[11px] top-0 bottom-0 w-[2px] bg-outline-variant"></div>
              <div className="absolute left-0 top-5 w-6 h-6 rounded-full border-2 border-outline-variant bg-surface-container-low flex items-center justify-center z-10">
                <span className="material-symbols-outlined text-[12px] text-outline">check</span>
              </div>
              <div className="bg-surface-container-lowest border border-outline-variant p-md">
                <div className="font-data-mono text-[12px] text-outline mb-xs">2024-05-12 09:00</div>
                <div className="font-headline-md text-[16px] text-on-surface-variant mb-sm leading-tight">Initial Arraignment</div>
                <div className="font-body-md text-[14px] text-on-surface-variant line-clamp-2">
                  Defendant appeared before Judge Caldwell. Entered plea of not guilty to all counts.
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}