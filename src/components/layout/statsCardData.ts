import { DashboardSummary } from "@/types/starter";

export const statsCardData: Array<{
  key: number;
  valueKey: keyof DashboardSummary;
  title: string;
  description: string;
}> = [
  {
    key: 1,
    valueKey: "activeStartersCount",
    title: "Total de Fermentos",
    description: "Fermentos que estão ativos e sendo alimentados regularmente.",
  },
  {
    key: 2,
    valueKey: "healthyCount",
    title: "Ativos",
    description:
      "Fermentos que estão em boas condições de saúde e não apresentam sinais de problemas.",
  },
  {
    key: 3,
    valueKey: "fridgeCount",
    title: "Hibernando",
    description:
      "Fermentos que estão em estado de hibernação, aguardando reativação para alimentação.",
  },
  {
    key: 4,
    valueKey: "totalFeedingsCount",
    title: "Alimentações registradas",
    description:
      "Número total de alimentações realizadas em todos os fermentos ativos.",
  },
];
