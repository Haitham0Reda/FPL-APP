#!/usr/bin/env node

/**
 * scripts/verifyFplApi.js
 *
 * Standalone verification script that hits each real FPL API endpoint
 * and asserts the response has the fields the app depends on.
 */

const BASE_URL = 'https://fantasy.premierleague.com/api';

async function fplFetch(path) {
  const url = `${BASE_URL}${path}`;
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'EliteFPL-Verify/1.0',
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

async function verifyBootstrap() {
  console.log('\n=== Verifying /bootstrap-static/ ===');
  const data = await fplFetch('/bootstrap-static/');

  const checks = [
    { field: 'elements', test: () => Array.isArray(data.elements) && data.elements.length > 0 },
    { field: 'teams', test: () => Array.isArray(data.teams) && data.teams.length > 0 },
    { field: 'events', test: () => Array.isArray(data.events) && data.events.length > 0 },
    { field: 'element_types', test: () => Array.isArray(data.element_types) && data.element_types.length > 0 },
  ];

  let passed = 0;
  checks.forEach(check => {
    const result = check.test();
    console.log(`  ${result ? '✓' : '✗'} ${check.field}: ${result ? 'present' : 'MISSING'}`);
    if (result) passed++;
  });

  if (data.elements.length > 0) {
    const player = data.elements[0];
      const playerChecks = [
        { field: 'now_cost', test: () => typeof player.now_cost === 'number' },
        { field: 'chance_of_playing_next_round', test: () => player.chance_of_playing_next_round === null || typeof player.chance_of_playing_next_round === 'number' },
        { field: 'status', test: () => typeof player.status === 'string' },
        { field: 'selected_by_percent', test: () => typeof player.selected_by_percent === 'string' || typeof player.selected_by_percent === 'number' },
        { field: 'form', test: () => typeof player.form === 'string' },
        { field: 'team', test: () => typeof player.team === 'number' },
        { field: 'element_type', test: () => typeof player.element_type === 'number' },
        { field: 'web_name', test: () => typeof player.web_name === 'string' },
      ];

    playerChecks.forEach(check => {
      const result = check.test();
      console.log(`  ${result ? '✓' : '✗'} player.${check.field}: ${result ? 'OK' : 'MISSING/INVALID'}`);
      if (result) passed++;
    });
  }

  if (data.events.length > 0) {
    const event = data.events.find(e => e.is_current) || data.events[0];
    const eventChecks = [
      { field: 'id', test: () => typeof event.id === 'number' },
      { field: 'is_current', test: () => typeof event.is_current === 'boolean' },
      { field: 'is_next', test: () => typeof event.is_next === 'boolean' },
      { field: 'deadline_time', test: () => typeof event.deadline_time === 'string' },
    ];

    eventChecks.forEach(check => {
      const result = check.test();
      console.log(`  ${result ? '✓' : '✗'} event.${check.field}: ${result ? 'OK' : 'MISSING/INVALID'}`);
      if (result) passed++;
    });
  }

  return passed;
}

async function verifyFixtures() {
  console.log('\n=== Verifying /fixtures/ ===');
  const data = await fplFetch('/fixtures/');

  const checks = [
    { field: 'fixtures', test: () => Array.isArray(data) && data.length > 0 },
  ];

  let passed = 0;
  checks.forEach(check => {
    const result = check.test();
    console.log(`  ${result ? '✓' : '✗'} ${check.field}: ${result ? 'present' : 'MISSING'}`);
    if (result) passed++;
  });

  if (data.length > 0) {
    const fixture = data[0];
    const fixtureChecks = [
      { field: 'id', test: () => typeof fixture.id === 'number' },
      { field: 'event', test: () => typeof fixture.event === 'number' },
      { field: 'team_h', test: () => typeof fixture.team_h === 'number' },
      { field: 'team_a', test: () => typeof fixture.team_a === 'number' },
      { field: 'team_h_difficulty', test: () => typeof fixture.team_h_difficulty === 'number' },
      { field: 'team_a_difficulty', test: () => typeof fixture.team_a_difficulty === 'number' },
      { field: 'finished', test: () => typeof fixture.finished === 'boolean' },
    ];

    fixtureChecks.forEach(check => {
      const result = check.test();
      console.log(`  ${result ? '✓' : '✗'} fixture.${check.field}: ${result ? 'OK' : 'MISSING/INVALID'}`);
      if (result) passed++;
    });
  }

  return passed;
}

async function verifyLive() {
  console.log('\n=== Verifying /event/{id}/live/ ===');
  try {
    const data = await fplFetch('/bootstrap-static/');
    const currentEvent = data.events.find(e => e.is_current);
    if (!currentEvent) {
      console.log('  ! No current event, skipping live verification');
      return 0;
    }

    const liveData = await fplFetch(`/event/${currentEvent.id}/live/`);
    const checks = [
      { field: 'elements', test: () => Array.isArray(liveData.elements) },
    ];

    let passed = 0;
    checks.forEach(check => {
      const result = check.test();
      console.log(`  ${result ? '✓' : '✗'} ${check.field}: ${result ? 'present' : 'MISSING'}`);
      if (result) passed++;
    });

    if (liveData.elements && liveData.elements.length > 0) {
      const el = liveData.elements[0];
      const elChecks = [
        { field: 'id', test: () => typeof el.id === 'number' },
        { field: 'stats', test: () => typeof el.stats === 'object' },
        { field: 'stats.total_points', test: () => typeof el.stats?.total_points === 'number' },
        { field: 'stats.bps', test: () => typeof el.stats?.bps === 'number' },
      ];

      elChecks.forEach(check => {
        const result = check.test();
        console.log(`  ${result ? '✓' : '✗'} live.${check.field}: ${result ? 'OK' : 'MISSING/INVALID'}`);
        if (result) passed++;
      });
    }

    return passed;
  } catch (err) {
    console.log(`  ✗ Live endpoint failed: ${err.message}`);
    return 0;
  }
}

async function main() {
  console.log('FPL API Verification Script');
  console.log('===========================');

  let totalPassed = 0;
  let totalChecks = 0;

  try {
    totalPassed += await verifyBootstrap();
    totalChecks += 16;
  } catch (err) {
    console.log(`\n✗ Bootstrap verification failed: ${err.message}`);
  }

  try {
    totalPassed += await verifyFixtures();
    totalChecks += 8;
  } catch (err) {
    console.log(`\n✗ Fixtures verification failed: ${err.message}`);
  }

  try {
    totalPassed += await verifyLive();
    totalChecks += 5;
  } catch (err) {
    console.log(`\n✗ Live verification failed: ${err.message}`);
  }

  console.log('\n===========================');
  console.log(`Results: ${totalPassed}/${totalChecks} checks passed`);

  if (totalPassed === totalChecks) {
    console.log('✓ All FPL API endpoints look healthy.');
    process.exit(0);
  } else {
    console.log('✗ Some checks failed. Review the output above.');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
