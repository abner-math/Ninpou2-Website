import { useState, useEffect } from "react";
import {
    Box,
    IconButton,
    TextField,
    List,
    ListItemButton,
    ListItemText,
    ListSubheader,
    Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { ILadder as Ladder } from "../shared/types";

type LaddersApiResponse = {
    default: Array<Ladder>,
    custom: Array<Ladder>
};

type LadderListProps = {
    selectedLadderName: string;
    onSelectedLadderNameChange: (ladderName: string) => void;
    ladderSearchQuery: string;
    onLadderSearch: (ladderSearchQuery: string) => void;
}

export function LadderList({ selectedLadderName, onSelectedLadderNameChange, ladderSearchQuery, onLadderSearch }: LadderListProps) {
    const [ladders, setLadders] = useState<LaddersApiResponse>({ default: [], custom: [] });

    // update ladder list
    useEffect(() => {
        const fetchData = async () => {
            const url = new URL(
                "/ladders",
                process.env.NODE_ENV === "production"
                    ? "https://www.material-react-table.com"
                    : "http://localhost:8000",
            );
            url.searchParams.set("search", ladderSearchQuery);
            try {
                const response = await fetch(url.href);
                const json = (await response.json()) as LaddersApiResponse;
                setLadders(json);
            } catch (error) {
                console.error(error);
                return;
            }
        };
        fetchData();
    }, [ladderSearchQuery]);

    return (
        <Box>
            <List subheader={<li />}>
                <ListSubheader>Default Ladders</ListSubheader>
                {ladders.default.map((ladder) => (
                    <ListItemButton key={ladder.name}
                        selected={selectedLadderName === ladder.name}
                        onClick={() => onSelectedLadderNameChange(ladder.name)}>
                        <ListItemText primary={ladder.name} secondary={`(${ladder.numGames} games)`} />
                    </ListItemButton>
                ))}
            </List>
            <Divider />
            <List subheader={<li />} sx={{
                maxHeight: 250,
                overflow: "auto",
            }}>
                <ListSubheader>
                    <Box>
                        <li>Custom Ladders</li>
                        <TextField
                            id="ladder-search-bar"
                            className="text"
                            onChange={(e) => {
                                onLadderSearch(e.target.value);
                            }}
                            value={ladderSearchQuery}
                            variant="outlined"
                            placeholder="Search..."
                            size="small"
                            sx={{ width: "100%" }}
                        />
                    </Box>
                </ListSubheader>
                {ladders.custom.map((ladder) => (
                    <ListItemButton key={ladder.name}
                        selected={selectedLadderName === ladder.name}
                        onClick={() => onSelectedLadderNameChange(ladder.name)}>
                        <ListItemText primary={ladder.name} secondary={`(${ladder.numGames} games)`} />
                        <IconButton aria-label="delete">
                            <DeleteIcon />
                        </IconButton>
                    </ListItemButton>
                ))}
            </List>
        </Box>
    )
}
