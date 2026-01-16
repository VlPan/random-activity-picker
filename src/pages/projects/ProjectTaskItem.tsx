import { Box, Checkbox, Typography, Chip } from '@mui/material';
import type { ProjectTask } from '../../models/project';

interface ProjectTaskItemProps {
  task: ProjectTask;
  onComplete: (taskId: string) => void;
}

const ProjectTaskItem = ({ task, onComplete }: ProjectTaskItemProps) => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        p: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
        opacity: task.isCompleted ? 0.6 : 1,
        transition: 'opacity 0.2s',
        '&:last-child': {
            borderBottom: 'none'
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Checkbox 
          checked={task.isCompleted} 
          disabled={task.isCompleted}
          onChange={() => onComplete(task.id)}
          color="success"
        />
        <Typography 
            variant="body1" 
            sx={{ 
                textDecoration: task.isCompleted ? 'line-through' : 'none',
                color: task.isCompleted ? 'text.secondary' : 'text.primary'
            }}
        >
          {task.name}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip 
            label={`${task.rewardMin}-${task.rewardMax} P`} 
            size="small" 
            color={task.isCompleted ? "default" : "secondary"} 
            variant="outlined" 
        />
      </Box>
    </Box>
  );
};

export default ProjectTaskItem;
