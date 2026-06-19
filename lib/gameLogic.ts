import { DIVISIONS } from "./constants";
import { applyBankruptcyPressure, staffWageBill, totalWeeklyCosts, weeklyIncome } from "./finance";
import { calcOverall, calcValue, calcWage, clubStrength, generateClub, generateLeague, generatePlayer, generateStaffMarket, generateTransferMarket } from "./generators";
import { simulateCpuResult, simulateUserMatch } from "./matchEngine";
import { Club, EventOption, FacilityProject, GameAction, GameState, LeagueTeam, Player, StaffCandidate, TransferTarget } from "./types";
import { chance, clamp, id, money, pick, rand } from "./utils";
import { generateWeeklyEvents } from "./events";

export function newGame(clubName: string): GameState {
  const club = generateClub(clubName || "Weston Waves");
  const state: GameState = {
    version: 3, phase: "league", season: 1, week: 1, maxSeasons: 10, actionsRemaining: 3,
    club, league: generateLeague(club), inbox: [], eventLog: [`${club.name} founded in the ${DIVISIONS[7].name}.`],
    matchReports: [], transferMarket: generateTransferMarket(7, 1), staffMarket: generateStaffMarket(7),
    ashesUnlocked: false
  };
  state.inbox = generateWeeklyEvents(state.club, state.transferMarket);
  return state;
}

export function spendAction(state: GameState, note?: string) {
  const next = clone(state);
  if (next.actionsRemaining <= 0) return next;
  next.actionsRemaining -= 1;
  if (note) next.eventLog.unshift(note);
  return next;
}

export function applyAction(state: GameState, action: GameAction, free = true): GameState {
  let next = clone(state);
  if (!free && next.actionsRemaining <= 0) return next;
  if (!free) next.actionsRemaining -= 1;
  const c = next.club;
  switch (action.type) {
    case "ADJUST_MONEY":
      c.bankBalance += action.amount;
      if (action.note) next.eventLog.unshift(action.note);
      break;
    case "ADJUST_FANS":
      c.fanSatisfaction = clamp(c.fanSatisfaction + action.amount, 0, 100);
      next.eventLog.unshift(action.note);
      break;
    case "ADJUST_REPUTATION":
      c.boardReputation = clamp(c.boardReputation + action.amount, 0, 100);
      next.eventLog.unshift(action.note);
      break;
    case "ADJUST_MANAGER_REL":
      c.staff.manager.relationshipWithBoard = clamp(c.staff.manager.relationshipWithBoard + action.amount, 0, 100);
      next.eventLog.unshift(action.note);
      break;
    case "ACCEPT_PLAYER_SALE":
      c.squad = c.squad.filter(p => p.id !== action.playerId);
      c.bankBalance += action.fee;
      c.fanSatisfaction = clamp(c.fanSatisfaction - 4, 0, 100);
      next.eventLog.unshift(action.note);
      break;
    case "PLAYER_MORALE":
      c.squad = c.squad.map(p => p.id === action.playerId ? { ...p, morale: clamp(p.morale + action.amount, 0, 100), happiness: clamp(p.happiness + action.amount, 0, 100) } : p);
      next.eventLog.unshift(action.note);
      break;
    case "PLAYER_WAGE_RISE":
      c.squad = c.squad.map(p => p.id === action.playerId ? { ...p, weeklyWage: action.wage, contractYears: action.years, morale: clamp(p.morale + 12, 0, 100), happiness: clamp(p.happiness + 12, 0, 100) } : p);
      next.eventLog.unshift(action.note);
      break;
    case "ADD_SCOUT_TARGET":
    case "NOOP":
      next.eventLog.unshift(action.note);
      break;
  }
  return next;
}

export function resolveEvent(state: GameState, eventId: string, option: EventOption): GameState {
  let next = applyAction(state, option.action, true);
  next.inbox = next.inbox.map(e => e.id === eventId ? { ...e, resolved: true } : e);
  next.eventLog.unshift(`Decision: ${option.label} — ${option.effect}`);
  return next;
}

export function adjustPrices(state: GameState, ticket: number, merch: number, food: number): GameState {
  let next = spendAction(state, "Pricing reviewed by the board.");
  next.club.ticketPrice = clamp(ticket, 1, 80);
  next.club.merchandisePrice = clamp(merch, 1, 100);
  next.club.foodDrinkPrice = clamp(food, 1, 30);
  return next;
}

export function setTactics(state: GameState, patch: Partial<Club["tactics"]>): GameState {
  let next = spendAction(state, "Club tactical identity updated.");
  next.club.tactics = { ...next.club.tactics, ...patch };
  return next;
}

