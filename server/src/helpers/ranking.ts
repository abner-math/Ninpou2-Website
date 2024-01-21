import { Request } from "express";
import { filterQueryFromRequest } from "./filter";
import { GamePlayer } from "../entities/game_player";
import { AppDataSource } from "../../db";

const playerRepository = AppDataSource.getRepository(GamePlayer);

export async function getRanking(
  req: Request,
  groupBy: string,
  selects: string[],
  queryString: string
) {
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
    .leftJoin("game_player.player", "player")
    .andWhere("game_player.rankeable = true")
    .groupBy(groupBy);
  selects.forEach((select) => {
    query.addSelect(select);
  });
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
    !filterQueryFromRequest(req, {
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
    query.andWhere(queryString, {
      search: `%${req.query.search}%`,
    });
  }
  const data = await query.getRawMany();
  const countQuery = playerRepository
    .createQueryBuilder("game_player")
    .select("COUNT(*)", "count")
    .leftJoin("game_player.player", "player")
    .andWhere("game_player.rankeable = true")
    .groupBy(groupBy);
  filterQueryFromRequest(req, {
    query: countQuery,
    filterColumns,
    sortColumns: [],
  });
  const count = (await countQuery.getRawMany()).length;
  return [data, count];
}
