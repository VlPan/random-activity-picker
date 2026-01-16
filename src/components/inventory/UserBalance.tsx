import { useState } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Stack, Divider } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import { useUserContext } from '../../contexts/UserContext';

export const UserBalance = () => {
  const { balance, points, updateBalance, updatePoints, exchangePoints, rewardSettings } = useUserContext();
  
  // Balance Modification State
  const [openModify, setOpenModify] = useState(false);
  const [modifyType, setModifyType] = useState<'balance' | 'points'>('balance');
  const [modifyMode, setModifyMode] = useState<'add' | 'subtract'>('add');
  const [modifyAmount, setModifyAmount] = useState<string>('');

  // Exchange State
  const [openExchange, setOpenExchange] = useState(false);
  const [exchangeAmount, setExchangeAmount] = useState<string>('');

  const handleOpenModify = (type: 'balance' | 'points', mode: 'add' | 'subtract') => {
    setModifyType(type);
    setModifyMode(mode);
    setModifyAmount('');
    setOpenModify(true);
  };

  const handleModifySubmit = () => {
    const val = parseFloat(modifyAmount);
    if (!isNaN(val) && val > 0) {
      const finalAmount = modifyMode === 'add' ? val : -val;
      if (modifyType === 'balance') {
        updateBalance(finalAmount, 'Manual Adjustment', 'Manual');
      } else {
        updatePoints(finalAmount, 'Manual Adjustment');
      }
      setOpenModify(false);
    }
  };

  const handleOpenExchange = () => {
    setExchangeAmount('');
    setOpenExchange(true);
  };

  const handleExchangeSubmit = () => {
    const val = parseFloat(exchangeAmount);
    if (!isNaN(val) && val > 0) {
      exchangePoints(val);
      setOpenExchange(false);
    }
  };

  const handleExchangeAll = () => {
    if (points > 0) {
        exchangePoints(points);
        setOpenExchange(false);
    }
  };

  const conversionRate = rewardSettings.conversionRate || 100;

  return (
    <Box sx={{ mb: 4, p: 2, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
      <Stack direction="row" spacing={4} alignItems="center" justifyContent="space-between">
          {/* Points Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                {points} P
            </Typography>
            <Box>
                <IconButton onClick={() => handleOpenModify('points', 'add')} color="secondary" size="small" sx={{ border: '1px solid', mr: 1 }}>
                    <AddIcon />
                </IconButton>
                <IconButton onClick={() => handleOpenModify('points', 'subtract')} color="error" size="small" sx={{ border: '1px solid' }}>
                    <RemoveIcon />
                </IconButton>
            </Box>
          </Box>

          <Divider orientation="vertical" flexItem />

          {/* Exchange Section */}
          <Button 
            startIcon={<CurrencyExchangeIcon />} 
            variant="outlined" 
            onClick={handleOpenExchange}
            disabled={points === 0}
          >
            Exchange
          </Button>

          <Divider orientation="vertical" flexItem />

          {/* Balance Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                {balance} ZL
            </Typography>
            <Box>
                <IconButton onClick={() => handleOpenModify('balance', 'add')} color="primary" size="small" sx={{ border: '1px solid', mr: 1 }}>
                    <AddIcon />
                </IconButton>
                <IconButton onClick={() => handleOpenModify('balance', 'subtract')} color="error" size="small" sx={{ border: '1px solid' }}>
                    <RemoveIcon />
                </IconButton>
            </Box>
          </Box>
      </Stack>

      {/* Modify Dialog */}
      <Dialog open={openModify} onClose={() => setOpenModify(false)}>
        <DialogTitle>
            {modifyMode === 'add' ? 'Add' : 'Reduce'} {modifyType === 'balance' ? 'Balance (ZL)' : 'Points'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={modifyType === 'balance' ? "Amount (ZL)" : "Amount (Points)"}
            type="number"
            fullWidth
            variant="outlined"
            value={modifyAmount}
            onChange={(e) => setModifyAmount(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === 'Enter') handleModifySubmit();
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModify(false)}>Cancel</Button>
          <Button onClick={handleModifySubmit} variant="contained" color={modifyMode === 'add' ? 'primary' : 'error'}>
            {modifyMode === 'add' ? 'Add' : 'Reduce'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Exchange Dialog */}
      <Dialog open={openExchange} onClose={() => setOpenExchange(false)}>
        <DialogTitle>Exchange Points to ZL</DialogTitle>
        <DialogContent>
            <Typography variant="body2" sx={{ mb: 2 }}>
                Rate: {conversionRate} Points = 1 ZL
            </Typography>
            <TextField
                autoFocus
                margin="dense"
                label="Points to Exchange"
                type="number"
                fullWidth
                variant="outlined"
                value={exchangeAmount}
                onChange={(e) => setExchangeAmount(e.target.value)}
                helperText={exchangeAmount ? `You will get ${(parseFloat(exchangeAmount) / conversionRate).toFixed(2)} ZL` : ''}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') handleExchangeSubmit();
                }}
            />
            <Typography variant="caption" color="text.secondary">
                Available: {points} Points
            </Typography>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setOpenExchange(false)}>Cancel</Button>
            <Button onClick={handleExchangeAll} color="secondary">
                Exchange All ({points} P)
            </Button>
            <Button onClick={handleExchangeSubmit} variant="contained" color="primary">
                Exchange
            </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
