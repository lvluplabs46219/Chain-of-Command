create extension if not exists "hypopg" with schema "extensions";

create extension if not exists "index_advisor" with schema "extensions";

create extension if not exists "wrappers" with schema "extensions";

drop extension if exists "pg_net";

create schema if not exists "api";

create type "public"."agent_role" as enum ('lead_counsel', 'paralegal', 'investigator', 'document_ai', 'court_coach');

create type "public"."case_status" as enum ('active', 'archived', 'pending_review');

create type "public"."coc_chain_type" as enum ('evidence', 'document', 'decision', 'authority', 'ai_action', 'filing', 'custody', 'document_analysis');

create type "public"."coc_event_type" as enum ('created', 'received', 'recorded', 'submitted', 'logged', 'transferred', 'accessed', 'modified', 'analyzed', 'verified', 'filed', 'served', 'anchored', 'exported', 'deleted');

create type "public"."coc_verification_status" as enum ('verified', 'review_needed', 'gap_detected', 'unverified', 'failed');

create type "public"."filing_state" as enum ('draft', 'paralegal_review', 'lead_counsel_review', 'court_coach_ready', 'filed');

create type "public"."filing_type" as enum ('motion_to_suppress', 'discovery_request', 'habeas_corpus', 'general_filing');

create type "public"."model_provider_type" as enum ('gemini', 'openai', 'anthropic', 'mistral', 'cohere', 'ollama', 'llama_cpp', 'lemonade', 'custom');

create type "public"."model_routing_strategy" as enum ('server_side', 'client_side');

create sequence "public"."_migrations_id_seq";

create sequence "public"."directory_agent_referrals_id_seq";

create sequence "public"."directory_lawyer_profiles_id_seq";

create sequence "public"."directory_subscriptions_id_seq";

revoke references on table "public"."audit_logs" from "anon";

revoke trigger on table "public"."audit_logs" from "anon";

revoke truncate on table "public"."audit_logs" from "anon";

revoke references on table "public"."audit_logs" from "authenticated";

revoke trigger on table "public"."audit_logs" from "authenticated";

revoke truncate on table "public"."audit_logs" from "authenticated";

revoke references on table "public"."audit_logs" from "service_role";

revoke trigger on table "public"."audit_logs" from "service_role";

revoke truncate on table "public"."audit_logs" from "service_role";

revoke references on table "public"."deadlines" from "anon";

revoke trigger on table "public"."deadlines" from "anon";

revoke truncate on table "public"."deadlines" from "anon";

revoke references on table "public"."deadlines" from "authenticated";

revoke trigger on table "public"."deadlines" from "authenticated";

revoke truncate on table "public"."deadlines" from "authenticated";

revoke references on table "public"."deadlines" from "service_role";

revoke trigger on table "public"."deadlines" from "service_role";

revoke truncate on table "public"."deadlines" from "service_role";

revoke references on table "public"."documents" from "anon";

revoke trigger on table "public"."documents" from "anon";

revoke truncate on table "public"."documents" from "anon";

revoke references on table "public"."documents" from "authenticated";

revoke trigger on table "public"."documents" from "authenticated";

revoke truncate on table "public"."documents" from "authenticated";

revoke references on table "public"."documents" from "service_role";

revoke trigger on table "public"."documents" from "service_role";

revoke truncate on table "public"."documents" from "service_role";

revoke references on table "public"."evidence_items" from "anon";

revoke trigger on table "public"."evidence_items" from "anon";

revoke truncate on table "public"."evidence_items" from "anon";

revoke references on table "public"."evidence_items" from "authenticated";

revoke trigger on table "public"."evidence_items" from "authenticated";

revoke truncate on table "public"."evidence_items" from "authenticated";

revoke references on table "public"."evidence_items" from "service_role";

revoke trigger on table "public"."evidence_items" from "service_role";

revoke truncate on table "public"."evidence_items" from "service_role";

revoke references on table "public"."matters" from "anon";

revoke trigger on table "public"."matters" from "anon";

revoke truncate on table "public"."matters" from "anon";

revoke references on table "public"."matters" from "authenticated";

revoke trigger on table "public"."matters" from "authenticated";

revoke truncate on table "public"."matters" from "authenticated";

revoke references on table "public"."matters" from "service_role";

revoke trigger on table "public"."matters" from "service_role";

revoke truncate on table "public"."matters" from "service_role";

revoke references on table "public"."parties" from "anon";

revoke trigger on table "public"."parties" from "anon";

revoke truncate on table "public"."parties" from "anon";

revoke references on table "public"."parties" from "authenticated";

revoke trigger on table "public"."parties" from "authenticated";

revoke truncate on table "public"."parties" from "authenticated";

revoke references on table "public"."parties" from "service_role";

revoke trigger on table "public"."parties" from "service_role";

revoke truncate on table "public"."parties" from "service_role";

revoke references on table "public"."timeline_events" from "anon";

revoke trigger on table "public"."timeline_events" from "anon";

revoke truncate on table "public"."timeline_events" from "anon";

revoke references on table "public"."timeline_events" from "authenticated";

revoke trigger on table "public"."timeline_events" from "authenticated";

revoke truncate on table "public"."timeline_events" from "authenticated";

revoke references on table "public"."timeline_events" from "service_role";

revoke trigger on table "public"."timeline_events" from "service_role";

revoke truncate on table "public"."timeline_events" from "service_role";

revoke references on table "public"."users" from "anon";

revoke trigger on table "public"."users" from "anon";

revoke truncate on table "public"."users" from "anon";

revoke references on table "public"."users" from "authenticated";

revoke trigger on table "public"."users" from "authenticated";

revoke truncate on table "public"."users" from "authenticated";

revoke references on table "public"."users" from "service_role";

revoke trigger on table "public"."users" from "service_role";

revoke truncate on table "public"."users" from "service_role";

alter type "public"."document_type" rename to "document_type__old_version_to_be_dropped";

create type "public"."document_type" as enum ('filing', 'evidence', 'order', 'correspondence', 'transcript', 'motion', 'police_report', 'charging_document', 'notice', 'discovery', 'plea_agreement', 'sentencing_document', 'probation_document', 'draft', 'other');

alter type "public"."event_type" rename to "event_type__old_version_to_be_dropped";

create type "public"."event_type" as enum ('hearing', 'filing_deadline', 'discovery_deadline', 'arrest', 'general', 'arraignment', 'booking', 'initial_appearance', 'plea', 'sentencing', 'appeal', 'citation', 'motion', 'order', 'discovery', 'trial', 'probation');

alter type "public"."party_role" rename to "party_role__old_version_to_be_dropped";

create type "public"."party_role" as enum ('defendant', 'plaintiff', 'prosecutor', 'defense_attorney', 'judge', 'witness', 'co_defendant', 'victim', 'expert_witness', 'probation_officer', 'court_appointed_counsel', 'interpreter');


  create table "public"."_migrations" (
    "id" integer not null default nextval('public._migrations_id_seq'::regclass),
    "name" text not null,
    "applied_at" timestamp with time zone not null default now()
      );


alter table "public"."_migrations" enable row level security;


  create table "public"."agent_bot_assignments" (
    "id" uuid not null default gen_random_uuid(),
    "agent_id" uuid not null,
    "bot_id" uuid not null,
    "slot" text not null,
    "assigned_at" timestamp with time zone not null default now()
      );


