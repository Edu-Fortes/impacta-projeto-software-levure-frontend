"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Starter, DashboardSummary, CreateStarterInput } from "@/types/starter";
import { startersService } from "@/services/starters.service";
import { Header } from "@/components/layout/Header";
import { StarterCard } from "@/components/starters/StarterCard";
import { UpcomingPeakCard } from "@/components/feedings/UpcomingPeakCard";
import { StarterFormModal } from "@/components/starters/StarterFormModal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { DeleteStarterDialog } from "@/components/starters/DeleteStarterDialog";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { statsCardData } from "@/components/dashboard/statsCardData";
import { Input } from "@/components/ui/input";

export default function DashboardPage() {
  const [starters, setStarters] = useState<Starter[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [search, setSearch] = useState("");
  const [starterToEdit, setStarterToEdit] = useState<Starter | null>(null);
  const [starterToDelete, setStarterToDelete] = useState<Starter | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadData = async () => {
    try {
      const [startersData, summaryData] = await Promise.all([
        startersService.getAll(),
        startersService.getSummary(),
      ]);
      setStarters(startersData);
      setSummary(summaryData);
    } catch {
      toast.error("Erro ao carregar dados do painel.");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveStarter = async (data: CreateStarterInput) => {
    try {
      if (starterToEdit) {
        await startersService.update(starterToEdit.id, data);
        toast.success("Fermento atualizado com sucesso!");
      } else {
        await startersService.create(data);
        toast.success("Novo fermento criado com sucesso!");
      }
      loadData();
    } catch {
      toast.error("Erro ao salvar fermento.");
    }
  };

  const handleDeleteStarter = async () => {
    if (!starterToDelete) return;
    try {
      await startersService.delete(starterToDelete.id);
      toast.success("Fermento excluído.");
      loadData();
    } catch {
      toast.error("Erro ao excluir fermento.");
    } finally {
      setStarterToDelete(null);
    }
  };

  // Coleta as alimentações mais recentes de fermentos que possuem histórico
  // const upcomingPeaks = starters
  //   .filter((s) => s.feedings && s.feedings.length > 0)
  //   .map((s) => ({ starter: s, feeding: s.feedings![0] }))
  //   .slice(0, 2);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-8">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Painel de fermentação
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Acompanhe alimentação, picos de atividade e saúde dos seus
              fermentos naturais.
            </p>
          </div>

          <Button
            onClick={() => setModalOpen(true)}
            className="gap-2 font-medium"
          >
            <Plus className="w-4 h-4" /> Novo fermento
          </Button>
        </div>

        {/* 4 Cards de Métricas Principais */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statsCardData.map((card) => (
            <StatsCard
              key={card.key}
              summary={summary!}
              valueKey={card.valueKey}
              title={card.title}
            />
          ))}
        </div>

        {/* Barra de Busca */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, farinha ou local..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card"
          />
        </div>

        {/* Grade de Conteúdo em Duas Colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Coluna Esquerda: Seus Fermentos */}
          {/* <div className="lg:col-span-7 space-y-4"> */}
          <div className="lg:col-span-full space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">
                Seus fermentos
              </h2>
              <Link
                href="/fermentos"
                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                Ver todos &rarr;
              </Link>
            </div>

            {starters.length === 0 ? (
              <div className="text-center py-12 border rounded-xl bg-card/50">
                <p className="text-muted-foreground text-sm">
                  Nenhum fermento encontrado.
                </p>
              </div>
            ) : (
              <>
                {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"> */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {starters.slice(0, 4).map((starter) => (
                    <StarterCard
                      key={starter.id}
                      starter={starter}
                      onEdit={(item) => {
                        setStarterToEdit(item);
                        setModalOpen(true);
                      }}
                      onDelete={(item) => setStarterToDelete(item)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Coluna Direita: Próximos Picos e Análise por IA */}
          {/* <div className="lg:col-span-5 space-y-4">
            <h2 className="text-base font-semibold text-foreground">
              Próximos picos
            </h2>

            <div className="space-y-3">
              {upcomingPeaks.length === 0 ? (
                <div className="text-center py-6 border rounded-2xl bg-card/40 text-xs text-muted-foreground">
                  Nenhum pico previsto no momento.
                </div>
              ) : (
                upcomingPeaks.map(({ starter, feeding }) => (
                  <UpcomingPeakCard
                    key={feeding.id}
                    starter={starter}
                    feeding={feeding}
                  />
                ))
              )} */}

          {/* Card Promocional da IA (Sprint 4) */}
          {/* <Card className="rounded-2xl border-border/80 bg-card p-5 space-y-2">
                <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>Análise por IA</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Abra qualquer fermento para gerar uma análise de saúde e
                  receber dicas personalizadas de manutenção.
                </p>
              </Card>
            </div>
          </div> */}
        </div>
      </main>

      {/* Modal de Criação */}
      <StarterFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        starterToEdit={starterToEdit}
        onSubmit={handleSaveStarter}
      />

      <DeleteStarterDialog
        starter={starterToDelete}
        open={!!starterToDelete}
        onOpenChange={(open) => !open && setStarterToDelete(null)}
        onConfirm={handleDeleteStarter}
      />
    </div>
  );
}
