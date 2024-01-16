import { Router, Request, Response, NextFunction } from "express";
import { validationResult, checkSchema } from "express-validator";
import * as bcrypt from "bcrypt";
import { Game } from "../entities/game";
import { Ladder } from "../entities/ladder";
import { AppDataSource } from "../db";

const router = Router();
const ladderRepository = AppDataSource.getRepository(Ladder);
const gameRepository = AppDataSource.getRepository(Game);

const ladderValidationRules = checkSchema({
  name: {
    isString: true,
    notEmpty: true,
    isLength: {
      options: { min: 3, max: 20 },
      errorMessage:
        "Name must be between 3 and 20 characters and contain only letters and digits",
    },
    matches: {
      options: /^[A-Za-z0-9]+$/,
      errorMessage:
        "Name must be between 3 and 20 characters and contain only letters and digits",
    },
  },
  passphrase: {
    isString: true,
    notEmpty: true,
  },
});

router.post("/", ladderValidationRules, async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  } else if (
    await ladderRepository.findOne({ where: { name: req.body.name } })
  ) {
    return res.status(400).json({
      errors: [
        {
          msg: "Ladder already exists",
        },
      ],
    });
  }
  const ladder = req.body as Ladder;
  ladder.passphrase = await bcrypt.hash(ladder.passphrase, 10);
  ladder.numGames = 0;
  await ladderRepository.save(ladder);
  res.status(201).json({ ladder: { name: ladder.name } });
});

router.get("/", async (req: Request, res: Response) => {
  const ladders = await ladderRepository.find({
    select: ["name", "numGames"],
    order: {
      numGames: "DESC",
    },
  });
  return res.json({ ladders });
});

router.use(
  "/:ladder_name",
  async (req: Request, res: Response, next: NextFunction) => {
    req.ladder = await ladderRepository.findOne({
      relations: {
        games: true,
      },
      where: { name: req.params.ladder_name },
    });
    if (!req.ladder) {
      return res.status(404).json({
        errors: [
          {
            msg: "Ladder not found",
          },
        ],
      });
    } else if (
      !(await bcrypt.compare(req.body.passphrase || "", req.ladder!.passphrase))
    ) {
      return res.status(400).json({
        errors: [
          {
            param: "passphrase",
            msg: "Incorrect passphrase",
          },
        ],
      });
    }
    next();
  }
);

router.use(
  "/:ladder_name/games/:game_id",
  async (req: Request, res: Response, next: NextFunction) => {
    req.game = await gameRepository.findOne({
      relations: {
        players: true,
      },
      where: { id: parseInt(req.params.game_id) },
    });
    if (!req.game) {
      return res.status(404).json({
        errors: [
          {
            msg: "Game not found",
          },
        ],
      });
    }
    next();
  }
);

router.post(
  "/:ladder_name/games/:game_id",
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const ladder = req.ladder!;
    const ladderGame = req.game!;
    if (!ladder.games.find((game) => game.id === ladderGame.id)) {
      ladder.games.push(ladderGame);
    }
    if (!ladderGame.ladderNames.includes(ladder.name)) {
      ladderGame.ladderNames.push(ladder.name);
    }
    for (const player of ladderGame.players) {
      if (!player.ladderNames.includes(ladder.name)) {
        player.ladderNames.push(ladder.name);
      }
    }
    ladder.numGames = ladder.games.length;
    await ladderRepository.save(ladder);
    await gameRepository.save(ladderGame);
    res.status(201).json(ladder);
  }
);

router.delete(
  "/:ladder_name/games/:game_id",
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const ladder = req.ladder!;
    const ladderGame = req.game!;
    ladder.games = ladder.games.filter((game) => game.id !== ladderGame.id);
    ladderGame.ladderNames = ladderGame.ladderNames.filter(
      (name) => name !== ladder.name
    );
    for (const player of ladderGame.players) {
      player.ladderNames = player.ladderNames.filter(
        (name) => name !== ladder.name
      );
    }
    ladder.numGames = ladder.games.length;
    await ladderRepository.save(ladder);
    await gameRepository.save(ladderGame);
    res.status(200).json(ladder);
  }
);

export default router;
