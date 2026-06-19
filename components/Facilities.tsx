import { GameState } from "@/lib/types";
import { startFacilityProject } from "@/lib/gameLogic";
import { money } from "@/lib/utils";

const projects = [
  { name: "Expand ground by 500", target: "stadiumCapacity", amount: 500, weeksLeft: 5, cost: 25000, description: "More bodies through the gate." },
  { name: "Repair stadium", target: "stadiumCondition", amount: 18, weeksLeft: 3, cost: 14000, description: "Stops fans moaning about the ground." },
  { name: "Improve pitch", target: "pitchQuality", amount: 10, weeksLeft: 4, cost: 18000, description: "Better cricket, fewer lottery pitches." },
  { name: "Training upgrade", target: "trainingFacilities", amount: 1, weeksLeft: 6, cost: 45000, description: "Improves player development." },
  { name: "Youth academy upgrade", target: "youthAcademy", amount: 1, weeksLeft: 7, cost: 52000, description: "Better homegrown prospects." },
  { name: "Scouting network", target: "scoutingNetwork", amount: 1, weeksLeft: 5, cost: 33000, description: "Better transfer market." },
  { name: "Medical department", target: "medicalDepartment", amount: 1, weeksLeft: 5, cost: 30000, description: "Fewer injuries." },
  { name: "Data analysis department", target: "dataAnalysisDepartment", amount: 1, weeksLeft: 5, cost: 35000, description: "Small tactical edge." }
] as const;

export default function Facilities({ state, setState }: { state: GameState; setState: (s: GameState)=>void }) {
  return <div className="space-y-4">
    <h2 className="text-2xl font-black">Facilities</h2>
    <div className="grid gap-3 md:grid-cols-4">
      <div className="card p-4">Capacity <b>{state.club.stadiumCapacity}</b></div>
      <div className="card p-4">Condition <b>{state.club.stadiumCondition}%</b></div>
      <div className="card p-4">Pitch <b>{state.club.pitchQuality}%</b></div>
      <div className="card p-4">Academy <b>{state.club.youthAcademy}</b></div>
    </div>
    {state.club.projects.length > 0 && <div className="card p-4"><h3 className="font-black">Active Projects</h3>{state.club.projects.map(p=><p key={p.id} className="text-sm text-emerald-200">{p.name}: {p.weeksLeft} weeks left</p>)}</div>}
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {projects.map(p => <div key={p.name} className="card p-4"><h3 className="font-black">{p.name}</h3><p className="text-sm text-emerald-200">{p.description}</p><p className="mt-2 text-sm">Cost {money(p.cost)} · {p.weeksLeft} weeks</p><button className="btn mt-3 w-full" disabled={state.actionsRemaining<=0 || state.club.bankBalance < p.cost} onClick={()=>setState(startFacilityProject(state, p, p.cost))}>Start</button></div>)}
    </div>
  </div>;
}
