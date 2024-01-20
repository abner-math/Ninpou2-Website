import { Entity, Column, PrimaryColumn, ManyToMany, JoinTable } from "typeorm";
import { Exclude, plainToClass } from "class-transformer";
import { Game } from "./game";
import type { ILadder } from "../../../shared/types";

@Entity()
export class Ladder implements ILadder {
  @PrimaryColumn()
  name: string;
  @Column()
  @Exclude()
  passphrase: string;
  @Column("int")
  numGames: number;
  @ManyToMany(() => Game, (game) => game.ladders, {
    cascade: true,
  })
  @JoinTable()
  @Exclude()
  games: Game[];

  toJSON() {
    return plainToClass(Ladder, this);
  }
}
