/**
 * UI label mapping for desk loadout slots and gear chips.
 * Source of truth for Loadout tab labels — keep in sync with gearCatalog.json slots.
 */

export const SLOT_LABELS = {
  primary: {
    id: 'primary',
    uiName: 'In hand',
    short: 'Hand',
    description: 'One main instrument the agent works with.',
  },
  secondary: {
    id: 'secondary',
    uiName: 'On the blotter',
    short: 'Blotter',
    description: '1–3 support items within reach.',
  },
  tools: {
    id: 'tools',
    uiName: 'Desk drawer',
    short: 'Drawer',
    description: 'Active capabilities the agent may invoke.',
  },
  knowledge: {
    id: 'knowledge',
    uiName: 'Briefcase',
    short: 'Briefcase',
    description: 'What the agent carries — memory, RAG, knowledge packs.',
  },
} as const;

export type SlotId = keyof typeof SLOT_LABELS;

export const GEAR_CHIP_MICROCOPY: Record<string, string> = {
  'fountain-pen': 'Drafts documents in plain language for your review.',
  briefcase: 'Retrieves retained knowledge and matter memory.',
  'law-reporter': 'Looks up grounded public authorities when available.',
  'task-stamp': 'Builds procedural checklists — does not file with the court.',
  'circuit-binder': 'Explains on-chain activity; never signs or sends value.',
  'yellow-pad': 'Chronology and fact notes.',
  'case-file': 'Matter summary and exhibit index.',
  'sticky-tabs': 'Pins issues and compares authorities.',
  'desk-calendar': 'Informational dates only.',
  rolodex: 'Routes work to specialists.',
  speakerphone: 'Notifications and consult entry.',
  envelope: 'Outbound delivery and webhooks.',
  'reading-glasses': 'Review and consistency passes.',
  lockbox: 'Matter isolation and redaction helpers.',
  'ledger-viewer': 'Read-only chain log.',
  'wallet-checklist': 'Safety checklist only; no signing.',
};

export function slotUiName(slot: string): string {
  return SLOT_LABELS[slot as SlotId]?.uiName ?? slot;
}
