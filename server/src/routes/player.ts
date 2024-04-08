import { Router, Request, Response } from "express";
import { getRanking } from "../helpers/ranking";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const [players, count] = await getRanking(
    req,
    "player.steamId",
    ["player.steamId", "player.name"],
    '("player"."steamId"::text LIKE :search OR "player"."name" LIKE :search)'
  );
  return res.json({ players, count });
});

export default router;
