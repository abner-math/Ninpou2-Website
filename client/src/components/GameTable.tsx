import { useState, useEffect, useMemo } from "react";
import {
    Box,
    Button,
    MenuItem,
    ListItemIcon,
} from "@mui/material";
import { Add, Remove } from '@mui/icons-material';
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
import type { IGame as Game } from "../shared/types";

type GamesApiResponse = {
    games: Array<Game>;
    count: number;
};

type GamesTableProps = {
    columnFilters: MRT_ColumnFiltersState;
    onColumnFiltersChange: (updaterOrValue: MRT_ColumnFiltersState | ((old: MRT_ColumnFiltersState) => MRT_ColumnFiltersState)) => void;
    pagination: MRT_PaginationState;
    onPaginationChange: (updaterOrValue: MRT_PaginationState | ((old: MRT_PaginationState) => MRT_PaginationState)) => void;
    sorting: MRT_SortingState;
    onSortingChange: (updaterOrValue: MRT_SortingState | ((old: MRT_SortingState) => MRT_SortingState)) => void;
};

export function GameTable({ columnFilters, onColumnFiltersChange, pagination, onPaginationChange, sorting, onSortingChange }: GamesTableProps) {
    const [games, setGames] = useState<Game[]>([]);
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefetching, setIsRefetching] = useState(false);
    const [rowCount, setRowCount] = useState(0);
    const [globalFilter, setGlobalFilter] = useState("");

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
                Cell: ({ cell }) =>
                    <Box component="span" sx={(theme) => ({
                        backgroundColor: cell.getValue<boolean>() ? theme.palette.success.dark : theme.palette.error.dark,
                        borderRadius: "0.25rem",
                        color: "#fff",
                        maxWidth: "9ch",
                        p: "0.25rem",
                    })}>{cell.getValue<boolean>() ? "YES" : "NO"}</Box>
                ,
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
        [],
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
            sx: (theme) => ({
                '&':
                {
                    backgroundColor: "#ffffff",
                },
            }),
        },
        muiTableBodyProps: {
            sx: (theme) => ({
                '&':
                {
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
                color: 'error',
                children: 'Error loading data',
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
        renderDetailPanel: ({ row }) => (
            <GameRow game={row.original} />
        ),
        renderRowActionMenuItems: ({ closeMenu }) => [
            <MenuItem key={0} onClick={closeMenu} sx={{ m: 0 }}>
                <ListItemIcon>
                    <Add />
                </ListItemIcon>
                Add to Ladder
            </MenuItem>,
            <MenuItem key={1} onClick={closeMenu} sx={{ m: 0 }}>
                <ListItemIcon>
                    <Remove />
                </ListItemIcon>
                Remove from Ladder
            </MenuItem>
        ],
        renderTopToolbar: ({ table }) => {
            const handleRemove = () => {
                table.getSelectedRowModel().flatRows.map((row) => {
                    alert('deactivating ' + row.getValue('name'));
                });
            };

            const handleAdd = () => {
                table.getSelectedRowModel().flatRows.map((row) => {
                    alert('activating ' + row.getValue('name'));
                });
            };

            return (
                <Box sx={(theme) => ({
                    display: "flex",
                    gap: "0.5rem",
                    p: "8px",
                    justifyContent: "space-between",
                })}>
                    <Box sx={{ display: "flex", gap: "0.5rem" }}>
                        <Button color="success" disabled={!table.getIsSomeRowsSelected()} onClick={handleAdd} variant="contained">
                            <Add />
                            Add to Ladder
                        </Button>
                        <Button color="error" disabled={!table.getIsSomeRowsSelected()} onClick={handleRemove} variant="contained">
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

    return <MaterialReactTable table={table} />;
}
