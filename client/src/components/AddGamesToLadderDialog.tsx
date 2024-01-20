import React from "react";
import { useState } from "react";
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { ILaddersApiResponse as LaddersApiResponse } from "../../../shared/types";

type AddGameToLadderDialogProps = {
  open: boolean;
  onOpenChanged: (open: boolean) => void;
  gameIds: number[];
  ladders: LaddersApiResponse;
  onGamesAddedToLadder: (ladderName: string, gameIds: number[]) => void;
};

export function AddGamesToLadderDialog({
  open,
  onOpenChanged,
  gameIds,
  ladders,
  onGamesAddedToLadder,
}: AddGameToLadderDialogProps) {
  const [errorMessage, setErrorMessage] = useState("");

  const handleClose = () => {
    onOpenChanged(false);
    setErrorMessage("");
  };
  const handleAddGameToLadder = async (
    name: string,
    passphrase: string,
    gameId: number
  ): Promise<boolean> => {
    const url = new URL(
      `/ladders/${name}/games/${gameId}`,
      "http://localhost:8000"
    );
    try {
      const response = await fetch(url.href, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passphrase }),
      });
      if (response.status !== 201) {
        const json = await response.json();
        setErrorMessage(json.errors[0].msg);
        return false;
      }
      return true;
    } catch (error) {
      console.error(error);
      setErrorMessage(error + "");
      return false;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        component: "form",
        onSubmit: async (event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          if (errorMessage) return;
          const formData = new FormData(event.currentTarget);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const formJson = Object.fromEntries((formData as any).entries());
          const results = await Promise.all(
            gameIds.map((gameId) =>
              handleAddGameToLadder(formJson.name, formJson.passphrase, gameId)
            )
          );
          if (results.every((result) => result)) {
            onGamesAddedToLadder(formJson.name, gameIds);
            handleClose();
          }
        },
      }}
    >
      <DialogTitle>Add to Ladder</DialogTitle>
      <DialogContent>
        <Autocomplete
          id="name"
          options={ladders.private.map((ladder) => ladder.name)}
          renderInput={(params) => (
            <TextField
              {...params}
              required
              name="name"
              label="Name"
              fullWidth
              variant="standard"
            />
          )}
        />
        <TextField
          required
          margin="dense"
          id="passphrase"
          name="passphrase"
          label="Passphrase"
          type="password"
          fullWidth
          variant="standard"
          error={!!errorMessage}
          helperText={errorMessage}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button type="submit" color="success">
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
}
