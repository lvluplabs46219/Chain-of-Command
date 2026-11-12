import catalogJson from './gearCatalog.json';

export type GearSlot = 'primary' | 'secondary' | 'tools' | 'knowledge';

export interface GearItem {
  id: string;
  name: string;
  icon: string;
  emoji: string;
  slot: GearSlot[];
  skillIds: string[];
  description: string;
  defaultInTitles?: string[];
  sku?: string;
}

export interface PrefabAgent {
  id: string;
  title: string;
  defaultLoadout: {
    primary?: string;
    secondary?: string[];
    tools?: string[];
    knowledge?: string[];
  };
}

export interface Sku {
  id: string;
  name: string;
  priceUsdc: number;
  interval: 'month' | null;
  requiresVerificationStamp?: boolean;
}

export interface GearCatalog {
  version: string;
  chain: { id: string; paymentToken: string; nftStandard: string };
  slots: Record<
    string,
    { uiName: string; max: number | null }
  >;
  gear: GearItem[];
  prefabAgents: PrefabAgent[];
  skus: Sku[];
}

export const gearCatalog = catalogJson as GearCatalog;

export function getGearById(id: string): GearItem | undefined {
  return gearCatalog.gear.find((g) => g.id === id);
}

export function getPrefabById(id: string): PrefabAgent | undefined {
  return gearCatalog.prefabAgents.find((a) => a.id === id);
}

export function getSkuById(id: string): Sku | undefined {
  return gearCatalog.skus.find((s) => s.id === id);
}

export function defaultLoadoutForTitle(titleId: string) {
  return getPrefabById(titleId)?.defaultLoadout;
}
