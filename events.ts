import { Club, InboxEvent, TransferTarget } from "./types";
import { DIVISIONS } from "./constants";
import { calcOverall } from "./generators";
import { chance, id, money, pick, rand } from "./utils";

export function generateWeeklyEvents(club: Club, market: TransferTarget[]): InboxEvent[] {
  const events: InboxEvent[] = [];
  const expiring = club.squad.filter(p => p.contractYears <= 1);
  const unhappy = club.squad.filter(p => p.happiness < 38 || p.morale < 35);
  const star = [...club.squad].sort((a,b)=>calcOverall(b)-calcOverall(a))[0];

  if (expiring.length && chance(55)) {
    const p = pick(expiring);
    events.push({
      id: id("ev"), kind: "contract", title: `${p.name} wants contract talks`,
      body: `${p.name}'s deal is running down. His agent wants ${money(p.askingWage)} per week and a clearer squad role.`,
      options: [
        { label: "Offer improved deal", effect: `Costs ${money(p.askingWage)} weekly, morale up.`, action: { type: "PLAYER_WAGE_RISE", playerId: p.id, years: 3, wage: p.askingWage, note: `${p.name} signed a new contract.` }},
        { label: "Delay talks", effect: "Saves money now, hurts morale.", action: { type: "PLAYER_MORALE", playerId: p.id, amount: -10, note: `${p.name} is unhappy that talks were delayed.` }},
        { label: "Promise promotion bonus", effect: "Small morale boost, future expectation rises.", action: { type: "PLAYER_MORALE", playerId: p.id, amount: 5, note: `${p.name} accepted a promise for now.` }}
      ]
    });
  }

  if (star && chance(40 + Math.max(0, 4 - club.division) * 7)) {
    const fee = Math.round(star.value * (1.05 + Math.random() * 0.45));
    events.push({
      id: id("ev"), kind: "offer", title: `Bid received for ${star.name}`,
      body: `A higher-level club has offered ${money(fee)} for your ${star.role.toLowerCase()}. ${star.temperament === "Ambitious" ? "His agent says he wants to hear the offer." : "The player is waiting for the club's decision."}`,
      options: [
        { label: "Accept the offer", effect: "Bank boosted, squad weakened.", action: { type: "ACCEPT_PLAYER_SALE", playerId: star.id, fee, note: `${star.name} sold for ${money(fee)}.` }},
        { label: "Reject it", effect: "Fans pleased, player may be annoyed.", action: { type: "PLAYER_MORALE", playerId: star.id, amount: star.temperament === "Ambitious" ? -12 : -3, note: `Offer rejected for ${star.name}.` }},
        { label: "Negotiate higher", effect: "Reputation up, but risk losing deal.", action: { type: "ADJUST_REPUTATION", amount: 3, note: `You pushed back on the offer for ${star.name}.` }}
      ]
    });
  }

  if (club.ticketPrice > fairPrice(club.division) * 1.55 && chance(55)) {
    events.push({
      id: id("ev"), kind: "finance", title: "Fans angry about prices",
      body: `Supporters say ${money(club.ticketPrice)} tickets are taking the mick at ${DIVISIONS[club.division].short} level.`,
      options: [
        { label: "Lower prices", effect: "Fan satisfaction up.", action: { type: "ADJUST_FANS", amount: 8, note: "Ticket backlash cooled after a price review." }},
        { label: "Hold prices", effect: "Money first. Fans unimpressed.", action: { type: "ADJUST_FANS", amount: -6, note: "You held firm on ticket prices." }},
        { label: "Run fan event", effect: "Costs money, improves mood.", action: { type: "ADJUST_MONEY", amount: -3500, note: "Fan open day held at the ground." }}
      ]
    });
  }

  if (club.stadiumCondition < 35 && chance(45)) {
    events.push({ id: id("ev"), kind: "finance", title: "Ground condition criticised", body: "Fans are moaning about cracked seats, weak tea and a scoreboard that looks older than the captain.", options: [
      { label: "Emergency repairs", effect: "Costs money, stadium condition improves via Facilities action later.", action: { type: "ADJUST_MONEY", amount: -7000, note: "Emergency ground repairs paid for." }},
      { label: "Ignore for now", effect: "Saves money, fans drop.", action: { type: "ADJUST_FANS", amount: -7, note: "Ground complaints ignored." }}
    ]});
  }

  if (unhappy.length && chance(45)) {
    const p = pick(unhappy);
    events.push({ id: id("ev"), kind: "decision", title: `${p.name} unhappy`, body: `${p.name} feels undervalued and wants a clearer plan.`, options: [
      { label: "Reassure him", effect: "Morale up.", action: { type: "PLAYER_MORALE", playerId: p.id, amount: 8, note: `${p.name} was reassured.` }},
      { label: "Tell him to earn it", effect: "Risky, but board likes discipline.", action: { type: "ADJUST_REPUTATION", amount: 2, note: `You challenged ${p.name} to improve.` }}
    ]});
  }

  if (club.staff.manager.relationshipWithBoard < 35 && chance(40)) {
    events.push({ id: id("ev"), kind: "staff", title: "Manager relationship strained", body: `${club.staff.manager.name} is irritated by board interference and wants backing.`, options: [
      { label: "Publicly back manager", effect: "Relationship improves.", action: { type: "ADJUST_MANAGER_REL", amount: 10, note: "You backed the manager publicly." }},
      { label: "Apply pressure", effect: "Fans may like ambition, relationship drops.", action: { type: "ADJUST_MANAGER_REL", amount: -8, note: "You put pressure on the manager." }}
    ]});
  }

  if (chance(35)) {
    events.push({ id: id("ev"), kind: "youth", title: "Youth coach has a name", body: "The academy staff think there is a local prospect worth looking at this week. Use a Youth Pull action if you want to bring him in." } as InboxEvent);
  }

  if (events.length === 0) {
    events.push({ id: id("ev"), kind: "info", title: "Quiet week at the club", body: pick([
      "No crisis this week. Dangerous. Cricket clubs hate calm.",
      "The manager reports decent training standards and no major dramas.",
      "Local press are more interested in the pub league than your club this week."
    ])});
  }
  return events.slice(0, rand(1, Math.min(4, events.length)));
}

function fairPrice(division: number) {
  return ({7: 5, 6: 7, 5: 10, 4: 14, 3: 18, 2: 25, 1: 34} as Record<number, number>)[division];
}
