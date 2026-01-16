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
import { ConfirmationDialog } from '../common/ConfirmationDialog';

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
  const [showUnfixedConfirm, setShowUnfixedConfirm] = useState(false);

  useEffect(() => {
    if (open) {
      if (bill) {
        setName(bill.name);
        setCost(bill.cost !== null ? bill.cost.toString() : '');
        setIsBasicNecessity(bill.isBasicNecessity);
      } else {
        setName('');
        setCost('');
        setIsBasicNecessity(false);
      }
      setError(null);
      setShowUnfixedConfirm(false);
    }
  }, [open, bill]);

  const handleSave = () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    if (cost.trim() === '') {
      setShowUnfixedConfirm(true);
      return;
    }

    const costNum = parseFloat(cost);
    if (isNaN(costNum) || costNum < 0) {
      setError('Valid cost is required');
      return;
    }

    saveBill(costNum);
  };

  const saveBill = (finalCost: number | null) => {
    const newBill: Bill = {
      id: bill ? bill.id : uuidv4(),
      name: name.trim(),
      cost: finalCost,
      isBasicNecessity,
    };

    onSave(newBill);
    onClose();
  };

  const handleConfirmUnfixed = () => {
    setShowUnfixedConfirm(false);
    saveBill(null);
  };

  return (
    <>
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
              helperText="Leave empty for unfixed price"
              error={!!error && cost.trim() !== '' && (isNaN(parseFloat(cost)) || parseFloat(cost) < 0)}
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
      
      <ConfirmationDialog
        open={showUnfixedConfirm}
        title="Unfixed Price Bill"
        content="This action will create a bill with an unfixed price. Are you sure you want to proceed?"
        onConfirm={handleConfirmUnfixed}
        onClose={() => setShowUnfixedConfirm(false)}
        confirmLabel="Create Unfixed Bill"
      />
    </>
  );
};
