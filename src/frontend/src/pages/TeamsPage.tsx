import type { Team } from "@/backend";
import { TeamFormDialog } from "@/components/TeamFormDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeleteTeam, useIsCallerAdmin, useTeams } from "@/hooks/useQueries";
import { normalizeColor } from "@/lib/format";
import { Pencil, Plus, Trash2, Users } from "lucide-react";
import { useState } from "react";

export default function TeamsPage() {
  const { data: teams, isLoading, isError, refetch } = useTeams();
  const { data: isAdmin } = useIsCallerAdmin();
  const deleteTeam = useDeleteTeam();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Team | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Team | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (team: Team) => {
    setEditing(team);
    setFormOpen(true);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    deleteTeam.mutate(pendingDelete.id, {
      onSuccess: () => setPendingDelete(null),
    });
  };

  const list = teams ?? [];

  return (
    <section data-ocid="equipos.page" className="space-y-6">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="label-programme text-muted-foreground">Plantilla</p>
          <h2 className="font-display text-3xl font-bold tracking-tight">
            Equipos
          </h2>
          <p className="text-sm text-muted-foreground">
            {list.length > 0
              ? `${list.length} ${list.length === 1 ? "equipo" : "equipos"} en la liga`
              : "Los equipos de la liga aparecerán aquí."}
          </p>
        </div>
        {isAdmin ? (
          <Button
            type="button"
            data-ocid="equipo.open_modal_button"
            onClick={openCreate}
            className="shrink-0 rounded-full"
          >
            <Plus aria-hidden="true" />
            Añadir
          </Button>
        ) : null}
      </header>

      {isLoading ? (
        <div className="space-y-3" aria-hidden="true">
          {Array.from({ length: 4 }, (_, i) => `skeleton-${i}`).map((id) => (
            <Skeleton key={id} className="h-[68px] w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <div
          data-ocid="equipos.error_state"
          className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-6 text-center"
        >
          <p className="text-sm text-destructive">
            No se pudieron cargar los equipos.
          </p>
          <Button
            type="button"
            variant="outline"
            data-ocid="equipos.retry_button"
            onClick={() => void refetch()}
            className="mt-3 rounded-full"
          >
            Reintentar
          </Button>
        </div>
      ) : list.length === 0 ? (
        <div
          data-ocid="equipos.empty_state"
          className="flex flex-col items-center rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center"
        >
          <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-primary">
            <Users className="size-7" aria-hidden="true" />
          </span>
          <h3 className="mt-4 font-display text-lg font-semibold">
            Aún no hay equipos
          </h3>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            {isAdmin
              ? "Crea el primer equipo para empezar a armar las jornadas."
              : "El administrador todavía no ha registrado equipos."}
          </p>
          {isAdmin ? (
            <Button
              type="button"
              data-ocid="equipos.primary_button"
              onClick={openCreate}
              className="mt-5 rounded-full"
            >
              <Plus aria-hidden="true" />
              Crear primer equipo
            </Button>
          ) : null}
        </div>
      ) : (
        <ul data-ocid="equipos.list" className="space-y-3">
          {list.map((team, index) => (
            <li
              key={team.id.toString()}
              data-ocid={`equipo.item.${index + 1}`}
              className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-subtle"
            >
              <span
                aria-hidden="true"
                className="size-10 shrink-0 rounded-full border border-border/60"
                style={{ backgroundColor: normalizeColor(team.color) }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-base font-semibold">
                  {team.name}
                </p>
                <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground">
                  {normalizeColor(team.color)}
                </p>
              </div>
              {isAdmin ? (
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Editar ${team.name}`}
                    data-ocid={`equipo.edit_button.${index + 1}`}
                    onClick={() => openEdit(team)}
                    className="rounded-full text-muted-foreground hover:text-foreground"
                  >
                    <Pencil aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Eliminar ${team.name}`}
                    data-ocid={`equipo.delete_button.${index + 1}`}
                    onClick={() => setPendingDelete(team)}
                    className="rounded-full text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {isAdmin ? (
        <TeamFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          team={editing}
        />
      ) : null}

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent
          data-ocid="equipo.delete_dialog"
          className="rounded-xl border-border bg-card"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-xl font-bold">
              ¿Eliminar equipo?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará «{pendingDelete?.name}» de la liga. Esta acción no se
              puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              data-ocid="equipo.cancel_button"
              className="rounded-full"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="equipo.confirm_button"
              onClick={confirmDelete}
              disabled={deleteTeam.isPending}
              className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteTeam.isPending ? "Eliminando…" : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
