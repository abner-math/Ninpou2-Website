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
import { ILaddersApiResponse as LaddersApiResponse } from "../../../shared/types";

export type GlobalPagination = {
  games: MRT_PaginationState;
  heroes: MRT_PaginationState;
};

export type GlobalSorting = {
  games: MRT_SortingState;
  heroes: MRT_SortingState;
};

type MainTabsProps = {
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
  pagination: GlobalPagination;
  onGamesPaginationChange: (
    updaterOrValue:
      | MRT_PaginationState
      | ((old: MRT_PaginationState) => MRT_PaginationState)
  ) => void;
  sorting: GlobalSorting;
  onGamesSortingChange: (
    updaterOrValue:
      | MRT_SortingState
      | ((old: MRT_SortingState) => MRT_SortingState)
  ) => void;
};

export function MainTabs({
  ladders,
  onLaddersChange,
  selectedLadderName,
  onSelectedLadderNameChange,
  columnFilters,
  onColumnFiltersChange,
  pagination,
  onGamesPaginationChange,
  sorting,
  onGamesSortingChange,
}: MainTabsProps) {
  return (
    <Paper>
      <Tabs defaultIndex={0}>
        <TabList>
          <Tab>Games</Tab>
          <Tab>Players</Tab>
          <Tab>Heroes</Tab>
        </TabList>
        <TabPanel>
          <Paper className="table">
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
          </Paper>
        </TabPanel>
        <TabPanel></TabPanel>
        <TabPanel></TabPanel>
      </Tabs>
    </Paper>
  );
}