alter table "public"."agent_bot_assignments" enable row level security;


  create table "public"."agent_model_overrides" (
    "id" uuid not null default gen_random_uuid(),
    "agent_id" uuid not null,
    "user_id" uuid,
    "provider_type" public.model_provider_type not null,
    "provider" text not null,
    "model_id" text not null,
    "base_url" text,
    "is_local" boolean not null default false,
    "routing_strategy" public.model_routing_strategy not null default 'server_side'::public.model_routing_strategy,
    "privacy_mode" boolean not null default false,
    "display_label" text,
    "is_active" boolean not null default true,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."agent_model_overrides" enable row level security;


  create table "public"."agent_permissions" (
    "id" uuid not null default gen_random_uuid(),
    "agent_id" uuid not null,
    "can_read_case" boolean not null default false,
    "can_read_documents" boolean not null default false,
    "can_search_legal_sources" boolean not null default true,
    "can_search_court_records" boolean not null default false,
    "can_generate_documents" boolean not null default false,
    "can_modify_case_data" boolean not null default false,
    "can_use_external_tools" boolean not null default false,
    "can_execute_external_actions" boolean not null default false,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."agent_permissions" enable row level security;


  create table "public"."agent_runs" (
    "id" uuid not null default gen_random_uuid(),
    "agent_id" uuid not null,
    "conversation_id" uuid,
    "status" text not null default 'queued'::text,
    "input" jsonb not null default '{}'::jsonb,
    "output" jsonb,
    "error" jsonb,
    "started_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone not null default now(),
    "model_used" text,
    "prompt_version" text,
    "tokens_input" integer default 0,
    "tokens_output" integer default 0,
    "cost_usd" numeric(10,6) default 0,
    "tokens_used" integer
      );


alter table "public"."agent_runs" enable row level security;


  create table "public"."agent_sessions" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "case_id" uuid not null,
    "user_id" uuid not null,
    "role" public.agent_role not null,
    "memory_state" jsonb default '{}'::jsonb,
    "last_action" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."agent_sessions" enable row level security;


  create table "public"."agent_task_runs" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "matter_id" uuid,
    "agent_id" text not null,
    "task" text not null,
    "prompt" text,
    "provider" text,
    "model" text,
    "status" text not null default 'running'::text,
    "result" jsonb,
    "error" text,
    "tokens_used" integer,
    "cost" double precision default 0,
    "latency_ms" integer,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."agent_task_runs" enable row level security;


  create table "public"."agents" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "name" text not null,
    "role" text not null,
    "instructions" text not null default ''::text,
    "provider_config" jsonb not null default '{}'::jsonb,
    "allowed_tools" jsonb not null default '[]'::jsonb,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "matter_id" uuid,
    "display_name" text,
    "biblical_name" text,
    "tier" text,
    "function_type" text,
    "practice_area" text,
    "is_system_agent" boolean not null default false,
    "is_active" boolean not null default true,
    "is_tradeable" boolean not null default false,
    "assigned_to_agent_id" uuid,
    "capabilities" jsonb not null default '[]'::jsonb,
    "system_prompt" text,
    "preferred_model" text,
    "metadata" jsonb not null default '{}'::jsonb
      );


alter table "public"."agents" enable row level security;


  create table "public"."audio_audio" (
    "id" integer not null,
    "source" character varying(10) not null,
    "case_name_short" text not null,
    "case_name" text not null,
    "case_name_full" text not null,
    "judges" text,
    "date_created" timestamp with time zone not null,
    "date_modified" timestamp with time zone not null,
    "sha1" character varying(40) not null,
    "download_url" character varying(500),
    "local_path_mp3" character varying(100) not null,
    "local_path_original_file" character varying(100) not null,
    "duration" smallint,
    "processing_complete" boolean not null,
    "date_blocked" date,
    "blocked" boolean not null,
    "docket_id" integer,
    "stt_status" smallint not null,
    "filepath_ia" character varying(1000) not null,
    "ia_upload_failure_count" smallint,
    "stt_source" smallint,
    "stt_transcript" text not null
      );


alter table "public"."audio_audio" enable row level security;


  create table "public"."audit_events" (
    "id" uuid not null default gen_random_uuid(),
    "tenant_id" uuid not null,
    "case_id" uuid,
    "actor_id" uuid,
    "sequence_number" bigint not null,
    "event_type" text not null,
    "resource_type" text,
    "resource_id" uuid,
    "event_timestamp" timestamp with time zone not null default now(),
    "payload" jsonb not null default '{}'::jsonb,
    "provenance" jsonb,
    "compliance" jsonb,
    "previous_hash" text not null,
    "event_hash" text not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."audit_events" enable row level security;


  create table "public"."authorities" (
    "id" uuid not null default gen_random_uuid(),
    "source_id" uuid not null,
    "authority_type" text not null,
    "court_name" text,
    "docket_number" text,
    "case_name" text,
    "reporter_citation" text,
    "holding" text,
    "full_text" text,
    "precedential_status" text,
    "metadata" jsonb not null default '{}'::jsonb,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "fts_vector" tsvector generated always as (to_tsvector('english'::regconfig, ((((((COALESCE(case_name, ''::text) || ' '::text) || COALESCE(holding, ''::text)) || ' '::text) || COALESCE(reporter_citation, ''::text)) || ' '::text) || COALESCE(full_text, ''::text)))) stored
      );


alter table "public"."authorities" enable row level security;


  create table "public"."bot_registry" (
    "id" uuid not null default gen_random_uuid(),
    "slug" text not null,
    "display_name" text not null,
    "description" text not null,
    "category" text not null,
    "practice_area" text,
    "commands" jsonb not null default '[]'::jsonb,
    "capabilities" jsonb not null default '[]'::jsonb,
    "function_type" text,
    "is_active" boolean not null default true,
    "is_tradeable" boolean not null default false,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."bot_registry" enable row level security;


  create table "public"."case_documents" (
    "id" uuid not null default gen_random_uuid(),
    "case_id" uuid not null,
    "user_id" uuid not null,
    "document_name" character varying(255) not null,
    "extracted_text" text,
    "metadata" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."case_documents" enable row level security;


  create table "public"."cases" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "case_number" character varying(100),
    "jurisdiction_state" character varying(2) not null,
    "county" character varying(100),
    "court_type" character varying(50) not null,
    "title" character varying(255) not null,
    "status" character varying(50) default 'active'::character varying,
    "created_at" timestamp with time zone default now(),
    "matter_id" uuid
      );


alter table "public"."cases" enable row level security;


  create table "public"."charges" (
    "id" uuid not null default gen_random_uuid(),
    "matter_id" uuid not null,
    "statute" text not null,
    "description" text not null,
    "charge_class" text,
    "count_number" integer not null default 1,
    "status" text not null default 'pending'::text,
    "notes" text,
    "metadata" jsonb not null default '{}'::jsonb,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."charges" enable row level security;


  create table "public"."clerk_alerts" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "matter_id" uuid,
    "alert_type" text not null,
    "severity" text not null default 'info'::text,
    "title" text not null,
    "message" text,
    "source" text not null default 'the_clerk'::text,
    "status" text not null default 'active'::text,
    "metadata" jsonb not null default '{}'::jsonb,
    "created_at" timestamp with time zone not null default now(),
    "acknowledged_at" timestamp with time zone
      );


alter table "public"."clerk_alerts" enable row level security;


  create table "public"."coc_chain_templates" (
    "id" uuid not null default gen_random_uuid(),
    "slug" text not null,
    "label" text not null,
    "chain_type" public.coc_chain_type not null,
    "description" text,
    "expected_events" jsonb not null default '[]'::jsonb,
    "max_gap_minutes" integer,
    "jurisdiction" text,
    "is_active" boolean not null default true,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."coc_chain_templates" enable row level security;


  create table "public"."coc_events" (
    "id" uuid not null default gen_random_uuid(),
    "coc_record_id" uuid not null,
    "event_type" public.coc_event_type not null,
    "event_label" text not null,
    "occurred_at" timestamp with time zone not null,
    "recorded_at" timestamp with time zone not null default now(),
    "actor_name" text,
    "actor_role" text,
    "actor_agency" text,
    "is_ai_actor" boolean not null default false,
    "agent_id" uuid,
    "event_hash" text,
    "previous_event_hash" text,
    "source_document_ref" text,
    "verified" boolean not null default false,
    "is_gap" boolean not null default false,
    "gap_description" text,
    "expected_actor" text,
    "expected_by" timestamp with time zone,
    "notes" text,
    "metadata" jsonb not null default '{}'::jsonb
      );


alter table "public"."coc_events" enable row level security;


  create table "public"."coc_records" (
    "id" uuid not null default gen_random_uuid(),
    "matter_id" uuid,
    "user_id" uuid,
    "record_type" public.coc_chain_type not null,
    "artifact_label" text not null,
    "artifact_ref" text,
    "document_hash" text,
    "hash_algorithm" text not null default 'sha-256'::text,
    "previous_hash" text,
    "record_hash" text,
    "source_id" uuid,
    "issuer" text,
    "jurisdiction" text,
    "case_ref" text,
    "verification_status" public.coc_verification_status not null default 'unverified'::public.coc_verification_status,
    "authenticity_score" numeric(3,2),
    "integrity_score" numeric(3,2),
    "source_score" numeric(3,2),
    "custody_score" numeric(3,2),
    "signature_verified" boolean,
    "source_verified" boolean,
    "timestamp_verified" boolean,
    "blockchain_anchored" boolean not null default false,
    "blockchain_network" text,
    "blockchain_block" bigint,
    "blockchain_tx_hash" text,
    "merkle_root" text,
    "anchored_at" timestamp with time zone,
    "has_gaps" boolean not null default false,
    "gap_count" integer not null default 0,
    "review_item_count" integer not null default 0,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."coc_records" enable row level security;


  create table "public"."cold_cases_ingestion" (
    "source_id" integer not null,
    "source_dataset" text not null default 'harvard-lil/cold-cases'::text,
    "source_split" text not null default 'train'::text,
    "payload" jsonb not null,
    "ingested_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."cold_cases_ingestion" enable row level security;


  create table "public"."cold_cases_ingestion_state" (
    "source_dataset" text not null,
    "source_split" text not null default 'train'::text,
    "next_offset" bigint not null default 0,
    "rows_ingested" bigint not null default 0,
    "status" text not null default 'ready'::text,
    "last_error" text,
    "updated_at" timestamp with time zone not null default now(),
    "lock_token" uuid,
    "lock_expires_at" timestamp with time zone
      );


alter table "public"."cold_cases_ingestion_state" enable row level security;


  create table "public"."conversations" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "matter_id" uuid,
    "title" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."conversations" enable row level security;


  create table "public"."court_opinions" (
    "id" uuid not null default gen_random_uuid(),
    "cl_opinion_id" integer,
    "cl_cluster_id" integer,
    "court_id" text,
    "case_name" text not null,
    "case_name_short" text,
    "docket_number" text,
    "date_filed" date,
    "date_blocked" date,
    "blocked" boolean not null default false,
    "precedential_status" text,
    "citation_count" integer not null default 0,
    "plain_text" text,
    "html_text" text,
    "download_url" text,
    "cl_api_url" text,
    "source_url" text,
    "author_name" text,
    "per_curiam" boolean not null default false,
    "joined_by_str" text,
    "opinion_type" text default 'combined'::text,
    "metadata" jsonb not null default '{}'::jsonb,
    "fts_vector" tsvector generated always as (to_tsvector('english'::regconfig, ((COALESCE(case_name, ''::text) || ' '::text) || COALESCE(plain_text, ''::text)))) stored,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."court_opinions" enable row level security;


  create table "public"."courtlistener_webhook_config" (
    "id" boolean not null default true,
    "path_token" text not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."courtlistener_webhook_config" enable row level security;


  create table "public"."courtlistener_webhook_events" (
    "event_id" text not null,
    "payload" jsonb not null,
    "received_at" timestamp with time zone not null default now()
      );


alter table "public"."courtlistener_webhook_events" enable row level security;


  create table "public"."directory_agent_referrals" (
    "id" integer not null default nextval('public.directory_agent_referrals_id_seq'::regclass),
    "lawyer_id" integer not null,
    "user_id" uuid,
    "referral_context" text not null,
    "created_at" timestamp without time zone not null default now()
      );


alter table "public"."directory_agent_referrals" enable row level security;


  create table "public"."directory_lawyer_profiles" (
    "id" integer not null default nextval('public.directory_lawyer_profiles_id_seq'::regclass),
    "name" text not null,
    "firm_name" text not null,
    "bar_number" text not null,
    "bar_verified" boolean not null default false,
    "practice_areas" text[] not null,
    "states" text[] not null,
    "counties" text[],
    "courts" text[],
    "languages" text[],
    "accessibility" text[],
    "consultation_available" boolean default true,
    "payment_options" text[],
    "remote_available" boolean default true,
    "listing_tier" text not null default 'basic'::text,
    "rating_avg" real default 0,
    "rating_count" integer default 0,
    "calendly_url" text,
    "phone" text,
    "email" text,
    "bio" text,
    "created_at" timestamp without time zone not null default now(),
    "user_id" uuid
      );


alter table "public"."directory_lawyer_profiles" enable row level security;


  create table "public"."directory_subscriptions" (
    "id" integer not null default nextval('public.directory_subscriptions_id_seq'::regclass),
    "lawyer_id" integer not null,
    "stripe_customer_id" text,
    "stripe_subscription_id" text,
    "tier" text not null,
    "status" text not null,
    "updated_at" timestamp without time zone not null default now()
      );


alter table "public"."directory_subscriptions" enable row level security;


  create table "public"."disclosures_financialdisclosure" (
    "id" integer not null,
    "date_created" timestamp with time zone not null,
    "date_modified" timestamp with time zone not null,
    "year" smallint not null,
    "download_filepath" text not null,
    "filepath" character varying(300) not null,
    "thumbnail" character varying(300),
    "thumbnail_status" smallint not null,
    "page_count" smallint not null,
    "sha1" character varying(40) not null,
    "report_type" smallint not null,
    "is_amended" boolean,
    "addendum_content_raw" text not null,
    "addendum_redacted" boolean not null,
    "has_been_extracted" boolean not null,
    "person_id" integer not null
      );


alter table "public"."disclosures_financialdisclosure" enable row level security;


  create table "public"."disclosures_investment" (
    "id" integer not null,
    "date_created" timestamp with time zone not null,
    "date_modified" timestamp with time zone not null,
    "page_number" integer not null,
    "description" text not null,
    "redacted" boolean not null,
    "income_during_reporting_period_code" character varying(5) not null,
    "income_during_reporting_period_type" text not null,
    "gross_value_code" character varying(5) not null,
    "gross_value_method" character varying(5) not null,
    "transaction_during_reporting_period" text not null,
    "transaction_date_raw" character varying(40) not null,
    "transaction_date" date,
    "transaction_value_code" character varying(5) not null,
    "transaction_gain_code" character varying(5) not null,
    "transaction_partner" text not null,
    "has_inferred_values" boolean not null,
    "financial_disclosure_id" integer not null
      );


alter table "public"."disclosures_investment" enable row level security;


  create table "public"."document_nodes" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "case_id" uuid not null,
    "user_id" uuid not null,
    "file_name" text not null,
    "chunk_content" text not null,
    "embedding" public.vector(1536),
    "metadata" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."document_nodes" enable row level security;


  create table "public"."filings" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "case_id" uuid not null,
    "user_id" uuid not null,
    "title" text not null,
    "type" public.filing_type not null default 'general_filing'::public.filing_type,
    "current_state" public.filing_state not null default 'draft'::public.filing_state,
    "content" text,
    "upl_checked" boolean not null default false,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."filings" enable row level security;


  create table "public"."hearings" (
    "id" uuid not null default gen_random_uuid(),
    "matter_id" uuid not null,
    "hearing_type" text not null,
    "scheduled_at" timestamp with time zone not null,
    "location" text,
    "judge_name" text,
    "outcome" text,
    "notes" text,
    "document_id" uuid,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."hearings" enable row level security;


  create table "public"."lab_simulations" (
    "id" uuid not null default gen_random_uuid(),
    "case_id" uuid,
    "user_id" uuid not null,
    "hypothesis_title" text not null,
    "agent_id" character varying(100) not null,
    "known_facts" jsonb default '[]'::jsonb,
    "uncertainties" jsonb default '[]'::jsonb,
    "potential_considerations" jsonb default '[]'::jsonb,
    "questions_for_attorney" jsonb default '[]'::jsonb,
    "citations_used" jsonb default '[]'::jsonb,
    "confidence_score" character varying(20) not null,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."lab_simulations" enable row level security;


  create table "public"."legal_chunks" (
    "id" uuid not null default gen_random_uuid(),
    "authority_id" uuid not null,
    "content" text not null,
    "embedding" public.vector(1536),
    "metadata" jsonb not null default '{}'::jsonb,
    "created_at" timestamp with time zone not null default now(),
    "fts_vector" tsvector generated always as (to_tsvector('english'::regconfig, content)) stored,
    "jurisdiction" text,
    "court" text,
    "authority_type" text
      );


alter table "public"."legal_chunks" enable row level security;


  create table "public"."messages" (
    "id" uuid not null default gen_random_uuid(),
    "conversation_id" uuid not null,
    "role" text not null,
    "content" text not null,
    "agent_id" uuid,
    "agent_run_id" uuid,
    "tool_name" text,
    "metadata" jsonb not null default '{}'::jsonb,
    "created_at" timestamp with time zone not null default now(),
    "prompt_version" text
      );


alter table "public"."messages" enable row level security;


  create table "public"."model_configs" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "provider" text not null,
    "model_id" text not null,
    "display_name" text,
    "use_case" text not null default 'default'::text,
    "is_default" boolean not null default false,
    "is_active" boolean not null default true,
    "config" jsonb not null default '{}'::jsonb,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "provider_type" public.model_provider_type default 'gemini'::public.model_provider_type,
    "base_url" text,
    "is_local" boolean not null default false,
    "routing_strategy" public.model_routing_strategy not null default 'server_side'::public.model_routing_strategy,
    "requires_cors" boolean not null default false,
    "connection_tested_at" timestamp with time zone,
    "connection_status" text default 'unknown'::text,
    "available_models" jsonb default '[]'::jsonb,
    "privacy_mode" boolean not null default false,
    "display_label" text
      );


alter table "public"."model_configs" enable row level security;


  create table "public"."opinion_citations" (
    "id" uuid not null default gen_random_uuid(),
    "citing_opinion_id" uuid not null,
    "cited_opinion_id" uuid not null,
    "citation_text" text,
    "depth" integer,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."opinion_citations" enable row level security;


  create table "public"."people_db_attorney" (
    "id" integer not null,
    "date_created" timestamp with time zone not null,
    "date_modified" timestamp with time zone not null,
    "name" text not null,
    "contact_raw" text not null,
    "phone" character varying(20) not null,
    "fax" character varying(20) not null,
    "email" character varying(254) not null
      );


alter table "public"."people_db_attorney" enable row level security;


  create table "public"."profiles" (
    "id" uuid not null,
    "display_name" text,
    "avatar_url" text
      );


alter table "public"."profiles" enable row level security;


  create table "public"."research_queries" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "matter_id" uuid,
    "query" text not null,
    "depth" text not null default 'comprehensive'::text,
    "status" text not null default 'pending'::text,
    "results" jsonb,
    "courtlistener_docket" text,
    "error" text,
    "created_at" timestamp with time zone not null default now(),
    "completed_at" timestamp with time zone
      );


alter table "public"."research_queries" enable row level security;


  create table "public"."retrieval_logs" (
    "id" uuid not null default gen_random_uuid(),
    "agent_run_id" uuid,
    "matter_id" uuid,
    "query_text" text not null,
    "retrieval_type" text not null default 'hybrid'::text,
    "jurisdiction" text,
    "authority_type" text,
    "result_count" integer not null default 0,
    "results" jsonb not null default '[]'::jsonb,
    "model_used" text,
    "latency_ms" integer,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."retrieval_logs" enable row level security;


  create table "public"."sources" (
    "id" uuid not null default gen_random_uuid(),
    "source_type" text not null,
    "title" text not null,
    "citation" text,
    "url" text,
    "publisher" text,
    "published_at" timestamp with time zone,
    "retrieved_at" timestamp with time zone,
    "source_hash" text not null,
    "metadata" jsonb not null default '{}'::jsonb,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."sources" enable row level security;


  create table "public"."tool_executions" (
    "id" uuid not null default gen_random_uuid(),
    "agent_run_id" uuid not null,
    "tool_name" text not null,
    "status" text not null default 'queued'::text,
    "input" jsonb not null default '{}'::jsonb,
    "output" jsonb,
    "error" jsonb,
    "created_at" timestamp with time zone not null default now(),
    "completed_at" timestamp with time zone
      );


alter table "public"."tool_executions" enable row level security;


  create table "public"."webhook_delivery_log" (
    "id" uuid not null default gen_random_uuid(),
    "event_id" text not null,
    "event_type" text not null,
    "processing_status" text not null default 'pending'::text,
    "error_message" text,
    "processed_at" timestamp with time zone,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."webhook_delivery_log" enable row level security;

alter table "public"."documents" alter column type type "public"."document_type" using type::text::"public"."document_type";

alter table "public"."parties" alter column role type "public"."party_role" using role::text::"public"."party_role";

alter table "public"."timeline_events" alter column event_type type "public"."event_type" using event_type::text::"public"."event_type";

drop type "public"."document_type__old_version_to_be_dropped";

drop type "public"."event_type__old_version_to_be_dropped";

drop type "public"."party_role__old_version_to_be_dropped";

alter table "public"."audit_logs" alter column "agent_id" set data type uuid using "agent_id"::uuid;

alter table "public"."documents" add column "fts_vector" tsvector generated always as (to_tsvector('english'::regconfig, ((((COALESCE(title, ''::text) || ' '::text) || COALESCE(extracted_text, ''::text)) || ' '::text) || COALESCE(ai_summary, ''::text)))) stored;

alter table "public"."timeline_events" add column "agent_id" uuid;

alter table "public"."timeline_events" add column "confidence" numeric(3,2);

alter table "public"."timeline_events" add column "created_by" text default 'user'::text;

alter table "public"."timeline_events" add column "created_by_agent" boolean not null default false;

alter sequence "public"."_migrations_id_seq" owned by "public"."_migrations"."id";

alter sequence "public"."directory_agent_referrals_id_seq" owned by "public"."directory_agent_referrals"."id";

alter sequence "public"."directory_lawyer_profiles_id_seq" owned by "public"."directory_lawyer_profiles"."id";

alter sequence "public"."directory_subscriptions_id_seq" owned by "public"."directory_subscriptions"."id";

CREATE UNIQUE INDEX _migrations_name_key ON public._migrations USING btree (name);

CREATE UNIQUE INDEX _migrations_pkey ON public._migrations USING btree (id);

CREATE UNIQUE INDEX agent_bot_assignments_agent_id_bot_id_key ON public.agent_bot_assignments USING btree (agent_id, bot_id);

CREATE UNIQUE INDEX agent_bot_assignments_agent_id_slot_key ON public.agent_bot_assignments USING btree (agent_id, slot);

CREATE UNIQUE INDEX agent_bot_assignments_pkey ON public.agent_bot_assignments USING btree (id);

CREATE UNIQUE INDEX agent_model_overrides_agent_id_user_id_key ON public.agent_model_overrides USING btree (agent_id, user_id);

CREATE UNIQUE INDEX agent_model_overrides_pkey ON public.agent_model_overrides USING btree (id);

CREATE UNIQUE INDEX agent_permissions_agent_id_key ON public.agent_permissions USING btree (agent_id);

CREATE UNIQUE INDEX agent_permissions_pkey ON public.agent_permissions USING btree (id);

CREATE UNIQUE INDEX agent_runs_pkey ON public.agent_runs USING btree (id);

CREATE UNIQUE INDEX agent_sessions_pkey ON public.agent_sessions USING btree (id);

CREATE UNIQUE INDEX agent_task_runs_pkey ON public.agent_task_runs USING btree (id);

CREATE UNIQUE INDEX agents_pkey ON public.agents USING btree (id);

CREATE UNIQUE INDEX audio_audio_pkey ON public.audio_audio USING btree (id);

CREATE INDEX audit_events_actor_idx ON public.audit_events USING btree (actor_id, event_timestamp);

CREATE INDEX audit_events_case_idx ON public.audit_events USING btree (case_id, sequence_number);

CREATE UNIQUE INDEX audit_events_pkey ON public.audit_events USING btree (id);

CREATE UNIQUE INDEX audit_events_tenant_id_event_hash_key ON public.audit_events USING btree (tenant_id, event_hash);

CREATE UNIQUE INDEX audit_events_tenant_id_sequence_number_key ON public.audit_events USING btree (tenant_id, sequence_number);

CREATE INDEX audit_events_type_idx ON public.audit_events USING btree (event_type, event_timestamp);

CREATE UNIQUE INDEX authorities_pkey ON public.authorities USING btree (id);

CREATE UNIQUE INDEX bot_registry_pkey ON public.bot_registry USING btree (id);

CREATE UNIQUE INDEX bot_registry_slug_key ON public.bot_registry USING btree (slug);

CREATE UNIQUE INDEX case_documents_pkey ON public.case_documents USING btree (id);

CREATE UNIQUE INDEX cases_pkey ON public.cases USING btree (id);

CREATE UNIQUE INDEX charges_pkey ON public.charges USING btree (id);

CREATE UNIQUE INDEX clerk_alerts_pkey ON public.clerk_alerts USING btree (id);

CREATE UNIQUE INDEX coc_chain_templates_pkey ON public.coc_chain_templates USING btree (id);

CREATE UNIQUE INDEX coc_chain_templates_slug_key ON public.coc_chain_templates USING btree (slug);

CREATE UNIQUE INDEX coc_events_pkey ON public.coc_events USING btree (id);

CREATE UNIQUE INDEX coc_records_pkey ON public.coc_records USING btree (id);

CREATE INDEX cold_cases_ingestion_dataset_idx ON public.cold_cases_ingestion USING btree (source_dataset, source_split);

CREATE UNIQUE INDEX cold_cases_ingestion_dataset_split_source_uidx ON public.cold_cases_ingestion USING btree (source_dataset, source_split, source_id);

CREATE INDEX cold_cases_ingestion_lock_idx ON public.cold_cases_ingestion_state USING btree (lock_expires_at);

CREATE UNIQUE INDEX cold_cases_ingestion_state_pkey ON public.cold_cases_ingestion_state USING btree (source_dataset, source_split);

CREATE UNIQUE INDEX conversations_pkey ON public.conversations USING btree (id);

CREATE UNIQUE INDEX court_opinions_cl_opinion_id_key ON public.court_opinions USING btree (cl_opinion_id);

CREATE UNIQUE INDEX court_opinions_pkey ON public.court_opinions USING btree (id);

CREATE UNIQUE INDEX courtlistener_webhook_config_path_token_key ON public.courtlistener_webhook_config USING btree (path_token);

CREATE UNIQUE INDEX courtlistener_webhook_config_pkey ON public.courtlistener_webhook_config USING btree (id);

CREATE UNIQUE INDEX courtlistener_webhook_events_pkey ON public.courtlistener_webhook_events USING btree (event_id);

CREATE UNIQUE INDEX directory_agent_referrals_pkey ON public.directory_agent_referrals USING btree (id);

CREATE UNIQUE INDEX directory_lawyer_profiles_pkey ON public.directory_lawyer_profiles USING btree (id);

CREATE UNIQUE INDEX directory_subscriptions_pkey ON public.directory_subscriptions USING btree (id);

CREATE UNIQUE INDEX disclosures_financialdisclosure_pkey ON public.disclosures_financialdisclosure USING btree (id);

CREATE UNIQUE INDEX disclosures_investment_pkey ON public.disclosures_investment USING btree (id);

CREATE UNIQUE INDEX document_nodes_pkey ON public.document_nodes USING btree (id);

CREATE UNIQUE INDEX filings_pkey ON public.filings USING btree (id);

CREATE UNIQUE INDEX hearings_pkey ON public.hearings USING btree (id);

CREATE INDEX idx_agent_bot_assignments_agent ON public.agent_bot_assignments USING btree (agent_id);

CREATE INDEX idx_agent_model_overrides_agent ON public.agent_model_overrides USING btree (agent_id);

CREATE INDEX idx_agent_model_overrides_user ON public.agent_model_overrides USING btree (user_id);

CREATE INDEX idx_agent_runs_agent_id_created_at ON public.agent_runs USING btree (agent_id, created_at DESC);

CREATE INDEX idx_agent_sessions_case ON public.agent_sessions USING btree (case_id);

CREATE INDEX idx_agent_task_runs_matter ON public.agent_task_runs USING btree (matter_id);

CREATE INDEX idx_agent_task_runs_user ON public.agent_task_runs USING btree (user_id, created_at DESC);

CREATE INDEX idx_agents_assigned_to ON public.agents USING btree (assigned_to_agent_id) WHERE (assigned_to_agent_id IS NOT NULL);

CREATE INDEX idx_agents_function_type ON public.agents USING btree (function_type);

CREATE INDEX idx_agents_is_system ON public.agents USING btree (is_system_agent) WHERE (is_system_agent = true);

CREATE INDEX idx_agents_matter_id ON public.agents USING btree (matter_id) WHERE (matter_id IS NOT NULL);

CREATE INDEX idx_agents_tier ON public.agents USING btree (tier);

CREATE INDEX idx_agents_user_id ON public.agents USING btree (user_id);

CREATE INDEX idx_audit_logs_user_id ON public.audit_logs USING btree (user_id);

CREATE INDEX idx_authorities_authority_type ON public.authorities USING btree (authority_type);

CREATE INDEX idx_authorities_fts ON public.authorities USING gin (fts_vector);

CREATE INDEX idx_authorities_metadata ON public.authorities USING gin (metadata);

CREATE INDEX idx_authorities_source_id ON public.authorities USING btree (source_id);

CREATE INDEX idx_bot_registry_category ON public.bot_registry USING btree (category);

CREATE INDEX idx_bot_registry_practice_area ON public.bot_registry USING btree (practice_area);

CREATE INDEX idx_case_documents_case_id ON public.case_documents USING btree (case_id);

CREATE INDEX idx_cases_matter_id ON public.cases USING btree (matter_id) WHERE (matter_id IS NOT NULL);

CREATE INDEX idx_cases_user ON public.cases USING btree (user_id);

CREATE INDEX idx_charges_matter_id ON public.charges USING btree (matter_id);

CREATE INDEX idx_clerk_alerts_matter ON public.clerk_alerts USING btree (matter_id);

CREATE INDEX idx_clerk_alerts_user ON public.clerk_alerts USING btree (user_id, status, created_at DESC);

CREATE INDEX idx_coc_events_gaps ON public.coc_events USING btree (coc_record_id) WHERE (is_gap = true);

CREATE INDEX idx_coc_events_occurred ON public.coc_events USING btree (coc_record_id, occurred_at);

CREATE INDEX idx_coc_events_record ON public.coc_events USING btree (coc_record_id);

CREATE INDEX idx_coc_records_hash ON public.coc_records USING btree (document_hash) WHERE (document_hash IS NOT NULL);

CREATE INDEX idx_coc_records_matter ON public.coc_records USING btree (matter_id);

CREATE INDEX idx_coc_records_status ON public.coc_records USING btree (verification_status);

CREATE INDEX idx_conversations_matter_id ON public.conversations USING btree (matter_id);

CREATE INDEX idx_conversations_user_id ON public.conversations USING btree (user_id);

CREATE INDEX idx_court_opinions_cl_cluster ON public.court_opinions USING btree (cl_cluster_id);

CREATE INDEX idx_court_opinions_cl_id ON public.court_opinions USING btree (cl_opinion_id);

CREATE INDEX idx_court_opinions_court ON public.court_opinions USING btree (court_id);

CREATE INDEX idx_court_opinions_date ON public.court_opinions USING btree (date_filed DESC);

CREATE INDEX idx_court_opinions_fts ON public.court_opinions USING gin (fts_vector);

CREATE INDEX idx_court_opinions_precedential ON public.court_opinions USING btree (precedential_status);

CREATE INDEX idx_deadlines_matter_id ON public.deadlines USING btree (matter_id);

CREATE INDEX idx_deadlines_related_document_id ON public.deadlines USING btree (related_document_id);

CREATE INDEX idx_directory_agent_referrals_lawyer_id ON public.directory_agent_referrals USING btree (lawyer_id);

CREATE INDEX idx_directory_agent_referrals_user_id ON public.directory_agent_referrals USING btree (user_id);

CREATE INDEX idx_directory_lawyer_profiles_user_id ON public.directory_lawyer_profiles USING btree (user_id);

CREATE INDEX idx_directory_subscriptions_lawyer_id ON public.directory_subscriptions USING btree (lawyer_id);

CREATE INDEX idx_doc_nodes_vector ON public.document_nodes USING hnsw (embedding public.vector_cosine_ops);

CREATE INDEX idx_documents_fts ON public.documents USING gin (fts_vector);

CREATE INDEX idx_documents_metadata ON public.documents USING gin (metadata);

CREATE INDEX idx_evidence_items_document_id ON public.evidence_items USING btree (document_id);

CREATE INDEX idx_evidence_items_matter_id ON public.evidence_items USING btree (matter_id);

CREATE INDEX idx_filings_case ON public.filings USING btree (case_id);

CREATE INDEX idx_hearings_document_id ON public.hearings USING btree (document_id);

CREATE INDEX idx_hearings_matter_id ON public.hearings USING btree (matter_id);

CREATE INDEX idx_hearings_matter_scheduled ON public.hearings USING btree (matter_id, scheduled_at);

CREATE INDEX idx_lab_simulations_case_id ON public.lab_simulations USING btree (case_id);

CREATE INDEX idx_legal_chunks_authority_id ON public.legal_chunks USING btree (authority_id);

CREATE INDEX idx_legal_chunks_authority_type ON public.legal_chunks USING btree (authority_type) WHERE (authority_type IS NOT NULL);

CREATE INDEX idx_legal_chunks_court ON public.legal_chunks USING btree (court) WHERE (court IS NOT NULL);

CREATE INDEX idx_legal_chunks_embedding ON public.legal_chunks USING hnsw (embedding public.vector_cosine_ops);

CREATE INDEX idx_legal_chunks_fts ON public.legal_chunks USING gin (fts_vector);

CREATE INDEX idx_legal_chunks_jurisdiction ON public.legal_chunks USING btree (jurisdiction) WHERE (jurisdiction IS NOT NULL);

CREATE INDEX idx_legal_chunks_metadata ON public.legal_chunks USING gin (metadata);

CREATE INDEX idx_messages_agent_run_id ON public.messages USING btree (agent_run_id);

CREATE INDEX idx_messages_conversation_id ON public.messages USING btree (conversation_id);

CREATE INDEX idx_messages_created_at ON public.messages USING btree (conversation_id, created_at DESC);

CREATE INDEX idx_model_configs_is_local ON public.model_configs USING btree (is_local) WHERE (is_local = true);

CREATE INDEX idx_model_configs_provider_type ON public.model_configs USING btree (provider_type);

CREATE INDEX idx_model_configs_use_case ON public.model_configs USING btree (use_case, is_active);

CREATE INDEX idx_model_configs_user_id ON public.model_configs USING btree (user_id);

CREATE INDEX idx_opinion_citations_cited ON public.opinion_citations USING btree (cited_opinion_id);

CREATE INDEX idx_opinion_citations_citing ON public.opinion_citations USING btree (citing_opinion_id);

CREATE INDEX idx_parties_matter_id ON public.parties USING btree (matter_id);

CREATE INDEX idx_research_queries_matter ON public.research_queries USING btree (matter_id);

CREATE INDEX idx_research_queries_user ON public.research_queries USING btree (user_id, created_at DESC);

CREATE INDEX idx_retrieval_logs_agent_run ON public.retrieval_logs USING btree (agent_run_id);

CREATE INDEX idx_retrieval_logs_created ON public.retrieval_logs USING btree (created_at DESC);

CREATE INDEX idx_retrieval_logs_matter ON public.retrieval_logs USING btree (matter_id);

CREATE INDEX idx_sources_source_type ON public.sources USING btree (source_type);

CREATE INDEX idx_sources_url ON public.sources USING btree (url);

CREATE INDEX idx_timeline_events_document_id ON public.timeline_events USING btree (document_id);

CREATE INDEX idx_timeline_events_event_date ON public.timeline_events USING btree (matter_id, event_date);

CREATE INDEX idx_tool_executions_run_id ON public.tool_executions USING btree (agent_run_id);

CREATE INDEX idx_webhook_delivery_event_id ON public.webhook_delivery_log USING btree (event_id);

CREATE INDEX idx_webhook_delivery_status ON public.webhook_delivery_log USING btree (processing_status);

CREATE UNIQUE INDEX lab_simulations_pkey ON public.lab_simulations USING btree (id);

CREATE UNIQUE INDEX legal_chunks_pkey ON public.legal_chunks USING btree (id);

CREATE UNIQUE INDEX messages_pkey ON public.messages USING btree (id);

CREATE UNIQUE INDEX model_configs_pkey ON public.model_configs USING btree (id);

CREATE UNIQUE INDEX model_configs_system_unique ON public.model_configs USING btree (provider, model_id, use_case) WHERE (user_id IS NULL);

CREATE UNIQUE INDEX model_configs_user_id_provider_model_id_use_case_key ON public.model_configs USING btree (user_id, provider, model_id, use_case);

CREATE UNIQUE INDEX opinion_citations_citing_opinion_id_cited_opinion_id_key ON public.opinion_citations USING btree (citing_opinion_id, cited_opinion_id);

CREATE UNIQUE INDEX opinion_citations_pkey ON public.opinion_citations USING btree (id);

CREATE UNIQUE INDEX people_db_attorney_pkey ON public.people_db_attorney USING btree (id);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX research_queries_pkey ON public.research_queries USING btree (id);

CREATE UNIQUE INDEX retrieval_logs_pkey ON public.retrieval_logs USING btree (id);

CREATE UNIQUE INDEX sources_pkey ON public.sources USING btree (id);

CREATE UNIQUE INDEX sources_source_hash_unique ON public.sources USING btree (source_hash);

CREATE UNIQUE INDEX tool_executions_pkey ON public.tool_executions USING btree (id);

CREATE UNIQUE INDEX webhook_delivery_log_pkey ON public.webhook_delivery_log USING btree (id);

alter table "public"."_migrations" add constraint "_migrations_pkey" PRIMARY KEY using index "_migrations_pkey";

alter table "public"."agent_bot_assignments" add constraint "agent_bot_assignments_pkey" PRIMARY KEY using index "agent_bot_assignments_pkey";

alter table "public"."agent_model_overrides" add constraint "agent_model_overrides_pkey" PRIMARY KEY using index "agent_model_overrides_pkey";

alter table "public"."agent_permissions" add constraint "agent_permissions_pkey" PRIMARY KEY using index "agent_permissions_pkey";

alter table "public"."agent_runs" add constraint "agent_runs_pkey" PRIMARY KEY using index "agent_runs_pkey";

alter table "public"."agent_sessions" add constraint "agent_sessions_pkey" PRIMARY KEY using index "agent_sessions_pkey";

alter table "public"."agent_task_runs" add constraint "agent_task_runs_pkey" PRIMARY KEY using index "agent_task_runs_pkey";

alter table "public"."agents" add constraint "agents_pkey" PRIMARY KEY using index "agents_pkey";

alter table "public"."audio_audio" add constraint "audio_audio_pkey" PRIMARY KEY using index "audio_audio_pkey";

alter table "public"."audit_events" add constraint "audit_events_pkey" PRIMARY KEY using index "audit_events_pkey";

alter table "public"."authorities" add constraint "authorities_pkey" PRIMARY KEY using index "authorities_pkey";

alter table "public"."bot_registry" add constraint "bot_registry_pkey" PRIMARY KEY using index "bot_registry_pkey";

alter table "public"."case_documents" add constraint "case_documents_pkey" PRIMARY KEY using index "case_documents_pkey";

alter table "public"."cases" add constraint "cases_pkey" PRIMARY KEY using index "cases_pkey";

alter table "public"."charges" add constraint "charges_pkey" PRIMARY KEY using index "charges_pkey";

alter table "public"."clerk_alerts" add constraint "clerk_alerts_pkey" PRIMARY KEY using index "clerk_alerts_pkey";

alter table "public"."coc_chain_templates" add constraint "coc_chain_templates_pkey" PRIMARY KEY using index "coc_chain_templates_pkey";

alter table "public"."coc_events" add constraint "coc_events_pkey" PRIMARY KEY using index "coc_events_pkey";

alter table "public"."coc_records" add constraint "coc_records_pkey" PRIMARY KEY using index "coc_records_pkey";

alter table "public"."cold_cases_ingestion_state" add constraint "cold_cases_ingestion_state_pkey" PRIMARY KEY using index "cold_cases_ingestion_state_pkey";

alter table "public"."conversations" add constraint "conversations_pkey" PRIMARY KEY using index "conversations_pkey";

alter table "public"."court_opinions" add constraint "court_opinions_pkey" PRIMARY KEY using index "court_opinions_pkey";

alter table "public"."courtlistener_webhook_config" add constraint "courtlistener_webhook_config_pkey" PRIMARY KEY using index "courtlistener_webhook_config_pkey";

alter table "public"."courtlistener_webhook_events" add constraint "courtlistener_webhook_events_pkey" PRIMARY KEY using index "courtlistener_webhook_events_pkey";

alter table "public"."directory_agent_referrals" add constraint "directory_agent_referrals_pkey" PRIMARY KEY using index "directory_agent_referrals_pkey";

alter table "public"."directory_lawyer_profiles" add constraint "directory_lawyer_profiles_pkey" PRIMARY KEY using index "directory_lawyer_profiles_pkey";

alter table "public"."directory_subscriptions" add constraint "directory_subscriptions_pkey" PRIMARY KEY using index "directory_subscriptions_pkey";

alter table "public"."disclosures_financialdisclosure" add constraint "disclosures_financialdisclosure_pkey" PRIMARY KEY using index "disclosures_financialdisclosure_pkey";

alter table "public"."disclosures_investment" add constraint "disclosures_investment_pkey" PRIMARY KEY using index "disclosures_investment_pkey";

alter table "public"."document_nodes" add constraint "document_nodes_pkey" PRIMARY KEY using index "document_nodes_pkey";

alter table "public"."filings" add constraint "filings_pkey" PRIMARY KEY using index "filings_pkey";

alter table "public"."hearings" add constraint "hearings_pkey" PRIMARY KEY using index "hearings_pkey";

alter table "public"."lab_simulations" add constraint "lab_simulations_pkey" PRIMARY KEY using index "lab_simulations_pkey";

alter table "public"."legal_chunks" add constraint "legal_chunks_pkey" PRIMARY KEY using index "legal_chunks_pkey";

alter table "public"."messages" add constraint "messages_pkey" PRIMARY KEY using index "messages_pkey";

alter table "public"."model_configs" add constraint "model_configs_pkey" PRIMARY KEY using index "model_configs_pkey";

alter table "public"."opinion_citations" add constraint "opinion_citations_pkey" PRIMARY KEY using index "opinion_citations_pkey";

alter table "public"."people_db_attorney" add constraint "people_db_attorney_pkey" PRIMARY KEY using index "people_db_attorney_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."research_queries" add constraint "research_queries_pkey" PRIMARY KEY using index "research_queries_pkey";

alter table "public"."retrieval_logs" add constraint "retrieval_logs_pkey" PRIMARY KEY using index "retrieval_logs_pkey";

alter table "public"."sources" add constraint "sources_pkey" PRIMARY KEY using index "sources_pkey";

alter table "public"."tool_executions" add constraint "tool_executions_pkey" PRIMARY KEY using index "tool_executions_pkey";

alter table "public"."webhook_delivery_log" add constraint "webhook_delivery_log_pkey" PRIMARY KEY using index "webhook_delivery_log_pkey";

alter table "public"."_migrations" add constraint "_migrations_name_key" UNIQUE using index "_migrations_name_key";

alter table "public"."agent_bot_assignments" add constraint "agent_bot_assignments_agent_id_bot_id_key" UNIQUE using index "agent_bot_assignments_agent_id_bot_id_key";

alter table "public"."agent_bot_assignments" add constraint "agent_bot_assignments_agent_id_fkey" FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON DELETE CASCADE not valid;

alter table "public"."agent_bot_assignments" validate constraint "agent_bot_assignments_agent_id_fkey";

alter table "public"."agent_bot_assignments" add constraint "agent_bot_assignments_agent_id_slot_key" UNIQUE using index "agent_bot_assignments_agent_id_slot_key";

alter table "public"."agent_bot_assignments" add constraint "agent_bot_assignments_bot_id_fkey" FOREIGN KEY (bot_id) REFERENCES public.bot_registry(id) ON DELETE CASCADE not valid;

alter table "public"."agent_bot_assignments" validate constraint "agent_bot_assignments_bot_id_fkey";

alter table "public"."agent_bot_assignments" add constraint "agent_bot_assignments_slot_check" CHECK ((slot = ANY (ARRAY['fixed_1'::text, 'fixed_2'::text, 'fixed_3'::text, 'running_back'::text]))) not valid;

alter table "public"."agent_bot_assignments" validate constraint "agent_bot_assignments_slot_check";

alter table "public"."agent_model_overrides" add constraint "agent_model_overrides_agent_id_fkey" FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON DELETE CASCADE not valid;

alter table "public"."agent_model_overrides" validate constraint "agent_model_overrides_agent_id_fkey";

alter table "public"."agent_model_overrides" add constraint "agent_model_overrides_agent_id_user_id_key" UNIQUE using index "agent_model_overrides_agent_id_user_id_key";

alter table "public"."agent_model_overrides" add constraint "agent_model_overrides_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."agent_model_overrides" validate constraint "agent_model_overrides_user_id_fkey";

alter table "public"."agent_permissions" add constraint "agent_permissions_agent_id_fkey" FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON DELETE CASCADE not valid;

alter table "public"."agent_permissions" validate constraint "agent_permissions_agent_id_fkey";

alter table "public"."agent_permissions" add constraint "agent_permissions_agent_id_key" UNIQUE using index "agent_permissions_agent_id_key";

alter table "public"."agent_runs" add constraint "agent_runs_agent_id_fkey" FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON DELETE CASCADE not valid;

alter table "public"."agent_runs" validate constraint "agent_runs_agent_id_fkey";

alter table "public"."agent_runs" add constraint "agent_runs_conversation_id_fkey" FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE SET NULL not valid;

alter table "public"."agent_runs" validate constraint "agent_runs_conversation_id_fkey";

alter table "public"."agent_runs" add constraint "agent_runs_status_check" CHECK ((status = ANY (ARRAY['queued'::text, 'running'::text, 'completed'::text, 'failed'::text, 'cancelled'::text]))) not valid;

alter table "public"."agent_runs" validate constraint "agent_runs_status_check";

alter table "public"."agent_sessions" add constraint "agent_sessions_case_id_fkey" FOREIGN KEY (case_id) REFERENCES public.cases(id) ON DELETE CASCADE not valid;

alter table "public"."agent_sessions" validate constraint "agent_sessions_case_id_fkey";

alter table "public"."agent_sessions" add constraint "agent_sessions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."agent_sessions" validate constraint "agent_sessions_user_id_fkey";

alter table "public"."agent_task_runs" add constraint "agent_task_runs_matter_id_fkey" FOREIGN KEY (matter_id) REFERENCES public.matters(id) ON DELETE SET NULL not valid;

alter table "public"."agent_task_runs" validate constraint "agent_task_runs_matter_id_fkey";

alter table "public"."agent_task_runs" add constraint "agent_task_runs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."agent_task_runs" validate constraint "agent_task_runs_user_id_fkey";

alter table "public"."agents" add constraint "agents_assigned_to_agent_id_fkey" FOREIGN KEY (assigned_to_agent_id) REFERENCES public.agents(id) ON DELETE SET NULL not valid;

alter table "public"."agents" validate constraint "agents_assigned_to_agent_id_fkey";

alter table "public"."agents" add constraint "agents_matter_id_fkey" FOREIGN KEY (matter_id) REFERENCES public.matters(id) ON DELETE SET NULL not valid;

alter table "public"."agents" validate constraint "agents_matter_id_fkey";

alter table "public"."agents" add constraint "agents_tier_check" CHECK ((tier = ANY (ARRAY['archangel'::text, 'patriarch'::text, 'prophet'::text, 'judge'::text, 'bot'::text]))) not valid;

alter table "public"."agents" validate constraint "agents_tier_check";

alter table "public"."agents" add constraint "agents_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."agents" validate constraint "agents_user_id_fkey";

alter table "public"."audit_events" add constraint "audit_events_tenant_id_event_hash_key" UNIQUE using index "audit_events_tenant_id_event_hash_key";

alter table "public"."audit_events" add constraint "audit_events_tenant_id_sequence_number_key" UNIQUE using index "audit_events_tenant_id_sequence_number_key";

alter table "public"."audit_logs" add constraint "audit_logs_agent_id_fkey" FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON DELETE SET NULL not valid;

alter table "public"."audit_logs" validate constraint "audit_logs_agent_id_fkey";

alter table "public"."authorities" add constraint "authorities_source_id_sources_id_fk" FOREIGN KEY (source_id) REFERENCES public.sources(id) ON DELETE CASCADE not valid;

alter table "public"."authorities" validate constraint "authorities_source_id_sources_id_fk";

alter table "public"."bot_registry" add constraint "bot_registry_slug_key" UNIQUE using index "bot_registry_slug_key";

alter table "public"."case_documents" add constraint "case_documents_case_id_cases_id_fk" FOREIGN KEY (case_id) REFERENCES public.cases(id) not valid;

alter table "public"."case_documents" validate constraint "case_documents_case_id_cases_id_fk";

alter table "public"."cases" add constraint "cases_matter_id_fkey" FOREIGN KEY (matter_id) REFERENCES public.matters(id) ON DELETE SET NULL not valid;

alter table "public"."cases" validate constraint "cases_matter_id_fkey";

alter table "public"."cases" add constraint "cases_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."cases" validate constraint "cases_user_id_fkey";

alter table "public"."charges" add constraint "charges_matter_id_fkey" FOREIGN KEY (matter_id) REFERENCES public.matters(id) ON DELETE CASCADE not valid;

alter table "public"."charges" validate constraint "charges_matter_id_fkey";

alter table "public"."charges" add constraint "charges_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'reduced'::text, 'dismissed'::text, 'convicted'::text, 'acquitted'::text]))) not valid;

alter table "public"."charges" validate constraint "charges_status_check";

alter table "public"."clerk_alerts" add constraint "clerk_alerts_matter_id_fkey" FOREIGN KEY (matter_id) REFERENCES public.matters(id) ON DELETE CASCADE not valid;

alter table "public"."clerk_alerts" validate constraint "clerk_alerts_matter_id_fkey";

alter table "public"."clerk_alerts" add constraint "clerk_alerts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."clerk_alerts" validate constraint "clerk_alerts_user_id_fkey";

alter table "public"."coc_chain_templates" add constraint "coc_chain_templates_slug_key" UNIQUE using index "coc_chain_templates_slug_key";

alter table "public"."coc_events" add constraint "coc_events_agent_id_fkey" FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON DELETE SET NULL not valid;

alter table "public"."coc_events" validate constraint "coc_events_agent_id_fkey";

alter table "public"."coc_events" add constraint "coc_events_coc_record_id_fkey" FOREIGN KEY (coc_record_id) REFERENCES public.coc_records(id) ON DELETE CASCADE not valid;

alter table "public"."coc_events" validate constraint "coc_events_coc_record_id_fkey";

alter table "public"."coc_records" add constraint "coc_records_authenticity_score_check" CHECK (((authenticity_score >= (0)::numeric) AND (authenticity_score <= (1)::numeric))) not valid;

alter table "public"."coc_records" validate constraint "coc_records_authenticity_score_check";

alter table "public"."coc_records" add constraint "coc_records_custody_score_check" CHECK (((custody_score >= (0)::numeric) AND (custody_score <= (1)::numeric))) not valid;

alter table "public"."coc_records" validate constraint "coc_records_custody_score_check";

alter table "public"."coc_records" add constraint "coc_records_integrity_score_check" CHECK (((integrity_score >= (0)::numeric) AND (integrity_score <= (1)::numeric))) not valid;

alter table "public"."coc_records" validate constraint "coc_records_integrity_score_check";

alter table "public"."coc_records" add constraint "coc_records_matter_id_fkey" FOREIGN KEY (matter_id) REFERENCES public.matters(id) ON DELETE CASCADE not valid;

alter table "public"."coc_records" validate constraint "coc_records_matter_id_fkey";

alter table "public"."coc_records" add constraint "coc_records_source_id_fkey" FOREIGN KEY (source_id) REFERENCES public.sources(id) not valid;

alter table "public"."coc_records" validate constraint "coc_records_source_id_fkey";

alter table "public"."coc_records" add constraint "coc_records_source_score_check" CHECK (((source_score >= (0)::numeric) AND (source_score <= (1)::numeric))) not valid;

alter table "public"."coc_records" validate constraint "coc_records_source_score_check";

alter table "public"."coc_records" add constraint "coc_records_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."coc_records" validate constraint "coc_records_user_id_fkey";

alter table "public"."cold_cases_ingestion" add constraint "cold_cases_ingestion_dataset_split_source_uidx" UNIQUE using index "cold_cases_ingestion_dataset_split_source_uidx";

alter table "public"."conversations" add constraint "conversations_matter_id_fkey" FOREIGN KEY (matter_id) REFERENCES public.matters(id) ON DELETE SET NULL not valid;

alter table "public"."conversations" validate constraint "conversations_matter_id_fkey";

alter table "public"."conversations" add constraint "conversations_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."conversations" validate constraint "conversations_user_id_fkey";

alter table "public"."court_opinions" add constraint "court_opinions_cl_opinion_id_key" UNIQUE using index "court_opinions_cl_opinion_id_key";

alter table "public"."courtlistener_webhook_config" add constraint "courtlistener_webhook_config_id_check" CHECK (id) not valid;

alter table "public"."courtlistener_webhook_config" validate constraint "courtlistener_webhook_config_id_check";

alter table "public"."courtlistener_webhook_config" add constraint "courtlistener_webhook_config_path_token_key" UNIQUE using index "courtlistener_webhook_config_path_token_key";

alter table "public"."directory_agent_referrals" add constraint "directory_agent_referrals_lawyer_id_directory_lawyer_profiles_i" FOREIGN KEY (lawyer_id) REFERENCES public.directory_lawyer_profiles(id) not valid;

alter table "public"."directory_agent_referrals" validate constraint "directory_agent_referrals_lawyer_id_directory_lawyer_profiles_i";

alter table "public"."directory_agent_referrals" add constraint "directory_agent_referrals_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."directory_agent_referrals" validate constraint "directory_agent_referrals_user_id_fkey";

alter table "public"."directory_lawyer_profiles" add constraint "directory_lawyer_profiles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."directory_lawyer_profiles" validate constraint "directory_lawyer_profiles_user_id_fkey";

alter table "public"."directory_subscriptions" add constraint "directory_subscriptions_lawyer_id_directory_lawyer_profiles_id_" FOREIGN KEY (lawyer_id) REFERENCES public.directory_lawyer_profiles(id) not valid;

alter table "public"."directory_subscriptions" validate constraint "directory_subscriptions_lawyer_id_directory_lawyer_profiles_id_";

alter table "public"."document_nodes" add constraint "document_nodes_case_id_fkey" FOREIGN KEY (case_id) REFERENCES public.cases(id) ON DELETE CASCADE not valid;

alter table "public"."document_nodes" validate constraint "document_nodes_case_id_fkey";

alter table "public"."document_nodes" add constraint "document_nodes_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."document_nodes" validate constraint "document_nodes_user_id_fkey";

alter table "public"."filings" add constraint "filings_case_id_fkey" FOREIGN KEY (case_id) REFERENCES public.cases(id) ON DELETE CASCADE not valid;

alter table "public"."filings" validate constraint "filings_case_id_fkey";

alter table "public"."filings" add constraint "filings_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."filings" validate constraint "filings_user_id_fkey";

alter table "public"."hearings" add constraint "hearings_document_id_fkey" FOREIGN KEY (document_id) REFERENCES public.documents(id) ON DELETE SET NULL not valid;

alter table "public"."hearings" validate constraint "hearings_document_id_fkey";

alter table "public"."hearings" add constraint "hearings_matter_id_fkey" FOREIGN KEY (matter_id) REFERENCES public.matters(id) ON DELETE CASCADE not valid;

alter table "public"."hearings" validate constraint "hearings_matter_id_fkey";

alter table "public"."lab_simulations" add constraint "lab_simulations_case_id_cases_id_fk" FOREIGN KEY (case_id) REFERENCES public.cases(id) not valid;

alter table "public"."lab_simulations" validate constraint "lab_simulations_case_id_cases_id_fk";

alter table "public"."legal_chunks" add constraint "legal_chunks_authority_id_authorities_id_fk" FOREIGN KEY (authority_id) REFERENCES public.authorities(id) ON DELETE CASCADE not valid;

alter table "public"."legal_chunks" validate constraint "legal_chunks_authority_id_authorities_id_fk";

alter table "public"."messages" add constraint "messages_agent_id_fkey" FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON DELETE SET NULL not valid;

alter table "public"."messages" validate constraint "messages_agent_id_fkey";

alter table "public"."messages" add constraint "messages_agent_run_id_fkey" FOREIGN KEY (agent_run_id) REFERENCES public.agent_runs(id) ON DELETE SET NULL not valid;

alter table "public"."messages" validate constraint "messages_agent_run_id_fkey";

alter table "public"."messages" add constraint "messages_conversation_id_fkey" FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE not valid;

alter table "public"."messages" validate constraint "messages_conversation_id_fkey";

alter table "public"."messages" add constraint "messages_role_check" CHECK ((role = ANY (ARRAY['user'::text, 'assistant'::text, 'system'::text, 'tool'::text]))) not valid;

alter table "public"."messages" validate constraint "messages_role_check";

alter table "public"."model_configs" add constraint "model_configs_connection_status_check" CHECK ((connection_status = ANY (ARRAY['connected'::text, 'disconnected'::text, 'unknown'::text]))) not valid;

alter table "public"."model_configs" validate constraint "model_configs_connection_status_check";

alter table "public"."model_configs" add constraint "model_configs_use_case_check" CHECK ((use_case = ANY (ARRAY['default'::text, 'reasoning'::text, 'embedding'::text, 'extraction'::text, 'classification'::text, 'streaming'::text, 'general'::text]))) not valid;

alter table "public"."model_configs" validate constraint "model_configs_use_case_check";

alter table "public"."model_configs" add constraint "model_configs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."model_configs" validate constraint "model_configs_user_id_fkey";

alter table "public"."model_configs" add constraint "model_configs_user_id_provider_model_id_use_case_key" UNIQUE using index "model_configs_user_id_provider_model_id_use_case_key";

alter table "public"."opinion_citations" add constraint "opinion_citations_cited_opinion_id_fkey" FOREIGN KEY (cited_opinion_id) REFERENCES public.court_opinions(id) ON DELETE CASCADE not valid;

alter table "public"."opinion_citations" validate constraint "opinion_citations_cited_opinion_id_fkey";

alter table "public"."opinion_citations" add constraint "opinion_citations_citing_opinion_id_cited_opinion_id_key" UNIQUE using index "opinion_citations_citing_opinion_id_cited_opinion_id_key";

alter table "public"."opinion_citations" add constraint "opinion_citations_citing_opinion_id_fkey" FOREIGN KEY (citing_opinion_id) REFERENCES public.court_opinions(id) ON DELETE CASCADE not valid;

alter table "public"."opinion_citations" validate constraint "opinion_citations_citing_opinion_id_fkey";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."research_queries" add constraint "research_queries_matter_id_fkey" FOREIGN KEY (matter_id) REFERENCES public.matters(id) ON DELETE SET NULL not valid;

alter table "public"."research_queries" validate constraint "research_queries_matter_id_fkey";

alter table "public"."research_queries" add constraint "research_queries_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."research_queries" validate constraint "research_queries_user_id_fkey";

alter table "public"."retrieval_logs" add constraint "retrieval_logs_agent_run_id_fkey" FOREIGN KEY (agent_run_id) REFERENCES public.agent_runs(id) ON DELETE SET NULL not valid;

alter table "public"."retrieval_logs" validate constraint "retrieval_logs_agent_run_id_fkey";

alter table "public"."retrieval_logs" add constraint "retrieval_logs_matter_id_fkey" FOREIGN KEY (matter_id) REFERENCES public.matters(id) ON DELETE SET NULL not valid;

alter table "public"."retrieval_logs" validate constraint "retrieval_logs_matter_id_fkey";

alter table "public"."retrieval_logs" add constraint "retrieval_logs_retrieval_type_check" CHECK ((retrieval_type = ANY (ARRAY['semantic'::text, 'keyword'::text, 'hybrid'::text]))) not valid;

alter table "public"."retrieval_logs" validate constraint "retrieval_logs_retrieval_type_check";

alter table "public"."sources" add constraint "sources_source_hash_unique" UNIQUE using index "sources_source_hash_unique";

alter table "public"."timeline_events" add constraint "timeline_events_agent_id_fkey" FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON DELETE SET NULL not valid;

alter table "public"."timeline_events" validate constraint "timeline_events_agent_id_fkey";

alter table "public"."timeline_events" add constraint "timeline_events_confidence_check" CHECK (((confidence >= (0)::numeric) AND (confidence <= (1)::numeric))) not valid;

alter table "public"."timeline_events" validate constraint "timeline_events_confidence_check";

alter table "public"."tool_executions" add constraint "tool_executions_agent_run_id_fkey" FOREIGN KEY (agent_run_id) REFERENCES public.agent_runs(id) ON DELETE CASCADE not valid;

alter table "public"."tool_executions" validate constraint "tool_executions_agent_run_id_fkey";

alter table "public"."tool_executions" add constraint "tool_executions_status_check" CHECK ((status = ANY (ARRAY['queued'::text, 'running'::text, 'completed'::text, 'failed'::text]))) not valid;

alter table "public"."tool_executions" validate constraint "tool_executions_status_check";

alter table "public"."webhook_delivery_log" add constraint "webhook_delivery_log_event_id_fkey" FOREIGN KEY (event_id) REFERENCES public.courtlistener_webhook_events(event_id) ON DELETE CASCADE not valid;

alter table "public"."webhook_delivery_log" validate constraint "webhook_delivery_log_event_id_fkey";

alter table "public"."webhook_delivery_log" add constraint "webhook_delivery_log_processing_status_check" CHECK ((processing_status = ANY (ARRAY['pending'::text, 'processed'::text, 'failed'::text, 'skipped'::text]))) not valid;

alter table "public"."webhook_delivery_log" validate constraint "webhook_delivery_log_processing_status_check";

set check_function_bodies = off;

create or replace view "public"."coc_matter_summary" as  SELECT matter_id,
    count(*) AS total_records,
    count(*) FILTER (WHERE (verification_status = 'verified'::public.coc_verification_status)) AS verified_count,
    count(*) FILTER (WHERE (verification_status = 'gap_detected'::public.coc_verification_status)) AS gap_count,
    count(*) FILTER (WHERE (verification_status = 'review_needed'::public.coc_verification_status)) AS review_count,
    count(*) FILTER (WHERE (blockchain_anchored = true)) AS anchored_count,
    sum(review_item_count) AS total_review_items,
    max(updated_at) AS last_updated
   FROM public.coc_records
  GROUP BY matter_id;


CREATE OR REPLACE FUNCTION public.cold_cases_ingest_status()
 RETURNS TABLE(source_dataset text, source_split text, next_offset bigint, rows_ingested bigint, status text, last_error text, updated_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select source_dataset, source_split, next_offset, rows_ingested, status, last_error, updated_at
  from public.cold_cases_ingestion_state
  where source_dataset = 'harvard-lil/cold-cases';
$function$
;

CREATE OR REPLACE FUNCTION public.courtlistener_webhook_path_token()
 RETURNS text
 LANGUAGE sql
 SET search_path TO ''
AS $function$ select encode(extensions.gen_random_bytes(24), 'hex') $function$
;

CREATE OR REPLACE FUNCTION public.create_default_agent_permissions()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.agent_permissions (agent_id)
  VALUES (NEW.id)
  ON CONFLICT (agent_id) DO NOTHING;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'full_name');

  insert into public.users (auth_id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (auth_id) do nothing;

  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.match_courtlistener(query_embedding public.vector, match_threshold double precision DEFAULT 0.5, match_count integer DEFAULT 5)
 RETURNS TABLE(id bigint, case_id text, content text, similarity double precision)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    courtlistener_vectors.id,
    courtlistener_vectors.case_id,
    courtlistener_vectors.content,
    1 - (courtlistener_vectors.embedding <=> query_embedding) AS similarity
  FROM courtlistener_vectors
  WHERE 1 - (courtlistener_vectors.embedding <=> query_embedding) > match_threshold
  ORDER BY courtlistener_vectors.embedding <=> query_embedding
  LIMIT match_count;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.rls_auto_enable()
 RETURNS event_trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$
;

grant references on table "public"."_migrations" to "anon";

grant trigger on table "public"."_migrations" to "anon";

grant truncate on table "public"."_migrations" to "anon";

grant references on table "public"."_migrations" to "authenticated";

grant trigger on table "public"."_migrations" to "authenticated";

grant truncate on table "public"."_migrations" to "authenticated";

grant references on table "public"."_migrations" to "service_role";

grant trigger on table "public"."_migrations" to "service_role";

grant truncate on table "public"."_migrations" to "service_role";

grant references on table "public"."agent_bot_assignments" to "anon";

grant trigger on table "public"."agent_bot_assignments" to "anon";

grant truncate on table "public"."agent_bot_assignments" to "anon";

grant references on table "public"."agent_bot_assignments" to "authenticated";

grant trigger on table "public"."agent_bot_assignments" to "authenticated";

grant truncate on table "public"."agent_bot_assignments" to "authenticated";

grant references on table "public"."agent_bot_assignments" to "service_role";

grant trigger on table "public"."agent_bot_assignments" to "service_role";

grant truncate on table "public"."agent_bot_assignments" to "service_role";

grant references on table "public"."agent_model_overrides" to "anon";

grant trigger on table "public"."agent_model_overrides" to "anon";

grant truncate on table "public"."agent_model_overrides" to "anon";

grant references on table "public"."agent_model_overrides" to "authenticated";

grant trigger on table "public"."agent_model_overrides" to "authenticated";

grant truncate on table "public"."agent_model_overrides" to "authenticated";

grant references on table "public"."agent_model_overrides" to "service_role";

grant trigger on table "public"."agent_model_overrides" to "service_role";

grant truncate on table "public"."agent_model_overrides" to "service_role";

grant references on table "public"."agent_permissions" to "anon";

grant trigger on table "public"."agent_permissions" to "anon";

grant truncate on table "public"."agent_permissions" to "anon";

grant references on table "public"."agent_permissions" to "authenticated";

grant trigger on table "public"."agent_permissions" to "authenticated";

grant truncate on table "public"."agent_permissions" to "authenticated";

grant references on table "public"."agent_permissions" to "service_role";

grant trigger on table "public"."agent_permissions" to "service_role";

grant truncate on table "public"."agent_permissions" to "service_role";

grant references on table "public"."agent_sessions" to "anon";

grant trigger on table "public"."agent_sessions" to "anon";

grant truncate on table "public"."agent_sessions" to "anon";

grant references on table "public"."agent_sessions" to "authenticated";

grant trigger on table "public"."agent_sessions" to "authenticated";

grant truncate on table "public"."agent_sessions" to "authenticated";

grant references on table "public"."agent_sessions" to "service_role";

grant trigger on table "public"."agent_sessions" to "service_role";

grant truncate on table "public"."agent_sessions" to "service_role";

grant references on table "public"."agent_task_runs" to "anon";

grant trigger on table "public"."agent_task_runs" to "anon";

grant truncate on table "public"."agent_task_runs" to "anon";

grant references on table "public"."agent_task_runs" to "authenticated";

grant trigger on table "public"."agent_task_runs" to "authenticated";

grant truncate on table "public"."agent_task_runs" to "authenticated";

grant references on table "public"."agent_task_runs" to "service_role";

grant trigger on table "public"."agent_task_runs" to "service_role";

grant truncate on table "public"."agent_task_runs" to "service_role";

grant references on table "public"."audit_events" to "anon";

grant trigger on table "public"."audit_events" to "anon";

grant truncate on table "public"."audit_events" to "anon";

grant references on table "public"."audit_events" to "authenticated";

grant trigger on table "public"."audit_events" to "authenticated";

grant truncate on table "public"."audit_events" to "authenticated";

grant references on table "public"."audit_events" to "service_role";

grant trigger on table "public"."audit_events" to "service_role";

grant truncate on table "public"."audit_events" to "service_role";

grant references on table "public"."bot_registry" to "anon";

grant trigger on table "public"."bot_registry" to "anon";

grant truncate on table "public"."bot_registry" to "anon";

grant references on table "public"."bot_registry" to "authenticated";

grant trigger on table "public"."bot_registry" to "authenticated";

grant truncate on table "public"."bot_registry" to "authenticated";

grant references on table "public"."bot_registry" to "service_role";

grant trigger on table "public"."bot_registry" to "service_role";

grant truncate on table "public"."bot_registry" to "service_role";

grant references on table "public"."clerk_alerts" to "anon";

grant trigger on table "public"."clerk_alerts" to "anon";

grant truncate on table "public"."clerk_alerts" to "anon";

grant references on table "public"."clerk_alerts" to "authenticated";

grant trigger on table "public"."clerk_alerts" to "authenticated";

grant truncate on table "public"."clerk_alerts" to "authenticated";

grant references on table "public"."clerk_alerts" to "service_role";

grant trigger on table "public"."clerk_alerts" to "service_role";

grant truncate on table "public"."clerk_alerts" to "service_role";

grant references on table "public"."coc_chain_templates" to "anon";

grant trigger on table "public"."coc_chain_templates" to "anon";

grant truncate on table "public"."coc_chain_templates" to "anon";

grant references on table "public"."coc_chain_templates" to "authenticated";

grant trigger on table "public"."coc_chain_templates" to "authenticated";

grant truncate on table "public"."coc_chain_templates" to "authenticated";

grant references on table "public"."coc_chain_templates" to "service_role";

grant trigger on table "public"."coc_chain_templates" to "service_role";

grant truncate on table "public"."coc_chain_templates" to "service_role";

grant references on table "public"."coc_events" to "anon";

grant trigger on table "public"."coc_events" to "anon";

grant truncate on table "public"."coc_events" to "anon";

grant references on table "public"."coc_events" to "authenticated";

grant trigger on table "public"."coc_events" to "authenticated";

grant truncate on table "public"."coc_events" to "authenticated";

grant references on table "public"."coc_events" to "service_role";

grant trigger on table "public"."coc_events" to "service_role";

grant truncate on table "public"."coc_events" to "service_role";

grant references on table "public"."coc_records" to "anon";

grant trigger on table "public"."coc_records" to "anon";

grant truncate on table "public"."coc_records" to "anon";

grant references on table "public"."coc_records" to "authenticated";

grant trigger on table "public"."coc_records" to "authenticated";

grant truncate on table "public"."coc_records" to "authenticated";

grant references on table "public"."coc_records" to "service_role";

grant trigger on table "public"."coc_records" to "service_role";

grant truncate on table "public"."coc_records" to "service_role";

grant references on table "public"."court_opinions" to "anon";

grant trigger on table "public"."court_opinions" to "anon";

grant truncate on table "public"."court_opinions" to "anon";

grant references on table "public"."court_opinions" to "authenticated";

grant trigger on table "public"."court_opinions" to "authenticated";

grant truncate on table "public"."court_opinions" to "authenticated";

grant references on table "public"."court_opinions" to "service_role";

grant trigger on table "public"."court_opinions" to "service_role";

grant truncate on table "public"."court_opinions" to "service_role";

grant references on table "public"."document_nodes" to "anon";

grant trigger on table "public"."document_nodes" to "anon";

grant truncate on table "public"."document_nodes" to "anon";

grant references on table "public"."document_nodes" to "authenticated";

grant trigger on table "public"."document_nodes" to "authenticated";

grant truncate on table "public"."document_nodes" to "authenticated";

grant references on table "public"."document_nodes" to "service_role";

grant trigger on table "public"."document_nodes" to "service_role";

grant truncate on table "public"."document_nodes" to "service_role";

grant references on table "public"."filings" to "anon";

grant trigger on table "public"."filings" to "anon";

grant truncate on table "public"."filings" to "anon";

grant references on table "public"."filings" to "authenticated";

grant trigger on table "public"."filings" to "authenticated";

grant truncate on table "public"."filings" to "authenticated";

grant references on table "public"."filings" to "service_role";

grant trigger on table "public"."filings" to "service_role";

grant truncate on table "public"."filings" to "service_role";

grant references on table "public"."messages" to "anon";

grant trigger on table "public"."messages" to "anon";

grant truncate on table "public"."messages" to "anon";

grant references on table "public"."messages" to "authenticated";

grant trigger on table "public"."messages" to "authenticated";

grant truncate on table "public"."messages" to "authenticated";

grant references on table "public"."messages" to "service_role";

grant trigger on table "public"."messages" to "service_role";

grant truncate on table "public"."messages" to "service_role";

grant references on table "public"."model_configs" to "anon";

grant trigger on table "public"."model_configs" to "anon";

grant truncate on table "public"."model_configs" to "anon";

grant references on table "public"."model_configs" to "authenticated";

grant trigger on table "public"."model_configs" to "authenticated";

grant truncate on table "public"."model_configs" to "authenticated";

grant references on table "public"."model_configs" to "service_role";

grant trigger on table "public"."model_configs" to "service_role";

grant truncate on table "public"."model_configs" to "service_role";

grant references on table "public"."opinion_citations" to "anon";

grant trigger on table "public"."opinion_citations" to "anon";

grant truncate on table "public"."opinion_citations" to "anon";

grant references on table "public"."opinion_citations" to "authenticated";

grant trigger on table "public"."opinion_citations" to "authenticated";

grant truncate on table "public"."opinion_citations" to "authenticated";

grant references on table "public"."opinion_citations" to "service_role";

grant trigger on table "public"."opinion_citations" to "service_role";

grant truncate on table "public"."opinion_citations" to "service_role";

grant references on table "public"."research_queries" to "anon";

grant trigger on table "public"."research_queries" to "anon";

grant truncate on table "public"."research_queries" to "anon";

grant references on table "public"."research_queries" to "authenticated";

grant trigger on table "public"."research_queries" to "authenticated";

grant truncate on table "public"."research_queries" to "authenticated";

grant references on table "public"."research_queries" to "service_role";

grant trigger on table "public"."research_queries" to "service_role";

grant truncate on table "public"."research_queries" to "service_role";

grant references on table "public"."retrieval_logs" to "anon";

grant trigger on table "public"."retrieval_logs" to "anon";

grant truncate on table "public"."retrieval_logs" to "anon";

grant references on table "public"."retrieval_logs" to "authenticated";

grant trigger on table "public"."retrieval_logs" to "authenticated";

grant truncate on table "public"."retrieval_logs" to "authenticated";

grant references on table "public"."retrieval_logs" to "service_role";

grant trigger on table "public"."retrieval_logs" to "service_role";

grant truncate on table "public"."retrieval_logs" to "service_role";

grant references on table "public"."webhook_delivery_log" to "anon";

grant trigger on table "public"."webhook_delivery_log" to "anon";

grant truncate on table "public"."webhook_delivery_log" to "anon";

grant references on table "public"."webhook_delivery_log" to "authenticated";

grant trigger on table "public"."webhook_delivery_log" to "authenticated";

grant truncate on table "public"."webhook_delivery_log" to "authenticated";

grant references on table "public"."webhook_delivery_log" to "service_role";

grant trigger on table "public"."webhook_delivery_log" to "service_role";

grant truncate on table "public"."webhook_delivery_log" to "service_role";


  create policy "agent_bot_assignments_owner"
  on "public"."agent_bot_assignments"
  as permissive
  for all
  to authenticated
using ((EXISTS ( SELECT 1
   FROM (public.agents a
     JOIN public.users u ON ((u.id = a.user_id)))
  WHERE ((a.id = agent_bot_assignments.agent_id) AND (u.auth_id = ( SELECT auth.uid() AS uid))))))
with check ((EXISTS ( SELECT 1
   FROM (public.agents a
     JOIN public.users u ON ((u.id = a.user_id)))
  WHERE ((a.id = agent_bot_assignments.agent_id) AND (u.auth_id = ( SELECT auth.uid() AS uid))))));



  create policy "agent_model_overrides_owner"
  on "public"."agent_model_overrides"
  as permissive
  for all
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = agent_model_overrides.user_id) AND (u.auth_id = ( SELECT auth.uid() AS uid))))))
with check ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = agent_model_overrides.user_id) AND (u.auth_id = ( SELECT auth.uid() AS uid))))));



  create policy "agent_permissions_owner_all"
  on "public"."agent_permissions"
  as permissive
  for all
  to authenticated
using ((EXISTS ( SELECT 1
   FROM (public.agents a
     JOIN public.users u ON ((u.id = a.user_id)))
  WHERE ((a.id = agent_permissions.agent_id) AND (u.auth_id = ( SELECT auth.uid() AS uid))))))
with check ((EXISTS ( SELECT 1
   FROM (public.agents a
     JOIN public.users u ON ((u.id = a.user_id)))
  WHERE ((a.id = agent_permissions.agent_id) AND (u.auth_id = ( SELECT auth.uid() AS uid))))));



  create policy "agent_runs_owner_all"
  on "public"."agent_runs"
  as permissive
  for all
  to authenticated
using ((EXISTS ( SELECT 1
   FROM (public.agents a
     JOIN public.users u ON ((u.id = a.user_id)))
  WHERE ((a.id = agent_runs.agent_id) AND (u.auth_id = auth.uid())))))
with check ((EXISTS ( SELECT 1
   FROM (public.agents a
     JOIN public.users u ON ((u.id = a.user_id)))
  WHERE ((a.id = agent_runs.agent_id) AND (u.auth_id = auth.uid())))));



  create policy "agent_runs_owner_insert"
  on "public"."agent_runs"
  as permissive
  for insert
  to authenticated
with check ((EXISTS ( SELECT 1
   FROM (public.agents a
     JOIN public.users u ON ((u.id = a.user_id)))
  WHERE ((a.id = agent_runs.agent_id) AND (u.auth_id = ( SELECT auth.uid() AS uid))))));



  create policy "agent_runs_owner_update"
  on "public"."agent_runs"
  as permissive
  for update
  to authenticated
using ((EXISTS ( SELECT 1
   FROM (public.agents a
     JOIN public.users u ON ((u.id = a.user_id)))
  WHERE ((a.id = agent_runs.agent_id) AND (u.auth_id = ( SELECT auth.uid() AS uid))))))
with check ((EXISTS ( SELECT 1
   FROM (public.agents a
     JOIN public.users u ON ((u.id = a.user_id)))
  WHERE ((a.id = agent_runs.agent_id) AND (u.auth_id = ( SELECT auth.uid() AS uid))))));



  create policy "agent_sessions_owner_all"
  on "public"."agent_sessions"
  as permissive
  for all
  to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



  create policy "agent_task_runs_insert_own"
  on "public"."agent_task_runs"
  as permissive
  for insert
  to public
with check ((user_id IN ( SELECT users.id
   FROM public.users
  WHERE (users.auth_id = auth.uid()))));



  create policy "agent_task_runs_select_own"
  on "public"."agent_task_runs"
  as permissive
  for select
  to public
using ((user_id IN ( SELECT users.id
   FROM public.users
  WHERE (users.auth_id = auth.uid()))));



  create policy "agent_task_runs_update_own"
  on "public"."agent_task_runs"
  as permissive
  for update
  to public
using ((user_id IN ( SELECT users.id
   FROM public.users
  WHERE (users.auth_id = auth.uid()))));



  create policy "agents_owner_all"
  on "public"."agents"
  as permissive
  for all
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = agents.user_id) AND (u.auth_id = ( SELECT auth.uid() AS uid))))))
with check ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = agents.user_id) AND (u.auth_id = ( SELECT auth.uid() AS uid))))));



  create policy "audio_audio_authenticated_insert"
  on "public"."audio_audio"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "audio_audio_authenticated_select"
  on "public"."audio_audio"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Users can insert own audit logs"
  on "public"."audit_logs"
  as permissive
  for insert
  to public
