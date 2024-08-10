/* eslint-disable react/prop-types */
import React from "react";
import { Dayjs } from "dayjs";
import { Fragment, useState, useEffect, useMemo } from "react";
import { Box, Button, Paper, MenuItem, ListItemIcon } from "@mui/material";
import { Add, Remove } from "@mui/icons-material";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_ColumnFiltersState,
  type MRT_PaginationState,
  type MRT_SortingState,
  MRT_ToggleFiltersButton,
  MRT_ToggleDensePaddingButton,
  MRT_ShowHideColumnsButton,
} from "material-react-table";
import { GameRow } from "./GameRow";
import { AddGamesToLadderDialog } from "./AddGamesToLadderDialog";
import { RemoveGamesFromLadderDialog } from "./RemoveGamesFromLadderDialog";
import type {
  IGame as Game,
  IGamesApiResponse as GamesApiResponse,
  ILaddersApiResponse as LaddersApiResponse,
} from "../../../shared/types";

type GameTableProps = {
  ladders: LaddersApiResponse;
  selectedLadder: string;
  onSelectedLadderChange: (ladderName: string) => void;
  gameMode: string;
  heroSelectionMode: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
};

export function GameTable({
  ladders,
  selectedLadder,
  onSelectedLadderChange,
  gameMode,
  heroSelectionMode,
  startDate,
  endDate,
}: GameTableProps) {
  // state variables
  const [games, setGames] = useState<Game[]>([]);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [refreshGames, setRefreshGames] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = useState<MRT_SortingState>([
    { id: "createdDate", desc: true },
  ]);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });
  const [globalFilter, setGlobalFilter] = useState("");
  const [openAdd, setOpenAdd] = useState(false);
  const [openRemove, setOpenRemove] = useState(false);
  const [gameIds, setGameIds] = useState<number[]>([]);

  // keep filters in sync
  useEffect(() => {
    setColumnFilters([
      ...columnFilters.filter(
        (filter) =>
          filter.id !== "gameMode" &&
          filter.id !== "heroSelectionMode" &&
          filter.id !== "createdDate"
      ),
      { id: "gameMode", value: gameMode },
      { id: "heroSelectionMode", value: heroSelectionMode },
      { id: "createdDate", value: [startDate, endDate] },
    ]);
  }, [gameMode, heroSelectionMode, startDate, endDate]);

  // update game list
  useEffect(() => {
    const fetchData = async () => {
      if (!games.length) {
        setIsLoading(true);
      } else {
        setIsRefetching(true);
      }

      const url = new URL(
        "/games",
        process.env.NODE_ENV === "production"
          ? "https://ninpou2-9cc068a4d220.herokuapp.com"
          : `http://localhost:${process.env.PORT || 8000}`
      );
      url.searchParams.set("take", `${pagination.pageSize}`);
      url.searchParams.set(
        "skip",
        `${pagination.pageIndex * pagination.pageSize}`
      );
      url.searchParams.set(
        "filters",
        JSON.stringify([
          ...columnFilters,
          { id: "ladder", value: selectedLadder },
        ])
      );
      url.searchParams.set("sorting", JSON.stringify(sorting));

      try {
        const response = await fetch(url.href);
        const json = (await response.json()) as GamesApiResponse;
        setGames(json.games);
        setRowCount(json.count);
      } catch (error) {
        setIsError(true);
        console.error(error);
        return;
      }
      setIsError(false);
      setIsLoading(false);
      setIsRefetching(false);
      setRefreshGames(false);
    };
    fetchData();
  }, [
    columnFilters, //re-fetch when column filters changes
    globalFilter, //re-fetch when global filter changes
    pagination, //re-fetch when page index changes
    sorting, //re-fetch when sorting
    selectedLadder, //re-fetch when selected ladder changes
    refreshGames, //re-fetch when explicitly requested
  ]);

  const columns = useMemo<MRT_ColumnDef<Game>[]>(
    () => [
      {
        accessorKey: "rankeable",
        header: "Ranked*",
        filterVariant: "checkbox",
        size: 40,
        Cell: ({ cell }) => (
          <Box
            component="span"
            sx={(theme) => ({
              backgroundColor: cell.getValue<boolean>()
                ? theme.palette.success.dark
                : theme.palette.error.dark,
              borderRadius: "0.25rem",
              color: "#fff",
              maxWidth: "9ch",
              p: "0.25rem",
            })}
          >
            {cell.getValue<boolean>() ? "YES" : "NO"}
          </Box>
        ),
      },
      {
        accessorFn: (row) => new Date(row.createdDate),
        id: "createdDate",
        header: "Date",
        filterVariant: "date",
        filterFn: "betweenInclusive",
        sortingFn: "datetime",
        Cell: ({ cell }) => cell.getValue<Date>()?.toLocaleString(), //render Date as a string
      },
      {
        accessorFn: (row) => `${row.players.length} / 9`,
        id: "players",
        header: "Slots",
        size: 40,
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        accessorFn: (row) => row.gameMode.replace("_", " "),
        id: "gameMode",
        header: "Game Mode",
        size: 40,
        enableSorting: false,
      },
      {
        accessorFn: (row) => row.heroSelectionMode.replace("_", " "),
        id: "heroSelectionMode",
        header: "Hero Selection",
        size: 40,
        enableSorting: false,
      },
      {
        accessorFn: (row) => Math.ceil(row.durationSeconds / 60),
        id: "durationSeconds",
        header: "Duration (min)",
        muiTableHeadCellProps: {
          align: "right",
        },
        muiTableBodyCellProps: {
          align: "right",
        },
        size: 40,
        enableSorting: true,
      },
      {
        accessorKey: "balance",
        id: "balance",
        header: "Balance Ladder",
        size: 80,
        grow: false,
        enableSorting: false,
      },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data: games,
    muiTablePaperProps: {
      elevation: 0,
      sx: {
        borderRadius: "0",
      },
    },
    muiTableHeadProps: {
      sx: () => ({
        "&": {
          backgroundColor: "#ffffff",
        },
      }),
    },
    muiTableBodyProps: {
      sx: () => ({
        "&": {
          backgroundColor: "#ffffff",
        },
      }),
    },
    mrtTheme: (theme) => ({
      baseBackgroundColor: "rgba(0, 0, 0, 0)",
      draggingBorderColor: theme.palette.secondary.main,
    }),
    enableRowSelection: true,
    enableGlobalFilter: false,
    enableRowActions: true,
    enableExpanding: true,
    enableExpandAll: true,
    getRowId: (row) => row.id + "",
    initialState: { showColumnFilters: false, density: "compact" },
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    muiToolbarAlertBannerProps: isError
      ? {
          color: "error",
          children: "Error loading data",
        }
      : undefined,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    rowCount,
    state: {
      columnFilters,
      globalFilter,
      isLoading,
      pagination,
      showAlertBanner: isError,
      showProgressBars: isRefetching,
      sorting,
    },
    renderDetailPanel: ({ row }) => <GameRow game={row.original} />,
    renderRowActionMenuItems: ({ closeMenu, row }) => [
      <MenuItem
        key={0}
        onClick={() => {
          handleClickOpen(true, row.original);
          closeMenu();
        }}
        sx={{ m: 0 }}
      >
        <ListItemIcon>
          <Add />
        </ListItemIcon>
        Add to Ladder
      </MenuItem>,
      <MenuItem
        key={1}
        onClick={() => {
          handleClickOpen(false, row.original);
          closeMenu();
        }}
        sx={{ m: 0 }}
      >
        <ListItemIcon>
          <Remove />
        </ListItemIcon>
        Remove from Ladder
      </MenuItem>,
    ],
    renderTopToolbar: ({ table }) => {
      return (
        <Box
          sx={() => ({
            display: "flex",
            gap: "0.5rem",
            p: "8px",
            justifyContent: "space-between",
          })}
        >
          <Box sx={{ display: "flex", gap: "0.5rem" }}>
            <Button
              color="success"
              disabled={table.getSelectedRowModel().flatRows.length === 0}
              onClick={() => handleClickOpen(true)}
              variant="contained"
            >
              <Add />
              Add to Ladder
            </Button>
            <Button
              color="error"
              disabled={
                table.getSelectedRowModel().flatRows.length === 0 ||
                selectedLadder === "public"
              }
              onClick={() => handleClickOpen(false)}
              variant="contained"
            >
              <Remove />
              Remove from Ladder
            </Button>
          </Box>
          <Box sx={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <MRT_ToggleFiltersButton table={table} />
            <MRT_ShowHideColumnsButton table={table} />
            <MRT_ToggleDensePaddingButton table={table} />
          </Box>
        </Box>
      );
    },
  });

  const handleClickOpen = (add: boolean, game?: Game) => {
    const ids: number[] = [];
    if (game) {
      ids.push(game.id);
    } else if (!game) {
      ids.push(
        ...table.getSelectedRowModel().flatRows.map((row) => row.original.id)
      );
    }
    if (ids.length > 0) {
      setGameIds(ids);
      add ? setOpenAdd(true) : setOpenRemove(true);
    }
  };

  return (
    <Paper className="table">
      <Fragment>
        <AddGamesToLadderDialog
          open={openAdd}
          onOpenChanged={setOpenAdd}
          gameIds={gameIds}
          ladders={ladders}
          onGamesAddedToLadder={(ladderName: string) => {
            onSelectedLadderChange(ladderName);
            setRefreshGames(true);
          }}
        />
        <RemoveGamesFromLadderDialog
          open={openRemove}
          onOpenChanged={setOpenRemove}
          gameIds={gameIds}
          ladderName={selectedLadder}
          onGamesRemovedFromLadder={(ladderName: string) => {
            onSelectedLadderChange(ladderName);
            setRefreshGames(true);
          }}
        />
        {(!selectedLadder || selectedLadder === "public") && (
          <p>
            *Only games with more of two players without leavers are ranked in
            the public ladder.
          </p>
        )}
        <MaterialReactTable table={table} />
      </Fragment>
    </Paper>
  );
}
