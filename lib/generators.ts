import { Club, Coach, LeagueTeam, Manager, Player, Role, Staff, StaffCandidate, Style, Tactics, Temperament, TransferTarget } from "./types";
import { chance, clamp, id, pick, rand } from "./utils";
import { CLUB_NICKNAMES, DIVISIONS, FIRST_NAMES, LAST_NAMES, NATIONALITIES, RIVAL_NAMES } from "./constants";

export function calcOverall(p: Player) {
  return Math.round(
    p.batting * 0.24 + p.bowling * 0.24 + p.fielding * 0.13 + p.keeping * 0.06 +
    p.fitness * 0.08 + p.stamina * 0.08 + p.form * 0.09 + p.morale * 0.08
  );
}

export function calcValue(p: Player, division = 7) {
  const overall = calcOverall(p);
  const youthBonus = p.age <= 22 ? 1.35 : p.age <= 27 ? 1.12 : p.age >= 33 ? 0.55 : 1;
  const potBonus = 1 + Math.max(0, p.potential - overall) / 90;
  const divBonus = 0.7 + (8 - division) * 0.18;
  return Math.max(1000, Math.round(overall * overall * 35 * youthBonus * potBonus * divBonus));
}

export function calcWage(overall: number, division: number) {
  const mult = DIVISIONS[division].wageMultiplier;
  return Math.max(40, Math.round((overall * overall * 0.55 + 80) * mult));
}

export function playerName() {
  return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
}

export function generatePlayer(division: number, young = false, academy = 1, homegrown = false): Player {
  const base = DIVISIONS[division].avgStrength;
  const age = young ? rand(16, 20) : rand(18, 35);
  const role = pick<Role>(["Batter", "Bowler", "AllRounder", "WicketKeeper"]);
  const spread = young ? 18 : 14;
  let batting = clamp(rand(base - spread, base + spread), 8, 96);
  let bowling = clamp(rand(base - spread, base + spread), 8, 96);
  let keeping = clamp(rand(8, base + 8), 1, 96);
  const fielding = clamp(rand(base - spread, base + spread), 8, 96);
  const fitness = clamp(rand(base - 12, base + 18), 10, 98);
  const stamina = clamp(rand(base - 12, base + 18), 10, 98);

  if (role === "Batter") batting = clamp(batting + rand(12, 24), 1, 99);
  if (role === "Bowler") bowling = clamp(bowling + rand(12, 24), 1, 99);
  if (role === "AllRounder") { batting = clamp(batting + rand(5, 14), 1, 99); bowling = clamp(bowling + rand(5, 14), 1, 99); }
  if (role === "WicketKeeper") { keeping = clamp(keeping + rand(25, 45), 1, 99); batting = clamp(batting + rand(4, 15), 1, 99); }

  const temperament = pick<Temperament>(["Professional", "Calm", "Ambitious", "Temperamental", "Lazy", "Leader"]);
  const potential = clamp(base + rand(8, 34) + (young ? academy * rand(2, 6) : 0), 20, 99);

  const p: Player = {
    id: id("p"), name: playerName(), age, nationality: homegrown ? "England" : pick(NATIONALITIES), role,
    batting, bowling, keeping, fielding, fitness, stamina,
    form: rand(35, 78), potential, morale: rand(45, 75), loyalty: rand(35, 85),
    temperament, contractYears: young ? rand(1, 3) : rand(1, 4),
    weeklyWage: 0, value: 0, askingWage: 0, transferListed: false, injuredWeeks: 0,
    happiness: rand(45, 80), squadStatus: young ? "Prospect" : pick(["First Team", "Rotation", "Backup"]),
    experience: young ? rand(1, 16) : rand(20, 85), leadership: temperament === "Leader" ? rand(65, 95) : rand(10, 70),
    homegrown, generatedByAcademy: homegrown, overseas: false,
    careerRuns: 0, careerWickets: 0, seasonRuns: 0, seasonWickets: 0, matchesPlayed: 0
  };
  const ov = calcOverall(p);
  p.weeklyWage = calcWage(ov, division);
  p.askingWage = Math.round(p.weeklyWage * (1.15 + Math.random() * 0.5));
  p.value = calcValue(p, division);
  return p;
}

