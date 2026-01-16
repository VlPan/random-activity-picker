export interface Bill {
  id: string;
  name: string;
  cost: number;
  isBasicNecessity: boolean;
  lastCoveredDate?: string; // ISO date string
}
