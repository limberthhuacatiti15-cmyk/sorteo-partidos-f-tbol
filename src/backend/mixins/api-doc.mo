mixin () {
  public query func getApiDoc() : async Text {
    "## Sorteo de Partidos de Fútbol — API del backend\n\n" #
    "Este canister gestiona un sorteo de partidos de fútbol decidido manualmente por el administrador. " #
    "El administrador crea equipos, crea jornadas (rondas) y asigna a mano qué equipo local juega contra qué equipo visitante en cada jornada. " #
    "También puede registrar el resultado de cada partido.\n\n" #
    "### Autenticación e identidad\n\n" #
    "- Todas las funciones de escritura y las consultas de equipos/jornadas requieren un llamador autenticado (no anónimo). " #
    "El frontend usa Internet Identity y fija un derivation origin publicado en `/.well-known/ii-derivation-origin`. " #
    "Un agente que ya tenga la autorización de Internet Identity del usuario debe derivar el principal correcto contra ese origen (por ejemplo `icp identity link web <name> --app <host>`). " #
    "Esa delegación actúa con la autoridad completa del usuario en esta app hasta que caduque.\n\n" #
    "- El registro de un principal ocurre solo cuando el usuario inicia sesión a través del frontend de la app. " #
    "Un llamador directo por API debe registrarse primero llamando a `_initialize_access_control()` una vez como llamador autenticado. " #
    "El primer principal que lo llama se convierte en `#admin`; los siguientes reciben `#user`. " #
    "Un principal que nunca inició sesión en el frontend está sin registrar aunque pertenezca al dueño de la app, y un principal derivado contra otro origen es distinto del registrado.\n\n" #
    "- Un llamador anónimo o sin registrar recibe un trap en los endpoints protegidos. " #
    "Las consultas de equipos y jornadas comprueban aprobación: un llamador no aprobado recibe el trap `No autorizado: solo usuarios aprobados pueden ver los equipos` (equipos) o `Necesitas aprobación para ver el calendario` (jornadas). " #
    "Las escrituras de equipos y sorteo exigen rol admin y fallan con `No autorizado: solo el administrador puede gestionar los equipos` o `Solo el administrador puede gestionar el sorteo`.\n\n" #
    "### Aprobación de usuarios\n\n" #
    "- `isCallerApproved() : Bool` (query) indica si el llamador está aprobado.\n" #
    "- `requestApproval()` solicita aprobación (el principal anónimo no puede solicitarla).\n" #
    "- `setApproval(user, status)` y `removeApproval(user)` son acciones de administrador.\n" #
    "- `listApprovals()` (query) lista las aprobaciones (administrador).\n\n" #
    "### Roles\n\n" #
    "- `getCallerUserRole() : UserRole` (query) devuelve `#admin`, `#user` o `#guest` (anónimo). Un principal no registrado provoca el trap `User is not registered`.\n" #
    "- `isCallerAdmin() : Bool` (query) indica si el llamador es administrador.\n" #
    "- `assignCallerUserRole(user, role)` asigna un rol; solo un administrador puede hacerlo.\n\n" #
    "### Equipos\n\n" #
    "- `listTeams() : [Team]` (query, requiere aprobación). `Team = { id : Nat; name : Text; color : Text }`.\n" #
    "- `createTeam(input : TeamInput) : Team` (admin). `TeamInput = { name : Text; color : Text }`.\n" #
    "- `updateTeam(id : Nat, input : TeamInput) : ?Team` (admin). Devuelve `null` si el equipo no existe.\n" #
    "- `deleteTeam(id : Nat) : Bool` (admin). Devuelve `false` si el equipo no existe.\n\n" #
    "### Jornadas y partidos\n\n" #
    "- `listMatchdays() : [MatchdayView]` (query, requiere aprobación), ordenado por `id` ascendente. " #
    "`MatchdayView = { id : Nat; name : Text; createdAt : Int; matches : [Match] }`.\n" #
    "- `createMatchday(name : Text) : Matchday` (admin). `createdAt` es la hora del canister en nanosegundos (Int).\n" #
    "- `deleteMatchday(id : Nat) : Bool` (admin). Elimina la jornada y todos sus partidos; `false` si no existe.\n" #
    "- `addMatch(matchdayId : Nat, input : MatchInput) : { #ok : Match; #err : FixtureError }` (admin). " #
    "`MatchInput = { homeTeamId : Nat; awayTeamId : Nat }`.\n" #
    "- `updateMatch(matchId : Nat, input : MatchInput) : { #ok : Match; #err : FixtureError }` (admin).\n" #
    "- `deleteMatch(matchId : Nat) : Bool` (admin).\n" #
    "- `setMatchResult(matchId : Nat, homeScore : Nat, awayScore : Nat) : ?Match` (admin). Marca el partido como `#played`; `null` si no existe.\n\n" #
    "`Match = { id : Nat; matchdayId : Nat; homeTeamId : Nat; awayTeamId : Nat; status : { #scheduled; #played }; homeScore : ?Nat; awayScore : ?Nat }`.\n\n" #
    "`FixtureError` puede ser `#notFound`, `#sameTeam` (local y visitante iguales), `#teamAlreadyInMatchday({ teamId })` (un equipo ya juega en esa jornada), `#unknownTeam({ teamId })` o `#invalidScore`.\n\n" #
    "### Unidades y codificación\n\n" #
    "- Los identificadores y marcadores son `Nat`. `createdAt` es `Int` en nanosegundos desde la época Unix.\n" #
    "- `homeScore`/`awayScore` son `null` hasta que se registra el resultado.\n\n" #
    "### Ciclo de vida y reintentos\n\n" #
    "- Un partido nace `#scheduled` y pasa a `#played` al llamar `setMatchResult`.\n" #
    "- Las escrituras no son idempotentes: `createTeam`, `createMatchday` y `addMatch` crean un registro nuevo en cada llamada, así que reintentar tras un error de red puede duplicar datos. " #
    "`updateTeam`, `updateMatch`, `deleteTeam`, `deleteMatch`, `deleteMatchday` y `setMatchResult` son idempotentes por naturaleza.\n" #
    "- `deleteMatchday` es destructivo: borra también todos los partidos de la jornada.\n\n" #
    "### Consultas OQL\n\n" #
    "`schema()` y `execute()` exponen las tablas `team`, `matchday` y `match` solo para el controlador del canister.";
  };
};
