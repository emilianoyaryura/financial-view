"use client";

import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "./use-debounce";

interface SearchResult {
  ticker: string;
  name: string;
}

export function useSearch(query: string) {
  const debouncedQuery = useDebounce(query, 300);

  return useQuery<SearchResult[]>({
    queryKey: ["search", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.length < 1) return [];
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(debouncedQuery)}`
      );
      if (!response.ok) throw new Error("Search failed");
      return response.json();
    },
    enabled: debouncedQuery.length >= 1,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
