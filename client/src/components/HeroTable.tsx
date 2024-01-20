/* eslint-disable react/prop-types */
import React from "react";
import { Dayjs } from "dayjs";
import { useState, useEffect, useMemo } from "react";
import { Paper, Avatar } from "@mui/material";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_ColumnFiltersState,
  type MRT_PaginationState,
  type MRT_SortingState,
} from "material-react-table";
import { useQueryState } from "../hooks/useQueryState";
import type {
  IHeroWithScore as Hero,
  IHeroesApiResponse as HeroesApiResponse,
} from "../../../shared/types";

type HeroTableProps = {
  selectedLadder: string;
  gameMode: string;
  heroSelectionMode: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
};

export function HeroTable({
  selectedLadder,
  gameMode,
  heroSelectionMode,
  startDate,
  endDate,
}: HeroTableProps) {
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = useState<MRT_SortingState>([
    { id: "score", desc: true },
  ]);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  });
  const [globalFilter, setGlobalFilter] = useQueryState("heroSearch", "");

  useEffect(() => {
    const fetchData = async () => {
      if (!heroes.length) {
        setIsLoading(true);
      } else {
        setIsRefetching(true);
      }

      const url = new URL("/heroes", "http://localhost:8000");
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
          { id: "gameMode", value: gameMode },
          { id: "heroSelectionMode", value: heroSelectionMode },
          {
            id: "createdDate",
            value: [startDate?.toISOString(), endDate?.toISOString()],
          },
        ])
      );
      url.searchParams.set("sorting", JSON.stringify(sorting));

      try {
        const response = await fetch(url.href);
        const json = (await response.json()) as HeroesApiResponse;
        setHeroes(json.heroes);
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
    columnFilters, //re-fetch when column filters changes
    globalFilter, //re-fetch when global filter changes
    pagination, //re-fetch when pagination changes
    sorting, //re-fetch when sorting changes
    selectedLadder, //re-fetch when selected ladder changes
    gameMode, //re-fetch when game mode changes
    heroSelectionMode, //re-fetch when hero selection mode changes
    startDate, //re-fetch when start date changes
    endDate, //re-fetch when end date changes
  ]);

  const columns = useMemo<MRT_ColumnDef<Hero>[]>(
    () => [
      {
        accessorKey: "score",
        header: "Score (%)*",
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
        accessorKey: "heroName",
        header: "Hero",
        size: 40,
        grow: false,
        enableSorting: false,
        enableClickToCopy: true,
        Cell: ({ cell }) => (
          <Avatar
            variant="square"
            alt={
              cell.getValue<string>().charAt(0).toUpperCase() +
              cell.getValue<string>().slice(1)
            }
            src={
              "/images/heroes/npc_dota_hero_" + cell.getValue<string>() + ".png"
            }
          />
        ),
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
    data: heroes,
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
    getRowId: (row) => row.heroName,
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
  });

  return (
    <Paper className="table">
      <p>
        *Score is calculated using{" "}
        <a
          href="https://en.wikipedia.org/wiki/Binomial_proportion_confidence_interval"
          target="_blank"
          rel="noreferrer"
        >
          Binominal proportion confidence interval
        </a>
        .
      </p>
      <MaterialReactTable table={table} />
    </Paper>
  );
}
