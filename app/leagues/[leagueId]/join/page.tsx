'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { onValue, ref, set } from 'firebase/database';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

const leagueFormat: any = {
  'round-robin': 'Đấu vòng tròn',
}

export default function JoinLeaguePage() {
  const { leagueId } = useParams();
  const router = useRouter();

  const [league, setLeague] = useState<any>(null);
  const [playerName, setPlayerName] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!leagueId) return;
    const leagueRef = ref(db, `leagues/${leagueId}`);
    const unsubscribe = onValue(leagueRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.status === 'waiting') {
        setLeague(data);
      }
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
    setOpen(false);
    router.push(`/leagues/${leagueId}`);
  };

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
                <p><strong>Tên:</strong> {league.name}</p>
                <p><strong>Ngày tạo:</strong> {new Date(league.createdAt).toLocaleString()}</p>
                <p>
                  <strong>Người tham gia:</strong>{' '}
                  <Badge>{Object.keys(league.players || {}).length}</Badge>
                </p>
                <p><strong>Thể thức:</strong> {leagueFormat[league.format]}</p>
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
            <p className="text-muted-foreground">Không tìm thấy thông tin giải đấu hoặc giải đã bắt đầu.</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận tham gia</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn tham gia giải đấu <strong>{league?.name}</strong> không?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setOpen(false)}>Huỷ</Button>
              <Button className='text-accent' onClick={handleConfirmJoin}>Xác nhận</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}