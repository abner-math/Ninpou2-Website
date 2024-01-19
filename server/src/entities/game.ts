import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToMany,
} from "typeorm";
import { GamePlayer } from "./game_player";
import { Ladder } from "./ladder";
import { Team, GameMode, HeroSelectionMode } from "../shared/enums";
import type { IGame } from "../shared/types";

@Entity()
export class Game implements IGame {
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
  @Column()
  rankeable: boolean;
  @Column({
    nullable: true,
  })
  balance?: string;
  @ManyToMany(() => Ladder, (ladder) => ladder.games)
  ladders: Ladder[];
  @Column("text", { array: true })
  ladderNames: string[];
}
