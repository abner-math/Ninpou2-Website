// src/index.js
import express, { Express } from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import cors from "cors";
import gameRoutes from "./src/routes/game";
import ladderRoutes from "./src/routes/ladder";
import playerRoutes from "./src/routes/player";
import heroRoutes from "./src/routes/hero";
import filters from "./src/helpers/filter";
import { AppDataSource } from "./db";
import * as path from "path";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 8000;

AppDataSource.initialize().catch((error) => {
  console.error(error);
  process.exit(1);
});

app.use(cors({ origin: "*" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "../client")));
app.use(filters);
app.use("/games", gameRoutes);
app.use("/ladders", ladderRoutes);
app.use("/players", playerRoutes);
app.use("/heroes", heroRoutes);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
