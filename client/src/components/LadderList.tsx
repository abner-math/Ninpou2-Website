import React from "react";
import { useState, useEffect, Fragment } from "react";
import {
  Box,
  Button,
  IconButton,
  TextField,
  List,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Divider,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import { CreateLadderDialog } from "./CreateLadderDialog";
import { DeleteLadderDialog } from "./DeleteLadderDialog";
import { useQueryState } from "../hooks/useQueryState";
import { ILaddersApiResponse as LaddersApiResponse } from "../../../shared/types";

type LadderListProps = {
  ladders: LaddersApiResponse;
  onLaddersChange: (ladders: LaddersApiResponse) => void;
  selectedLadder: string;
  onSelectedLadderChange: (ladder: string) => void;
};

export function LadderList({
  ladders,
  onLaddersChange,
  selectedLadder,
  onSelectedLadderChange,
}: LadderListProps) {
  // state variables
  const [openCreate, setOpenCreate] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [deletedLadderName, setDeletedLadderName] = useState("");
  const [search, setSearch] = useQueryState("ladderSearch", "");

  // update ladder list
  useEffect(() => {
    const fetchData = async () => {
      const url = new URL(
        "/ladders",
        `http://localhost:${process.env.PORT || 8000}`
      );
      url.searchParams.set("search", search);
      try {
        const response = await fetch(url.href);
        const json = (await response.json()) as LaddersApiResponse;
        onLaddersChange(json);
      } catch (error) {
        console.error(error);
        return;
      }
    };
    fetchData();
  }, [search]);

  // handle functions
  const handleClickOpenCreate = () => {
    setOpenCreate(true);
  };
  const handleClickOpenDelete = (name: string) => {
    setDeletedLadderName(name);
    setOpenDelete(true);
  };

  return (
    <Fragment>
      <CreateLadderDialog
        open={openCreate}
        onOpenChanged={setOpenCreate}
        onLadderCreated={setSearch}
      />
      <DeleteLadderDialog
        ladderName={deletedLadderName}
        open={openDelete}
        onOpenChanged={setOpenDelete}
        onLadderDeleted={() => {
          onLaddersChange({
            ...ladders,
            private: ladders.private.filter(
              (ladder) => ladder.name !== deletedLadderName
            ),
          });
        }}
      />
      <Box>
        <Button
          variant="contained"
          color="success"
          onClick={handleClickOpenCreate}
          fullWidth
        >
          Create Private Ladder
        </Button>
        <List subheader={<li />}>
          <ListSubheader>Public Ladders</ListSubheader>
          {ladders.public.map((ladder) => (
            <ListItemButton
              key={ladder.name}
              selected={selectedLadder === ladder.name}
              onClick={() => onSelectedLadderChange(ladder.name)}
            >
              <ListItemText
                primary={ladder.name}
                secondary={`(${ladder.numGames} games)`}
              />
            </ListItemButton>
          ))}
        </List>
        <Divider />
        <List
          subheader={<li />}
          sx={{
            maxHeight: 250,
            overflow: "auto",
          }}
        >
          <ListSubheader>
            <Box>
              Private Ladders
              <TextField
                id="ladder-search-bar"
                className="text"
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
                value={search}
                variant="outlined"
                placeholder="Search..."
                size="small"
                sx={{ width: "100%" }}
              />
            </Box>
          </ListSubheader>
          {ladders.private.map((ladder) => (
            <ListItemButton
              key={ladder.name}
              selected={selectedLadder === ladder.name}
              onClick={() => onSelectedLadderChange(ladder.name)}
            >
              <ListItemText
                primary={ladder.name}
                secondary={`(${ladder.numGames} games)`}
              />
              <IconButton
                aria-label="delete"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClickOpenDelete(ladder.name);
                }}
              >
                <Delete />
              </IconButton>
            </ListItemButton>
          ))}
        </List>
      </Box>
    </Fragment>
  );
}
