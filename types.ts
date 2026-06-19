export type Role = "Batter" | "Bowler" | "AllRounder" | "WicketKeeper";
export type Temperament = "Professional" | "Calm" | "Ambitious" | "Temperamental" | "Lazy" | "Leader";
export type SquadStatus = "Star" | "First Team" | "Rotation" | "Prospect" | "Backup";
export type Style = "Aggressive" | "Balanced" | "Defensive" | "Youth Focus" | "Data Driven";
export type BattingApproach = "Conservative" | "Balanced" | "Aggressive";
export type BowlingApproach = "Defensive Lines" | "Balanced" | "Attack Stumps";
export type SelectionPreference = "Experience" | "Form" | "Youth" | "Balanced";
export type RiskLevel = "Low" | "Medium" | "High";
export type Tab = "Dashboard" | "Inbox" | "Squad" | "Transfers" | "Contracts" | "Staff" | "Tactics" | "Facilities" | "Finances" | "League" | "Ashes";
export type Phase = "preseason" | "league" | "offseason" | "ashes" | "complete";
export type EventKind = "info" | "decision" | "offer" | "contract" | "injury" | "finance" | "staff" | "youth" | "professional" | "ashes";

export interface Player {
  id: string;
  name: string;
  age: number;
  nationality: string;
  role: Role;
  batting: number;
  bowling: number;
  fielding: number;
  keeping: number;
  fitness: number;
  stamina: number;
  form: number;
  potential: number;
  morale: number;
  loyalty: number;
  temperament: Temperament;
  contractYears: number;
  weeklyWage: number;
  value: number;
  askingWage: number;
  transferListed: boolean;
  injuredWeeks: number;
  happiness: number;
  squadStatus: SquadStatus;
  experience: number;
  leadership: number;
  homegrown: boolean;
  generatedByAcademy: boolean;
  overseas: boolean;
  careerRuns: number;
  careerWickets: number;
  seasonRuns: number;
  seasonWickets: number;
  matchesPlayed: number;
}

export interface Manager {
  id: string;
  name: string;
  age: number;
  rating: number;
  preferredStyle: Style;
  wage: number;
  contractYears: number;
  patience: number;
  fanApproval: number;
  relationshipWithBoard: number;
  compensationCost: number;
}

export interface Coach {
  id: string;
  name: string;
  rating: number;
  wage: number;
}

export interface Staff {
  manager: Manager;
  battingCoach: Coach;
  bowlingCoach: Coach;
  fieldingCoach: Coach;
  fitnessCoach: Coach;
  youthCoach: Coach;
  scout: Coach;
  physio: Coach;
  analyst: Coach;
}

export interface Tactics {
  battingApproach: BattingApproach;
  bowlingApproach: BowlingApproach;
  selectionPreference: SelectionPreference;
  riskLevel: RiskLevel;
}

export interface FacilityProject {
  id: string;
  name: string;
  target: keyof Pick<Club, "stadiumCapacity" | "stadiumCondition" | "pitchQuality" | "trainingFacilities" | "youthAcademy" | "scoutingNetwork" | "medicalDepartment" | "dataAnalysisDepartment">;
  amount: number;
  weeksLeft: number;
  description: string;
}

export interface Club {
  id: string;
  name: string;
  nickname: string;
  division: number;
  bankBalance: number;
  debt: number;
  fanSatisfaction: number;
  boardReputation: number;
  mediaPressure: number;
  ticketPrice: number;
  merchandisePrice: number;
  foodDrinkPrice: number;
  stadiumCapacity: number;
  stadiumCondition: number;
  pitchQuality: number;
  trainingFacilities: number;
  youthAcademy: number;
  scoutingNetwork: number;
  medicalDepartment: number;
  dataAnalysisDepartment: number;
  trophies: string[];
  promotions: number;
  relegations: number;
  squad: Player[];
  staff: Staff;
  tactics: Tactics;
  projects: FacilityProject[];
}

export interface LeagueTeam {
  id: string;
  name: string;
  division: number;
  strength: number;
  played: number;
  wins: number;
  losses: number;
  points: number;
  nrr: number;
}

export interface MatchReport {
  id: string;
  week: number;
  home: string;
  away: string;
  homeScore: string;
  awayScore: string;
  result: string;
  topScorer: string;
  bestBowler: string;
  playerOfMatch: string;
  narrative: string;
  userWon: boolean;
}

export interface InboxEvent {
  id: string;
  kind: EventKind;
  title: string;
  body: string;
  options?: EventOption[];
  resolved?: boolean;
}

export interface EventOption {
  label: string;
  effect: string;
  action: GameAction;
}

export type GameAction =
  | { type: "ADJUST_MONEY"; amount: number; note: string }
  | { type: "ADJUST_FANS"; amount: number; note: string }
  | { type: "ADJUST_REPUTATION"; amount: number; note: string }
  | { type: "ADJUST_MANAGER_REL"; amount: number; note: string }
  | { type: "ACCEPT_PLAYER_SALE"; playerId: string; fee: number; note: string }
  | { type: "PLAYER_MORALE"; playerId: string; amount: number; note: string }
  | { type: "PLAYER_WAGE_RISE"; playerId: string; years: number; wage: number; note: string }
  | { type: "ADD_SCOUT_TARGET"; note: string }
  | { type: "NOOP"; note: string };

export interface TransferTarget {
  id: string;
  player: Player;
  askingPrice: number;
  wageDemand: number;
  sellingClub: string;
}

export interface StaffCandidate {
  manager?: Manager;
  coach?: Coach;
  role: keyof Staff;
}

export interface GameState {
  version: number;
  phase: Phase;
  season: number;
  week: number;
  maxSeasons: number;
  actionsRemaining: number;
  club: Club;
  league: LeagueTeam[];
  inbox: InboxEvent[];
  eventLog: string[];
  matchReports: MatchReport[];
  transferMarket: TransferTarget[];
  staffMarket: StaffCandidate[];
  lastSeasonPosition?: number;
  ashesUnlocked: boolean;
  ashes?: AshesState;
}

export interface AshesPlayer extends Player {
  county: string;
  englandForm: number;
}

export interface AshesState {
  active: boolean;
  squadPool: AshesPlayer[];
  selectedSquad: string[];
  selectedXI: string[];
  captainId?: string;
  keeperId?: string;
  strategy: "Experienced" | "Youth" | "Bazball" | "Bowling Heavy" | "Balanced";
  testNumber: number;
  englandWins: number;
  australiaWins: number;
  draws: number;
  reports: string[];
  complete: boolean;
}
