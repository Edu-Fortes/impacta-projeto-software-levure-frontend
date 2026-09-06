import { api } from "./api";
import { Feeding, CreateFeedingInput, RecordPeakInput } from "@/types/feeding";

export const feedingsService = {
  async getByStarter(starterId: string): Promise<Feeding[]> {
    const { data } = await api.get<Feeding[]>(
      `/starters/${starterId}/feedings`,
    );
    return data;
  },

  async create(starterId: string, input: CreateFeedingInput): Promise<Feeding> {
    const { data } = await api.post<Feeding>(
      `/starters/${starterId}/feedings`,
      input,
    );
    return data;
  },

  async recordPeak(
    feedingId: string,
    input: RecordPeakInput,
  ): Promise<Feeding> {
    const { data } = await api.patch<Feeding>(
      `/feedings/${feedingId}/peak`,
      input,
    );
    return data;
  },

  async delete(feedingId: string): Promise<void> {
    await api.delete(`/feedings/${feedingId}`);
  },
};
