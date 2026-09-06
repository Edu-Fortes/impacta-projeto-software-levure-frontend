"use client";

import { useRouter } from "next/navigation";
import { Feeding } from "@/types/feeding";
import { Starter } from "@/types/starter";
import { Thermometer, Wheat } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const FLOUR_PALETTE: Record<string, { bg: string; text: string }> = {
  "Trigo branco": { bg: "bg-[#FDF3E7]", text: "text-[#D97706]" },
  "Centeio integral": { bg: "bg-[#FDECE8]", text: "text-[#DC2626]" },
  "Trigo integral": { bg: "bg-[#EBF5FA]", text: "text-[#0284C7]" },
};

interface UpcomingPeakCardProps {
  starter: Starter;
  feeding: Feeding;
}

export function UpcomingPeakCard({ starter, feeding }: UpcomingPeakCardProps) {
  const router = useRouter();
  const theme = FLOUR_PALETTE[starter.flourType] || {
    bg: "bg-muted/40",
    text: "text-primary",
  };

  const peakTime = new Date(feeding.estimatedPeakTime);
  const isPast = Date.now() > peakTime.getTime() || !!feeding.actualPeakTime;

  const formattedTime = peakTime.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Card
      onClick={() => router.push(`/fermentos/${starter.id}`)}
      className="border-border/80 hover:shadow-sm transition-all cursor-pointer hover:border-primary/40 group bg-card rounded-2xl"
    >
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl ${theme.bg} ${theme.text} flex items-center justify-center shrink-0`}
          >
            <Wheat className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
              {starter.name}
            </h4>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <span>Proporção {feeding.ratio}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-right">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Thermometer className="w-3.5 h-3.5 text-muted-foreground" />
            <span>{feeding.ambientTempC}°C</span>
          </div>

          <div className="border-l pl-3">
            <span className="block text-xs font-mono font-medium text-[#1B7340]">
              {isPast ? "Pico atingido" : "Subindo"}
            </span>
            <span className="block text-[11px] font-mono text-muted-foreground">
              previsto {formattedTime}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
