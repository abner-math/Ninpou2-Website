import { Entity, PrimaryColumn, OneToMany } from "typeorm";
import { GamePlayer } from "./game_player";
import type { IHero } from "../../../shared/types";

@Entity()
export class Hero implements IHero {
  @PrimaryColumn()
  name: string;
  @OneToMany(() => GamePlayer, (player) => player.hero)
  players: GamePlayer[];
}
