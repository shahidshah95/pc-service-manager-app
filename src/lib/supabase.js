import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase env variables missing! Check your .env file.');
}

// ─── Robust Supabase Client ────────────────────────────────────────────────
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  global: {
    headers: {
      'x-app-name': 'pc-service-manager',
    },
  },
  db: {
    schema: 'public',
  },
});

// ─── Retry Helper ─────────────────────────────────────────────────────────
// Retries any async Supabase call up to `maxRetries` times with exponential backoff.
export async function withRetry(fn, maxRetries = 4, baseDelayMs = 500) {
  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      const result = await fn();
      // Supabase returns { data, error } — treat error as a failure to retry
      if (result?.error) {
        const isNetworkError =
          result.error.message?.toLowerCase().includes('network') ||
          result.error.message?.toLowerCase().includes('fetch') ||
          result.error.message?.toLowerCase().includes('timeout') ||
          result.error.code === 'PGRST301' ||
          result.error.code === '500';

        if (isNetworkError && attempt < maxRetries) {
          const delay = baseDelayMs * Math.pow(2, attempt); // exponential backoff
          console.warn(`⚠️ Supabase error (attempt ${attempt + 1}/${maxRetries + 1}): ${result.error.message}. Retrying in ${delay}ms...`);
          await sleep(delay);
          attempt++;
          continue;
        }
        // Non-network error or out of retries — return as-is
        return result;
      }
      return result;
    } catch (err) {
      if (attempt < maxRetries) {
        const delay = baseDelayMs * Math.pow(2, attempt);
        console.warn(`⚠️ Supabase exception (attempt ${attempt + 1}/${maxRetries + 1}): ${err.message}. Retrying in ${delay}ms...`);
        await sleep(delay);
        attempt++;
      } else {
        console.error('❌ Supabase max retries reached:', err);
        return { data: null, error: err };
      }
    }
  }
}

// ─── Connection Health Check ───────────────────────────────────────────────
// Returns true if Supabase is reachable, false otherwise.
export async function checkSupabaseConnection() {
  try {
    const { error } = await supabase.from('entries').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}

// ─── Online/Offline Detection ──────────────────────────────────────────────
let _connectionListeners = [];

export function onConnectionChange(cb) {
  _connectionListeners.push(cb);
  return () => {
    _connectionListeners = _connectionListeners.filter(fn => fn !== cb);
  };
}

function notifyConnectionListeners(isOnline) {
  _connectionListeners.forEach(fn => fn(isOnline));
}

window.addEventListener('online', async () => {
  console.log('🌐 Back online — verifying Supabase connection...');
  const ok = await checkSupabaseConnection();
  notifyConnectionListeners(ok);
  if (ok) console.log('✅ Supabase connection restored.');
  else console.warn('⚠️ Back online but Supabase still unreachable.');
});

window.addEventListener('offline', () => {
  console.warn('📴 Network offline — Supabase calls will fail until reconnected.');
  notifyConnectionListeners(false);
});

// ─── Utility ──────────────────────────────────────────────────────────────
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
