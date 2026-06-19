import { GameState } from "@/lib/types";
import { calcOverall } from "@/lib/generators";
import { playAshesTest, selectAshesSquad } from "@/lib/gameLogic";

export default function AshesMode({ state, setState }: { state: GameState; setState: (s: GameState)=>void }) {
  const ashes = state.ashes;
  if (!ashes) return <div className="card p-5">Ashes not unlocked yet.</div>;
  const pool = [...ashes.squadPool].sort((a,b)=>calcOverall(b)-calcOverall(a));
  const selected = new Set(ashes.selectedSquad);
  const toggle = (id: string) => {
    const ids = selected.has(id) ? ashes.selectedSquad.filter(x=>x!==id) : [...ashes.selectedSquad, id];
    setState(selectAshesSquad(state, ids));
  };
  return <div className="space-y-4">
    <div className="card p-5"><h2 className="text-2xl font-black">England Selector: Ashes Tour</h2><p>Series: England {ashes.englandWins} - {ashes.australiaWins} Australia · Draws {ashes.draws} · Test {Math.min(ashes.testNumber,5)}/5</p><button className="btn mt-3" disabled={ashes.selectedXI.length<11 || ashes.complete} onClick={()=>setState(playAshesTest(state))}>Play Next Test</button></div>
    <div className="card p-4"><h3 className="font-black">Reports</h3>{ashes.reports.map((r,i)=><p key={i} className="mt-2 text-emerald-100/85">{r}</p>)}</div>
    <div className="card overflow-auto p-4"><h3 className="font-black">Select 16-player squad ({ashes.selectedSquad.length}/16)</h3><table className="mt-3 w-full min-w-[850px]"><thead><tr><th></th><th>Name</th><th>County</th><th>Role</th><th>Age</th><th>OVR</th><th>Form</th></tr></thead><tbody>{pool.map(p=><tr key={p.id}><td><input type="checkbox" checked={selected.has(p.id)} disabled={!selected.has(p.id)&&ashes.selectedSquad.length>=16} onChange={()=>toggle(p.id)}/></td><td>{p.name}</td><td>{p.county}</td><td>{p.role}</td><td>{p.age}</td><td>{calcOverall(p)}</td><td>{p.englandForm}</td></tr>)}</tbody></table></div>
  </div>;
}
