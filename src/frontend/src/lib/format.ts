import type { FixtureError, Match, Team } from "@/backend";

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
});

/** Motoko `Time.now()` values are nanosecond bigints; convert before any Date use. */
export function timestampToDate(timestamp: bigint): Date | null {
  const date = new Date(Number(timestamp / 1_000_000n));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatMatchdayDate(timestamp: bigint): string {
  const date = timestampToDate(timestamp);
  if (!date) return "Fecha por confirmar";
  return dateFormatter.format(date).replace(".", "").toUpperCase();
}

export function formatScore(match: Match): string {
  if (match.homeScore === undefined || match.awayScore === undefined) {
    return "VS";
  }
  return `${match.homeScore.toString()} – ${match.awayScore.toString()}`;
}

export function teamName(teams: Team[], teamId: bigint): string {
  return teams.find((team) => team.id === teamId)?.name ?? "Equipo";
}

export function teamColor(teams: Team[], teamId: bigint): string {
  return teams.find((team) => team.id === teamId)?.color ?? "#31543f";
}

/** Human copy for the backend's fixture validation variants. */
export function fixtureErrorMessage(
  error: FixtureError,
  teams: Team[],
): string {
  switch (error.__kind__) {
    case "sameTeam":
      return "Un equipo no puede jugar contra sí mismo.";
    case "teamAlreadyInMatchday":
      return `${teamName(teams, error.teamAlreadyInMatchday.teamId)} ya juega en esta jornada.`;
    case "unknownTeam":
      return "Ese equipo ya no existe. Actualiza la lista e inténtalo de nuevo.";
    case "invalidScore":
      return "El marcador no es válido.";
    case "notFound":
      return "Ese partido ya no existe.";
  }
}

/** Normalize a free-text hex color, falling back to the forest ink default. */
export function normalizeColor(value: string): string {
  const trimmed = value.trim();
  return /^#[0-9a-fA-F]{6}$/.test(trimmed) ? trimmed.toLowerCase() : "#31543f";
}
