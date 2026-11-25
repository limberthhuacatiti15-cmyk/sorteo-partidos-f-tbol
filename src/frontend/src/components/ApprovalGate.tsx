import { useIsCallerApproved, useRequestApproval } from "@/hooks/useQueries";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQueryClient } from "@tanstack/react-query";
import { Clock3, LogOut, ShieldCheck } from "lucide-react";
import { type ReactNode, useEffect } from "react";

function SignOutButton({ className }: { className?: string }) {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  return (
    <button
      type="button"
      data-ocid="auth.signout_button"
      onClick={() => {
        void queryClient.cancelQueries();
        queryClient.clear();
        clear();
      }}
      className={className}
    >
      <LogOut className="size-4" aria-hidden="true" />
      Cerrar sesión
    </button>
  );
}

function PendingAccess() {
  const requestApproval = useRequestApproval();
  return (
    <section
      data-ocid="access.pending_state"
      className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-background px-6 text-center"
    >
      <span className="flex size-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
        <Clock3 className="size-7" aria-hidden="true" />
      </span>
      <div className="space-y-2">
        <p className="label-programme text-muted-foreground">
          Acceso pendiente
        </p>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Tu cuenta espera aprobación
        </h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          El administrador debe aprobar tu acceso antes de que puedas ver el
          sorteo y los equipos.
        </p>
      </div>

      {requestApproval.isSuccess ? (
        <p
          data-ocid="access.success_state"
          className="rounded-md border border-success/40 bg-success/10 px-4 py-3 text-sm text-foreground"
        >
          Solicitud enviada. Te avisaremos cuando el administrador la apruebe.
        </p>
      ) : (
        <button
          type="button"
          data-ocid="access.request_button"
          disabled={requestApproval.isPending}
          onClick={() => requestApproval.mutate()}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60"
        >
          <ShieldCheck className="size-4" aria-hidden="true" />
          {requestApproval.isPending ? "Enviando…" : "Solicitar acceso"}
        </button>
      )}

      {requestApproval.isError && (
        <p
          role="alert"
          data-ocid="access.error_state"
          className="text-sm text-destructive"
        >
          No se pudo enviar la solicitud. Inténtalo de nuevo.
        </p>
      )}

      <SignOutButton className="inline-flex min-h-11 items-center gap-2 rounded-md px-4 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
    </section>
  );
}

/**
 * Approval gate: only approved members (or admins) reach the app shell.
 * Mounted inside the signed-in subtree so no private query runs while signed out.
 */
export function ApprovalGate({ children }: { children: ReactNode }) {
  const { data: isApproved, isLoading } = useIsCallerApproved();

  useEffect(() => {
    document.title = "Jornada — Sorteo de partidos";
  }, []);

  if (isLoading) {
    return (
      <output
        data-ocid="access.loading_state"
        className="flex min-h-dvh items-center justify-center bg-background font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground"
      >
        Comprobando acceso…
      </output>
    );
  }

  if (!isApproved) {
    return <PendingAccess />;
  }

  return <>{children}</>;
}