export function youthPull(state: GameState): GameState {
  let next = clone(state);
  if (next.actionsRemaining <= 0) return next;
  const cost = 2500 + next.club.youthAcademy * 1800 + (8 - next.club.division) * 900;
  if (next.club.bankBalance < cost) {
    next.eventLog.unshift(`Youth pull failed: need ${money(cost)}.`);
    return next;
  }
  next.actionsRemaining -= 1;
  next.club.bankBalance -= cost;
  const p = generatePlayer(next.club.division, true, next.club.youthAcademy, true);
  p.weeklyWage = Math.max(30, Math.round(p.weeklyWage * 0.55));
  p.value = calcValue(p, next.club.division);
  next.club.squad.push(p);
  next.eventLog.unshift(`Youth pull: ${p.name}, ${p.role}, potential ${p.potential}. Cost ${money(cost)}.`);
  return next;
}

export function bidForPlayer(state: GameState, target: TransferTarget): GameState {
  let next = clone(state);
  if (next.actionsRemaining <= 0) return next;
  if (next.club.bankBalance < target.askingPrice) {
    next.eventLog.unshift(`Bid failed: ${target.player.name} costs ${money(target.askingPrice)}.`);
    return next;
  }
  next.actionsRemaining -= 1;
  const acceptChance = 62 + next.club.staff.manager.rating * 0.08 + next.club.scoutingNetwork * 3 - (target.player.temperament === "Ambitious" && next.club.division > 3 ? 12 : 0);
  if (!chance(acceptChance)) {
    next.eventLog.unshift(`${target.player.name} rejected your contract offer.`);
    return next;
  }
  const p = target.player;
  p.weeklyWage = target.wageDemand;
  p.contractYears = rand(2, 4);
  next.club.bankBalance -= target.askingPrice;
  next.club.squad.push(p);
  next.transferMarket = next.transferMarket.filter(t => t.id !== target.id);
  next.eventLog.unshift(`Signed ${p.name} from ${target.sellingClub} for ${money(target.askingPrice)}.`);
  return next;
}

export function sellPlayer(state: GameState, playerId: string): GameState {
  let next = clone(state);
  if (next.actionsRemaining <= 0 || next.club.squad.length <= 12) return next;
  const p = next.club.squad.find(x => x.id === playerId);
  if (!p) return next;
  next.actionsRemaining -= 1;
  const fee = Math.round(p.value * (0.65 + Math.random() * 0.35));
  next.club.squad = next.club.squad.filter(x => x.id !== playerId);
  next.club.bankBalance += fee;
  next.eventLog.unshift(`Sold ${p.name} for ${money(fee)}.`);
  return next;
}

export function renewContract(state: GameState, playerId: string): GameState {
  let next = clone(state);
  if (next.actionsRemaining <= 0) return next;
  const p = next.club.squad.find(x => x.id === playerId);
  if (!p) return next;
  next.actionsRemaining -= 1;
  const wage = Math.round(p.askingWage * (0.95 + Math.random() * 0.2));
  p.weeklyWage = wage;
  p.contractYears = rand(2, 4);
  p.happiness = clamp(p.happiness + 12, 0, 100);
  p.morale = clamp(p.morale + 8, 0, 100);
  next.eventLog.unshift(`${p.name} renewed for ${money(wage)} per week.`);
  return next;
}

export function hireStaff(state: GameState, candidate: StaffCandidate): GameState {
  let next = clone(state);
  if (next.actionsRemaining <= 0) return next;
  next.actionsRemaining -= 1;
  if (candidate.manager && candidate.role === "manager") {
    const comp = next.club.staff.manager.compensationCost;
    next.club.bankBalance -= comp;
    next.club.staff.manager = candidate.manager;
    next.eventLog.unshift(`Hired ${candidate.manager.name} as manager. Compensation cost ${money(comp)}.`);
  } else if (candidate.coach) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (next.club.staff as any)[candidate.role] = candidate.coach;
    next.eventLog.unshift(`Hired ${candidate.coach.name}.`);
  }
  next.staffMarket = generateStaffMarket(next.club.division);
  return next;
}

export function startFacilityProject(state: GameState, project: Omit<FacilityProject, "id">, cost: number): GameState {
  let next = clone(state);
  if (next.actionsRemaining <= 0) return next;
  if (next.club.bankBalance < cost) {
    next.eventLog.unshift(`Project failed: need ${money(cost)}.`);
    return next;
  }
  next.actionsRemaining -= 1;
  next.club.bankBalance -= cost;
  next.club.projects.push({ ...project, id: id("proj") });
  next.eventLog.unshift(`Started project: ${project.name}. Cost ${money(cost)}.`);
  return next;
}

