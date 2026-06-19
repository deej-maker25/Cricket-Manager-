import { GameState } from "@/lib/types";
import { setTactics } from "@/lib/gameLogic";

export default function Tactics({ state, setState }: { state: GameState; setState: (s: GameState)=>void }) {
  const t = state.club.tactics;
  const update = (patch: Partial<typeof t>) => setState(setTactics(state, patch));
  return <div className="card p-5">
    <h2 className="text-2xl font-black">Tactics / Club Identity</h2>
    <p className="text-sm text-emerald-200">This costs an action because you are changing board-level direction.</p>
    <div className="mt-4 grid gap-4 md:grid-cols-2">
      <Select label="Batting" value={t.battingApproach} options={["Conservative","Balanced","Aggressive"]} onChange={v=>update({battingApproach:v as any})}/>
      <Select label="Bowling" value={t.bowlingApproach} options={["Defensive Lines","Balanced","Attack Stumps"]} onChange={v=>update({bowlingApproach:v as any})}/>
      <Select label="Selection" value={t.selectionPreference} options={["Experience","Form","Youth","Balanced"]} onChange={v=>update({selectionPreference:v as any})}/>
      <Select label="Risk" value={t.riskLevel} options={["Low","Medium","High"]} onChange={v=>update({riskLevel:v as any})}/>
    </div>
  </div>
}
function Select({label,value,options,onChange}:{label:string;value:string;options:string[];onChange:(v:string)=>void}) {
  return <label className="text-sm font-bold">{label}<select className="input mt-1 w-full" value={value} onChange={e=>onChange(e.target.value)}>{options.map(o=><option key={o}>{o}</option>)}</select></label>
}
