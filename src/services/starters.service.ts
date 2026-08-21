import { api } from "./api";
import {
  Starter,
  CreateStarterInput,
  UpdateStarterInput,
  DashboardSummary,
} from "@/types/starter";

export const startersService = {
  async getAll(search?: string): Promise<Starter[]> {
    const { data } = await api.get<Starter[]>("/starters", {
      params: { search },
    });
    return data;
  },

  async getById(id: string): Promise<Starter> {
    const { data } = await api.get<Starter>(`/starters/${id}`);
    return data;
  },

  async getSummary(): Promise<DashboardSummary> {
    const { data } = await api.get<DashboardSummary>(
      "/starters/dashboard/summary",
    );
    return data;
  },

  async create(input: CreateStarterInput): Promise<Starter> {
    const { data } = await api.post<Starter>("/starters", input);
    return data;
  },

  async update(id: string, input: UpdateStarterInput): Promise<Starter> {
    const { data } = await api.patch<Starter>(`/starters/${id}`, input);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/starters/${id}`);
  },
};
