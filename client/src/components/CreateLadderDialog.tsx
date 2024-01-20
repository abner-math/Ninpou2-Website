import React from "react";
import { useState } from "react";
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

type CreateLadderProps = {
  open: boolean;
  onOpenChanged: (open: boolean) => void;
  onLadderCreated: (ladderName: string) => void;
};

export function CreateLadderDialog({
  open,
  onOpenChanged,
  onLadderCreated,
}: CreateLadderProps) {
  const [errorMessage, setErrorMessage] = useState("");

  const handleClose = () => {
    onOpenChanged(false);
    setErrorMessage("");
  };
  const handleNameChange = (name: string) => {
    if (name.length < 3 || name.length > 20 || !name.match(/^[a-zA-Z0-9]+$/)) {
      setErrorMessage(
        "Name must be at least 3 and 20 characters long and can only contain letters and digits."
      );
    } else {
      setErrorMessage("");
    }
  };
  const handleCreate = async (
    name: string,
    passphrase: string
  ): Promise<boolean> => {
    const url = new URL("/ladders", "http://localhost:8000");
    try {
      const response = await fetch(url.href, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, passphrase }),
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
          if (await handleCreate(formJson.name, formJson.passphrase)) {
            onLadderCreated(formJson.name);
            handleClose();
          }
        },
      }}
    >
      <DialogTitle>Create Private Ladder</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          required
          margin="dense"
          id="name"
          name="name"
          label="Name"
          fullWidth
          variant="standard"
          error={!!errorMessage}
          helperText={errorMessage}
          onChange={(e) => handleNameChange(e.target.value)}
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
        />
        <DialogContentText>
          Passphrase is required to add or remove games from ladder.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button type="submit" color="success">
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
