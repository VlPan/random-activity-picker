import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography, Box } from '@mui/material';
import { useUserContext } from '../../contexts/UserContext';
import CasinoIcon from '@mui/icons-material/Casino';
import { useRewardGeneration, getRewardStyle } from '../../hooks/useRewardGeneration';

interface RandomRewardPickerProps {
  open: boolean;
  onClose: () => void;
}

export const RandomRewardPicker = ({ open, onClose }: RandomRewardPickerProps) => {
  const { updatePoints } = useUserContext();
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
    // Validate
    if (numRewards < 1) {
        setNumRewards(1);
        startGeneration(1);
    } else if (numRewards > 100) {
        setNumRewards(100);
        startGeneration(100);
    } else {
        startGeneration(numRewards);
    }
  };

  const handleTakeRewards = () => {
    const total = rewards.reduce((a, b) => a + b, 0);
    updatePoints(total);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Pick Random Rewards</DialogTitle>
      <DialogContent>
        {step === 'input' && (
          <Box sx={{ p: 2, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography>
              How many rewards do you want to pick?
            </Typography>
            <TextField
              type="number"
              label="Number of Rewards"
              value={numRewards}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val)) setNumRewards(val);
                else setNumRewards(0); // Allow clearing input
              }}
              slotProps={{ 
                htmlInput: { 
                  min: 1, 
                  max: 100,
                  style: { textAlign: 'center' }
                } 
              }}
              fullWidth
            />
            <Typography variant="caption" color="text.secondary">
              Enter a value between 1 and 100
            </Typography>
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
            minHeight: '150px',
            maxHeight: '400px',
            overflowY: 'auto'
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
          <Button 
            onClick={handleStartGeneration} 
            variant="contained" 
            color="primary"
            disabled={numRewards < 1 || numRewards > 100}
            startIcon={<CasinoIcon />}
          >
            Roll Rewards
          </Button>
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
