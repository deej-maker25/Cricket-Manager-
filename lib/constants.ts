export const DIVISIONS: Record<number, {
  name: string;
  short: string;
  avgStrength: number;
  wageMultiplier: number;
  sponsorBase: number;
  attendanceBase: number;
  pressure: number;
}> = {
  7: { name: "Local Village League", short: "Village", avgStrength: 28, wageMultiplier: 0.25, sponsorBase: 6000, attendanceBase: 180, pressure: 8 },
  6: { name: "Regional Club League", short: "Regional", avgStrength: 36, wageMultiplier: 0.38, sponsorBase: 12000, attendanceBase: 350, pressure: 14 },
  5: { name: "National Club League", short: "National Club", avgStrength: 45, wageMultiplier: 0.55, sponsorBase: 26000, attendanceBase: 700, pressure: 22 },
  4: { name: "National Counties", short: "Nat Counties", avgStrength: 55, wageMultiplier: 0.78, sponsorBase: 52000, attendanceBase: 1400, pressure: 33 },
  3: { name: "County Development Level", short: "Dev County", avgStrength: 64, wageMultiplier: 1.1, sponsorBase: 95000, attendanceBase: 2500, pressure: 46 },
  2: { name: "County Championship Division Two", short: "CC Div 2", avgStrength: 73, wageMultiplier: 1.65, sponsorBase: 180000, attendanceBase: 5200, pressure: 62 },
  1: { name: "County Championship Division One", short: "CC Div 1", avgStrength: 82, wageMultiplier: 2.25, sponsorBase: 330000, attendanceBase: 9000, pressure: 80 }
};

export const RIVAL_NAMES = [
  "Taunton Oaks", "Bath Romans CC", "Bristol Harbours", "Cardiff Dragons", "Devon Ducks",
  "Cornwall Kings", "Exeter Falcons", "Gloucester Griffs", "Reading Royals CC", "Worcester Pears",
  "Kentish Spitfires", "Sussex Sharksmen", "Surrey Southbank", "Lancashire Lanterns",
  "Yorkshire Roses", "Nottingham Outlaws", "Derby Rams CC", "Durham Saints", "Essex Eaglesham",
  "Hampshire Harbour", "Middlesex Metro", "Warwick Bears", "Somerset Sabres", "Bolton Bouncers"
];

export const FIRST_NAMES = [
  "Tom", "Jack", "Ben", "Sam", "Lewis", "Harry", "Joe", "Dan", "Adam", "Ollie", "Archie",
  "George", "Will", "Charlie", "Max", "Jacob", "Ethan", "Noah", "Toby", "Finley", "Alfie",
  "Callum", "Ryan", "Luke", "Marcus", "Ravi", "Ayaan", "Kieran", "Theo", "Jude", "Freddie"
];

export const LAST_NAMES = [
  "Turner", "Parsons", "Hudson", "Berry", "Sealey", "Druce", "Knight", "Page", "Parker",
  "Milne", "Oliver", "Goodwin", "Stanley", "Bird", "Pratlett", "Anderson", "Halkes",
  "Harding", "Ellway", "Neale", "Mason", "Poole", "Patel", "Khan", "Singh", "Brooks",
  "Morgan", "Carter", "Webb", "Cole"
];

export const NATIONALITIES = ["England", "England", "England", "Wales", "Scotland", "Ireland", "Australia", "New Zealand", "South Africa", "India", "Pakistan", "West Indies"];

export const CLUB_NICKNAMES = ["Waves", "Bats", "Oaks", "Sabres", "Falcons", "Foxes", "Dragons", "Saints"];
