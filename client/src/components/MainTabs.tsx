import React from "react";
import { Paper } from "@mui/material";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import {
  type MRT_ColumnFiltersState,
  type MRT_PaginationState,
  type MRT_SortingState,
} from "material-react-table";
import { GameTable } from "./GameTable";
import { PlayerTable } from "./PlayerTable";
import { ILaddersApiResponse as LaddersApiResponse } from "../../../shared/types";

export type GlobalPagination = {
  games: MRT_PaginationState;
  players: MRT_PaginationState;
  heroes: MRT_PaginationState;
};

export type GlobalSorting = {
  games: MRT_SortingState;
  players: MRT_SortingState;
  heroes: MRT_SortingState;
};

type MainTabsProps = {
  tabIndex: number;
  onTabIndexChange: (tabIndex: number) => void;
  ladders: LaddersApiResponse;
  onLaddersChange: (ladders: LaddersApiResponse) => void;
  selectedLadderName: string;
  onSelectedLadderNameChange: (ladderName: string) => void;
  columnFilters: MRT_ColumnFiltersState;
  onColumnFiltersChange: (
    updaterOrValue:
      | MRT_ColumnFiltersState
      | ((old: MRT_ColumnFiltersState) => MRT_ColumnFiltersState)
  ) => void;
  playerSearchQuery: string;
  onPlayerSearch: (playerSearch: string) => void;
  pagination: GlobalPagination;
  sorting: GlobalSorting;
  onGamesPaginationChange: (
    updaterOrValue:
      | MRT_PaginationState
      | ((old: MRT_PaginationState) => MRT_PaginationState)
  ) => void;
  onGamesSortingChange: (
    updaterOrValue:
      | MRT_SortingState
      | ((old: MRT_SortingState) => MRT_SortingState)
  ) => void;
  onPlayersPaginationChange: (
    updaterOrValue:
      | MRT_PaginationState
      | ((old: MRT_PaginationState) => MRT_PaginationState)
  ) => void;
  onPlayersSortingChange: (
    updaterOrValue:
      | MRT_SortingState
      | ((old: MRT_SortingState) => MRT_SortingState)
  ) => void;
};

export function MainTabs({
  tabIndex,
  onTabIndexChange,
  ladders,
  onLaddersChange,
  selectedLadderName,
  onSelectedLadderNameChange,
  columnFilters,
  onColumnFiltersChange,
  playerSearchQuery,
  onPlayerSearch,
  pagination,
  sorting,
  onGamesPaginationChange,
  onGamesSortingChange,
  onPlayersPaginationChange,
  onPlayersSortingChange,
}: MainTabsProps) {
  return (
    <Paper>
      <Tabs
        defaultIndex={tabIndex}
        onSelect={(index: number) => onTabIndexChange(index)}
      >
        <TabList>
          <Tab>Games</Tab>
          <Tab>Players</Tab>
          <Tab>Heroes</Tab>
        </TabList>
        <TabPanel>
          <GameTable
            ladders={ladders}
            onLaddersChange={onLaddersChange}
            selectedLadderName={selectedLadderName}
            onSelectedLadderNameChange={onSelectedLadderNameChange}
            columnFilters={columnFilters}
            onColumnFiltersChange={onColumnFiltersChange}
            pagination={pagination.games}
            onPaginationChange={onGamesPaginationChange}
            sorting={sorting.games}
            onSortingChange={onGamesSortingChange}
          />
        </TabPanel>
        <TabPanel>
          <PlayerTable
            columnFilters={columnFilters}
            onColumnFiltersChange={onColumnFiltersChange}
            pagination={pagination.players}
            onPaginationChange={onPlayersPaginationChange}
            sorting={sorting.players}
            onSortingChange={onPlayersSortingChange}
            playerSearchQuery={playerSearchQuery}
            onPlayerSearch={onPlayerSearch}
          />
        </TabPanel>
        <TabPanel></TabPanel>
      </Tabs>
    </Paper>
  );
}
