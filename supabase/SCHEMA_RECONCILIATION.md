# Acquit.ai Supabase Schema Reconciliation

## Status

This document records the live Supabase schema state reconciled on 2026-08-21. The live project remains authoritative for pre-existing objects until a complete CLI `supabase db pull` baseline is committed.

**Security Audit Update (2026-08-30)**: Critical security issues identified and remediated. See `supabase/migrations/20260830_*` migrations and `20260830_AUDIT_REMEDIATION.md` for details.

## Reconciled migration history

- 20260606184834 new-migration
- 20260815012853 harden_security_definer_functions
- 20260815012902 add_baseline_rls_policies_for_unowned_tables
- 20260815013724 create_cold_cases_ingestion_staging
- 20260815013730 create_cold_cases_ingestion_state
- 20260815013734 create_cold_cases_stream_ingest_function
- 20260815013749 tighten_cold_cases_ingest_status
- 20260815013759 add_cold_cases_ingestion_lock
- 20260815022116 create_courtlistener_webhook_events
- 20260815022121 create_courtlistener_webhook_secret_path
- 20260815022138 create_courtlistener_webhook_config
- 20260815022238 courtlistener_webhook_event_policy
- 20260817183959 revoke_anon_access_foreign_table_1
- 20260817184005 med9_sources_source_hash_unique
- 20260817184030 med10_directory_agent_referrals_user_id_uuid_v2
- 20260817184043 fix_auth_rls_initplan_perf
- 20260817184053 add_missing_fk_indexes
- 20260817184119 fix_function_search_path_and_definer_exposure_v2
- 20260817184142 index_directory_agent_referrals_user_id
- 20260817184203 fix_directory_lawyer_profiles_open_write_policy
- 20260821204035 add_rls_policies_for_ingestion_tables
- 20260821204040 harden_people_db_attorney
- 20260821204051 extend_enums_event_type_party_role_document_type
- 20260821204104 create_charges_and_hearings_tables
- 20260821204638 harden_existing_rls
- 20260821204950 add_agent_runtime_domain_tables
- 20260830_security_hardening_critical_fixes
- 20260830_storage_bucket_rls_and_cleanup

## Live domains confirmed

### Legal workspace
users, matters, parties, documents, evidence_items, timeline_events, deadlines, charges, hearings, audit_logs.

### Agent runtime
agents, conversations, agent_runs, tool_executions.

### Legal library and RAG
sources, authorities, legal_chunks with pgvector-backed embeddings.

### Attorney directory
people_db_attorney, directory_lawyer_profiles, directory_subscriptions, directory_agent_referrals.

### External ingestion
cold_cases_ingestion, cold_cases_ingestion_state, courtlistener_webhook_events, courtlistener_webhook_config.

### Other imported datasets
case_documents, cases, lab_simulations, audio_audio, disclosures_financialdisclosure, disclosures_investment.

## RLS
All confirmed public tables in the live project currently have RLS enabled. The ingestion and CourtListener event tables are explicitly denied to anon/authenticated clients and are intended for service-role ingestion paths.

## Required next baseline step

Run a full schema pull from the connected Supabase project and commit the generated migration as the canonical historical baseline. Do not reset or push a synthetic baseline into production. Future schema changes should be created in `supabase/migrations/`, committed to Git, reviewed, and then deployed to Supabase.
