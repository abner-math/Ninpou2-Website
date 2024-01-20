import { Router, Request, Response } from "express";
import { GamePlayer } from "../entities/game_player";
import { AppDataSource } from "../db";

const router = Router();
const playerRepository = AppDataSource.getRepository(GamePlayer);

router.get("/", async (req: Request, res: Response) => {
  const query = playerRepository
    .createQueryBuilder("game_player")
    .select("AVG(game_player.kills)::real", "kills")
    .addSelect("AVG(game_player.deaths)::real", "deaths")
    .addSelect("AVG(game_player.assists)::real", "assists")
    .addSelect("AVG(game_player.assists)::real", "assists")
    .addSelect("AVG(game_player.points)::real", "points")
    .addSelect(
      "SUM(CASE game_player.winner WHEN TRUE THEN 1 ELSE 0 END)::int",
      "wins"
    )
    .addSelect(
      "SUM(CASE game_player.winner WHEN TRUE THEN 0 ELSE 1 END)::int",
      "losses"
    )
    .addSelect("COUNT(*)::int", "games")
    .addSelect("COUNT(DISTINCT game_player.heroName)::int", "heroes")
    .addSelect(
      `
      ((
        (
          SUM(CASE game_player.winner WHEN TRUE THEN 1 ELSE 0 END) + 1.9208) / COUNT(*) - 
          1.96 * SQRT(
              (
                SUM(CASE game_player.winner WHEN TRUE THEN 1 ELSE 0 END) * SUM(CASE game_player.winner WHEN TRUE THEN 0 ELSE 1 END)
              ) / COUNT(*) + 0.9604
            )
          / COUNT(*)
        )
        / (1 + 3.8416 / COUNT(*)) * 100)::real
      `,
      "score"
    )
    .leftJoinAndSelect("game_player.player", "player")
    .andWhere("game_player.rankeable = true")
    .groupBy("player.steamId");
  const filterColumns = [
    { name: "createdDate", type: "date", alias: "game_player.createdDate" },
    { name: "gameMode", type: "enum", alias: "game_player.gameMode" },
    {
      name: "heroSelectionMode",
      type: "enum",
      alias: "game_player.heroSelectionMode",
    },
    { name: "ladder", type: "array", alias: "game_player.ladderNames" },
  ];
  const sortColumns = [
    { name: "kills", alias: "kills" },
    { name: "deaths", alias: "deaths" },
    { name: "assists", alias: "assists" },
    { name: "points", alias: "points" },
    { name: "wins", alias: "wins" },
    { name: "losses", alias: "losses" },
    { name: "games", alias: "games" },
    { name: "heroes", alias: "heroes" },
    { name: "score", alias: "score" },
  ];
  if (
    !req.getQueryFilter({
      query,
      filterColumns,
      sortColumns,
    })
  ) {
    query.orderBy("score", "DESC"); // wilson score
  }
  query.limit(req.getQueryInt("take", 10));
  query.offset(req.getQueryInt("skip", 0));
  if (req.query.search) {
    query.andWhere(
      '("player"."steamId"::text LIKE :search OR "player"."name" LIKE :search)',
      {
        search: `%${req.query.search}%`,
      }
    );
  }
  const players = await query.getRawMany();
  const countQuery = playerRepository
    .createQueryBuilder("game_player")
    .select("COUNT(*)", "count")
    .andWhere("game_player.rankeable = true")
    .groupBy("game_player.playerSteamId");
  req.getQueryFilter({
    query: countQuery,
    filterColumns,
    sortColumns: [],
  });
  const count = (await countQuery.getRawMany()).length;
  res.json({ players, count });
});

export default router;
