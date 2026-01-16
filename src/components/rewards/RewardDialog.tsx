import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from '@mui/material';
import type { Reward } from '../../models/reward';
import { v4 as uuidv4 } from 'uuid';

interface RewardDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (reward: Reward) => void;
  reward?: Reward;
}

const RewardDialog = ({ open, onClose, onSave, reward }: RewardDialogProps) => {
  const [value, setValue] = useState<number | string>('');
  const [currency, setCurrency] = useState('P');

  useEffect(() => {
    if (reward) {
      setValue(reward.value);
      setCurrency(reward.currency);
    } else {
      setValue('');
      setCurrency('P');
    }
  }, [reward, open]);

  const handleSubmit = () => {
    if (!value) return;

    const newReward: Reward = {
      id: reward?.id || uuidv4(),
      value: Number(value),
      currency,
    };

    onSave(newReward);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{reward ? 'Edit Reward' : 'Add Reward'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Value"
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            fullWidth
            autoFocus
          />
          <TextField
            label="Currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!value}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RewardDialog;
