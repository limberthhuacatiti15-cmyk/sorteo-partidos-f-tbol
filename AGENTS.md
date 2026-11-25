# Project Guidance

## User Preferences

- The administrator decides manually which teams play each other, with no random draw
- Primary use on a mobile phone, so the layout must be phone-first and installable to the home screen
- Interface language is Spanish

## Accepted Requirements

- El administrador decide manualmente qué equipos juegan con qué equipo
- Aplicación usable en celular

## Verified Commands

- **typecheck**: `pnpm typecheck`
- **fix**: `pnpm fix`
- **build**: `pnpm build`

## Learnings

- The app is a football match scheduler: teams plus rounds of manually chosen home/away matches, with scores recorded by the administrator.
- listMatchdays is a Candid query call, so every match mutation must patch the cached matchdays with the returned value before invalidating, or the round reads a stale replica.
- The app gates every route behind sign-in and approval at the root route, with pages SorteoPage, TeamsPage and AdminPage and shared hooks in src/frontend/src/hooks/useQueries.ts.
- The backend composes authorization, user approval, teams and fixtures mixins in src/backend/main.mo with OQL Expose and getApiDoc; the package caffeineai-user-approval must be added with mops add.
