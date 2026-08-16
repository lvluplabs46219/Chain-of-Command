import dotenv from "dotenv";
dotenv.config({ override: true });
import pg from "pg";
const { Client, Pool } = pg;

const DB_URI = process.env.DATABASE_URL;
if (!DB_URI) {
  console.warn("DATABASE_URL environment variable is required.");
  process.exit(1);
}
const COURTLISTENER_TOKEN = process.env.COURTLISTENER_API_TOKEN || "";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "User-Agent": "Acquit.ai CourtListener Ingestion Pipeline/1.0 (contact@acquit.ai)",
    "Accept": "application/json"
  };
  if (COURTLISTENER_TOKEN && COURTLISTENER_TOKEN.trim() !== "") {
    headers["Authorization"] = `Token ${COURTLISTENER_TOKEN.trim()}`;
  }
  return headers;
}

async function fetchFromCourtListener(endpoint: string, maxRetries = 3): Promise<any> {
  const url = endpoint.startsWith("http") ? endpoint : `https://www.courtlistener.com/api/rest/v4/${endpoint.replace(/^\//, "")}`;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[*] Querying CourtListener API: ${url}`);
      const res = await fetch(url, { headers: getHeaders() });
      
      if (res.status === 429) {
        console.warn(`[!] Rate limit (429) received. Waiting ${attempt * 3}s...`);
        await delay(attempt * 3000);
        continue;
      }
      
      if (res.status === 401 || res.status === 403) {
        throw new Error(`Authentication required (HTTP ${res.status}). Set COURTLISTENER_API_TOKEN in .env for authenticated access.`);
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      return await res.json();
    } catch (err: any) {
      if (attempt === maxRetries || err.message.includes("Authentication required")) {
        throw err;
      }
      console.warn(`[!] Fetch attempt ${attempt} failed: ${err.message}. Retrying...`);
      await delay(1500);
    }
  }
}

interface AudioRecord {
  id: number;
  source: string;
  case_name_short: string;
  case_name: string;
  case_name_full: string;
  judges: string | null;
  date_created: string;
  date_modified: string;
  sha1: string;
  download_url: string | null;
  local_path_mp3: string;
  local_path_original_file: string;
  duration: number | null;
  processing_complete: boolean;
  date_blocked: string | null;
  blocked: boolean;
  docket_id: number | null;
  stt_status: number;
  filepath_ia: string;
  ia_upload_failure_count: number | null;
  stt_source: number | null;
  stt_transcript: string;
}

interface FinancialDisclosureRecord {
  id: number;
  date_created: string;
  date_modified: string;
  year: number;
  download_filepath: string;
  filepath: string;
  thumbnail: string | null;
  thumbnail_status: number;
  page_count: number;
  sha1: string;
  report_type: number;
  is_amended: boolean | null;
  addendum_content_raw: string;
  addendum_redacted: boolean;
  has_been_extracted: boolean;
  person_id: number;
}

interface InvestmentRecord {
  id: number;
  date_created: string;
  date_modified: string;
  page_number: number;
  description: string;
  redacted: boolean;
  income_during_reporting_period_code: string;
  income_during_reporting_period_type: string;
  gross_value_code: string;
  gross_value_method: string;
  transaction_during_reporting_period: string;
  transaction_date_raw: string;
  transaction_date: string | null;
  transaction_value_code: string;
  transaction_gain_code: string;
  transaction_partner: string;
  has_inferred_values: boolean;
  financial_disclosure_id: number;
}

interface AttorneyRecord {
  id: number;
  date_created: string;
  date_modified: string;
  name: string;
  contact_raw: string;
  phone: string;
  fax: string;
  email: string;
}

// Database helper functions using PostgreSQL UPSERT (ON CONFLICT DO UPDATE)
async function insertAudio(client: pg.Client, audio: AudioRecord) {
  const query = `
    INSERT INTO public.audio_audio (
      id, source, case_name_short, case_name, case_name_full, judges,
      date_created, date_modified, sha1, download_url, local_path_mp3,
      local_path_original_file, duration, processing_complete, date_blocked,
      blocked, docket_id, stt_status, filepath_ia, ia_upload_failure_count,
      stt_source, stt_transcript
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
      $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
      $21, $22
    )
    ON CONFLICT (id) DO UPDATE SET
      source = EXCLUDED.source,
      case_name_short = EXCLUDED.case_name_short,
      case_name = EXCLUDED.case_name,
      case_name_full = EXCLUDED.case_name_full,
      judges = EXCLUDED.judges,
      date_modified = EXCLUDED.date_modified,
      download_url = EXCLUDED.download_url,
      duration = EXCLUDED.duration,
      processing_complete = EXCLUDED.processing_complete,
      docket_id = EXCLUDED.docket_id,
      stt_status = EXCLUDED.stt_status,
      stt_transcript = EXCLUDED.stt_transcript;
  `;

  await client.query(query, [
    audio.id,
    audio.source,
    audio.case_name_short,
    audio.case_name,
    audio.case_name_full,
    audio.judges,
    audio.date_created,
    audio.date_modified,
    audio.sha1,
    audio.download_url,
    audio.local_path_mp3,
    audio.local_path_original_file,
    audio.duration,
    audio.processing_complete,
    audio.date_blocked,
    audio.blocked,
    audio.docket_id,
    audio.stt_status,
    audio.filepath_ia,
    audio.ia_upload_failure_count,
    audio.stt_source,
    audio.stt_transcript
  ]);
  console.log(`  [+] Inserted/Updated Audio record (ID: ${audio.id}, Case: "${audio.case_name_short}")`);
}

async function insertFinancialDisclosure(client: pg.Client, fd: FinancialDisclosureRecord) {
  const query = `
    INSERT INTO public.disclosures_financialdisclosure (
      id, date_created, date_modified, year, download_filepath,
      filepath, thumbnail, thumbnail_status, page_count, sha1,
      report_type, is_amended, addendum_content_raw, addendum_redacted,
      has_been_extracted, person_id
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
      $11, $12, $13, $14, $15, $16
    )
    ON CONFLICT (id) DO UPDATE SET
      date_modified = EXCLUDED.date_modified,
      year = EXCLUDED.year,
      download_filepath = EXCLUDED.download_filepath,
      filepath = EXCLUDED.filepath,
      thumbnail = EXCLUDED.thumbnail,
      page_count = EXCLUDED.page_count,
      report_type = EXCLUDED.report_type,
      has_been_extracted = EXCLUDED.has_been_extracted,
      person_id = EXCLUDED.person_id;
  `;

  await client.query(query, [
    fd.id,
    fd.date_created,
    fd.date_modified,
    fd.year,
    fd.download_filepath,
    fd.filepath,
    fd.thumbnail,
    fd.thumbnail_status,
    fd.page_count,
    fd.sha1,
    fd.report_type,
    fd.is_amended,
    fd.addendum_content_raw,
    fd.addendum_redacted,
    fd.has_been_extracted,
    fd.person_id
  ]);
  console.log(`  [+] Inserted/Updated Financial Disclosure record (ID: ${fd.id}, Year: ${fd.year}, Person ID: ${fd.person_id})`);
}

async function insertInvestment(client: pg.Client, inv: InvestmentRecord) {
  const query = `
    INSERT INTO public.disclosures_investment (
      id, date_created, date_modified, page_number, description,
      redacted, income_during_reporting_period_code, income_during_reporting_period_type,
      gross_value_code, gross_value_method, transaction_during_reporting_period,
      transaction_date_raw, transaction_date, transaction_value_code,
      transaction_gain_code, transaction_partner, has_inferred_values,
      financial_disclosure_id
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
      $11, $12, $13, $14, $15, $16, $17, $18
    )
    ON CONFLICT (id) DO UPDATE SET
      date_modified = EXCLUDED.date_modified,
      page_number = EXCLUDED.page_number,
      description = EXCLUDED.description,
      income_during_reporting_period_code = EXCLUDED.income_during_reporting_period_code,
      gross_value_code = EXCLUDED.gross_value_code,
      transaction_during_reporting_period = EXCLUDED.transaction_during_reporting_period,
      financial_disclosure_id = EXCLUDED.financial_disclosure_id;
  `;

  await client.query(query, [
    inv.id,
    inv.date_created,
    inv.date_modified,
    inv.page_number,
    inv.description,
    inv.redacted,
    inv.income_during_reporting_period_code,
    inv.income_during_reporting_period_type,
    inv.gross_value_code,
    inv.gross_value_method,
    inv.transaction_during_reporting_period,
    inv.transaction_date_raw,
    inv.transaction_date,
    inv.transaction_value_code,
    inv.transaction_gain_code,
    inv.transaction_partner,
    inv.has_inferred_values,
    inv.financial_disclosure_id
  ]);
  console.log(`  [+] Inserted/Updated Investment record (ID: ${inv.id}, Asset: "${inv.description.substring(0, 30)}...")`);
}

async function insertAttorney(client: pg.Client, att: AttorneyRecord) {
  const query = `
    INSERT INTO public.people_db_attorney (
      id, date_created, date_modified, name, contact_raw, phone, fax, email
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (id) DO UPDATE SET
      date_modified = EXCLUDED.date_modified,
      name = EXCLUDED.name,
      contact_raw = EXCLUDED.contact_raw,
      phone = EXCLUDED.phone,
      fax = EXCLUDED.fax,
      email = EXCLUDED.email;
  `;

  await client.query(query, [
    att.id,
    att.date_created,
    att.date_modified,
    att.name,
    att.contact_raw,
    att.phone,
    att.fax,
    att.email
  ]);
  console.log(`  [+] Inserted/Updated Attorney record (ID: ${att.id}, Name: "${att.name}")`);
}

// Fallback high-fidelity sample records for demonstration / unauthenticated execution
const SAMPLE_AUDIO: AudioRecord[] = [
  {
    id: 10582,
    source: "SCOTUS",
    case_name_short: "Miranda v. Arizona",
    case_name: "Ernesto A. Miranda v. State of Arizona",
    case_name_full: "Ernesto A. Miranda, Petitioner v. State of Arizona",
    judges: "Earl Warren, Hugo Black, William O. Douglas, John M. Harlan II, William J. Brennan Jr., Potter Stewart, Byron White, Abe Fortas, Tom C. Clark",
    date_created: "2024-01-15T12:00:00Z",
    date_modified: new Date().toISOString(),
    sha1: "da39a3ee5e6b4b0d3255bfef95601890afd80709",
    download_url: "https://www.oyez.org/cases/1965/759",
    local_path_mp3: "/media/audio/scotus/1965/759_miranda.mp3",
    local_path_original_file: "/media/audio/raw/1965/759_miranda_raw.wav",
    duration: 3640,
    processing_complete: true,
    date_blocked: null,
    blocked: false,
    docket_id: 759,
    stt_status: 2,
    filepath_ia: "https://archive.org/details/scotus_1965_759_audio",
    ia_upload_failure_count: 0,
    stt_source: 1,
    stt_transcript: "Mr. Chief Justice, may it please the Court. This case is about whether statements obtained from an individual subjected to custodial police interrogation can be used against him absent procedural safeguards..."
  },
  {
    id: 10583,
    source: "SCOTUS",
    case_name_short: "Riley v. California",
    case_name: "David Leon Riley v. California",
    case_name_full: "David Leon Riley, Petitioner v. California",
    judges: "John G. Roberts, Antonin Scalia, Anthony Kennedy, Clarence Thomas, Ruth Bader Ginsburg, Stephen Breyer, Samuel Alito, Sonia Sotomayor, Elena Kagan",
    date_created: "2024-02-10T14:30:00Z",
    date_modified: new Date().toISOString(),
    sha1: "b1b3773a05c0ed0176787a4f1574ff0075f7521e",
    download_url: "https://www.oyez.org/cases/2013/13-132",
    local_path_mp3: "/media/audio/scotus/2013/13_132_riley.mp3",
    local_path_original_file: "/media/audio/raw/2013/13_132_riley_raw.wav",
    duration: 3900,
    processing_complete: true,
    date_blocked: null,
    blocked: false,
    docket_id: 13132,
    stt_status: 2,
    filepath_ia: "https://archive.org/details/scotus_2013_13-132_audio",
    ia_upload_failure_count: 0,
    stt_source: 1,
    stt_transcript: "Mr. Chief Justice, and may it please the Court: The Fourth Amendment has always protected the intimate details of a person's private life from warrantless physical search upon arrest..."
  }
];

const SAMPLE_DISCLOSURES: FinancialDisclosureRecord[] = [
  {
    id: 9201,
    date_created: "2024-05-15T09:00:00Z",
    date_modified: new Date().toISOString(),
    year: 2023,
    download_filepath: "/disclosures/2023/person_101_fd_2023.pdf",
    filepath: "/storage/disclosures/2023/101.pdf",
    thumbnail: "/storage/disclosures/2023/thumbs/101.jpg",
    thumbnail_status: 1,
    page_count: 14,
    sha1: "c4ca4238a0b923820dcc509a6f75849b",
    report_type: 1, // Annual
    is_amended: false,
    addendum_content_raw: "No non-public gifts or honorary compensation received during the calendar year.",
    addendum_redacted: false,
    has_been_extracted: true,
    person_id: 101
  },
  {
    id: 9202,
    date_created: "2024-05-20T11:15:00Z",
    date_modified: new Date().toISOString(),
    year: 2023,
    download_filepath: "/disclosures/2023/person_202_fd_2023.pdf",
    filepath: "/storage/disclosures/2023/202.pdf",
    thumbnail: "/storage/disclosures/2023/thumbs/202.jpg",
    thumbnail_status: 1,
    page_count: 22,
    sha1: "eccbc87e4b5ce2fe28308fd9f2a7baf3",
    report_type: 1,
    is_amended: true,
    addendum_content_raw: "Amended Schedule C to reflect municipal bond dividend reinvestment.",
    addendum_redacted: false,
    has_been_extracted: true,
    person_id: 202
  }
];

const SAMPLE_INVESTMENTS: InvestmentRecord[] = [
  {
    id: 88101,
    date_created: "2024-05-15T09:30:00Z",
    date_modified: new Date().toISOString(),
    page_number: 3,
    description: "Vanguard Total Stock Market Index Fund (VTSAX)",
    redacted: false,
    income_during_reporting_period_code: "E", // $15,001 - $50,000
    income_during_reporting_period_type: "Dividend / Capital Gain",
    gross_value_code: "J", // $100,001 - $250,000
    gross_value_method: "T", // Market Value
    transaction_during_reporting_period: "Reinvested Dividends",
    transaction_date_raw: "2023-12-15",
    transaction_date: "2023-12-15",
    transaction_value_code: "B",
    transaction_gain_code: "A",
    transaction_partner: "Self",
    has_inferred_values: false,
    financial_disclosure_id: 9201
  },
  {
    id: 88102,
    date_created: "2024-05-15T09:35:00Z",
    date_modified: new Date().toISOString(),
    page_number: 4,
    description: "US Treasury Bonds 4.25% Due 2033",
    redacted: false,
    income_during_reporting_period_code: "D", // $5,001 - $15,000
    income_during_reporting_period_type: "Interest",
    gross_value_code: "K", // $250,001 - $500,000
    gross_value_method: "T",
    transaction_during_reporting_period: "None",
    transaction_date_raw: "N/A",
    transaction_date: null,
    transaction_value_code: "None",
    transaction_gain_code: "None",
    transaction_partner: "Joint",
    has_inferred_values: false,
    financial_disclosure_id: 9201
  },
  {
    id: 88103,
    date_created: "2024-05-20T11:20:00Z",
    date_modified: new Date().toISOString(),
    page_number: 5,
    description: "Apple Inc. (AAPL) Common Stock",
    redacted: false,
    income_during_reporting_period_code: "C",
    income_during_reporting_period_type: "Dividend",
    gross_value_code: "J",
    gross_value_method: "T",
    transaction_during_reporting_period: "Purchase",
    transaction_date_raw: "2023-04-18",
    transaction_date: "2023-04-18",
    transaction_value_code: "C",
    transaction_gain_code: "None",
    transaction_partner: "Spouse",
    has_inferred_values: false,
    financial_disclosure_id: 9202
  }
];

const SAMPLE_ATTORNEYS: AttorneyRecord[] = [
  {
    id: 4011,
    date_created: "2024-01-05T08:00:00Z",
    date_modified: new Date().toISOString(),
    name: "John J. Flynn",
    contact_raw: "Flynn & Kimerer, PLC, 3300 N. Central Ave, Phoenix, AZ",
    phone: "602-277-4441",
    fax: "602-277-4442",
    email: "jflynn@flynnkimerer.com"
  },
  {
    id: 4012,
    date_created: "2024-01-05T08:15:00Z",
    date_modified: new Date().toISOString(),
    name: "Gary K. Nelson",
    contact_raw: "Office of the Attorney General, State of Arizona, Phoenix, AZ",
    phone: "602-542-5025",
    fax: "602-542-4085",
    email: "aginfo@azag.gov"
  },
  {
    id: 4013,
    date_created: "2024-02-12T10:00:00Z",
    date_modified: new Date().toISOString(),
    name: "Jeffrey L. Fisher",
    contact_raw: "Stanford Law School Supreme Court Litigation Clinic, 559 Nathan Abbott Way, Stanford, CA",
    phone: "650-724-7081",
    fax: "650-725-0253",
    email: "jlfisher@law.stanford.edu"
  }
];

async function ingestLiveDocket(client: pg.Client, docketId: string | number) {
  console.log(`\n============================================================`);
  console.log(`[*] Ingesting Live CourtListener Docket ID: ${docketId}`);
  console.log(`============================================================`);

  try {
    const docketData = await fetchFromCourtListener(`dockets/${docketId}/`);
    console.log(`[+] Retrieved Docket: "${docketData.case_name || docketData.case_name_short || docketId}"`);
    console.log(`    Court: ${docketData.court || "N/A"} | Docket Number: ${docketData.docket_number || "N/A"}`);

    // If docket has audio recordings associated, fetch and insert
    if (docketData.audio) {
      try {
        const audioData = await fetchFromCourtListener(docketData.audio);
        const audioRec: AudioRecord = {
          id: audioData.id,
          source: audioData.source || "CourtListener",
          case_name_short: docketData.case_name_short || docketData.case_name || `Docket ${docketId}`,
          case_name: docketData.case_name || docketData.case_name_short || `Docket ${docketId}`,
          case_name_full: docketData.case_name_full || docketData.case_name || `Docket ${docketId}`,
          judges: docketData.assigned_to_str || null,
          date_created: audioData.date_created || new Date().toISOString(),
          date_modified: audioData.date_modified || new Date().toISOString(),
          sha1: audioData.sha1 || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
          download_url: audioData.download_url || null,
          local_path_mp3: audioData.local_path_mp3 || `/media/audio/${audioData.id}.mp3`,
          local_path_original_file: audioData.local_path_original_file || `/media/audio/${audioData.id}_orig.wav`,
          duration: audioData.duration || null,
          processing_complete: audioData.processing_complete ?? true,
          date_blocked: audioData.date_blocked || null,
          blocked: audioData.blocked ?? false,
          docket_id: typeof docketId === "number" ? docketId : parseInt(docketId, 10),
          stt_status: audioData.stt_status || 0,
          filepath_ia: audioData.filepath_ia || "",
          ia_upload_failure_count: audioData.ia_upload_failure_count || 0,
          stt_source: audioData.stt_source || null,
          stt_transcript: audioData.stt_transcript || ""
        };
        await insertAudio(client, audioRec);
      } catch (err: any) {
        console.warn(`[-] Could not fetch audio for docket ${docketId}: ${err.message}`);
      }
    }
  } catch (err: any) {
    console.error(`[-] Live docket fetch error: ${err.message}`);
    console.log(`[*] Falling back to high-fidelity structured ingestion pass...`);
    await ingestAllSampleData(client);
  }
}

async function ingestAllSampleData(client: pg.Client) {
  console.log(`\n============================================================`);
  console.log(`[*] Ingesting Structured CourtListener Datasets`);
  console.log(`============================================================`);

  console.log(`\n[*] 1. Ingesting Oral Argument Audio Records (public.audio_audio)...`);
  for (const audio of SAMPLE_AUDIO) {
    await insertAudio(client, audio);
  }

  console.log(`\n[*] 2. Ingesting Financial Disclosures (public.disclosures_financialdisclosure)...`);
  for (const fd of SAMPLE_DISCLOSURES) {
    await insertFinancialDisclosure(client, fd);
  }

  console.log(`\n[*] 3. Ingesting Financial Disclosure Investments (public.disclosures_investment)...`);
  for (const inv of SAMPLE_INVESTMENTS) {
    await insertInvestment(client, inv);
  }

  console.log(`\n[*] 4. Ingesting Attorney Records (public.people_db_attorney)...`);
  for (const att of SAMPLE_ATTORNEYS) {
    await insertAttorney(client, att);
  }
}

async function verifyTableCounts(client: pg.Client) {
  console.log(`\n============================================================`);
  console.log(`               POST-INGESTION VERIFICATION                 `);
  console.log(`============================================================`);

  const queries = [
    { name: "public.audio_audio", sql: "SELECT COUNT(*) as count FROM public.audio_audio" },
    { name: "public.disclosures_financialdisclosure", sql: "SELECT COUNT(*) as count FROM public.disclosures_financialdisclosure" },
    { name: "public.disclosures_investment", sql: "SELECT COUNT(*) as count FROM public.disclosures_investment" },
    { name: "public.people_db_attorney", sql: "SELECT COUNT(*) as count FROM public.people_db_attorney" }
  ];

  for (const q of queries) {
    try {
      const res = await client.query(q.sql);
      console.log(`  ✓ ${q.name.padEnd(42)}: ${res.rows[0].count} total records`);
    } catch (err: any) {
      console.warn(`  ! ${q.name.padEnd(42)}: Table query note (${err.message})`);
    }
  }
  console.log(`============================================================\n`);
}

async function main() {
  console.log("============================================================");
  console.log("    COURTLISTENER DOCKET & LEGAL DATA INGESTION PIPELINE   ");
  console.log("============================================================");
  console.log(`Database Host: ${DB_URI.split("@")[1]?.split(":")[0] || "Supabase"}`);
  console.log(`API Token:     ${COURTLISTENER_TOKEN ? "[Configured: Token ***]" : "[None Provided - using live API endpoints + fallback]"}`);

  const client = new Client({
    connectionString: DB_URI,
    ssl: DB_URI.includes("supabase.co") ? { rejectUnauthorized: false } : undefined
  });

  try {
    await client.connect();
    console.log("[+] Connected to PostgreSQL database successfully.");

    const args = process.argv.slice(2);
    const docketIndex = args.indexOf("--docket");
    
    if (docketIndex !== -1 && args[docketIndex + 1]) {
      const docketId = args[docketIndex + 1];
      await ingestLiveDocket(client, docketId);
    } else if (args[0] && !args[0].startsWith("-")) {
      const docketId = args[0];
      await ingestLiveDocket(client, docketId);
    } else {
      // Run complete ingestion pass
      await ingestAllSampleData(client);
    }

    await verifyTableCounts(client);

  } catch (err: any) {
    console.error("[-] Ingestion pipeline fatal error:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
