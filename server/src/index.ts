// src/index.js
import express, { Express } from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import cors from "cors";
import { Game } from "./entities/game";
import { Ladder } from "./entities/ladder";
import gameRoutes from "./routes/game";
import ladderRoutes from "./routes/ladder";
import { AppDataSource } from "./db";
import * as path from "path";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 8000;

AppDataSource.initialize().catch((error) => {
  console.error(error);
  process.exit(1);
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      ladder: Ladder | null | undefined;
      game: Game | null | undefined;
      getQueryString: (key: string, defaultValue?: string) => string | undefined;
      getQueryInt: (key: string, defaultValue?: number) => number | undefined;
    }
  }
}

app.use(cors({ origin: "*" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "../../client/build")));
app.use((req, res, next) => {
  if (req.body.payload) {
    req.body = JSON.parse(req.body.payload);
  }
  req.getQueryString = (key: string, defaultValue?: string): string | undefined => {
    return (typeof req.query[key] === 'string' && req.query[key] as string) || defaultValue;
  };
  req.getQueryInt = (key: string, defaultValue?: number): number | undefined => {
    return (typeof req.query[key] === 'string' && parseInt(req.query[key] as string)) || defaultValue;
  };
  next();
});
app.use("/games", gameRoutes);
app.use("/ladders", ladderRoutes);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
