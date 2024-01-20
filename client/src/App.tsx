/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from "react";
import { useState } from "react";
import { Grid, Paper } from "@mui/material";
import { SideControls } from "./components/SideControls";
import { MainTabs } from "./components/MainTabs";
import { useQueryState } from "./hooks/useQueryState";
import { ILaddersApiResponse as LaddersApiResponse } from "../../shared/types";
import "./App.css";

function App() {
  // shared state
  const [ladders, setLadders] = useState<LaddersApiResponse>({
    public: [],
    private: [],
  });
  const [selectedLadder, setSelectedLadder] = useQueryState("ladder", "public");
  const [gameMode, setGameMode] = useQueryState("gameMode", "POINT 45");
  const [heroSelectionMode, setHeroSelectionMode] = useQueryState(
    "heroSelectionMode",
    "ALL PICK"
  );

  return (
    <Paper id="container">
      <Grid container direction="row" justifyContent="space-between">
        <Grid item xs={4} md={3}>
          <SideControls
            ladders={ladders}
            onLaddersChange={setLadders}
            selectedLadder={selectedLadder}
            onSelectedLadderChange={setSelectedLadder}
            gameMode={gameMode}
            onGameModeChange={setGameMode}
            heroSelectionMode={heroSelectionMode}
            onHeroSelectionModeChange={setHeroSelectionMode}
          />
        </Grid>
        <Grid item xs={8} md={9}>
          <MainTabs
            defaultIndex={0}
            ladders={ladders}
            selectedLadder={selectedLadder}
            onSelectedLadderChange={setSelectedLadder}
            gameMode={gameMode}
            heroSelectionMode={heroSelectionMode}
          />
        </Grid>
      </Grid>
    </Paper>
  );
}

export default App;
