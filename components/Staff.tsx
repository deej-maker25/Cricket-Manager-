import { GameState } from "@/lib/types";
import { hireStaff } from "@/lib/gameLogic";
import { money } from "@/lib/utils";

export default function Staff({ state, setState }: { state: GameState; setState: (s: GameState)=>void }) {
  const s = state.club.staff;
  const rows = [
    ["Manager", s.manager.name, s.manager.rating, s.manager.wage, s.manager.preferredStyle],
    ["Batting", s.battingCoach.name, s.battingCoach.rating, s.battingCoach.wage, ""],
    ["Bowling", s.bowlingCoach.name, s.bowlingCoach.rating, s.bowlingCoach.wage, ""],
    ["Youth", s.youthCoach.name, s.youthCoach.rating, s.youthCoach.wage, ""],
    ["Scout", s.scout.name, s.scout.rating, s.scout.wage, ""],
    ["Physio", s.physio.name, s.physio.rating, s.physio.wage, ""],
    ["Analyst", s.analyst.name, s.analyst.rating, s.analyst.wage, ""]
  ] as const;
  return <div className="space-y-4">
    <div className="card p-4"><h2 className="text-2xl font-black">Current Staff</h2><table className="mt-3 w-full"><thead><tr><th>Role</th><th>Name</th><th>Rating</th><th>Wage</th><th>Style</th></tr></thead><tbody>{rows.map(r=><tr key={r[0]}><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{money(Number(r[3]))}</td><td>{r[4]}</td></tr>)}</tbody></table></div>
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {state.staffMarket.map((cand,i) => {
        const item = cand.manager || cand.coach!;
        return <div key={i} className="card p-4"><span className="pill">{cand.role}</span><h3 className="mt-2 font-black">{item.name}</h3><p>Rating {item.rating} · Wage {money(item.wage)}/w</p>{"preferredStyle" in item && <p className="text-sm text-emerald-300">Style: {item.preferredStyle}</p>}<button className="btn mt-3 w-full" disabled={state.actionsRemaining<=0} onClick={()=>setState(hireStaff(state,cand))}>Hire</button></div>
      })}
    </div>
  </div>;
}
