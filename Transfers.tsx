import { GameState } from "@/lib/types";
import { bidForPlayer } from "@/lib/gameLogic";
import { calcOverall } from "@/lib/generators";
import { money } from "@/lib/utils";

export default function Transfers({ state, setState }: { state: GameState; setState: (s: GameState)=>void }) {
  return <div className="space-y-4">
    <h2 className="text-2xl font-black">Transfer Market</h2>
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {state.transferMarket.map(t => <div key={t.id} className="card p-4">
        <div className="flex justify-between gap-3"><div><h3 className="font-black">{t.player.name}</h3><p className="text-sm text-emerald-300">{t.player.age} · {t.player.role} · {t.player.temperament}</p></div><span className="pill">OVR {calcOverall(t.player)}</span></div>
        <div className="mt-3 grid grid-cols-4 gap-2 text-sm"><span>Bat {t.player.batting}</span><span>Bowl {t.player.bowling}</span><span>Fit {t.player.fitness}</span><span>Pot {t.player.potential}</span></div>
        <p className="mt-3 text-sm">Club: {t.sellingClub}</p>
        <p className="text-sm">Fee: <b>{money(t.askingPrice)}</b> · Wage: <b>{money(t.wageDemand)}</b>/w</p>
        <button className="btn mt-4 w-full" disabled={state.actionsRemaining<=0 || state.club.bankBalance < t.askingPrice} onClick={()=>setState(bidForPlayer(state,t))}>Bid / Negotiate</button>
      </div>)}
    </div>
  </div>;
}
