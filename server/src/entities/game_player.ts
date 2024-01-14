import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinTable,
  ManyToOne,
  ManyToMany,
} from "typeorm";
import { Player } from "./player";
import { Hero } from "./hero";
import { Item } from "./item";
import { Game } from "./game";

export enum Team {
  UNKNOWN = "UNKNOWN",
  KONOHAGAKURE = "KONOHAGAKURE",
  OTOGAKURE = "OTOGAKURE",
  AKATSUKI = "AKATSUKI",
}

export enum PlayerState {
  UNKNOWN = "UNKNOWN",
  NOT_YET_CONNECTED = "NOT_YET_CONNECTED",
  CONNECTED = "CONNECTED",
  DISCONNECTED = "DISCONNECTED",
  ABANDONED = "ABANDONED",
  LOADING = "LOADING",
  FAILED = "FAILED",
}

@Entity()
export class GamePlayer {
  @PrimaryGeneratedColumn()
  id: number;
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
  @ManyToMany(() => Item, (item) => item.players, {
    cascade: true,
  })
  @JoinTable()
  items: Item[];
  @ManyToOne(() => Game, (game) => game.players)
  game: Game;
}
