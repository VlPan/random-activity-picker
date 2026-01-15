import { useState } from 'react';
import { Typography, TextField, Button, Stack, Slider, Box } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import { useActivityContext } from '../../contexts/ActivityContext';

interface AddPlaylistPanelProps {
  onPlaylistAdded: () => void;
}

export const AddPlaylistPanel = ({ onPlaylistAdded }: AddPlaylistPanelProps) => {
  const { addPlaylist } = useActivityContext();
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [priority, setPriority] = useState<number>(1);

  const handleAddPlaylist = () => {
    if (!newPlaylistName.trim()) return;

    const newPlaylist = {
      id: uuidv4(),
      displayName: newPlaylistName.trim(),
      priority: priority,
    };

    addPlaylist(newPlaylist);
    setNewPlaylistName('');
    setPriority(1);
    onPlaylistAdded();
  };

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Add New Playlist
      </Typography>
      <Stack spacing={3} sx={{ mt: 2, maxWidth: 600 }}>
        <Stack direction="row" spacing={2}>
          <TextField
            label="Playlist Name"
            variant="outlined"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            fullWidth
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddPlaylist();
              }
            }}
          />
          <Button 
            variant="contained" 
            onClick={handleAddPlaylist}
            disabled={!newPlaylistName.trim()}
          >
            Add Playlist
          </Button>
        </Stack>
        
        <Box sx={{ px: 1 }}>
          <Typography id="playlist-priority-slider" gutterBottom>
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
            aria-labelledby="playlist-priority-slider"
          />
        </Box>
      </Stack>
    </>
  );
};
