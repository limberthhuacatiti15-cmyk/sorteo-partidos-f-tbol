import type { Team } from "@/backend";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateTeam, useUpdateTeam } from "@/hooks/useQueries";
import { normalizeColor } from "@/lib/format";
import { useEffect, useState } from "react";

const COLOR_PRESETS = [
  "#31543f",
  "#1f6f8b",
  "#b23a2e",
  "#c98a1b",
  "#5b3a8c",
  "#2f7d4f",
  "#8c2f5b",
  "#2b2b2b",
] as const;

interface TeamFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team?: Team | null;
}

export function TeamFormDialog({
  open,
  onOpenChange,
  team,
}: TeamFormDialogProps) {
  const isEditing = !!team;
  const createTeam = useCreateTeam();
  const updateTeam = useUpdateTeam();

  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(COLOR_PRESETS[0]);

  // Initialize the draft once per open, from the record being edited.
  useEffect(() => {
    if (!open) return;
    setName(team?.name ?? "");
    setColor(team ? normalizeColor(team.color) : COLOR_PRESETS[0]);
  }, [open, team]);

  const isPending = createTeam.isPending || updateTeam.isPending;
  const trimmedName = name.trim();
  const canSubmit = trimmedName.length > 0 && !isPending;
  const error = createTeam.error ?? updateTeam.error;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    const input = { name: trimmedName, color: normalizeColor(color) };

    if (isEditing && team) {
      updateTeam.mutate(
        { id: team.id, input },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      createTeam.mutate(input, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-ocid="equipo.dialog"
        className="rounded-xl border-border bg-card"
      >
        <DialogHeader>
          <p className="label-programme text-muted-foreground">
            {isEditing ? "Editar equipo" : "Nuevo equipo"}
          </p>
          <DialogTitle className="font-display text-2xl font-bold">
            {isEditing ? "Editar equipo" : "Añadir equipo"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Actualiza el nombre o el color del equipo."
              : "Dale un nombre y un color distintivo al equipo."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="team-name">Nombre del equipo</Label>
            <Input
              id="team-name"
              data-ocid="equipo.name_input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ej. Atlético Norte"
              autoComplete="off"
              maxLength={60}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="team-color">Color distintivo</Label>
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="size-9 shrink-0 rounded-full border border-border shadow-subtle"
                style={{ backgroundColor: normalizeColor(color) }}
              />
              <Input
                id="team-color"
                data-ocid="equipo.color_input"
                type="color"
                value={normalizeColor(color)}
                onChange={(event) => setColor(event.target.value)}
                className="h-9 w-16 cursor-pointer p-1"
              />
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                {normalizeColor(color)}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {COLOR_PRESETS.map((preset) => {
                const active = normalizeColor(color) === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    aria-label={`Usar color ${preset}`}
                    aria-pressed={active}
                    onClick={() => setColor(preset)}
                    className="size-8 rounded-full border-2 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    style={{
                      backgroundColor: preset,
                      borderColor: active
                        ? "oklch(var(--foreground))"
                        : "transparent",
                    }}
                  />
                );
              })}
            </div>
          </div>

          {error ? (
            <p
              data-ocid="equipo.error_state"
              className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              No se pudo guardar el equipo. Inténtalo de nuevo.
            </p>
          ) : null}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              data-ocid="equipo.cancel_button"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              data-ocid="equipo.submit_button"
              disabled={!canSubmit}
              className="rounded-full"
            >
              {isPending
                ? "Guardando…"
                : isEditing
                  ? "Guardar cambios"
                  : "Crear equipo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
