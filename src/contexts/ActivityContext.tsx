import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { ActivitiesPlaylist } from '../models/playlist';
import type { Activity } from '../models/activity';
import {
  fetchActivitiesPLaylistsFromStorage,
  fetchActivitiesFromStorage,
  saveActivitiesToStorage,
  addPlaylistToStorage,
  updatePlaylistInStorage,
  deletePlaylistFromStorage,
  addActivityToStorage,
  updateActivityInStorage,
  deleteActivityFromStorage,
} from '../services/activityService';

interface ActivityContextType {
  playlists: ActivitiesPlaylist[];
  activities: Activity[];
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
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export const ActivityProvider = ({ children }: { children: ReactNode }) => {
  const [playlists, setPlaylists] = useState<ActivitiesPlaylist[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [playlistsData, activitiesData] = await Promise.all([
        fetchActivitiesPLaylistsFromStorage() as Promise<ActivitiesPlaylist[]>,
        fetchActivitiesFromStorage() as Promise<Activity[]>,
      ]);
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
      const updated = addPlaylistToStorage(playlist);
      setPlaylists(updated);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add playlist';
      setError(errorMessage);
      console.error('Error adding playlist:', err);
    }
  };

  const updatePlaylist = (playlist: ActivitiesPlaylist) => {
    try {
      const updated = updatePlaylistInStorage(playlist);
      setPlaylists(updated);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update playlist';
      setError(errorMessage);
      console.error('Error updating playlist:', err);
    }
  };

  const deletePlaylist = (playlistId: string) => {
    try {
      const updatedPlaylists = deletePlaylistFromStorage(playlistId);
      setPlaylists(updatedPlaylists);
      // Also delete all activities associated with this playlist
      const updatedActivities = activities.filter(a => a.playlistId !== playlistId);
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
      const updated = addActivityToStorage(activity);
      setActivities(updated);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add activity';
      setError(errorMessage);
      console.error('Error adding activity:', err);
    }
  };

  const updateActivity = (activity: Activity) => {
    try {
      const updated = updateActivityInStorage(activity);
      setActivities(updated);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update activity';
      setError(errorMessage);
      console.error('Error updating activity:', err);
    }
  };

  const deleteActivity = (activityId: string) => {
    try {
      const updated = deleteActivityFromStorage(activityId);
      setActivities(updated);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete activity';
      setError(errorMessage);
      console.error('Error deleting activity:', err);
    }
  };

  const getActivitiesForPlaylist = (playlistId: string): Activity[] => {
    return activities.filter(activity => activity.playlistId === playlistId);
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

