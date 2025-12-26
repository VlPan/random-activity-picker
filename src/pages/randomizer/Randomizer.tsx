import { useState } from 'react';
import { Tabs, Tab, Box, Typography, List, ListItem, ListItemText } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import styles from './Randomizer.module.css';
import { useActivityContext } from '../../contexts/ActivityContext';
import {TabPanel} from '../../components/static/tab-panel';

type TabSelection = 
  | { type: 'playlist'; index: number }
  | { type: 'add-playlist' };

const Randomizer = () => {
  const { playlists, loading, getActivitiesForPlaylist } = useActivityContext();
  const [selectedTab, setSelectedTab] = useState<TabSelection>({ type: 'playlist', index: 0 });

  const playlistsArray = Array.from(playlists.values());

  const getMuiTabIndex = (selection: TabSelection): number => {
    if (selection.type === 'add-playlist') {
      return playlistsArray.length;
    }
    
    if (playlistsArray.length === 0) {
      return 0;
    }
    
    const validIndex = Math.min(selection.index, playlistsArray.length - 1);
    return validIndex;
  };

  const getTabSelectionFromMuiIndex = (muiIndex: number): TabSelection => {
    const isAddPlaylistTab = muiIndex === playlistsArray.length;
    
    if (isAddPlaylistTab) {
      return { type: 'add-playlist' };
    }
    
    return { type: 'playlist', index: muiIndex };
  };

  const handleTabChange = (_event: React.SyntheticEvent, muiTabIndex: number) => {
    const newSelection = getTabSelectionFromMuiIndex(muiTabIndex);
    setSelectedTab(newSelection);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  const activeMuiTabIndex = getMuiTabIndex(selectedTab);
  const clampedTabIndex = Math.max(0, Math.min(activeMuiTabIndex, playlistsArray.length));

  return (
    <Box className={styles.randomizer} sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={clampedTabIndex}
          onChange={handleTabChange}
          aria-label="playlist tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          {playlistsArray.map((playlist, index) => (
            <Tab
              key={playlist.id}
              label={playlist.displayName}
              id={`playlist-tab-${index}`}
              aria-controls={`playlist-tabpanel-${index}`}
            />
          ))}
          <Tab
            icon={<AddIcon />}
            aria-label="add playlist"
            id={`playlist-tab-${playlistsArray.length}`}
            aria-controls={`playlist-tabpanel-${playlistsArray.length}`}
          />
        </Tabs>
      </Box>

      {playlistsArray.map((playlist, index) => {
        const playlistActivities = getActivitiesForPlaylist(playlist.id);
        return (
          <TabPanel key={playlist.id} value={clampedTabIndex} index={index}>
            <Typography variant="h6" gutterBottom>
              {playlist.displayName}
            </Typography>
            {playlistActivities.length > 0 ? (
              <List>
                {playlistActivities.map((activity) => (
                  <ListItem key={activity.id}>
                    <ListItemText
                      primary={activity.displayName}
                      secondary={`Priority: ${activity.priority}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No activities in this playlist yet.
              </Typography>
            )}
          </TabPanel>
        );
      })}

      <TabPanel value={clampedTabIndex} index={playlistsArray.length}>
        <Typography variant="h6" gutterBottom>
          Add New Playlist
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Modal to add a new playlist will be implemented here.
        </Typography>
      </TabPanel>
    </Box>
  );
};

export default Randomizer;
