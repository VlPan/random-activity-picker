import { useState, useRef } from 'react';
import { Tabs, Tab, Box, Typography, List, ListItem, ListItemText } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import styles from './Randomizer.module.css';
import { useActivityContext } from '../../contexts/ActivityContext';

const ADD_PLAYLIST_TAB = -1;

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`playlist-tabpanel-${index}`}
      aria-labelledby={`playlist-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Randomizer = () => {
  const { playlists, loading, getActivitiesForPlaylist } = useActivityContext();
  // Initialize to 0 (first playlist or "Add playlist" if empty)
  const [selectedTab, setSelectedTab] = useState<number>(0);
  // Track if user has explicitly selected a tab (to distinguish from initial state)
  const hasUserInteractedRef = useRef(false);

  // Compute the actual tab index: -1 maps to "Add playlist" tab (playlists.length)
  const getTabIndex = (tab: number): number => {
    if (tab === ADD_PLAYLIST_TAB) {
      // If user hasn't interacted and playlists exist, default to first playlist
      // Otherwise, show "Add playlist" tab
      if (!hasUserInteractedRef.current && playlists.length > 0) {
        return 0;
      }
      return playlists.length;
    }
    // If there are no playlists, the only tab is "Add playlist" at index 0
    if (playlists.length === 0) {
      return 0;
    }
    // Clamp regular tabs to valid range if playlists were removed
    return Math.min(tab, playlists.length - 1);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    // Mark that user has explicitly interacted
    hasUserInteractedRef.current = true;
    // Convert the MUI tab index to our internal representation
    // If it's the last tab (Add playlist), store as -1, otherwise store as-is
    const internalValue = newValue === playlists.length ? ADD_PLAYLIST_TAB : newValue;
    setSelectedTab(internalValue);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  // Get the actual tab value for MUI Tabs component
  // Ensure it's always valid (>= 0 and <= playlists.length)
  // The "Add playlist" tab is always at index playlists.length
  const computedTabIndex = getTabIndex(selectedTab);
  const actualTabValue = Math.max(0, Math.min(computedTabIndex, playlists.length));

  return (
    <Box className={styles.randomizer} sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={actualTabValue}
          onChange={handleTabChange}
          aria-label="playlist tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          {playlists.map((playlist, index) => (
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
            id={`playlist-tab-${playlists.length}`}
            aria-controls={`playlist-tabpanel-${playlists.length}`}
          />
        </Tabs>
      </Box>

      {playlists.map((playlist, index) => {
        const playlistActivities = getActivitiesForPlaylist(playlist.id);
        return (
          <TabPanel key={playlist.id} value={actualTabValue} index={index}>
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

      <TabPanel value={actualTabValue} index={playlists.length}>
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
