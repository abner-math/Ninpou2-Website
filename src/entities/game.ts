import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from "typeorm";
import { GamePlayer, Team } from "./game_player";

export enum GameMode {
  POINT_30 = "POINT_30",
  POINT_45 = "POINT_45",
  POINT_60 = "POINT_60",
  NORMAL = "NORMAL",
}

export enum HeroSelectionMode {
  ALL_PICK = "ALL_PICK",
  ALL_RANDOM = "ALL_RANDOM",
}

@Entity()
export class Game {
  @PrimaryGeneratedColumn()
  id: number;
  @CreateDateColumn()
  createdDate: Date;
  @OneToMany(() => GamePlayer, (player) => player.game)
  players: GamePlayer[];
  @Column()
  gameMode: GameMode;
  @Column()
  heroSelectionMode: HeroSelectionMode;
  @Column()
  durationSeconds: number;
  @Column()
  winnerTeam: Team;
}
