import { useState } from 'react';
import { Box, Checkbox, Typography, Chip, IconButton } from '@mui/material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import type { ProjectTask } from '../../models/project';
import StatusIndicator from '../../components/projects/StatusIndicator';
import StatusModal from '../../components/projects/StatusModal';

interface ProjectTaskItemProps {
  task: ProjectTask;
  onComplete: (taskId: string) => void;
  onUpdate: (task: ProjectTask) => void;
}

const ProjectTaskItem = ({ task, onComplete, onUpdate }: ProjectTaskItemProps) => {
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : (task.isCompleted ? 0.6 : 1),
    position: 'relative' as 'relative',
    zIndex: isDragging ? 1 : 0,
    backgroundColor: isDragging ? '#fafafa' : 'transparent',
  };

  return (
    <Box 
      ref={setNodeRef}
      style={style}
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        p: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
        // opacity logic moved to style for drag support
        '&:last-child': {
            borderBottom: 'none'
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton
            size="small"
            {...attributes}
            {...listeners}
            sx={{ cursor: 'grab', touchAction: 'none' }}
        >
            <DragIndicatorIcon fontSize="small" color="disabled" />
        </IconButton>
        <Checkbox 
          checked={task.isCompleted} 
          disabled={task.isCompleted}
          onChange={() => onComplete(task.id)}
          color="success"
        />
        <StatusIndicator 
            status={task.status} 
            size={12}
            onClick={(e) => {
                e.stopPropagation();
                setStatusModalOpen(true);
            }} 
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
      
      <StatusModal
        open={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title={`Status: ${task.name}`}
        currentStatus={task.status || 'unset'}
        comments={task.comments || []}
        onSave={(status, comments) => {
            onUpdate({ ...task, status, comments });
        }}
      />
    </Box>
  );
};

export default ProjectTaskItem;
