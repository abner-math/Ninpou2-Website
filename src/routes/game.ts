import { Router, Request, Response } from "express";
import { validationResult, checkSchema } from "express-validator";
import { GameMode, HeroSelectionMode, Game } from "../entities/game";
import { PlayerState, Team, GamePlayer } from "../entities/game_player";
import { Player } from "../entities/player";
import { Item } from "../entities/item";
import { Hero } from "../entities/hero";
import { AppDataSource } from "../db";

const router = Router();

const gameValidationRules = checkSchema({
  durationSeconds: {
    isInt: true,
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
  "players.*.player.name": {
    isString: true,
    notEmpty: true,
  },
  "players.*.hero": {
    notEmpty: true,
  },
  "players.*.hero.name": {
    isString: true,
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
        max: 9,
      },
    },
  },
  "players.*.items.*.name": {
    isString: true,
    notEmpty: true,
  },
});

router.post("/", gameValidationRules, async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const game = req.body as Game;
  const gameRepository = AppDataSource.getRepository(Game);
  const gamePlayerRepository = AppDataSource.getRepository(GamePlayer);
  const playerRepository = AppDataSource.getRepository(Player);
  const heroRepository = AppDataSource.getRepository(Hero);
  const itemRepository = AppDataSource.getRepository(Item);
  await gameRepository.save(game);
  await Promise.all(
    game.players.map((player) => [
      playerRepository.save(player.player),
      heroRepository.save(player.hero),
      ...player.items.map((item) => itemRepository.save(item)),
    ])
  );
  await Promise.all(
    game.players.map((player) =>
      gamePlayerRepository.save({
        ...player,
        game,
      })
    )
  );
  res.status(201).json(game);
});

export default router;
