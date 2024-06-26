import React from "react";
import { Dayjs } from "dayjs";
import {
  Box,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LadderList } from "./LadderList";
import { ILaddersApiResponse as LaddersApiResponse } from "../../../shared/types";

type SideControlsProps = {
  ladders: LaddersApiResponse;
  onLaddersChange: (ladders: LaddersApiResponse) => void;
  selectedLadder: string;
  onSelectedLadderChange: (ladder: string) => void;
  gameMode: string;
  onGameModeChange: (gameMode: string) => void;
  heroSelectionMode: string;
  onHeroSelectionModeChange: (heroSelectionMode: string) => void;
  startDate: Dayjs | null;
  onStartDateChange: (startDate: Dayjs | null) => void;
  endDate: Dayjs | null;
  onEndDateChange: (endDate: Dayjs | null) => void;
};

export function SideControls({
  ladders,
  onLaddersChange,
  selectedLadder,
  onSelectedLadderChange,
  gameMode,
  onGameModeChange,
  heroSelectionMode,
  onHeroSelectionModeChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
}: SideControlsProps) {
  return (
    <Paper sx={{ padding: 2, direction: "column" }}>
      <center>
        <a href="/">
          <img src="./images/logo.png" style={{ width: "80%" }} />
        </a>
      </center>
      <Paper elevation={2}>
        <FormControl fullWidth sx={{ marginTop: 1 }}>
          <InputLabel id="game-mode">Game Mode</InputLabel>
          <Select
            value={gameMode}
            id="game-mode-select"
            labelId="game-mode"
            label="Game Mode"
            onChange={(e) => onGameModeChange(e.target.value as string)}
          >
            {["", "NORMAL", "POINT 30", "POINT 45", "POINT 60"].map(
              (gameMode) => (
                <MenuItem key={gameMode} value={gameMode}>
                  {gameMode}
                </MenuItem>
              )
            )}
          </Select>
        </FormControl>
        <FormControl fullWidth sx={{ marginTop: 1 }}>
          <InputLabel id="hero-selection-mode">Hero Selection Mode</InputLabel>
          <Select
            value={heroSelectionMode}
            id="hero-selection-mode-select"
            labelId="hero-selection-mode"
            label="Hero Selection Mode"
            onChange={(e) =>
              onHeroSelectionModeChange(e.target.value as string)
            }
          >
            {["", "ALL PICK", "ALL RANDOM"].map((heroSelectionMode) => (
              <MenuItem key={heroSelectionMode} value={heroSelectionMode}>
                {heroSelectionMode}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            marginTop: 1,
            marginBottom: 1,
          }}
        >
          <DatePicker
            label="Start date"
            value={startDate}
            onChange={(value) => onStartDateChange(value)}
          />
          <DatePicker
            label="End date"
            value={endDate}
            onChange={onEndDateChange}
          />
        </Box>
        <LadderList
          ladders={ladders}
          onLaddersChange={onLaddersChange}
          selectedLadder={selectedLadder}
          onSelectedLadderChange={onSelectedLadderChange}
        />
      </Paper>
    </Paper>
  );
}
