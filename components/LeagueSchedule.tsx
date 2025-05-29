"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { onValue, ref, update, get } from "firebase/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { SearchWithDialogHint } from "./SearchWithDialogHint";

export default function LeagueSchedule() {
  const { leagueId } = useParams();
  const [matches, setMatches] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editScores, setEditScores] = useState({ scoreA: 0, scoreB: 0 });
  const [status, setStatus] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "played" | "unplayed"
  >("all");

  useEffect(() => {
    const statusRef = ref(db, `leagues/${leagueId}/status`);
    const unsub = onValue(statusRef, (snap) => {
      const value = snap.val();
      setStatus(value);
    });
    return () => unsub();
  }, [leagueId]);

  const fetchMatches = async () => {
    const matchRef = ref(db, `leagues/${leagueId}/matches`);
    const snapshot = await get(matchRef);
    const data = snapshot.val() || {};
    const sorted = Object.entries(data).sort(
      (a: any, b: any) => (b[1].updatedAt || 0) - (a[1].updatedAt || 0)
    );
    setMatches(sorted);
  };

  useEffect(() => {
    if (status === "started") fetchMatches();
  }, [leagueId, status]);

  function matchPlayersQuery(match: any, query: string) {
    if (!query.includes("|")) return false;
    const [kw1, kw2] = query
      .toLowerCase()
      .split("|")
      .map((kw) => kw.trim());
    const playerA = match.playerA.toLowerCase();
    const playerB = match.playerB.toLowerCase();
    return (
      (playerA.includes(kw1) && playerB.includes(kw2)) ||
      (playerA.includes(kw2) && playerB.includes(kw1))
    );
  }

  const filteredMatches = matches.filter(([_, match]) => {
    const keyword = searchKeyword.trim().toLowerCase();
    const matchStatus = match.played ? "played" : "unplayed";
    if (statusFilter !== "all" && matchStatus !== statusFilter) return false;
    if (keyword.includes("|")) return matchPlayersQuery(match, keyword);
    return (
      match.playerA.toLowerCase().includes(keyword) ||
      match.playerB.toLowerCase().includes(keyword)
    );
  });

  const handleEdit = (id: string, match: any) => {
    setEditingId(id);
    setEditScores({ scoreA: match.scoreA ?? 0, scoreB: match.scoreB ?? 0 });
  };

  const handleSave = async (id: string) => {
    const matchRef = ref(db, `leagues/${leagueId}/matches/${id}`);
    const snapshot = await get(matchRef);
    const match = snapshot.val();
    const { playerA, playerB } = match;

    const boardRef = ref(db, `leagues/${leagueId}/leaderboard`);
    const boardSnap = await get(boardRef);
    const board = boardSnap.val() || {};

    const init = {
      played: 0,
      win: 0,
      draw: 0,
      loss: 0,
      points: 0,
      goalsFor: 0,
      goalsAgainst: 0,
    };

    const a = { ...init, ...board[playerA] };
    const b = { ...init, ...board[playerB] };

    const scoreA = Number(editScores.scoreA);
    const scoreB = Number(editScores.scoreB);

    if (isNaN(scoreA) || isNaN(scoreB)) {
      alert("Vui lòng nhập số hợp lệ cho tỷ số.");
      return;
    }

    a.played += 1;
    b.played += 1;

    if (scoreA > scoreB) {
      a.win += 1;
      b.loss += 1;
      a.points += 3;
    } else if (scoreA < scoreB) {
      b.win += 1;
      a.loss += 1;
      b.points += 3;
    } else {
      a.draw += 1;
      b.draw += 1;
      a.points += 1;
      b.points += 1;
    }

    a.goalsFor += scoreA;
    a.goalsAgainst += scoreB;

    b.goalsFor += scoreB;
    b.goalsAgainst += scoreA;

    await update(boardRef, {
      [playerA]: a,
      [playerB]: b,
    });

    await update(matchRef, {
      scoreA,
      scoreB,
      played: true,
      updatedAt: Date.now(),
    });

    setEditingId(null);
    await fetchMatches();
  };

  const handleUndo = async (id: string) => {
    const matchRef = ref(db, `leagues/${leagueId}/matches/${id}`);
    const matchSnap = await get(matchRef);
    const match = matchSnap.val();
    if (!match || !match.played) return;

    const { playerA, playerB, scoreA, scoreB } = match;

    const boardRef = ref(db, `leagues/${leagueId}/leaderboard`);
    const boardSnap = await get(boardRef);
    const board = boardSnap.val() || {};

    const a = { ...board[playerA] };
    const b = { ...board[playerB] };

    if (!a || !b) return;

    const parsedScoreA = Number(scoreA);
    const parsedScoreB = Number(scoreB);

    a.played -= 1;
    b.played -= 1;

    if (parsedScoreA > parsedScoreB) {
      a.win -= 1;
      b.loss -= 1;
      a.points -= 3;
    } else if (parsedScoreA < parsedScoreB) {
      b.win -= 1;
      a.loss -= 1;
      b.points -= 3;
    } else {
      a.draw -= 1;
      b.draw -= 1;
      a.points -= 1;
      b.points -= 1;
    }

    a.goalsFor = (a.goalsFor ?? 0) - parsedScoreA;
    a.goalsAgainst = (a.goalsAgainst ?? 0) - parsedScoreB;
    b.goalsFor = (b.goalsFor ?? 0) - parsedScoreB;
    b.goalsAgainst = (b.goalsAgainst ?? 0) - parsedScoreA;

    await update(boardRef, {
      [playerA]: a,
      [playerB]: b,
    });

    await update(matchRef, {
      played: false,
      scoreA: null,
      scoreB: null,
      updatedAt: Date.now(),
    });

    await fetchMatches();
  };

  if (status === "waiting") {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" />
        Lịch thi đấu sẽ xuất hiện khi giải đấu bắt đầu.
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <div className="relative w-full sm:flex-1">
          <SearchWithDialogHint
            value={searchKeyword}
            onChanged={setSearchKeyword}
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            onClick={() => setStatusFilter("all")}
          >
            Tất cả
          </Button>
          <Button
            variant={statusFilter === "played" ? "default" : "outline"}
            onClick={() => setStatusFilter("played")}
          >
            Đã thi đấu
          </Button>
          <Button
            variant={statusFilter === "unplayed" ? "default" : "outline"}
            onClick={() => setStatusFilter("unplayed")}
          >
            Chưa thi đấu
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredMatches.map(([id, match]: any, index) => (
          <div
            key={id}
            className="rounded-lg border border-gray-700 bg-card p-4 text-card-foreground shadow-sm"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Badge
                  variant="outline"
                  className={`${
                    match.played && match.scoreA > match.scoreB
                      ? "bg-primary text-accent"
                      : ""
                  } text-md`}
                >
                  {match.playerA}
                </Badge>
                <span> - </span>
                <Badge
                  variant="outline"
                  className={`${
                    match.played && match.scoreB > match.scoreA
                      ? "bg-primary text-accent"
                      : ""
                  } text-md`}
                >
                  {match.playerB}
                </Badge>
              </div>
              <div className="text-right">
                {match.played ? (
                  <Badge className=" text-accent text-xl py-2 px-4">
                    {match.scoreA} - {match.scoreB}
                  </Badge>
                ) : (
                  <Badge className="bg-background text-yellow-400 font-medium">
                    Chưa thi đấu
                  </Badge>
                )}
              </div>
            </div>

            <div className="mt-4">
              {editingId === id ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={editScores.scoreA}
                      onChange={(e) =>
                        setEditScores((s) => ({
                          ...s,
                          scoreA: Number(e.target.value),
                        }))
                      }
                      className="w-16"
                    />
                    <span>-</span>
                    <Input
                      type="number"
                      value={editScores.scoreB}
                      onChange={(e) =>
                        setEditScores((s) => ({
                          ...s,
                          scoreB: Number(e.target.value),
                        }))
                      }
                      className="w-16"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleSave(id)}>
                      Lưu
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingId(null)}
                    >
                      Huỷ
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(id, match)}
                  >
                    Cập nhật
                  </Button>
                  {match.played && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleUndo(id)}
                    >
                      Huỷ kết quả
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
