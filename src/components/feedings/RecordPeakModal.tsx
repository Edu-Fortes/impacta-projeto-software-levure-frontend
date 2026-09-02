"use client";

import { useState } from "react";
import { Feeding, AromaProfile, RecordPeakInput } from "@/types/feeding";
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
import { toast } from "sonner";

interface RecordPeakModalProps {
  feeding: Feeding | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRecordPeak: (feedingId: string, data: RecordPeakInput) => Promise<void>;
}

export function RecordPeakModal({
  feeding,
  open,
  onOpenChange,
  onRecordPeak,
}: RecordPeakModalProps) {
  const [actualPeakTime, setActualPeakTime] = useState(
    new Date().toISOString().slice(0, 16),
  );
  const [growthMultiplier, setGrowthMultiplier] = useState<number>(2.5);
  const [aromaProfile, setAromaProfile] = useState<AromaProfile>("BALANCED");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!feeding) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await onRecordPeak(feeding.id, {
        actualPeakTime: new Date(actualPeakTime).toISOString(),
        growthMultiplier: Number(growthMultiplier),
        aromaProfile,
        notes: notes.trim() || undefined,
      });
      toast.success(
        "Pico real registrado com sucesso! O algoritmo foi calibrado.",
      );
      onOpenChange(false);
    } catch {
      toast.error("Erro ao registrar o pico real.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Pico Observado</DialogTitle>
          <DialogDescription>
            Confirme o momento do ápice de fermentação para calibrar as próximas
            estimativas.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="peakTime">Horário do Pico</Label>
            <Input
              id="peakTime"
              type="datetime-local"
              value={actualPeakTime}
              onChange={(e) => setActualPeakTime(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="growth">Fator de Crescimento (Volume)</Label>
            <Input
              id="growth"
              type="number"
              step="0.1"
              min="1"
              max="5"
              value={growthMultiplier}
              onChange={(e) => setGrowthMultiplier(Number(e.target.value))}
              placeholder="Ex: 2.0 (dobrou) ou 3.0 (triplicou)"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="aroma">Aroma Observado</Label>
            <Select
              value={aromaProfile}
              onValueChange={(val: AromaProfile) => setAromaProfile(val)}
            >
              <SelectTrigger id="aroma">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BALANCED">Equilibrado / Normal</SelectItem>
                <SelectItem value="FRUITY">Frutado / Suave</SelectItem>
                <SelectItem value="ACIDIC">Muito Ácido (Acético)</SelectItem>
                <SelectItem value="ALCOHOLIC">Alcoólico</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="peakNotes">Observações</Label>
            <Textarea
              id="peakNotes"
              placeholder="Estrutura de alvéolos, textura, etc..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar Pico"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
