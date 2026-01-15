export interface TodoItem {
  id: string;
  activityId: string;
  displayName: string;
  playlistName: string;
  isCompleted: boolean;
  completedAt?: Date;
}
