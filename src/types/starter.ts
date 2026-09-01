import { Feeding } from "./feeding";

export type StarterStatus = "ACTIVE" | "FRIDGE" | "NEW";

export interface Starter {
  id: string;
  name: string;
  flourType: string;
  location: string;
  notes?: string | null;
  status: StarterStatus;
  createdAt: string;
  updatedAt: string;
  feedings?: Feeding[];
}

export type CreateStarterInput = Omit<
  Starter,
  "id" | "createdAt" | "updatedAt" | "feedings"
>;
export type UpdateStarterInput = Partial<CreateStarterInput>;

export interface DashboardSummary {
  activeStartersCount: number;
  healthyCount: number;
  attentionCount: number;
  newCount: number;
}
