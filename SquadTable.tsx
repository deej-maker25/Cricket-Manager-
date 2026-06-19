import { GameState } from "@/lib/types";
import { calcOverall } from "@/lib/generators";
import { money } from "@/lib/utils";
import { renewContract, sellPlayer } from "@/lib/gameLogic";

export default function SquadTable({ state, setState }: { state: GameState; setState: (s: GameState)=>void }) {
  const players = [...state.club.squad].sort((a,b)=>calcOverall(b)-calcOverall(a));
  return <div className="card overflow-auto p-4">
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-2xl font-black">Squad</h2>
      <span className="pill">{players.length} players</span>
    </div>
    <table className="w-full min-w-[1000px]">
      <thead><tr><th>Name</th><th>Role</th><th>Age</th><th>Bat</th><th>Bowl</th><th>Keep</th><th>Fit</th><th>Form</th><th>Morale</th><th>Pot</th><th>OVR</th><th>Wage</th><th>Contract</th><th></th></tr></thead>
      <tbody>{players.map(p => <tr key={p.id}>
        <td><div className="font-bold">{p.name}</div><div className="text-xs text-emerald-300">{p.temperament} {p.homegrown ? "· Homegrown" : ""} {p.injuredWeeks>0 ? `· Inj ${p.injuredWeeks}w` : ""}</div></td>
        <td>{p.role}</td><td>{p.age}</td><td>{p.batting}</td><td>{p.bowling}</td><td>{p.keeping}</td><td>{p.fitness}</td><td>{p.form}</td><td>{p.morale}</td><td>{p.potential}</td><td className="font-black">{calcOverall(p)}</td><td>{money(p.weeklyWage)}</td><td>{p.contractYears}y</td>
        <td className="flex gap-2"><button className="btn2" disabled={state.actionsRemaining<=0} onClick={()=>setState(renewContract(state,p.id))}>Renew</button><button className="btn2" disabled={state.actionsRemaining<=0 || state.club.squad.length<=12} onClick={()=>setState(sellPlayer(state,p.id))}>Sell</button></td>
      </tr>)}</tbody>
    </table>
  </div>;
}