export function advanceWeek(state: GameState): GameState {
  let next = clone(state);
  if (next.phase === "complete") return next;
  if (next.phase === "ashes") return next;

  const opponent = next.league[(next.week % 7) + 1] || next.league.find(t => t.id !== next.club.id);
  let won = false;
  if (opponent && next.week <= 14) {
    const report = simulateUserMatch(next.club, opponent, next.week, next.week % 2 === 0);
    next.matchReports.unshift(report);
    won = report.userWon;
    updateLeagueForUser(next.league, next.club.id, opponent.id, report.userWon, report);
    const others = next.league.filter(t => t.id !== next.club.id && t.id !== opponent.id);
    for (let i = 0; i < others.length; i += 2) if (others[i+1]) simulateCpuResult(others[i], others[i+1]);
    next.club.fanSatisfaction = clamp(next.club.fanSatisfaction + (won ? 4 : -4), 0, 100);
    next.club.mediaPressure = clamp(next.club.mediaPressure + (won ? -3 : 5), 0, 100);
    next.club.squad = next.club.squad.map(p => ({ ...p, morale: clamp(p.morale + (won ? rand(0, 4) : rand(-5, 1)), 0, 100), form: clamp(p.form + (won ? rand(-1, 5) : rand(-5, 2)), 0, 100) }));
    if (chance(6 - next.club.medicalDepartment)) injureRandomPlayer(next.club);
  }

  const inc = weeklyIncome(next.club, won);
  const costs = totalWeeklyCosts(next.club);
  next.club.bankBalance += inc.total - costs;
  next.eventLog.unshift(`Week ${next.week}: income ${money(inc.total)}, costs ${money(costs)}, attendance ${inc.attendance}.`);
  if (next.matchReports[0]?.week === next.week) next.eventLog.unshift(next.matchReports[0].result);

  tickProjects(next.club, next);
  tickPlayers(next.club);
  const bankruptcy = applyBankruptcyPressure(next.club);
  if (bankruptcy) next.eventLog.unshift(bankruptcy);

  next.week += 1;
  next.actionsRemaining = 3;
  next.transferMarket = generateTransferMarket(next.club.division, next.club.scoutingNetwork);
  next.staffMarket = generateStaffMarket(next.club.division);

  if (next.week > 14) return endSeason(next);

  next.inbox = generateWeeklyEvents(next.club, next.transferMarket);
  return next;
}

function endSeason(state: GameState): GameState {
  let next = clone(state);
  const table = sortedLeague(next.league);
  const pos = table.findIndex(t => t.id === next.club.id) + 1;
  next.lastSeasonPosition = pos;
  next.club.squad.forEach(p => { p.seasonRuns = 0; p.seasonWickets = 0; p.age += 1; p.contractYears -= 1; if (p.injuredWeeks > 0) p.injuredWeeks = Math.max(0, p.injuredWeeks - 2); if (p.age > 31) { p.fitness = clamp(p.fitness - rand(0, 3), 1, 100); p.stamina = clamp(p.stamina - rand(0, 2), 1, 100); }});
  const retired = next.club.squad.filter(p => p.age >= rand(36, 40));
  next.club.squad = next.club.squad.filter(p => !retired.includes(p) && p.contractYears >= 0);
  retired.forEach(p => next.eventLog.unshift(`${p.name} retired.`));
  while (next.club.squad.length < 13) next.club.squad.push(generatePlayer(next.club.division));

  if (pos <= 2 && next.club.division > 1) {
    next.club.division -= 1; next.club.promotions += 1; next.club.bankBalance += DIVISIONS[next.club.division].sponsorBase;
    next.eventLog.unshift(`PROMOTION! ${next.club.name} move up to ${DIVISIONS[next.club.division].name}.`);
    if (next.club.division === 3) next.inbox = [professionalEvent()];
    if (next.club.division === 2) next.inbox = [countyStatusEvent()];
  } else if (pos >= 7 && next.club.division < 7) {
    next.club.division += 1; next.club.relegations += 1; next.eventLog.unshift(`Relegated to ${DIVISIONS[next.club.division].name}.`);
  } else {
    next.eventLog.unshift(`Season finished: ${ordinal(pos)} in ${DIVISIONS[next.club.division].name}.`);
  }

  if (next.club.division === 1 && pos === 1) {
    next.club.trophies.push("County Championship Division One");
    next.ashesUnlocked = true;
    next.inbox = [ashesUnlockEvent()];
    next.eventLog.unshift("You won the County Championship. England selector mode unlocked.");
  }

  if (next.season >= next.maxSeasons) {
    next.phase = next.ashesUnlocked ? "ashes" : "complete";
    if (next.ashesUnlocked) next.ashes = createAshes(next);
    return next;
  }

  next.season += 1; next.week = 1; next.actionsRemaining = 3;
  next.league = generateLeague(next.club);
  next.transferMarket = generateTransferMarket(next.club.division, next.club.scoutingNetwork);
  next.staffMarket = generateStaffMarket(next.club.division);
  if (next.inbox.length === 0) next.inbox = generateWeeklyEvents(next.club, next.transferMarket);
  return next;
}

