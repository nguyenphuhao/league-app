"use client";

import { isAdminUser } from "@/lib/utils";
import { useEffect, useState } from "react";

export function useAuth() {
  const isAdmin = isAdminUser();
  const [mounted, setResolved] = useState(false);
  useEffect(() => {
    setResolved(true);
  }, []);
  return { isAdmin, mounted };
}
