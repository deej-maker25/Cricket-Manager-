import StatCard from "./StatCard";
import { GameState } from "@/lib/types";
import { DIVISIONS } from "@/lib/constants";
import { money } from "@/lib/utils";
import { playerWageBill, staffWageBill, totalWeeklyCosts, priceWarning } from "@/lib/finance";
import { sortedLeague } from "@/lib/gameLogic";

export default function Dashboard({ state, onAdvance }: { state: GameState; onAdvance: () => void }) {
  const c = state.club;
  const pos = sortedLeague(state.league).findIndex(t => t.id === c.id) + 1;
  return <div className="space-y-4">
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard label="Season / Week" value={`${state.season}/${state.maxSeasons} · W${state.week}`} sub={`${state.actionsRemaining} board actions left`} />
      <StatCard label="Division" value={DIVISIONS[c.division].short} sub={DIVISIONS[c.division].name} />
      <StatCard label="Bank" value={money(c.bankBalance)} sub={`Costs/week ${money(totalWeeklyCosts(c))}`} />
      <StatCard label="League Position" value={pos ? `${pos}/8` : "-"} sub="Top 2 promoted, bottom 2 relegated" />
      <StatCard label="Fans" value={`${c.fanSatisfaction}%`} sub={`Media pressure ${c.mediaPressure}%`} />
      <StatCard label="Stadium" value={c.stadiumCapacity.toLocaleString("en-GB")} sub={`Condition ${c.stadiumCondition}%`} />
      <StatCard label="Academy" value={c.youthAcademy} sub={`Training ${c.trainingFacilities} · Scout ${c.scoutingNetwork}`} />
      <StatCard label="Wages" value={money(playerWageBill(c)+staffWageBill(c))} sub="Players + staff weekly" />
    </div>

    <div className="card p-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-black">{c.name}</h2>
          <p className="text-emerald-200">{priceWarning(c)}</p>
          <p className="mt-2 text-sm text-emerald-100/75">You are the chairman. Spend actions, respond to inbox chaos, then advance the week.</p>
        </div>
        <button className="btn text-base" onClick={onAdvance}>Advance Week</button>
      </div>
    </div>

    {state.matchReports[0] && <div className="card p-5">
      <h3 className="text-lg font-black">Latest Match</h3>
      <p className="mt-2 text-xl">{state.matchReports[0].result}</p>
      <p className="mt-1 text-sm text-emerald-200">{state.matchReports[0].narrative}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="pill">Top scorer: {state.matchReports[0].topScorer}</span>
        <span className="pill">Best bowler: {state.matchReports[0].bestBowler}</span>
        <span className="pill">POTM: {state.matchReports[0].playerOfMatch}</span>
      </div>
    </div>}
  </div>;
}
