"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import LeagueSchedule from "@/components/LeagueSchedule";
import Leaderboard from "@/components/Leaderboard";
import LeagueInfo from "@/components/LeagueInfo";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { ref, get, update } from "firebase/database";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function LeagueTablePage() {
  const { leagueId } = useParams();
  const [activeTab, setActiveTab] = useState<"schedule" | "leaderboard">(
    "schedule"
  );
  const [leagueData, setLeagueData] = useState<any>(null);
  const [canFinish, setCanFinish] = useState(false);
  const [winners, setWinners] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const snap = await get(ref(db, `leagues/${leagueId}`));
      const data = snap.val();
      setLeagueData(data);

      // Kiểm tra tất cả trận đã có kết quả
      const matches = data.matches || {};
      const allPlayed = Object.values(matches).every(
        (m: any) => m.played && m.scoreA !== null && m.scoreB !== null
      );
      setCanFinish(allPlayed && data.status !== "finished");

      // Lấy danh sách người thắng
      if (data.status === "finished" || allPlayed) {
        const sorted = Object.entries(data.leaderboard || {})
          .sort(([, a]: any, [, b]: any) => b.points - a.points)
          .slice(0, 3)
          .map(([name]) => name);
        setWinners(sorted);
      }
    };
    fetchData();
  }, [leagueId]);

  const handleFinishLeague = async () => {
    await update(ref(db, `leagues/${leagueId}`), { status: "finished" });
    const snap = await get(ref(db, `leagues/${leagueId}/leaderboard`));
    const sorted = Object.entries(snap.val() || {})
      .sort(([, a]: any, [, b]: any) => b.points - a.points)
      .slice(0, 3)
      .map(([name]) => name);
    setWinners(sorted);
    setCanFinish(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <LeagueInfo />

      <Tabs
        defaultValue="schedule"
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as "schedule" | "leaderboard")}
        className="w-full"
      >
        <TabsList className="w-full flex justify-center mb-4">
          <TabsTrigger value="schedule" className="flex-1">
            📅 Lịch thi đấu
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex-1">
            🏆 Bảng xếp hạng
          </TabsTrigger>
        </TabsList>

        <div className="relative">
          <AnimatePresence mode="wait">
            {activeTab === "schedule" && (
              <TabsContent value="schedule" forceMount>
                <motion.div
                  key="schedule"
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -100, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {leagueData?.status === "finished" && winners.length > 0 && (
                    <Card className="bg-muted mt-6">
                      <CardHeader>
                        <CardTitle className="text-xl">
                          🎉 Kết quả chung cuộc
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-lg font-medium">
                        <p>🥇 Giải Nhất: {winners[0]}</p>
                        <p>🥈 Giải Nhì: {winners[1]}</p>
                        <p>🥉 Giải Ba: {winners[2]}</p>
                      </CardContent>
                    </Card>
                  )}
                  <LeagueSchedule />
                </motion.div>
              </TabsContent>
            )}
            {activeTab === "leaderboard" && (
              <TabsContent value="leaderboard" forceMount>
                <motion.div
                  key="leaderboard"
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -100, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Leaderboard />
                </motion.div>
              </TabsContent>
            )}
          </AnimatePresence>
        </div>
      </Tabs>

      {canFinish && (
        <Button
          className="sticky bottom-0 w-full py-6 text-lg font-bold mt-4"
          variant="destructive"
          onClick={handleFinishLeague}
        >
          🏁 Kết thúc giải đấu
        </Button>
      )}
    </div>
  );
}
