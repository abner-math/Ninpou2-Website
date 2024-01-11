// src/index.js
import express, { Express, Request, Response } from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import cors from "cors";
import gameRoutes from "./routes/game";
import { AppDataSource } from "./db";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

AppDataSource.initialize().catch((error) => {
  console.error(error);
  process.exit(1);
});

app.use(cors({ origin: "*" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));
app.use((req, res, next) => {
  if (req.body.payload) {
    req.body = JSON.parse(req.body.payload);
  }
  next();
});
app.use("/games", gameRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
