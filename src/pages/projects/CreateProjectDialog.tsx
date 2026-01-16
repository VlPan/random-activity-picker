import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    IconButton,
    Divider,
    Grid
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { v4 as uuidv4 } from 'uuid';
import type { Project, ProjectTask } from '../../models/project';

interface CreateProjectDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (project: Omit<Project, 'id' | 'createdAt' | 'tasks'> & { tasks: (Omit<ProjectTask, 'id' | 'isCompleted'> & { id?: string })[] }) => void;
    initialData?: Project;
}

interface DraftTask {
    id: string; // Temporary ID for UI key
    name: string;
    rewardMin: string;
    rewardMax: string;
}

const CreateProjectDialog = ({ open, onClose, onSave, initialData }: CreateProjectDialogProps) => {
    const [name, setName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [tasks, setTasks] = useState<DraftTask[]>([]);

    useEffect(() => {
        if (open) {
            if (initialData) {
                setName(initialData.name);
                setStartDate(initialData.startDate);
                setEndDate(initialData.endDate);
                setTasks(initialData.tasks.map(t => ({
                    id: t.id, // Keep existing ID if editing
                    name: t.name,
                    rewardMin: t.rewardMin.toString(),
                    rewardMax: t.rewardMax.toString()
                })));
            } else {
                setName('');
                setStartDate(new Date().toISOString().split('T')[0]);
                // Default end date +30 days
                const end = new Date();
                end.setDate(end.getDate() + 30);
                setEndDate(end.toISOString().split('T')[0]);
                setTasks([]);
            }
        }
    }, [open, initialData]);

    const handleAddTask = () => {
        setTasks([...tasks, { id: uuidv4(), name: '', rewardMin: '100', rewardMax: '300' }]);
    };

    const handleRemoveTask = (id: string) => {
        setTasks(tasks.filter(t => t.id !== id));
    };

    const handleTaskChange = (id: string, field: keyof DraftTask, value: string) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, [field]: value } : t));
    };

    const handleSubmit = () => {
        if (!name || !startDate || !endDate) return;

        const processedTasks = tasks.map(t => ({
            id: t.id, // Pass ID back. For new tasks, this is a UUID we generated in UI. For existing tasks, it's their persistent ID.
            name: t.name,
            rewardMin: Number(t.rewardMin) || 0,
            rewardMax: Number(t.rewardMax) || 0,
        }));

        onSave({
            name,
            startDate,
            endDate,
            tasks: processedTasks
        });
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{initialData ? 'Edit Project' : 'Create New Project'}</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <TextField
                        label="Project Name"
                        fullWidth
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            label="Start Date"
                            type="date"
                            fullWidth
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            required
                        />
                        <TextField
                            label="End Date"
                            type="date"
                            fullWidth
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            required
                        />
                    </Box>

                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6">Tasks</Typography>
                        <Button startIcon={<AddIcon />} onClick={handleAddTask}>Add Task</Button>
                    </Box>

                    {tasks.map((task) => (
                        <Box key={task.id} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Grid container spacing={1}>
                                <Grid size={6}>
                                    <TextField
                                        label="Task Name"
                                        size="small"
                                        fullWidth
                                        value={task.name}
                                        onChange={(e) => handleTaskChange(task.id, 'name', e.target.value)}
                                    />
                                </Grid>
                                <Grid size={2}>
                                    <TextField
                                        label="Min P"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={task.rewardMin}
                                        onChange={(e) => handleTaskChange(task.id, 'rewardMin', e.target.value)}
                                    />
                                </Grid>
                                <Grid size={2}>
                                    <TextField
                                        label="Max P"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={task.rewardMax}
                                        onChange={(e) => handleTaskChange(task.id, 'rewardMax', e.target.value)}
                                    />
                                </Grid>
                                <Grid size={2} sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <IconButton color="error" onClick={() => handleRemoveTask(task.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        </Box>
                    ))}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={!name}>
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CreateProjectDialog;
