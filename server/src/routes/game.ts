import { Router, Request, Response } from "express";
import { validationResult, checkSchema } from "express-validator";
import {
  GameMode,
  HeroSelectionMode,
  PlayerState,
  Team,
} from "../../../shared/enums";
import { Game } from "../entities/game";
import { filterQueryFromRequest } from "../helpers/filter";
import { AppDataSource } from "../../db";

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
  const query = gameRepository.createQueryBuilder("game");
  query.leftJoinAndSelect("game.players", "game_player");
  query.leftJoinAndSelect("game_player.items", "item");
  query.leftJoinAndSelect("game_player.hero", "hero");
  query.leftJoinAndSelect("game_player.player", "player");
  if (
    !filterQueryFromRequest(req, {
      query,
      filterColumns: [
        { name: "createdDate", type: "date", alias: "game.createdDate" },
        { name: "gameMode", type: "enum", alias: "game.gameMode" },
        {
          name: "heroSelectionMode",
          type: "enum",
          alias: "game.heroSelectionMode",
        },
        { name: "rankeable", type: "boolean", alias: "game.rankeable" },
        { name: "balance", type: "string", alias: "game.balance" },
        { name: "ladder", type: "array", alias: "game.ladderNames" },
      ],
      sortColumns: [
        { name: "createdDate", alias: "game.createdDate" },
        { name: "durationSeconds", alias: "game.durationSeconds" },
        { name: "rankeable", alias: "game.rankeable" },
        { name: "balance", alias: "game.balance" },
      ],
    })
  ) {
    query.orderBy("game.createdDate", "DESC");
  }
  query.take(req.getQueryInt("take", 10));
  query.skip(req.getQueryInt("skip", 0));
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
