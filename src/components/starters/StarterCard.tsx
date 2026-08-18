import { Starter } from "@/types/starter";
import { StarterStatusBadge } from "./StarterStatusBadge";
import { MapPin, Wheat, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface StarterCardProps {
  starter: Starter;
  onEdit: (starter: Starter) => void;
  onDelete: (starter: Starter) => void;
}

export function StarterCard({ starter, onEdit, onDelete }: StarterCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow border-border/80">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Wheat className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-foreground leading-snug">
                {starter.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {starter.flourType}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <StarterStatusBadge status={starter.status} />
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => onEdit(starter)}
                  className="gap-2"
                >
                  <Edit2 className="w-4 h-4" /> Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(starter)}
                  className="gap-2 text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4" /> Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            <span>{starter.location}</span>
          </div>
          <span>
            Cadastrado em{" "}
            {new Date(starter.createdAt).toLocaleDateString("pt-BR")}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
