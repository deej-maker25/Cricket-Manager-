 "use client";

import { useEffect, useState } from "react";
import Dashboard from "@/components/Dashboard";
import Inbox from "@/components/Inbox";
import SquadTable from "@/components/SquadTable";
import Transfers from "@/components/Transfers";
import Staff from "@/components/Staff";
import Facilities from "@/components/Facilities";
import Finances from "@/components/Finances";
import Tactics from "@/components/Tactics";
import LeagueTable from "@/components/LeagueTable";
import AshesMode from "@/components/AshesMode";
import { clearSave, exportSave, importSave, loadGame, saveGame } from "@/lib/storage";
import { advanceWeek, finalLegacyScore, newGame, verdict, youthPull } from "@/lib/gameLogic";
import { GameState, Tab } from "@/lib/types";
import { DIVISIONS } from "@/lib/constants";
import { money } from "@/lib/utils";

const tabs: Tab[] = ["Dashboard","Inbox","Squad","Transfers","Contracts","Staff","Tactics","Facilities","Finances","League","Ashes"];

export default function Page() {
  const [state, setState] = useState<GameState | null>(null);
  const [clubName, setClubName] = useState("Weston Waves");
  const [tab, setTab] = useState<Tab>("Dashboard");
  const [importBox, setImportBox] = useState("");

  useEffect(() => {
    const loaded = loadGame();
    if (loaded) setState(loaded);
  }, []);
  useEffect(() => { if (state) saveGame(state); }, [state]);

  if (!state) return <main className="min-h-screen p-6">
    <div className="mx-auto max-w-3xl card p-8">
      <h1 className="text-4xl font-black">Cricket Chairman</h1>
      <p className="mt-3 text-emerald-100/85">Take a tiny village cricket club up the pyramid, survive the finances, build a county giant, then maybe select England for the Ashes.</p>
      <div className="mt-6 flex gap-3">
        <input className="input flex-1" value={clubName} onChange={e=>setClubName(e.target.value)} placeholder="Club name"/>
        <button className="btn" onClick={()=>setState(newGame(clubName))}>Start Save</button>
      </div>
    </div>
  </main>;

  const score = finalLegacyScore(state);
  const ashesWon = !!state.ashes?.complete && state.ashes.englandWins > state.ashes.australiaWins;

  return <main className="min-h-screen p-4 lg:p-6">
    <div className="mx-auto max-w-7xl">
      <header className="mb-4 flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-3xl font-black">Cricket Chairman</h1>
          <p className="text-emerald-200">{state.club.name} · {DIVISIONS[state.club.division].name} · Bank {money(state.club.bankBalance)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn2" onClick={()=>setState(youthPull(state))} disabled={state.actionsRemaining<=0}>Youth Pull</button>
          <button className="btn2" onClick={()=>navigator.clipboard.writeText(exportSave(state))}>Copy Save JSON</button>
          <button className="btnDanger" onClick={()=>{clearSave(); setState(null);}}>Reset</button>
        </div>
      </header>

      <nav className="mb-5 flex flex-wrap gap-2">
        {tabs.map(t => <button key={t} className={tab===t ? "btn" : "btn2"} onClick={()=>setTab(t)}>{t}{t==="Inbox" ? ` (${state.inbox.filter(e=>!e.resolved).length})` : ""}</button>)}
      </nav>

      {state.phase === "complete" && <div className="card mb-5 p-6">
        <h2 className="text-3xl font-black">Save Complete</h2>
        <p className="mt-2 text-xl">Legacy Score: {score} · Verdict: <b>{verdict(score, ashesWon)}</b></p>
        <p className="text-emerald-200">Promotions {state.club.promotions} · Relegations {state.club.relegations} · Trophies {state.club.trophies.length} · Final Level {DIVISIONS[state.club.division].name}</p>
      </div>}

      {tab==="Dashboard" && <Dashboard state={state} onAdvance={()=>setState(advanceWeek(state))}/>}
      {tab==="Inbox" && <Inbox state={state} setState={setState}/>}
      {tab==="Squad" && <SquadTable state={state} setState={setState}/>}
      {tab==="Transfers" && <Transfers state={state} setState={setState}/>}
      {tab==="Contracts" && <SquadTable state={state} setState={setState}/>}
      {tab==="Staff" && <Staff state={state} setState={setState}/>}
      {tab==="Tactics" && <Tactics state={state} setState={setState}/>}
      {tab==="Facilities" && <Facilities state={state} setState={setState}/>}
      {tab==="Finances" && <Finances state={state} setState={setState}/>}
      {tab==="League" && <LeagueTable state={state}/>}
      {tab==="Ashes" && <AshesMode state={state} setState={setState}/>}

      <section className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="card p-4">
          <h3 className="font-black">Board Log</h3>
          <div className="mt-2 max-h-64 overflow-auto space-y-1 text-sm text-emerald-100/80">
            {state.eventLog.slice(0,80).map((e,i)=><p key={i}>• {e}</p>)}
          </div>
        </div>
        <div className="card p-4">
          <h3 className="font-black">Import Save JSON</h3>
          <textarea className="input mt-2 h-28 w-full" value={importBox} onChange={e=>setImportBox(e.target.value)} />
          <button className="btn mt-2" onClick={()=>{const s=importSave(importBox); if(s) setState(s);}}>Import</button>
        </div>
      </section>
    </div>
  </main>;
}
