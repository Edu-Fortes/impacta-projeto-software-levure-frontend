"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Starter, CreateStarterInput } from "@/types/starter";
import { CreateFeedingInput, RecordPeakInput } from "@/types/feeding";
import { startersService } from "@/services/starters.service";
import { feedingsService } from "@/services/feedings.service";
import { Header } from "@/components/layout/Header";
import { StarterStatusBadge } from "@/components/starters/StarterStatusBadge";
import { StarterFormModal } from "@/components/starters/StarterFormModal";
import { DeleteStarterDialog } from "@/components/starters/DeleteStarterDialog";
import { FeedingCalculator } from "@/components/feedings/FeedingCalculator";
import { FeedingHistoryList } from "@/components/feedings/FeedingHistoryList";
import { HealthAnalysisTab } from "@/components/starters/HealthAnalysisTab";
import { aiService } from "@/services/ai.service";
import { HealthAnalysis } from "@/types/ai";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Wheat,
  MapPin,
  Calendar,
  ArrowLeft,
  Edit2,
  Trash2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export default function DetalheFermentoPage() {
  const params = useParams();
  const router = useRouter();
  const starterId = params.id as string;

  const [starter, setStarter] = useState<Starter | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("alimentar");
  const [latestAnalysis, setLatestAnalysis] = useState<HealthAnalysis | null>(
    null,
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const loadStarter = async () => {
    try {
      const [starterData, analysisData] = await Promise.all([
        startersService.getById(starterId),
        aiService.getLatestAnalysis(starterId),
      ]);
      setStarter(starterData);
      setLatestAnalysis(analysisData);
    } catch {
      toast.error("Fermento não encontrado.");
      router.push("/fermentos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!starterId) return;

    const load = async () => {
      try {
        const data = await startersService.getById(starterId);
        setStarter(data);
      } catch {
        toast.error("Fermento não encontrado.");
        router.push("/fermentos");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [router, starterId]);

  const handleUpdateStarter = async (data: CreateStarterInput) => {
    if (!starter) return;
    try {
      await startersService.update(starter.id, data);
      toast.success("Fermento atualizado com sucesso!");
      loadStarter();
    } catch {
      toast.error("Erro ao atualizar fermento.");
    }
  };

  const handleDeleteStarter = async () => {
    if (!starter) return;
    try {
      await startersService.delete(starter.id);
      toast.success("Fermento excluído com sucesso.");
      router.push("/fermentos");
    } catch {
      toast.error("Erro ao excluir fermento.");
    }
  };

  const handleCreateFeeding = async (input: CreateFeedingInput) => {
    if (!starter) return;
    await feedingsService.create(starter.id, input);
    loadStarter();
  };

  const handleRecordPeak = async (feedingId: string, data: RecordPeakInput) => {
    await feedingsService.recordPeak(feedingId, data);
    loadStarter();
  };

  if (loading || !starter) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground text-sm">
            Carregando informações do fermento...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 space-y-6">
        {/* Botão Voltar */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/fermentos")}
          className="gap-2 text-muted-foreground hover:text-foreground -ml-2"
        >
          <ArrowLeft className="w-4 h-4" /> Fermentos
        </Button>

        {/* Cabeçalho do Fermento */}
        <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Wheat className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    {starter.name}
                  </h1>
                  <StarterStatusBadge status={starter.status} />
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
                  <span className="flex items-center gap-1">
                    <Wheat className="w-3.5 h-3.5" />
                    {starter.flourType}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {starter.location}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Criado em{" "}
                    {new Date(starter.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                {starter.notes && (
                  <p className="text-sm text-muted-foreground pt-2">
                    {starter.notes}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
                className="gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" /> Editar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-3.5 h-3.5" /> Excluir
              </Button>
            </div>
          </div>
        </div>

        {/* Abas */}
        {/* <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="bg-muted/60 p-1">
            <TabsTrigger
              value="alimentar"
              className="text-xs sm:text-sm font-medium"
            >
              Alimentar
            </TabsTrigger>
            <TabsTrigger
              value="historico"
              className="text-xs sm:text-sm font-medium"
            >
              Histórico ({starter.feedings?.length || 0})
            </TabsTrigger>
            <TabsTrigger
              value="ia"
              className="text-xs sm:text-sm font-medium gap-1.5 text-muted-foreground"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Saúde & IA
            </TabsTrigger>
          </TabsList>

          <TabsContent value="alimentar" className="outline-none">
            <FeedingCalculator
              starter={starter}
              onFeedingCreated={handleCreateFeeding}
            />
          </TabsContent>

          <TabsContent value="historico" className="outline-none">
            <FeedingHistoryList
              feedings={starter.feedings || []}
              onRecordPeak={handleRecordPeak}
            />
          </TabsContent>

          <TabsContent value="ia" className="outline-none">
            <HealthAnalysisTab
              starterId={starter.id}
              initialAnalysis={latestAnalysis}
              feedingsCount={starter.feedings?.length || 0}
              onApplyRecommendedRatio={(ratio) => {
                setActiveTab("alimentar");
              }}
            />
          </TabsContent>
        </Tabs> */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="bg-muted/60 p-1">
            <TabsTrigger
              value="alimentar"
              className="text-xs sm:text-sm font-medium"
            >
              Alimentar
            </TabsTrigger>
            <TabsTrigger
              value="historico"
              className="text-xs sm:text-sm font-medium"
            >
              Histórico ({starter.feedings?.length || 0})
            </TabsTrigger>
            <TabsTrigger
              value="ia"
              className="text-xs sm:text-sm font-medium gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Saúde & IA
            </TabsTrigger>
          </TabsList>

          <TabsContent value="alimentar" className="outline-none">
            <FeedingCalculator
              starter={starter}
              onFeedingCreated={handleCreateFeeding}
            />
          </TabsContent>

          <TabsContent value="historico" className="outline-none">
            <FeedingHistoryList
              feedings={starter.feedings || []}
              onRecordPeak={handleRecordPeak}
            />
          </TabsContent>

          <TabsContent value="ia" className="outline-none">
            <HealthAnalysisTab
              starterId={starter.id}
              initialAnalysis={latestAnalysis}
              feedingsCount={starter.feedings?.length || 0}
              onApplyRecommendedRatio={(ratio) => {
                setActiveTab("alimentar");
              }}
            />
          </TabsContent>
        </Tabs>
      </main>

      <StarterFormModal
        key={`${isEditModalOpen}-${starter?.id ?? "new"}`}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        starterToEdit={starter}
        onSubmit={handleUpdateStarter}
      />

      <DeleteStarterDialog
        starter={starter}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteStarter}
      />
    </div>
  );
}