with check (((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = audit_logs.user_id) AND (users.auth_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM (public.matters
     JOIN public.users ON ((users.id = matters.user_id)))
  WHERE ((matters.id = audit_logs.matter_id) AND (users.auth_id = auth.uid()))))));



  create policy "audit_logs_authenticated_insert"
  on "public"."audit_logs"
  as permissive
  for insert
  to authenticated
with check (((user_id IS NULL) OR (EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = audit_logs.user_id) AND (users.auth_id = ( SELECT auth.uid() AS uid)))))));



  create policy "audit_logs_owner_select"
  on "public"."audit_logs"
  as permissive
  for select
  to authenticated
using ((((user_id IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = audit_logs.user_id) AND (users.auth_id = ( SELECT auth.uid() AS uid)))))) OR ((matter_id IS NOT NULL) AND public.user_owns_matter(matter_id))));



  create policy "Authenticated users can read authorities"
  on "public"."authorities"
  as permissive
  for select
  to authenticated
using (true);



  create policy "bot_registry_public_read"
  on "public"."bot_registry"
  as permissive
  for select
  to authenticated
using (true);



  create policy "case_documents_owner_all"
  on "public"."case_documents"
  as permissive
  for all
  to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)))
with check ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "cases_owner_delete"
  on "public"."cases"
  as permissive
  for delete
  to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "cases_owner_insert"
  on "public"."cases"
  as permissive
  for insert
  to authenticated
