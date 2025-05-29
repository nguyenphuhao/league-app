"use client";

import AddNewLeague from "@/components/AddNewLeague";
import{ AuthProvider } from "@/components/AuthGuard";

export default function NewLeaguePage() {
  return (
    <AuthProvider>
      <AddNewLeague />
    </AuthProvider>
  );
}
