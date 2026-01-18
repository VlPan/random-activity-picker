import { useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { useTodoContext } from '../../contexts/TodoContext';
import { FloatingPanel } from '../common/FloatingPanel';
import { ConfirmationDialog } from '../common/ConfirmationDialog';
import { TodoList } from './TodoList';
import { TaskRewardDialog } from './TaskRewardDialog';

export const SessionTodosPanel = () => {
  const { 
    todoItems, 
    removeTodo, 
    toggleComplete, 
    clearTodos, 
    resetTodoTime, 
    activeTaskId, 
    isPaused,
    pauseTimer, 
    resumeTimer, 
    completeTask 
  } = useTodoContext();
  
  const [isRewardDialogOpen, setIsRewardDialogOpen] = useState(false);
  const [completedTaskId, setCompletedTaskId] = useState<string | null>(null);
  const [confirmClearDialogOpen, setConfirmClearDialogOpen] = useState(false);

  // Sort todos so active todo is always first
  const sortedTodos = [...todoItems].sort((a, b) => {
    if (a.id === activeTaskId) return -1;
    if (b.id === activeTaskId) return 1;
    return 0;
  });

  // Determine header color based on active todo status
  const headerColor = activeTaskId 
    ? (isPaused ? 'warning.main' : 'success.main')
    : 'primary.main';

  const handleToggleTodo = (id: string) => {
    const item = todoItems.find(i => i.id === id);
    if (item && !item.isCompleted) {
      if (activeTaskId === id) {
        pauseTimer();
      }
      setCompletedTaskId(id);
      setIsRewardDialogOpen(true);
    } else {
      toggleComplete(id);
    }
  };

  const handleDeleteTodo = (id: string) => {
    removeTodo(id);
  };

  const handleClearTodos = () => {
    setConfirmClearDialogOpen(true);
  };

  const handleConfirmClear = () => {
    clearTodos();
    setConfirmClearDialogOpen(false);
  };

  if (todoItems.length === 0) {
    return null;
  }

  return (
    <>
      <FloatingPanel 
        title="Session Todos" 
        width={400}
        headerColor={headerColor}
        action={
          <Tooltip title="Clear all todos">
            <IconButton size="small" onClick={handleClearTodos} color="inherit">
              <DeleteSweepIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        }
      >
        <TodoList
          items={sortedTodos}
          onToggleComplete={handleToggleTodo}
          onDelete={handleDeleteTodo}
        />
      </FloatingPanel>

      <ConfirmationDialog
        open={confirmClearDialogOpen}
        title="Clear Session Todos"
        content="Are you sure you want to clear all session todos? This action cannot be undone."
        onClose={() => setConfirmClearDialogOpen(false)}
        onConfirm={handleConfirmClear}
        confirmLabel="Clear All"
        confirmColor="error"
      />
      
      <TaskRewardDialog
        open={isRewardDialogOpen}
        onClose={() => {
          setIsRewardDialogOpen(false);
          setCompletedTaskId(null);
        }}
        onTakeRewards={() => {
          if (completedTaskId) {
            completeTask(completedTaskId);
            resetTodoTime(completedTaskId);
          }
          setIsRewardDialogOpen(false);
          setCompletedTaskId(null);
        }}
        onContinueTask={() => {
          resumeTimer();
          setIsRewardDialogOpen(false);
          setCompletedTaskId(null);
        }}
        timeSpent={todoItems.find(i => i.id === completedTaskId)?.timeSpent}
        taskName={todoItems.find(i => i.id === completedTaskId)?.displayName}
      />
    </>
  );
};
