// "use client";

// import { useEffect, useState } from "react";
// import { Starter, CreateStarterInput } from "@/types/starter";
// import { startersService } from "@/services/starters.service";
// import { Header } from "@/components/layout/Header";
// import { StarterCard } from "@/components/starters/StarterCard";
// import { StarterFormModal } from "@/components/starters/StarterFormModal";
// import { DeleteStarterDialog } from "@/components/starters/DeleteStarterDialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Plus, Search } from "lucide-react";
// import { toast } from "sonner";

// export default function FermentosPage() {
//   const [starters, setStarters] = useState<Starter[]>([]);
//   const [search, setSearch] = useState("");
//   const [modalOpen, setModalOpen] = useState(false);
//   const [starterToEdit, setStarterToEdit] = useState<Starter | null>(null);
//   const [starterToDelete, setStarterToDelete] = useState<Starter | null>(null);

//   const loadStarters = async () => {
//     try {
//       const data = await startersService.getAll(search);
//       setStarters(data);
//     } catch {
//       toast.error("Erro ao carregar a lista de fermentos.");
//     }
//   };

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       loadStarters();
//     }, 300);
//     return () => clearTimeout(timer);
//   }, [search]);

//   const handleSaveStarter = async (data: CreateStarterInput) => {
//     try {
//       if (starterToEdit) {
//         await startersService.update(starterToEdit.id, data);
//         toast.success("Fermento atualizado com sucesso!");
//       } else {
//         await startersService.create(data);
//         toast.success("Novo fermento criado com sucesso!");
//       }
//       loadStarters();
//     } catch {
//       toast.error("Erro ao salvar fermento.");
//     }
//   };

//   const handleDeleteStarter = async () => {
//     if (!starterToDelete) return;
//     try {
//       await startersService.delete(starterToDelete.id);
//       toast.success("Fermento excluído com sucesso.");
//       loadStarters();
//     } catch {
//       toast.error("Erro ao excluir fermento.");
//     } finally {
//       setStarterToDelete(null);
//     }
//   };

//   return (
//     <div className="min-h-screen flex flex-col">
//       <Header />

//       <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-6">
//         {/* Cabeçalho */}
//         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//           <div>
//             <h1 className="text-2xl font-bold tracking-tight text-foreground">
//               Fermentos
//             </h1>
//             <p className="text-sm text-muted-foreground">
//               Gerencie o cadastro completo dos seus fermentos naturais.
//             </p>
//           </div>

//           <Button
//             onClick={() => {
//               setStarterToEdit(null);
//               setModalOpen(true);
//             }}
//             className="gap-2"
//           >
//             <Plus className="w-4 h-4" /> Novo fermento
//           </Button>
//         </div>

//         {/* Campo de Busca conforme a imagem lista_fermentos.png */}
//         <div className="relative max-w-md">
//           <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
//           <Input
//             placeholder="Buscar por nome, farinha ou local..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="pl-9 bg-card"
//           />
//         </div>

//         {/* Grid de Fermentos */}
//         {starters.length === 0 ? (
//           <div className="text-center py-16 border rounded-xl bg-card/50">
//             <p className="text-muted-foreground text-sm">
//               Nenhum fermento encontrado.
//             </p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {starters.map((starter) => (
//               <StarterCard
//                 key={starter.id}
//                 starter={starter}
//                 onEdit={(item) => {
//                   setStarterToEdit(item);
//                   setModalOpen(true);
//                 }}
//                 onDelete={(item) => setStarterToDelete(item)}
//               />
//             ))}
//           </div>
//         )}
//       </main>

//       {/* Modais de Ação */}
//       <StarterFormModal
//         open={modalOpen}
//         onOpenChange={setModalOpen}
//         starterToEdit={starterToEdit}
//         onSubmit={handleSaveStarter}
//       />

//       <DeleteStarterDialog
//         starter={starterToDelete}
//         open={!!starterToDelete}
//         onOpenChange={(open) => !open && setStarterToDelete(null)}
//         onConfirm={handleDeleteStarter}
//       />
//     </div>
//   );
// }
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Starter, CreateStarterInput } from "@/types/starter";
import { startersService } from "@/services/starters.service";
import { formatLastFeeding } from "@/lib/utils";
import { Header } from "@/components/layout/Header";
import { StarterStatusBadge } from "@/components/starters/StarterStatusBadge";
import { StarterFormModal } from "@/components/starters/StarterFormModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Wheat, MapPin, ChevronRight } from "lucide-react";
import { toast } from "sonner";

