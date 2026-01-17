import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography, Box, IconButton } from '@mui/material';
import { useUserContext } from '../../contexts/UserContext';
import CasinoIcon from '@mui/icons-material/Casino';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import { useRewardGeneration, getRewardStyle } from '../../hooks/useRewardGeneration';

interface RandomRewardPickerProps {
  open: boolean;
  onClose: () => void;
}

export const RandomRewardPicker = ({ open, onClose }: RandomRewardPickerProps) => {
  const { updatePoints, randomPicks, updateRandomPicks } = useUserContext();
  const { step, rewards, startGeneration, reset } = useRewardGeneration();
  const [numRewards, setNumRewards] = useState<number>(1);
  
  // RP Modification State in Dialog
  const [openRpModify, setOpenRpModify] = useState(false);
  const [rpModifyMode, setRpModifyMode] = useState<'add' | 'subtract'>('add');
  const [rpModifyAmount, setRpModifyAmount] = useState<string>('');

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
        updateRandomPicks(-1, 'Used for Random Rewards');
    } else if (numRewards > randomPicks) {
        setNumRewards(randomPicks);
        startGeneration(randomPicks);
        updateRandomPicks(-randomPicks, 'Used for Random Rewards');
    } else {
        startGeneration(numRewards);
        updateRandomPicks(-numRewards, 'Used for Random Rewards');
    }
  };

  const handleTakeRewards = () => {
    const total = rewards.reduce((a, b) => a + b, 0);
    updatePoints(total, 'Random Reward', rewards.length);
    onClose();
  };

  const handleOpenRpModify = (mode: 'add' | 'subtract') => {
    setRpModifyMode(mode);
    setRpModifyAmount('');
    setOpenRpModify(true);
  };

  const handleRpModifySubmit = () => {
    const val = parseFloat(rpModifyAmount);
    if (!isNaN(val) && val > 0) {
      const finalAmount = rpModifyMode === 'add' ? val : -val;
      updateRandomPicks(finalAmount, 'Manual Adjustment in Picker');
      setOpenRpModify(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Pick Random Rewards</span>
            {step === 'input' && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ShuffleIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'text.primary', mr: 1 }}>
                        {randomPicks} RP
                    </Typography>
                    <IconButton 
                        onClick={() => handleOpenRpModify('add')} 
                        size="small" 
                        sx={{ border: '1px solid', borderColor: 'text.secondary', padding: 0.5 }}
                    >
                        <AddIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                        onClick={() => handleOpenRpModify('subtract')} 
                        color="error" 
                        size="small" 
                        sx={{ border: '1px solid', padding: 0.5 }}
                    >
                        <RemoveIcon fontSize="small" />
                    </IconButton>
                </Box>
            )}
        </DialogTitle>
        <DialogContent>
        {step === 'input' && (
          <Box sx={{ p: 2, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography>
              How many rewards do you want to pick? (Max: {randomPicks})
            </Typography>
            <TextField
              type="number"
              label="Number of Rewards"
              value={numRewards}
              disabled={randomPicks === 0}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val)) setNumRewards(val);
                else setNumRewards(0); // Allow clearing input
              }}
              slotProps={{ 
                htmlInput: { 
                  min: 1, 
                  max: randomPicks,
                  style: { textAlign: 'center' }
                } 
              }}
              fullWidth
            />
            <Typography variant="caption" color="text.secondary">
              {randomPicks > 0 
                ? `Enter a value between 1 and ${randomPicks}` 
                : "You need Random Picks (RP) to get rewards"}
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
            disabled={numRewards < 1 || numRewards > randomPicks}
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

    {/* RP Modify Dialog */}
    <Dialog open={openRpModify} onClose={() => setOpenRpModify(false)} sx={{ zIndex: (theme) => theme.zIndex.modal + 1 }}>
        <DialogTitle>
            {rpModifyMode === 'add' ? 'Add' : 'Reduce'} Random Picks
        </DialogTitle>
        <DialogContent>
            <TextField
            autoFocus
            margin="dense"
            label="Amount (RP)"
            type="number"
            fullWidth
            variant="outlined"
            value={rpModifyAmount}
            onChange={(e) => setRpModifyAmount(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === 'Enter') handleRpModifySubmit();
            }}
            />
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setOpenRpModify(false)}>Cancel</Button>
            <Button onClick={handleRpModifySubmit} variant="contained" color={rpModifyMode === 'add' ? 'primary' : 'error'}>
            {rpModifyMode === 'add' ? 'Add' : 'Reduce'}
            </Button>
        </DialogActions>
    </Dialog>
    </>
  );
};
