"use client";

import { useState } from "react";
import { Feeding, RecordPeakInput } from "@/types/feeding";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Droplets, Wheat, Clock, CheckCircle2 } from "lucide-react";
import { RecordPeakModal } from "./RecordPeakModal";

interface FeedingHistoryListProps {
  feedings: Feeding[];
  onRecordPeak: (feedingId: string, data: RecordPeakInput) => Promise<void>;
}

export function FeedingHistoryList({
  feedings,
  onRecordPeak,
}: FeedingHistoryListProps) {
  const [selectedFeedingForPeak, setSelectedFeedingForPeak] =
    useState<Feeding | null>(null);

  if (feedings.length === 0) {
    return (
      <div className="text-center py-12 border rounded-xl bg-card/50">
        <p className="text-muted-foreground text-sm">
          Nenhuma alimentação registrada até o momento.
        </p>
      </div>
    );
  }

  const formatPeakDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <div className="space-y-3">
        {feedings.map((feeding) => {
          const hasRealPeak = !!feeding.actualDurationMin;

          return (
            <Card
              key={feeding.id}
              className="border-border/80 hover:shadow-sm transition-shadow"
            >
              <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-sm text-foreground">
                      {formatDateTime(feeding.fedAt)}
                    </span>
                    <Badge variant="outline" className="font-mono bg-muted/30">
                      {feeding.ratio}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span>{feeding.ambientTempC}°C</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Droplets className="w-3.5 h-3.5 text-sky-600" />
                      <span>{feeding.waterWeightG}g água</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Wheat className="w-3.5 h-3.5 text-amber-600" />
                      <span>{feeding.flourWeightG}g farinha</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0">
                  <div className="text-right">
                    <span className="block text-[10px] uppercase font-semibold text-muted-foreground">
                      {hasRealPeak ? "Pico Real Observado" : "Pico Previsto"}
                    </span>
                    <span className="text-base font-bold font-mono text-foreground">
                      {hasRealPeak
                        ? formatPeakDuration(feeding.actualDurationMin!)
                        : formatPeakDuration(feeding.estimatedPeakMinutes)}
                    </span>
                  </div>

                  {hasRealPeak ? (
                    <div className="flex items-center gap-1 text-emerald-600 text-xs font-medium bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{feeding.growthMultiplier}x volume</span>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedFeedingForPeak(feeding)}
                      className="text-xs h-8 gap-1.5"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      Marcar Pico
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <RecordPeakModal
        feeding={selectedFeedingForPeak}
        open={!!selectedFeedingForPeak}
        onOpenChange={(open) => !open && setSelectedFeedingForPeak(null)}
        onRecordPeak={onRecordPeak}
      />
    </>
  );
}
