/**
 * SUELTO POS — Connectivity Service
 * 
 * Multi-tier connectivity detection:
 * 1. Hardware/browser network status (navigator.onLine)
 * 2. Active backend reachability probe (/api/health) with bounded timeout
 * 3. Reactive state subscription for React components without aggressive polling
 */

import { useState, useEffect } from 'react';
import getApiUrl from './getApiUrl';

export const CONNECTION_STATUS = {
  ONLINE: 'online',
  OFFLINE_BROWSER: 'offline_browser',
  OFFLINE_BACKEND: 'offline_backend',
  SYNCING: 'syncing',
};

// Current cached connectivity state
let currentState = {
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  status: typeof navigator !== 'undefined' && !navigator.onLine 
    ? CONNECTION_STATUS.OFFLINE_BROWSER 
    : CONNECTION_STATUS.ONLINE,
  lastChecked: Date.now(),
  backendLatencyMs: null,
};

const listeners = new Set();

const notifyListeners = () => {
  listeners.forEach((listener) => {
    try {
      listener({ ...currentState });
    } catch (err) {
      console.error('[Connectivity] Error notifying subscriber:', err);
    }
  });
};

/**
 * Actively checks backend health with a bounded timeout (3000ms).
 */
export const checkBackendHealth = async () => {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    currentState = {
      isOnline: false,
      status: CONNECTION_STATUS.OFFLINE_BROWSER,
      lastChecked: Date.now(),
      backendLatencyMs: null,
    };
    notifyListeners();
    return currentState;
  }

  const baseUrl = getApiUrl();
  const healthUrl = `${baseUrl.replace(/\/$/, '')}/api/health`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  const startTime = performance.now();
  try {
    const res = await fetch(healthUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'no-store',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latency = Math.round(performance.now() - startTime);

    if (res.ok) {
      currentState = {
        isOnline: true,
        status: currentState.status === CONNECTION_STATUS.SYNCING ? CONNECTION_STATUS.SYNCING : CONNECTION_STATUS.ONLINE,
        lastChecked: Date.now(),
        backendLatencyMs: latency,
      };
    } else {
      currentState = {
        isOnline: false,
        status: CONNECTION_STATUS.OFFLINE_BACKEND,
        lastChecked: Date.now(),
        backendLatencyMs: latency,
      };
    }
  } catch (err) {
    clearTimeout(timeoutId);
    currentState = {
      isOnline: false,
      status: CONNECTION_STATUS.OFFLINE_BACKEND,
      lastChecked: Date.now(),
      backendLatencyMs: null,
    };
  }

  notifyListeners();
  return currentState;
};

/**
 * Manually update syncing status (e.g. while queue is flushing)
 */
export const setSyncingStatus = (isSyncing) => {
  if (isSyncing) {
    currentState = {
      ...currentState,
      status: CONNECTION_STATUS.SYNCING,
    };
  } else {
    currentState = {
      ...currentState,
      status: currentState.isOnline ? CONNECTION_STATUS.ONLINE : CONNECTION_STATUS.OFFLINE_BACKEND,
    };
  }
  notifyListeners();
};

/**
 * Read snapshot of current connectivity state synchronously
 */
export const getConnectionSnapshot = () => ({ ...currentState });

// Global listeners setup (runs once in browser)
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    // When browser says online, immediately verify backend health
    checkBackendHealth();
  });

  window.addEventListener('offline', () => {
    currentState = {
      isOnline: false,
      status: CONNECTION_STATUS.OFFLINE_BROWSER,
      lastChecked: Date.now(),
      backendLatencyMs: null,
    };
    notifyListeners();
  });

  // Verify connection when cashier switches back to tab
  window.addEventListener('focus', () => {
    checkBackendHealth();
  });

  // Initial probe shortly after startup
  setTimeout(() => {
    checkBackendHealth();
  }, 1000);

  // Periodic low-frequency heartbeat (every 25 seconds)
  setInterval(() => {
    checkBackendHealth();
  }, 25000);
}

/**
 * React hook for components to subscribe to real-time connectivity changes.
 */
export const useConnectivity = () => {
  const [state, setState] = useState(currentState);

  useEffect(() => {
    listeners.add(setState);
    return () => {
      listeners.delete(setState);
    };
  }, []);

  return {
    ...state,
    checkNow: checkBackendHealth,
  };
};

export default useConnectivity;

