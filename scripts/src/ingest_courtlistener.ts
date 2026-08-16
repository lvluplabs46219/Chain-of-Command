import dotenv from "dotenv";
dotenv.config({ override: true });
import { db, pool } from "../../lib/db/src";
import { sourcesTable, authoritiesTable, legalChunksTable } from "../../lib/db/src/schema";
import { eq, sql } from "drizzle-orm";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface LegalPrecedentSeed {
  opId: string;
  title: string;
  citation: string;
  court: string;
  docketNumber?: string;
  dateFiled: string;
  holding: string;
  precedentialStatus: string;
  url: string;
  fullText: string;
}

const LANDMARK_PRECEDENTS: LegalPrecedentSeed[] = [
  {
    opId: "107252",
    title: "Miranda v. Arizona",
    citation: "384 U.S. 436 (1966)",
    court: "Supreme Court of the United States",
    docketNumber: "No. 759",
    dateFiled: "1966-06-13",
    holding: "The Fifth Amendment privilege against self-incrimination requires that suspects subjected to custodial interrogation must be advised of their right to remain silent and right to counsel.",
    precedentialStatus: "Precedential / Landmark",
    url: "https://www.courtlistener.com/opinion/107252/miranda-v-arizona/",
    fullText: `Mr. Chief Justice WARREN delivered the opinion of the Court.
The cases before us raise questions which go to the roots of our concepts of American criminal jurisprudence: the restraints society must observe consistent with the Federal Constitution in prosecuting individuals for crime. More specifically, we deal with the admissibility of statements obtained from an individual who is subjected to custodial police interrogation and the necessity for procedures which assure that the individual is accorded his privilege under the Fifth Amendment to the Constitution not to be compelled to incriminate himself.

In each of these cases, the defendant was interrogated by police officers, detectives, or a prosecuting attorney in a room in which he was cut off from the outside world. In none of these cases was the defendant given a full and effective warning of his rights at the outset of the interrogation process. In all four cases, the questioning elicited oral admissions, and in three of them, signed statements as well, which were admitted at their trials.

Our holding will be spelled out with some specificity in the pages which follow, but, briefly stated, it is this: the prosecution may not use statements, whether exculpatory or inculpatory, stemming from custodial interrogation of the defendant unless it demonstrates the use of procedural safeguards effective to secure the privilege against self-incrimination. By custodial interrogation, we mean questioning initiated by law enforcement officers after a person has been taken into custody or otherwise deprived of his freedom of action in any significant way. Prior to any questioning, the person must be warned that he has a right to remain silent, that any statement he does make may be used as evidence against him, and that he has a right to the presence of an attorney, either retained or appointed.`
  },
  {
    opId: "106598",
    title: "Brady v. Maryland",
    citation: "373 U.S. 83 (1963)",
    court: "Supreme Court of the United States",
    docketNumber: "No. 490",
    dateFiled: "1963-05-13",
    holding: "The prosecution must turn over all exculpatory evidence to the defense. Suppression by the prosecution of evidence favorable to an accused violates due process where the evidence is material either to guilt or to punishment.",
    precedentialStatus: "Precedential / Landmark",
    url: "https://www.courtlistener.com/opinion/106598/brady-v-maryland/",
    fullText: `Mr. Justice DOUGLAS delivered the opinion of the Court.
Petitioner and a companion, Boblit, were found guilty of murder in the first degree and were sentenced to death. Their trials were separate, petitioner being tried first. At his trial Brady took the stand and admitted his participation in the crime, but he claimed that Boblit did the actual killing. In his summation to the jury, Brady's counsel conceded that Brady was guilty of murder in the first degree, asking only that the jury return that verdict 'without capital punishment.' Prior to trial, petitioner's counsel had requested the prosecution to allow him to examine Boblit's extrajudicial statements. Several of those statements were shown to him; but one dated July 9, 1958, in which Boblit admitted the actual homicide, was withheld by the prosecution and did not come to petitioner's notice until after he had been tried, convicted, and sentenced.

We agree with the Court of Appeals that suppression of this confession was a violation of the Due Process Clause of the Fourteenth Amendment. We now hold that the suppression by the prosecution of evidence favorable to an accused upon request violates due process where the evidence is material either to guilt or to punishment, irrespective of the good faith or bad faith of the prosecution.

A prosecution that withholds evidence on demand of an accused which, if made available, would tend to exculpate him or reduce the penalty helps shape a trial that bears heavily on the defendant. Society wins not only when the guilty are convicted but when criminal trials are fair; our system of the administration of justice suffers when any accused is treated unfairly.`
  },
  {
    opId: "108865",
    title: "Strickland v. Washington",
    citation: "466 U.S. 668 (1984)",
    court: "Supreme Court of the United States",
    docketNumber: "No. 82-1554",
    dateFiled: "1984-05-14",
    holding: "To establish ineffective assistance of counsel under the Sixth Amendment, the defendant must prove that counsel's performance was deficient and that the deficient performance prejudiced the defense.",
    precedentialStatus: "Precedential / Landmark",
    url: "https://www.courtlistener.com/opinion/108865/strickland-v-washington/",
    fullText: `Justice O'CONNOR delivered the opinion of the Court.
This case requires us to consider the proper standards for judging a criminal defendant's contention that the Constitution requires a conviction or death sentence to be set aside because counsel's assistance at the trial or sentencing was ineffective.

The Sixth Amendment recognizes the right to the assistance of counsel because it envisions counsel's playing a role that is critical to the ability of the adversarial system to produce just results. An accused is entitled to be assisted by an attorney, whether retained or appointed, who plays the role necessary to ensure that the trial is fair.

A convicted defendant's claim that counsel's assistance was so defective as to require reversal of a conviction or death sentence has two components. First, the defendant must show that counsel's performance was deficient. This requires showing that counsel made errors so serious that counsel was not functioning as the 'counsel' guaranteed the defendant by the Sixth Amendment. Second, the defendant must show that the deficient performance prejudiced the defense. This requires showing that counsel's errors were so serious as to deprive the defendant of a fair trial, a trial whose result is reliable. Unless a defendant makes both showings, it cannot be said that the conviction or death sentence resulted from a breakdown in the adversary process that renders the result unreliable.`
  },
  {
    opId: "107710",
    title: "Terry v. Ohio",
    citation: "392 U.S. 1 (1968)",
    court: "Supreme Court of the United States",
    docketNumber: "No. 67",
    dateFiled: "1968-06-10",
    holding: "Police may perform a brief investigatory stop and protective frisk of a suspect when there is reasonable articulable suspicion that criminal activity is afoot and the suspect is armed and dangerous.",
    precedentialStatus: "Precedential / Landmark",
    url: "https://www.courtlistener.com/opinion/107710/terry-v-ohio/",
    fullText: `Mr. Chief Justice WARREN delivered the opinion of the Court.
This case presents serious questions concerning the role of the Fourth Amendment in the confrontation on the street between the citizen and the policeman investigating suspicious circumstances.

Officer McFadden observed two men standing on a corner, walking back and forth along an identical route, pausing to stare in the same store window. After suspecting the men were casing a job for a stick-up, the officer approached them, identified himself, and patted down the outer clothing of the suspects, finding concealed revolvers on two of them.

We hold that where a police officer observes unusual conduct which leads him reasonably to conclude in light of his experience that criminal activity may be afoot and that the persons with whom he is dealing may be armed and presently dangerous, where in the course of investigating this behavior he identifies himself as a policeman and makes reasonable inquiries, and where nothing in the initial stages of the encounter serves to dispel his reasonable fear for his own or others' safety, he is entitled for the protection of himself and others in the area to conduct a carefully limited search of the outer clothing of such persons in an attempt to discover weapons which might be used to assault him.`
  },
  {
    opId: "106553",
    title: "Gideon v. Wainwright",
    citation: "372 U.S. 335 (1963)",
    court: "Supreme Court of the United States",
    docketNumber: "No. 155",
    dateFiled: "1963-03-18",
    holding: "The Sixth Amendment's guarantee of counsel is a fundamental right essential to a fair trial and applies to states through the Due Process Clause of the Fourteenth Amendment.",
    precedentialStatus: "Precedential / Landmark",
    url: "https://www.courtlistener.com/opinion/106553/gideon-v-wainwright/",
    fullText: `Mr. Justice BLACK delivered the opinion of the Court.
Petitioner was charged in a Florida state court with having broken and entered a poolroom with intent to commit a misdemeanor. This offense is a felony under Florida law. Appearing in court without funds and without a lawyer, petitioner asked the court to appoint counsel for him. The trial court refused on the grounds that Florida law permitted appointment of counsel only in capital offenses. Petitioner conducted his own defense, was found guilty, and sentenced to serve five years in the state prison.

We accept Betts v. Brady's assumption, based as it was on our prior cases, that a provision of the Bill of Rights which is 'fundamental and essential to a fair trial' is made obligatory upon the States by the Fourteenth Amendment. We think the Court in Betts was wrong, however, in concluding that the Sixth Amendment's guarantee of counsel is not one of these fundamental rights.

Governments, both state and federal, quite properly spend vast sums of money to establish machinery to try defendants accused of crime. Lawyers to prosecute are everywhere deemed essential to protect the public's interest in an orderly society. Similarly, there are few defendants charged with crime, few indeed, who fail to hire the best lawyers they can get to prepare and present their defenses. That government hires lawyers to prosecute and defendants who have the money hire lawyers to defend are the strongest indications of the widespread belief that lawyers in criminal courts are necessities, not luxuries.`
  },
  {
    opId: "118228",
    title: "Riley v. California",
    citation: "573 U.S. 373 (2014)",
    court: "Supreme Court of the United States",
    docketNumber: "No. 13-132",
    dateFiled: "2014-06-25",
    holding: "The warrantless search and seizure of digital contents on a cell phone during an arrest is unconstitutional under the Fourth Amendment; police must obtain a warrant.",
    precedentialStatus: "Precedential / Landmark",
    url: "https://www.courtlistener.com/opinion/2680467/riley-v-california/",
    fullText: `Chief Justice ROBERTS delivered the opinion of the Court.
These two cases raise a common question: whether the police may, without a warrant, search digital information on a cell phone seized from an individual who has been arrested.

Cell phones differ in both a quantitative and a qualitative sense from other objects that might be kept on an arrestee's person. The term 'cell phone' is itself misleading shorthand; many of these devices are in fact minicomputers that also happen to have the capacity to be used as a telephone. They could just as easily be called cameras, video players, rolodexes, calendars, tape recorders, libraries, diaries, albums, televisions, maps, or newspapers.

Our answer to the question of what police must do before searching a cell phone seized incident to an arrest is accordingly simple—get a warrant.`
  }
];

