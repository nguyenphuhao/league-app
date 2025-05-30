"use client";

import { Badge } from "@/components/ui/badge";
import { Input } from "./ui/input";

type MatchScoreEditProps = {
  match: {
    playerA: string;
    playerB: string;
    played: boolean;
  };
  scoreA: number;
  scoreB: number;
  onChangeScoreA: (score: number) => void;
  onChangeScoreB: (score: number) => void;
  editable: boolean;
};

export function MatchScoreEdit({
  match,
  scoreA,
  scoreB,
  onChangeScoreA,
  onChangeScoreB,
  editable,
}: MatchScoreEditProps) {
  return (
    <div className="flex justify-center gap-10 items-start">
      {/* Player A */}
      <div className="flex flex-col gap-2 items-center">
        <Badge
          variant="outline"
          className={`${
            match.played && scoreA >= scoreB
              ? "bg-primary text-accent"
              : ""
          } text-md py-1 px-4`}
        >
          {match.playerA}
        </Badge>
        {!editable ? (
          <Badge className="bg-background text-foreground text-lg py-2 px-4">
            {scoreA}
          </Badge>
        ) : (
          <Input
            type="number"
            value={scoreA}
            onChange={(e) => onChangeScoreA(Number(e.target.value))}
            className="w-16 text-lg text-center"
          />
        )}
      </div>

      <div className="text-lg font-semibold mt-3">-</div>

      {/* Player B */}
      <div className="flex flex-col gap-2 items-center">
        <Badge
          variant="outline"
          className={`${
            match.played && scoreB >= scoreA
              ? "bg-primary text-accent"
              : ""
          } text-md py-1 px-4`}
        >
          {match.playerB}
        </Badge>
        {!editable ? (
          <Badge className="bg-background text-foreground text-lg py-2 px-4">
            {scoreB}
          </Badge>
        ) : (
          <Input
            type="number"
            value={scoreB}
            onChange={(e) => onChangeScoreB(Number(e.target.value))}
            className="w-16 text-lg text-center"
          />
        )}
      </div>
    </div>
  );
}