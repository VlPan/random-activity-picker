import { useState } from 'react';
import { Typography, TextField, Button, Stack } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import { useActivityContext } from '../../contexts/ActivityContext';

interface AddPlaylistPanelProps {
  onPlaylistAdded: () => void;
}

export const AddPlaylistPanel = ({ onPlaylistAdded }: AddPlaylistPanelProps) => {
  const { addPlaylist } = useActivityContext();
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const handleAddPlaylist = () => {
    if (!newPlaylistName.trim()) return;

    const newPlaylist = {
      id: uuidv4(),
      displayName: newPlaylistName.trim(),
    };

    addPlaylist(newPlaylist);
    setNewPlaylistName('');
    onPlaylistAdded();
  };

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Add New Playlist
      </Typography>
      <Stack direction="row" spacing={2} sx={{ mt: 2, maxWidth: 600 }}>
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
    </>
  );
};