function chunkText(text: string, maxWords = 300): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += maxWords) {
    chunks.push(words.slice(i, i + maxWords).join(" "));
  }
  return chunks;
}

function generateDeterministicVector(text: string, dim = 1536): number[] {
  const vec: number[] = new Array(dim).fill(0);
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  const seed = Math.abs(hash) || 7331;
  let norm = 0;
  for (let i = 0; i < dim; i++) {
    const val = Math.sin(seed * (i + 1)) * Math.cos((i + 13) * 0.17);
    vec[i] = val;
    norm += val * val;
  }
  norm = Math.sqrt(norm) || 1;
  return vec.map(v => Number((v / norm).toFixed(6)));
}

async function fetchLiveOpinion(opinionId: string) {
  const url = `https://www.courtlistener.com/api/rest/v4/opinions/${opinionId}/`;
  const headers: Record<string, string> = { "User-Agent": "Acquit.ai Ingestion Bot/1.0" };
  if (process.env.COURTLISTENER_API_TOKEN && process.env.COURTLISTENER_API_TOKEN.trim() !== '') {
    headers["Authorization"] = `Token ${process.env.COURTLISTENER_API_TOKEN}`;
  }
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function ingestPrecedent(p: LegalPrecedentSeed) {
  console.log(`\n------------------------------------------------------------`);
  console.log(`[*] Ingesting: ${p.title} (${p.citation})`);
  console.log(`    Court: ${p.court} | Docket: ${p.docketNumber || 'N/A'}`);

  const sourceHash = `cl-${p.opId}`;
  let sourceId: string;

  // 1. Insert or reuse Source
  const existingSource = await db.select().from(sourcesTable).where(eq(sourcesTable.sourceHash, sourceHash)).limit(1);
  if (existingSource.length > 0) {
    sourceId = existingSource[0].id;
    console.log(`    [i] Reusing existing Source (ID: ${sourceId})`);
  } else {
    const [newSource] = await db.insert(sourcesTable).values({
      sourceType: "case",
      title: p.title,
      citation: p.citation,
      url: p.url,
      publisher: "CourtListener",
      sourceHash: sourceHash,
      metadata: {
        courtlistener_opinion_id: p.opId,
        court: p.court,
        holding: p.holding
      }
    }).returning();
    sourceId = newSource.id;
    console.log(`    [+] Created Source (ID: ${sourceId})`);
  }

  // 2. Insert or reuse Authority
  let authorityId: string;
  const existingAuthority = await db.select().from(authoritiesTable).where(eq(authoritiesTable.sourceId, sourceId)).limit(1);
  if (existingAuthority.length > 0) {
    authorityId = existingAuthority[0].id;
    console.log(`    [i] Reusing existing Authority (ID: ${authorityId})`);
  } else {
    const [newAuth] = await db.insert(authoritiesTable).values({
      sourceId: sourceId,
      authorityType: "case_law",
      courtName: p.court,
      docketNumber: p.docketNumber || null,
      caseName: p.title,
      reporterCitation: p.citation,
      holding: p.holding,
      fullText: p.fullText,
      precedentialStatus: p.precedentialStatus,
      metadata: {
        opinion_id: p.opId,
        date_filed: p.dateFiled
      }
    }).returning();
    authorityId = newAuth.id;
    console.log(`    [+] Created Authority (ID: ${authorityId})`);
  }

  // 3. Chunk text and generate vector embeddings
  const chunks = chunkText(p.fullText, 250);
  console.log(`    [*] Processing ${chunks.length} legal text chunks with 1536-d vector embeddings...`);

  // Delete previous chunks to allow clean re-runs
  await db.delete(legalChunksTable).where(eq(legalChunksTable.authorityId, authorityId));

  for (let i = 0; i < chunks.length; i++) {
    const embedding = generateDeterministicVector(chunks[i]);
    await db.insert(legalChunksTable).values({
      authorityId: authorityId,
      content: chunks[i],
      embedding: embedding,
      metadata: {
        chunk_index: i,
        total_chunks: chunks.length,
        case_title: p.title,
        citation: p.citation
      }
    });
  }

  console.log(`    [✓] Ingested ${chunks.length} chunks into legal_chunks table.`);
}

async function main() {
  console.log("============================================================");
  console.log("             ACQUIT.AI LEGAL INGESTION PIPELINE             ");
  console.log("============================================================");

  let successCount = 0;
  for (const precedent of LANDMARK_PRECEDENTS) {
    try {
      await ingestPrecedent(precedent);
      successCount++;
    } catch (err: any) {
      console.error(`[-] Failed to ingest ${precedent.title}:`, err.message);
    }
  }

  // Verify total count in database
  const countResult = await db.execute(sql`
    SELECT 
      (SELECT COUNT(*) FROM sources) AS sources_count,
      (SELECT COUNT(*) FROM authorities) AS authorities_count,
      (SELECT COUNT(*) FROM legal_chunks) AS chunks_count
  `);

  console.log("\n============================================================");
  console.log("               INGESTION PIPELINE SUMMARY                   ");
  console.log("============================================================");
  console.log(`[✓] Successfully processed: ${successCount} landmark legal authorities.`);
  console.log(`[✓] Database Totals:`);
  console.log(`    - Sources:     ${countResult.rows[0].sources_count}`);
  console.log(`    - Authorities: ${countResult.rows[0].authorities_count}`);
  console.log(`    - Vector Chunks (pgvector 1536d): ${countResult.rows[0].chunks_count}`);
  console.log("============================================================\n");
}

main()
  .then(async () => {
    if (pool) await pool.end();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error("Fatal ingestion error:", err);
    if (pool) await pool.end();
    process.exit(1);
  });
