import { Router, type IRouter, type Request, type Response } from "express";

const router: IRouter = Router();

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

const mockLawyers: LawyerListing[] = [
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
    bio: "Former Marion County prosecutor now advocating for criminal defendants in major felony and misdemeanor trials.",
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

router.get("/directory/lawyers", (req: Request, res: Response) => {
  const {
    practiceArea,
    jurisdiction,
    county,
    court,
    language,
    remote,
    consultation,
    tier,
  } = req.query;

  let results = [...mockLawyers];

  if (practiceArea) {
    const paStr = String(practiceArea).toLowerCase();
    results = results.filter((l) =>
      l.practiceAreas.some((p) => p.toLowerCase().includes(paStr))
    );
  }

  if (jurisdiction) {
    const jurStr = String(jurisdiction).toLowerCase();
    results = results.filter((l) =>
      l.states.some((s) => s.toLowerCase().includes(jurStr))
    );
  }

  if (county) {
    const countyStr = String(county).toLowerCase();
    results = results.filter((l) =>
      l.counties.some((c) => c.toLowerCase().includes(countyStr))
    );
  }

  if (court) {
    const courtStr = String(court).toLowerCase();
    results = results.filter((l) =>
      l.courts.some((c) => c.toLowerCase().includes(courtStr))
    );
  }

  if (language) {
    const langStr = String(language).toLowerCase();
    results = results.filter((l) =>
      l.languages.some((lang) => lang.toLowerCase().includes(langStr))
    );
  }

  if (remote === "true") {
    results = results.filter((l) => l.remoteAvailable);
  }

  if (consultation === "true") {
    results = results.filter((l) => l.consultationAvailable);
  }

  if (tier) {
    results = results.filter((l) => l.listingTier === tier);
  }

  // Pure deterministic order matching filters - NO AI ranking
  // Premium/Featured sponsored listings are placed first with clear SPONSORED badge, basic alphabetical after
  results.sort((a, b) => {
    const tierScore = (t: string) => (t === "premium" ? 3 : t === "featured" ? 2 : 1);
    const scoreDiff = tierScore(b.listingTier) - tierScore(a.listingTier);
    if (scoreDiff !== 0) return scoreDiff;
    return a.name.localeCompare(b.name);
  });

  res.json({
    policy: {
      enforced: true,
      name: "ACQUIT ATTORNEY DIRECTORY POLICY",
      aiRecommendationUsed: false,
      disclaimer: "Acquit displays attorney directory listings matching user-selected criteria. Acquit does not endorse, select, or evaluate the competence of any individual attorney or law firm.",
    },
    totalMatches: results.length,
    attorneys: results,
  });
});

router.post("/directory/referrals", (req: Request, res: Response) => {
  const { lawyerId, referralContext } = req.body;
  
  if (!lawyerId || !referralContext) {
    res.status(400).json({ message: "lawyerId and referralContext are required." });
    return;
  }

  // Log referral without case data payload
  res.status(201).json({
    status: "recorded",
    referralId: crypto.randomUUID(),
    lawyerId,
    referralContext: String(referralContext).substring(0, 200), // sanitized string like "criminal defense, Indiana"
    privacyNote: "No case data or confidential documents were transmitted to the attorney.",
  });
});

export default router;
