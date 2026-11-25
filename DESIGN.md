# Design Brief

## Direction

Matchday Programme — a phone-first football fixture scheduler that reads like a printed club almanac: deep forest ink, bone paper, lime accents.

## Tone

Editorial sports programme: confident, precise, printed-poster restraint rather than glossy SaaS dashboard.

## Differentiation

Every match is a printed fixture line — mono scores, tracked uppercase status stamps, and a colored crest dot — so the draw feels official, not like a form.

## Color Palette

| Token      | OKLCH         | Role                                        |
| ---------- | ------------- | ------------------------------------------- |
| background | 0.965 0.012 95 | Bone paper, main content                    |
| foreground | 0.215 0.035 155 | Forest ink text                            |
| card       | 0.995 0.006 95 | Fixture cards, sheets                      |
| primary    | 0.315 0.062 158 | Header, bottom nav, primary buttons        |
| accent     | 0.875 0.185 118 | Lime: active tab, FAB, highlights          |
| muted      | 0.925 0.018 95 | Secondary surfaces, dividers               |

## Typography

- Display: Bricolage Grotesque — jornada numbers, page titles, team names on hero cards
- Body: Figtree — labels, forms, lists, body copy
- Mono: Geist Mono — scores, kickoff times, status stamps, tracked section labels
- Scale: hero `text-4xl font-bold tracking-tight`, h2 `text-2xl font-bold`, label `label-programme`, body `text-base`

## Elevation & Depth

Bone background with white cards lifted by `shadow-subtle`; only FAB and primary actions use `shadow-elevated`/`shadow-pitch`; no glow.

## Structural Zones

| Zone    | Background                | Border            | Notes                                      |
| ------- | ------------------------- | ----------------- | ------------------------------------------ |
| Header  | `bg-primary` + `pitch-lines` | none            | Cream text, lime status pill, season label |
| Content | `bg-background`           | —                 | Jornada sections alternate `bg-muted/40`   |
| Footer  | `bg-card` fixed bottom nav | `border-t`       | 3 tabs: Sorteo, Equipos, Admin; active lime |

## Spacing & Rhythm

Mobile-first single column, `px-4` gutters, `gap-3` between fixture cards, `gap-6` between jornada groups, generous 16px card padding.

## Component Patterns

- Buttons: `rounded-md` primary forest fill, lime for active/confirm, ghost for secondary; hover darkens, active scales 0.98
- Cards: `rounded-xl` white, 1px `border-border`, `shadow-subtle`, left crest dot per team color
- Badges: pill, mono uppercase — lime "JUGADO" style success, amber "PROGRAMADO", coral destructive for conflicts

## Motion

- Entrance: jornada groups fade-and-rise 12px, 240ms staggered 40ms
- Hover: cards lift to `shadow-elevated`, 200ms
- Decorative: subtle FAB press scale; no looping animation

## Constraints

- Spanish UI copy throughout; phone-first, installable to home screen
- Admin-only controls visually distinct (lime) from read-only fixture view
- Team colors render as crest dots, never as full card backgrounds
- No standings tables or share-actions in this build

## Signature Detail

The fixture card as a printed matchday line: crest dot, team name, mono score or "VS", status stamp — a scoreboard you can read at arm's length.
