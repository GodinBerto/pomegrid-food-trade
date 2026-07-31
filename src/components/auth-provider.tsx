"use client";

import { useEffect } from "react";
import { hydrateAuthSession } from "@/lib/auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    hydrateAuthSession();
  }, []);

  return <>{children}</>;
}
