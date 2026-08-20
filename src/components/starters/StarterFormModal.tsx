"use client";

import { useEffect, useState } from "react";
import { Starter, CreateStarterInput, StarterStatus } from "@/types/starter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StarterFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  starterToEdit?: Starter | null;
  onSubmit: (data: CreateStarterInput) => Promise<void>;
}

const starterStatusLabels: Record<StarterStatus, string> = {
  HEALTHY: "Saudável",
  ATTENTION: "Atenção",
  NEW: "Novo",
};

export function StarterFormModal({
  open,
  onOpenChange,
  starterToEdit,
  onSubmit,
}: StarterFormModalProps) {
  const [name, setName] = useState("");
  const [flourType, setFlourType] = useState("Trigo branco");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<StarterStatus>("NEW");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (starterToEdit) {
      setName(starterToEdit.name);
      setFlourType(starterToEdit.flourType);
      setLocation(starterToEdit.location);
      setNotes(starterToEdit.notes || "");
      setStatus(starterToEdit.status);
    } else {
      setName("");
      setFlourType("Trigo branco");
      setLocation("");
      setNotes("");
      setStatus("NEW");
    }
  }, [starterToEdit, open]);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!name.trim() || !location.trim()) return;

    try {
      setLoading(true);
      await onSubmit({ name, flourType, location, notes, status });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {starterToEdit ? "Editar fermento" : "Novo fermento"}
          </DialogTitle>
          <DialogDescription>
            {starterToEdit
              ? "Atualize as características do seu fermento."
              : "Cadastre um novo fermento natural para acompanhar."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              placeholder="Ex: Vó Amália"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="flour">Tipo de farinha</Label>
            <Select
              value={flourType}
              onValueChange={(value) => setFlourType(value ?? "")}
            >
              <SelectTrigger id="flour">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Trigo branco">Trigo branco</SelectItem>
                <SelectItem value="Centeio integral">
                  Centeio integral
                </SelectItem>
                <SelectItem value="Trigo integral">Trigo integral</SelectItem>
                <SelectItem value="Mista">Mista (Branca + Integral)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="location">Local do pote</Label>
            <Input
              id="location"
              placeholder="Ex: Bancada da cozinha"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>

          {starterToEdit && (
            <div className="space-y-1.5">
              <Label htmlFor="status">Status de Saúde</Label>
              <Select
                value={status}
                onValueChange={(val: StarterStatus | null) =>
                  val && setStatus(val)
                }
              >
                <SelectTrigger id="status">
                  <SelectValue>
                    {(value: StarterStatus | null) =>
                      value ? starterStatusLabels[value] : "Selecione o status"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HEALTHY">Saudável</SelectItem>
                  <SelectItem value="ATTENTION">Atenção</SelectItem>
                  <SelectItem value="NEW">Novo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Observações sobre esse fermento..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {starterToEdit ? "Salvar alterações" : "Criar fermento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
