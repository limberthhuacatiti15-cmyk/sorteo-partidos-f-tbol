import { createActor } from "@/backend";
import type {
  ApprovalStatus,
  Match,
  MatchInput,
  Matchday,
  MatchdayId,
  MatchdayView,
  Team,
  TeamId,
  TeamInput,
  UserRole,
} from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const queryKeys = {
  teams: ["teams"] as const,
  matchdays: ["matchdays"] as const,
  approvals: ["approvals"] as const,
  isApproved: ["isCallerApproved"] as const,
  isAdmin: ["isCallerAdmin"] as const,
};

/* ------------------------------------------------------------------ */
/* Access control                                                      */
/* ------------------------------------------------------------------ */

export function useIsCallerApproved() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: queryKeys.isApproved,
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerApproved();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: queryKeys.isAdmin,
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRequestApproval() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("El backend no está listo");
      return actor.requestApproval();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.approvals });
      void queryClient.invalidateQueries({ queryKey: queryKeys.isApproved });
    },
  });
}

export function useAssignUserRole() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      user,
      role,
    }: {
      user: Principal;
      role: UserRole;
    }) => {
      if (!actor) throw new Error("El backend no está listo");
      return actor.assignCallerUserRole(user, role);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.approvals });
      void queryClient.invalidateQueries({ queryKey: queryKeys.isAdmin });
    },
  });
}

export function useListApprovals() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: queryKeys.approvals,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listApprovals();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetApproval() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      user,
      status,
    }: {
      user: Principal;
      status: ApprovalStatus;
    }) => {
      if (!actor) throw new Error("El backend no está listo");
      return actor.setApproval(user, status);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.approvals });
    },
  });
}

export function useRemoveApproval() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error("El backend no está listo");
      return actor.removeApproval(user);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.approvals });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Teams                                                               */
/* ------------------------------------------------------------------ */

export function useTeams() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: queryKeys.teams,
    queryFn: async (): Promise<Team[]> => {
      if (!actor) return [];
      return actor.listTeams();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateTeam() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: TeamInput) => {
      if (!actor) throw new Error("El backend no está listo");
      return actor.createTeam(input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.teams });
    },
  });
}

export function useUpdateTeam() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: TeamId; input: TeamInput }) => {
      if (!actor) throw new Error("El backend no está listo");
      return actor.updateTeam(id, input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.teams });
      void queryClient.invalidateQueries({ queryKey: queryKeys.matchdays });
    },
  });
}

export function useDeleteTeam() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: TeamId) => {
      if (!actor) throw new Error("El backend no está listo");
      return actor.deleteTeam(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.teams });
      void queryClient.invalidateQueries({ queryKey: queryKeys.matchdays });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Matchdays & matches                                                 */
/* ------------------------------------------------------------------ */

export function useMatchdays() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: queryKeys.matchdays,
    queryFn: async (): Promise<MatchdayView[]> => {
      if (!actor) return [];
      return actor.listMatchdays();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateMatchday() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string): Promise<Matchday> => {
      if (!actor) throw new Error("El backend no está listo");
      return actor.createMatchday(name);
    },
    onSuccess: (created) => {
      // `listMatchdays` is a query call, so a refetch right after the update can
      // still read a replica that has not applied the write. Insert the round we
      // just created so it shows immediately, then reconcile with the backend.
      queryClient.setQueryData<MatchdayView[]>(
        queryKeys.matchdays,
        (current) => {
          const view: MatchdayView = {
            id: created.id,
            name: created.name,
            createdAt: created.createdAt,
            matches: [],
          };
          const existing = current ?? [];
          if (existing.some((round) => round.id === view.id)) return existing;
          return [...existing, view].sort((a, b) =>
            a.id < b.id ? -1 : a.id > b.id ? 1 : 0,
          );
        },
      );
      void queryClient.invalidateQueries({ queryKey: queryKeys.matchdays });
    },
  });
}

export function useDeleteMatchday() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: MatchdayId) => {
      if (!actor) throw new Error("El backend no está listo");
      return actor.deleteMatchday(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.matchdays });
    },
  });
}

/**
 * `listMatchdays` is a query call, so a refetch right after a write can still
 * read a replica that has not applied it. Patch the cached rounds with the
 * value the write returned so the change shows immediately, then reconcile.
 */
function patchMatchdays(
  queryClient: ReturnType<typeof useQueryClient>,
  update: (rounds: MatchdayView[]) => MatchdayView[],
) {
  queryClient.setQueryData<MatchdayView[]>(queryKeys.matchdays, (current) =>
    update(current ?? []),
  );
  void queryClient.invalidateQueries({ queryKey: queryKeys.matchdays });
}

function upsertMatch(rounds: MatchdayView[], match: Match): MatchdayView[] {
  return rounds.map((round) => {
    if (round.id !== match.matchdayId) return round;
    const others = round.matches.filter((m) => m.id !== match.id);
    const matches = [...others, match].sort((a, b) =>
      a.id < b.id ? -1 : a.id > b.id ? 1 : 0,
    );
    return { ...round, matches };
  });
}

export function useAddMatch() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      matchdayId,
      input,
    }: {
      matchdayId: MatchdayId;
      input: MatchInput;
    }) => {
      if (!actor) throw new Error("El backend no está listo");
      return actor.addMatch(matchdayId, input);
    },
    onSuccess: (result) => {
      if (result.__kind__ !== "ok") return;
      patchMatchdays(queryClient, (rounds) => upsertMatch(rounds, result.ok));
    },
  });
}

export function useUpdateMatch() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: bigint; input: MatchInput }) => {
      if (!actor) throw new Error("El backend no está listo");
      return actor.updateMatch(id, input);
    },
    onSuccess: (result) => {
      if (result.__kind__ !== "ok") return;
      patchMatchdays(queryClient, (rounds) => upsertMatch(rounds, result.ok));
    },
  });
}

export function useDeleteMatch() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("El backend no está listo");
      return actor.deleteMatch(id);
    },
    onSuccess: (_deleted, id) => {
      patchMatchdays(queryClient, (rounds) =>
        rounds.map((round) => ({
          ...round,
          matches: round.matches.filter((m) => m.id !== id),
        })),
      );
    },
  });
}

export function useSetMatchResult() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      matchId,
      homeScore,
      awayScore,
    }: {
      matchId: bigint;
      homeScore: bigint;
      awayScore: bigint;
    }): Promise<Match | null> => {
      if (!actor) throw new Error("El backend no está listo");
      return actor.setMatchResult(matchId, homeScore, awayScore);
    },
    onSuccess: (updated) => {
      if (!updated) return;
      patchMatchdays(queryClient, (rounds) => upsertMatch(rounds, updated));
    },
  });
}
