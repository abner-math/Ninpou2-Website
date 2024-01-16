import { Entity, PrimaryColumn, ManyToMany } from "typeorm";
import { GamePlayer } from "./game_player";
import type { IItem } from "../shared/types";

@Entity()
export class Item implements IItem {
  @PrimaryColumn()
  name: string;
  @ManyToMany(() => GamePlayer, (player) => player.items)
  players: GamePlayer[];
}
