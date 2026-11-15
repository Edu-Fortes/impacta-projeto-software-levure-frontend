import { api } from "./api";
import { HealthAnalysis } from "@/types/ai";

export const aiService = {
  async analyze(starterId: string): Promise<HealthAnalysis> {
    const { data } = await api.post<HealthAnalysis>(
      `/starters/${starterId}/analyze`,
    );
    return data;
  },

  async getLatestAnalysis(starterId: string): Promise<HealthAnalysis | null> {
    const { data } = await api.get<HealthAnalysis | null>(
      `/starters/${starterId}/latest-analysis`,
    );
    return data;
  },

  async getHistory(starterId: string): Promise<HealthAnalysis[]> {
    const { data } = await api.get<HealthAnalysis[]>(
      `/starters/${starterId}/analyses`,
    );
    return data;
  },
};
