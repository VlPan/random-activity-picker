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



export const fetchActivitiesFromStorage = () => {
  return new Promise((resolve) => {
    const delay = Math.floor(Math.random() * (2000 - 500 + 1)) + 500;

    setTimeout(() => {
      const saved = localStorage.getItem(ACTIVITIES_KEY);
      const data = saved ? JSON.parse(saved) : mockActivities;
      
      if (!saved) localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(data));
      
      resolve(data);
    }, delay);
  });
};

export const fetchActivitiesPLaylistsFromStorage = () => {
  return new Promise((resolve) => {
    const delay = Math.floor(Math.random() * (2000 - 500 + 1)) + 500;

    setTimeout(() => {
      const saved = localStorage.getItem(ACTIVITIES_PLAYLIST_KEY);
      const data = saved ? JSON.parse(saved) : [mockPlaylist];
      
      if (!saved) localStorage.setItem(ACTIVITIES_PLAYLIST_KEY, JSON.stringify(data));
      
      resolve(data);
    }, delay);
  });
};

// CRUD operations for playlists
export const savePlaylistsToStorage = (playlists: ActivitiesPlaylist[]): void => {
  localStorage.setItem(ACTIVITIES_PLAYLIST_KEY, JSON.stringify(playlists));
};

export const addPlaylistToStorage = (playlist: ActivitiesPlaylist): ActivitiesPlaylist[] => {
  const saved = localStorage.getItem(ACTIVITIES_PLAYLIST_KEY);
  const playlists = saved ? JSON.parse(saved) : [];
  const updated = [...playlists, playlist];
  localStorage.setItem(ACTIVITIES_PLAYLIST_KEY, JSON.stringify(updated));
  return updated;
};

export const updatePlaylistInStorage = (playlist: ActivitiesPlaylist): ActivitiesPlaylist[] => {
  const saved = localStorage.getItem(ACTIVITIES_PLAYLIST_KEY);
  const playlists = saved ? JSON.parse(saved) : [];
  const updated = playlists.map((p: ActivitiesPlaylist) => 
    p.id === playlist.id ? playlist : p
  );
  localStorage.setItem(ACTIVITIES_PLAYLIST_KEY, JSON.stringify(updated));
  return updated;
};

export const deletePlaylistFromStorage = (playlistId: string): ActivitiesPlaylist[] => {
  const saved = localStorage.getItem(ACTIVITIES_PLAYLIST_KEY);
  const playlists = saved ? JSON.parse(saved) : [];
  const updated = playlists.filter((p: ActivitiesPlaylist) => p.id !== playlistId);
  localStorage.setItem(ACTIVITIES_PLAYLIST_KEY, JSON.stringify(updated));
  return updated;
};

// CRUD operations for activities
export const saveActivitiesToStorage = (activities: Activity[]): void => {
  localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities));
};

export const addActivityToStorage = (activity: Activity): Activity[] => {
  const saved = localStorage.getItem(ACTIVITIES_KEY);
  const activities = saved ? JSON.parse(saved) : [];
  const updated = [...activities, activity];
  localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(updated));
  return updated;
};

export const updateActivityInStorage = (activity: Activity): Activity[] => {
  const saved = localStorage.getItem(ACTIVITIES_KEY);
  const activities = saved ? JSON.parse(saved) : [];
  const updated = activities.map((a: Activity) => 
    a.id === activity.id ? activity : a
  );
  localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(updated));
  return updated;
};

export const deleteActivityFromStorage = (activityId: string): Activity[] => {
  const saved = localStorage.getItem(ACTIVITIES_KEY);
  const activities = saved ? JSON.parse(saved) : [];
  const updated = activities.filter((a: Activity) => a.id !== activityId);
  localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(updated));
  return updated;
};