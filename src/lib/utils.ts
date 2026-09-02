import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatLastFeeding(dateString?: string | null): string {
  if (!dateString) return "Nunca";

  const feedingDate = new Date(dateString);
  const now = new Date();

  // Zera horas para comparar apenas os dias
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const startOfFeeding = new Date(
    feedingDate.getFullYear(),
    feedingDate.getMonth(),
    feedingDate.getDate(),
  );

  const diffTime = startOfToday.getTime() - startOfFeeding.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hoje";
  if (diffDays === 1) return "Ontem";
  if (diffDays > 1 && diffDays < 7) return `Há ${diffDays} dias`;

  return feedingDate.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}
