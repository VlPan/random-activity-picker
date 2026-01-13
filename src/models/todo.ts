export interface TodoItem {
  id: string;
  activityId: string;
  displayName: string;
  isCompleted: boolean;
  completedAt?: Date;
}