with check ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "cases_owner_select"
  on "public"."cases"
  as permissive
  for select
  to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "cases_owner_update"
  on "public"."cases"
  as permissive
  for update
  to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)))
with check ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "charges_owner_all"
  on "public"."charges"
  as permissive
  for all
  to authenticated
using (public.user_owns_matter(matter_id))
with check (public.user_owns_matter(matter_id));



  create policy "clerk_alerts_delete_own"
  on "public"."clerk_alerts"
  as permissive
  for delete
  to public
using ((user_id IN ( SELECT users.id
   FROM public.users
  WHERE (users.auth_id = auth.uid()))));



  create policy "clerk_alerts_insert_own"
  on "public"."clerk_alerts"
  as permissive
  for insert
  to public
with check ((user_id IN ( SELECT users.id
   FROM public.users
  WHERE (users.auth_id = auth.uid()))));



  create policy "clerk_alerts_select_own"
  on "public"."clerk_alerts"
  as permissive
  for select
  to public
using ((user_id IN ( SELECT users.id
   FROM public.users
  WHERE (users.auth_id = auth.uid()))));



  create policy "clerk_alerts_update_own"
  on "public"."clerk_alerts"
  as permissive
  for update
  to public
using ((user_id IN ( SELECT users.id
   FROM public.users
  WHERE (users.auth_id = auth.uid()))));



  create policy "coc_templates_public_read"
  on "public"."coc_chain_templates"
  as permissive
  for select
  to authenticated
