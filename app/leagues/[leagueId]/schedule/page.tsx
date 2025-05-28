'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { get, ref, update } from 'firebase/database';

export default function LeagueSchedulePage() {
  const { leagueId } = useParams();
  const [matches, setMatches] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editScores, setEditScores] = useState({ scoreA: 0, scoreB: 0 });

  const fetchMatches = async () => {
    const matchRef = ref(db, `leagues/${leagueId}/matches`);
    const snapshot = await get(matchRef);
    const data = snapshot.val() || {};
    const sorted = Object.entries(data).sort((a, b) => a[0].localeCompare(b[0]));
    setMatches(sorted);
  };

  useEffect(() => {
    fetchMatches();
  }, [leagueId]);

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

    const init = { played: 0, win: 0, draw: 0, loss: 0, points: 0 };
    const a = board[playerA] || { ...init };
    const b = board[playerB] || { ...init };

    a.played += 1;
    b.played += 1;

    if (editScores.scoreA > editScores.scoreB) {
      a.win += 1;
      b.loss += 1;
      a.points += 3;
    } else if (editScores.scoreA < editScores.scoreB) {
      b.win += 1;
      a.loss += 1;
      b.points += 3;
    } else {
      a.draw += 1;
      b.draw += 1;
      a.points += 1;
      b.points += 1;
    }

    await update(ref(db, `leagues/${leagueId}/leaderboard`), {
      [playerA]: a,
      [playerB]: b,
    });

    await update(matchRef, {
      scoreA: editScores.scoreA,
      scoreB: editScores.scoreB,
      played: true,
    });

    setEditingId(null);
    await fetchMatches();
    alert('Đã cập nhật kết quả và leaderboard!');
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">📅 Lịch thi đấu & Kết quả</h1>
      {matches.length === 0 ? (
        <p>Không có trận đấu nào.</p>
      ) : (
        <ul className="space-y-2">
          {matches.map(([id, match]: any) => (
            <li key={id} className="p-3 border rounded shadow">
              <div className="font-medium mb-1">
                {match.playerA} vs {match.playerB}
              </div>

              {editingId === id ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={editScores.scoreA}
                    onChange={(e) => setEditScores((s) => ({ ...s, scoreA: Number(e.target.value) }))}
                    className="border px-2 py-1 w-16"
                  />
                  <input
                    type="number"
                    value={editScores.scoreB}
                    onChange={(e) => setEditScores((s) => ({ ...s, scoreB: Number(e.target.value) }))}
                    className="border px-2 py-1 w-16"
                  />
                  <button
                    onClick={() => handleSave(id)}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Lưu
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-sm text-gray-600 underline"
                  >
                    Huỷ
                  </button>
                </div>
              ) : (
                <>
                  <div className="text-sm text-gray-700 mb-1">
                    {match.played ? `Kết quả: ${match.scoreA} - ${match.scoreB}` : 'Chưa thi đấu'}
                  </div>
                  <button
                    onClick={() => handleEdit(id, match)}
                    className="text-sm text-blue-600 underline"
                  >
                    Cập nhật
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}