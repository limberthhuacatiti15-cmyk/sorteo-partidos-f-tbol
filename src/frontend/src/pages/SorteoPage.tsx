import type { FixtureError, Match, MatchdayView } from "@/backend";
import { MatchCard } from "@/components/MatchCard";
import {
  MatchFormDialog,
  type MatchFormMode,
} from "@/components/MatchFormDialog";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAddMatch,
  useCreateMatchday,
  useDeleteMatch,
  useDeleteMatchday,
  useIsCallerAdmin,
  useMatchdays,
  useSetMatchResult,
  useTeams,
  useUpdateMatch,
} from "@/hooks/useQueries";
import { fixtureErrorMessage, formatMatchdayDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CalendarPlus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

type DialogState =
  | { kind: "closed" }
  | { kind: "create-round" }
  | {
      kind: "match";
      mode: MatchFormMode;
      matchday: MatchdayView;
      match: Match | null;
    };

export default function SorteoPage() {
  const { data: matchdays, isLoading } = useMatchdays();
  const { data: teams } = useTeams();
  const { data: isAdmin } = useIsCallerAdmin();

  const createMatchday = useCreateMatchday();
  const deleteMatchday = useDeleteMatchday();
  const addMatch = useAddMatch();
  const updateMatch = useUpdateMatch();
  const deleteMatch = useDeleteMatch();
  const setResult = useSetMatchResult();

  const [dialog, setDialog] = useState<DialogState>({ kind: "closed" });
  const [roundName, setRoundName] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const canManage = isAdmin === true;
  const teamList = teams ?? [];
  const rounds = matchdays ?? [];

  const closeDialog = () => {
    setDialog({ kind: "closed" });
    setFormError(null);
  };

  const openCreateRound = () => {
    setRoundName("");
    setFormError(null);
    setDialog({ kind: "create-round" });
  };

  const openMatch = (
    mode: MatchFormMode,
    matchday: MatchdayView,
    match: Match | null,
  ) => {
    setFormError(null);
    setDialog({ kind: "match", mode, matchday, match });
  };

  const handleCreateRound = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = roundName.trim();
    if (!name) return;
    setRoundName("");
    createMatchday.mutate(name, {
      onSuccess: closeDialog,
      onError: () =>
        setFormError("No se pudo crear la jornada. Inténtalo de nuevo."),
    });
  };

  const handleMatchSubmit = (payload: {
    input: { homeTeamId: bigint; awayTeamId: bigint };
    homeScore: bigint;
    awayScore: bigint;
  }) => {
    if (dialog.kind !== "match") return;
    const { mode, matchday, match } = dialog;
    setFormError(null);

    const onErr = (error: FixtureError) =>
      setFormError(fixtureErrorMessage(error, teamList));
    const onFail = () =>
      setFormError("No se pudo guardar. Inténtalo de nuevo.");

    if (mode === "create") {
      addMatch.mutate(
        { matchdayId: matchday.id, input: payload.input },
        {
          onSuccess: (result) => {
            if (result.__kind__ === "ok") closeDialog();
            else onErr(result.err);
          },
          onError: onFail,
        },
      );
      return;
    }

    if (!match) return;

    if (mode === "edit") {
      updateMatch.mutate(
        { id: match.id, input: payload.input },
        {
          onSuccess: (result) => {
            if (result.__kind__ === "ok") closeDialog();
            else onErr(result.err);
          },
          onError: onFail,
        },
      );
      return;
    }

    setResult.mutate(
      {
        matchId: match.id,
        homeScore: payload.homeScore,
        awayScore: payload.awayScore,
      },
      {
        onSuccess: (updated) => {
          if (updated) closeDialog();
          else setFormError("Ese partido ya no existe.");
        },
        onError: onFail,
      },
    );
  };

  const handleDeleteMatch = (match: Match) => {
    deleteMatch.mutate(match.id);
  };

  const handleDeleteRound = (matchday: MatchdayView) => {
    deleteMatchday.mutate(matchday.id);
  };

  const isPending =
    addMatch.isPending || updateMatch.isPending || setResult.isPending;

  return (
    <section data-ocid="sorteo.page" className="space-y-6">
      <header className="space-y-2">
        <p className="label-programme text-muted-foreground">Temporada</p>
        <div className="flex items-end justify-between gap-3">
          <h2 className="font-display text-3xl font-bold tracking-tight">
            Sorteo
          </h2>
          {canManage ? (
            <Button
              type="button"
              data-ocid="sorteo.create_round_button"
              onClick={openCreateRound}
              className="rounded-full"
            >
              <Plus className="size-4" aria-hidden="true" />
              Jornada
            </Button>
          ) : null}
        </div>
        <p className="text-sm text-muted-foreground">
          Elige a mano qué equipos juegan en cada jornada.
        </p>
      </header>

      {isLoading ? (
        <div className="space-y-3" aria-hidden="true">
          {Array.from({ length: 3 }, (_, i) => `skeleton-${i}`).map((id) => (
            <Skeleton key={id} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : rounds.length === 0 ? (
        <div
          data-ocid="sorteo.empty_state"
          className="rounded-lg border border-dashed border-border bg-card px-5 py-10 text-center"
        >
          <CalendarPlus
            className="mx-auto mb-3 size-8 text-muted-foreground"
            aria-hidden="true"
          />
          <h3 className="font-display text-lg font-semibold">
            Aún no hay jornadas
          </h3>
          <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
            {canManage
              ? "Crea la primera jornada y añade los partidos que quieras."
              : "El administrador todavía no ha creado ninguna jornada."}
          </p>
          {canManage ? (
            <Button
              type="button"
              data-ocid="sorteo.empty_create_button"
              onClick={openCreateRound}
              className="mt-4 rounded-full"
            >
              <Plus className="size-4" aria-hidden="true" />
              Crear jornada
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="space-y-6">
          {rounds.map((round, roundIndex) => (
            <section
              key={round.id.toString()}
              data-ocid={`sorteo.round.${roundIndex}`}
              className="space-y-3"
            >
              <div className="flex items-center justify-between gap-2 border-b border-border pb-2">
                <div className="min-w-0">
                  <p className="label-programme text-muted-foreground">
                    {formatMatchdayDate(round.createdAt)}
                  </p>
                  <h3 className="truncate font-display text-xl font-bold">
                    {round.name}
                  </h3>
                </div>
                {canManage ? (
                  <button
                    type="button"
                    data-ocid={`sorteo.round.delete_button.${roundIndex}`}
                    onClick={() => handleDeleteRound(round)}
                    aria-label={`Eliminar jornada ${round.name}`}
                    className="inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-border text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </button>
                ) : null}
              </div>

              {round.matches.length === 0 ? (
                <p
                  data-ocid={`sorteo.round.empty_state.${roundIndex}`}
                  className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground"
                >
                  Sin partidos todavía.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {round.matches.map((match, matchIndex) => (
                    <MatchCard
                      key={match.id.toString()}
                      match={match}
                      teams={teamList}
                      index={matchIndex}
                      canManage={canManage}
                      onEdit={(m) => openMatch("edit", round, m)}
                      onDelete={handleDeleteMatch}
                      onResult={(m) => openMatch("result", round, m)}
                    />
                  ))}
                </div>
              )}

              {canManage ? (
                <Button
                  type="button"
                  variant="outline"
                  data-ocid={`sorteo.round.add_match_button.${roundIndex}`}
                  onClick={() => openMatch("create", round, null)}
                  disabled={teamList.length < 2}
                  className={cn("w-full rounded-full")}
                >
                  <Plus className="size-4" aria-hidden="true" />
                  Añadir partido
                </Button>
              ) : null}
            </section>
          ))}
        </div>
      )}

      {/* Create round dialog */}
      <Dialog
        open={dialog.kind === "create-round"}
        onOpenChange={(next) => !next && closeDialog()}
      >
        <DialogContent data-ocid="sorteo.round.dialog" className="rounded-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Nueva jornada</DialogTitle>
            <DialogDescription>
              Ponle un nombre a la jornada, por ejemplo «Jornada 1».
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateRound} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="round-name">Nombre de la jornada</Label>
              <Input
                id="round-name"
                data-ocid="sorteo.round.name_input"
                value={roundName}
                onChange={(event) => setRoundName(event.target.value)}
                placeholder="Jornada 1"
                autoFocus
              />
            </div>
            {formError ? (
              <p
                data-ocid="sorteo.round.form_error"
                className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {formError}
              </p>
            ) : null}
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                data-ocid="sorteo.round.cancel_button"
                onClick={closeDialog}
                className="rounded-full"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                data-ocid="sorteo.round.submit_button"
                disabled={roundName.trim() === "" || createMatchday.isPending}
                className="rounded-full"
              >
                {createMatchday.isPending ? "Creando…" : "Crear jornada"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Match create / edit / result dialog */}
      {dialog.kind === "match" ? (
        <MatchFormDialog
          open
          mode={dialog.mode}
          matchdayName={dialog.matchday.name}
          teams={teamList}
          roundMatches={dialog.matchday.matches}
          match={dialog.match}
          isPending={isPending}
          errorMessage={formError}
          onClose={closeDialog}
          onSubmit={handleMatchSubmit}
        />
      ) : null}
    </section>
  );
}
