"use client";

import { Badge } from "@/components/ui/badge";

type MatchScoreDisplayProps = {
  match: {
    playerA: string;
    playerB: string;
    scoreA: number;
    scoreB: number;
    played: boolean;
  };
};

export function MatchScoreDisplay({ match }: MatchScoreDisplayProps) {
  return (
    <div className="flex justify-center gap-10 items-start">
      {/* Player A */}
      <div className="flex flex-col gap-2 items-center">
        <Badge
          variant="outline"
          className={`${
            match.played && match.scoreA >= match.scoreB
              ? "bg-primary text-accent"
              : ""
          } text-md py-1 px-4`}
        >
          {match.playerA}
        </Badge>
        {match.played ? (
          <Badge className="bg-background text-foreground text-lg py-2 px-4">
            {match.scoreA}
          </Badge>
        ) : (
          <Badge className="bg-background text-foreground text-lg py-1 px-4">
            -
          </Badge>
        )}
      </div>

      <div className="text-lg font-semibold mt-3">-</div>

      {/* Player B */}
      <div className="flex flex-col gap-2 items-center">
        <Badge
          variant="outline"
          className={`${
            match.played && match.scoreB >= match.scoreA
              ? "bg-primary text-accent"
              : ""
          } text-md py-1 px-4`}
        >
          {match.playerB}
        </Badge>
        {match.played ? (
          <Badge className="bg-background text-foreground text-lg py-2 px-4">
            {match.scoreB}
          </Badge>
        ) : (
          <Badge className="bg-background text-foreground text-lg py-1 px-4">
            -
          </Badge>
        )}
      </div>
    </div>
  );
}
