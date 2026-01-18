export type ProjectStatus = 'unset' | 'green' | 'yellow' | 'red';

export interface Comment {
  id: string;
  text: string;
  createdAt: string; // ISO date string
}

export interface ProjectTask {
  id: string;
  name: string;
  isCompleted: boolean;
  rewardMin: number;
  rewardMax: number;
  completedAt?: string; // ISO date string
  status?: ProjectStatus;
  comments?: Comment[];
}

export interface Project {
  id: string;
  name: string;
  startDate: string; // ISO date string (YYYY-MM-DD)
  endDate: string; // ISO date string (YYYY-MM-DD)
  tasks: ProjectTask[];
  createdAt: string; // ISO date string
  status?: ProjectStatus;
  comments?: Comment[];
  isImportant?: boolean;
}
