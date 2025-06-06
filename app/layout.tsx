"use client";

import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Menu, Plus } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { isAdminUser } from "@/lib/utils";

const menuItems = [
  { name: "🏠 Trang chủ", href: "/" },
  { name: "🎮 Giải đấu", href: "/leagues" },
  { name: "📝 Tạo giải", href: "/leagues/new" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  console.log("Current pathname:", pathname);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();


  useEffect(() => {
    const flag = isAdminUser();
    setIsAdmin(flag);
  }, []);

  const toggleAdmin = (isAdmin: boolean) => {
    if (isAdmin) {
      localStorage.setItem("role", "admin");
    } else {
      localStorage.removeItem("role");
    }
    const flag = isAdminUser();
    console.log("Admin toggle:", flag);
    setIsAdmin(() => isAdmin);
    router.refresh();
  };


  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head />
      <body className="min-h-screen bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {/* 👉 Header with Drawer */}
          <header className="z-50 bg-card border-b px-4 flex justify-between items-center py-3">
            <h3 className="text-xl font-bold tracking-tight">
              <a href="/leagues">⚽ HIP League</a>
            </h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Label htmlFor="admin-switch" className="text-xs text-red-400">
                  admin
                </Label>
                <Switch
                  id="admin-switch"
                  checked={isAdmin}
                  onCheckedChange={toggleAdmin}
                  className="data-[state=checked]:bg-red-500 data-[state=unchecked]:bg-gray-300"
                />
              </div>
              <Link href="/leagues/new">
                <Button
                  variant="default"
                  size="sm"
                  className="text-sm text-accent"
                >
                  <Plus className="w-4 h-4" />
                  Giải đấu
                </Button>
              </Link>
              
              <Drawer>
                <DrawerTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="h-screen w-full px-4 py-4 border-r border-border bg-popover">
                  <DrawerHeader>
                    <DrawerTitle className="text-lg">📋 Menu</DrawerTitle>
                  </DrawerHeader>
                  <nav className="flex flex-col gap-3 mt-2">
                    {menuItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`text-base font-medium hover:underline ${
                          pathname === item.href ? "text-primary" : ""
                        }`}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </nav>
                  <DrawerClose asChild>
                    <Button variant="ghost" className="mt-6 w-full">
                      Đóng
                    </Button>
                  </DrawerClose>
                </DrawerContent>
              </Drawer>
            </div>
          </header>

          {/* 👉 Main Content */}
          <main className="max-w-4xl mx-auto px-4 py-6">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
