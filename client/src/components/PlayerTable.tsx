/* eslint-disable react/prop-types */
import React from "react";
import { useState, useEffect, useMemo } from "react";
import { Paper } from "@mui/material";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_ColumnFiltersState,
  type MRT_PaginationState,
  type MRT_SortingState,
} from "material-react-table";
import type {
  IPlayerWithScore as Player,
  IPlayersApiResponse as PlayersApiResponse,
} from "../../../shared/types";

type PlayerTableProps = {
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
  playerSearchQuery: string;
  onPlayerSearch: (playerSearch: string) => void;
};

export function PlayerTable({
  columnFilters,
  onColumnFiltersChange,
  pagination,
  onPaginationChange,
  sorting,
  onSortingChange,
  playerSearchQuery,
  onPlayerSearch,
}: PlayerTableProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [rowCount, setRowCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!players.length) {
        setIsLoading(true);
      } else {
        setIsRefetching(true);
      }

      const url = new URL("/players", "http://localhost:8000");
      url.searchParams.set("take", `${pagination.pageSize}`);
      url.searchParams.set(
        "skip",
        `${pagination.pageIndex * pagination.pageSize}`
      );
      url.searchParams.set("filters", JSON.stringify(columnFilters ?? []));
      url.searchParams.set("search", playerSearchQuery ?? "");
      url.searchParams.set("sorting", JSON.stringify(sorting ?? []));

      try {
        const response = await fetch(url.href);
        const json = (await response.json()) as PlayersApiResponse;
        setPlayers(json.players);
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
    playerSearchQuery, //re-fetch when global filter changes
    pagination.pageIndex, //re-fetch when page index changes
    pagination.pageSize, //re-fetch when page size changes
    sorting, //re-fetch when sorting changes
  ]);

  const columns = useMemo<MRT_ColumnDef<Player>[]>(
    () => [
      {
        accessorKey: "score",
        header: "Score (%)",
        muiTableHeadCellProps: {
          align: "right",
        },
        muiTableBodyCellProps: {
          align: "right",
        },
        size: 40,
        grow: true,
        enableSorting: true,
        Cell: ({ cell }) => cell.getValue<number>()?.toFixed(2),
      },
      {
        accessorKey: "player_steamId",
        header: "Steam Id",
        size: 40,
        grow: true,
        enableSorting: false,
        enableClickToCopy: true,
      },
      {
        accessorKey: "player_name",
        header: "Name",
        size: 100,
        grow: false,
        enableSorting: false,
        enableClickToCopy: true,
      },
      {
        accessorKey: "kills",
        header: "Kills",
        muiTableHeadCellProps: {
          align: "right",
        },
        muiTableBodyCellProps: {
          align: "right",
        },
        size: 40,
        grow: true,
        enableSorting: true,
        enableColumnFilter: false,
      },
      {
        accessorKey: "deaths",
        header: "Deaths",
        muiTableHeadCellProps: {
          align: "right",
        },
        muiTableBodyCellProps: {
          align: "right",
        },
        size: 40,
        grow: true,
        enableSorting: true,
        enableColumnFilter: false,
      },
      {
        accessorKey: "assists",
        header: "Assists",
        muiTableHeadCellProps: {
          align: "right",
        },
        muiTableBodyCellProps: {
          align: "right",
        },
        size: 40,
        grow: true,
        enableSorting: true,
        enableColumnFilter: false,
      },
      {
        accessorKey: "points",
        header: "Points",
        muiTableHeadCellProps: {
          align: "right",
        },
        muiTableBodyCellProps: {
          align: "right",
        },
        size: 40,
        grow: true,
        enableSorting: true,
        enableColumnFilter: false,
      },
      {
        accessorKey: "wins",
        header: "Wins",
        muiTableHeadCellProps: {
          align: "right",
        },
        muiTableBodyCellProps: {
          align: "right",
        },
        size: 60,
        grow: true,
        enableSorting: true,
        enableColumnFilter: false,
        Cell: ({ cell }) =>
          `${cell.row.original.wins} / ${cell.row.original.wins + cell.row.original.losses} (${(cell.row.original.wins / (cell.row.original.wins + cell.row.original.losses)).toFixed(2)}%)`,
      },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data: players,
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
    enableRowSelection: false,
    enableGlobalFilter: true,
    getRowId: (row) => row.player_steamId,
    initialState: { showColumnFilters: false, density: "compact" },
    manualFiltering: false,
    manualPagination: true,
    manualSorting: true,
    enableRowNumbers: true,
    rowNumberDisplayMode: "original",
    muiToolbarAlertBannerProps: isError
      ? {
          color: "error",
          children: "Error loading data",
        }
      : undefined,
    onColumnFiltersChange,
    onGlobalFilterChange: onPlayerSearch,
    onPaginationChange,
    onSortingChange,
    rowCount,
    state: {
      columnFilters: columnFilters.filter(
        (filter) =>
          ![
            "ladder",
            "gameMode",
            "heroSelectionMode",
            "createdDate",
            "rankeable",
            "balance",
          ].includes(filter.id)
      ),
      globalFilter: playerSearchQuery,
      isLoading,
      pagination,
      showAlertBanner: isError,
      showProgressBars: isRefetching,
      sorting,
    },
  });

  return (
    <Paper className="table">
      <MaterialReactTable table={table} />
    </Paper>
  );
}
