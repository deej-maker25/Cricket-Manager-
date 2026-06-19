import { GameState } from "@/lib/types";
import { sortedLeague } from "@/lib/gameLogic";
import { DIVISIONS } from "@/lib/constants";

export default function LeagueTable({ state }: { state: GameState }) {
  const table = sortedLeague(state.league);
  return <div className="card overflow-auto p-4">
    <h2 className="text-2xl font-black">{DIVISIONS[state.club.division].name}</h2>
    <table className="mt-3 w-full min-w-[700px]"><thead><tr><th>Pos</th><th>Team</th><th>P</th><th>W</th><th>L</th><th>Pts</th><th>NRR</th><th>Str</th></tr></thead>
    <tbody>{table.map((t,i)=><tr key={t.id} className={t.id===state.club.id ? "bg-emerald-500/10" : ""}><td>{i+1}</td><td className="font-bold">{t.name}</td><td>{t.played}</td><td>{t.wins}</td><td>{t.losses}</td><td>{t.points}</td><td>{t.nrr.toFixed(2)}</td><td>{t.strength}</td></tr>)}</tbody></table>
  </div>;
}
