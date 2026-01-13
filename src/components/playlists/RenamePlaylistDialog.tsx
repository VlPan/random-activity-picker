import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';

interface RenamePlaylistDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (newName: string) => void;
  currentName: string;
}

export const RenamePlaylistDialog = ({
  open,
  onClose,
  onConfirm,
  currentName,
}: RenamePlaylistDialogProps) => {
  const [name, setName] = useState(currentName);

  useEffect(() => {
    if (open) {
      setName(currentName);
    }
  }, [open, currentName]);

  const handleConfirm = () => {
    if (name.trim()) {
      onConfirm(name.trim());
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Rename Playlist</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Playlist Name"
          type="text"
          fullWidth
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && name.trim()) {
              handleConfirm();
            }
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleConfirm} color="primary" disabled={!name.trim()}>
          Rename
        </Button>
      </DialogActions>
    </Dialog>
  );
};
