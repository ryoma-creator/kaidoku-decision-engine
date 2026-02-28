import { useState, useEffect, useCallback } from "react";
import type { UsageData } from "../types";
import {
  getUsage,
  incrementUsage,
  canGenerate,
  remainingCount,
} from "../services/storage";

export function useUsage() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await getUsage();
    setUsage(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const increment = useCallback(async () => {
    const updated = await incrementUsage();
    setUsage(updated);
    return updated;
  }, []);

  return {
    usage,
    loading,
    refresh,
    increment,
    canUse: usage ? canGenerate(usage) : false,
    remaining: usage ? remainingCount(usage) : 0,
  };
}
