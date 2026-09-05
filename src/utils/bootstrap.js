/**
 * App bootstrap — runs on first launch to hydrate local caches.
 *
 * Calls /bootstrap-static/ and /fixtures/ via usePlayerStore.
 * Returns true if data is now ready, false on error.
 */

import { usePlayerStore } from '@/state/usePlayerStore';

export async function bootstrapApp() {
  const playerStore = usePlayerStore.getState();

  if (playerStore.status === 'ready') {
    return true;
  }

  if (playerStore.status === 'loading') {
    // Wait for existing load to finish
    return new Promise((resolve) => {
      const unsub = usePlayerStore.subscribe((state) => {
        if (state.status !== 'loading') {
          unsub();
          resolve(state.status === 'ready');
        }
      });
    });
  }

  try {
    await playerStore.bootstrap();
    return true;
  } catch (err) {
    console.warn('Bootstrap failed:', err);
    return false;
  }
}