using (true);



  create policy "coc_events_owner"
  on "public"."coc_events"
  as permissive
  for all
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.coc_records r
  WHERE ((r.id = coc_events.coc_record_id) AND public.user_owns_matter(r.matter_id)))))
with check ((EXISTS ( SELECT 1
   FROM public.coc_records r
  WHERE ((r.id = coc_events.coc_record_id) AND public.user_owns_matter(r.matter_id)))));



  create policy "coc_records_owner"
  on "public"."coc_records"
  as permissive
  for all
  to authenticated
using (public.user_owns_matter(matter_id))
with check (public.user_owns_matter(matter_id));



  create policy "cold_cases_ingestion_service_only"
  on "public"."cold_cases_ingestion"
  as restrictive
  for all
  to authenticated, anon
using (false)
with check (false);



  create policy "cold_cases_ingestion_state_service_only"
  on "public"."cold_cases_ingestion_state"
  as restrictive
  for all
  to authenticated, anon
using (false)
with check (false);



  create policy "conversations_owner_all"
  on "public"."conversations"
  as permissive
  for all
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = conversations.user_id) AND (u.auth_id = ( SELECT auth.uid() AS uid))))))
with check ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = conversations.user_id) AND (u.auth_id = ( SELECT auth.uid() AS uid))))));



  create policy "court_opinions_public_select"
  on "public"."court_opinions"
  as permissive
  for select
  to anon, authenticated
