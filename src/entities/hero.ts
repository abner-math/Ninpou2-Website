import { Entity, PrimaryColumn, OneToMany } from "typeorm";
import { GamePlayer } from "./game_player";

@Entity()
export class Hero {
  @PrimaryColumn()
  name: string;
  @OneToMany(() => GamePlayer, (player) => player.hero)
  players: GamePlayer[];
}
