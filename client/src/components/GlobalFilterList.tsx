import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Grid,
    Paper,
} from "@mui/material";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import { GameTable } from "./GameTable";
import { LadderList } from "./LadderList";
import {
    type MRT_ColumnFiltersState,
    type MRT_PaginationState,
    type MRT_SortingState,
} from "material-react-table";

type GlobalPagination = {
    games: MRT_PaginationState;
    heroes: MRT_PaginationState;
};

type GlobalSorting = {
    games: MRT_SortingState;
    heroes: MRT_SortingState;
};

export function GlobalFilterList() {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const defaultFilters: MRT_ColumnFiltersState = [{ id: "ladder", value: "public" }];
    const [filters, setFilters] = useState<MRT_ColumnFiltersState>(
        (queryParams.get("filters") ? JSON.parse(queryParams.get("filters")!) : defaultFilters) as MRT_ColumnFiltersState
    );
    const defaultPagination: GlobalPagination = {
        games: { pageIndex: 0, pageSize: 10 },
        heroes: { pageIndex: 0, pageSize: 10 },
    };
    const [pagination, setPagination] = useState<GlobalPagination>(
        (queryParams.get("pagination") ? JSON.parse(queryParams.get("pagination")!) : defaultPagination) as GlobalPagination
    );
    const [gamesPagination, setGamesPagination] = useState<MRT_PaginationState>(pagination.games);
    const defaultSorting: GlobalSorting = {
        games: [{ id: "createdDate", desc: true }],
        heroes: [],
    };
    const [sorting, setSorting] = useState<GlobalSorting>(
        (queryParams.get("sorting") ? JSON.parse(queryParams.get("sorting")!) : defaultSorting) as GlobalSorting
    );
    const [gamesSorting, setGamesSorting] = useState<MRT_SortingState>(sorting.games);
    const [ladderSearchQuery, setLadderSearchQuery] = useState(queryParams.get("ladderSearch") || "");

    // filter variables
    const ladderName = filters.find(filter => filter.id === "ladder")?.value as string || "public";
    const setLadderName = (ladderName: string) => {
        setFilters(filters.map(filter => filter.id === "ladder" ? { ...filter, value: ladderName } : filter));
    };

    // keep pagination and sorting in sync
    useEffect(() => {
        setPagination({ ...pagination, games: gamesPagination });
        setSorting({ ...sorting, games: gamesSorting });
    }, [gamesPagination, gamesSorting]);

    // update query params on filter change
    useEffect(() => {
        queryParams.set("filters", JSON.stringify(filters.filter(filter => !!filter.value)));
        queryParams.set("pagination", JSON.stringify(pagination));
        queryParams.set("sorting", JSON.stringify(sorting));
        queryParams.set("ladderSearch", ladderSearchQuery);
        navigate({ search: queryParams.toString() });
    }, [filters, pagination, sorting, ladderSearchQuery]);

    return (
        <Paper id="container">
            <Grid container direction="row" justifyContent="space-between">
                <Grid item xs={4} md={3}>
                    <Paper>
                        <LadderList
                            selectedLadderName={ladderName}
                            onSelectedLadderNameChange={setLadderName}
                            ladderSearchQuery={ladderSearchQuery}
                            onLadderSearch={setLadderSearchQuery} />
                    </Paper>
                </Grid>
                <Grid item xs={8} md={9}>
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
                                        columnFilters={filters}
                                        onColumnFiltersChange={setFilters}
                                        pagination={pagination.games}
                                        onPaginationChange={setGamesPagination}
                                        sorting={sorting.games}
                                        onSortingChange={setGamesSorting} />
                                </Paper>
                            </TabPanel>
                            <TabPanel>
                            </TabPanel>
                            <TabPanel>
                            </TabPanel>
                        </Tabs>
                    </Paper>
                </Grid>
            </Grid>
        </Paper>
    )
}
