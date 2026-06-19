import { GameState } from "@/lib/types";
import { resolveEvent } from "@/lib/gameLogic";

export default function Inbox({ state, setState }: { state: GameState; setState: (s: GameState)=>void }) {
  return <div className="space-y-3">
    <h2 className="text-2xl font-black">Chairman's Inbox</h2>
    {state.inbox.map(ev => <div key={ev.id} className={`card p-5 ${ev.resolved ? "opacity-55" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="pill">{ev.kind}</span>
          <h3 className="mt-2 text-xl font-black">{ev.title}</h3>
          <p className="mt-2 text-emerald-100/85">{ev.body}</p>
        </div>
        {ev.resolved && <span className="pill">resolved</span>}
      </div>
      {!ev.resolved && ev.options && <div className="mt-4 grid gap-2 md:grid-cols-3">
        {ev.options.map((op, i) => <button key={i} className="btn2 text-left" onClick={() => setState(resolveEvent(state, ev.id, op))}>
          <div className="font-bold">{op.label}</div>
          <div className="text-xs text-emerald-200/75">{op.effect}</div>
        </button>)}
      </div>}
    </div>)}
  </div>;
}
