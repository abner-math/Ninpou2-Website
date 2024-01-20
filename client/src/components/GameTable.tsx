/* eslint-disable react/prop-types */
import React from "react";
import { Fragment, useState, useEffect, useMemo } from "react";
import { Box, Button, MenuItem, ListItemIcon } from "@mui/material";
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

type GamesTableProps = {
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
  pagination: MRT_PaginationState;
  onPaginationChange: (
    updaterOrValue:
      | MRT_PaginationState
      | ((old: MRT_PaginationState) => MRT_PaginationState)
  ) => void;
  sorting: MRT_SortingState;
  onSortingChange: (
    updaterOrValue:
      | MRT_SortingState
      | ((old: MRT_SortingState) => MRT_SortingState)
  ) => void;
};

export function GameTable({
  ladders,
  selectedLadderName,
  onSelectedLadderNameChange,
  columnFilters,
  onColumnFiltersChange,
  pagination,
  onPaginationChange,
  sorting,
  onSortingChange,
}: GamesTableProps) {
  const [games, setGames] = useState<Game[]>([]);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  const [globalFilter, setGlobalFilter] = useState("");
  const [openAdd, setOpenAdd] = useState(false);
  const [openRemove, setOpenRemove] = useState(false);
  const [gameIds, setGameIds] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!games.length) {
        setIsLoading(true);
      } else {
        setIsRefetching(true);
      }

      const url = new URL("/games", "http://localhost:8000");
      url.searchParams.set("take", `${pagination.pageSize}`);
      url.searchParams.set(
        "skip",
        `${pagination.pageIndex * pagination.pageSize}`
      );
      url.searchParams.set("filters", JSON.stringify(columnFilters ?? []));
      url.searchParams.set("sorting", JSON.stringify(sorting ?? []));

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
    };
    fetchData();
  }, [
    columnFilters, //re-fetch when column filters change
    globalFilter, //re-fetch when global filter changes
    pagination.pageIndex, //re-fetch when page index changes
    pagination.pageSize, //re-fetch when page size changes
    sorting, //re-fetch when sorting changes
  ]);

  const columns = useMemo<MRT_ColumnDef<Game>[]>(
    () => [
      {
        accessorKey: "rankeable",
        header: "Rankeable",
        filterVariant: "checkbox",
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
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        accessorFn: (row) => row.gameMode.replace("_", " "),
        id: "gameMode",
        header: "Game Mode",
        enableSorting: false,
      },
      {
        accessorFn: (row) => row.heroSelectionMode.replace("_", " "),
        id: "heroSelectionMode",
        header: "Hero Selection",
        enableSorting: false,
      },
      {
        accessorFn: (row) => Math.ceil(row.durationSeconds / 60),
        id: "durationSeconds",
        header: "Duration (min)",
        enableSorting: true,
      },
      {
        accessorKey: "balance",
        id: "balance",
        header: "Balance Ladder",
        enableSorting: true,
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
    enableRowSelection: (row) => row.getValue<boolean>("rankeable"),
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
    onColumnFiltersChange,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange,
    onSortingChange,
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
                selectedLadderName === "public"
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
    const ids = [];
    if (game && game.rankeable) {
      ids.push(game.id);
    } else if (!game) {
      ids.push(
        ...table
          .getSelectedRowModel()
          .flatRows.filter((row) => row.original.rankeable)
          .map((row) => row.original.id)
      );
    }
    if (ids.length > 0) {
      setGameIds(ids);
      add ? setOpenAdd(true) : setOpenRemove(true);
    }
  };

  return (
    <Fragment>
      <AddGamesToLadderDialog
        open={openAdd}
        onOpenChanged={setOpenAdd}
        gameIds={gameIds}
        ladders={ladders}
        onGamesAddedToLadder={(ladderName: string) => {
          onSelectedLadderNameChange(ladderName);
        }}
      />
      <RemoveGamesFromLadderDialog
        open={openRemove}
        onOpenChanged={setOpenRemove}
        gameIds={gameIds}
        ladderName={selectedLadderName}
        onGamesRemovedFromLadder={(ladderName: string) => {
          onSelectedLadderNameChange(ladderName);
        }}
      />
      <MaterialReactTable table={table} />
    </Fragment>
  );
}
