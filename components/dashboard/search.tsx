"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSearch } from "@/lib/hooks/use-search";
import { cn } from "@/lib/cn";
import { CEDEAR_MAP } from "@/lib/data/cedear-ratios";

interface SearchProps {
  onSelectStock: (ticker: string, name: string) => void;
}

export function Search({ onSelectStock }: SearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { data: results, isLoading } = useSearch(query);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelect = useCallback(
    (ticker: string, name: string) => {
      onSelectStock(ticker, name);
      setQuery("");
      setIsOpen(false);
      inputRef.current?.blur();
    },
    [onSelectStock]
  );

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation
  const [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [results]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!results?.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      const item = results[selectedIndex];
      handleSelect(item.ticker, item.name);
    } else if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-tertiary"
          width="14"
          height="14"
          viewBox="0 0 15 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10 6.5C10 8.433 8.433 10 6.5 10C4.567 10 3 8.433 3 6.5C3 4.567 4.567 3 6.5 3C8.433 3 10 4.567 10 6.5ZM9.30884 10.0159C8.53901 10.6318 7.56251 11 6.5 11C4.01472 11 2 8.98528 2 6.5C2 4.01472 4.01472 2 6.5 2C8.98528 2 11 4.01472 11 6.5C11 7.56251 10.6318 8.53901 10.0159 9.30884L12.8536 12.1464C13.0488 12.3417 13.0488 12.6583 12.8536 12.8536C12.6583 13.0488 12.3417 13.0488 12.1464 12.8536L9.30884 10.0159Z"
            fill="currentColor"
            fillRule="evenodd"
            clipRule="evenodd"
          />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => query.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search stocks..."
          className="w-full bg-background-secondary border border-border rounded-lg pl-9 pr-3 py-1.5 text-sm text-foreground placeholder:text-foreground-tertiary/50 focus:outline-none focus:border-foreground-tertiary/50 transition-colors"
        />
      </div>

      {/* Results dropdown */}
      {isOpen && query.length >= 1 && (
        <div className="absolute top-full mt-1.5 w-full bg-surface border border-border rounded-lg shadow-lg overflow-hidden z-50 animate-scale-in">
          {isLoading ? (
            <div className="px-4 py-3 text-xs text-foreground-tertiary">
              Searching...
            </div>
          ) : results && results.length > 0 ? (
            <div className="py-1">
              {results.map((result, index) => {
                const isCedear = CEDEAR_MAP.has(result.ticker);
                return (
                  <button
                    key={result.ticker}
                    onClick={() => handleSelect(result.ticker, result.name)}
                    className={cn(
                      "w-full text-left px-4 py-2.5 flex items-center justify-between transition-colors",
                      selectedIndex === index
                        ? "bg-surface-active"
                        : "hover:bg-surface-hover"
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-mono font-medium text-foreground shrink-0">
                        {result.ticker}
                      </span>
                      <span className="text-xs text-foreground-tertiary truncate">
                        {result.name}
                      </span>
                    </div>
                    {isCedear && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-foreground/10 text-foreground-secondary shrink-0 ml-2">
                        CEDEAR
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="px-4 py-3 text-xs text-foreground-tertiary">
              No results for &ldquo;{query}&rdquo;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
