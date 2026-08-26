import { useState, useMemo } from "react";
import { FeaturedAttorneysCarousel } from "./FeaturedAttorneysCarousel";
import {
  Search,
  Filter,
  ShieldCheck,
  Check,
  Calendar,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Info,
  SlidersHorizontal,
  X,
  Sparkles,
  ArrowRight,
  Gavel,
  Video,
  Award,
  Lock,
  Send,
  Building,
} from "lucide-react";

export interface LawyerListing {
  id: number;
  name: string;
  firmName: string;
  barNumber: string;
  barVerified: boolean;
  practiceAreas: string[];
  states: string[];
  counties: string[];
  courts: string[];
  languages: string[];
  accessibility: string[];
  consultationAvailable: boolean;
  paymentOptions: string[];
  remoteAvailable: boolean;
  listingTier: "basic" | "featured" | "premium";
  ratingAvg: number;
  ratingCount: number;
  calendlyUrl?: string;
  phone?: string;
  email?: string;
  bio: string;
}

const INITIAL_LAWYERS: LawyerListing[] = [
  {
    id: 1,
    name: "Elena Rostova, Esq.",
    firmName: "Rostova Defense Group, P.C.",
    barNumber: "IN #39102",
    barVerified: true,
    practiceAreas: ["Criminal Defense", "Felony Proceedings", "DUI / OWI", "Pretrial Defense"],
    states: ["Indiana"],
    counties: ["Marion County", "Hamilton County", "Hendricks County"],
    courts: ["Marion County Superior Court", "Indiana Court of Appeals"],
    languages: ["English", "Spanish"],
    accessibility: ["Wheelchair Accessible", "Video Consultations", "TTY/TDD"],
    consultationAvailable: true,
    paymentOptions: ["Flat Fee", "Payment Plans", "Credit Card"],
    remoteAvailable: true,
    listingTier: "premium",
    ratingAvg: 4.9,
    ratingCount: 38,
    calendlyUrl: "https://calendly.com",
    phone: "(317) 555-0198",
    email: "contact@rostovadefense.com",
    bio: "Focused exclusively on state and federal criminal defense in Indiana with over 14 years of trial courtroom experience in Marion County Superior Court.",
  },
  {
    id: 2,
    name: "Marcus Vance",
    firmName: "Vance & Associates Legal",
    barNumber: "IN #28471",
    barVerified: true,
    practiceAreas: ["Criminal Defense", "Felony Proceedings", "Post-Conviction", "Appellate"],
    states: ["Indiana"],
    counties: ["Marion County", "Johnson County"],
    courts: ["Marion County Superior Court", "Federal District Court S.D. Ind."],
    languages: ["English"],
    accessibility: ["Video Consultations"],
    consultationAvailable: true,
    paymentOptions: ["Hourly Rate", "Payment Plans"],
    remoteAvailable: true,
    listingTier: "featured",
    ratingAvg: 4.8,
    ratingCount: 22,
    phone: "(317) 555-0144",
    email: "mvance@vancelegal.com",
    bio: "Former Marion County prosecutor now advocating for criminal defendants in major felony and misdemeanor trial proceedings.",
  },
  {
    id: 3,
    name: "Sarah Lin & Associates",
    firmName: "Lin Litigation Partners",
    barNumber: "IN #41209",
    barVerified: true,
    practiceAreas: ["Criminal Defense", "Misdemeanor", "DUI / OWI", "Civil Rights"],
    states: ["Indiana"],
    counties: ["Marion County", "Lake County", "Allen County"],
    courts: ["Marion County Superior Court"],
    languages: ["English", "Mandarin"],
    accessibility: ["Wheelchair Accessible", "Video Consultations"],
    consultationAvailable: true,
    paymentOptions: ["Flat Fee", "Sliding Scale"],
    remoteAvailable: true,
    listingTier: "basic",
    ratingAvg: 4.7,
    ratingCount: 19,
    phone: "(317) 555-0892",
    email: "info@linlitigation.com",
    bio: "Dedicated client advocacy specializing in pretrial resolution, evidentiary suppression hearings, and bench trials.",
  },
  {
    id: 4,
    name: "David O'Connor",
    firmName: "O'Connor Legal Services",
    barNumber: "IN #19283",
    barVerified: true,
    practiceAreas: ["Criminal Defense", "Felony Proceedings", "Federal Crimes"],
    states: ["Indiana"],
    counties: ["Marion County", "Hamilton County"],
    courts: ["Marion County Superior Court", "U.S. District Court"],
    languages: ["English"],
    accessibility: ["Video Consultations"],
    consultationAvailable: false,
    paymentOptions: ["Hourly Rate"],
    remoteAvailable: false,
    listingTier: "basic",
    ratingAvg: 4.9,
    ratingCount: 45,
    phone: "(317) 555-0321",
    email: "doconnor@oconnorlaw.com",
    bio: "Over 20 years representing clients in serious felony charges, white collar defense, and state court litigation.",
  },
  {
    id: 5,
    name: "Amara Thorne",
    firmName: "Thorne Justice Chambers",
    barNumber: "IN #50192",
    barVerified: true,
    practiceAreas: ["Criminal Defense", "Pretrial Defense", "Juvenile Defense", "Appellate"],
    states: ["Indiana"],
    counties: ["Marion County", "Monroe County"],
    courts: ["Marion County Superior Court"],
    languages: ["English", "Spanish", "ASL"],
    accessibility: ["Wheelchair Accessible", "Video Consultations", "TTY/TDD"],
    consultationAvailable: true,
    paymentOptions: ["Flat Fee", "Legal Aid Guidance", "Payment Plans"],
    remoteAvailable: true,
    listingTier: "featured",
    ratingAvg: 5.0,
    ratingCount: 14,
    phone: "(317) 555-0771",
    email: "amara@thornejustice.com",
    bio: "Community-centered criminal defense practitioner focusing on constitutional rights protection and pretrial release advocacy.",
  },
];

