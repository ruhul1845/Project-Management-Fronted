"use client";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "@/components/ui/toast";
import { messageOf } from "@/lib/task-management-api";
export function useUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  return {
    get: (key: string) => params.get(key) ?? "",
    set: (values: Record<string, string | number | null>) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(values)) {
        if (value === null || value === "") next.delete(key);
        else next.set(key, String(value));
      }
      router.replace(`${pathname}${next.size ? `?${next}` : ""}`);
    },
  };
}
export function useAction() {
  const client = useQueryClient();
  return async (
    run: () => Promise<unknown>,
    success: string,
    keys?: string[][],
  ) => {
    try {
      await run();
      if (keys)
        for (const key of keys)
          void client.invalidateQueries({ queryKey: key });
      else void client.invalidateQueries();
      toast.add({ title: success, type: "success" });
      return true;
    } catch (error) {
      toast.add({
        title: "Could not save changes",
        description: messageOf(error),
        type: "error",
      });
      return false;
    }
  };
}
