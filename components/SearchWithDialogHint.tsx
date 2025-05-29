"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Info } from "lucide-react";

export function SearchWithDialogHint({
  value,
  onChanged,
}: {
  value: string;
  onChanged: (val: string) => void;
}) {
  const [showHintDialog, setShowHintDialog] = useState(false);

  return (
    <>
      <div className="relative w-full">
        <Input
          placeholder="Tìm theo người chơi. bấm icon hint để xem hướng dẫn..."
          value={value}
          onChange={(e) => onChanged(e.target.value)}
          className="pr-10"
        />
        <Info
          onClick={() => setShowHintDialog(true)}
          className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
      </div>

      <Dialog open={showHintDialog} onOpenChange={setShowHintDialog}>
        <DialogContent className="max-w-sm">
          <DialogTitle className="text-lg font-semibold">
            🔍 Hướng dẫn tìm kiếm
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Bạn có thể tìm kiếm theo tên người chơi hoặc kết hợp nhiều người
            chơi.
          </DialogDescription>
          <div className="space-y-3">
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>
                <strong>Tìm theo 1 người chơi:</strong> "Hảo", "Quang"
              </li>
              <li>
                <strong>Tìm theo cặp thi đấu</strong> "Tân|Quang", "Hảo|Quang",
                "Khang|Jordan"
              </li>
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
