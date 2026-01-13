import { useState } from 'react';
import { Box, Button, Typography, Card, CardContent } from '@mui/material';
import CasinoIcon from '@mui/icons-material/Casino';
import type { Activity } from '../../models/activity';

interface RandomActivityPickerProps {
  activities: Activity[];
}

export const RandomActivityPicker = ({ activities }: RandomActivityPickerProps) => {
  const [pickedActivity, setPickedActivity] = useState<Activity | null>(null);

  const pickRandomActivity = () => {
    if (activities.length === 0) return;

    const totalPriority = activities.reduce((sum, activity) => sum + activity.priority, 0);
    let randomValue = Math.random() * totalPriority;

    for (const activity of activities) {
      randomValue -= activity.priority;
      if (randomValue < 0) {
        setPickedActivity(activity);
        return;
      }
    }
    
    // Fallback in case of rounding errors, though mathematically unlikely to reach here if logic is correct
    // and totalPriority > 0. If randomValue was exactly totalPriority (exclusive), loop finishes.
    // Math.random() is exclusive of 1, so randomValue < totalPriority.
    setPickedActivity(activities[activities.length - 1]);
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

      {pickedActivity && (
        <Card variant="outlined" sx={{ minWidth: 275, bgcolor: 'background.paper' }}>
          <CardContent>
            <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
              Selected Activity
            </Typography>
            <Typography variant="h5" component="div">
              {pickedActivity.displayName}
            </Typography>
            <Typography sx={{ mb: 1.5 }} color="text.secondary">
              Priority: {pickedActivity.priority}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};
