import React from "react";
import { useState } from "react";
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

type RemoveGamesFromLadderDialogProps = {
  ladderName: string;
  gameIds: number[];
  open: boolean;
  onOpenChanged: (open: boolean) => void;
  onGamesRemovedFromLadder: (ladderName: string, gameIds: number[]) => void;
};

export function RemoveGamesFromLadderDialog({
  ladderName,
  gameIds,
  open,
  onOpenChanged,
  onGamesRemovedFromLadder,
}: RemoveGamesFromLadderDialogProps) {
  const [errorMessage, setErrorMessage] = useState("");

  const handleClose = () => {
    onOpenChanged(false);
    setErrorMessage("");
  };
  const handleRemoveGameFromLadder = async (
    passphrase: string,
    gameId: number
  ): Promise<boolean> => {
    try {
      const url = new URL(
        `/ladders/${ladderName}/games/${gameId}`,
        "http://localhost:8000"
      );
      const response = await fetch(url.href, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passphrase }),
      });
      if (response.status !== 200) {
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
          if (errorMessage) {
            return;
          }
          const formData = new FormData(event.currentTarget);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const formJson = Object.fromEntries((formData as any).entries());
          const results = await Promise.all(
            gameIds.map((gameId) =>
              handleRemoveGameFromLadder(formJson.passphrase, gameId)
            )
          );
          if (results.every((result) => result)) {
            onGamesRemovedFromLadder(ladderName, gameIds);
            handleClose();
          }
        },
      }}
    >
      <DialogTitle>Remove from Ladder</DialogTitle>
      <DialogContent>
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
        <Button type="submit" color="warning">
          Remove
        </Button>
      </DialogActions>
    </Dialog>
  );
}
