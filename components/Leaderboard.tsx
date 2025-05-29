"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { onValue, ref } from "firebase/database";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Table as TableIcon, LayoutGrid } from "lucide-react";

export default function Leaderboard() {
  const { leagueId } = useParams();
  const [leaderboard, setLeaderboard] = useState<any>({});
  const [status, setStatus] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "card">("table");

  useEffect(() => {
    const leagueRef = ref(db, `leagues/${leagueId}`);
    const unsubscribe = onValue(leagueRef, (snapshot) => {
      const data = snapshot.val() || {};
      setLeaderboard(data.leaderboard || {});
      setStatus(data.status || "waiting");
    });
    return () => unsubscribe();
  }, [leagueId]);

  const sorted = Object.entries(leaderboard).sort(([, a]: any, [, b]: any) => {
    const pointsDiff = (b.points ?? 0) - (a.points ?? 0);
    if (pointsDiff !== 0) return pointsDiff;

    const goalDiffA = (a.goalsFor ?? 0) - (a.goalsAgainst ?? 0);
    const goalDiffB = (b.goalsFor ?? 0) - (b.goalsAgainst ?? 0);
    const goalDiff = goalDiffB - goalDiffA;
    if (goalDiff !== 0) return goalDiff;

    return (b.goalsFor ?? 0) - (a.goalsFor ?? 0);
  });

  if (status === "waiting") {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" />
        Bảng xếp hạng sẽ xuất hiện khi giải đấu bắt đầu...
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">🏆 Bảng xếp hạng</h2>
        <div className="space-x-2">
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("table")}
          >
            <TableIcon className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "card" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("card")}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* 👉 Table View */}
      {viewMode === "table" && (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-card z-10">
                  Thứ hạng
                </TableHead>
                <TableHead className="sticky left-[60px] bg-card z-10">
                  Người chơi
                </TableHead>
                <TableHead className="text-center">Điểm</TableHead>
                <TableHead className="text-center">Trận đã đấu</TableHead>
                <TableHead className="text-center">Thắng</TableHead>
                <TableHead className="text-center">Hòa</TableHead>
                <TableHead className="text-center">Thua</TableHead>
                <TableHead className="text-center">Bàn thắng</TableHead>
                <TableHead className="text-center">Bàn thua</TableHead>
                <TableHead className="text-center">Hiệu số</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map(([name, stat]: any, idx) => {
                const goalFor = stat.goalsFor ?? 0;
                const goalAgainst = stat.goalsAgainst ?? 0;
                const goalDiff = goalFor - goalAgainst;
                const displayName =
                  idx === 0
                    ? "🥇 " + name
                    : idx === 1
                    ? "🥈 " + name
                    : idx === 2
                    ? "🥉 " + name
                    : name;

                return (
                  <TableRow key={name}>
                    <TableCell className="sticky left-0 bg-card z-10">
                      {idx + 1}
                    </TableCell>
                    <TableCell className="sticky left-[60px] bg-card z-10">
                      {displayName}
                    </TableCell>
                    <TableCell className="text-center text-primary font-semibold">
                      {stat.points}
                    </TableCell>
                    <TableCell className="text-center">{stat.played}</TableCell>
                    <TableCell className="text-center">{stat.win}</TableCell>
                    <TableCell className="text-center">{stat.draw}</TableCell>
                    <TableCell className="text-center">{stat.loss}</TableCell>
                    <TableCell className="text-center">{goalFor}</TableCell>
                    <TableCell className="text-center">{goalAgainst}</TableCell>
                    <TableCell className="text-center">{goalDiff}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* 👉 Mobile Card View */}
      {viewMode === "card" && (
        <div className="grid sm:grid-cols-2 gap-4">
          {sorted.map(([name, stat]: any, idx) => {
            const displayName =
              idx === 0
                ? "🥇 " + name
                : idx === 1
                ? "🥈 " + name
                : idx === 2
                ? "🥉 " + name
                : name;

            const goalFor = stat.goalsFor ?? 0;
            const goalAgainst = stat.goalsAgainst ?? 0;
            const goalDiff = goalFor - goalAgainst;

            return (
              <Card key={name} className="gap-y-2 py-4">
                <CardHeader>
                  <CardTitle className="text-base flex justify-between items-center">
                    <div className="flex items-center gap-2 font-bold">
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          idx === 0
                            ? "bg-yellow-400 text-black"
                            : idx === 1
                            ? "bg-gray-300 text-black"
                            : idx === 2
                            ? "bg-orange-400 text-gray-800"
                            : "bg-muted text-accent-foreground"
                        }`}
                      >
                        #{idx + 1}
                      </span>
                      <span>{name}</span>
                    </div>
                    <span className="text-primary text-lg">
                      {stat.points} điểm
                    </span>
                  </CardTitle>
                </CardHeader>

                <CardContent className="text-xs mx-auto">
                  <div className="grid grid-cols-3 gap-y-2 gap-x-5">
                    <div className="text-left">✅ Thắng: {stat.win}</div>
                    <div className="text-left">🤝 Hòa: {stat.draw}</div>
                    <div className="text-left">❌ Thua: {stat.loss}</div>

                    <div className="text-left">
                      ⚽ Bàn thắng: {stat.goalsFor ?? 0}
                    </div>
                    <div className="text-left">
                      🛡️ Bàn thua: {stat.goalsAgainst ?? 0}
                    </div>
                    <div className="text-left">
                      📊 Hiệu số:{" "}
                      {(stat.goalsFor ?? 0) - (stat.goalsAgainst ?? 0)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
