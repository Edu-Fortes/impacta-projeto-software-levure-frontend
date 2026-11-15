export interface AiRecommendation {
  title: string;
  description: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
}

export interface HealthAnalysis {
  id: string;
  starterId: string;
  healthScore: number;
  status: "EXCELLENT" | "GOOD" | "NEEDS_ATTENTION" | "CRITICAL";
  summary: string;
  vigorObservation: string;
  acidityObservation: string;
  temperatureImpact: string;
  readyToBake: boolean;
  bakingReason: string;
  recommendedRatio: string;
  flourTypeHint: string;
  targetAmbientTemp: string;
  recommendationsJson: AiRecommendation[];
  analyzedFeedingsCount: number;
  createdAt: string;
}
