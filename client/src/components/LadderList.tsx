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
import { ILaddersApiResponse as LaddersApiResponse } from "../../../shared/types";

type LadderListProps = {
  ladders: LaddersApiResponse;
  onLaddersChange: (ladders: LaddersApiResponse) => void;
  selectedLadderName: string;
  onSelectedLadderNameChange: (ladderName: string) => void;
  ladderSearchQuery: string;
  onLadderSearch: (ladderSearchQuery: string) => void;
};

export function LadderList({
  ladders,
  onLaddersChange,
  selectedLadderName,
  onSelectedLadderNameChange,
  ladderSearchQuery,
  onLadderSearch,
}: LadderListProps) {
  const [openCreate, setOpenCreate] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [deletedLadderName, setDeletedLadderName] = useState("");

  // update ladder list
  useEffect(() => {
    const fetchData = async () => {
      const url = new URL("/ladders", "http://localhost:8000");
      url.searchParams.set("search", ladderSearchQuery);
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
  }, [ladderSearchQuery, selectedLadderName]);

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
        onLadderCreated={onLadderSearch}
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
              selected={selectedLadderName === ladder.name}
              onClick={() => onSelectedLadderNameChange(ladder.name)}
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
          {ladders.private.map((ladder) => (
            <ListItemButton
              key={ladder.name}
              selected={selectedLadderName === ladder.name}
              onClick={() => onSelectedLadderNameChange(ladder.name)}
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
