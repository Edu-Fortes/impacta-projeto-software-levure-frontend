export type AromaProfile = "FRUITY" | "ALCOHOLIC" | "ACIDIC" | "BALANCED";

export interface Feeding {
  id: string;
  starterId: string;
  ratio: string;
  starterWeightG: number;
  waterWeightG: number;
  flourWeightG: number;
  totalWeightG: number;
  ambientTempC: number;
  estimatedPeakMinutes: number;
  estimatedPeakTime: string;
  actualPeakTime?: string | null;
  actualDurationMin?: number | null;
  growthMultiplier?: number | null;
  aromaProfile?: AromaProfile | null;
  notes?: string | null;
  fedAt: string;
  createdAt: string;
}

export interface CreateFeedingInput {
  ratio: string;
  starterWeightG: number;
  waterWeightG: number;
  flourWeightG: number;
  ambientTempC: number;
  fedAt?: string;
}

export interface RecordPeakInput {
  actualPeakTime: string;
  growthMultiplier: number;
  aromaProfile?: AromaProfile;
  notes?: string;
}
