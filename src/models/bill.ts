export interface Bill {
  id: string;
  name: string;
  cost: number | null;
  isBasicNecessity: boolean;
  lastCoveredDate?: string; // ISO date string
}
