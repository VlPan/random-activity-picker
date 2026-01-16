import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Slider, Typography, Box } from '@mui/material';
import { useUserContext } from '../../contexts/UserContext';
import { useTodoContext } from '../../contexts/TodoContext';
import { useRewardGeneration, getRewardStyle } from '../../hooks/useRewardGeneration';

interface TaskRewardDialogProps {
  open: boolean;
  onClose: () => void;
  onTakeRewards: () => void;
  onContinueTask?: () => void;
  timeSpent?: number;
  taskName?: string;
}

export const TaskRewardDialog = ({ open, onClose, onTakeRewards, onContinueTask, timeSpent, taskName }: TaskRewardDialogProps) => {
  const { updatePoints, rewardSettings } = useUserContext();
  const { getFormattedTime } = useTodoContext();
  const { step, rewards, startGeneration, reset } = useRewardGeneration();
  const [numRewards, setNumRewards] = useState<number>(1);

  // Calculate Min/Max based on timeSpent and settings
  const { minPoints, maxPoints, noReward } = useMemo(() => {
    if (timeSpent === undefined) return { minPoints: 1, maxPoints: 1, noReward: true };

    const minutes = timeSpent / 60;
    
    let calcMin = Math.round(minutes / rewardSettings.minTimeBlock) * rewardSettings.minPoints;
    
    const baseMax = Math.floor(minutes / rewardSettings.maxTimeBlock) * rewardSettings.maxPoints;
    
    const numIntervals = Math.floor(minutes / rewardSettings.progressiveInterval);
    const progressiveBonus = (numIntervals * (numIntervals + 1)) / 2;
    
    const calcMax = baseMax + progressiveBonus;
    
    if (calcMax <= 0) {
        return { minPoints: 0, maxPoints: 0, noReward: true };
    }
    
    if (calcMin > calcMax) calcMin = calcMax;
    // Ensure at least 1 if not noReward, though logic above handles 0
    // If calcMax > 0 but calcMin could be 0? 
    // Example: 5 mins. Max = 0.5 -> 0.
    // If 11 mins. Max = 1. Min = 11/30 = 0.
    // So range 0-1.
    // User might choose 0?
    // Let's ensure min is at least 1 if max >= 1?
    // User said "Min = Time/30 rounded (min - 1)".
    // If 0, it's 0.
    
    return { minPoints: calcMin, maxPoints: calcMax, noReward: false };

  }, [timeSpent, rewardSettings]);

  // Reset state when opening
  useEffect(() => {
    if (open) {
      reset();
    }
  }, [open, reset]);

  // Initialize slider value
  useEffect(() => {
      if (open && !noReward) {
          setNumRewards(minPoints);
      }
  }, [open, minPoints, noReward]);

  const handleStartGeneration = () => {
    startGeneration(numRewards);
  };

  const handleTakeRewards = () => {
    const total = rewards.reduce((a, b) => a + b, 0);
    const reason = taskName ? `Task Reward: ${taskName}` : 'Task Reward';
    updatePoints(total, reason, rewards.length);
    onTakeRewards();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
          Task Complete! Claim Rewards
          {taskName && <Typography variant="subtitle1" color="primary">{taskName}</Typography>}
      </DialogTitle>
      <DialogContent>
        {timeSpent !== undefined && (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                Time tracked: {getFormattedTime(timeSpent)}
            </Typography>
        )}
        
        {step === 'input' && (
            <>
            {noReward ? (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography color="error" gutterBottom>
                        Not enough time spent for a reward.
                    </Typography>
                    <Typography variant="body2">
                        You need to work longer to earn rewards based on your settings.
                    </Typography>
                </Box>
            ) : (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography gutterBottom>
                        Choose your reward count ({minPoints} - {maxPoints})
                    </Typography>
                    <Slider
                    value={numRewards}
                    onChange={(_, val) => setNumRewards(val as number)}
                    step={1}
                    marks
                    min={minPoints}
                    max={maxPoints}
                    valueLabelDisplay="auto"
                    disabled={minPoints === maxPoints}
                    />
                </Box>
            )}
            </>
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
                {r}P
              </Typography>
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        {step === 'input' && (
            <>
                {noReward ? (
                    <>
                        {onContinueTask && (
                            <Button onClick={onContinueTask} color="inherit">
                                Continue Task
                            </Button>
                        )}
                         <Button onClick={onTakeRewards} color="primary">
                            Complete without Reward
                        </Button>
                    </>
                ) : (
                    <>
                        {onContinueTask && (
                            <Button onClick={onContinueTask} color="inherit">
                                Continue Task
                            </Button>
                        )}
                        <Button onClick={handleStartGeneration} variant="contained" color="primary" disabled={numRewards === 0}>
                            Get Rewards
                        </Button>
                    </>
                )}
            </>
        )}
        {step === 'finished' && (
          <Button onClick={handleTakeRewards} variant="contained" color="success" size="large">
            Take My Rewards ({rewards.reduce((a, b) => a + b, 0)}P)
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
