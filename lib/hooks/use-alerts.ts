"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseClient } from "@/supabase/client";
import type { Alert } from "@/lib/types";
import type { Database } from "@/supabase/types";

type AlertRow = Database["public"]["Tables"]["alerts"]["Row"];

export function useAlerts(userId: string | null) {
  const { data, isLoading } = useQuery<AlertRow[]>({
    queryKey: ["alerts", userId],
    queryFn: async () => {
      if (!userId) return [] as AlertRow[];
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("alerts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as AlertRow[];
    },
    enabled: !!userId,
    staleTime: 0,
  });

  const alerts: Alert[] = (data ?? []).map((a) => ({
    id: a.id,
    ticker: a.ticker,
    condition: a.condition as "above" | "below",
    targetPrice: Number(a.target_price),
    currency: a.currency as "USD" | "ARS",
    isActive: a.is_active,
    triggeredAt: a.triggered_at,
    notificationSent: a.notification_sent,
    createdAt: a.created_at,
  }));

  return { alerts, isLoading, hasData: (data ?? []).length > 0 };
}

export function useAddAlert(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alert: {
      ticker: string;
      condition: "above" | "below";
      targetPrice: number;
      currency: "USD" | "ARS";
    }) => {
      if (!userId) throw new Error("No user");
      const supabase = getSupabaseClient();

      const { error } = await supabase.from("alerts").insert({
        user_id: userId,
        ticker: alert.ticker,
        condition: alert.condition,
        target_price: alert.targetPrice,
        currency: alert.currency,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts", userId] });
    },
  });
}

export function useDeleteAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from("alerts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}
