import { Router, Request, Response } from "express";
import { validationResult, checkSchema } from "express-validator";
import { Game, GameMode, HeroSelectionMode } from "../entities/game";
import { PlayerState, Team } from "../entities/game_player";
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
  const take =
    (typeof req.query.take === "string" && parseInt(req.query.take)) || 10;
  const skip =
    (typeof req.query.skip === "string" && parseInt(req.query.skip)) || 0;
  const [games, count] = await gameRepository.findAndCount({
    relations: {
      players: {
        items: true,
        hero: true,
        player: true,
      },
    },
    order: {
      createdDate: "DESC",
    },
    skip,
    take,
  });
  return res.json({ games, count });
});

router.post("/", gameValidationRules, async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const game = req.body as Game;
  await gameRepository.save(game);
  res.status(201).json(game);
});

export default router;
