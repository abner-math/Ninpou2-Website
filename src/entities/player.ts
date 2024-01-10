import { Entity, PrimaryColumn, OneToMany } from "typeorm";
import { GamePlayer } from "./game_player";

@Entity()
export class Player {
  @PrimaryColumn()
  name: string;
  @OneToMany(() => GamePlayer, (game) => game.player)
  players: GamePlayer[];
}
