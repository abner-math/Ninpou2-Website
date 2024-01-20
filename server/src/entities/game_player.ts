import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  JoinTable,
  ManyToOne,
  ManyToMany,
} from "typeorm";
import { Player } from "./player";
import { Hero } from "./hero";
import { Item } from "./item";
import { Game } from "./game";
import {
  PlayerState,
  Team,
  GameMode,
  HeroSelectionMode,
} from "../../../shared/enums";
import type { IGamePlayer } from "../../../shared/types";

@Entity()
export class GamePlayer implements IGamePlayer {
  @PrimaryGeneratedColumn()
  id: number;
  @CreateDateColumn()
  createdDate: Date;
  @Column()
  state: PlayerState;
  @ManyToOne(() => Player, (player) => player.players, {
    cascade: true,
  })
  player: Player;
  @ManyToOne(() => Hero, (hero) => hero.players, {
    cascade: true,
  })
  hero: Hero;
  @Column("int")
  kills: number;
  @Column("int")
  deaths: number;
  @Column("int")
  assists: number;
  @Column("int")
  points: number;
  @Column("int")
  level: number;
  @Column()
  team: Team;
  @Column()
  winner: boolean;
  @Column()
  rankeable: boolean;
  @ManyToMany(() => Item, (item) => item.players, {
    cascade: true,
  })
  @JoinTable()
  items: Item[];
  @ManyToOne(() => Game, (game) => game.players)
  game: Game;
  @Column()
  gameMode: GameMode;
  @Column()
  heroSelectionMode: HeroSelectionMode;
  @Column("text", { array: true })
  ladderNames: string[];
}
