import { Box, Button } from '@mui/material';
import CasinoIcon from '@mui/icons-material/Casino';
import type { Activity } from '../../models/activity';

interface RandomActivityPickerProps {
  activities: Activity[];
  onActivityPicked?: (activity: Activity) => void;
}

export const RandomActivityPicker = ({ activities, onActivityPicked }: RandomActivityPickerProps) => {

  const pickRandomActivity = () => {
    if (activities.length === 0) return;

    const totalPriority = activities.reduce((sum, activity) => sum + activity.priority, 0);
    let randomValue = Math.random() * totalPriority;

    for (const activity of activities) {
      randomValue -= activity.priority;
      if (randomValue < 0) {
        onActivityPicked?.(activity);
        return;
      }
    }
    
    // Fallback in case of rounding errors, though mathematically unlikely to reach here if logic is correct
    // and totalPriority > 0. If randomValue was exactly totalPriority (exclusive), loop finishes.
    // Math.random() is exclusive of 1, so randomValue < totalPriority.
    const lastActivity = activities[activities.length - 1];
    onActivityPicked?.(lastActivity);
  };

  return (
    <Box sx={{ my: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
      <Button 
        variant="contained" 
        color="secondary" 
        startIcon={<CasinoIcon />}
        onClick={pickRandomActivity}
        disabled={activities.length === 0}
      >
        Pick Random Activity
      </Button>
    </Box>
  );
};