// Cores de fundo dos ícones dos fermentos conforme imagem
const STARTER_ICON_COLORS: Record<string, { bg: string; text: string }> = {
  "Trigo branco": { bg: "bg-[#FDF3E7]", text: "text-[#D97706]" },
  "Centeio integral": { bg: "bg-[#FDECE8]", text: "text-[#DC2626]" },
  "Trigo integral": { bg: "bg-[#EBF5FA]", text: "text-[#0284C7]" },
};

export function getIconColor(flourType: string) {
  return (
    STARTER_ICON_COLORS[flourType] || {
      bg: "bg-muted/40",
      text: "text-primary",
    }
  );
}

export default function FermentosPage() {
  const router = useRouter();
  const [starters, setStarters] = useState<Starter[]>([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const loadStarters = async () => {
    try {
      const data = await startersService.getAll(search);
      setStarters(data);
    } catch {
      toast.error("Erro ao carregar a lista de fermentos.");
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadStarters();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSaveStarter = async (data: CreateStarterInput) => {
    try {
      await startersService.create(data);
      toast.success("Novo fermento criado com sucesso!");
      loadStarters();
    } catch {
      toast.error("Erro ao salvar fermento.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-6">
        {/* Cabeçalho da Página */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Fermentos
            </h1>
            <p className="text-sm text-muted-foreground">
              Gerencie o cadastro completo dos seus fermentos naturais.
            </p>
          </div>

          <Button
            onClick={() => setModalOpen(true)}
            className="gap-2 font-medium"
          >
            <Plus className="w-4 h-4" /> Novo fermento
          </Button>
        </div>

        {/* Input de Busca */}
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, farinha ou local..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card rounded-lg border-border/80 text-sm"
          />
        </div>

        {/* Tabela de Fermentos */}
        <div className="bg-card rounded-xl border border-border/80 shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow className="border-b border-border/60 hover:bg-transparent">
                <TableHead className="font-semibold text-foreground text-xs py-3.5 px-6">
                  Fermento
                </TableHead>
                <TableHead className="font-semibold text-foreground text-xs py-3.5">
                  Farinha base
                </TableHead>
                <TableHead className="font-semibold text-foreground text-xs py-3.5">
                  Local
                </TableHead>
                <TableHead className="font-semibold text-foreground text-xs py-3.5">
                  Última alimentação
                </TableHead>
                <TableHead className="font-semibold text-foreground text-xs py-3.5">
                  Status
                </TableHead>
                <TableHead className="w-12 py-3.5"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {starters.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-32 text-center text-sm text-muted-foreground"
                  >
                    Nenhum fermento encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                starters.map((starter) => {
                  const colors = getIconColor(starter.flourType);
                  // Pega a data da alimentação mais recente se existir
                  const lastFedAt =
                    starter.feedings && starter.feedings.length > 0
                      ? starter.feedings[0].fedAt
                      : starter.updatedAt;

                  return (
                    <TableRow
                      key={starter.id}
                      onClick={() => router.push(`/fermentos/${starter.id}`)}
                      className="cursor-pointer hover:bg-muted/30 transition-colors border-b border-border/60 group"
                    >
                      {/* Fermento (Ícone + Nome) */}
                      <TableCell className="py-3 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-lg ${colors.bg} ${colors.text} flex items-center justify-center shrink-0`}
                          >
                            <Wheat className="w-5 h-5" />
                          </div>
                          <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                            {starter.name}
                          </span>
                        </div>
                      </TableCell>

                      {/* Farinha Base */}
                      <TableCell className="text-sm text-muted-foreground py-3">
                        {starter.flourType}
                      </TableCell>

                      {/* Local com Ícone */}
                      <TableCell className="text-sm text-muted-foreground py-3">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-muted-foreground/80" />
                          <span>{starter.location}</span>
                        </div>
                      </TableCell>

                      {/* Última Alimentação */}
                      <TableCell className="text-sm text-muted-foreground py-3">
                        {formatLastFeeding(lastFedAt)}
                      </TableCell>

                      {/* Status Badge */}
                      <TableCell className="py-3">
                        <StarterStatusBadge status={starter.status} />
                      </TableCell>

                      {/* Seta Direita de Navegação */}
                      <TableCell className="py-3 text-right pr-6">
                        <ChevronRight className="w-4 h-4 text-muted-foreground/60 group-hover:text-foreground group-hover:translate-x-0.5 transition-all inline-block" />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </main>

      {/* Modal de Criação */}
      <StarterFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSubmit={handleSaveStarter}
      />
    </div>
  );
}
