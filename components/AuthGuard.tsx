"use client";

import { useAuth } from "@/hooks/useAuth";
import { isAdminUser } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext({
  isAdmin: false,
});

type AuthGuardProps = {
  children: ReactNode;
  ignoreMessage?: boolean;
};

export function AuthGuard({ children, ignoreMessage = false }: AuthGuardProps) {
  const { isAdmin, mounted } = useAuth();
  if (!mounted) {
    return null; // Chờ cho hook useAuth được khởi tạo
  }
  if (!isAdmin && !ignoreMessage) {
    return (
      <div className="text-center text-red-500 mt-10 font-semibold">
        🚫 Bạn không có quyền truy cập trang này. Vui lòng bật chế độ Admin từ
        thanh điều hướng.
      </div>
    );
  }

  return <>{children}</>;
}

export const AuthProvider = ({
  children,
  ignoreMessage = false,
}: AuthGuardProps) => {
  return (
    <AuthContext.Provider value={{ isAdmin: true }}>
      <AuthGuard ignoreMessage={ignoreMessage}>{children}</AuthGuard>
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
