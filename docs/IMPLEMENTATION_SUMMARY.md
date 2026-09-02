# FPL API Integration - Implementation Summary

## What We've Implemented

### ✅ Critical Requirements

1. **User-Agent Header (REQUIRED)**
   - Added to `src/data/fpl/client.ts` in the `fplFetch()` function
   - Uses Chrome 120 User-Agent to prevent 403 blocks
   - **DO NOT REMOVE** - essential for API access

2. **Type Safety**
   - Complete TypeScript types for all FPL API responses in `src/types/fpl-api.ts`
   - Covers: bootstrap-static, fixtures, live data, manager entries, picks, player summaries
   - All ~150+ fields documented based on community API specs

3. **Smart Caching Strategy**
   - TanStack Query configured in `src/app/queryClient.ts`
   - Bootstrap-static: 5 min stale time (primary data source)
   - Exponential backoff retry (up to 3 attempts)
   - Offline-first mode
   - Don't retry 4xx errors (client-side issues)

4. **Convenience Hooks**
   - `useFplBootstrap()` - Main hook for bootstrap data
   - `useCurrentGameweek()` - Get current GW info
   - `useNextGameweek()` - Get next GW info
   - `useFplPlayers()` - Get all players
   - `useFplTeams()` - Get all teams

5. **Price Change Monitoring**
   - `src/services/priceChangeMonitor.ts`
   - Detects 1:00-2:00 AM GMT price window
   - Callbacks for entering/exiting window
   - Can trigger more frequent polling during price changes

### 📁 New Files Created

```
src/types/fpl-api.ts                    - TypeScript types for FPL API
src/hooks/useFplBootstrap.ts            - React hooks for bootstrap data
src/hooks/README.md                     - Hooks documentation
src/services/priceChangeMonitor.ts      - Price window detection
docs/FPL_API_INTEGRATION.md             - Comprehensive integration guide
docs/IMPLEMENTATION_SUMMARY.md          - This file
```

### 🔧 Modified Files

```
src/data/fpl/client.ts                  - Added User-Agent, proper types, new endpoints
src/app/queryClient.ts                  - Updated comments with refresh strategy
```

## How to Use

### Basic Bootstrap Data Access

```tsx
import { useFplBootstrap } from '@/hooks/useFplBootstrap';

function MyComponent() {
  const { data, isLoading, error, refetch } = useFplBootstrap();
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorBanner error={error} />;
  
  const players = data.elements;
  const teams = data.teams;
  const currentGW = data.events.find(e => e.is_current);
  
  return <PlayerList players={players} />;
}
```

### Current Gameweek

```tsx
import { useCurrentGameweek } from '@/hooks/useFplBootstrap';

function DeadlineCounter() {
  const { gameweek, isLoading } = useCurrentGameweek();
  
  if (!gameweek) return null;
  
  return <Countdown deadline={gameweek.deadline_time} />;
}
```

### Price Change Monitoring

```tsx
import { useEffect } from 'react';
import { createPriceChangeMonitor } from '@/services/priceChangeMonitor';
import { queryClient } from '@/app/queryClient';
import { fplQueryKeys } from '@/data/fpl/client';

function App() {
  useEffect(() => {
    const monitor = createPriceChangeMonitor({
      onPriceWindow: () => {
        // Poll more frequently during price window
        queryClient.invalidateQueries(fplQueryKeys.bootstrap());
      },
      onExitPriceWindow: () => {
        // Return to normal polling
        console.log('Price window ended');
      },
    });
    
    monitor.start();
    return () => monitor.stop();
  }, []);
  
  return <YourApp />;
}
```

### Direct API Calls

```tsx
import { fplApi } from '@/data/fpl/client';

// In a query or mutation
const fetchPlayerSummary = async (playerId: number) => {
  const summary = await fplApi.playerSummary(playerId);
  return summary;
};
```

## What's NOT Implemented (TODO)

- [ ] Backend proxy for web deployment (needed for CORS)
- [ ] Offline mode UI (banner, cached data fallback)
- [ ] Pre-season banner for unfinalized prices
- [ ] Telemetry/monitoring for API health tracking
- [ ] Remaining TanStack Query hooks:
  - [ ] `useFplFixtures(gameweek?)`
  - [ ] `useFplLive(gameweek)`
  - [ ] `useManagerTeam(teamId)`
  - [ ] `useManagerPicks(teamId, gameweek)`
  - [ ] `usePlayerDetail(playerId)`
- [ ] Price rise/fall calculations from bootstrap data
- [ ] Minutes risk calculation (from chance_of_playing, recent minutes)
- [ ] Status badge mapping (injury/suspension UI)

## Testing Checklist

### Pre-Season (July/August)
- [ ] Verify `bootstrap-static` returns new season data
- [ ] Check player prices are finalized (or show pre-season banner)
- [ ] Confirm promoted/relegated teams appear correctly
- [ ] Test with invalid manager IDs (should 404)

### During Season
- [ ] Monitor API response times (add telemetry)
- [ ] Track 5xx error rates
- [ ] Verify live data updates during matches
- [ ] Check bonus points finalize after matches
- [ ] Test price change detection (1:30 AM GMT)

### Edge Cases
- [ ] No internet connection (offline mode)
- [ ] API returns 403 (User-Agent issue)
- [ ] API returns 503 (server overload during deadline)
- [ ] Expired/invalid manager team ID
- [ ] Bootstrap data missing fields (pre-season)

## Key Resources

- **Official API**: https://fantasy.premierleague.com/api/
- **Community Docs**: https://github.com/vaastav/Fantasy-Premier-League
- **FPL Review**: https://fplreview.com/
- **Reddit**: r/FantasyPL

## Notes

- This is a **non-commercial** app
- The API is **unofficial** with no SLA
- **User-Agent is critical** - don't remove it
- **Cache aggressively** - respect server load
- **Test before each season** - API shape can change slightly
- **Native mobile** = no CORS issues
- **Web deployment** = needs backend proxy

## Questions?

See `docs/FPL_API_INTEGRATION.md` for comprehensive guide covering:
- All endpoint details and response schemas
- Refresh strategies per endpoint
- Error handling patterns
- Season transition handling
- Community resources