export function generateManager(division: number): Manager {
  const rating = clamp(DIVISIONS[division].avgStrength + rand(-10, 16), 18, 95);
  const style = pick<Style>(["Aggressive", "Balanced", "Defensive", "Youth Focus", "Data Driven"]);
  return {
    id: id("m"), name: playerName(), age: rand(34, 67), rating, preferredStyle: style,
    wage: Math.round(calcWage(rating, division) * 1.4), contractYears: rand(1, 4),
    patience: rand(35, 85), fanApproval: rand(35, 75), relationshipWithBoard: rand(45, 75),
    compensationCost: Math.round(calcWage(rating, division) * rand(8, 18))
  };
}

export function generateCoach(division: number, label = ""): Coach {
  const rating = clamp(DIVISIONS[division].avgStrength + rand(-14, 13), 12, 95);
  return { id: id("c"), name: `${playerName()}${label ? ` (${label})` : ""}`, rating, wage: Math.round(calcWage(rating, division) * 0.75) };
}

export function generateStaff(division: number): Staff {
  return {
    manager: generateManager(division),
    battingCoach: generateCoach(division, "Batting"),
    bowlingCoach: generateCoach(division, "Bowling"),
    fieldingCoach: generateCoach(division, "Fielding"),
    fitnessCoach: generateCoach(division, "Fitness"),
    youthCoach: generateCoach(division, "Youth"),
    scout: generateCoach(division, "Scout"),
    physio: generateCoach(division, "Physio"),
    analyst: generateCoach(division, "Analyst")
  };
}

export function generateClub(name: string): Club {
  const division = 7;
  const squad = Array.from({ length: 16 }, () => generatePlayer(division));
  return {
    id: id("club"), name, nickname: pick(CLUB_NICKNAMES), division,
    bankBalance: 45000, debt: 0, fanSatisfaction: 58, boardReputation: 45, mediaPressure: 8,
    ticketPrice: 5, merchandisePrice: 18, foodDrinkPrice: 4,
    stadiumCapacity: 450, stadiumCondition: 48, pitchQuality: 42,
    trainingFacilities: 1, youthAcademy: 1, scoutingNetwork: 1, medicalDepartment: 1, dataAnalysisDepartment: 0,
    trophies: [], promotions: 0, relegations: 0, squad, staff: generateStaff(division),
    tactics: { battingApproach: "Balanced", bowlingApproach: "Balanced", selectionPreference: "Balanced", riskLevel: "Medium" },
    projects: []
  };
}

export function generateLeague(userClub: Club): LeagueTeam[] {
  const div = userClub.division;
  const used = new Set<string>([userClub.name]);
  const teams: LeagueTeam[] = [{
    id: userClub.id, name: userClub.name, division: div, strength: clubStrength(userClub),
    played: 0, wins: 0, losses: 0, points: 0, nrr: 0
  }];
  while (teams.length < 8) {
    const n = pick(RIVAL_NAMES);
    if (used.has(n)) continue;
    used.add(n);
    teams.push({ id: id("team"), name: n, division: div, strength: clamp(DIVISIONS[div].avgStrength + rand(-8, 10), 12, 96), played: 0, wins: 0, losses: 0, points: 0, nrr: 0 });
  }
  return teams;
}

export function clubStrength(club: Club) {
  const best = [...club.squad].sort((a, b) => calcOverall(b) - calcOverall(a)).slice(0, 11);
  const squad = best.reduce((s, p) => s + calcOverall(p), 0) / Math.max(1, best.length);
  const staff = club.staff.manager.rating * 0.13;
  const fac = (club.trainingFacilities + club.dataAnalysisDepartment) * 0.8;
  return Math.round(squad * 0.83 + staff + fac);
}

export function generateTransferMarket(division: number, scouting = 1): TransferTarget[] {
  const count = 6 + scouting;
  return Array.from({ length: count }, () => {
    const p = generatePlayer(clamp(division + rand(-1, 1), 1, 7));
    const asking = Math.round(p.value * (1.05 + Math.random() * 0.45));
    return { id: id("t"), player: p, askingPrice: asking, wageDemand: Math.round(p.askingWage * (1.05 + Math.random() * 0.35)), sellingClub: pick(RIVAL_NAMES) };
  }).sort((a, b) => a.askingPrice - b.askingPrice);
}

export function generateStaffMarket(division: number): StaffCandidate[] {
  return [
    { role: "manager", manager: generateManager(division) },
    { role: "battingCoach", coach: generateCoach(division, "Batting") },
    { role: "bowlingCoach", coach: generateCoach(division, "Bowling") },
    { role: "youthCoach", coach: generateCoach(division, "Youth") },
    { role: "scout", coach: generateCoach(division, "Scout") },
    { role: "physio", coach: generateCoach(division, "Physio") },
    { role: "analyst", coach: generateCoach(division, "Analyst") }
  ];
}
