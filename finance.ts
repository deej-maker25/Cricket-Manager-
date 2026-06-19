import { Club } from "./types";
import { DIVISIONS } from "./constants";
import { clamp, money } from "./utils";

export function playerWageBill(club: Club) {
  return club.squad.reduce((s, p) => s + p.weeklyWage, 0);
}

export function staffWageBill(club: Club) {
  const s = club.staff;
  return s.manager.wage + s.battingCoach.wage + s.bowlingCoach.wage + s.fieldingCoach.wage + s.fitnessCoach.wage + s.youthCoach.wage + s.scout.wage + s.physio.wage + s.analyst.wage;
}

export function totalWeeklyCosts(club: Club) {
  const upkeep = 200 + club.stadiumCapacity * 0.12 + (club.trainingFacilities + club.youthAcademy + club.scoutingNetwork + club.medicalDepartment + club.dataAnalysisDepartment) * 350;
  return Math.round(playerWageBill(club) + staffWageBill(club) + upkeep);
}

export function weeklyIncome(club: Club, wonLastMatch: boolean) {
  const div = DIVISIONS[club.division];
  const pricePenalty = Math.max(0.35, 1 - Math.max(0, club.ticketPrice - fairTicketPrice(club.division)) * 0.055);
  const mood = (club.fanSatisfaction / 100) * (wonLastMatch ? 1.08 : 0.95);
  const condition = club.stadiumCondition / 100;
  const demand = div.attendanceBase * mood * pricePenalty * (0.65 + condition * 0.5);
  const attendance = Math.min(club.stadiumCapacity, Math.max(20, Math.round(demand)));
  const tickets = attendance * club.ticketPrice;
  const merch = attendance * Math.max(0.08, 0.24 - club.merchandisePrice / 180) * club.merchandisePrice;
  const food = attendance * Math.max(0.18, 0.55 - club.foodDrinkPrice / 40) * club.foodDrinkPrice;
  const sponsor = Math.round(div.sponsorBase / 14 * (0.75 + club.boardReputation / 150));
  return { attendance, tickets: Math.round(tickets), merch: Math.round(merch), food: Math.round(food), sponsor, total: Math.round(tickets + merch + food + sponsor) };
}

export function fairTicketPrice(division: number) {
  return ({7: 5, 6: 7, 5: 10, 4: 14, 3: 18, 2: 25, 1: 34} as Record<number, number>)[division];
}

export function priceWarning(club: Club) {
  const fair = fairTicketPrice(club.division);
  if (club.ticketPrice > fair * 1.6) return "Fans think tickets are outrageous.";
  if (club.ticketPrice < fair * 0.75) return "Fans love the cheap tickets, but revenue is limited.";
  return "Pricing feels fair for this level.";
}

export function applyBankruptcyPressure(club: Club) {
  if (club.bankBalance >= -50000) return null;
  club.fanSatisfaction = clamp(club.fanSatisfaction - 5, 0, 100);
  club.boardReputation = clamp(club.boardReputation - 6, 0, 100);
  club.mediaPressure = clamp(club.mediaPressure + 8, 0, 100);
  return `Bank warning: the club is ${money(club.bankBalance)} in the red.`;
}
