# React Hooks

Custom hooks for the FPL app. Organized by domain:

## FPL Data Hooks

### `useFplBootstrap()`
Primary hook for accessing bootstrap-static data (players, teams, gameweeks).

**Features:**
- Automatic caching (5 min stale time)
- Background refetch on window focus
- Exponential backoff retry
- Offline-first strategy

**Usage:**
```tsx
const { data, isLoading, error, refetch } = useFplBootstrap();
const players = data?.elements ?? [];
const teams = data?.teams ?? [];
```

### `useCurrentGameweek()`
Helper to get the current active gameweek from bootstrap data.

**Usage:**
```tsx
const { gameweek, isLoading } = useCurrentGameweek();
console.log(gameweek?.deadline_time);
```

### `useNextGameweek()`
Helper to get the next upcoming gameweek from bootstrap data.

### `useFplPlayers()`
Helper to get all players from bootstrap data. Returns empty array while loading.

### `useFplTeams()`
Helper to get all teams from bootstrap data. Returns empty array while loading.

---

## Future Hooks (Planned)

### `useFplFixtures(gameweek?)`
Get fixtures for a specific gameweek or all fixtures.

### `useFplLive(gameweek)`
Get live match data for a specific gameweek. Poll frequently during matches.

### `useManagerTeam(teamId)`
Get manager profile and team details.

### `useManagerPicks(teamId, gameweek)`
Get manager's picks for a specific gameweek.

### `usePlayerDetail(playerId)`
Get detailed player info including match history and upcoming fixtures.

---

## State Management Hooks

See `src/state/` for Zustand-based state hooks:
- `useActiveTeam()` - User's selected FPL team
- `useAuth()` - Authentication state
- `useCurrentGameweek()` - Local copy of current gameweek (separate from API hook)

---

## Guidelines

1. **Use TanStack Query for API calls** - Don't fetch directly in components
2. **Return sensible defaults** - Empty arrays, undefined (not null) for optional data
3. **Destructure rest props** - Forward `isLoading`, `error`, etc. to consumers
4. **Document cache strategy** - Explain staleTime, gcTime in JSDoc comments
5. **Name consistently** - `use[Domain][Entity]` (e.g., `useFplPlayers`, `useManagerTeam`)
