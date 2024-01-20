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
  const [tabIndex, setTabIndex] = useState(
    queryParams.get("tabIndex") ? parseInt(queryParams.get("tabIndex")!) : 0
  );
  const defaultFilters: MRT_ColumnFiltersState = [
    { id: "ladder", value: "public" },
    { id: "gameMode", value: "POINT 45" },
    { id: "heroSelectionMode", value: "ALL PICK" },
  ];
  const [filters, setFilters] = useState<MRT_ColumnFiltersState>(
    (queryParams.get("filters")
      ? JSON.parse(queryParams.get("filters")!)
      : defaultFilters) as MRT_ColumnFiltersState
  );
  const defaultPagination: GlobalPagination = {
    games: { pageIndex: 0, pageSize: 10 },
    players: { pageIndex: 0, pageSize: 10 },
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
  const [playersPagination, setPlayersPagination] =
    useState<MRT_PaginationState>(pagination.players);
  const defaultSorting: GlobalSorting = {
    games: [{ id: "createdDate", desc: true }],
    players: [{ id: "score", desc: true }],
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
  const [playersSorting, setPlayersSorting] = useState<MRT_SortingState>(
    sorting.players
  );
  const [ladders, setLadders] = useState<LaddersApiResponse>({
    public: [],
    private: [],
  });
  const [ladderSearchQuery, setLadderSearchQuery] = useState(
    queryParams.get("ladderSearch") || ""
  );
  const [playerSearchQuery, setPlayerSearchQuery] = useState(
    queryParams.get("playerSearch") || ""
  );

  // filter variables
  const ladderName =
    (filters.find((filter) => filter.id === "ladder")?.value as string) ||
    "public";
  const setLadderName = (value: string) => {
    setFilters([
      ...filters.filter((filter) => filter.id !== "ladder"),
      { id: "ladder", value },
    ]);
  };
  const gameMode =
    (filters.find((filter) => filter.id === "gameMode")?.value as string) || "";
  const setGameMode = (value: string) => {
    setFilters([
      ...filters.filter((filter) => filter.id !== "gameMode"),
      { id: "gameMode", value },
    ]);
  };
  const heroSelectionMode =
    (filters.find((filter) => filter.id === "heroSelectionMode")
      ?.value as string) || "";
  const setHeroSelectionMode = (value: string) => {
    setFilters([
      ...filters.filter((filter) => filter.id !== "heroSelectionMode"),
      { id: "heroSelectionMode", value },
    ]);
  };

  // keep pagination and sorting in sync
  useEffect(() => {
    setPagination({
      ...pagination,
      games: gamesPagination,
      players: playersPagination,
    });
    setSorting({ ...sorting, games: gamesSorting, players: playersSorting });
  }, [gamesPagination, gamesSorting, playersPagination, playersSorting]);

  // update query params on filter change
  useEffect(() => {
    queryParams.set("tabIndex", tabIndex.toString());
    queryParams.set(
      "filters",
      JSON.stringify(filters.filter((filter) => !!filter.value))
    );
    queryParams.set("pagination", JSON.stringify(pagination));
    queryParams.set("sorting", JSON.stringify(sorting));
    queryParams.set("ladderSearch", ladderSearchQuery);
    queryParams.set("playerSearch", playerSearchQuery);
    navigate({ search: queryParams.toString() });
  }, [
    tabIndex,
    filters,
    pagination,
    sorting,
    ladderSearchQuery,
    playerSearchQuery,
  ]);

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
            tabIndex={tabIndex}
            onTabIndexChange={setTabIndex}
            ladders={ladders}
            onLaddersChange={setLadders}
            selectedLadderName={ladderName}
            onSelectedLadderNameChange={setLadderName}
            columnFilters={filters}
            onColumnFiltersChange={setFilters}
            pagination={pagination}
            sorting={sorting}
            playerSearchQuery={playerSearchQuery}
            onPlayerSearch={setPlayerSearchQuery}
            onGamesPaginationChange={setGamesPagination}
            onGamesSortingChange={setGamesSorting}
            onPlayersPaginationChange={setPlayersPagination}
            onPlayersSortingChange={setPlayersSorting}
          />
        </Grid>
      </Grid>
    </Paper>
  );
}

export default App;
