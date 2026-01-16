import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
} from '@mui/material';
import { ConfirmationDialog } from '../common/ConfirmationDialog';
import { useUserContext } from '../../contexts/UserContext';
import { formatDate } from '../../utils/dateUtils';

interface DailyAnketDialogProps {
  open: boolean;
  missingDays: Date[];
  currentDayIndex: number;
  onSubmit: (basicSpending: number, nonEssentialSpending: number) => void;
  onSkipAll: () => void;
  dayNumber?: number;
  totalDaysCount?: number;
}

export const DailyAnketDialog: React.FC<DailyAnketDialogProps> = ({
  open,
  missingDays,
  currentDayIndex,
  onSubmit,
  onSkipAll,
  dayNumber,
  totalDaysCount,
}) => {
  const { rewardSettings } = useUserContext();
  const [basicSpending, setBasicSpending] = useState<string>('');
  const [nonEssentialSpending, setNonEssentialSpending] = useState<string>('');
  const [skipAllConfirmOpen, setSkipAllConfirmOpen] = useState(false);

  const currentDay = missingDays[currentDayIndex];
  
  // UI Display values (supporting both static and shrinking list approaches)
  const displayTotal = totalDaysCount ?? missingDays.length;
  const displayCurrent = dayNumber ?? (currentDayIndex + 1);
  
  // Remaining days calculation compatible with both approaches
  const remainingDays = missingDays.length - currentDayIndex;

  const calculateDiscountedCost = (cost: number) => {
    const discount = rewardSettings.basicNecessityDiscount || 0;
    return cost * (1 - discount / 100);
  };

  const handleSubmit = () => {
    const basic = parseFloat(basicSpending) || 0;
    const nonEssential = parseFloat(nonEssentialSpending) || 0;
    onSubmit(basic, nonEssential);
    // Reset fields for next day
    setBasicSpending('');
    setNonEssentialSpending('');
  };

  const handleSkipAllClick = () => {
    setSkipAllConfirmOpen(true);
  };

  const handleConfirmSkipAll = () => {
    setSkipAllConfirmOpen(false);
    onSkipAll();
  };

  const basicValue = parseFloat(basicSpending) || 0;
  const nonEssentialValue = parseFloat(nonEssentialSpending) || 0;
  const discountedBasic = calculateDiscountedCost(basicValue);
  const totalDeduction = discountedBasic + nonEssentialValue;

  if (!currentDay) return null;

  return (
    <>
      <Dialog open={open} maxWidth="sm" fullWidth>
        <DialogTitle>
          Daily Spending Report
          {displayTotal > 1 && (
            <Typography variant="subtitle2" color="text.secondary">
              Day {displayCurrent} of {displayTotal}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            Please enter your spending for <strong>{formatDate(currentDay)}</strong>
          </Alert>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Basic Spending (ZL)"
              type="number"
              value={basicSpending}
              onChange={(e) => setBasicSpending(e.target.value)}
              fullWidth
              autoFocus
              helperText={
                basicValue > 0
                  ? `After ${rewardSettings.basicNecessityDiscount || 0}% discount: ${discountedBasic.toFixed(2)} ZL`
                  : 'Essential expenses (food, transport, etc.)'
              }
              inputProps={{ min: 0, step: 0.01 }}
            />

            <TextField
              label="Non-Essential Spending (ZL)"
              type="number"
              value={nonEssentialSpending}
              onChange={(e) => setNonEssentialSpending(e.target.value)}
              fullWidth
              helperText="Entertainment, snacks, etc. (no discount)"
              inputProps={{ min: 0, step: 0.01 }}
            />

            {(basicValue > 0 || nonEssentialValue > 0) && (
              <Alert severity="warning">
                Total deduction from balance: <strong>{totalDeduction.toFixed(2)} ZL</strong>
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
          <Box>
            {remainingDays > 1 && (
              <Button onClick={handleSkipAllClick} color="error" variant="outlined">
                Skip All ({remainingDays} days)
              </Button>
            )}
          </Box>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmationDialog
        open={skipAllConfirmOpen}
        title="Skip All Remaining Days?"
        content={`Are you sure you want to skip filling the daily anket for all ${remainingDays} remaining days? No spending will be recorded for these days.`}
        onConfirm={handleConfirmSkipAll}
        onClose={() => setSkipAllConfirmOpen(false)}
        confirmLabel="Skip All"
        confirmColor="error"
      />
    </>
  );
};
