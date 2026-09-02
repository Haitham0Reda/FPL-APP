# FPL API Integration - Quick Start

## TL;DR

We've integrated the official Fantasy Premier League API with proper types, caching, and error handling. Everything you need is ready to use.

## 🚀 Start Using It Now

### 1. Get All Players

```tsx
import { useFplBootstrap } from '@/hooks/useFplBootstrap';

function PlayerList() {
  const { data, isLoading } = useFplBootstrap();
  
  if (isLoading) return <Text>Loading...</Text>;
  
  const players = data?.elements ?? [];
  
  return players.map(player => (
    <Text key={player.id}>
      {player.web_name} - £{player.now_cost / 10}m
    </Text>
  ));
}
```

### 2. Show Current Gameweek Deadline

```tsx
import { useCurrentGameweek } from '@/hooks/useFplBootstrap';

function DeadlineTimer() {
  const { gameweek } = useCurrentGameweek();
  
  if (!gameweek) return null;
  
  return <Text>Deadline: {gameweek.deadline_time}</Text>;
}
```

### 3. Get Live Match Data

```tsx
import { useQuery } from '@tanstack/react-query';
import { fplApi, fplQueryKeys } from '@/data/fpl/client';

function LiveScores({ gameweek }: { gameweek: number }) {
  const { data } = useQuery({
    queryKey: fplQueryKeys.liveGameweek(gameweek),
    queryFn: () => fplApi.live(gameweek),
    refetchInterval: 60_000, // Poll every minute during matches
  });
  
  return <Text>Live data: {data?.elements.length} players</Text>;
}
```

## 📚 Key Files

| File | Purpose |
|------|---------|
| `src/types/fpl-api.ts` | TypeScript types for all API responses |
| `src/data/fpl/client.ts` | API client with User-Agent header |
| `src/hooks/useFplBootstrap.ts` | React hooks for bootstrap data |
| `src/services/priceChangeMonitor.ts` | Price change window detection |
| `docs/FPL_API_INTEGRATION.md` | Full documentation |

## ⚠️ Critical: User-Agent Required

The API requires a browser-like User-Agent header or it returns 403. This is already configured in `src/data/fpl/client.ts`:

```typescript
"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)..."
```

**DO NOT REMOVE THIS HEADER** - it's essential for API access.

## 🔄 Refresh Strategy

| Data Type | Stale Time | When to Refresh |
|-----------|------------|-----------------|
| Bootstrap | 5 minutes | App launch, pull-to-refresh, price windows |
| Fixtures | 1 hour | On demand, during matches (1-5 min) |
| Live | 30-60 sec | During matches only |
| Manager | On demand | When viewing profile |

## 🌐 CORS Warning

- ✅ **Native mobile (iOS/Android)**: Works perfectly, no issues
- ❌ **Web browser**: Will hit CORS errors - needs backend proxy

## 📦 Available Endpoints

```typescript
fplApi.bootstrap()                    // All players, teams, gameweeks
fplApi.fixtures(gameweek?)           // All fixtures or by GW
fplApi.live(gameweek)                // Live match data
fplApi.manager(teamId)               // Manager profile
fplApi.managerPicks(teamId, gw)      // Manager's team for GW
fplApi.playerSummary(playerId)       // Player history & fixtures
```

## 🎣 Available Hooks

```typescript
useFplBootstrap()      // Main data hook
useCurrentGameweek()   // Current GW
useNextGameweek()      // Next GW
useFplPlayers()        // All players
useFplTeams()          // All teams
```

## 🐛 Common Issues

### "403 Forbidden"
- **Cause**: Missing or invalid User-Agent header
- **Fix**: Already configured in client.ts, don't modify

### "CORS error" (web only)
- **Cause**: Browser security, API doesn't allow cross-origin requests
- **Fix**: Use a backend proxy for web deployment

### "503 Service Unavailable"
- **Cause**: FPL servers overloaded (common near deadlines)
- **Fix**: Automatic retry with exponential backoff (already configured)

### Stale data
- **Cause**: Cached response still fresh
- **Fix**: Call `refetch()` or invalidate query manually

## 🧪 Test Your Integration

```tsx
// Simple test component
function TestAPI() {
  const { data, isLoading, error } = useFplBootstrap();
  
  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;
  if (!data) return <Text>No data</Text>;
  
  return (
    <View>
      <Text>✅ API Working!</Text>
      <Text>Players: {data.elements.length}</Text>
      <Text>Teams: {data.teams.length}</Text>
      <Text>Gameweeks: {data.events.length}</Text>
    </View>
  );
}
```

## 📖 Next Steps

1. **Build screens** using the hooks
2. **Add offline mode** with cached data fallback
3. **Monitor price changes** with `priceChangeMonitor`
4. **Add telemetry** to track API performance
5. **Test before 2026-27 season** when new data goes live

## 💡 Pro Tips

- Bootstrap data is **cached for 5 minutes** - perfect balance
- **Don't spam the API** - use the built-in caching
- **Poll live data only during matches** - save bandwidth
- **Cache aggressively** - respect FPL servers
- **Test in pre-season** - API shape can change slightly

## 🆘 Need Help?

See the full guide: `docs/FPL_API_INTEGRATION.md`

Or check the implementation summary: `docs/IMPLEMENTATION_SUMMARY.md`
