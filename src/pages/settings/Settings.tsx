import { Box, Typography, Slider, Paper } from '@mui/material';
import { useUserContext } from '../../contexts/UserContext';

const Settings = () => {
  const { luckyNumber, setLuckyNumber } = useUserContext();

  const handleSliderChange = (_event: Event, newValue: number | number[]) => {
    setLuckyNumber(newValue as number);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '800px', mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Settings
      </Typography>

      <Paper sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom>
          Lucky Number
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Adjust your lucky number multiplier.
        </Typography>

        <Box sx={{ px: 2 }}>
          <Slider
            value={luckyNumber}
            onChange={handleSliderChange}
            min={0.5}
            max={5}
            step={0.5}
            marks
            valueLabelDisplay="on"
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default Settings;
