import { GameMode, HeroSelectionMode, PlayerState, Team } from "./enums";

interface IGamePlayer {
  id: number;
  createdDate: Date;
  state: PlayerState;
  player: IPlayer;
  hero: IHero;
  kills: number;
  deaths: number;
  assists: number;
  points: number;
  level: number;
  team: Team;
  winner: boolean;
  rankeable: boolean;
  items: IItem[];
  game: IGame;
  gameMode: GameMode;
  heroSelectionMode: HeroSelectionMode;
  ladderNames: string[];
}

interface IGame {
  id: number;
  createdDate: Date;
  players: IGamePlayer[];
  gameMode: GameMode;
  heroSelectionMode: HeroSelectionMode;
  durationSeconds: number;
  winnerTeam: Team;
  rankeable: boolean;
  balance?: string;
  ladders: ILadder[];
  ladderNames: string[];
}

interface IHero {
  name: string;
  players: IGamePlayer[];
}

interface IItem {
  name: string;
  players: IGamePlayer[];
}

interface ILadder {
  name: string;
  passphrase: string;
  numGames: number;
  games: IGame[];
}

interface IPlayer {
  steamId: number;
  name: string;
  players: IGamePlayer[];
}

interface IRankingPosition {
  kills: number;
  deaths: number;
  assists: number;
  points: number;
  wins: number;
  losses: number;
  games: number;
  score: number;
}

interface IPlayerWithScore extends IRankingPosition {
  player_steamId: string;
  player_name: string;
  heroes: number;
}

interface IHeroWithScore extends IRankingPosition {
  heroName: string;
}

interface IGamesApiResponse {
  games: Array<IGame>;
  count: number;
}

interface ILaddersApiResponse {
  public: Array<ILadder>;
  private: Array<ILadder>;
}

interface IPlayersApiResponse {
  players: Array<IPlayerWithScore>;
  count: number;
}

interface IHeroesApiResponse {
  heroes: Array<IHeroWithScore>;
  count: number;
}

export type {
  IGamePlayer,
  IGame,
  IHero,
  IItem,
  ILadder,
  IPlayer,
  IPlayerWithScore,
  IHeroWithScore,
  IGamesApiResponse,
  ILaddersApiResponse,
  IPlayersApiResponse,
  IHeroesApiResponse,
};
