import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from "typeorm";
import { Team, GamePlayer } from "./game_player";

export enum GameMode {
  UNKNOWN = "UNKNOWN",
  POINT_30 = "POINT_30",
  POINT_45 = "POINT_45",
  POINT_60 = "POINT_60",
  NORMAL = "NORMAL",
}

export enum HeroSelectionMode {
  UNKNOWN = "UNKNOWN",
  ALL_PICK = "ALL_PICK",
  ALL_RANDOM = "ALL_RANDOM",
}

@Entity()
export class Game {
  @PrimaryGeneratedColumn()
  id: number;
  @CreateDateColumn()
  createdDate: Date;
  @OneToMany(() => GamePlayer, (player) => player.game, {
    cascade: true,
  })
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