using ((NOT blocked));



  create policy "courtlistener_webhook_config_no_client_access"
  on "public"."courtlistener_webhook_config"
  as permissive
  for all
  to anon, authenticated
using (false)
with check (false);



  create policy "courtlistener_webhook_events_deny_client_access"
  on "public"."courtlistener_webhook_events"
  as permissive
  for all
  to anon, authenticated
using (false)
with check (false);



  create policy "courtlistener_webhook_events_service_only"
  on "public"."courtlistener_webhook_events"
  as restrictive
  for all
  to authenticated, anon
using (false)
with check (false);



  create policy "deadlines_owner_all"
  on "public"."deadlines"
  as permissive
  for all
  to authenticated
using (public.user_owns_matter(matter_id))
with check (public.user_owns_matter(matter_id));



  create policy "Authenticated users can create referrals"
  on "public"."directory_agent_referrals"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Lawyers can view own referrals"
  on "public"."directory_agent_referrals"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.directory_lawyer_profiles p
  WHERE ((p.id = directory_agent_referrals.lawyer_id) AND (p.email = (auth.jwt() ->> 'email'::text))))));



  create policy "directory_agent_referrals_owner_all"
  on "public"."directory_agent_referrals"
  as permissive
  for all
  to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)))
with check ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "directory_lawyer_profiles_public_select"
  on "public"."directory_lawyer_profiles"
  as permissive
  for select
  to anon, authenticated
