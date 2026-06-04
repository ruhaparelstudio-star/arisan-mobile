import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAuth } from './useAuth';
import { getNotifications } from '../api/notifications';

const POLL_INTERVAL_MS = 30_000;

// Bridge: NotificationsScreen bisa trigger refresh di instance AppNavigator
// tanpa perlu shared context
let _globalRefresh: (() => void) | null = null;
export function registerUnreadRefresh(fn: () => void) { _globalRefresh = fn; }
export function triggerUnreadRefresh() { _globalRefresh?.(); }

// Returns live unread notification count.
// Uses polling (30s) + AppState foreground refresh.
// Supabase Realtime cannot be used here because notifications table has RLS ON
// with no anon policy (anon key = service blocked). Security from backend API layer.
export function useUnreadCount(): { unread: number; refresh: () => void } {
  const { token } = useAuth();
  const [unread, setUnread] = useState(0);
  const tokenRef = useRef(token);
  tokenRef.current = token;

  const refresh = useCallback(() => {
    if (!tokenRef.current) return;
    getNotifications(tokenRef.current, 1).then((r) => setUnread(r.unread_count)).catch(() => {});
  }, []);

  // Initial fetch whenever token changes (login / re-auth)
  useEffect(() => {
    refresh();
  }, [token, refresh]);

  // Polling every 30s
  useEffect(() => {
    if (!token) return;
    const id = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [token, refresh]);

  // Refresh on foreground resume
  useEffect(() => {
    if (!token) return;
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') refresh();
    });
    return () => sub.remove();
  }, [token, refresh]);

  return { unread, refresh };
}
