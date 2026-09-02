"use client";

import { useMemo, useState } from "react";
import { Starter } from "@/types/starter";
import { CreateFeedingInput } from "@/types/feeding";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Wheat, Droplets, Clock, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface FeedingCalculatorProps {
  starter: Starter;
  onFeedingCreated: (input: CreateFeedingInput) => Promise<void>;
}

const AVAILABLE_RATIOS = ["1:1:1", "1:2:2", "1:3:3", "1:4:4", "1:5:5"];

const RATIO_DESCRIPTIONS: Record<string, string> = {
  "1:1:1":
    "Alimentação rápida. Ideal para refrescar fermento ativo antes de usar.",
  "1:2:2": "Equilíbrio entre vigor e janela de uso. A mais usada no dia a dia.",
  "1:3:3": "Maior tempo de desenvolvimento e redução gradual da acidez.",
  "1:4:4": "Janela estendida de fermentação. Ideal para períodos mais longos.",
  "1:5:5": "Fermentação lenta ou conservação prolongada fora da geladeira.",
};

export function FeedingCalculator({
  starter,
  onFeedingCreated,
}: FeedingCalculatorProps) {
  const [selectedRatio, setSelectedRatio] = useState("1:2:2");
  const [baseFlourWeight, setBaseFlourWeight] = useState<number>(100);
  const [ambientTemp, setAmbientTemp] = useState<number>(24);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Parse da proporção (fermento : água : farinha)
  const ratioParts = useMemo(() => {
    const parts = selectedRatio.split(":").map(Number);
    return {
      starterMultiplier: parts[0] || 1,
      waterMultiplier: parts[1] || 1,
      flourMultiplier: parts[2] || 1,
    };
  }, [selectedRatio]);

  // Cálculos de composição em gramas
  const composition = useMemo(() => {
    const flourG = Number(baseFlourWeight) > 0 ? Number(baseFlourWeight) : 0;
    // Peso da isca proporcional ao peso da farinha informada
    const starterG = Math.round(
      (flourG / ratioParts.flourMultiplier) * ratioParts.starterMultiplier,
    );
    // Peso da água proporcional à farinha informada
    const waterG = Math.round(
      (flourG / ratioParts.flourMultiplier) * ratioParts.waterMultiplier,
    );
    const totalG = starterG + waterG + flourG;

    return {
      starterG,
      waterG,
      flourG,
      totalG,
    };
  }, [baseFlourWeight, ratioParts]);

  // Estimativa de pico baseada no histórico do starter ou no padrão teórico
  const peakEstimation = useMemo(() => {
    const defaultMinutesByRatio: Record<string, number> = {
      "1:1:1": 270, // 4h30min
      "1:2:2": 450, // 7h30min
      "1:3:3": 570, // 9h30min
      "1:4:4": 690, // 11h30min
      "1:5:5": 810, // 13h30min
    };

    // Histórico com a mesma proporção e pico confirmado
    const historicalFeedings = (starter.feedings || []).filter(
      (f) =>
        f.ratio === selectedRatio &&
        f.actualDurationMin &&
        f.actualDurationMin > 0,
    );

    let baseMinutes = defaultMinutesByRatio[selectedRatio] || 450;
    const isCalibrated = historicalFeedings.length >= 5;

    if (isCalibrated) {
      const normalizedTimes = historicalFeedings.map((f) => {
        const deltaTemp = f.ambientTempC - 24;
        const tempFactor = Math.pow(0.96, deltaTemp);
        return f.actualDurationMin! / tempFactor;
      });
      const avgMinutes =
        normalizedTimes.reduce((acc, curr) => acc + curr, 0) /
        normalizedTimes.length;
      baseMinutes = Math.round(avgMinutes);
    }

    // Fator térmico da temperatura atual vs 24°C
    const tempDelta = ambientTemp - 24;
    const currentFactor = Math.pow(0.96, tempDelta);
    const estimatedMinutes = Math.round(baseMinutes * currentFactor);

    // Formatação de horas e minutos
    const hours = Math.floor(estimatedMinutes / 60);
    const minutes = estimatedMinutes % 60;
    const formattedDuration =
      minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;

    // Horário exato previsto
    const targetDate = new Date(Date.now() + estimatedMinutes * 60 * 1000);
    const formattedTargetTime = targetDate.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return {
      formattedDuration,
      formattedTargetTime,
      isCalibrated,
      samplesCount: historicalFeedings.length,
    };
  }, [starter.feedings, selectedRatio, ambientTemp]);

  const handleSubmit = async () => {
    if (
      composition.starterG <= 0 ||
      composition.flourG <= 0 ||
      composition.waterG <= 0
    ) {
      toast.error("Informe um peso de farinha válido.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onFeedingCreated({
        ratio: selectedRatio,
        starterWeightG: composition.starterG,
        waterWeightG: composition.waterG,
        flourWeightG: composition.flourG,
        ambientTempC: ambientTemp,
      });
      toast.success("Alimentação registrada com sucesso!");
    } catch {
      toast.error("Erro ao registrar alimentação.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Coluna Esquerda: Parâmetros de Entrada */}
      <div className="lg:col-span-7 space-y-6">
        {/* Seletor de Proporção */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">
            Proporção (fermento:água:farinha)
          </label>
          <div className="grid grid-cols-5 gap-2">
            {AVAILABLE_RATIOS.map((ratio) => (
              <Button
                key={ratio}
                type="button"
                variant={selectedRatio === ratio ? "default" : "outline"}
                onClick={() => setSelectedRatio(ratio)}
                className={`text-xs sm:text-sm font-medium transition-all ${
                  selectedRatio === ratio
                    ? "shadow-sm"
                    : "bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {ratio}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground pt-1">
            {RATIO_DESCRIPTIONS[selectedRatio]}
          </p>
        </div>

        {/* Peso da Farinha Base */}
        <div className="space-y-2">
          <label
            htmlFor="baseFlour"
            className="text-sm font-semibold text-foreground"
          >
            Peso da farinha base (g)
          </label>
          <div className="relative">
            <Wheat className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="baseFlour"
              type="number"
              min={1}
              value={baseFlourWeight || ""}
              onChange={(e) => setBaseFlourWeight(Number(e.target.value))}
              placeholder="100"
              className="pl-10 text-base bg-card font-medium"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            A quantidade de fermento e água é calculada automaticamente a partir
            da proporção escolhida.
          </p>
        </div>

        {/* Slider de Temperatura Ambiente */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">
              Temperatura ambiente
            </span>
            <span className="text-sm font-bold text-foreground bg-muted/60 px-2.5 py-0.5 rounded-md border">
              {ambientTemp}°C
            </span>
          </div>
          <Slider
            value={[ambientTemp]}
            onValueChange={(vals) => setAmbientTemp(vals[0])}
            min={18}
            max={34}
            step={1}
            className="w-full cursor-pointer py-1"
          />
          <p className="text-xs text-muted-foreground">
            A temperatura influencia diretamente a velocidade da fermentação.
          </p>
        </div>
      </div>

      {/* Coluna Direita: Composição e Estimativa de Pico */}
      <div className="lg:col-span-5 space-y-4">
        {/* Card de Composição dos Ingredientes */}
        <Card className="border-border/80 shadow-sm">
          <CardContent className="p-5 space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Composição da alimentação
            </h4>

            <div className="grid grid-cols-3 gap-2">
              <div className="border rounded-xl p-3 bg-muted/20 text-center flex flex-col items-center justify-center">
                <Wheat className="w-4 h-4 text-primary mb-1" />
                <span className="text-xl font-bold text-foreground">
                  {composition.starterG}g
                </span>
                <span className="text-xs text-muted-foreground">Fermento</span>
              </div>

              <div className="border rounded-xl p-3 bg-muted/20 text-center flex flex-col items-center justify-center">
                <Droplets className="w-4 h-4 text-sky-600 mb-1" />
                <span className="text-xl font-bold text-foreground">
                  {composition.waterG}g
                </span>
                <span className="text-xs text-muted-foreground">Água</span>
              </div>

              <div className="border rounded-xl p-3 bg-muted/20 text-center flex flex-col items-center justify-center">
                <Wheat className="w-4 h-4 text-amber-600 mb-1" />
                <span className="text-xl font-bold text-foreground">
                  {composition.flourG}g
                </span>
                <span className="text-xs text-muted-foreground">Farinha</span>
              </div>
            </div>

            <div className="pt-2 border-t flex items-center justify-between text-xs text-muted-foreground">
              <span>Peso total da mistura</span>
              <span className="font-semibold text-foreground text-sm">
                {composition.totalG}g
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card de Estimativa de Pico */}
        <Card className="border-border/80 shadow-sm bg-card">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span>Estimativa de pico</span>
            </div>

            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono">
                  {peakEstimation.formattedDuration}
                </span>
                <span className="text-xs sm:text-sm text-muted-foreground">
                  até o pico, por volta de{" "}
                  <strong>{peakEstimation.formattedTargetTime}</strong>
                </span>
              </div>

              <div className="mt-2.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                {peakEstimation.isCalibrated ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>
                      Ajustado com base em {peakEstimation.samplesCount}{" "}
                      alimentações anteriores · <strong>confiança alta</strong>
                    </span>
                  </>
                ) : (
                  <span>
                    Estimativa biológica padrão · registre os picos reais para
                    calibrar
                  </span>
                )}
              </div>
            </div>

            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full gap-2 font-semibold shadow-sm"
              size="lg"
            >
              <Sparkles className="w-4 h-4" />
              {isSubmitting ? "Registrando..." : "Registrar alimentação"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