using (true);



  create policy "Lawyers can manage own subscriptions"
  on "public"."directory_subscriptions"
  as permissive
  for all
  to authenticated
with check ((EXISTS ( SELECT 1
   FROM public.directory_lawyer_profiles p
  WHERE ((p.id = directory_subscriptions.lawyer_id) AND (p.email = (auth.jwt() ->> 'email'::text))))));



  create policy "Lawyers can view own subscriptions"
  on "public"."directory_subscriptions"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.directory_lawyer_profiles p
  WHERE ((p.id = directory_subscriptions.lawyer_id) AND (p.email = (auth.jwt() ->> 'email'::text))))));



  create policy "directory_subscriptions_owner_select"
  on "public"."directory_subscriptions"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM (public.directory_lawyer_profiles p
     JOIN public.users u ON ((u.id = p.user_id)))
  WHERE ((p.id = directory_subscriptions.lawyer_id) AND (u.auth_id = ( SELECT auth.uid() AS uid))))));



  create policy "disclosures_financialdisclosure_authenticated_select"
  on "public"."disclosures_financialdisclosure"
  as permissive
  for select
  to authenticated
using (true);



  create policy "disclosures_investment_authenticated_select"
  on "public"."disclosures_investment"
  as permissive
  for select
  to authenticated
