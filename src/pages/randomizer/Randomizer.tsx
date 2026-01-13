import { useMemo, useState } from 'react';
import { Tabs, Tab, Box, Typography, Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import styles from './Randomizer.module.css';
import { useActivityContext } from '../../contexts/ActivityContext';
import { TabPanel } from '../../components/static/tab-panel';
import type { Activity } from '../../models/activity';
import { AddActivityDialog } from '../../components/activities/AddActivityDialog';
import { AddPlaylistPanel } from '../../components/playlists/AddPlaylistPanel';
import { ActivitiesTable } from '../../components/activities/ActivitiesTable';

type TabSelection = 
  | { type: 'playlist'; index: number }
  | { type: 'add-playlist' };

const Randomizer = () => {
  const { playlists, loading, activities } = useActivityContext();
  const [selectedTab, setSelectedTab] = useState<TabSelection>({ type: 'playlist', index: 0 });
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);

  const playlistsArray = Array.from(playlists.values());

  // Pre-compute activities per playlist once, only recalculate when activities change
  const activitiesByPlaylistId = useMemo(() => {
    const map = new Map<string, Activity[]>();
    for (const activity of activities.values()) {
      const existing = map.get(activity.playlistId);
      if (existing) {
        existing.push(activity);
      } else {
        map.set(activity.playlistId, [activity]);
      }
    }
    return map;
  }, [activities]);

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

  const handlePlaylistAdded = () => {
    // Switch to the new playlist (which will be at the end)
    // The current length is the index of the new item because indices are 0-based
    setSelectedTab({ type: 'playlist', index: playlistsArray.length });
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
  
  // Calculate current playlist ID for the dialog default
  const currentPlaylistId = selectedTab.type === 'playlist' && playlistsArray.length > 0
    ? playlistsArray[Math.min(selectedTab.index, playlistsArray.length - 1)]?.id
    : undefined;

  return (
    <Box className={styles.randomizer} sx={{ width: '100%', position: 'relative', minHeight: '100vh' }}>
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
        const playlistActivities = activitiesByPlaylistId.get(playlist.id) || [];
        return (
          <TabPanel key={playlist.id} value={clampedTabIndex} index={index}>
            <Typography variant="h6" gutterBottom>
              {playlist.displayName}
            </Typography>
            {playlistActivities.length > 0 ? (
              <ActivitiesTable activities={playlistActivities} />
            ) : (
              <Typography variant="body2" color="text.secondary">
                No activities in this playlist yet.
              </Typography>
            )}
          </TabPanel>
        );
      })}

      <TabPanel value={clampedTabIndex} index={playlistsArray.length}>
        <AddPlaylistPanel onPlaylistAdded={handlePlaylistAdded} />
      </TabPanel>

      {selectedTab.type === 'playlist' && playlistsArray.length > 0 && (
        <Fab
          color="primary"
          aria-label="add activity"
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
          }}
          onClick={() => setIsAddActivityOpen(true)}
        >
          <AddIcon />
        </Fab>
      )}

      <AddActivityDialog
        open={isAddActivityOpen}
        onClose={() => setIsAddActivityOpen(false)}
        defaultPlaylistId={currentPlaylistId}
      />
    </Box>
  );
};

export default Randomizer;
