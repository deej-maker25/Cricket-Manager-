import { GameState } from "./types";
const KEY = "cricket-chairman-save-v3";

export function saveGame(state: GameState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function loadGame(): GameState | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as GameState; } catch { return null; }
}

export function clearSave() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}

export function exportSave(state: GameState) {
  return JSON.stringify(state, null, 2);
}

export function importSave(raw: string): GameState | null {
  try { return JSON.parse(raw) as GameState; } catch { return null; }
}
