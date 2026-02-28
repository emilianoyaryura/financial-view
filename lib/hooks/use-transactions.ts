"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient } from "@/supabase/client";
import type { Database } from "@/supabase/types";

type TransactionRow = Database["public"]["Tables"]["transactions"]["Row"];

export function useTransactionsByTicker(userId: string | null, ticker: string) {
  return useQuery<TransactionRow[]>({
    queryKey: ["transactions", userId, ticker],
    queryFn: async () => {
      if (!userId || !ticker) return [] as TransactionRow[];
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .eq("ticker", ticker)
        .order("date", { ascending: false });

      if (error) throw error;
      return (data ?? []) as TransactionRow[];
    },
    enabled: !!userId && !!ticker,
    staleTime: 0,
  });
}
