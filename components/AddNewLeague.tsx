'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { push, ref } from 'firebase/database';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function AddNewLeague() {
  const [name, setName] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleConfirmCreate = async () => {
    const leaguesRef = ref(db, 'leagues');
    const newRef = await push(leaguesRef, {
      name,
      status: 'waiting',
      format: 'round-robin',
      createdAt: new Date().toISOString(),
      players: {},
      matches: {},
      leaderboard: {},
    });
    setShowConfirm(false);
    router.push(`/leagues/${newRef.key}`);
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Tạo League mới</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="league-name">Tên giải đấu</Label>
            <Input
              id="league-name"
              type="text"
              placeholder="Nhập tên giải đấu"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <Label htmlFor="league-name">Thể thức: Vòng Tròn</Label>
          <Button onClick={() => setShowConfirm(true)} className="w-full text-accent">
            Tạo giải đấu
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận tạo giải đấu</DialogTitle>
          </DialogHeader>
          <p>Bạn có chắc chắn muốn tạo giải đấu "{name}" không?</p>
          <DialogFooter className="mt-4">
            <Button variant="ghost" onClick={() => setShowConfirm(false)}>
              Huỷ
            </Button>
            <Button onClick={handleConfirmCreate}>Xác nhận</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}