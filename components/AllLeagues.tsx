"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { get, ref } from "firebase/database";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface League {
  id: string;
  name: string;
  createdAt: string;
  estimatedEndDate?: string;
  playersCount: number;
  status: "waiting" | "started" | "finished";
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "waiting":
      return (
        <Badge variant="outline" className="text-yellow-400 border-yellow-400">
          🕓 Đang chờ người chơi
        </Badge>
      );
    case "started":
      return (
        <Badge variant="outline" className="text-green-400 border-green-400">
          ⚽ Đang thi đấu
        </Badge>
      );
    case "finished":
      return (
        <Badge variant="outline" className="text-red-400 border-red-400">
          🏁 Kết thúc
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function AllLeaguesPage() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchLeagues = async () => {
      const leagueRef = ref(db, "leagues");
      const snapshot = await get(leagueRef);
      const data = snapshot.val() || {};

      const formatted: League[] = Object.entries(data).map(
        ([id, league]: any) => ({
          id,
          name: league.name,
          createdAt: league.createdAt,
          estimatedEndDate: league.estimatedEndDate,
          playersCount: league.players ? Object.keys(league.players).length : 0,
          status: league.status || "waiting",
        })
      );

      formatted.sort((a, b) =>
        (b.createdAt || "").localeCompare(a.createdAt || "")
      );

      setLeagues(formatted);
    };

    fetchLeagues();
  }, []);

  const grouped = {
    waiting: leagues.filter((l) => l.status === "waiting"),
    started: leagues.filter((l) => l.status === "started"),
    finished: leagues.filter((l) => l.status === "finished"),
  };

  const renderGroup = (title: string, items: League[]) => {
    if (items.length === 0) return null;

    return (
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-4">{title}</h2>
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 items-stretch">
          {items.map((league) => {
            const handleClick = () => {
              router.push(`/leagues/${league.id}`);
            };

            return (
              <Card
                key={league.id}
                onClick={handleClick}
                className="cursor-pointer hover:shadow-xl transition duration-300 h-full"
              >
                <CardHeader>
                  <CardTitle className="truncate">{league.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {getStatusBadge(league.status)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p>📅 Bắt đầu: {new Date(league.createdAt).toLocaleDateString("vi-VN")}</p>
                  <p>🔚 Kết thúc: {league.estimatedEndDate || "Chưa đặt"}</p>
                  <p>👥 Người chơi: {league.playersCount}</p>

                  {league.status === "waiting" && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/leagues/${league.id}/join`);
                      }}
                      className="w-full"
                      variant="default"
                    >
                       Tham gia
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-white">⚽️ Các giải đấu</h1>

      {leagues.length === 0 ? (
        <p className="text-gray-400">Chưa có giải đấu nào.</p>
      ) : (
        <>
          {renderGroup("🕓 Đang chờ người chơi", grouped.waiting)}
          {renderGroup("⚽ Đang thi đấu", grouped.started)}
          {renderGroup("🏁 Đã kết thúc", grouped.finished)}
        </>
      )}
    </div>
  );
}