interface AttorneyDirectoryProps {
  initialPracticeFilter?: string;
  initialJurisdictionFilter?: string;
}

export function AttorneyDirectory({
  initialPracticeFilter = "",
  initialJurisdictionFilter = "",
}: AttorneyDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPracticeArea, setSelectedPracticeArea] = useState(initialPracticeFilter);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState(initialJurisdictionFilter);
  const [selectedCounty, setSelectedCounty] = useState("");
  const [selectedCourt, setSelectedCourt] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("");
  const [consultationOnly, setConsultationOnly] = useState(false);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [contactingLawyer, setContactingLawyer] = useState<LawyerListing | null>(null);
  const [referralSent, setReferralSent] = useState(false);

  const practiceAreasList = [
    "All practice areas",
    "Criminal Defense",
    "Felony Proceedings",
    "Pretrial Defense",
    "DUI / OWI",
    "Misdemeanor",
    "Appellate",
    "Civil Rights",
  ];

  const jurisdictionsList = ["All jurisdictions", "Indiana", "Illinois", "Ohio", "Kentucky"];
  const countiesList = ["All counties", "Marion County", "Hamilton County", "Hendricks County", "Monroe County"];
  const courtsList = ["All courts", "Marion County Superior Court", "Indiana Court of Appeals", "Federal District Court S.D. Ind."];
  const languagesList = ["All languages", "English", "Spanish", "Mandarin", "ASL"];
  const paymentOptionsList = ["All payment options", "Flat Fee", "Payment Plans", "Hourly Rate", "Sliding Scale", "Legal Aid Guidance"];

  const filteredLawyers = useMemo(() => {
    return INITIAL_LAWYERS.filter((l) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = l.name.toLowerCase().includes(q);
        const matchesFirm = l.firmName.toLowerCase().includes(q);
        const matchesBio = l.bio.toLowerCase().includes(q);
        const matchesPractice = l.practiceAreas.some((p) => p.toLowerCase().includes(q));
        if (!matchesName && !matchesFirm && !matchesBio && !matchesPractice) return false;
      }

      if (
        selectedPracticeArea &&
        selectedPracticeArea !== "All practice areas" &&
        !l.practiceAreas.includes(selectedPracticeArea)
      ) {
        return false;
      }

      if (
        selectedJurisdiction &&
        selectedJurisdiction !== "All jurisdictions" &&
        !l.states.includes(selectedJurisdiction)
      ) {
        return false;
      }

      if (
        selectedCounty &&
        selectedCounty !== "All counties" &&
        !l.counties.includes(selectedCounty)
      ) {
        return false;
      }

      if (
        selectedCourt &&
        selectedCourt !== "All courts" &&
        !l.courts.includes(selectedCourt)
      ) {
        return false;
      }

      if (
        selectedLanguage &&
        selectedLanguage !== "All languages" &&
        !l.languages.includes(selectedLanguage)
      ) {
        return false;
      }

      if (
        selectedPayment &&
        selectedPayment !== "All payment options" &&
        !l.paymentOptions.includes(selectedPayment)
      ) {
        return false;
      }

      if (consultationOnly && !l.consultationAvailable) return false;
      if (remoteOnly && !l.remoteAvailable) return false;

      return true;
    });
  }, [
    searchQuery,
    selectedPracticeArea,
    selectedJurisdiction,
    selectedCounty,
    selectedCourt,
    selectedLanguage,
    selectedPayment,
    consultationOnly,
    remoteOnly,
  ]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedPracticeArea("");
    setSelectedJurisdiction("");
    setSelectedCounty("");
    setSelectedCourt("");
    setSelectedLanguage("");
    setSelectedPayment("");
    setConsultationOnly(false);
    setRemoteOnly(false);
  };

  const handleSendReferral = () => {
    setReferralSent(true);
    setTimeout(() => {
      setContactingLawyer(null);
      setReferralSent(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Hard Policy Enforcer */}
      <div className="rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(255,255,255,0.03)] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white/70">
              <ShieldCheck size={13} /> Acquit Attorney Directory Policy Enforced
            </div>
            <h1 className="font-['Fraunces'] text-[24px] font-semibold text-white/70 sm:text-[28px]">
              Find an Independent Legal Professional
            </h1>
            <p className="max-w-3xl text-xs sm:text-sm text-white/70 leading-relaxed">
              Acquit may identify the type of legal professional a user may wish to seek, but <strong className="text-white/70 underline decoration-[#9bbbb0] underline-offset-2">does not select, rank, endorse, recommend, or vouch for any individual attorney or law firm</strong>.
            </p>
          </div>
          <button
            onClick={() => setShowPolicyModal(true)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-[rgba(255,255,255,0.03)] px-3.5 py-2 text-xs font-bold text-white/70 hover:bg-[rgba(255,255,255,0.03)] transition"
          >
            <Info size={14} /> View Platform Policy
          </button>
        </div>
      </div>

      {/* AI Recommendation Context Notice */}
      <div className="rounded-xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-4 text-xs text-white/70 flex items-start gap-3">
        <Sparkles size={16} className="mt-0.5 text-white/70 shrink-0" />
        <div>
          <span className="font-bold text-white/70">AI Legal Assistant Guidance:</span>
          <p className="mt-0.5">
            Based on your active case details (State of Indiana v. Thompson, Marion County Superior Court), you may want to search for attorneys specializing in <span className="font-semibold text-white/70">Criminal Defense, Pretrial Proceedings, and Felony Matters in Indiana</span>.
          </p>
        </div>
      </div>

      <FeaturedAttorneysCarousel lawyers={INITIAL_LAWYERS} />

      {/* Filter Bar Controls */}
      <div className="rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/70" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by lawyer name, firm, practice area, or keyword..."
              className="w-full rounded-xl border border-white/10 bg-black/40 py-2.5 pl-10 pr-4 text-xs font-medium text-white/70 placeholder-[#8a9e99] focus:border-white/10 focus:outline-none focus:ring-1 focus:ring-[#387067]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white/70"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={clearFilters}
              className="w-full sm:w-auto rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs font-semibold text-white/70 hover:bg-[rgba(255,255,255,0.03)] transition"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Dropdown Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <div>
            <label className="block mb-1 text-[10px] font-bold uppercase tracking-wider text-white/70">
              Practice Area
            </label>
            <select
              value={selectedPracticeArea}
              onChange={(e) => setSelectedPracticeArea(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 text-xs font-medium text-white/70 focus:border-white/10 focus:outline-none"
            >
              {practiceAreasList.map((pa) => (
                <option key={pa} value={pa === "All practice areas" ? "" : pa}>
                  {pa}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-[10px] font-bold uppercase tracking-wider text-white/70">
              Jurisdiction / State
            </label>
            <select
              value={selectedJurisdiction}
              onChange={(e) => setSelectedJurisdiction(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 text-xs font-medium text-white/70 focus:border-white/10 focus:outline-none"
            >
              {jurisdictionsList.map((j) => (
                <option key={j} value={j === "All jurisdictions" ? "" : j}>
                  {j}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-[10px] font-bold uppercase tracking-wider text-white/70">
              County
            </label>
            <select
              value={selectedCounty}
              onChange={(e) => setSelectedCounty(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 text-xs font-medium text-white/70 focus:border-white/10 focus:outline-none"
            >
              {countiesList.map((c) => (
                <option key={c} value={c === "All counties" ? "" : c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-[10px] font-bold uppercase tracking-wider text-white/70">
              Court
            </label>
            <select
              value={selectedCourt}
              onChange={(e) => setSelectedCourt(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 text-xs font-medium text-white/70 focus:border-white/10 focus:outline-none"
            >
              {courtsList.map((c) => (
                <option key={c} value={c === "All courts" ? "" : c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-[10px] font-bold uppercase tracking-wider text-white/70">
              Language
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 text-xs font-medium text-white/70 focus:border-white/10 focus:outline-none"
            >
              {languagesList.map((l) => (
                <option key={l} value={l === "All languages" ? "" : l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-[10px] font-bold uppercase tracking-wider text-white/70">
              Payment Option
            </label>
            <select
              value={selectedPayment}
              onChange={(e) => setSelectedPayment(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 text-xs font-medium text-white/70 focus:border-white/10 focus:outline-none"
            >
              {paymentOptionsList.map((p) => (
                <option key={p} value={p === "All payment options" ? "" : p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="flex flex-wrap items-center gap-4 pt-1 border-t border-white/10">
          <label className="flex items-center gap-2 text-xs font-medium text-white/70 cursor-pointer">
            <input
              type="checkbox"
              checked={consultationOnly}
              onChange={(e) => setConsultationOnly(e.target.checked)}
              className="rounded border-white/10 text-white/70 focus:ring-[#387067]"
            />
            Consultation available
          </label>
          <label className="flex items-center gap-2 text-xs font-medium text-white/70 cursor-pointer">
            <input
              type="checkbox"
              checked={remoteOnly}
              onChange={(e) => setRemoteOnly(e.target.checked)}
              className="rounded border-white/10 text-white/70 focus:ring-[#387067]"
            />
            Remote / Video consultations
          </label>
        </div>
      </div>

      {/* Directory Results Heading */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <h2 className="font-['Fraunces'] text-[20px] font-semibold text-white/70">
            Search Results — {filteredLawyers.length} attorneys matching your selected filters
          </h2>
          <p className="mt-0.5 text-xs text-white/70">
            Listings displayed based strictly on user filter criteria. No AI ranking or endorsement.
          </p>
        </div>
      </div>

      {/* Lawyer Cards List */}
      {filteredLawyers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-[rgba(255,255,255,0.03)] p-8 text-center space-y-3">
          <p className="text-sm font-semibold text-white/70">No attorneys match all your selected filters.</p>
          <p className="text-xs text-white/70">Try clearing some filters or widening your search area.</p>
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/40 px-3.5 py-2 text-xs font-bold text-white/70 hover:bg-[rgba(255,255,255,0.03)]"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLawyers.map((lawyer) => {
            const isSponsored = lawyer.listingTier === "premium" || lawyer.listingTier === "featured";
            return (
              <div
                key={lawyer.id}
                className={`rounded-2xl border p-5 sm:p-6 transition shadow-sm bg-[rgba(255,255,255,0.03)] ${
                  isSponsored ? "border-white/10 ring-1 ring-[#b8d6ca]/40" : "border-white/10"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-['Fraunces'] text-[19px] font-bold text-white/70">
                        {lawyer.name}
                      </h3>

                      {lawyer.barVerified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(255,255,255,0.03)] px-2.5 py-0.5 text-[11px] font-semibold text-white/70">
                          <ShieldCheck size={13} className="text-white/70" /> Bar Verified ({lawyer.barNumber})
                        </span>
                      )}

                      {/* Sponsored / Paid placement badge */}
                      {isSponsored && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-[rgba(255,255,255,0.03)] border border-white/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-white/70 uppercase">
                          <Award size={12} /> Sponsored Listing
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-semibold text-white/70 flex items-center gap-2">
                      <Building size={14} className="text-white/70" /> {lawyer.firmName}
                    </p>

                    <p className="text-xs leading-relaxed text-white/70 pt-1">
                      {lawyer.bio}
                    </p>

                    {/* Practice Areas */}
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {lawyer.practiceAreas.map((pa) => (
                        <span
                          key={pa}
                          className="rounded-md bg-[rgba(255,255,255,0.03)] px-2.5 py-1 text-[11px] font-medium text-white/70"
                        >
                          {pa}
                        </span>
                      ))}
                    </div>

                    {/* Court & Location Details */}
                    <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 pt-2 text-xs text-white/70">
                      <span className="flex items-center gap-1">
                        <MapPin size={13} className="text-white/70" />
                        {lawyer.counties.join(", ")}, {lawyer.states.join(", ")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Gavel size={13} className="text-white/70" />
                        {lawyer.courts.join(", ")}
                      </span>
                      {lawyer.remoteAvailable && (
                        <span className="flex items-center gap-1 text-white/70 font-medium">
                          <Video size={13} /> Remote / Video
                        </span>
                      )}
                    </div>

                    {/* Language & Payment badges */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-white/70">
                      <span><strong>Languages:</strong> {lawyer.languages.join(", ")}</span>
                      <span>•</span>
                      <span><strong>Payment:</strong> {lawyer.paymentOptions.join(", ")}</span>
                    </div>

                    {/* Sponsored Disclaimer Note */}
                    {isSponsored && (
                      <p className="text-[10px] text-white/70 italic pt-1">
                        Sponsored Listing — represents paid enhanced directory placement. Paid placement does not represent an AI recommendation or endorsement by Acquit.
                      </p>
                    )}
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-col gap-2 shrink-0 lg:w-[220px]">
                    {lawyer.consultationAvailable && lawyer.calendlyUrl ? (
                      <a
                        href={lawyer.calendlyUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[rgba(255,255,255,0.03)] px-4 py-2.5 text-xs font-bold text-white/70 hover:bg-[rgba(255,255,255,0.03)] transition shadow-sm"
                      >
                        <Calendar size={14} /> Schedule Consult
                      </a>
                    ) : null}

                    <button
                      onClick={() => setContactingLawyer(lawyer)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-xs font-bold text-white/70 hover:bg-[rgba(255,255,255,0.03)] transition"
                    >
                      <Send size={14} /> Contact / Share Summary
                    </button>

                    {lawyer.phone && (
                      <div className="text-center text-[11px] font-semibold text-white/70 pt-1">
                        <Phone size={12} className="inline mr-1" /> {lawyer.phone}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Acquit Attorney Directory Hard Policy Explanation */}
      {showPolicyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-white/70" />
                <h3 className="font-['Fraunces'] text-[20px] font-bold text-white/70">
                  Acquit Attorney Directory Policy
                </h3>
              </div>
              <button
                onClick={() => setShowPolicyModal(false)}
                className="text-white/70 hover:text-white/70"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
              Acquit operates as an educational legal information platform. To protect user autonomy and maintain ethical boundaries:
            </p>

            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-4 space-y-2">
                <div className="font-bold text-white/70 flex items-center gap-1.5">
                  <Check size={16} className="text-white/70" /> AI MAY:
                </div>
                <ul className="space-y-1.5 text-white/70 list-disc list-inside text-[11px]">
                  <li>Identify relevant practice-area categories</li>
                  <li>Identify jurisdiction requirements</li>
                  <li>Explain different types of attorneys</li>
                  <li>Help users formulate search criteria</li>
                  <li>Explain directory information</li>
                  <li>Display user-selected filters</li>
                  <li>Display attorney-provided profiles</li>
                </ul>
              </div>

              <div className="rounded-xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-4 space-y-2">
                <div className="font-bold text-white/70 flex items-center gap-1.5">
                  <X size={16} className="text-white/70" /> AI MUST NOT:
                </div>
                <ul className="space-y-1.5 text-white/70 list-disc list-inside text-[11px]">
                  <li>Recommend an individual attorney</li>
                  <li>Rank attorneys or evaluate competence</li>
                  <li>Endorse an attorney or claim "best"</li>
                  <li>Select an attorney for the user</li>
                  <li>Favor paid placement as an AI recommendation</li>
                  <li>Send case files without explicit user action</li>
                </ul>
              </div>
            </div>

            <div className="rounded-xl bg-[rgba(255,255,255,0.03)] p-3.5 text-[11px] text-white/70 leading-relaxed">
              <strong>Monetization & Transparency:</strong> Lawyers may pay for an <em>Enhanced Directory Listing</em> or <em>Sponsored Listing</em>, but these are strictly separated from search algorithms and labeled as advertising. Results are displayed strictly according to user-selected filters.
            </div>

            <div className="text-right pt-2">
              <button
                onClick={() => setShowPolicyModal(false)}
                className="rounded-xl bg-[rgba(255,255,255,0.03)] px-5 py-2.5 text-xs font-bold text-white/70 hover:bg-[rgba(255,255,255,0.03)]"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Share Case Summary with Lawyer (User Controlled Step) */}
      {contactingLawyer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-['Fraunces'] text-[18px] font-bold text-white/70">
                  Contact {contactingLawyer.name}
                </h3>
                <p className="text-xs text-white/70">{contactingLawyer.firmName}</p>
              </div>
              <button
                onClick={() => setContactingLawyer(null)}
                className="text-white/70 hover:text-white/70"
              >
                <X size={18} />
              </button>
            </div>

            {referralSent ? (
              <div className="py-8 text-center space-y-2">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(255,255,255,0.03)] text-white/70">
                  <Check size={24} />
                </div>
                <h4 className="font-bold text-white/70 text-sm">Contact Request Sent!</h4>
                <p className="text-xs text-white/70">
                  Your non-confidential search context was sent to {contactingLawyer.name}. No confidential case files were transmitted.
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-xl border border-white/10 bg-black/40 p-3.5 text-xs text-white/70 space-y-2">
                  <p className="font-bold text-white/70 flex items-center gap-1.5">
                    <Lock size={13} /> User-Controlled Referral Payload:
                  </p>
                  <p className="text-[11px] leading-relaxed bg-[rgba(255,255,255,0.03)] p-2.5 rounded-lg font-mono text-white/70">
                    "Client looking for Criminal Defense counsel for State Court Felony proceedings in Marion County, Indiana."
                  </p>
                  <p className="text-[10px] text-white/70 italic">
                    Note: Your private case documents and evidence vault remain strictly private on Acquit.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-white/70">Your Contact Details (Optional)</label>
                  <input
                    type="text"
                    defaultValue="Alex Thompson (alex.thompson@example.com)"
                    className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs font-medium text-white/70"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setContactingLawyer(null)}
                    className="rounded-xl border border-white/10 px-4 py-2 text-xs font-bold text-white/70 hover:bg-[rgba(255,255,255,0.03)]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendReferral}
                    className="rounded-xl bg-[rgba(255,255,255,0.03)] px-4 py-2 text-xs font-bold text-white/70 hover:bg-[rgba(255,255,255,0.03)]"
                  >
                    Confirm & Send Contact Request
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
