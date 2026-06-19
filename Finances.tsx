import { GameState } from "@/lib/types";
import { adjustPrices } from "@/lib/gameLogic";
import { money } from "@/lib/utils";
import { playerWageBill, staffWageBill, totalWeeklyCosts, weeklyIncome } from "@/lib/finance";
import { useState } from "react";

export default function Finances({ state, setState }: { state: GameState; setState: (s: GameState)=>void }) {
  const [ticket,setTicket] = useState(state.club.ticketPrice);
  const [merch,setMerch] = useState(state.club.merchandisePrice);
  const [food,setFood] = useState(state.club.foodDrinkPrice);
  const inc = weeklyIncome(state.club, state.matchReports[0]?.userWon ?? false);
  return <div className="space-y-4">
    <h2 className="text-2xl font-black">Finances & Pricing</h2>
    <div className="grid gap-3 md:grid-cols-4">
      <div className="card p-4">Bank <b>{money(state.club.bankBalance)}</b></div>
      <div className="card p-4">Projected income <b>{money(inc.total)}</b></div>
      <div className="card p-4">Player wages <b>{money(playerWageBill(state.club))}</b></div>
      <div className="card p-4">Total costs <b>{money(totalWeeklyCosts(state.club))}</b></div>
    </div>
    <div className="card p-5">
      <h3 className="font-black">Set Prices</h3>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <label>Ticket £<input className="input mt-1 w-full" type="number" value={ticket} onChange={e=>setTicket(Number(e.target.value))}/></label>
        <label>Merch £<input className="input mt-1 w-full" type="number" value={merch} onChange={e=>setMerch(Number(e.target.value))}/></label>
        <label>Food/drink £<input className="input mt-1 w-full" type="number" value={food} onChange={e=>setFood(Number(e.target.value))}/></label>
      </div>
      <button className="btn mt-4" disabled={state.actionsRemaining<=0} onClick={()=>setState(adjustPrices(state,ticket,merch,food))}>Use Board Action to Set Prices</button>
    </div>
  </div>;
}
