"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { onValue, ref, update, get } from "firebase/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

export default function LeagueSchedule() {
  const { leagueId } = useParams();
  const [matches, setMatches] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editScores, setEditScores] = useState({ scoreA: 0, scoreB: 0 });
  const [status, setStatus] = useState<string | null>(null);

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
    const sorted = Object.entries(data).sort((a, b) =>
      a[0].localeCompare(b[0])
    );
    setMatches(sorted);
  };

  useEffect(() => {
    if (status === "started") fetchMatches();
  }, [leagueId, status]);

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

    // Check for invalid input
    if (isNaN(scoreA) || isNaN(scoreB)) {
      alert("Vui lòng nhập số hợp lệ cho tỷ số.");
      return;
    }

    // Cập nhật số trận
    a.played += 1;
    b.played += 1;

    // Cập nhật kết quả thắng / thua / hòa
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

    // Cập nhật số bàn thắng / thua
    a.goalsFor += scoreA;
    a.goalsAgainst += scoreB;

    b.goalsFor += scoreB;
    b.goalsAgainst += scoreA;

    // Cập nhật dữ liệu vào DB
    await update(boardRef, {
      [playerA]: a,
      [playerB]: b,
    });

    await update(matchRef, {
      scoreA,
      scoreB,
      played: true,
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

    // Trừ số trận
    a.played -= 1;
    b.played -= 1;

    // Trừ kết quả
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

    // Trừ bàn thắng / thua
    a.goalsFor = (a.goalsFor ?? 0) - parsedScoreA;
    a.goalsAgainst = (a.goalsAgainst ?? 0) - parsedScoreB;

    b.goalsFor = (b.goalsFor ?? 0) - parsedScoreB;
    b.goalsAgainst = (b.goalsAgainst ?? 0) - parsedScoreA;

    // Cập nhật dữ liệu vào DB
    await update(boardRef, {
      [playerA]: a,
      [playerB]: b,
    });

    await update(matchRef, {
      played: false,
      scoreA: null,
      scoreB: null,
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
      {status === "started" && (
        <h1 className="text-2xl font-bold mb-6">📅 Lịch thi đấu</h1>
      )}
      <div className="space-y-4">
        {matches.map(([id, match]: any, index) => (
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
                  <Badge className="text-xl py-2 px-4">
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
