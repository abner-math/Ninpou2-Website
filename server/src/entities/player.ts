import { Entity, Column, PrimaryColumn, OneToMany } from "typeorm";
import { GamePlayer } from "./game_player";
import type { IPlayer } from "../shared/types";

@Entity()
export class Player implements IPlayer {
  @PrimaryColumn("int")
  steamId: number;
  @Column()
  name: string;
  @OneToMany(() => GamePlayer, (game) => game.player)
  players: GamePlayer[];
}
