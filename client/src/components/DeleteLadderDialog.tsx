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

type DeleteLadderDialogProps = {
  ladderName: string;
  open: boolean;
  onOpenChanged: (open: boolean) => void;
  onLadderDeleted: () => void;
};

export function DeleteLadderDialog({
  ladderName,
  open,
  onOpenChanged,
  onLadderDeleted,
}: DeleteLadderDialogProps) {
  const [errorMessage, setErrorMessage] = useState("");

  const handleClose = () => {
    onOpenChanged(false);
    setErrorMessage("");
  };
  const handleDelete = async (passphrase: string): Promise<boolean> => {
    try {
      const url = new URL(
        `/ladders/${ladderName}`,
        process.env.NODE_ENV === "production"
          ? "https://ninpou2-9cc068a4d220.herokuapp.com"
          : `http://localhost:${process.env.PORT || 8000}`
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
          if (await handleDelete(formJson.passphrase)) {
            onLadderDeleted();
            handleClose();
          }
        },
      }}
    >
      <DialogTitle>Delete Ladder</DialogTitle>
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
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