using (true);



  create policy "document_nodes_owner_all"
  on "public"."document_nodes"
  as permissive
  for all
  to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



  create policy "documents_owner_all"
  on "public"."documents"
  as permissive
  for all
  to authenticated
using (public.user_owns_matter(matter_id))
with check (public.user_owns_matter(matter_id));



  create policy "evidence_items_owner_all"
  on "public"."evidence_items"
  as permissive
  for all
  to authenticated
using (public.user_owns_matter(matter_id))
with check (public.user_owns_matter(matter_id));



  create policy "filings_owner_all"
  on "public"."filings"
  as permissive
  for all
  to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



  create policy "hearings_owner_all"
  on "public"."hearings"
  as permissive
  for all
  to authenticated
using (public.user_owns_matter(matter_id))
with check (public.user_owns_matter(matter_id));



  create policy "lab_simulations_owner_all"
  on "public"."lab_simulations"
  as permissive
  for all
  to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)))
with check ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "Authenticated users can read legal_chunks"
  on "public"."legal_chunks"
  as permissive
  for select
  to authenticated
using (true);



  create policy "matters_owner_delete"
  on "public"."matters"
  as permissive
  for delete
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = matters.user_id) AND (users.auth_id = ( SELECT auth.uid() AS uid))))));



  create policy "matters_owner_insert"
  on "public"."matters"
  as permissive
  for insert
  to authenticated
with check ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = matters.user_id) AND (users.auth_id = ( SELECT auth.uid() AS uid))))));



  create policy "matters_owner_select"
  on "public"."matters"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = matters.user_id) AND (users.auth_id = ( SELECT auth.uid() AS uid))))));



  create policy "matters_owner_update"
  on "public"."matters"
  as permissive
  for update
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = matters.user_id) AND (users.auth_id = ( SELECT auth.uid() AS uid))))))
with check ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = matters.user_id) AND (users.auth_id = ( SELECT auth.uid() AS uid))))));



  create policy "messages_owner_insert"
  on "public"."messages"
  as permissive
  for insert
  to authenticated
with check ((EXISTS ( SELECT 1
   FROM (public.conversations c
     JOIN public.users u ON ((u.id = c.user_id)))
  WHERE ((c.id = messages.conversation_id) AND (u.auth_id = ( SELECT auth.uid() AS uid))))));



  create policy "messages_owner_select"
  on "public"."messages"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM (public.conversations c
     JOIN public.users u ON ((u.id = c.user_id)))
  WHERE ((c.id = messages.conversation_id) AND (u.auth_id = ( SELECT auth.uid() AS uid))))));



  create policy "model_configs_owner_all"
  on "public"."model_configs"
  as permissive
  for all
  to authenticated
using (((user_id IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = model_configs.user_id) AND (u.auth_id = ( SELECT auth.uid() AS uid)))))))
with check (((user_id IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = model_configs.user_id) AND (u.auth_id = ( SELECT auth.uid() AS uid)))))));



  create policy "model_configs_system_select"
  on "public"."model_configs"
  as permissive
  for select
  to authenticated
using ((user_id IS NULL));



  create policy "opinion_citations_public_select"
  on "public"."opinion_citations"
  as permissive
  for select
  to anon, authenticated
using (true);



  create policy "parties_owner_all"
  on "public"."parties"
  as permissive
  for all
  to authenticated
using (public.user_owns_matter(matter_id))
with check (public.user_owns_matter(matter_id));



  create policy "people_db_attorney_authenticated_select"
  on "public"."people_db_attorney"
  as permissive
  for select
  to authenticated
using (true);



  create policy "profiles_owner_select"
  on "public"."profiles"
  as permissive
  for select
  to authenticated
using ((auth.uid() = id));



  create policy "research_queries_insert_own"
  on "public"."research_queries"
  as permissive
  for insert
  to public
with check ((user_id IN ( SELECT users.id
   FROM public.users
  WHERE (users.auth_id = auth.uid()))));



  create policy "research_queries_select_own"
  on "public"."research_queries"
  as permissive
  for select
  to public
using ((user_id IN ( SELECT users.id
   FROM public.users
  WHERE (users.auth_id = auth.uid()))));



  create policy "research_queries_update_own"
  on "public"."research_queries"
  as permissive
  for update
  to public
using ((user_id IN ( SELECT users.id
   FROM public.users
  WHERE (users.auth_id = auth.uid()))));



  create policy "Users can view own retrieval logs"
  on "public"."retrieval_logs"
  as permissive
  for select
  to authenticated
using (((EXISTS ( SELECT 1
   FROM ((public.agent_runs r
     JOIN public.agents a ON ((a.id = r.agent_id)))
     JOIN public.users u ON ((u.id = a.user_id)))
  WHERE ((r.id = retrieval_logs.agent_run_id) AND (u.auth_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM (public.matters m
     JOIN public.users u ON ((u.id = m.user_id)))
  WHERE ((m.id = retrieval_logs.matter_id) AND (u.auth_id = auth.uid()))))));



  create policy "retrieval_logs_owner_select"
  on "public"."retrieval_logs"
  as permissive
  for select
  to authenticated
using ((((agent_run_id IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM ((public.agent_runs ar
     JOIN public.agents a ON ((a.id = ar.agent_id)))
     JOIN public.users u ON ((u.id = a.user_id)))
  WHERE ((ar.id = retrieval_logs.agent_run_id) AND (u.auth_id = ( SELECT auth.uid() AS uid)))))) OR ((matter_id IS NOT NULL) AND public.user_owns_matter(matter_id))));



  create policy "Authenticated users can read sources"
  on "public"."sources"
  as permissive
  for select
  to authenticated
using (true);



  create policy "timeline_events_owner_all"
  on "public"."timeline_events"
  as permissive
  for all
  to authenticated
using (public.user_owns_matter(matter_id))
with check (public.user_owns_matter(matter_id));



  create policy "tool_executions_owner_select"
  on "public"."tool_executions"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM ((public.agent_runs r
     JOIN public.agents a ON ((a.id = r.agent_id)))
     JOIN public.users u ON ((u.id = a.user_id)))
  WHERE ((r.id = tool_executions.agent_run_id) AND (u.auth_id = ( SELECT auth.uid() AS uid))))));



  create policy "users_authenticated_insert"
  on "public"."users"
  as permissive
  for insert
  to authenticated
with check ((( SELECT auth.uid() AS uid) = auth_id));



  create policy "users_owner_select"
  on "public"."users"
  as permissive
  for select
  to authenticated
using ((auth_id = ( SELECT auth.uid() AS uid)));



  create policy "users_owner_update"
  on "public"."users"
  as permissive
  for update
  to authenticated
using ((auth_id = ( SELECT auth.uid() AS uid)))
with check ((auth_id = ( SELECT auth.uid() AS uid)));



  create policy "webhook_delivery_log_no_client_access"
  on "public"."webhook_delivery_log"
  as permissive
  for all
  to anon, authenticated
using (false)
with check (false);


CREATE TRIGGER trg_create_agent_permissions AFTER INSERT ON public.agents FOR EACH ROW EXECUTE FUNCTION public.create_default_agent_permissions();

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


  create policy "storage_objects_owner_delete"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using (((bucket_id = 'Aquit Courtlistner'::text) AND ((storage.foldername(name))[1] = ( SELECT (auth.uid())::text AS uid))));



  create policy "storage_objects_owner_insert"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'Aquit Courtlistner'::text) AND ((storage.foldername(name))[1] = ( SELECT (auth.uid())::text AS uid))));



  create policy "storage_objects_owner_select"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using (((bucket_id = 'Aquit Courtlistner'::text) AND ((storage.foldername(name))[1] = ( SELECT (auth.uid())::text AS uid))));



  create policy "storage_objects_owner_update"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using (((bucket_id = 'Aquit Courtlistner'::text) AND ((storage.foldername(name))[1] = ( SELECT (auth.uid())::text AS uid))));



