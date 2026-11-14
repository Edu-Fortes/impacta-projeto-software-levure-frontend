"use client";

import { useEffect, useState } from "react";
import { HealthAnalysis } from "@/types/ai";
import { aiService } from "@/services/ai.service";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Utensils,
  Thermometer,
  Wheat,
  Activity,
  Flame,
  History,
} from "lucide-react";
import { toast } from "sonner";

interface HealthAnalysisTabProps {
  starterId: string;
  initialAnalysis: HealthAnalysis | null;
  feedingsCount: number;
  onApplyRecommendedRatio?: (ratio: string) => void;
}

export function HealthAnalysisTab({
  starterId,
  initialAnalysis,
  feedingsCount,
  onApplyRecommendedRatio,
}: HealthAnalysisTabProps) {
  const [selectedAnalysis, setSelectedAnalysis] =
    useState<HealthAnalysis | null>(initialAnalysis);
  const [historyList, setHistoryList] = useState<HealthAnalysis[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!starterId) return;

    let cancelled = false;
    void aiService
      .getHistory(starterId)
      .then((data) => {
        if (cancelled) return;
        setHistoryList(data);
        if (data.length > 0) {
          setSelectedAnalysis((current) => current ?? data[0]);
        }
      })
      .catch(() => {
        // Falha silenciosa caso seja a primeira vez
      });

    return () => {
      cancelled = true;
    };
  }, [starterId]);

  const handleGenerateAnalysis = async () => {
    if (feedingsCount === 0) {
      toast.error(
        "Cadastre ao menos uma alimentação antes de gerar a análise com IA.",
      );
      return;
    }

    try {
      setLoading(true);
      const newAnalysis = await aiService.analyze(starterId);
      setSelectedAnalysis(newAnalysis);
      setHistoryList((prev) => [newAnalysis, ...prev]);
      toast.success("Diagnóstico biológico atualizado com sucesso!");
    } catch {
      toast.error(
        "Falha ao processar análise com IA. Verifique a chave de API.",
      );
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (score >= 70) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-rose-600 bg-rose-50 border-rose-200";
  };

  const getPriorityBadge = (priority: "HIGH" | "MEDIUM" | "LOW") => {
    switch (priority) {
      case "HIGH":
        return (
          <Badge variant="destructive" className="text-[10px] uppercase">
            Alta Prioridade
          </Badge>
        );
      case "MEDIUM":
        return (
          <Badge
            variant="secondary"
            className="text-[10px] uppercase bg-amber-100 text-amber-800 border-amber-200"
          >
            Recomendado
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="text-[10px] uppercase text-muted-foreground"
          >
            Otimização
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Barra de Ação Superior */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border/80 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-base text-foreground">
              Diagnóstico Especialista com Gemini
            </h3>
            <p className="text-xs text-muted-foreground">
              {selectedAnalysis
                ? `Análise de ${new Date(selectedAnalysis.createdAt).toLocaleDateString("pt-BR")} às ${new Date(selectedAnalysis.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
                : "Analise o vigor microbiano, acúmulo de acidez e prontidão para assar."}
            </p>
          </div>
        </div>

        <Button
          onClick={handleGenerateAnalysis}
          disabled={loading || feedingsCount === 0}
          className="gap-2 font-medium shadow-sm"
        >
          <RotateCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {loading
            ? "Consultando IA..."
            : selectedAnalysis
              ? "Reavaliar Fermento"
              : "Gerar Primeira Análise"}
        </Button>
      </div>

      {/* Histórico de Análises Anteriores (Chips horizontais clicáveis) */}
      {historyList.length > 1 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <History className="w-3.5 h-3.5" />
            <span>Histórico de Diagnósticos ({historyList.length})</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {historyList.map((item) => {
              const isSelected = selectedAnalysis?.id === item.id;
              const dateStr = new Date(item.createdAt).toLocaleDateString(
                "pt-BR",
                {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                },
              );

              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedAnalysis(item)}
                  type="button"
                  className={`text-xs px-3.5 py-1.5 rounded-xl border transition-all whitespace-nowrap flex items-center gap-2 ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary font-semibold shadow-sm"
                      : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50 border-border/70"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${item.healthScore >= 85 ? "bg-emerald-400" : item.healthScore >= 70 ? "bg-amber-400" : "bg-rose-400"}`}
                  />
                  <span>{dateStr}</span>
                  <span className="font-mono text-[11px] opacity-80">
                    ({item.healthScore} pts)
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {loading ? (
        <Card className="border-border/80 p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center animate-pulse">
            <Sparkles className="w-6 h-6 animate-spin" />
          </div>
          <div className="space-y-1">
            <h4 className="font-semibold text-foreground text-base">
              Processando Microbiologia do Cultivo...
            </h4>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Correlacionando tempos de pico, fatores de diluição e variações de
              temperatura para compor o relatório.
            </p>
          </div>
        </Card>
      ) : !selectedAnalysis ? (
        <Card className="border-border/80 p-12 text-center space-y-3 bg-card/60">
          <Activity className="w-10 h-10 text-muted-foreground mx-auto" />
          <h4 className="font-medium text-foreground">
            Nenhuma análise gerada ainda
          </h4>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Clique no botão acima para submeter o histórico de alimentações
            deste fermento à avaliação de inteligência artificial.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Grid de Resumo: Score e Prontidão de Fornada */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
            {/* Card de Score */}
            <Card className="md:col-span-4 border-border/80 bg-card flex flex-col justify-between">
              <CardContent className="p-6 text-center space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Índice de Vitalidade
                </span>
                <div className="flex items-center justify-center">
                  <div
                    className={`w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center ${getScoreColor(selectedAnalysis.healthScore)}`}
                  >
                    <span className="text-4xl font-black font-mono tracking-tight">
                      {selectedAnalysis.healthScore}
                    </span>
                    <span className="text-[11px] font-semibold uppercase">
                      de 100
                    </span>
                  </div>
                </div>
                <Badge variant="outline" className="font-medium text-xs">
                  Status: {selectedAnalysis.status}
                </Badge>
              </CardContent>
            </Card>

            {/* Card de Prontidão para Assar */}
            <Card
              className={`md:col-span-8 border flex flex-col justify-between ${
                selectedAnalysis.readyToBake
                  ? "bg-emerald-50/40 border-emerald-200"
                  : "bg-amber-50/40 border-amber-200"
              }`}
            >
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-2">
                  {selectedAnalysis.readyToBake ? (
                    <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span>PRONTO PARA PANIFICAR HOJE</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-amber-700 font-bold text-sm">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                      <span>REQUER ALIMENTAÇÃO DE REFORÇO ANTES DE ASSAR</span>
                    </div>
                  )}
                </div>

                <p className="text-sm font-medium text-foreground leading-relaxed">
                  {selectedAnalysis.bakingReason}
                </p>

                <div className="pt-2 border-t border-border/50 text-xs text-muted-foreground leading-relaxed">
                  <strong>Resumo Executivo:</strong> {selectedAnalysis.summary}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Três Pilares da Observação Biológica */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-border/80">
              <CardContent className="p-5 space-y-2">
                <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
                  <Flame className="w-4 h-4" />
                  <span>Vigor e Crescimento</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {selectedAnalysis.vigorObservation}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/80">
              <CardContent className="p-5 space-y-2">
                <div className="flex items-center gap-2 text-amber-600 font-semibold text-xs uppercase tracking-wider">
                  <Utensils className="w-4 h-4" />
                  <span>Acidez e Aroma</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {selectedAnalysis.acidityObservation}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/80">
              <CardContent className="p-5 space-y-2">
                <div className="flex items-center gap-2 text-sky-600 font-semibold text-xs uppercase tracking-wider">
                  <Thermometer className="w-4 h-4" />
                  <span>Ambiente & Temperatura</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {selectedAnalysis.temperatureImpact}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Prescrição para a Próxima Alimentação */}
          <Card className="border-border/80 bg-muted/20">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Prescrição para a Próxima Alimentação
                </h4>
                {onApplyRecommendedRatio && (
                  <Button
                    variant="link"
                    size="sm"
                    className="text-primary text-xs p-0 h-auto font-semibold"
                    onClick={() =>
                      onApplyRecommendedRatio(selectedAnalysis.recommendedRatio)
                    }
                  >
                    Usar proporção {selectedAnalysis.recommendedRatio} na
                    Calculadora &rarr;
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="border bg-card rounded-xl p-3">
                  <span className="block text-[11px] text-muted-foreground">
                    Proporção Sugerida
                  </span>
                  <span className="text-base font-bold font-mono text-foreground">
                    {selectedAnalysis.recommendedRatio}
                  </span>
                </div>
                <div className="border bg-card rounded-xl p-3">
                  <span className="block text-[11px] text-muted-foreground">
                    Farinha Indicada
                  </span>
                  <span className="text-xs font-medium text-foreground flex items-center gap-1 mt-1">
                    <Wheat className="w-3.5 h-3.5 text-amber-600" />
                    {selectedAnalysis.flourTypeHint}
                  </span>
                </div>
                <div className="border bg-card rounded-xl p-3">
                  <span className="block text-[11px] text-muted-foreground">
                    Temperatura Alvo
                  </span>
                  <span className="text-xs font-medium text-foreground flex items-center gap-1 mt-1">
                    <Thermometer className="w-3.5 h-3.5 text-sky-600" />
                    {selectedAnalysis.targetAmbientTemp}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plano de Ação */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">
              Plano de Manejo e Ações Recomendadas
            </h4>
            <div className="space-y-2.5">
              {selectedAnalysis.recommendationsJson.map((rec, index) => (
                <Card key={index} className="border-border/80">
                  <CardContent className="p-4 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">
                          {rec.title}
                        </span>
                        {getPriorityBadge(rec.priority)}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {rec.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
