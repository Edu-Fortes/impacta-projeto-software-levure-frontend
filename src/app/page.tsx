"use client";

import { useEffect, useState } from "react";
import { Starter, DashboardSummary, CreateStarterInput } from "@/types/starter";
import { startersService } from "@/services/starters.service";
import { Header } from "@/components/layout/Header";
import { StarterCard } from "@/components/starters/StarterCard";
import { StarterFormModal } from "@/components/starters/StarterFormModal";
import { DeleteStarterDialog } from "@/components/starters/DeleteStarterDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";

export default function DashboardPage() {
  const [starters, setStarters] = useState<Starter[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [starterToEdit, setStarterToEdit] = useState<Starter | null>(null);
  const [starterToDelete, setStarterToDelete] = useState<Starter | null>(null);

  const loadData = async () => {
    try {
      const [startersData, summaryData] = await Promise.all([
        startersService.getAll(search),
        startersService.getSummary(),
      ]);
      setStarters(startersData);
      setSummary(summaryData);
    } catch {
      toast.error("Erro ao carregar dados do backend.");
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-8">
        {/* Cabeçalho do Painel */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Painel de fermentação
            </h1>
            <p className="text-sm text-muted-foreground">
              Acompanhe e gerencie a saúde dos seus fermentos naturais.
            </p>
          </div>

          <Button
            onClick={() => {
              setStarterToEdit(null);
              setModalOpen(true);
            }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" /> Novo fermento
          </Button>
        </div>

        {/* Métricas do Sumário */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-5">
              <div className="text-2xl font-bold">
                {summary?.activeStartersCount || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Fermentos cadastrados
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="text-2xl font-bold text-emerald-600">
                {summary?.healthyCount || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Saudáveis</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="text-2xl font-bold text-amber-600">
                {summary?.attentionCount || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Precisam de atenção
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="text-2xl font-bold text-zinc-600">
                {summary?.newCount || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Novos cultivos
              </p>
            </CardContent>
          </Card>
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

        {/* Listagem de Cards */}
        {starters.length === 0 ? (
          <div className="text-center py-12 border rounded-xl bg-card/50">
            <p className="text-muted-foreground text-sm">
              Nenhum fermento encontrado.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {starters.map((starter) => (
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
        )}
      </main>

      {/* Modais */}
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
