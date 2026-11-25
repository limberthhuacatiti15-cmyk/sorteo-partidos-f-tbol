import { ApprovalStatus, UserRole } from "@/backend";
import type { UserApprovalInfo } from "@/backend";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAssignUserRole,
  useIsCallerAdmin,
  useListApprovals,
  useRemoveApproval,
  useSetApproval,
} from "@/hooks/useQueries";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import {
  Check,
  Clock3,
  ShieldAlert,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { useMemo } from "react";

const statusMeta: Record<ApprovalStatus, { label: string; className: string }> =
  {
    [ApprovalStatus.pending]: {
      label: "Pendiente",
      className: "border-warning/40 bg-warning/15 text-foreground",
    },
    [ApprovalStatus.approved]: {
      label: "Aprobado",
      className: "border-success/40 bg-success/15 text-foreground",
    },
    [ApprovalStatus.rejected]: {
      label: "Rechazado",
      className: "border-destructive/40 bg-destructive/10 text-foreground",
    },
  };

function shortPrincipal(principal: string) {
  if (principal.length <= 16) return principal;
  return `${principal.slice(0, 8)}…${principal.slice(-5)}`;
}

function StatusBadge({ status }: { status: ApprovalStatus }) {
  const meta = statusMeta[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-[0.625rem] font-semibold uppercase tracking-[0.14em] ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}

function RequestCard({
  entry,
  index,
  isSelf,
  isBusy,
  onApprove,
  onReject,
}: {
  entry: UserApprovalInfo;
  index: number;
  isSelf: boolean;
  isBusy: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  const principal = entry.principal.toString();
  return (
    <li
      data-ocid={`admin.request.item.${index}`}
      className="rounded-xl border border-border bg-card p-4 shadow-subtle"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
            <UserRound className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-mono text-sm font-medium text-foreground">
              {shortPrincipal(principal)}
            </p>
            <p className="text-xs text-muted-foreground">
              {isSelf ? "Tú" : "Solicitud de acceso"}
            </p>
          </div>
        </div>
        <StatusBadge status={entry.status} />
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          data-ocid={`admin.approve_button.${index}`}
          disabled={isBusy}
          onClick={onApprove}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60"
        >
          <Check className="size-4" aria-hidden="true" />
          Aprobar
        </button>
        <button
          type="button"
          data-ocid={`admin.reject_button.${index}`}
          disabled={isBusy}
          onClick={onReject}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-md border border-destructive/40 bg-card px-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40 disabled:opacity-60"
        >
          <X className="size-4" aria-hidden="true" />
          Rechazar
        </button>
      </div>
    </li>
  );
}

function MemberCard({
  entry,
  index,
  isSelf,
  isBusy,
  onMakeAdmin,
  onRemove,
}: {
  entry: UserApprovalInfo;
  index: number;
  isSelf: boolean;
  isBusy: boolean;
  onMakeAdmin: () => void;
  onRemove: () => void;
}) {
  const principal = entry.principal.toString();
  return (
    <li
      data-ocid={`admin.member.item.${index}`}
      className="rounded-xl border border-border bg-card p-4 shadow-subtle"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-mono text-sm font-medium text-foreground">
              {shortPrincipal(principal)}
            </p>
            <p className="text-xs text-muted-foreground">
              {isSelf ? "Tú · administrador" : "Miembro aprobado"}
            </p>
          </div>
        </div>
        <StatusBadge status={entry.status} />
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          data-ocid={`admin.make_admin_button.${index}`}
          disabled={isBusy || isSelf}
          onClick={onMakeAdmin}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-md border border-border bg-secondary px-3 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
        >
          <ShieldCheck className="size-4" aria-hidden="true" />
          {isSelf ? "Ya eres admin" : "Hacer admin"}
        </button>
        <button
          type="button"
          data-ocid={`admin.remove_button.${index}`}
          disabled={isBusy || isSelf}
          onClick={onRemove}
          className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-md border border-destructive/40 bg-card px-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40 disabled:opacity-60"
        >
          <X className="size-4" aria-hidden="true" />
          Quitar
        </button>
      </div>
    </li>
  );
}

export default function AdminPage() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: approvals, isLoading: approvalsLoading } = useListApprovals();
  const setApproval = useSetApproval();
  const removeApproval = useRemoveApproval();
  const assignRole = useAssignUserRole();

  const selfPrincipal = identity?.getPrincipal().toString() ?? "";

  const { pending, members } = useMemo(() => {
    const list = approvals ?? [];
    return {
      pending: list.filter((entry) => entry.status === ApprovalStatus.pending),
      members: list.filter((entry) => entry.status === ApprovalStatus.approved),
    };
  }, [approvals]);

  const isBusy =
    setApproval.isPending || removeApproval.isPending || assignRole.isPending;

  if (adminLoading) {
    return (
      <section data-ocid="admin.page" className="space-y-6">
        <div className="space-y-3" aria-hidden="true">
          {Array.from({ length: 3 }, (_, i) => `skeleton-${i}`).map((id) => (
            <Skeleton key={id} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  if (!isAdmin) {
    return (
      <section data-ocid="admin.page" className="space-y-6">
        <header className="space-y-1">
          <p className="label-programme text-muted-foreground">Control</p>
          <h2 className="font-display text-3xl font-bold tracking-tight">
            Administración
          </h2>
        </header>
        <div
          data-ocid="admin.denied_state"
          className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card px-6 py-10 text-center shadow-subtle"
        >
          <span className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <ShieldAlert className="size-7" aria-hidden="true" />
          </span>
          <div className="space-y-2">
            <h3 className="font-display text-xl font-bold tracking-tight">
              Solo para administradores
            </h3>
            <p className="max-w-xs text-sm text-muted-foreground">
              Esta pantalla permite aprobar accesos y nombrar administradores.
              Pide a un administrador que te dé permiso para abrirla.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section data-ocid="admin.page" className="space-y-8">
      <header className="space-y-1">
        <p className="label-programme text-muted-foreground">Control</p>
        <h2 className="font-display text-3xl font-bold tracking-tight">
          Administración
        </h2>
        <p className="text-sm text-muted-foreground">
          Aprueba quién entra y decide quién más puede administrar.
        </p>
      </header>

      {setApproval.isError || removeApproval.isError || assignRole.isError ? (
        <p
          role="alert"
          data-ocid="admin.error_state"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          No se pudo actualizar el acceso. Inténtalo de nuevo.
        </p>
      ) : null}

      <div className="space-y-3">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-lg font-bold tracking-tight">
            Solicitudes
          </h3>
          <span className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
            {pending.length} pendiente{pending.length === 1 ? "" : "s"}
          </span>
        </div>

        {approvalsLoading ? (
          <div className="space-y-3" aria-hidden="true">
            {Array.from({ length: 2 }, (_, i) => `pending-skeleton-${i}`).map(
              (id) => (
                <Skeleton key={id} className="h-28 w-full rounded-xl" />
              ),
            )}
          </div>
        ) : pending.length === 0 ? (
          <div
            data-ocid="admin.requests.empty_state"
            className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card px-6 py-10 text-center"
          >
            <span className="flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <Clock3 className="size-6" aria-hidden="true" />
            </span>
            <div className="space-y-1">
              <p className="font-display text-base font-bold tracking-tight">
                Nadie está esperando
              </p>
              <p className="max-w-xs text-sm text-muted-foreground">
                Cuando alguien pida entrar, su solicitud aparecerá aquí para que
                la apruebes o la rechaces.
              </p>
            </div>
          </div>
        ) : (
          <ul data-ocid="admin.requests.list" className="space-y-3">
            {pending.map((entry, index) => (
              <RequestCard
                key={entry.principal.toString()}
                entry={entry}
                index={index + 1}
                isSelf={entry.principal.toString() === selfPrincipal}
                isBusy={isBusy}
                onApprove={() =>
                  setApproval.mutate({
                    user: entry.principal,
                    status: ApprovalStatus.approved,
                  })
                }
                onReject={() =>
                  setApproval.mutate({
                    user: entry.principal,
                    status: ApprovalStatus.rejected,
                  })
                }
              />
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-lg font-bold tracking-tight">
            Miembros
          </h3>
          <span className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
            {members.length} aprobado{members.length === 1 ? "" : "s"}
          </span>
        </div>

        {approvalsLoading ? (
          <div className="space-y-3" aria-hidden="true">
            {Array.from({ length: 2 }, (_, i) => `member-skeleton-${i}`).map(
              (id) => (
                <Skeleton key={id} className="h-28 w-full rounded-xl" />
              ),
            )}
          </div>
        ) : members.length === 0 ? (
          <div
            data-ocid="admin.members.empty_state"
            className="rounded-xl border border-dashed border-border bg-card px-6 py-8 text-center text-sm text-muted-foreground"
          >
            Todavía no hay miembros aprobados.
          </div>
        ) : (
          <ul data-ocid="admin.members.list" className="space-y-3">
            {members.map((entry, index) => (
              <MemberCard
                key={entry.principal.toString()}
                entry={entry}
                index={index + 1}
                isSelf={entry.principal.toString() === selfPrincipal}
                isBusy={isBusy}
                onMakeAdmin={() =>
                  assignRole.mutate({
                    user: entry.principal,
                    role: UserRole.admin,
                  })
                }
                onRemove={() => removeApproval.mutate(entry.principal)}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
