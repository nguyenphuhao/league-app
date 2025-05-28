"use client";

import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { get, onValue, ref, update } from "firebase/database";
import { useEffect, useState } from "react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function StartLeaguePage() {
  const { leagueId } = useParams();
  const router = useRouter();
  const [league, setLeague] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [playerToRemove, setPlayerToRemove] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "waiting":
        return (
          <Badge
            variant="outline"
            className="text-yellow-400 border-yellow-400"
          >
            🕓 Đang chờ người chơi
          </Badge>
        );
      case "started":
        return (
          <Badge
            variant="outline"
            className="text-green-400 border-green-400"
          >
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

  useEffect(() => {
    const leagueRef = ref(db, `leagues/${leagueId}`);
    const unsubscribe = onValue(leagueRef, (snapshot) => {
      setLeague(snapshot.val());
    });
    return () => unsubscribe();
  }, [leagueId]);

  const handleStart = async () => {
    if (!league || !league.players) return;

    const playerList = Object.values(league.players).map(
      (p: any) => p.name || p
    );

    if (playerList.length < 3) {
      alert("⚠️ Cần ít nhất 3 người chơi để bắt đầu giải đấu!");
      return;
    }

    const matches: any = {};
    const leaderboard: any = {};
    let count = 1;

    for (let i = 0; i < playerList.length; i++) {
      leaderboard[playerList[i]] = {
        played: 0,
        win: 0,
        draw: 0,
        loss: 0,
        points: 0,
      };
      for (let j = i + 1; j < playerList.length; j++) {
        matches[`match${count}`] = {
          playerA: playerList[i],
          playerB: playerList[j],
          scoreA: null,
          scoreB: null,
          played: false,
        };
        count++;
      }
    }

    await update(ref(db, `leagues/${leagueId}`), {
      matches,
      leaderboard,
      status: "started",
      startedAt: new Date().toISOString(),
    });

    router.push(`/leagues/${leagueId}`);
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/leagues/${leagueId}/join`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRemovePlayer = async (playerId: string) => {
    await update(ref(db, `leagues/${leagueId}/players`), {
      [playerId]: null,
    });
    setPlayerToRemove(null);
  };

  const playerCount = Object.keys(league?.players || {}).length;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold">Thông tin giải đấu</CardTitle>
          <Badge
            variant="outline"
            onClick={handleCopyLink}
            className="cursor-pointer text-blue-400 border-blue-400 hover:bg-muted"
          >
            🔗 {copied ? "Đã sao chép" : "Sao chép link đăng ký"}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          {league && (
            <>
              <div className="space-y-2">
                <p>
                  <strong>Tên giải:</strong> {league.name}
                </p>
                <p>
                  <strong>Ngày tạo:</strong>{" "}
                  {new Date(league.createdAt || "").toLocaleString("vi-VN")}
                </p>
                <p>
                  <strong>Trạng thái:</strong> {getStatusBadge(league.status)}
                </p>

                <div>
                  <strong>
                    Người chơi đã đăng ký{" "}
                    <Badge className="text-accent">{playerCount}</Badge>
                  </strong>
                  {league.players && (
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      {Object.entries(league.players).map(
                        ([id, player]: any) => (
                          <li
                            key={id}
                            className="flex justify-between items-center"
                          >
                            <span>
                              {typeof player === "string"
                                ? player
                                : `${player.name} (joined: ${new Date(
                                    player.joinedAt
                                  ).toLocaleString("vi-VN")})`}
                            </span>
                            {league.status === "waiting" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => setPlayerToRemove(id)}
                              >
                                ❌
                              </Button>
                            )}
                          </li>
                        )
                      )}
                    </ul>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {league?.status === "waiting" && playerCount >= 3 && (
        <Button
          className="sticky bottom-0 w-full py-6 text-accent text-lg font-semibold mt-6"
          onClick={handleStart}
        >
          🚀 Bắt đầu giải đấu
        </Button>
      )}

      {league?.status === "waiting" && playerCount < 3 && (
        <p className="text-center text-sm text-muted-foreground mt-6">
          ⚠️ Cần ít nhất 3 người chơi để bắt đầu giải đấu
        </p>
      )}

      {playerToRemove && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-background rounded-lg shadow-lg p-6 space-y-4 max-w-sm w-full">
            <h3 className="text-lg font-semibold">Xác nhận xoá</h3>
            <p>Bạn có chắc muốn xoá người chơi này khỏi giải đấu không?</p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setPlayerToRemove(null)}>
                Huỷ
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleRemovePlayer(playerToRemove)}
              >
                Xoá
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}