import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Avatar,
    styled,
} from "@mui/material";
import { tableCellClasses } from "@mui/material/TableCell";
import type { IGame as Game } from "../shared/types";

export function GameRow({ game }: { game: Game }) {
    const StyledTableCell = styled(TableCell)(({ theme }) => ({
        [`&.${tableCellClasses.head}`]: {
            backgroundColor: theme.palette.common.black,
            color: theme.palette.common.white,
        },
        "&.KONOHAGAKURE": {
            backgroundColor: "#244519",
            color: theme.palette.common.white,
        },
        "&.OTOGAKURE": {
            backgroundColor: "#2d126e",
            color: theme.palette.common.white,
        },
        "&.AKATSUKI": {
            backgroundColor: "#8a0b0b",
            color: theme.palette.common.white,
        },
        [`&.${tableCellClasses.body}`]: {
            fontSize: 14,
        },
    }));
    return (
        <Box key={game.id} sx={{
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
                        <TableBody key={team}>
                            <TableRow>
                                <StyledTableCell className={team} align="center" colSpan={10}>{team}</StyledTableCell>
                            </TableRow>
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
                                                    key={item.name}
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
                    ))}
                </Table>
            </TableContainer>
        </Box>
    )
}
