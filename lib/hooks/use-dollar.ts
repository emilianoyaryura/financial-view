"use client";

import { useQuery } from "@tanstack/react-query";
import type { DollarRates } from "@/lib/types";

export function useDollar() {
  return useQuery<DollarRates>({
    queryKey: ["dollar", "all"],
    queryFn: async () => {
      const response = await fetch("/api/dollar");
      if (!response.ok) throw new Error("Failed to fetch dollar rates");
      return response.json();
    },
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
