import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import { useActivityContext } from '../../contexts/ActivityContext';
import type { Activity } from '../../models/activity';

interface AddActivityDialogProps {
  open: boolean;
  onClose: () => void;
  defaultPlaylistId?: string;
}

export const AddActivityDialog = ({ open, onClose, defaultPlaylistId }: AddActivityDialogProps) => {
  const { playlists, addActivity } = useActivityContext();
  const [name, setName] = useState('');
  const [priority, setPriority] = useState<number>(1);
  const [playlistId, setPlaylistId] = useState<string>('');
  const [errors, setErrors] = useState<{ name?: string }>({});

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setName('');
      setPriority(1);
      setPlaylistId(defaultPlaylistId || '');
      setErrors({});
    }
  }, [open, defaultPlaylistId]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (errors.name) {
      setErrors(prev => ({ ...prev, name: undefined }));
    }
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setPriority(isNaN(val) ? 0 : val);
  };

  const handlePlaylistChange = (e: SelectChangeEvent) => {
    setPlaylistId(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!name.trim()) {
      setErrors(prev => ({ ...prev, name: 'Name is required' }));
      return;
    }
    
    if (name.length > 254) {
       setErrors(prev => ({ ...prev, name: 'Name must be less than 254 characters' }));
       return;
    }

    if (!playlistId) {
      // Should not happen if UI works correctly as we default to something or enforce selection
      // But let's be safe
      return; 
    }

    const newActivity: Activity = {
      id: uuidv4(),
      displayName: name.trim(),
      priority: priority,
      playlistId: playlistId
    };

    addActivity(newActivity);
    onClose();
  };

  const playlistsArray = Array.from(playlists.values());
  const isValid = name.trim().length > 0 && name.length <= 254 && priority >= 1 && !!playlistId;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit}>
        <DialogTitle>Add New Activity</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              autoFocus
              label="Name"
              value={name}
              onChange={handleNameChange}
              error={!!errors.name}
              helperText={errors.name}
              fullWidth
              required
              slotProps={{ htmlInput: { maxLength: 254 } }}
            />
            
            <TextField
              label="Priority"
              type="number"
              value={priority}
              onChange={handlePriorityChange}
              fullWidth
              required
              slotProps={{ htmlInput: { min: 1 } }}
              error={priority < 1}
              helperText={priority < 1 ? "Priority must be at least 1" : undefined}
            />

            <FormControl fullWidth required>
              <InputLabel id="playlist-select-label">Playlist</InputLabel>
              <Select
                labelId="playlist-select-label"
                value={playlistId}
                label="Playlist"
                onChange={handlePlaylistChange}
              >
                {playlistsArray.map((playlist) => (
                  <MenuItem key={playlist.id} value={playlist.id}>
                    {playlist.displayName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={!isValid}>
            Add
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
