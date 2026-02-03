import { useState, useMemo } from 'react';
import { Box, Typography, Button, Paper, TextField, Stack, Divider } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AddIcon from '@mui/icons-material/Add';
import { useTodoContext } from '../../contexts/TodoContext';
import { TodoList } from '../../components/todo/TodoList';
import { TaskRewardDialog } from '../../components/todo/TaskRewardDialog';
import type { TodoItem } from '../../models/todo';

const Flow = () => {
  const { todoItems, addTodo, startTimer, removeTodo, toggleComplete, pauseTimer, completeTask, resetTodoTime, resumeTimer, activeTaskId } = useTodoContext();
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [isRewardDialogOpen, setIsRewardDialogOpen] = useState(false);
  const [completedTaskId, setCompletedTaskId] = useState<string | null>(null);

  // Filter to show only flow sessions
  const flowSessions = useMemo(() => {
    return todoItems.filter(item => item.isFlowSession === true);
  }, [todoItems]);

  // Get next flow session number for naming
  const getNextFlowSessionName = () => {
    const flowCount = flowSessions.length;
    return `Flow Session #${flowCount + 1}`;
  };

  const handleStartFlowSession = () => {
    const newItem: TodoItem = {
      id: crypto.randomUUID(),
      displayName: getNextFlowSessionName(),
      playlistName: 'Flow',
      isCompleted: false,
      timeSpent: 0,
      isFlowSession: true
    };
    addTodo(newItem);
    startTimer(newItem.id);
  };

  const handleManualAdd = () => {
    const totalSeconds = (hours * 3600) + (minutes * 60);
    
    if (totalSeconds <= 0) {
      return; // Don't add if no time specified
    }

    const newItem: TodoItem = {
      id: crypto.randomUUID(),
      displayName: getNextFlowSessionName(),
      playlistName: 'Flow',
      isCompleted: false,
      timeSpent: totalSeconds,
      isFlowSession: true
    };
    addTodo(newItem);
    
    // Reset form
    setHours(0);
    setMinutes(0);
  };

  const handleDeleteFlowSession = (id: string) => {
    removeTodo(id);
  };

  const handleToggleFlowSession = (id: string) => {
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

  return (
    <Box sx={{ width: '100%', maxWidth: '800px', mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Flow Timer
      </Typography>

      <Paper sx={{ p: 4, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Start Flow Session
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Start a new flow session to track your focus time. The timer will begin immediately.
        </Typography>
        <Button
          variant="contained"
          size="large"
          startIcon={<PlayArrowIcon />}
          onClick={handleStartFlowSession}
          sx={{ minWidth: 200 }}
        >
          Start Flow Session
        </Button>
      </Paper>

      <Paper sx={{ p: 4, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Manually Add Flow Session
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Add a completed flow session with a specific duration without running the timer.
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <TextField
            type="number"
            label="Hours"
            value={hours}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 0;
              if (val >= 0) {
                setHours(val);
              }
            }}
            inputProps={{ min: 0 }}
            sx={{ width: 120 }}
          />
          <Typography variant="h6">:</Typography>
          <TextField
            type="number"
            label="Minutes"
            value={minutes}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 0;
              if (val >= 0 && val < 60) {
                setMinutes(val);
              }
            }}
            inputProps={{ min: 0, max: 59 }}
            sx={{ width: 120 }}
          />
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleManualAdd}
            disabled={hours === 0 && minutes === 0}
          >
            Add Session
          </Button>
        </Stack>
        {(hours > 0 || minutes > 0) && (
          <Typography variant="body2" color="text.secondary">
            Total: {hours}h {minutes}m ({(hours * 3600) + (minutes * 60)} seconds)
          </Typography>
        )}
      </Paper>

      <Paper sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom>
          Flow Sessions
        </Typography>
        {flowSessions.length > 0 ? (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {flowSessions.length} flow session{flowSessions.length !== 1 ? 's' : ''} in this session
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <TodoList
              items={flowSessions}
              onToggleComplete={handleToggleFlowSession}
              onDelete={handleDeleteFlowSession}
            />
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No flow sessions yet. Start a new session or manually add one above.
          </Typography>
        )}
      </Paper>

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
    </Box>
  );
};

export default Flow;
