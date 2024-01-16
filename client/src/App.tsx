import { useState, useEffect, useMemo } from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import {
  Box,
  Button,
  MenuItem,
  ListItemIcon,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  styled,
} from '@mui/material';
import { tableCellClasses } from '@mui/material/TableCell';
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
  MRT_ToggleFullScreenButton,
  MRT_ShowHideColumnsButton,
} from "material-react-table";
import "react-tabs/style/react-tabs.css";
import "./App.css";
import type { IGame as Game } from "./shared/types";

function App() {
  type GamesApiResponse = {
    games: Array<Game>;
    count: number;
  };

  function GamesRow({ game }: { game: Game }) {
    const StyledTableCell = styled(TableCell)(({ theme }) => ({
      [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
      },
      ["&.KONOHAGAKURE"]: {
        backgroundColor: "#244519",
        color: theme.palette.common.white,
      },
      ["&.OTOGAKURE"]: {
        backgroundColor: "#2d126e",
        color: theme.palette.common.white,
      },
      ["&.AKATSUKI"]: {
        backgroundColor: "#8a0b0b",
        color: theme.palette.common.white,
      },
      [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
      },
    }));
    return (
      <Box sx={{
        display: "flex",
        "justifyContent": "space-around",
        "alignItems": "left"
      }}>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <StyledTableCell>Steam Id</StyledTableCell>
                <StyledTableCell>Name</StyledTableCell>
                <StyledTableCell>Hero</StyledTableCell>
                <StyledTableCell>Level</StyledTableCell>
                <StyledTableCell align="right">Kills</StyledTableCell>
                <StyledTableCell align="right">Deaths</StyledTableCell>
                <StyledTableCell align="right">Assists</StyledTableCell>
                <StyledTableCell align="right">Points</StyledTableCell>
                <StyledTableCell>Items</StyledTableCell>
                <StyledTableCell>State</StyledTableCell>
              </TableRow>
            </TableHead>
            {["KONOHAGAKURE", "OTOGAKURE", "AKATSUKI"].map((team) => (
              <>
                <TableHead>
                  <TableRow>
                    <StyledTableCell className={team} align="center" colSpan={10}>{team}</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {game.players.filter(player => player.team === team).map((player) => (
                    <TableRow key={player.player.steamId} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                      <TableCell component="th" scope="row">{player.player.steamId}</TableCell>
                      <TableCell>{player.player.name}</TableCell>
                      <TableCell>
                        <Avatar
                          variant="square"
                          alt={player.hero.name.charAt(0).toUpperCase() + player.hero.name.slice(1)}
                          src={"/images/heroes/npc_dota_hero_" + player.hero.name + ".png"} />
                      </TableCell>
                      <TableCell>{player.level}</TableCell>
                      <TableCell align="right">{player.kills}</TableCell>
                      <TableCell align="right">{player.deaths}</TableCell>
                      <TableCell align="right">{player.assists}</TableCell>
                      <TableCell align="right">{player.points}</TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex" }}>
                          {player.items.filter(item => item.name !== "item_tpscroll").map((item) => (
                            <Avatar
                              variant="square"
                              alt={item.name.replace("item_", "").replace("_", " ")}
                              src={"/images/items/" + item.name.replace("item_", "") + ".png"} />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>{player.state.replace("_", " ")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </>
            ))}
          </Table>
        </TableContainer>
      </Box>
    )
  }

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
        }
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
      renderDetailPanel: ({ row }) => (
        <GamesRow game={row.original} />
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
              <MRT_ToggleFullScreenButton table={table} />
            </Box>
          </Box>
        );
      },
    });

    return <Paper className="gamestable">
      <MaterialReactTable table={table} />
    </Paper>;
  }

  return (
    <Paper id="container">
      <Tabs defaultIndex={0}>
        <TabList>
          <Tab>Games</Tab>
          <Tab>Players</Tab>
          <Tab>Heroes</Tab>
        </TabList>
        <TabPanel>
          <GamesTable />
        </TabPanel>
        <TabPanel>
        </TabPanel>
        <TabPanel>
        </TabPanel>
      </Tabs>
    </Paper>
  );
}

export default App