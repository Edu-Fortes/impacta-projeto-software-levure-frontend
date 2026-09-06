"use client";

import { useMemo, useState } from "react";
import { Starter } from "@/types/starter";
import { CreateFeedingInput } from "@/types/feeding";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Wheat,
  Droplets,
  Clock,
  Sparkles,
  Scale,
  FishingHook,
} from "lucide-react";
import { toast } from "sonner";

interface FeedingCalculatorProps {
  starter: Starter;
  onFeedingCreated: (input: CreateFeedingInput) => Promise<void>;
}

type CalculationMode = "starter" | "total" | "flour";

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
  const [calculationMode, setCalculationMode] =
    useState<CalculationMode>("starter");
  const [inputValue, setInputValue] = useState<number>(30); // Valor padrão em gramas
  const [selectedRatio, setSelectedRatio] = useState("1:2:2");
  const [ambientTemp, setAmbientTemp] = useState<number>(24);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Proporção (fermento : água : farinha)
  const ratioParts = useMemo(() => {
    const parts = selectedRatio.split(":").map(Number);
    const starterMul = parts[0] || 1;
    const waterMul = parts[1] || 1;
    const flourMul = parts[2] || 1;
    const totalParts = starterMul + waterMul + flourMul;

    return { starterMul, waterMul, flourMul, totalParts };
  }, [selectedRatio]);

  // Cálculos de composição dinâmica
  const composition = useMemo(() => {
    const value = Number(inputValue) > 0 ? Number(inputValue) : 0;
    let starterG = 0;
    let waterG = 0;
    let flourG = 0;

    if (calculationMode === "starter") {
      // Entrada é o peso da isca
      starterG = value;
      flourG = Math.round(
        (value / ratioParts.starterMul) * ratioParts.flourMul,
      );
      waterG = Math.round(
        (value / ratioParts.starterMul) * ratioParts.waterMul,
      );
    } else if (calculationMode === "total") {
      // Entrada é o peso final desejado do fermento alimentado
      const unit = value / ratioParts.totalParts;
      starterG = Math.round(unit * ratioParts.starterMul);
      waterG = Math.round(unit * ratioParts.waterMul);
      flourG = Math.round(unit * ratioParts.flourMul);
    } else {
      // Entrada é o peso da farinha
      flourG = value;
      starterG = Math.round(
        (value / ratioParts.flourMul) * ratioParts.starterMul,
      );
      waterG = Math.round((value / ratioParts.flourMul) * ratioParts.waterMul);
    }

    const totalG = starterG + waterG + flourG;

    return { starterG, waterG, flourG, totalG };
  }, [calculationMode, inputValue, ratioParts]);

  // Estimativa de pico
  const peakEstimation = useMemo(() => {
    const defaultMinutesByRatio: Record<string, number> = {
      "1:1:1": 270,
      "1:2:2": 450,
      "1:3:3": 570,
      "1:4:4": 690,
      "1:5:5": 810,
    };

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

    const tempDelta = ambientTemp - 24;
    const currentFactor = Math.pow(0.96, tempDelta);
    const estimatedMinutes = Math.round(baseMinutes * currentFactor);

    const hours = Math.floor(estimatedMinutes / 60);
    const minutes = estimatedMinutes % 60;
    const formattedDuration =
      minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;

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
      toast.error("Informe um valor de peso válido.");
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
      {/* Coluna Esquerda: Parâmetros */}
      <div className="lg:col-span-7 space-y-6">
        {/* Seletor do Modo de Cálculo */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">
            Calcular proporção com base em:
          </label>
          <div className="grid grid-cols-3 gap-2 p-1 bg-muted/40 rounded-xl border border-border/60">
            <button
              type="button"
              onClick={() => {
                setCalculationMode("starter");
                setInputValue(30);
              }}
              className={`py-2 text-xs font-medium rounded-lg transition-all ${
                calculationMode === "starter"
                  ? "bg-card text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Peso da Isca
            </button>
            <button
              type="button"
              onClick={() => {
                setCalculationMode("total");
                setInputValue(200);
              }}
              className={`py-2 text-xs font-medium rounded-lg transition-all ${
                calculationMode === "total"
                  ? "bg-card text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Total Desejado
            </button>
            <button
              type="button"
              onClick={() => {
                setCalculationMode("flour");
                setInputValue(100);
              }}
              className={`py-2 text-xs font-medium rounded-lg transition-all ${
                calculationMode === "flour"
                  ? "bg-card text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Peso da Farinha
            </button>
          </div>
        </div>

        {/* Input de Peso Dinâmico */}
        <div className="space-y-2">
          <label
            htmlFor="dynamicWeight"
            className="text-sm font-semibold text-foreground"
          >
            {calculationMode === "starter" && "Peso da isca disponível (g)"}
            {calculationMode === "total" &&
              "Peso total de levain que você precisa (g)"}
            {calculationMode === "flour" && "Peso da farinha base (g)"}
          </label>
          <div className="relative">
            <Scale className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="dynamicWeight"
              type="number"
              min={1}
              value={inputValue || ""}
              onChange={(e) => setInputValue(Number(e.target.value))}
              className="pl-10 text-base bg-card font-medium font-mono"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {calculationMode === "starter" &&
              "Calcula a água e farinha necessárias para alimentar o que sobrou no pote."}
            {calculationMode === "total" &&
              "Calcula a quantidade exata de cada ingrediente para atingir o total da sua receita."}
            {calculationMode === "flour" &&
              "Calcula a isca e água a partir de um valor fixo de farinha."}
          </p>
        </div>

        {/* Proporção */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">
            Proporção (fermento : água : farinha)
          </label>
          <div className="grid grid-cols-5 gap-2">
            {AVAILABLE_RATIOS.map((ratio) => (
              <Button
                key={ratio}
                type="button"
                variant={selectedRatio === ratio ? "default" : "outline"}
                onClick={() => setSelectedRatio(ratio)}
                className={`text-xs sm:text-sm font-medium font-mono transition-all ${
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

        {/* Slider de Temperatura */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">
              Temperatura ambiente
            </span>
            <span className="text-sm font-bold font-mono text-foreground bg-muted/60 px-2.5 py-0.5 rounded-md border">
              {ambientTemp}°C
            </span>
          </div>
          <Slider
            value={[ambientTemp]}
            onValueChange={(vals) =>
              setAmbientTemp(Array.isArray(vals) ? vals[0] : vals)
            }
            min={18}
            max={34}
            step={1}
            className="w-full cursor-pointer py-1"
          />
        </div>
      </div>

      {/* Coluna Direita: Resumo */}
      <div className="lg:col-span-5 space-y-4">
        {/* Composição */}
        <Card className="border-border/80 shadow-sm">
          <CardContent className="p-5 space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Composição da alimentação
            </h4>

            <div className="grid grid-cols-3 gap-2">
              <div className="border rounded-xl p-3 bg-muted/20 text-center flex flex-col items-center justify-center">
                <FishingHook className="w-4 h-4 text-primary mb-1" />
                <span className="text-xl font-bold font-mono text-foreground">
                  {composition.starterG}g
                </span>
                <span className="text-xs text-muted-foreground">Isca</span>
              </div>

              <div className="border rounded-xl p-3 bg-muted/20 text-center flex flex-col items-center justify-center">
                <Droplets className="w-4 h-4 text-sky-600 mb-1" />
                <span className="text-xl font-bold font-mono text-foreground">
                  {composition.waterG}g
                </span>
                <span className="text-xs text-muted-foreground">Água</span>
              </div>

              <div className="border rounded-xl p-3 bg-muted/20 text-center flex flex-col items-center justify-center">
                <Wheat className="w-4 h-4 text-amber-600 mb-1" />
                <span className="text-xl font-bold font-mono text-foreground">
                  {composition.flourG}g
                </span>
                <span className="text-xs text-muted-foreground">Farinha</span>
              </div>
            </div>

            <div className="pt-2 border-t flex items-center justify-between text-xs text-muted-foreground">
              <span>Peso total da mistura</span>
              <span className="font-semibold font-mono text-foreground text-sm">
                {composition.totalG}g
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Estimativa de Pico */}
        {/* <Card className="border-border/80 shadow-sm bg-card">
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
                  por volta de{" "}
                  <strong>{peakEstimation.formattedTargetTime}</strong>
                </span>
              </div>

              <div className="mt-2.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                {peakEstimation.isCalibrated ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>
                      Calibrado com {peakEstimation.samplesCount} registros
                      reais (alta confiança)
                    </span>
                  </>
                ) : (
                  <span>Estimativa biológica teórica</span>
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
            </Card> */}
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full gap-2 font-semibold shadow-sm"
          size="lg"
        >
          {isSubmitting ? "Registrando..." : "Registrar alimentação"}
        </Button>
      </div>
    </div>
  );
}
