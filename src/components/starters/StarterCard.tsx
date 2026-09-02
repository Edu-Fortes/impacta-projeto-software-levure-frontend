"use client";

import { useRouter } from "next/navigation";
import { Starter } from "@/types/starter";
import { StarterStatusBadge } from "./StarterStatusBadge";
import { formatLastFeeding } from "@/lib/utils";
import { MapPin, Wheat } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// Paleta dos ícones conforme farinha
const FLOUR_PALETTE: Record<string, { bg: string; text: string }> = {
  "Trigo branco": { bg: "bg-[#FDF3E7]", text: "text-[#D97706]" },
  "Centeio integral": { bg: "bg-[#FDECE8]", text: "text-[#DC2626]" },
  "Trigo integral": { bg: "bg-[#EBF5FA]", text: "text-[#0284C7]" },
};

export function StarterCard({ starter }: { starter: Starter }) {
  const router = useRouter();
  const theme = FLOUR_PALETTE[starter.flourType] || {
    bg: "bg-muted/40",
    text: "text-primary",
  };

  // Obtém a data da última alimentação registrada ou a data de criação
  const lastFeedingDate =
    starter.feedings && starter.feedings.length > 0
      ? starter.feedings[0].fedAt
      : starter.updatedAt;

  const formattedTime = formatLastFeeding(lastFeedingDate).toLowerCase();

  return (
    <Card
      onClick={() => router.push(`/fermentos/${starter.id}`)}
      className="border-border/80 hover:shadow-sm transition-all cursor-pointer hover:border-primary/40 group bg-card rounded-2xl"
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-11 h-11 rounded-xl ${theme.bg} ${theme.text} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}
            >
              <Wheat className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-foreground leading-tight group-hover:text-primary transition-colors">
                {starter.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {starter.flourType}
              </p>
            </div>
          </div>

          <StarterStatusBadge status={starter.status} />
        </div>

        <div className="mt-6 pt-3.5 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            <span>{starter.location}</span>
          </div>

          <div>
            <span>Alimentado </span>
            <span className="font-mono text-foreground font-medium">
              {formattedTime}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
