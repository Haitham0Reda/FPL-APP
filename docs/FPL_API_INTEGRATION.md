# FPL API Integration Guide

## Overview

This app integrates with the official Fantasy Premier League API (`https://fantasy.premierleague.com/api/`) for the 2026-27 season. The API is unofficial, has no SLA, and can change slightly between seasons.

## Critical Requirements

### 1. User-Agent Header (REQUIRED)

The FPL servers **frequently return 403 errors** for requests without a realistic browser User-Agent. Our client automatically includes:

```
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36
```

**Do not remove this header** — it's essential for API access.

### 2. CORS Limitations

- **Native mobile (iOS/Android)**: No CORS issues — direct API calls work fine
- **Web deployments**: Will hit CORS errors because the API doesn't send `Access-Control-Allow-Origin` headers
- **Solution for web**: Implement a backend proxy (Node.js, Cloudflare Worker, AWS Lambda) that forwards requests

### 3. Rate Limiting & Caching

The API has no documented rate limits but can be under heavy load:
- Around deadlines (gameweek deadlines, price change windows at ~1:30 AM GMT)
- During live matches
- At season start

**Our caching strategy:**
- `bootstrap-static`: Cache for 5+ minutes, refresh on app launch or pull-to-refresh
- `fixtures`: Cache for 1 hour, refresh on demand
- `live`: Cache for 30-60 seconds during matches
- `manager picks`: Cache per gameweek, rarely changes after deadline

## Key Endpoints

### 1. `/bootstrap-static/` (PRIMARY DATA SOURCE)

**What it contains:**
- All players (`elements`) with prices, form, ownership, xG/xA, status, news
- All teams with FDR (fixture difficulty) ratings
- All gameweeks (`events`) with deadlines, status
- Position types (`element_types`): GK, DEF, MID, FWD
- Game settings (budget, squad rules, chip info)

**When to fetch:**
- App launch
- Pull-to-refresh
- Every 5-10 minutes during price-change windows (1:00-2:00 AM GMT)
- After gameweek deadline passes

**Response size:** ~2-3 MB (gzipped ~200-300 KB)

**Critical fields:**
```typescript
players (elements):
  - now_cost: price in tenths (95 = £9.5m)
  - status: "a" (available), "d" (doubtful), "i" (injured), "u" (unavailable), "s" (suspended)
  - chance_of_playing_this_round: 0-100 or null
  - news: injury/suspension text
  - form: recent avg points per match
  - selected_by_percent: ownership %
  - expected_goals, expected_assists, expected_goal_involvements (as strings)
  - element_type: 1=GK, 2=DEF, 3=MID, 4=FWD
  - team: FPL team ID

events (gameweeks):
  - deadline_time: ISO timestamp
  - is_current, is_next: boolean flags
  - finished: boolean
```

### 2. `/fixtures/` or `/fixtures/?event=N`

**What it contains:**
- All fixtures (or filtered by gameweek)
- Scores, kickoff times, difficulty ratings
- Live stats during matches (goals, assists, bonus)

**When to fetch:**
- When viewing fixtures screen
- Every 1-5 minutes during live matches

### 3. `/event/{gameweek}/live/`

**What it contains:**
- Live points breakdown for all players in a specific gameweek
- Detailed stats: minutes, goals, assists, bonus, BPS, xG, etc.
- Explains point calculations per fixture

**When to fetch:**
- During live matches (poll every 30-60 seconds)
- After matches finish (to see final bonus points)

**Note:** Bonus points are provisional until matches finish and BPS is finalized.

### 4. `/entry/{managerId}/`

**What it contains:**
- Manager profile (name, region, favorite team)
- Overall points and rank
- Current gameweek points and rank
- Leagues (classic, H2H, cups)

**When to fetch:**
- When viewing manager profile
- After gameweek finishes (to see updated ranks)

### 5. `/entry/{managerId}/event/{gameweek}/picks/`

**What it contains:**
- Manager's 15 picks for that gameweek
- Captain/vice-captain selection
- Bench order
- Active chip (wildcard, free hit, bench boost, triple captain)
- Points breakdown, bank, team value

