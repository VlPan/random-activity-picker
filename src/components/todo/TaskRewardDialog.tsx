import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Slider, Typography, Box } from '@mui/material';
import { useUserContext } from '../../contexts/UserContext';
import { useRewardContext } from '../../contexts/RewardContext';

interface TaskRewardDialogProps {
  open: boolean;
  onClose: () => void; // Note: In this flow, we usually close via onTakeRewards, but if user cancels? We might need a way to close without taking rewards? Or force them to take? The prompt implies "After I select...". Let's assume no cancel once started.
  onTakeRewards: () => void;
}

export const TaskRewardDialog = ({ open, onClose, onTakeRewards }: TaskRewardDialogProps) => {
  const { luckyNumber, updateBalance } = useUserContext();
  const { rewards: rewardsMap } = useRewardContext();
  const [step, setStep] = useState<'slider' | 'generating' | 'finished'>('slider');
  const [numRewards, setNumRewards] = useState<number>(1);
  const [rewards, setRewards] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Reset state when opening
  useEffect(() => {
    if (open) {
      setStep('slider');
      setRewards([]);
      setCurrentIndex(0);
      setNumRewards(1);
    }
  }, [open]);

  const generateRewardValue = () => {
    // Get unique sorted reward values
    const uniqueValues = Array.from(new Set(Array.from(rewardsMap.values()).map(r => r.value))).sort((a, b) => a - b);
    
    // Default to [1] if no rewards exist
    if (uniqueValues.length === 0) return 1;

    const minVal = uniqueValues[0];
    const L = luckyNumber;
    
    // Calculate weights
    // Weight for minVal is 1
    // Weight for other value v is (minVal / v) * L
    // Example: min=1, v=10, L=2 -> weight = (1/10)*2 = 0.2
    
    const weights = uniqueValues.map(v => {
      if (v === minVal) return 1;
      return (minVal / v) * L;
    });

    const totalWeight = weights.reduce((a, b) => a + b, 0);
    const rand = Math.random() * totalWeight;
    
    let cumulativeWeight = 0;
    for (let i = 0; i < uniqueValues.length; i++) {
      cumulativeWeight += weights[i];
      if (rand < cumulativeWeight) {
        return uniqueValues[i];
      }
    }
    
    return uniqueValues[uniqueValues.length - 1];
  };

  const handleStartGeneration = () => {
    setStep('generating');
    setRewards([]);
    setCurrentIndex(0);
  };

  useEffect(() => {
    if (step === 'generating' && currentIndex < numRewards) {
      const timer = setTimeout(() => {
        setRewards(prev => [...prev, generateRewardValue()]);
        setCurrentIndex(prev => prev + 1);
      }, 500);
      return () => clearTimeout(timer);
    } else if (step === 'generating' && currentIndex >= numRewards) {
      setStep('finished');
    }
  }, [step, currentIndex, numRewards, luckyNumber]);

  const handleTakeRewards = () => {
    const total = rewards.reduce((a, b) => a + b, 0);
    updateBalance(total);
    onTakeRewards();
  };

  const getRewardStyle = (val: number) => {
    if (val >= 1000) return { fontSize: '2.5rem', color: '#9c27b0', fontWeight: 'bold' }; // purple
    if (val >= 100) return { fontSize: '2rem', color: '#1976d2', fontWeight: 'bold' }; // blue
    if (val >= 10) return { fontSize: '1.5rem', color: '#2e7d32', fontWeight: 'bold' }; // green
    return { fontSize: '1rem', color: 'inherit' };
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Task Complete! Claim Rewards</DialogTitle>
      <DialogContent>
        {step === 'slider' && (
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
        {step === 'slider' && (
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