function updateLeagueForUser(league: LeagueTeam[], userId: string, oppId: string, userWon: boolean, report: { userWon: boolean }) {
  const user = league.find(t => t.id === userId)!;
  const opp = league.find(t => t.id === oppId)!;
  user.played++; opp.played++;
  if (userWon) { user.wins++; user.points += 2; opp.losses++; user.nrr += rand(10, 60)/100; opp.nrr -= rand(10, 60)/100; }
  else { opp.wins++; opp.points += 2; user.losses++; opp.nrr += rand(10, 60)/100; user.nrr -= rand(10, 60)/100; }
  user.strength = Math.round(user.strength * 0.7 + clubStrengthPlaceholder(user.strength) * 0.3);
}
function clubStrengthPlaceholder(n: number) { return n; }

function tickProjects(club: Club, state: GameState) {
  club.projects = club.projects.map(p => ({ ...p, weeksLeft: p.weeksLeft - 1 }));
  const done = club.projects.filter(p => p.weeksLeft <= 0);
  done.forEach(p => {
    if (p.target === "stadiumCapacity") club.stadiumCapacity += p.amount;
    else club[p.target] = clamp((club[p.target] as number) + p.amount, 0, 100) as never;
    state.eventLog.unshift(`Project complete: ${p.name}.`);
  });
  club.projects = club.projects.filter(p => p.weeksLeft > 0);
}

function tickPlayers(club: Club) {
  club.squad.forEach(p => {
    if (p.injuredWeeks > 0) p.injuredWeeks--;
    const coach = p.role === "Batter" ? club.staff.battingCoach.rating : p.role === "Bowler" ? club.staff.bowlingCoach.rating : club.staff.youthCoach.rating;
    const growth = p.age < 25 && calcOverall(p) < p.potential ? rand(0, Math.max(1, Math.round((coach + club.trainingFacilities * 7) / 45))) : 0;
    if (growth > 0) {
      if (p.role === "Batter") p.batting = clamp(p.batting + growth, 1, 99);
      if (p.role === "Bowler") p.bowling = clamp(p.bowling + growth, 1, 99);
      if (p.role === "AllRounder") { p.batting = clamp(p.batting + Math.ceil(growth/2), 1, 99); p.bowling = clamp(p.bowling + Math.ceil(growth/2), 1, 99); }
      if (p.role === "WicketKeeper") p.keeping = clamp(p.keeping + growth, 1, 99);
      p.value = calcValue(p, club.division);
      p.weeklyWage = Math.max(p.weeklyWage, calcWage(calcOverall(p), club.division));
    }
  });
}

function injureRandomPlayer(club: Club) {
  const p = pick(club.squad);
  p.injuredWeeks = rand(1, 5);
  p.fitness = clamp(p.fitness - rand(8, 20), 1, 100);
}

export function sortedLeague(league: LeagueTeam[]) {
  return [...league].sort((a,b)=>b.points-a.points || b.nrr-a.nrr || b.strength-a.strength);
}

function professionalEvent() {
  return { id: id("ev"), kind: "professional" as const, title: "Professional pathway reached", body: "Your club has entered the professional pathway. Players now expect real contracts and the jump is brutal.", options: [
    { label: "Stay cautious and semi-pro", effect: "Safer finances, slower growth.", action: { type: "ADJUST_MONEY" as const, amount: 20000, note: "You chose a cautious semi-pro transition." }},
    { label: "Move towards full-time contracts", effect: "Balanced ambition.", action: { type: "ADJUST_REPUTATION" as const, amount: 8, note: "You committed to full-time standards." }},
    { label: "Invest heavily", effect: "Huge risk, strong reputation.", action: { type: "ADJUST_MONEY" as const, amount: -75000, note: "You invested heavily in the professional pathway." }}
  ]};
}
function countyStatusEvent() {
  return { id: id("ev"), kind: "professional" as const, title: "Full county status achieved", body: "Sponsors, media and better players now take you seriously. Welcome to proper county cricket.", options: [
    { label: "Announce major ambition", effect: "Fans excited, pressure rises.", action: { type: "ADJUST_FANS" as const, amount: 10, note: "County status announcement excited the fans." }},
    { label: "Keep expectations grounded", effect: "Pressure controlled.", action: { type: "ADJUST_REPUTATION" as const, amount: 5, note: "You kept the county status message measured." }}
  ]};
}
function ashesUnlockEvent() {
  return { id: id("ev"), kind: "ashes" as const, title: "England selector invitation", body: "After your County Championship triumph, the ECB wants you as selector for an Ashes tour. Pick the squad. Carry the nation. No pressure.", options: [
    { label: "Accept the selector role", effect: "Ashes mode unlocked.", action: { type: "NOOP" as const, note: "You accepted the England selector role." }}
  ]};
}

