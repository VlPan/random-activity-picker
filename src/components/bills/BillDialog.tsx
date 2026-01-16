import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Box,
} from '@mui/material';
import type { Bill } from '../../models/bill';
import { v4 as uuidv4 } from 'uuid';

interface BillDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (bill: Bill) => void;
  bill?: Bill;
}

export const BillDialog = ({ open, onClose, onSave, bill }: BillDialogProps) => {
  const [name, setName] = useState('');
  const [cost, setCost] = useState<string>('');
  const [isBasicNecessity, setIsBasicNecessity] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (bill) {
        setName(bill.name);
        setCost(bill.cost.toString());
        setIsBasicNecessity(bill.isBasicNecessity);
      } else {
        setName('');
        setCost('');
        setIsBasicNecessity(false);
      }
      setError(null);
    }
  }, [open, bill]);

  const handleSave = () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    const costNum = parseFloat(cost);
    if (isNaN(costNum) || costNum < 0) {
      setError('Valid cost is required');
      return;
    }

    const newBill: Bill = {
      id: bill ? bill.id : uuidv4(),
      name: name.trim(),
      cost: costNum,
      isBasicNecessity,
    };

    onSave(newBill);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{bill ? 'Edit Bill' : 'Add Bill'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            error={!!error && !name.trim()}
          />
          <TextField
            label="Cost"
            type="number"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            fullWidth
            error={!!error && (isNaN(parseFloat(cost)) || parseFloat(cost) < 0)}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={isBasicNecessity}
                onChange={(e) => setIsBasicNecessity(e.target.checked)}
              />
            }
            label="Basic Necessity"
          />
          {error && (
            <Box sx={{ color: 'error.main', fontSize: '0.875rem' }}>{error}</Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
