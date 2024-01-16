import { useState, useEffect, useMemo } from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_ColumnFiltersState,
  type MRT_PaginationState,
  type MRT_SortingState,
} from "material-react-table";
import "react-tabs/style/react-tabs.css";
import "./App.css";
import type { IGame as Game } from "./shared/types";

function App() {
  type GamesApiResponse = {
    games: Array<Game>;
    count: number;
  };

  function GamesTable() {
    const [games, setGames] = useState<Game[]>([]);
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefetching, setIsRefetching] = useState(false);
    const [rowCount, setRowCount] = useState(0);

    //table state
    const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
      [],
    );
    const [globalFilter, setGlobalFilter] = useState("");
    const [sorting, setSorting] = useState<MRT_SortingState>([{ id: "createdDate", desc: true }]);
    const [pagination, setPagination] = useState<MRT_PaginationState>({
      pageIndex: 0,
      pageSize: 10,
    });

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
            ? "https://www.material-react-table.com"
            : "http://localhost:8000",
        );
        url.searchParams.set(
          "take",
          `${pagination.pageSize}`,
        );
        url.searchParams.set(
          "skip",
          `${pagination.pageIndex * pagination.pageSize}`,
        );
        url.searchParams.set("filters", JSON.stringify(columnFilters ?? []));
        url.searchParams.set("globalFilter", globalFilter ?? '');
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
        }
      ],
      [],
    );

    const table = useMaterialReactTable({
      columns,
      data: games,
      enableRowSelection: true,
      enableGlobalFilter: false,
      getRowId: (row) => row.id + "",
      initialState: { showColumnFilters: false },
      manualFiltering: true,
      manualPagination: true,
      manualSorting: true,
      muiToolbarAlertBannerProps: isError
        ? {
          color: 'error',
          children: 'Error loading data',
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

    return <MaterialReactTable table={table} />;
  }

  return (
    <>
      <Tabs defaultIndex={0}>
        <TabList>
          <Tab>Games</Tab>
          <Tab>Players</Tab>
          <Tab>Heroes</Tab>
        </TabList>
        <TabPanel>
          <GamesTable />,
        </TabPanel>
        <TabPanel>
        </TabPanel>
        <TabPanel>
        </TabPanel>
      </Tabs>
    </>
  );
}

export default App