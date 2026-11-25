import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { CalendarDays, LogIn } from "lucide-react";

export function SignInScreen() {
  const { login, isInitializing, isLoggingIn, isLoginError } =
    useInternetIdentity();

  const disabled = isInitializing || isLoggingIn;
  let label = "Entrar con Internet Identity";
  if (isInitializing) label = "Cargando…";
  else if (isLoggingIn) label = "Iniciando sesión…";

  return (
    <section
      data-ocid="auth.panel"
      className="flex min-h-dvh flex-col bg-primary pitch-lines"
    >
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-8 px-6 py-12">
        <div className="space-y-3">
          <span className="inline-flex size-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <CalendarDays className="size-7" aria-hidden="true" />
          </span>
          <p className="label-programme text-primary-foreground/60">
            Sorteo de partidos
          </p>
          <h1 className="font-display text-4xl font-bold leading-none tracking-tight text-primary-foreground">
            Jornada
          </h1>
          <p className="max-w-sm text-sm leading-relaxed text-primary-foreground/75">
            Organiza tus equipos y decide a mano qué juega cada jornada. Entra
            con tu Internet Identity para ver el sorteo.
          </p>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            data-ocid="auth.signin_button"
            disabled={disabled}
            onClick={() => login()}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-accent px-5 font-semibold text-accent-foreground shadow-elevated transition-transform hover:brightness-95 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-primary disabled:opacity-60"
          >
            <LogIn className="size-4" aria-hidden="true" />
            {label}
          </button>
          {isLoginError && (
            <p
              role="alert"
              data-ocid="auth.error_state"
              className="text-sm text-primary-foreground/90"
            >
              No se completó el inicio de sesión. Inténtalo de nuevo.
            </p>
          )}
        </div>
      </div>

      <footer className="mx-auto w-full max-w-md px-6 pb-8 text-center">
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
            typeof window !== "undefined" ? window.location.hostname : "",
          )}`}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-[0.625rem] uppercase tracking-[0.12em] text-primary-foreground/50 transition-colors hover:text-primary-foreground/80"
        >
          © {new Date().getFullYear()}. Built with love using caffeine.ai
        </a>
      </footer>
    </section>
  );
}
