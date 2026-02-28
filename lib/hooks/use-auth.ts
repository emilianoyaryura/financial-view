"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getSupabaseClient } from "@/supabase/client";
import type { User } from "@supabase/supabase-js";

/**
 * Ensures the Supabase Auth user has a matching row in public.users.
 * All data tables (holdings, transactions, watchlist, alerts, etc.)
 * reference public.users(id) via FK, so this row must exist.
 */
async function ensurePublicUser(user: User) {
  const supabase = getSupabaseClient();
  await supabase.from("users").upsert(
    {
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.name ?? null,
      avatar_url: user.user_metadata?.avatar_url ?? null,
    },
    { onConflict: "id" }
  );
}

/**
 * Returns the authenticated user from Supabase Auth.
 * Drop-in replacement shape: { userId, user, isLoading, isAuthenticated }
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const syncedRef = useRef<string | null>(null);

  const syncUser = useCallback(async (authUser: User | null) => {
    if (authUser && syncedRef.current !== authUser.id) {
      await ensurePublicUser(authUser);
      syncedRef.current = authUser.id;
    }
    setUser(authUser);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const supabase = getSupabaseClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      syncUser(user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      syncUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [syncUser]);

  return {
    userId: user?.id ?? null,
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
