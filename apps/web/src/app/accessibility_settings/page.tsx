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
  body { font-family: 'Hanken Grotesk', sans-serif; }
  .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
  .material-symbols-outlined.fill { font-variation-settings: 'FILL' 1; }
  .toggle-checkbox:checked { right: 0; border-color: #c6c6c9; }
  .toggle-checkbox:checked + .toggle-label { background-color: #c6c6c9; }
  .toggle-checkbox:checked + .toggle-label:after { transform: translateX(100%); border-color: white; }
`;

export default function AccessibilitySettings() {
  return (
    <>
      <Head>
        <title>Acquit.ai - Accessibility Settings</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          href="https://fonts.googleapis.com/css2?family=Domine:wght@400;600;700&family=Hanken+Grotesk:wght@400;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
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

      <div className="flex h-screen overflow-hidden bg-background text-on-surface antialiased min-h-screen">
        <main className="flex-1 overflow-y-auto w-full flex justify-center p-gutter md:p-margin-safe bg-background">
          <div className="w-full max-w-4xl max-w-[1200px] flex flex-col gap-lg md:gap-xl">
            {/* Page Header */}
            <header className="flex items-center justify-between border-b border-outline-variant pb-md">
              <div className="flex items-center gap-sm">
                <button className="text-primary hover:bg-surface-container-high p-sm rounded transition-colors duration-150 flex items-center justify-center">
                  <span aria-hidden="true" className="material-symbols-outlined">arrow_back</span>
                </button>
                <div>
                  <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
                    Accessibility
                  </h1>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                    Configure visual and interaction preferences for Acquit.ai.
                  </p>
                </div>
              </div>
              <div>
                <button className="bg-primary text-background font-label-caps text-label-caps px-lg py-sm rounded hover:bg-primary-fixed-dim transition-colors border border-primary">
                  SAVE PREFERENCES
                </button>
              </div>
            </header>

            {/* Settings Canvas */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg h-full pb-xl">
              {/* Controls Column */}
              <div className="lg:col-span-7 flex flex-col gap-md">
                {/* Visual Panel */}
                <section className="bg-surface-container-low border border-outline-variant p-lg rounded flex flex-col gap-lg">
                  <h2 className="font-headline-md text-headline-md text-primary flex items-center gap-sm border-b border-outline-variant pb-sm">
                    <span className="material-symbols-outlined">visibility</span> Visual
                  </h2>
                  
                  {/* Font Scaling */}
                  <div className="flex flex-col gap-sm">
                    <div className="flex justify-between items-center">
                      <label className="font-body-lg text-body-lg text-on-surface">Font Scaling</label>
                      <span className="font-data-mono text-data-mono text-primary">100%</span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant mb-2">
                      Adjust the base text size across the application.
                    </p>
                    <input
                      className="w-full h-2 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-primary"
                      max="150"
                      min="80"
                      type="range"
                      defaultValue="100"
                    />
                    <div className="flex justify-between mt-1 text-on-surface-variant font-data-mono text-[10px]">
                      <span>A</span>
                      <span className="text-sm">A</span>
                      <span className="text-base">A</span>
                      <span className="text-lg">A</span>
                    </div>
                  </div>
                  
                  <hr className="border-outline-variant" />

                  {/* High Contrast Mode */}
                  <div className="flex items-start justify-between gap-md">
                    <div>
                      <h3 className="font-body-lg text-body-lg text-on-surface">High Contrast Mode</h3>
                      <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                        Increases contrast between text and backgrounds to improve readability.
                      </p>
                    </div>
                    <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in mt-1">
                      <input
                        className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-surface-container border-4 border-outline-variant appearance-none cursor-pointer transition-transform duration-200 ease-in-out z-10"
                        id="toggle_contrast"
                        name="toggle_contrast"
                        type="checkbox"
                      />
                      <label
                        className="toggle-label block overflow-hidden h-6 rounded-full bg-surface-variant cursor-pointer border border-outline-variant"
                        htmlFor="toggle_contrast"
                      ></label>
                    </div>
                  </div>
                </section>

                {/* Interaction Panel */}
                <section className="bg-surface-container-low border border-outline-variant p-lg rounded flex flex-col gap-lg">
                  <h2 className="font-headline-md text-headline-md text-primary flex items-center gap-sm border-b border-outline-variant pb-sm">
                    <span className="material-symbols-outlined">touch_app</span> Interaction
                  </h2>

                  {/* Motion Reduction */}
                  <div className="flex items-start justify-between gap-md">
                    <div>
                      <h3 className="font-body-lg text-body-lg text-on-surface">Motion Reduction</h3>
                      <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                        Disables non-essential animations and transitions.
                      </p>
                    </div>
                    <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in mt-1">
                      <input
                        className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-primary border-4 border-primary appearance-none cursor-pointer transition-transform duration-200 ease-in-out z-10 translate-x-full"
                        id="toggle_motion"
                        name="toggle_motion"
                        type="checkbox"
                        defaultChecked
                      />
                      <label
                        className="toggle-label block overflow-hidden h-6 rounded-full bg-surface-variant cursor-pointer border border-outline-variant"
                        htmlFor="toggle_motion"
                      ></label>
                    </div>
                  </div>

                  <hr className="border-outline-variant" />

                  {/* Screen Reader Optimization */}
                  <div className="flex items-start justify-between gap-md">
                    <div>
                      <h3 className="font-body-lg text-body-lg text-on-surface">Screen Reader Optimization</h3>
                      <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                        Enables verbose ARIA labels and optimizes focus management for assistive technologies.
                      </p>
                    </div>
                    <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in mt-1">
                      <input
                        className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-surface-container border-4 border-outline-variant appearance-none cursor-pointer transition-transform duration-200 ease-in-out z-10"
                        id="toggle_sr"
                        name="toggle_sr"
                        type="checkbox"
                      />
                      <label
                        className="toggle-label block overflow-hidden h-6 rounded-full bg-surface-variant cursor-pointer border border-outline-variant"
                        htmlFor="toggle_sr"
                      ></label>
                    </div>
                  </div>
                </section>
              </div>

              {/* Preview Pane */}
              <div className="lg:col-span-5 h-full">
                <aside className="sticky top-gutter border border-outline-variant bg-surface-container rounded flex flex-col h-full min-h-[400px]">
                  <div className="bg-surface-container-highest px-md py-sm border-b border-outline-variant flex items-center gap-sm rounded-t">
                    <span className="material-symbols-outlined text-primary text-sm">preview</span>
                    <span className="font-label-caps text-label-caps text-on-surface-variant">Live Preview</span>
                  </div>
                  <div className="p-lg flex-1 bg-background m-sm border border-outline-variant rounded-sm flex flex-col gap-md">
                    {/* Mock Document Header */}
                    <div className="border-b border-outline-variant pb-sm">
                      <h4 className="font-headline-md text-headline-md text-on-surface">Motion for Summary Judgment</h4>
                      <div className="flex items-center gap-md mt-2">
                        <span className="font-data-mono text-data-mono text-primary flex items-center gap-xs">
                          <span className="material-symbols-outlined text-xs">tag</span>2024-CV-8821
                        </span>
                        <span className="font-data-mono text-data-mono text-on-surface-variant">Oct 12, 2024</span>
                      </div>
                    </div>

                    {/* Mock Paragraphs */}
                    <p className="font-body-md text-body-md text-on-surface">
                      COMES NOW the Defendant, through undersigned counsel, and moves this Honorable Court for Summary Judgment pursuant to Rule 56. There exists no genuine dispute as to any material fact, and Defendant is entitled to judgment as a matter of law.
                    </p>
                    <div className="bg-surface-container-low p-md border-l-2 border-primary text-on-surface-variant italic font-body-md text-body-md">
                      "The plaintiff bears the burden of establishing the elements of their claim beyond mere conjecture." (Smith v. State, 412 F.3d 104)
                    </div>

                    {/* Interactive Elements Preview */}
                    <div className="flex gap-sm mt-auto pt-md border-t border-outline-variant">
                      <button className="bg-primary text-background font-label-caps text-label-caps px-md py-xs rounded">
                        Primary Action
                      </button>
                      <button className="border border-outline-variant text-on-surface font-label-caps text-label-caps px-md py-xs rounded">
                        Secondary Action
                      </button>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}