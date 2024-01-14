import "reflect-metadata";
import { DataSource } from "typeorm";
import { Game } from "./entities/game";
import { GamePlayer } from "./entities/game_player";
import { Hero } from "./entities/hero";
import { Item } from "./entities/item";
import { Player } from "./entities/player";

export const AppDataSource = new DataSource({
  type: "postgres",
  url:
    process.env.DATABASE_URL ||
    "postgresql://abneraraujo@localhost:5432/ninpou",
  entities: [Game, GamePlayer, Hero, Item, Player],
  synchronize: true,
  logging: false,
});
