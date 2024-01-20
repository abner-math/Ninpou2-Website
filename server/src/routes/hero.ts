import { Router, Request, Response } from "express";
import { getRanking } from "../helpers/ranking";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const [heroes, count] = await getRanking(
    req,
    "game_player.heroName",
    ["game_player.heroName"],
    '"game_player"."heroName" LIKE :search'
  );
  return res.json({ heroes, count });
});

export default router;
