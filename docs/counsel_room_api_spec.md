# Counsel Room API Spec

REST + WebSocket. All routes are matter-scoped where applicable; every AI-originated action writes to the existing `agent_runs` / `tool_calls` audit trail (the architecture PDF's Execution Protocol).

## 2.1 Conventions

| Item | Convention |
|---|---|
| Base path | `/api/v1` |
| Auth | Bearer session token; attorney invite links are one-time, 72 h TTL |
| ID format | `ch_`, `msg_`, `team_`, `mteam_`, `agent_`, `run_` prefixed ULIDs |
| Errors | `{ "error": { "code", "message", "details" } }` — codes below |
| AI provenance | Any message with `sender_type: agent` includes `agent_run_id`; clients can fetch the full run trace |
| Privilege invariant | If `channel.privileged == true`, the server enforces `privileged_mode_overrides` for every agent call in that channel — this is server-side, not a client hint |

## 2.2 Endpoints

### Team Assembly

| Method & Route | Purpose |
|---|---|
| `GET /api/v1/team-templates` | List templates (from `team_templates.yaml`) with roster previews |
| `POST /api/v1/matters/{matter_id}/teams` | Assemble a team. Body: `{ "template_slug": "llc_dispute", "invites": [{ "email": "...", "role": "attorney" }], "overrides": { "consensus_default.mode": "consensus" } }`. Creates `matter_teams` + `default_channels` + agent memberships atomically. Returns `201` with the team and channel ids. |
| `GET /api/v1/matters/{matter_id}/teams/active` | Current assembled team, members, PermissionSets (the "review" screen data) |
| `PATCH /api/v1/matters/{matter_id}/teams/{team_id}` | Add/remove agents or change consensus posture. Removing an agent revokes its channel membership but preserves its `agent_runs` history |
| `POST /api/v1/teams/{team_id}/invites` | Send human invite (`role: attorney \| friend`). Attorney invites carry `privileged_on_join` |
| `POST /api/v1/invites/{token}/accept` | One-time accept; creates `channel_members` rows per template |

### Channels & Membership

| Method & Route | Purpose |
|---|---|
| `GET /api/v1/channels?matter_id=` | List channels visible to the caller (friend roles never see privileged channels — filtered server-side) |
| `POST /api/v1/channels` | Create ad-hoc channel. Body: `{ "type": "dm\|group\|matter_scoped", "matter_id"?, "name", "privileged": bool, "member_ids": [...] }`. `privileged: true` rejected with `403 PRIVILEGE_REQUIRES_ATTORNEY` unless a member has `role: attorney` |
| `GET /api/v1/channels/{channel_id}` | Channel detail + members + presence snapshot |
| `POST /api/v1/channels/{channel_id}/members` | Add member `{ "member_type": "human\|agent", "id", "role" }`. Agent adds validate the agent's PermissionSet against the channel's privilege flag |
| `DELETE /api/v1/channels/{channel_id}/members/{member_id}` | Remove member (channel owner or attorney only) |

### Messaging

| Method & Route | Purpose |
|---|---|
| `GET /api/v1/channels/{channel_id}/messages?before=&limit=` | Paginated history |
| `POST /api/v1/channels/{channel_id}/messages` | Human message. Body: `{ "body", "attachments": [], "linked_document_ids": [], "linked_evidence_ids": [], "mentions": ["@lead_counsel"] }` |
| `POST /api/v1/channels/{channel_id}/ai/ask` | Address the AI team. Body below. Returns `202` + `run_id`; response arrives over WebSocket as agent messages |
| `GET /api/v1/runs/{run_id}` | Full provenance trace: subtask decomposition, Metatron routing decisions, Seraphim responses, consensus metadata, token/cost accounting |
| `WS /api/v1/channels/{channel_id}/stream` | Realtime: `message.created`, `presence.updated`, `agent.thinking` (state events per the Execution Protocol) |

**`POST .../ai/ask` body:**

```json
{
  "prompt": "What are the strongest habitability claims given the uploaded inspection report?",
  "mode": "consensus",              // "standard" | "first_response" | "consensus" | "panel"
  "threshold": 0.7,                 // consensus only; default from template
  "panel": ["lead_counsel", "research_ai"],   // optional; default from template
  "external_llm_consent": true      // REQUIRED true in privileged channels,
                                    // else 403 EXTERNAL_ROUTING_NOT_CONSENTED
}
```

**Consensus response message** (what lands in chat after a `consensus` ask):

```json
{
  "id": "msg_01J...",
  "sender_type": "agent",
  "sender_id": "agent_lead_counsel",
  "agent_run_id": "run_01J...",
  "body": "Consensus answer (3/3 agree): …",
  "consensus_meta": {
    "mode": "consensus",
    "threshold": 0.7,
    "agreement": 1.0,
    "panel": ["Gabriel_LeadCounsel", "Gabriel_Research", "Gabriel_Evidence"],
    "divergences": [
      { "topic": "punitive_damages_exposure",
        "note": "Gabriel_Research ranked this #1; Gabriel_Evidence ranked it #3 — investigation target" }
    ],
    "upl_disclaimer": true
  }
}
```

### Contacts (social layer)

| Method & Route | Purpose |
|---|---|
| `GET /api/v1/contacts` | Friends + attorneys + AI counsel directory |
| `POST /api/v1/contacts/invite` | Invite by email (friend or attorney role) |
| `GET /api/v1/presence?channel_id=` | Presence snapshot (also streamed over WS) |

## 2.3 Error codes (new)

| Code | When |
|---|---|
| `PRIVILEGE_REQUIRES_ATTORNEY` | Creating a privileged channel with no attorney member |
| `EXTERNAL_ROUTING_NOT_CONSENTED` | Agent call in a privileged channel without `external_llm_consent: true` (enforces `privileged_mode_overrides`) |
| `FRIEND_PRIVILEGE_DENIED` | Adding `role: friend` to a privileged channel |
| `FILING_VIA_CHAT_FORBIDDEN` | Any chat message parsed as a filing instruction → `400` with a pointer to the Filing Center draft endpoint |
| `AGENT_PERMISSION_VIOLATION` | Agent's PermissionSet conflicts with channel privilege posture |

## 2.4 Wiring to the existing architecture

- **`ai/ask` → Michael (Orchestrator)**: decomposes the prompt, renders variables (`{{context.matter_name}}`, `{{context.jurisdiction}}`) via the existing template engine, dispatches to the panel.
- **`mode: consensus` → Raphael (`consensus.run`)** with `threshold` → Metatron fans out to Seraphim per `llms.yaml` `bot_access` config → divergences packaged into `consensus_meta` (this is the Adversarial Consensus article as a runtime feature).
- **Every response** is an `AgentRun` — the `GET /runs/{run_id}` trace satisfies your audit screen with zero extra instrumentation.
- **Filing isolation**: chat→draft only. `drafts.create` is in agent PermissionSets; `filing.submit` exists only in the Filing Center service, which chat has no route to.