**When to fetch:**
- When viewing manager's team
- After deadline (picks are locked)

**Note:** Picks before deadline may not be visible for other managers (privacy setting dependent).

### 6. `/element-summary/{playerId}/`

**What it contains:**
- Player's match history (all past gameweeks this season)
- Past season summaries
- Upcoming fixtures with difficulty ratings

**When to fetch:**
- When viewing player detail screen
- Cache per player, refresh daily or on demand

## Season Transitions

**Pre-season (July/August):**
1. New `bootstrap-static` data becomes available (usually mid-July)
2. Prices may not be final until closer to GW1 deadline
3. Promoted/relegated teams appear
4. New players added, departed players removed

**Monitor these community resources:**
- GitHub repos that mirror/archive bootstrap data
- FPL subreddit announcements
- Twitter/X accounts that track API changes

**Our app should:**
- Show a "Pre-season - prices not final" banner if before GW1
- Gracefully handle missing/null fields during transition
- Cache last season's data as fallback if new season not yet live

## Error Handling

**Common errors:**
- `403 Forbidden`: Usually missing/bad User-Agent → Check headers
- `503 Service Unavailable`: API under heavy load → Retry with exponential backoff
- `404 Not Found`: Invalid manager ID or player ID
- Timeout: Network issues or slow API → Show cached data + offline banner

**Our retry strategy (see `queryClient.ts`):**
- Don't retry 4xx errors (client errors)
- Retry 5xx errors up to 3 times with exponential backoff
- Max backoff: 30 seconds

## Data Freshness

| Endpoint | Typical Refresh | During Matches |
|----------|----------------|----------------|
| `bootstrap-static` | 5-10 min | 15-30 min |
| `fixtures` | 1 hour | 1-5 min |
| `live` | N/A | 30-60 sec |
| `manager entry` | On demand | N/A |
| `manager picks` | Once per GW | N/A |
| `player summary` | Daily | N/A |

## Attribution & Terms

This is a **non-commercial** app using publicly available FPL data. The official API has no documented terms of service for community apps, but best practices:

1. Don't claim affiliation with Premier League or FPL
2. Don't monetize the data directly
3. Respect server load (cache aggressively, don't spam requests)
4. Attribute data source: "Data provided by Fantasy Premier League"

## Testing & Monitoring

**Pre-season checklist:**
1. Check if `bootstrap-static` has new season data
2. Verify player prices, teams, gameweeks load correctly
3. Test with previous season's manager IDs (should return 404 or old data)
4. Confirm User-Agent still works (403s indicate blocking)

**During season:**
1. Monitor API response times (add telemetry if needed)
2. Track 5xx error rates (spike = API issues)
3. Verify live data updates during matches
4. Check bonus points finalize after matches

## Community Resources

**TypeScript/Node wrappers:**
- `fantasy-premier-league-api` (npm)
- `fpl-api` (npm)
- Various GraphQL wrappers

**Documentation:**
- https://github.com/vaastav/Fantasy-Premier-League (historical data)
- https://fplreview.com/ (API endpoints reference)
- Reddit: r/FantasyPL (community discussions)

**Data archives:**
- Many community members mirror `bootstrap-static` to GitHub
- Useful for comparing season-to-season changes

## Implementation Checklist

- [x] User-Agent header added to all requests
- [x] TypeScript types for all endpoints (`fpl-api.ts`)
- [x] TanStack Query caching with appropriate stale times
- [x] Exponential backoff retry logic
- [ ] Offline mode with cached data fallback
- [ ] Pre-season banner for unfinalized data
- [ ] Backend proxy for web deployment (if needed)
- [ ] Telemetry/monitoring for API health
- [ ] Price change window detection & alerts
- [ ] Graceful error messages for users

## Notes

- **This API is unofficial and can change without notice**
- **No SLA or support from Premier League/FPL**
- **Community goodwill depends on responsible usage**
- **Always test thoroughly before each new season**
