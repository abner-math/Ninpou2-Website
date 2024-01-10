import {
  PrimaryGeneratedColumn,
  Entity,
  Column,
  JoinTable,
  ManyToOne,
  ManyToMany,
} from "typeorm";
import { Game } from "./game";
import { Item } from "./item";
import { Hero } from "./hero";
import { Player } from "./player";

export enum Team {
  KONOHAGAKURE = "KONOHAGAKURE",
  OTOGAKURE = "OTOGAKURE",
  AKATSUKI = "AKATSUKI",
}

export enum PlayerState {
  PLAYING = "PLAYING",
  DISCONNECTED = "DISCONNECTED",
}

@Entity()
export class GamePlayer {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  state: PlayerState;
  @ManyToOne(() => Player, (player) => player.players)
  player: Player;
  @ManyToOne(() => Hero, (hero) => hero.players)
  hero: Hero;
  @Column("int")
  kills: number;
  @Column("int")
  deaths: number;
  @Column("int")
  assists: number;
  @Column("int")
  points: number;
  @Column()
  team: Team;
  @ManyToMany(() => Item, (item) => item.players)
  @JoinTable()
  items: Item[];
  @ManyToOne(() => Game, (game) => game.players)
  game: Game;
}
