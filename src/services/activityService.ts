// import { v4 as uuidv4 } from 'uuid';
import type {ActivitiesPlaylist} from '../models/playlist';
import type {Activity} from '../models/activity';

const ACTIVITIES_KEY = 'randomizer_activities';
const ACTIVITIES_PLAYLIST_KEY = 'randomizer_activities-playlist';

const mockPlaylist: ActivitiesPlaylist = {
  id: "pl-9921",
  displayName: "Morning Wellness Routine"
};

const mockActivities: Activity[] = [
  {
    id: "act-001",
    displayName: "Guided Meditation",
    playlistId: "pl-9921",
    priority: 1
  },
  {
    id: "act-002",
    displayName: "Sun Salutation Yoga",
    playlistId: "pl-9921",
    priority: 2
  },
  {
    id: "act-003",
    displayName: "Gratitude Journaling",
    playlistId: "pl-9921",
    priority: 3
  }
];

// Helper functions to convert between arrays and Maps
const arrayToPlaylistMap = (playlists: ActivitiesPlaylist[]): Map<string, ActivitiesPlaylist> => {
  return new Map(playlists.map(p => [p.id, p]));
};

const playlistMapToArray = (map: Map<string, ActivitiesPlaylist>): ActivitiesPlaylist[] => {
  return Array.from(map.values());
};

const arrayToActivityMap = (activities: Activity[]): Map<string, Activity> => {
  return new Map(activities.map(a => [a.id, a]));
};

const activityMapToArray = (map: Map<string, Activity>): Activity[] => {
  return Array.from(map.values());
};

export const fetchActivitiesFromStorage = (): Promise<Map<string, Activity>> => {
  return new Promise((resolve) => {
    const delay = Math.floor(Math.random() * (2000 - 500 + 1)) + 500;

    setTimeout(() => {
      const saved = localStorage.getItem(ACTIVITIES_KEY);
      const data = saved ? JSON.parse(saved) : mockActivities;
      
      if (!saved) localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(data));
      
      resolve(arrayToActivityMap(data));
    }, delay);
  });
};

export const fetchActivitiesPLaylistsFromStorage = (): Promise<Map<string, ActivitiesPlaylist>> => {
  return new Promise((resolve) => {
    const delay = Math.floor(Math.random() * (2000 - 500 + 1)) + 500;

    setTimeout(() => {
      const saved = localStorage.getItem(ACTIVITIES_PLAYLIST_KEY);
      const data = saved ? JSON.parse(saved) : [mockPlaylist];
      
      if (!saved) localStorage.setItem(ACTIVITIES_PLAYLIST_KEY, JSON.stringify(data));
      
      resolve(arrayToPlaylistMap(data));
    }, delay);
  });
};

// CRUD operations for playlists
export const savePlaylistsToStorage = (playlistsMap: Map<string, ActivitiesPlaylist>): void => {
  const playlists = playlistMapToArray(playlistsMap);
  localStorage.setItem(ACTIVITIES_PLAYLIST_KEY, JSON.stringify(playlists));
};

export const addPlaylistToStorage = (playlist: ActivitiesPlaylist): Map<string, ActivitiesPlaylist> => {
  const saved = localStorage.getItem(ACTIVITIES_PLAYLIST_KEY);
  const playlistsArray = saved ? JSON.parse(saved) : [];
  const playlistsMap = arrayToPlaylistMap(playlistsArray);
  
  playlistsMap.set(playlist.id, playlist);
  
  const updated = playlistMapToArray(playlistsMap);
  localStorage.setItem(ACTIVITIES_PLAYLIST_KEY, JSON.stringify(updated));
  return playlistsMap;
};

export const updatePlaylistInStorage = (playlist: ActivitiesPlaylist): Map<string, ActivitiesPlaylist> => {
  const saved = localStorage.getItem(ACTIVITIES_PLAYLIST_KEY);
  const playlistsArray = saved ? JSON.parse(saved) : [];
  const playlistsMap = arrayToPlaylistMap(playlistsArray);
  
  if (playlistsMap.has(playlist.id)) {
    playlistsMap.set(playlist.id, playlist);
  }
  
  const updated = playlistMapToArray(playlistsMap);
  localStorage.setItem(ACTIVITIES_PLAYLIST_KEY, JSON.stringify(updated));
  return playlistsMap;
};

export const deletePlaylistFromStorage = (playlistId: string): Map<string, ActivitiesPlaylist> => {
  const saved = localStorage.getItem(ACTIVITIES_PLAYLIST_KEY);
  const playlistsArray = saved ? JSON.parse(saved) : [];
  const playlistsMap = arrayToPlaylistMap(playlistsArray);
  
  playlistsMap.delete(playlistId);
  
  const updated = playlistMapToArray(playlistsMap);
  localStorage.setItem(ACTIVITIES_PLAYLIST_KEY, JSON.stringify(updated));
  return playlistsMap;
};

// CRUD operations for activities
export const saveActivitiesToStorage = (activitiesMap: Map<string, Activity>): void => {
  const activities = activityMapToArray(activitiesMap);
  localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities));
};

export const addActivityToStorage = (activity: Activity): Map<string, Activity> => {
  const saved = localStorage.getItem(ACTIVITIES_KEY);
  const activitiesArray = saved ? JSON.parse(saved) : [];
  const activitiesMap = arrayToActivityMap(activitiesArray);
  
  activitiesMap.set(activity.id, activity);
  
  const updated = activityMapToArray(activitiesMap);
  localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(updated));
  return activitiesMap;
};

export const updateActivityInStorage = (activity: Activity): Map<string, Activity> => {
  const saved = localStorage.getItem(ACTIVITIES_KEY);
  const activitiesArray = saved ? JSON.parse(saved) : [];
  const activitiesMap = arrayToActivityMap(activitiesArray);
  
  if (activitiesMap.has(activity.id)) {
    activitiesMap.set(activity.id, activity);
  }
  
  const updated = activityMapToArray(activitiesMap);
  localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(updated));
  return activitiesMap;
};

export const deleteActivityFromStorage = (activityId: string): Map<string, Activity> => {
  const saved = localStorage.getItem(ACTIVITIES_KEY);
  const activitiesArray = saved ? JSON.parse(saved) : [];
  const activitiesMap = arrayToActivityMap(activitiesArray);
  
  activitiesMap.delete(activityId);
  
  const updated = activityMapToArray(activitiesMap);
  localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(updated));
  return activitiesMap;
};