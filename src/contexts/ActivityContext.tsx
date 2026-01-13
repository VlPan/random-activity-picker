import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { ActivitiesPlaylist } from '../models/playlist';
import type { Activity } from '../models/activity';
import {
  fetchActivitiesPLaylistsFromStorage,
  fetchActivitiesFromStorage,
  saveActivitiesToStorage,
  savePlaylistsToStorage,
  addPlaylistToStorage,
  updatePlaylistInStorage,
  deletePlaylistFromStorage,
  addActivityToStorage,
  updateActivityInStorage,
  deleteActivityFromStorage,
} from '../services/activityService';

interface ActivityContextType {
  playlists: Map<string, ActivitiesPlaylist>;
  activities: Map<string, Activity>;
  loading: boolean;
  error: string | null;
  loadData: () => Promise<void>;
  addPlaylist: (playlist: ActivitiesPlaylist) => void;
  updatePlaylist: (playlist: ActivitiesPlaylist) => void;
  deletePlaylist: (playlistId: string) => void;
  addActivity: (activity: Activity) => void;
  updateActivity: (activity: Activity) => void;
  deleteActivity: (activityId: string) => void;
  getActivitiesForPlaylist: (playlistId: string) => Activity[];
  reorderPlaylists: (newOrder: string[]) => void;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export const ActivityProvider = ({ children }: { children: ReactNode }) => {
  const [playlists, setPlaylists] = useState<Map<string, ActivitiesPlaylist>>(new Map());
  const [activities, setActivities] = useState<Map<string, Activity>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [playlistsData, activitiesData] = await Promise.all([
        fetchActivitiesPLaylistsFromStorage(),
        fetchActivitiesFromStorage(),
      ]) as [Map<string, ActivitiesPlaylist>, Map<string, Activity>];
      setPlaylists(playlistsData);
      setActivities(activitiesData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMessage);
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addPlaylist = (playlist: ActivitiesPlaylist) => {
    try {
      const updated: Map<string, ActivitiesPlaylist> = addPlaylistToStorage(playlist);
      setPlaylists(updated);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add playlist';
      setError(errorMessage);
      console.error('Error adding playlist:', err);
    }
  };

  const updatePlaylist = (playlist: ActivitiesPlaylist) => {
    try {
      const updated: Map<string, ActivitiesPlaylist> = updatePlaylistInStorage(playlist);
      setPlaylists(updated);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update playlist';
      setError(errorMessage);
      console.error('Error updating playlist:', err);
    }
  };

  const deletePlaylist = (playlistId: string) => {
    try {
      const updatedPlaylists: Map<string, ActivitiesPlaylist> = deletePlaylistFromStorage(playlistId);
      setPlaylists(updatedPlaylists);
      // Also delete all activities associated with this playlist
      const updatedActivities = new Map(activities);
      for (const [activityId, activity] of activities.entries()) {
        if (activity.playlistId === playlistId) {
          updatedActivities.delete(activityId);
        }
      }
      saveActivitiesToStorage(updatedActivities);
      setActivities(updatedActivities);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete playlist';
      setError(errorMessage);
      console.error('Error deleting playlist:', err);
    }
  };

  const addActivity = (activity: Activity) => {
    try {
      const updated: Map<string, Activity> = addActivityToStorage(activity);
      setActivities(updated);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add activity';
      setError(errorMessage);
      console.error('Error adding activity:', err);
    }
  };

  const updateActivity = (activity: Activity) => {
    try {
      const updated: Map<string, Activity> = updateActivityInStorage(activity);
      setActivities(updated);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update activity';
      setError(errorMessage);
      console.error('Error updating activity:', err);
    }
  };

  const deleteActivity = (activityId: string) => {
    try {
      const updated: Map<string, Activity> = deleteActivityFromStorage(activityId);
      setActivities(updated);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete activity';
      setError(errorMessage);
      console.error('Error deleting activity:', err);
    }
  };

  const getActivitiesForPlaylist = (playlistId: string): Activity[] => {
    return Array.from(activities.values()).filter(activity => activity.playlistId === playlistId);
  };

  const reorderPlaylists = (newOrder: string[]) => {
    try {
      const newPlaylistsMap = new Map<string, ActivitiesPlaylist>();
      
      // Reconstruct map in the new order
      newOrder.forEach(id => {
        const playlist = playlists.get(id);
        if (playlist) {
          newPlaylistsMap.set(id, playlist);
        }
      });
      
      // Add any missing playlists (just in case)
      playlists.forEach((playlist, id) => {
        if (!newPlaylistsMap.has(id)) {
          newPlaylistsMap.set(id, playlist);
        }
      });
      
      setPlaylists(newPlaylistsMap);
      savePlaylistsToStorage(newPlaylistsMap);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reorder playlists';
      setError(errorMessage);
      console.error('Error reordering playlists:', err);
    }
  };

  const value: ActivityContextType = {
    playlists,
    activities,
    loading,
    error,
    loadData,
    addPlaylist,
    updatePlaylist,
    deletePlaylist,
    addActivity,
    updateActivity,
    deleteActivity,
    getActivitiesForPlaylist,
    reorderPlaylists,
  };

  return (
    <ActivityContext.Provider value={value}>
      {children}
    </ActivityContext.Provider>
  );
};

export const useActivityContext = () => {
  const context = useContext(ActivityContext);
  if (context === undefined) {
    throw new Error('useActivityContext must be used within an ActivityProvider');
  }
  return context;
};

