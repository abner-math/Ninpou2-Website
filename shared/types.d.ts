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
  game: Game;
  gameMode: GameMode;
  heroSelectionMode: HeroSelectionMode;
  ladderNames: string[];
}

interface IGame {
  id: number;
  createdDate: Date;
  players: IGamePlayer[];
  gameMode: GameMode;
  heroSelectionMode: IHeroSelectionMode;
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

export type { IGamePlayer, IGame, IHero, IItem, ILadder, IPlayer };
