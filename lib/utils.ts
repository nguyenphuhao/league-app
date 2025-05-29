import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateEstimatedEnd(players: any) {
  const count = Object.keys(players || {}).length;
  const matchCount = (count * (count - 1)) / 2;
  const dayPerMatch = 0.5;
  const days = Math.ceil(matchCount * dayPerMatch);
  const start = new Date(
    players?.[Object.keys(players)[0]]?.joinedAt || new Date()
  );
  const end = new Date(start);
  end.setDate(start.getDate() + days);
  console.log(end);
  return end.toLocaleDateString("vi-VN");
}
