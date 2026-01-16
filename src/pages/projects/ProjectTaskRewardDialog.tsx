import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Slider,
    Box
} from '@mui/material';

interface ProjectTaskRewardDialogProps {
    open: boolean;
    taskName: string;
    minReward: number;
    maxReward: number;
    onConfirm: (amount: number) => void;
    onClose: () => void;
}

const ProjectTaskRewardDialog = ({ 
    open, 
    taskName, 
    minReward, 
    maxReward, 
    onConfirm, 
    onClose 
}: ProjectTaskRewardDialogProps) => {
    const [reward, setReward] = useState<number>(minReward);

    useEffect(() => {
        if (open) {
            // Reset to average or min? Let's reset to min to encourage honest evaluation
            setReward(minReward);
        }
    }, [open, minReward]);

    const handleConfirm = () => {
        onConfirm(reward);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Claim Reward</DialogTitle>
            <DialogContent>
                <Typography gutterBottom>
                    Task Completed: <strong>{taskName}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                    How difficult or impactful was this task? Choose your reward within the range.
                </Typography>

                <Box sx={{ px: 2, py: 4 }}>
                    <Slider
                        value={reward}
                        onChange={(_, value) => setReward(value as number)}
                        min={minReward}
                        max={maxReward}
                        valueLabelDisplay="on"
                        step={1}
                        marks={[
                            { value: minReward, label: `${minReward} P` },
                            { value: maxReward, label: `${maxReward} P` },
                        ]}
                    />
                </Box>
                
                <Typography align="center" variant="h5" color="primary">
                    {reward} Points
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">Cancel</Button>
                <Button onClick={handleConfirm} variant="contained" color="success">
                    Claim Reward
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ProjectTaskRewardDialog;
