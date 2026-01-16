import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Slider, Typography, Box } from '@mui/material';
import { useUserContext } from '../../contexts/UserContext';
import { useTodoContext } from '../../contexts/TodoContext';
import { useRewardGeneration, getRewardStyle } from '../../hooks/useRewardGeneration';

interface TaskRewardDialogProps {
  open: boolean;
  onClose: () => void;
  onTakeRewards: () => void;
  timeSpent?: number;
}

export const TaskRewardDialog = ({ open, onClose, onTakeRewards, timeSpent }: TaskRewardDialogProps) => {
  const { updateBalance } = useUserContext();
  const { getFormattedTime } = useTodoContext();
  const { step, rewards, startGeneration, reset } = useRewardGeneration();
  const [numRewards, setNumRewards] = useState<number>(1);

  // Reset state when opening
  useEffect(() => {
    if (open) {
      reset();
      setNumRewards(1);
    }
  }, [open, reset]);

  const handleStartGeneration = () => {
    startGeneration(numRewards);
  };

  const handleTakeRewards = () => {
    const total = rewards.reduce((a, b) => a + b, 0);
    updateBalance(total);
    onTakeRewards();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Task Complete! Claim Rewards</DialogTitle>
      <DialogContent>
        {timeSpent !== undefined && (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                Time tracked: {getFormattedTime(timeSpent)}
            </Typography>
        )}
        {step === 'input' && (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography gutterBottom>How difficult was this task? (Rewards: {numRewards})</Typography>
            <Slider
              value={numRewards}
              onChange={(_, val) => setNumRewards(val as number)}
              step={1}
              marks
              min={1}
              max={10}
              valueLabelDisplay="auto"
            />
          </Box>
        )}

        {(step === 'generating' || step === 'finished') && (
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 2, 
            justifyContent: 'center', 
            alignItems: 'center',
            p: 2,
            minHeight: '150px' 
          }}>
            {rewards.map((r, i) => (
              <Typography key={i} sx={{ ...getRewardStyle(r), animation: 'fadeIn 0.5s' }}>
                {r}zl
              </Typography>
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        {step === 'input' && (
          <Button onClick={handleStartGeneration} variant="contained" color="primary">
            Get Rewards
          </Button>
        )}
        {step === 'finished' && (
          <Button onClick={handleTakeRewards} variant="contained" color="success" size="large">
            Take My Rewards ({rewards.reduce((a, b) => a + b, 0)}zl)
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
