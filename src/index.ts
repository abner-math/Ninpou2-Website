// src/index.js
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import gameRoutes from "./routes/game";
import { AppDataSource } from "./db";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

AppDataSource.initialize().catch((error) => {
  console.error(error);
  process.exit(1);
});

app.use(express.json());
app.use("/games", gameRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
