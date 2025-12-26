import { v4 as uuidv4 } from 'uuid';


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