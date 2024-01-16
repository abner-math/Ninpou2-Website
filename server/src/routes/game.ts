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
import {
  FindManyOptions,
  FindOptionsWhere,
  FindOptionsOrder,
  Between,
  Like,
} from "typeorm";

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
  const take = req.getQueryInt("take", 10);
  const skip = req.getQueryInt("skip", 0);
  const filters =
    (req.query.filters && JSON.parse(req.query.filters as string)) || [];
  const sorting =
    (req.query.sorting && JSON.parse(req.query.sorting as string)) || [];
  const where: FindOptionsWhere<Game>[] = [];
  for (const filter of filters) {
    // Date fields
    if (filter.id === "createdData" && filter.value[0] && filter.value[1]) {
      where.push({
        createdDate: Between(
          new Date(filter.value[0]),
          new Date(filter.value[1])
        ),
      });
    }
    // Enum fields
    if (["gameMode", "heroSelectionMode"].includes(filter.id) && filter.value) {
      where.push({
        [filter.id as keyof Game]: Like(
          `%${filter.value.replace(" ", "_").toUpperCase()}%`
        ),
      });
    }
  }
  const order: FindOptionsOrder<Game> = {};
  let hasSorting = false;
  for (const sort of sorting) {
    if (sort.id === "createdDate") {
      order.createdDate = sort.desc ? "DESC" : "ASC";
      hasSorting = true;
    } else if (sort.id === "durationSeconds") {
      order.durationSeconds = sort.desc ? "DESC" : "ASC";
      hasSorting = true;
    }
  }
  if (!hasSorting) {
    order.createdDate = "DESC";
  }
  const options: FindManyOptions<Game> = {
    relations: {
      players: {
        items: true,
        hero: true,
        player: true,
      },
    },
    where,
    order,
    skip,
    take,
  };
  const [games, count] = await gameRepository.findAndCount(options);
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
