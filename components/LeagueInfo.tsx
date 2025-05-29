"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { onValue, ref } from "firebase/database";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "./ui/badge";
import { calculateEstimatedEnd } from "@/lib/utils";

export default function LeagueInfo() {
  const { leagueId } = useParams();
  const router = useRouter();
  const [leagueInfo, setLeagueInfo] = useState<any>(null);

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
        players: data.players || {},
      });
    });
    return () => unsubscribe();
  }, [leagueId]);

  const handleStartLeague = () => {
    router.push(`/leagues/${leagueId}/start`);
  };

  const hasJoined = () => {
    const storedPlayer = localStorage.getItem(`league_${leagueId}_player`);
    if (storedPlayer && leagueInfo?.players) {
      const exists = Object.values(leagueInfo.players).some(
        (p: any) => p?.name?.toLowerCase() === storedPlayer.toLowerCase()
      );
      return exists;
    }
  };

  return (
    leagueInfo && (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">
            {leagueInfo.name}{" "}
            {hasJoined() && (
              <Badge className="text-accent bg-green-300">Đã đăng ký</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>
            📅 Bắt đầu:{" "}
            {new Date(leagueInfo.createdAt).toLocaleDateString("vi-VN")}
          </p>
          <p>⏳ Dự kiến kết thúc: {leagueInfo.estimatedEnd}</p>
          {leagueInfo.status === "waiting" && leagueInfo.playerCount > 0 && (
            <div>
              <strong className="block mb-2">
                👥 Người chơi đã đăng ký{" "}
                <Badge className="text-accent">{leagueInfo.playerCount}</Badge>
              </strong>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(leagueInfo.players || {}).map(
                  ([id, player]: any) => {
                    const name =
                      typeof player === "string" ? player : player.name;
                    const joined = new Date(player.joinedAt).toLocaleString(
                      "vi-VN"
                    );

                    return (
                      <div
                        key={id}
                        className="flex items-center justify-between p-3 rounded-md bg-muted hover:bg-muted/80 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                            {name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="text-sm">
                            <div className="font-medium">{name}</div>
                            <div className="text-muted-foreground text-xs">
                              Tham gia: {joined}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          )}

          {leagueInfo.status === "waiting" && (
            <div className="pt-4">
              <Button
                className="w-full text-accent"
                onClick={handleStartLeague}
              >
                🚀 Bắt đầu giải đấu
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  );
}
