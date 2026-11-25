import type { Match, MatchInput, Team } from "@/backend";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";

export type MatchFormMode = "create" | "edit" | "result";

interface MatchFormDialogProps {
  open: boolean;
  mode: MatchFormMode;
  matchdayName: string;
  teams: Team[];
  /** Matches already in this round, used for the duplicate-team warning. */
  roundMatches: Match[];
  /** The match being edited or scored, when applicable. */
  match: Match | null;
  isPending: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onSubmit: (payload: {
    input: MatchInput;
    homeScore: bigint;
    awayScore: bigint;
  }) => void;
}

function teamLabel(teams: Team[], id: string): string {
  return teams.find((team) => team.id.toString() === id)?.name ?? "Equipo";
}

export function MatchFormDialog({
  open,
  mode,
  matchdayName,
  teams,
  roundMatches,
  match,
  isPending,
  errorMessage,
  onClose,
  onSubmit,
}: MatchFormDialogProps) {
  const [homeId, setHomeId] = useState("");
  const [awayId, setAwayId] = useState("");
  const [homeScore, setHomeScore] = useState("0");
  const [awayScore, setAwayScore] = useState("0");

  useEffect(() => {
    if (!open) return;
    if (match) {
      setHomeId(match.homeTeamId.toString());
      setAwayId(match.awayTeamId.toString());
      setHomeScore(match.homeScore?.toString() ?? "0");
      setAwayScore(match.awayScore?.toString() ?? "0");
    } else {
      setHomeId("");
      setAwayId("");
      setHomeScore("0");
      setAwayScore("0");
    }
  }, [open, match]);

  const isResult = mode === "result";
  const sameTeam = homeId !== "" && homeId === awayId;

  const conflictTeamId = (() => {
    if (isResult || homeId === "" || awayId === "") return null;
    const others = roundMatches.filter((m) => m.id !== match?.id);
    const used = new Set<string>();
    for (const m of others) {
      used.add(m.homeTeamId.toString());
      used.add(m.awayTeamId.toString());
    }
    if (used.has(homeId)) return homeId;
    if (used.has(awayId)) return awayId;
    return null;
  })();

  const scoresValid =
    /^\d{1,3}$/.test(homeScore) && /^\d{1,3}$/.test(awayScore);

  const canSubmit = isResult
    ? scoresValid && !isPending
    : homeId !== "" &&
      awayId !== "" &&
      !sameTeam &&
      conflictTeamId === null &&
      !isPending;

  const title =
    mode === "create"
      ? "Nuevo partido"
      : mode === "edit"
        ? "Editar partido"
        : "Marcador final";

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      input: { homeTeamId: BigInt(homeId), awayTeamId: BigInt(awayId) },
      homeScore: BigInt(homeScore),
      awayScore: BigInt(awayScore),
    });
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent data-ocid="sorteo.match.dialog" className="rounded-lg">
        <DialogHeader>
          <DialogTitle className="font-display">{title}</DialogTitle>
          <DialogDescription>
            {isResult
              ? `Marca el resultado de ${teamLabel(teams, homeId)} vs ${teamLabel(teams, awayId)}.`
              : `Jornada ${matchdayName}. Elige a mano los equipos.`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isResult ? (
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="match-home">Equipo local</Label>
                <Select value={homeId} onValueChange={setHomeId}>
                  <SelectTrigger
                    id="match-home"
                    data-ocid="sorteo.match.home_select"
                    className="w-full"
                  >
                    <SelectValue placeholder="Elige el local" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem
                        key={team.id.toString()}
                        value={team.id.toString()}
                      >
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="match-away">Equipo visitante</Label>
                <Select value={awayId} onValueChange={setAwayId}>
                  <SelectTrigger
                    id="match-away"
                    data-ocid="sorteo.match.away_select"
                    className="w-full"
                  >
                    <SelectValue placeholder="Elige el visitante" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem
                        key={team.id.toString()}
                        value={team.id.toString()}
                      >
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : null}

          {sameTeam ? (
            <p
              data-ocid="sorteo.match.same_team_error"
              className="flex items-start gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              <AlertTriangle
                className="mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              Un equipo no puede jugar contra sí mismo.
            </p>
          ) : null}

          {conflictTeamId ? (
            <p
              data-ocid="sorteo.match.conflict_error"
              className="flex items-start gap-2 rounded-md bg-warning/20 px-3 py-2 text-sm text-warning-foreground"
            >
              <AlertTriangle
                className="mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              {teamLabel(teams, conflictTeamId)} ya juega en esta jornada. Elige
              otro equipo.
            </p>
          ) : null}

          {isResult ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="match-home-score">
                  {teamLabel(teams, homeId)}
                </Label>
                <Input
                  id="match-home-score"
                  data-ocid="sorteo.match.home_score_input"
                  inputMode="numeric"
                  value={homeScore}
                  onChange={(event) => setHomeScore(event.target.value)}
                  className="text-center font-mono text-lg"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="match-away-score">
                  {teamLabel(teams, awayId)}
                </Label>
                <Input
                  id="match-away-score"
                  data-ocid="sorteo.match.away_score_input"
                  inputMode="numeric"
                  value={awayScore}
                  onChange={(event) => setAwayScore(event.target.value)}
                  className="text-center font-mono text-lg"
                />
              </div>
            </div>
          ) : null}

          {errorMessage ? (
            <p
              data-ocid="sorteo.match.form_error"
              className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {errorMessage}
            </p>
          ) : null}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              data-ocid="sorteo.match.cancel_button"
              onClick={onClose}
              className="rounded-full"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              data-ocid="sorteo.match.submit_button"
              disabled={!canSubmit}
              className="rounded-full"
            >
              {isPending
                ? "Guardando…"
                : mode === "create"
                  ? "Añadir partido"
                  : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
