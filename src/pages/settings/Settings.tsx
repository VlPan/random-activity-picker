import { Box, Typography, Slider, Paper, TextField, Divider, Stack } from '@mui/material';
import { useUserContext } from '../../contexts/UserContext';

const Settings = () => {
  const { luckyNumber, setLuckyNumber, rewardSettings, updateRewardSettings } = useUserContext();

  const handleSliderChange = (_event: Event, newValue: number | number[]) => {
    setLuckyNumber(newValue as number);
  };

  const handleChange = (field: keyof typeof rewardSettings) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(event.target.value);
    if (!isNaN(val) && val >= 0) {
      updateRewardSettings({
        ...rewardSettings,
        [field]: val
      });
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '800px', mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Settings
      </Typography>

      <Paper sx={{ p: 4, mb: 3 }}>
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
            step={0.1}
            marks
            valueLabelDisplay="on"
          />
        </Box>
      </Paper>

      <Paper sx={{ p: 4, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Currency Conversion
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Set the exchange rate between Points and ZL.
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
            <Typography>1 ZL = </Typography>
            <Box sx={{ width: 100 }}>
              <TextField
                type="number"
                size="small"
                value={rewardSettings.conversionRate}
                onChange={handleChange('conversionRate')}
                label="Points"
              />
            </Box>
            <Typography>Points</Typography>
        </Stack>
      </Paper>

      <Paper sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom>
          Reward Formulas
        </Typography>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>Min Rewards</Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography>For every</Typography>
            <Box sx={{ width: 100 }}>
              <TextField
                type="number"
                size="small"
                value={rewardSettings.minTimeBlock}
                onChange={handleChange('minTimeBlock')}
                label="Minutes"
              />
            </Box>
            <Typography>Getting</Typography>
            <Box sx={{ width: 100 }}>
              <TextField
                type="number"
                size="small"
                value={rewardSettings.minPoints}
                onChange={handleChange('minPoints')}
                label="Points"
              />
            </Box>
          </Stack>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>Max Rewards</Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography>For every</Typography>
            <Box sx={{ width: 100 }}>
              <TextField
                type="number"
                size="small"
                value={rewardSettings.maxTimeBlock}
                onChange={handleChange('maxTimeBlock')}
                label="Minutes"
              />
            </Box>
            <Typography>Getting</Typography>
            <Box sx={{ width: 100 }}>
              <TextField
                type="number"
                size="small"
                value={rewardSettings.maxPoints}
                onChange={handleChange('maxPoints')}
                label="Points"
              />
            </Box>
          </Stack>
          
          <Box sx={{ mt: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center">
                <Typography>If task runs long - reward every</Typography>
                <Box sx={{ width: 100 }}>
                <TextField
                    type="number"
                    size="small"
                    value={rewardSettings.progressiveInterval}
                    onChange={handleChange('progressiveInterval')}
                    label="Minutes"
                />
                </Box>
            </Stack>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Settings;
