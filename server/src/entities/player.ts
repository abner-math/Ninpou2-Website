import { Entity, Column, PrimaryColumn, OneToMany } from "typeorm";
import { GamePlayer } from "./game_player";

@Entity()
export class Player {
  @PrimaryColumn("int")
  steamId: number;
  @Column()
  name: string;
  @OneToMany(() => GamePlayer, (game) => game.player)
  players: GamePlayer[];
}
