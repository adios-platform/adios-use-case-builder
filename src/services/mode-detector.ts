/**
 * AdiOS Use Case Builder — Mode Detector
  *
   * Determines whether the app is running in ONLINE or OFFLINE mode.
    * Switches the service layer accordingly so the rest of the app
     * never has to care about connectivity.
      *
       * Mode resolution order:
        *  1. VITE_UCB_MODE env var ("online" | "offline" | "auto")
         *  2. Presence of running local Express server at /api/health
          *  3. Navigator online status + gateway reachability probe
           */

export type UCBMode = 'online' | 'offline';

interface ModeResult {
  mode: UCBMode;
  gatewayUrl: string;
  reason: string;
}

const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL ?? 'https://api.adiosplat.io';
const LOCAL_SERVER_URL = 'http://localhost:3000';
const FORCED_MODE = import.meta.env.VITE_UCB_MODE as string | undefined;

/**
 * Probe a URL with a short timeout. Returns true if reachable.
  */
async function probe(url: string, timeoutMs = 3000): Promise<boolean> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    const res = await fetch(`${url}/api/health`, {
      signal: ctrl.signal,
      cache: 'no-store',
    });
    clearTimeout(timer);
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Detect and return the current UCB mode.
  * Call once at app startup; result is stable for the session.
   */
export async function detectMode(): Promise<ModeResult> {
  // 1. Forced via env var
  if (FORCED_MODE === 'online') {
    return { mode: 'online', gatewayUrl: GATEWAY_URL, reason: 'forced via VITE_UCB_MODE=online' };
  }
  if (FORCED_MODE === 'offline') {
    return { mode: 'offline', gatewayUrl: LOCAL_SERVER_URL, reason: 'forced via VITE_UCB_MODE=offline' };
  }

  // 2. Check if local offline server is running (workshop mode)
  const localAlive = await probe(LOCAL_SERVER_URL);
  if (localAlive) {
    return { mode: 'offline', gatewayUrl: LOCAL_SERVER_URL, reason: 'local offline server detected at :3000' };
  }

  // 3. Check navigator + gateway reachability
  if (!navigator.onLine) {
    return { mode: 'offline', gatewayUrl: LOCAL_SERVER_URL, reason: 'navigator.onLine = false' };
  }

  const gatewayAlive = await probe(GATEWAY_URL);
  if (gatewayAlive) {
    return { mode: 'online', gatewayUrl: GATEWAY_URL, reason: 'adios-gateway reachable' };
  }

  // 4. Fallback to offline
  return {
    mode: 'offline',
    gatewayUrl: LOCAL_SERVER_URL,
    reason: 'gateway unreachable — falling back to offline seed data',
  };
}

/**
 * Singleton mode result for the current session.
  */
let _modeResult: ModeResult | null = null;

export async function getMode(): Promise<ModeResult> {
  if (!_modeResult) {
    _modeResult = await detectMode();
    console.info(`[UCB] Mode: ${_modeResult.mode} — ${_modeResult.reason}`);
  }
  return _modeResult;
}

export function getModeSync(): UCBMode {
  return _modeResult?.mode ?? 'offline';
}
