"use client";

import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";
import { usePathname } from "next/navigation";
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
              <a href="/">⚽ HIP League</a>
            </h3>
            <div className="flex items-center gap-3">
              <Link href="/leagues/new">
                  <Button variant="default" size="sm" className="text-sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Giải đấu mới
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
