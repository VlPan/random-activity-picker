import { Box, Button } from '@mui/material';
import CasinoIcon from '@mui/icons-material/Casino';
import type { Activity } from '../../models/activity';
import type { ActivitiesPlaylist } from '../../models/playlist';

interface RandomActivityPickerProps {
  activities: Activity[];
  onActivityPicked?: (activity: Activity) => void;
  playlists?: ActivitiesPlaylist[];
  activitiesByPlaylist?: Map<string, Activity[]>;
}

export const RandomActivityPicker = ({ 
  activities, 
  onActivityPicked,
  playlists,
  activitiesByPlaylist
}: RandomActivityPickerProps) => {

  const pickFromActivities = (activityPool: Activity[]) => {
    if (activityPool.length === 0) return;

    const totalPriority = activityPool.reduce((sum, activity) => sum + activity.priority, 0);
    let randomValue = Math.random() * totalPriority;

    for (const activity of activityPool) {
      randomValue -= activity.priority;
      if (randomValue < 0) {
        onActivityPicked?.(activity);
        return;
      }
    }
    
    const lastActivity = activityPool[activityPool.length - 1];
    onActivityPicked?.(lastActivity);
  };

  const pickRandomActivity = () => {
    if (activities.length === 0) return;

    // If we have playlists and hierarchy info, use 2-step weighted random
    if (playlists && playlists.length > 0 && activitiesByPlaylist) {
      // 1. Filter playlists that have activities
      const availablePlaylists = playlists.filter(p => {
        const acts = activitiesByPlaylist.get(p.id);
        return acts && acts.length > 0;
      });

      if (availablePlaylists.length > 0) {
        // 2. Pick random playlist weighted by priority
        const totalPlaylistPriority = availablePlaylists.reduce((sum, p) => sum + (p.priority || 1), 0);
        let randomPlaylistValue = Math.random() * totalPlaylistPriority;
        let selectedPlaylist: ActivitiesPlaylist | undefined;

        for (const playlist of availablePlaylists) {
          randomPlaylistValue -= (playlist.priority || 1);
          if (randomPlaylistValue < 0) {
            selectedPlaylist = playlist;
            break;
          }
        }
        console.log('selectedPlaylist', selectedPlaylist);
        // Fallback
        if (!selectedPlaylist) {
          selectedPlaylist = availablePlaylists[availablePlaylists.length - 1];
        }

        // 3. Pick random activity from that playlist
        const playlistActivities = activitiesByPlaylist.get(selectedPlaylist.id);
        if (playlistActivities && playlistActivities.length > 0) {
          pickFromActivities(playlistActivities);
          return;
        }
      }
    }

    // Fallback to simple pool selection if no playlists info or empty
    pickFromActivities(activities);
  };

  return (
    <Box sx={{ my: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
      <Button 
        variant="contained" 
        color="secondary" 
        startIcon={<CasinoIcon />}
        onClick={pickRandomActivity}
        disabled={activities.length === 0}
      >
        Pick Random Activity
      </Button>
    </Box>
  );
};
