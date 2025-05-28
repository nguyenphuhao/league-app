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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Leaderboard() {
  const { leagueId } = useParams();
  const [leaderboard, setLeaderboard] = useState<any>({});
  const [status, setStatus] = useState("");

  useEffect(() => {
    const leagueRef = ref(db, `leagues/${leagueId}`);
    const unsubscribe = onValue(leagueRef, (snapshot) => {
      const data = snapshot.val() || {};
      setLeaderboard(data.leaderboard || {});
      setStatus(data.status || "waiting");
    });
    return () => unsubscribe();
  }, [leagueId]);

  const sorted = Object.entries(leaderboard).sort(
    ([, a]: any, [, b]: any) => b.points - a.points
  );

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
      <h2 className="text-xl font-bold mb-4">🏆 Bảng xếp hạng</h2>

      {/* 👉 Desktop Table View */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 bg-card z-10">Rank</TableHead>
              <TableHead className="sticky left-[60px] bg-card z-10">Player</TableHead>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TableHead className="text-center">Points</TableHead>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Điểm số: Thắng +3, Hòa +1, Thua +0</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TableHead className="text-center">MP</TableHead>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Số trận đã đấu</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TableHead className="text-center">W</TableHead>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Số trận thắng</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TableHead className="text-center">D</TableHead>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Số trận hòa</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TableHead className="text-center">L</TableHead>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Số trận thua</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TableHead className="text-center">GF</TableHead>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Bàn thắng: Tổng số bàn đã ghi</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TableHead className="text-center">GA</TableHead>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Bàn thua: Tổng số bàn bị thủng lưới</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TableHead className="text-center">GD</TableHead>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Hiệu số bàn thắng bại: GF - GA</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableRow>
          </TableHeader>

          <TableBody>
            {sorted.map(([name, stat]: any, idx) => {
              const colorClass =
                idx === 0
                  ? "text-yellow-400 font-bold"
                  : idx === 1
                  ? "text-gray-200 font-bold"
                  : idx === 2
                  ? "text-orange-400 font-bold"
                  : "text-gray-100";

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
                <TableRow key={name}>
                  <TableCell className="sticky left-0 bg-card z-10">
                    {idx + 1}
                  </TableCell>
                  <TableCell
                    className={`sticky left-[60px] bg-card z-10 ${colorClass}`}
                  >
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

      {/* 👉 Mobile Card View */}
      <div className="space-y-4 md:hidden">
        {sorted.map(([name, stat]: any, idx) => {
          const displayName =
            idx === 0
              ? "🥇 " + name
              : idx === 1
              ? "🥈 " + name
              : idx === 2
              ? "🥉 " + name
              : name;

          return (
            <Card key={name}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex justify-between items-center">
                  <span>{displayName}</span>
                  <span className="text-primary font-bold text-xl">
                    {stat.points} pts
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-y-1 text-sm">
                <span className="text-muted-foreground">Rank</span>
                <span>#{idx + 1}</span>

                <span className="text-muted-foreground">MP</span>
                <span>{stat.played}</span>

                <span className="text-muted-foreground">W</span>
                <span>{stat.win}</span>

                <span className="text-muted-foreground">D</span>
                <span>{stat.draw}</span>

                <span className="text-muted-foreground">L</span>
                <span>{stat.loss}</span>

                <span className="text-muted-foreground">GF</span>
                <span>{stat.goalsFor ?? 0}</span>

                <span className="text-muted-foreground">GA</span>
                <span>{stat.goalsAgainst ?? 0}</span>

                <span className="text-muted-foreground">GD</span>
                <span>{(stat.goalsFor ?? 0) - (stat.goalsAgainst ?? 0)}</span>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
