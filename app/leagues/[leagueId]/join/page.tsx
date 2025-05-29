"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { onValue, ref, set } from "firebase/database";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

const leagueFormat: any = {
  "round-robin": "Đấu vòng tròn",
};

export default function JoinLeaguePage() {
  const { leagueId } = useParams();
  const router = useRouter();

  const [league, setLeague] = useState<any>(null);
  const [playerName, setPlayerName] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!leagueId) return;
    const leagueRef = ref(db, `leagues/${leagueId}`);
    const unsubscribe = onValue(leagueRef, (snapshot) => {
      const data = snapshot.val();
      if (data?.status === "started") {
        setLeague(null);
        router.push(`/leagues/${leagueId}`);
      }
      if (data?.status === "waiting") {
        setLeague(data);

        // 🔁 Kiểm tra localStorage
        const storedPlayer = localStorage.getItem(`league_${leagueId}_player`);
        if (storedPlayer && data.players) {
          const exists = Object.values(data.players).some(
            (p: any) => p?.name?.toLowerCase() === storedPlayer.toLowerCase()
          );
          if (exists) {
            router.push(`/leagues/${leagueId}`);
          }
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [leagueId]);

  const handleConfirmJoin = async () => {
    const playerId = crypto.randomUUID();
    const playerRef = ref(db, `leagues/${leagueId}/players/${playerId}`);
    await set(playerRef, {
      name: playerName,
      joinedAt: new Date().toISOString(),
    });

    // 💾 Lưu tên người chơi vào localStorage
    localStorage.setItem(`league_${leagueId}_player`, playerName);

    setOpen(false);
    router.push(`/leagues/${leagueId}`);
  };

  // 🌀 UI khi loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-muted-foreground">
        <Loader2 className="w-6 h-6 mr-2 animate-spin" />
        Đang tải dữ liệu giải đấu...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Tham gia League</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {league ? (
            <>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Tên:</strong> {league.name}
                </p>
                <p>
                  <strong>Ngày tạo:</strong>{" "}
                  {new Date(league.createdAt).toLocaleString()}
                </p>
                <p>
                  <strong>Thể thức:</strong> {leagueFormat[league.format]}
                </p>
                <div>
                  <strong className="block mb-2">
                    👥 Người chơi đã đăng ký{" "}
                    <Badge className="text-accent">
                      {league.players.length || 0}
                    </Badge>
                  </strong>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(league.players || {}).map(
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="player">Tên người chơi</Label>
                <Input
                  id="player"
                  type="text"
                  placeholder="Nhập tên của bạn"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                />
              </div>

              <Button
                disabled={!playerName}
                className="w-full text-accent"
                onClick={() => setOpen(true)}
              >
                Tham gia giải đấu
              </Button>
            </>
          ) : (
            <p className="text-muted-foreground">
              Không tìm thấy thông tin giải đấu hoặc giải đã bắt đầu.
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận tham gia</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn tham gia giải đấu <strong>{league?.name}</strong>{" "}
              không?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Huỷ
              </Button>
              <Button className="text-accent" onClick={handleConfirmJoin}>
                Xác nhận
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
