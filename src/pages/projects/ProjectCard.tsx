import { useState } from 'react';
import { 
    Card, 
    Typography, 
    Box, 
    IconButton, 
    LinearProgress, 
    Accordion, 
    AccordionSummary, 
    AccordionDetails,
    Chip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { 
    DndContext, 
    closestCenter, 
    KeyboardSensor, 
    PointerSensor, 
    useSensor, 
    useSensors, 
    type DragEndEvent 
} from '@dnd-kit/core';
import { 
    SortableContext, 
    sortableKeyboardCoordinates, 
    verticalListSortingStrategy, 
    arrayMove 
} from '@dnd-kit/sortable';
import type { Project, ProjectTask } from '../../models/project';
import ProjectTaskItem from './ProjectTaskItem';
import { formatDate } from '../../utils/dateUtils';

interface ProjectCardProps {
    project: Project;
    onDelete: (id: string) => void;
    onEdit: (project: Project) => void;
    onTaskComplete: (taskId: string) => void;
    onTaskReorder: (projectId: string, tasks: ProjectTask[]) => void;
}

const ProjectCard = ({ project, onDelete, onEdit, onTaskComplete, onTaskReorder }: ProjectCardProps) => {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        
        if (over && active.id !== over.id) {
            const oldIndex = project.tasks.findIndex((t) => t.id === active.id);
            const newIndex = project.tasks.findIndex((t) => t.id === over.id);
            
            const newTasks = arrayMove(project.tasks, oldIndex, newIndex);
            onTaskReorder(project.id, newTasks);
        }
    };

    // Calculate Timeline Progress
    const calculateTimeProgress = () => {
        const start = new Date(project.startDate).getTime();
        const end = new Date(project.endDate).getTime();
        const now = new Date().getTime();
        const totalDuration = end - start;
        const elapsed = now - start;

        if (totalDuration <= 0) return 100;
        if (elapsed < 0) return 0;
        const progress = (elapsed / totalDuration) * 100;
        return Math.min(Math.max(progress, 0), 100);
    };

    // Calculate Task Completion Progress
    const calculateCompletionProgress = () => {
        if (project.tasks.length === 0) return 0;
        const completedCount = project.tasks.filter(t => t.isCompleted).length;
        return (completedCount / project.tasks.length) * 100;
    };

    const timeProgress = calculateTimeProgress();
    const completionProgress = calculateCompletionProgress();
    const isOverdue = new Date() > new Date(project.endDate) && completionProgress < 100;
    
    const daysLeft = Math.ceil((new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    const daysLeftText = daysLeft > 0 
        ? `${daysLeft} days left`
        : daysLeft === 0 
            ? 'Due today'
            : `${Math.abs(daysLeft)} days overdue`;

    const [expanded, setExpanded] = useState(() => {
        const saved = localStorage.getItem(`project_expanded_${project.id}`);
        return saved === 'true';
    });

    const handleAccordionChange = (_event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpanded(isExpanded);
        localStorage.setItem(`project_expanded_${project.id}`, String(isExpanded));
    };

    return (
        <Card sx={{ mb: 2, position: 'relative', overflow: 'visible' }}>
            <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
                {/* Completion Progress (Green) */}
                <LinearProgress 
                    variant="determinate" 
                    value={completionProgress} 
                    sx={{ 
                        height: 4, 
                        bgcolor: 'action.hover',
                        '& .MuiLinearProgress-bar': {
                            bgcolor: 'success.main'
                        }
                    }} 
                />
                {/* Timeline Progress (Yellow) */}
                <LinearProgress 
                    variant="determinate" 
                    value={timeProgress} 
                    sx={{ 
                        height: 4, 
                        bgcolor: 'action.hover',
                        '& .MuiLinearProgress-bar': {
                            bgcolor: 'warning.main'
                        }
                    }} 
                />
            </Box>

            <Accordion expanded={expanded} onChange={handleAccordionChange} disableGutters elevation={0} sx={{ '&:before': { display: 'none' } }}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{ 
                        flexDirection: 'row-reverse',
                        '& .MuiAccordionSummary-content': { 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            ml: 2 
                        } 
                    }}
                >
                    <Box>
                        <Typography variant="h6" component="div">
                            {project.name}
                        </Typography>
                        <Typography variant="caption" color={isOverdue ? 'error.main' : 'text.secondary'}>
                            {formatDate(project.startDate)} - {formatDate(project.endDate)}
                            <Box component="span" sx={{ ml: 1, fontWeight: 'medium' }}>
                                ({daysLeftText})
                            </Box>
                        </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Chip 
                            label={`${Math.round(completionProgress)}% Done`} 
                            size="small" 
                            color={completionProgress === 100 ? "success" : "default"}
                        />
                         <IconButton 
                            component="div" 
                            size="small" 
                            onClick={(e) => { e.stopPropagation(); onEdit(project); }}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                            component="div" 
                            size="small" 
                            color="error" 
                            onClick={(e) => { e.stopPropagation(); onDelete(project.id); }}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Box>
                </AccordionSummary>
                
                <AccordionDetails sx={{ p: 0 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        {project.tasks.length === 0 && (
                            <Typography sx={{ p: 2 }} color="text.secondary">No tasks added yet.</Typography>
                        )}
                        <DndContext 
                            sensors={sensors} 
                            collisionDetection={closestCenter} 
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext 
                                items={project.tasks.map(t => t.id)} 
                                strategy={verticalListSortingStrategy}
                            >
                                {project.tasks.map(task => (
                                    <ProjectTaskItem 
                                        key={task.id} 
                                        task={task} 
                                        onComplete={onTaskComplete} 
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                    </Box>
                </AccordionDetails>
            </Accordion>
        </Card>
    );
};

export default ProjectCard;
