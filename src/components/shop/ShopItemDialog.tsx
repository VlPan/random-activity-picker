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
import type { ShopItem } from '../../models/shopItem';
import { v4 as uuidv4 } from 'uuid';

interface ShopItemDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (item: ShopItem) => void;
  item?: ShopItem;
}

export const ShopItemDialog = ({ open, onClose, onSave, item }: ShopItemDialogProps) => {
  const [name, setName] = useState('');
  const [cost, setCost] = useState<string>('');
  const [isBasicNecessity, setIsBasicNecessity] = useState(false);
  const [isPersistent, setIsPersistent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (item) {
        setName(item.name);
        setCost(item.cost.toString());
        setIsBasicNecessity(item.isBasicNecessity);
        setIsPersistent(item.isPersistent);
      } else {
        setName('');
        setCost('');
        setIsBasicNecessity(false);
        setIsPersistent(false);
      }
      setError(null);
    }
  }, [open, item]);

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

    const newItem: ShopItem = {
      id: item ? item.id : uuidv4(),
      name: name.trim(),
      cost: costNum,
      isBasicNecessity,
      isPersistent,
    };

    onSave(newItem);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{item ? 'Edit Shop Item' : 'Add Shop Item'}</DialogTitle>
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
          <FormControlLabel
            control={
              <Checkbox
                checked={isPersistent}
                onChange={(e) => setIsPersistent(e.target.checked)}
              />
            }
            label="Persistent Item"
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
