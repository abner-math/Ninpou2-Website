import { Router, Request, Response } from "express";
import { validationResult, checkSchema } from "express-validator";
import {
  GameMode,
  HeroSelectionMode,
  PlayerState,
  Team,
} from "../shared/enums";
import { Game } from "../entities/game";
import { AppDataSource } from "../db";

const router = Router();
const gameRepository = AppDataSource.getRepository(Game);

const gameValidationRules = checkSchema({
  durationSeconds: {
    isNumeric: true,
    notEmpty: true,
  },
  gameMode: {
    isIn: {
      options: [[...Object.values(GameMode)]],
    },
    notEmpty: true,
  },
  heroSelectionMode: {
    isIn: {
      options: [[...Object.values(HeroSelectionMode)]],
    },
    notEmpty: true,
  },
  winnerTeam: {
    isIn: {
      options: [[...Object.values(Team)]],
    },
    notEmpty: true,
  },
  players: {
    isArray: {
      options: {
        min: 1,
        max: 9,
      },
    },
  },
  "players.*.state": {
    isIn: {
      options: [[...Object.values(PlayerState)]],
    },
    notEmpty: true,
  },
  "players.*.player": {
    notEmpty: true,
  },
  "players.*.player.steamId": {
    isInt: true,
    notEmpty: true,
  },
  "players.*.kills": {
    isInt: true,
    notEmpty: true,
  },
  "players.*.deaths": {
    isInt: true,
    notEmpty: true,
  },
  "players.*.assists": {
    isInt: true,
    notEmpty: true,
  },
  "players.*.points": {
    isInt: true,
    notEmpty: true,
  },
  "players.*.winner": {
    isBoolean: true,
    notEmpty: true,
  },
  "players.*.level": {
    isInt: true,
    notEmpty: true,
  },
  "players.*.team": {
    isIn: {
      options: [[...Object.values(Team)]],
    },
    notEmpty: true,
  },
  "players.*.items": {
    isArray: {
      options: {
        min: 0,
        max: 20,
      },
    },
  },
  "players.*.items.*.name": {
    isString: true,
    notEmpty: true,
  },
});

router.get("/", async (req: Request, res: Response) => {
  console.log(req.query);
  const query = gameRepository.createQueryBuilder("game");
  query.take(req.getQueryInt("take", 10));
  query.skip(req.getQueryInt("skip", 0));
  const filters =
    (req.query.filters && JSON.parse(req.query.filters as string)) || [];
  const sorting =
    (req.query.sorting && JSON.parse(req.query.sorting as string)) || [];
  for (const filter of filters) {
    // Date fields
    if (filter.id === "createdData" && filter.value[0] && filter.value[1]) {
      query.andWhere("game.createdDate BETWEEN :start AND :end");
      query.setParameter("start", filter.value[0]);
      query.setParameter("end", filter.value[1]);
    }
    // Enum fields
    if (["gameMode", "heroSelectionMode"].includes(filter.id) && filter.value) {
      query.andWhere(`game.${filter.id} LIKE :${filter.id}`);
      query.setParameter(
        filter.id,
        `%${filter.value.replace(" ", "_").toUpperCase()}%`
      );
    }
    // Boolean fields
    if (["rankeable"].includes(filter.id) && filter.value) {
      query.andWhere(`game.${filter.id} = :${filter.id}`);
      query.setParameter(filter.id, filter.value === "true");
    }
    // String fields
    if (["balance"].includes(filter.id) && filter.value) {
      query.andWhere(`game.${filter.id} LIKE :${filter.id}`);
      query.setParameter(filter.id, `%${filter.value}%`);
    }
    // Ladder field
    if (filter.id === "ladder" && filter.value && filter.value !== "public") {
      query.andWhere(`game.ladderNames @> ARRAY[:ladder]`);
      query.setParameter("ladder", filter.value.toLowerCase());
    }
  }
  let hasSorting = false;
  for (const sort of sorting) {
    if (
      ["createdDate", "durationSeconds", "rankeable", "balance"].includes(
        sort.id
      )
    ) {
      query.orderBy(`game.${sort.id}`, sort.desc ? "DESC" : "ASC");
      hasSorting = true;
    }
  }
  if (!hasSorting) {
    query.orderBy("game.createdDate", "DESC");
  }
  query.leftJoinAndSelect("game.players", "game_player");
  query.leftJoinAndSelect("game_player.items", "item");
  query.leftJoinAndSelect("game_player.hero", "hero");
  query.leftJoinAndSelect("game_player.player", "player");
  const [games, count] = await query.getManyAndCount();
  return res.json({ games, count });
});

router.post("/", gameValidationRules, async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const game = req.body as Game;
  game.rankeable =
    game.players.filter((player) => player.state === PlayerState.CONNECTED)
      .length === 9 &&
    ((game.gameMode === GameMode.POINT_30 && game.durationSeconds >= 25 * 60) ||
      (game.gameMode === GameMode.POINT_45 &&
        game.durationSeconds >= 40 * 60) ||
      (game.gameMode === GameMode.POINT_60 &&
        game.durationSeconds >= 55 * 60) ||
      (game.gameMode === GameMode.NORMAL && game.durationSeconds >= 15 * 60));
  game.ladderNames = [];
  for (const player of game.players) {
    player.createdDate = game.createdDate;
    player.rankeable = game.rankeable;
    player.gameMode = game.gameMode;
    player.heroSelectionMode = game.heroSelectionMode;
    player.ladderNames = [];
  }
  await gameRepository.save(game);
  res.status(201).json(game);
});

export default router;
