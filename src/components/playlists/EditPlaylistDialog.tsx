import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Slider,
  Box
} from '@mui/material';

interface EditPlaylistDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (newName: string, newPriority: number) => void;
  currentName: string;
  currentPriority?: number;
}

export const EditPlaylistDialog = ({
  open,
  onClose,
  onConfirm,
  currentName,
  currentPriority = 1,
}: EditPlaylistDialogProps) => {
  const [name, setName] = useState(currentName);
  const [priority, setPriority] = useState(currentPriority);

  useEffect(() => {
    if (open) {
      setName(currentName);
      setPriority(currentPriority || 1);
    }
  }, [open, currentName, currentPriority]);

  const handleConfirm = () => {
    if (name.trim()) {
      onConfirm(name.trim(), priority);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Playlist</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
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
          <Box sx={{ px: 2 }}>
            <Typography id="edit-playlist-priority" gutterBottom>
              Priority: {priority}
            </Typography>
            <Slider
              value={priority}
              onChange={(_, value) => setPriority(value as number)}
              step={1}
              marks
              min={1}
              max={10}
              valueLabelDisplay="auto"
              aria-labelledby="edit-playlist-priority"
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleConfirm} color="primary" disabled={!name.trim()}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
