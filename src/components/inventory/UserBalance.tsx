import { useState } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useUserContext } from '../../contexts/UserContext';

export const UserBalance = () => {
  const { balance, updateBalance } = useUserContext();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'add' | 'subtract'>('add');
  const [amount, setAmount] = useState<string>('');

  const handleOpen = (newMode: 'add' | 'subtract') => {
    setMode(newMode);
    setAmount('');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = () => {
    const val = parseFloat(amount);
    if (!isNaN(val) && val > 0) {
      updateBalance(mode === 'add' ? val : -val);
      handleClose();
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, p: 2, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Balance: {balance}zl</Typography>
      <Box>
        <IconButton onClick={() => handleOpen('add')} color="primary" size="small" sx={{ border: '1px solid', mr: 1 }}>
            <AddIcon />
        </IconButton>
        <IconButton onClick={() => handleOpen('subtract')} color="error" size="small" sx={{ border: '1px solid' }}>
            <RemoveIcon />
        </IconButton>
      </Box>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{mode === 'add' ? 'Add to Balance' : 'Reduce Balance'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Amount (zl)"
            type="number"
            fullWidth
            variant="outlined"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    handleSubmit();
                }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color={mode === 'add' ? 'primary' : 'error'}>
            {mode === 'add' ? 'Add' : 'Reduce'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
