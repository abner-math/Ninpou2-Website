import { Entity, PrimaryColumn, ManyToMany } from "typeorm";
import { GamePlayer } from "./game_player";

@Entity()
export class Item {
  @PrimaryColumn()
  name: string;
  @ManyToMany(() => GamePlayer, (player) => player.items)
  players: GamePlayer[];
}
