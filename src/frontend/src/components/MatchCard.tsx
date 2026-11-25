import { type Match, MatchStatus, type Team } from "@/backend";
import { formatScore, teamColor, teamName } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Pencil, Trash2, Trophy } from "lucide-react";

interface MatchCardProps {
  match: Match;
  teams: Team[];
  index: number;
  canManage: boolean;
  onEdit: (match: Match) => void;
  onDelete: (match: Match) => void;
  onResult: (match: Match) => void;
}

function TeamRow({
  name,
  color,
  score,
  isWinner,
  played,
}: {
  name: string;
  color: string;
  score?: bigint;
  isWinner: boolean;
  played: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span
        aria-hidden="true"
        className="size-3 shrink-0 rounded-full ring-1 ring-inset ring-black/10"
        style={{ backgroundColor: color }}
      />
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-sm",
          played && isWinner
            ? "font-semibold text-foreground"
            : "font-medium text-foreground/90",
        )}
      >
        {name}
      </span>
      {played && score !== undefined ? (
        <span
          className={cn(
            "shrink-0 font-mono text-base tabular-nums",
            isWinner ? "font-bold text-foreground" : "text-muted-foreground",
          )}
        >
          {score.toString()}
        </span>
      ) : null}
    </div>
  );
}

export function MatchCard({
  match,
  teams,
  index,
  canManage,
  onEdit,
  onDelete,
  onResult,
}: MatchCardProps) {
  const played = match.status === MatchStatus.played;
  const homeName = teamName(teams, match.homeTeamId);
  const awayName = teamName(teams, match.awayTeamId);
  const homeScore = match.homeScore;
  const awayScore = match.awayScore;
  const homeWins =
    played &&
    homeScore !== undefined &&
    awayScore !== undefined &&
    homeScore > awayScore;
  const awayWins =
    played &&
    homeScore !== undefined &&
    awayScore !== undefined &&
    awayScore > homeScore;

  return (
    <article
      data-ocid={`sorteo.match.item.${index}`}
      className="rounded-lg border border-border bg-card p-3 shadow-subtle"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[0.625rem] font-semibold uppercase tracking-[0.14em]",
            played
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground",
          )}
        >
          {played ? "Jugado" : "Programado"}
        </span>
        <span className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-muted-foreground">
          {played ? formatScore(match) : "Por jugar"}
        </span>
      </div>

      <div className="space-y-1.5">
        <TeamRow
          name={homeName}
          color={teamColor(teams, match.homeTeamId)}
          score={homeScore}
          isWinner={homeWins}
          played={played}
        />
        <TeamRow
          name={awayName}
          color={teamColor(teams, match.awayTeamId)}
          score={awayScore}
          isWinner={awayWins}
          played={played}
        />
      </div>

      {canManage ? (
        <div className="mt-3 flex items-center gap-1.5 border-t border-border pt-2.5">
          <button
            type="button"
            data-ocid={`sorteo.match.result_button.${index}`}
            onClick={() => onResult(match)}
            className="inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-md bg-accent px-2 py-1.5 font-mono text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-accent-foreground transition-colors hover:bg-accent/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Trophy className="size-3.5" aria-hidden="true" />
            {played ? "Marcador" : "Resultado"}
          </button>
          <button
            type="button"
            data-ocid={`sorteo.match.edit_button.${index}`}
            onClick={() => onEdit(match)}
            aria-label={`Editar partido ${homeName} contra ${awayName}`}
            className="inline-flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Pencil className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            data-ocid={`sorteo.match.delete_button.${index}`}
            onClick={() => onDelete(match)}
            aria-label={`Eliminar partido ${homeName} contra ${awayName}`}
            className="inline-flex size-9 items-center justify-center rounded-md border border-border text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </article>
  );
}
