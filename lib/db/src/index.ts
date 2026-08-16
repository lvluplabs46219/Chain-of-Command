import dotenv from "dotenv";
dotenv.config({ override: true });
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { pgTable, text, serial, boolean, real, integer, timestamp, jsonb, uuid, customType, pgEnum, doublePrecision } from "drizzle-orm/pg-core";

const { Pool } = pg;

// Custom Vector Type for embeddings
const vector = customType<{ data: number[]; driverData: string }>({
  dataType() {
    return "vector(1536)";
  },
  toDriver(value: number[]): string {
    return JSON.stringify(value);
  },
  fromDriver(value: string): number[] {
    return JSON.parse(value);
  },
});

// Enums
export const matterStatusEnum = pgEnum('matter_status', ['open', 'closed', 'on_hold', 'archived']);
export const partyRoleEnum = pgEnum('party_role', ['defendant', 'plaintiff', 'prosecutor', 'defense_attorney', 'judge', 'witness']);
export const documentTypeEnum = pgEnum('document_type', ['filing', 'evidence', 'order', 'correspondence', 'transcript']);
export const eventTypeEnum = pgEnum('event_type', ['hearing', 'filing_deadline', 'discovery_deadline', 'arrest', 'general']);

// Users & Core Matters
export const usersTable = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  authId: uuid("auth_id").unique().notNull(),
  email: text("email").unique().notNull(),
  fullName: text("full_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const mattersTable = pgTable("matters", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  jurisdiction: text("jurisdiction"),
  courtName: text("court_name"),
  caseNumber: text("case_number"),
  status: matterStatusEnum("status").default('open'),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const partiesTable = pgTable("parties", {
  id: uuid("id").defaultRandom().primaryKey(),
  matterId: uuid("matter_id").notNull().references(() => mattersTable.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  role: partyRoleEnum("role").notNull(),
  contactInfo: jsonb("contact_info"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const documentsTable = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  matterId: uuid("matter_id").notNull().references(() => mattersTable.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  type: documentTypeEnum("type").notNull(),
  filePath: text("file_path").notNull(),
  ipfsCid: text("ipfs_cid"),
  status: text("status").default('uploaded'),
  extractedText: text("extracted_text"),
  aiSummary: text("ai_summary"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const evidenceItemsTable = pgTable("evidence_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  matterId: uuid("matter_id").notNull().references(() => mattersTable.id, { onDelete: 'cascade' }),
  documentId: uuid("document_id").references(() => documentsTable.id, { onDelete: 'set null' }),
  title: text("title").notNull(),
  description: text("description"),
  dateAcquired: timestamp("date_acquired", { withTimezone: true }),
  tags: text("tags").array(),
  relevanceScore: doublePrecision("relevance_score"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const timelineEventsTable = pgTable("timeline_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  matterId: uuid("matter_id").notNull().references(() => mattersTable.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  eventDate: timestamp("event_date", { withTimezone: true }).notNull(),
  eventType: eventTypeEnum("event_type").notNull(),
  description: text("description"),
  documentId: uuid("document_id").references(() => documentsTable.id, { onDelete: 'set null' }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const deadlinesTable = pgTable("deadlines", {
  id: uuid("id").defaultRandom().primaryKey(),
  matterId: uuid("matter_id").notNull().references(() => mattersTable.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  dueDate: timestamp("due_date", { withTimezone: true }).notNull(),
  status: text("status").default('pending'),
  relatedDocumentId: uuid("related_document_id").references(() => documentsTable.id, { onDelete: 'set null' }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const auditLogsTable = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => usersTable.id, { onDelete: 'set null' }),
  matterId: uuid("matter_id").references(() => mattersTable.id, { onDelete: 'set null' }),
  action: text("action").notNull(),
  agentId: text("agent_id"),
  details: jsonb("details").notNull(),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Legal Library
export const sourcesTable = pgTable("sources", {
  id: uuid("id").defaultRandom().primaryKey(),
  sourceType: text("source_type").notNull(),
  title: text("title").notNull(),
  citation: text("citation"),
  url: text("url"),
  publisher: text("publisher"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  retrievedAt: timestamp("retrieved_at", { withTimezone: true }),
  sourceHash: text("source_hash").notNull(),
  metadata: jsonb("metadata").default('{}').notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const authoritiesTable = pgTable("authorities", {
  id: uuid("id").defaultRandom().primaryKey(),
  sourceId: uuid("source_id").notNull().references(() => sourcesTable.id, { onDelete: "cascade" }),
  authorityType: text("authority_type").notNull(),
  courtName: text("court_name"),
  docketNumber: text("docket_number"),
  caseName: text("case_name"),
  reporterCitation: text("reporter_citation"),
  holding: text("holding"),
  fullText: text("full_text"),
  precedentialStatus: text("precedential_status"),
  metadata: jsonb("metadata").default('{}').notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const legalChunksTable = pgTable("legal_chunks", {
  id: uuid("id").defaultRandom().primaryKey(),
  authorityId: uuid("authority_id").notNull().references(() => authoritiesTable.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  embedding: vector("embedding"),
  metadata: jsonb("metadata").default('{}').notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Attorney Directory
export const lawyerProfilesTable = pgTable("directory_lawyer_profiles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  firmName: text("firm_name").notNull(),
  barNumber: text("bar_number").notNull(),
  barVerified: boolean("bar_verified").default(false).notNull(),
  practiceAreas: text("practice_areas").array().notNull(),
  states: text("states").array().notNull(),
  counties: text("counties").array(),
  courts: text("courts").array(),
  languages: text("languages").array(),
  accessibility: text("accessibility").array(),
  consultationAvailable: boolean("consultation_available").default(true),
  paymentOptions: text("payment_options").array(),
  remoteAvailable: boolean("remote_available").default(true),
  listingTier: text("listing_tier").default("basic").notNull(),
  ratingAvg: real("rating_avg").default(0),
  ratingCount: integer("rating_count").default(0),
  calendlyUrl: text("calendly_url"),
  phone: text("phone"),
  email: text("email"),
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const directorySubscriptionsTable = pgTable("directory_subscriptions", {
  id: serial("id").primaryKey(),
  lawyerId: integer("lawyer_id").references(() => lawyerProfilesTable.id).notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  tier: text("tier").notNull(),
  status: text("status").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const agentReferralsTable = pgTable("directory_agent_referrals", {
  id: serial("id").primaryKey(),
  lawyerId: integer("lawyer_id").references(() => lawyerProfilesTable.id).notNull(),
  userId: text("user_id"),
  referralContext: text("referral_context").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type LawyerProfile = typeof lawyerProfilesTable.$inferSelect;

export const schema = {
  usersTable,
  mattersTable,
  partiesTable,
  documentsTable,
  evidenceItemsTable,
  timelineEventsTable,
  deadlinesTable,
  auditLogsTable,
  sourcesTable,
  authoritiesTable,
  legalChunksTable,
  lawyerProfilesTable,
  directorySubscriptionsTable,
  agentReferralsTable,
};

let pool: any = null;
let db: any = null;

const dbUrl = process.env.DATABASE_URL;

function createChainableQuery(defaultResult: any = []): any {
  const handler: ProxyHandler<any> = {
    get(target, prop) {
      if (prop === "then") {
        return (resolve: (val: any) => any) => Promise.resolve(defaultResult).then(resolve);
      }
      if (prop === "catch") {
        return (reject: (err: any) => any) => Promise.resolve(defaultResult).catch(reject);
      }
      if (prop === "finally") {
        return (callback: () => any) => Promise.resolve(defaultResult).finally(callback);
      }
      return (..._args: any[]) => new Proxy(() => {}, handler);
    },
    apply(target, thisArg, args) {
      return new Proxy(() => {}, handler);
    }
  };
  return new Proxy(() => {}, handler);
}

try {
  if (dbUrl) {
    pool = new Pool({ 
      connectionString: dbUrl,
      ssl: dbUrl.includes("supabase.co") ? { rejectUnauthorized: false } : undefined
    });
    
    pool.on('error', (err: Error) => {
      console.error('Unexpected error on idle client in database pool', err);
    });
    
    db = drizzle(pool, { schema });
  } else {
    throw new Error("DATABASE_URL is not set");
  }
} catch {
  console.warn("[AI Studio] Database not connected — using robust fallback proxy");
  const noOp = {
    findMany: async () => [],
    findFirst: async () => null,
    findUnique: async () => null,
    create: async (d: any) => d?.data ?? {},
    update: async (d: any) => d?.data ?? {},
    delete: async () => ({}),
  };
  db = new Proxy({}, {
    get: (_, prop) => {
      if (prop === "query") {
        return new Proxy({}, { get: () => noOp });
      }
      if (prop === "insert") {
        return () => createChainableQuery([{ id: "mock-id-" + Date.now() }]);
      }
      return () => createChainableQuery([]);
    },
  });
}

export { pool, db };
