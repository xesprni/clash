import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(num?: number) {
  if (!num || num <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(Math.floor(Math.log(num) / Math.log(1024)), units.length - 1);
  const value = num / Math.pow(1024, i);
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[i]}`;
}

export function formatDuration(ms?: number) {
  if (!ms || ms < 0) return "-";
  if (ms < 1000) return `${ms} ms`;
  const sec = ms / 1000;
  if (sec < 60) return `${sec.toFixed(sec >= 10 ? 0 : 1)} s`;
  const min = Math.floor(sec / 60);
  const remain = Math.round(sec % 60);
  return `${min}m ${remain}s`;
}

export function normalizeBase(input: string) {
  if (!input) return "";
  return input.replace(/\/+$/, "");
}
