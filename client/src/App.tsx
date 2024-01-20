/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from "react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Grid, Paper } from "@mui/material";
import {
  type MRT_ColumnFiltersState,
  type MRT_PaginationState,
  type MRT_SortingState,
} from "material-react-table";
import { SideControls } from "./components/SideControls";
import {
  MainTabs,
  type GlobalPagination,
  type GlobalSorting,
} from "./components/MainTabs";
import { ILaddersApiResponse as LaddersApiResponse } from "../../shared/types";
import "./App.css";

function App() {
  // navigation
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  // state variables
  const defaultFilters: MRT_ColumnFiltersState = [
    { id: "ladder", value: "public" },
    { id: "gameMode", value: "POINT 45" },
    { id: "heroSelectionMode", value: "" },
  ];
  const [filters, setFilters] = useState<MRT_ColumnFiltersState>(
    (queryParams.get("filters")
      ? JSON.parse(queryParams.get("filters")!)
      : defaultFilters) as MRT_ColumnFiltersState
  );
  const defaultPagination: GlobalPagination = {
    games: { pageIndex: 0, pageSize: 10 },
    heroes: { pageIndex: 0, pageSize: 10 },
  };
  const [pagination, setPagination] = useState<GlobalPagination>(
    (queryParams.get("pagination")
      ? JSON.parse(queryParams.get("pagination")!)
      : defaultPagination) as GlobalPagination
  );
  const [gamesPagination, setGamesPagination] = useState<MRT_PaginationState>(
    pagination.games
  );
  const defaultSorting: GlobalSorting = {
    games: [{ id: "createdDate", desc: true }],
    heroes: [],
  };
  const [sorting, setSorting] = useState<GlobalSorting>(
    (queryParams.get("sorting")
      ? JSON.parse(queryParams.get("sorting")!)
      : defaultSorting) as GlobalSorting
  );
  const [gamesSorting, setGamesSorting] = useState<MRT_SortingState>(
    sorting.games
  );
  const [ladders, setLadders] = useState<LaddersApiResponse>({
    public: [],
    private: [],
  });
  const [ladderSearchQuery, setLadderSearchQuery] = useState(
    queryParams.get("ladderSearch") || ""
  );

  // filter variables
  const ladderName =
    (filters.find((filter) => filter.id === "ladder")?.value as string) ||
    "public";
  const setLadderName = (value: string) => {
    setFilters(
      filters.map((filter) =>
        filter.id === "ladder" ? { ...filter, value } : filter
      )
    );
  };
  const gameMode =
    (filters.find((filter) => filter.id === "gameMode")?.value as string) || "";
  const setGameMode = (value: string) => {
    setFilters(
      filters.map((filter) =>
        filter.id === "gameMode" ? { ...filter, value } : filter
      )
    );
  };
  const heroSelectionMode =
    (filters.find((filter) => filter.id === "heroSelectionMode")
      ?.value as string) || "";
  const setHeroSelectionMode = (value: string) => {
    setFilters(
      filters.map((filter) =>
        filter.id === "heroSelectionMode" ? { ...filter, value } : filter
      )
    );
  };

  // keep pagination and sorting in sync
  useEffect(() => {
    setPagination({ ...pagination, games: gamesPagination });
    setSorting({ ...sorting, games: gamesSorting });
  }, [gamesPagination, gamesSorting]);

  // update query params on filter change
  useEffect(() => {
    queryParams.set(
      "filters",
      JSON.stringify(filters.filter((filter) => !!filter.value))
    );
    queryParams.set("pagination", JSON.stringify(pagination));
    queryParams.set("sorting", JSON.stringify(sorting));
    queryParams.set("ladderSearch", ladderSearchQuery);
    navigate({ search: queryParams.toString() });
  }, [filters, pagination, sorting, ladderSearchQuery]);

  return (
    <Paper id="container">
      <Grid container direction="row" justifyContent="space-between">
        <Grid item xs={4} md={3}>
          <SideControls
            ladders={ladders}
            onLaddersChange={setLadders}
            selectedLadderName={ladderName}
            onSelectedLadderNameChange={setLadderName}
            ladderSearchQuery={ladderSearchQuery}
            onLadderSearch={setLadderSearchQuery}
            gameMode={gameMode}
            onGameModeChange={setGameMode}
            heroSelectionMode={heroSelectionMode}
            onHeroSelectionModeChange={setHeroSelectionMode}
          />
        </Grid>
        <Grid item xs={8} md={9}>
          <MainTabs
            ladders={ladders}
            onLaddersChange={setLadders}
            selectedLadderName={ladderName}
            onSelectedLadderNameChange={setLadderName}
            columnFilters={filters}
            onColumnFiltersChange={setFilters}
            pagination={pagination}
            onGamesPaginationChange={setGamesPagination}
            sorting={sorting}
            onGamesSortingChange={setGamesSorting}
          />
        </Grid>
      </Grid>
    </Paper>
  );
}

export default App;
