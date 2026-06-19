import { Club, LeagueTeam, MatchReport, Player, Tactics } from "./types";
import { calcOverall } from "./generators";
import { chance, clamp, id, pick, rand } from "./utils";

function battingPower(players: Player[]) {
  const xi = bestXI(players);
  return Math.round(xi.slice(0, 7).reduce((s, p) => s + p.batting + p.form * 0.18 + p.morale * 0.12 + p.fitness * 0.1, 0) / 7);
}

function bowlingPower(players: Player[]) {
  const xi = bestXI(players);
  return Math.round([...xi].sort((a, b) => b.bowling - a.bowling).slice(0, 6).reduce((s, p) => s + p.bowling + p.form * 0.18 + p.morale * 0.08 + p.fitness * 0.1, 0) / 6);
}

export function bestXI(players: Player[], selection: "Experience" | "Form" | "Youth" | "Balanced" = "Balanced") {
  const available = players.filter(p => p.injuredWeeks <= 0);
  const score = (p: Player) => {
    let s = calcOverall(p);
    if (selection === "Experience") s += p.experience * 0.15 + p.age * 0.2;
    if (selection === "Form") s += p.form * 0.35;
    if (selection === "Youth") s += Math.max(0, 25 - p.age) * 0.8 + p.potential * 0.15;
    return s;
  };
  const keeper = [...available].sort((a, b) => (b.keeping + b.batting * .35) - (a.keeping + a.batting * .35))[0];
  const chosen = keeper ? [keeper] : [];
  const rest = available.filter(p => !chosen.includes(p)).sort((a, b) => score(b) - score(a));
  return [...chosen, ...rest].slice(0, 11);
}

function innings(bat: number, bowl: number, tactics: Tactics, pitch: number) {
  let intent = 0;
  if (tactics.battingApproach === "Aggressive") intent += 13;
  if (tactics.battingApproach === "Conservative") intent -= 8;
  if (tactics.riskLevel === "High") intent += 8;
  if (tactics.riskLevel === "Low") intent -= 5;
  const pitchBoost = (pitch - 50) * 0.25;
  const mean = 108 + bat * 1.55 - bowl * 1.1 + intent + pitchBoost;
  let score = Math.round(mean + rand(-28, 31));
  let wickets = Math.round(5 + (bowl - bat) / 13 + (intent > 10 ? rand(0, 3) : 0) + rand(-2, 3));
  if (tactics.battingApproach === "Conservative") wickets -= 1;
  return { runs: clamp(score, 45, 245), wickets: clamp(wickets, 1, 10) };
}

export function simulateUserMatch(club: Club, opponent: LeagueTeam, week: number, home = true): MatchReport {
  const xi = bestXI(club.squad, club.tactics.selectionPreference);
  const bat = battingPower(xi) + club.staff.manager.rating * 0.08 + (home ? 2 : 0);
  const bowl = bowlingPower(xi) + club.staff.manager.rating * 0.08;
  const oppBat = opponent.strength + rand(-7, 7);
  const oppBowl = opponent.strength + rand(-7, 7);
  const userInn = innings(bat, oppBowl, club.tactics, club.pitchQuality);
  const oppTactics: Tactics = { battingApproach: "Balanced", bowlingApproach: "Balanced", selectionPreference: "Balanced", riskLevel: "Medium" };
  const oppInn = innings(oppBat, bowl, oppTactics, club.pitchQuality);
  const userRuns = userInn.runs + (home ? rand(0, 5) : 0);
  const oppRuns = oppInn.runs;
  const userWon = userRuns === oppRuns ? chance(50) : userRuns > oppRuns;

  const topBat = pick([...xi].sort((a,b)=>b.batting-a.batting).slice(0,5));
  const topBowler = pick([...xi].sort((a,b)=>b.bowling-a.bowling).slice(0,5));
  const runs = clamp(Math.round(topBat.batting * 0.8 + rand(8, 55)), 10, 125);
  const wkts = clamp(Math.round(topBowler.bowling / 24 + rand(0, 3)), 0, 6);
  topBat.seasonRuns += runs; topBat.careerRuns += runs;
  topBowler.seasonWickets += wkts; topBowler.careerWickets += wkts;
  xi.forEach(p => p.matchesPlayed += 1);

  const userScore = `${userRuns}/${userInn.wickets}`;
  const opponentScore = `${oppRuns}/${oppInn.wickets}`;
  const result = userWon
    ? `${club.name} ${userScore} beat ${opponent.name} ${opponentScore} by ${Math.abs(userRuns - oppRuns) || rand(1, 4)} runs`
    : `${opponent.name} ${opponentScore} beat ${club.name} ${userScore} by ${Math.abs(oppRuns - userRuns) || rand(1, 4)} runs`;

  const narrative = userWon
    ? pick(["The chairman's backing looked smart as the side controlled the key moments.", "The fans loved the intent and the dressing room mood has lifted.", "Your tactical direction clicked beautifully in a gritty win."])
    : pick(["A few supporters questioned the club direction after a flat display.", "The manager looked frustrated afterwards and hinted at needing reinforcements.", "A late collapse turned a winnable match into a painful defeat."]);

  return {
    id: id("match"), week, home: home ? club.name : opponent.name, away: home ? opponent.name : club.name,
    homeScore: home ? userScore : opponentScore, awayScore: home ? opponentScore : userScore,
    result, topScorer: `${topBat.name} ${runs}`, bestBowler: `${topBowler.name} ${wkts}/${rand(18, 38)}`,
    playerOfMatch: userWon ? pick([topBat.name, topBowler.name]) : `${opponent.name} star`, narrative, userWon
  };
}

export function simulateCpuResult(a: LeagueTeam, b: LeagueTeam) {
  const swing = a.strength - b.strength + rand(-18, 18);
  const aWin = swing >= 0;
  const nrrSwing = Math.abs(swing) / 90 + Math.random() * 0.35;
  const w = aWin ? a : b;
  const l = aWin ? b : a;
  w.played++; l.played++; w.wins++; l.losses++; w.points += 2;
  w.nrr += nrrSwing; l.nrr -= nrrSwing;
}
