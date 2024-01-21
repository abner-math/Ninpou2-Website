import "reflect-metadata";
import { DataSource } from "typeorm";
import { Game } from "./src/entities/game";
import { GamePlayer } from "./src/entities/game_player";
import { Hero } from "./src/entities/hero";
import { Item } from "./src/entities/item";
import { Player } from "./src/entities/player";
import { Ladder } from "./src/entities/ladder";

export const AppDataSource = new DataSource({
  type: "postgres",
  url:
    process.env.DATABASE_URL ||
    "postgresql://abneraraujo@localhost:5432/ninpou",
  entities: [Game, GamePlayer, Hero, Item, Player, Ladder],
  synchronize: true,
  logging: false,
});
