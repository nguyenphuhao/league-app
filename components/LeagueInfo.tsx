"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { onValue, ref } from "firebase/database";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function LeagueInfo() {
  const { leagueId } = useParams();
  const router = useRouter();
  const [leagueInfo, setLeagueInfo] = useState<any>(null);

  function calculateEstimatedEnd(players: any) {
    const count = Object.keys(players || {}).length;
    const matchCount = (count * (count - 1)) / 2;
    const dayPerMatch = 0.5;
    const days = Math.ceil(matchCount * dayPerMatch);
    const start = new Date(
      players?.[Object.keys(players)[0]]?.joinedAt || new Date()
    );
    const end = new Date(start);
    end.setDate(start.getDate() + days);
    return end.toISOString().split("T")[0];
  }

  useEffect(() => {
    const leagueRef = ref(db, `leagues/${leagueId}`);
    const unsubscribe = onValue(leagueRef, (snapshot) => {
      const data = snapshot.val() || {};
      setLeagueInfo({
        name: data.name,
        createdAt: data.createdAt,
        playerCount: Object.keys(data.players || {}).length,
        estimatedEnd: calculateEstimatedEnd(data.players),
        status: data.status || "waiting",
      });
    });
    return () => unsubscribe();
  }, [leagueId]);

  const handleStartLeague = () => {
    router.push(`/leagues/${leagueId}/start`);
  };

  return (
    leagueInfo && (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">{leagueInfo.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>📅 Bắt đầu: {new Date(leagueInfo.createdAt).toLocaleDateString("vi-VN")}</p>
          <p>👥 Người tham gia: {leagueInfo.playerCount}</p>
          <p>⏳ Dự kiến kết thúc: {leagueInfo.estimatedEnd}</p>

          {leagueInfo.status === "waiting" && (
            <div className="pt-4">
              <Button className="w-full" onClick={handleStartLeague}>
                🚀 Bắt đầu giải đấu
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  );
}