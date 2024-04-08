import React from "react";
import { Dayjs } from "dayjs";
import { Paper } from "@mui/material";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import { GameTable } from "./GameTable";
import { PlayerTable } from "./PlayerTable";
import { HeroTable } from "./HeroTable";
import { useQueryState } from "../hooks/useQueryState";
import { ILaddersApiResponse as LaddersApiResponse } from "../../../shared/types";

type MainTabsProps = {
  defaultIndex: number;
  ladders: LaddersApiResponse;
  selectedLadder: string;
  onSelectedLadderChange: (selectedLadder: string) => void;
  gameMode: string;
  heroSelectionMode: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
};

export function MainTabs({
  defaultIndex,
  ladders,
  selectedLadder,
  onSelectedLadderChange,
  gameMode,
  heroSelectionMode,
  startDate,
  endDate,
}: MainTabsProps) {
  const [tabIndex, setTabIndex] = useQueryState("tabIndex", defaultIndex);

  return (
    <Paper>
      <Tabs
        defaultIndex={tabIndex}
        onSelect={(index: number) => setTabIndex(index)}
      >
        <TabList>
          <Tab>Games</Tab>
          <Tab>Players</Tab>
          <Tab>Heroes</Tab>
        </TabList>
        <TabPanel>
          <GameTable
            ladders={ladders}
            selectedLadder={selectedLadder}
            onSelectedLadderChange={onSelectedLadderChange}
            gameMode={gameMode}
            heroSelectionMode={heroSelectionMode}
            startDate={startDate}
            endDate={endDate}
          />
        </TabPanel>
        <TabPanel>
          <PlayerTable
            selectedLadder={selectedLadder}
            gameMode={gameMode}
            heroSelectionMode={heroSelectionMode}
            startDate={startDate}
            endDate={endDate}
          />
        </TabPanel>
        <TabPanel>
          <HeroTable
            selectedLadder={selectedLadder}
            gameMode={gameMode}
            heroSelectionMode={heroSelectionMode}
            startDate={startDate}
            endDate={endDate}
          />
        </TabPanel>
      </Tabs>
    </Paper>
  );
}