export function createAshes(state: GameState) {
  const pool = [
    ...state.club.squad.slice(0, 8).map(p => ({ ...p, county: state.club.name, englandForm: rand(45, 85) })),
    ...Array.from({length: 22}, () => {
      const p = generatePlayer(1);
      return { ...p, county: pick(["Surrey Southbank", "Yorkshire Roses", "Lancashire Lanterns", "Warwick Bears", "Somerset Sabres"]), englandForm: rand(35, 90) };
    })
  ];
  return { active: true, squadPool: pool, selectedSquad: [], selectedXI: [], strategy: "Balanced" as const, testNumber: 1, englandWins: 0, australiaWins: 0, draws: 0, reports: [], complete: false };
}

export function selectAshesSquad(state: GameState, ids: string[]): GameState {
  const next = clone(state);
  if (!next.ashes) return next;
  next.ashes.selectedSquad = ids.slice(0, 16);
  next.ashes.selectedXI = ids.slice(0, 11);
  return next;
}

export function playAshesTest(state: GameState): GameState {
  const next = clone(state);
  const ashes = next.ashes;
  if (!ashes || ashes.complete || ashes.selectedXI.length < 11) return next;
  const xi = ashes.squadPool.filter(p => ashes.selectedXI.includes(p.id));
  const eng = Math.round(xi.reduce((s,p)=>s+calcOverall(p)+p.englandForm*.1,0)/xi.length);
  const aus = rand(78, 88);
  const swing = eng - aus + rand(-14, 14);
  let result = "";
  if (Math.abs(swing) <= 3 && chance(35)) {
    ashes.draws++; result = `Test ${ashes.testNumber}: Draw. England ${rand(280,430)} & ${rand(160,310)}/6, Australia ${rand(260,430)} & ${rand(170,330)}/7.`;
  } else if (swing > 0) {
    ashes.englandWins++; result = `Test ${ashes.testNumber}: England beat Australia by ${rand(2,8)} wickets. ${pick(xi).name} produced a defining performance.`;
  } else {
    ashes.australiaWins++; result = `Test ${ashes.testNumber}: Australia beat England by ${rand(25,160)} runs. Selection questions are already flying.`;
  }
  ashes.reports.unshift(result);
  ashes.testNumber++;
  ashes.squadPool = ashes.squadPool.map(p => ({...p, englandForm: clamp(p.englandForm + rand(-8, 8), 1, 99), injuredWeeks: chance(3) ? rand(1,2) : p.injuredWeeks}));
  if (ashes.testNumber > 5) {
    ashes.complete = true; next.phase = "complete";
    next.eventLog.unshift(ashes.englandWins > ashes.australiaWins ? "England won the Ashes under your selection." : "The Ashes tour ended. The press have opinions.");
  }
  return next;
}

export function finalLegacyScore(state: GameState) {
  const c = state.club;
  let score = 0;
  score += (8 - c.division) * 120;
  score += c.promotions * 90;
  score += c.trophies.length * 180;
  score += Math.max(-100, Math.round(c.bankBalance / 2500));
  score += c.youthAcademy * 25 + c.trainingFacilities * 22 + c.stadiumCapacity / 150;
  score += c.fanSatisfaction * 2;
  if (state.ashes?.complete && state.ashes.englandWins > state.ashes.australiaWins) score += 450;
  return Math.round(score);
}

export function verdict(score: number, ashesWon: boolean) {
  if (ashesWon) return "Ashes-Winning Supremo";
  if (score > 1200) return "Cricket Empire";
  if (score > 950) return "Domestic Giant";
  if (score > 700) return "County Builder";
  if (score > 450) return "Semi-Pro Operator";
  return "Village Hero";
}

function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"], v = n % 100;
  return n + (s[(v-20)%10] || s[v] || s[0]);
}

function clone<T>(x: T): T { return JSON.parse(JSON.stringify(x)); }
