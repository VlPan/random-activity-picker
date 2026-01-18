import { Box, Typography, Slider, Paper, TextField, Divider, Stack, Button, List, ListItem, ListItemText, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useUserContext } from '../../contexts/UserContext';
import { useState } from 'react';

const Settings = () => {
  const { luckyNumber, setLuckyNumber, rewardSettings, updateRewardSettings } = useUserContext();
  const [newParamName, setNewParamName] = useState('');
  const [newParamDesc, setNewParamDesc] = useState('');

  const handleAddParameter = () => {
    if (newParamName.trim()) {
      const newParam = {
        id: crypto.randomUUID(),
        name: newParamName.trim(),
        description: newParamDesc.trim()
      };
      updateRewardSettings({
        ...rewardSettings,
        dailyReportParameters: [...(rewardSettings.dailyReportParameters || []), newParam]
      });
      setNewParamName('');
      setNewParamDesc('');
    }
  };

  const handleDeleteParameter = (id: string) => {
    updateRewardSettings({
      ...rewardSettings,
      dailyReportParameters: (rewardSettings.dailyReportParameters || []).filter(p => p.id !== id)
    });
  };

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

      <Paper sx={{ p: 4, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Discounts
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Set discounts for basic necessity bills.
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
            <Typography>Basic Necessity Discount: </Typography>
            <Box sx={{ width: 100 }}>
              <TextField
                type="number"
                size="small"
                value={rewardSettings.basicNecessityDiscount}
                onChange={(e) => {
                   const val = Number(e.target.value);
                   if (!isNaN(val) && val >= 0 && val <= 100) {
                     updateRewardSettings({
                       ...rewardSettings,
                       basicNecessityDiscount: val
                     });
                   }
                }}
                label="%"
                inputProps={{ min: 0, max: 100 }}
              />
            </Box>
        </Stack>
      </Paper>

      <Paper sx={{ p: 4, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Daily Report Configuration
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Add parameters to be tracked in your Daily Report. These will add Random Picks based on your input.
        </Typography>

        <List>
          {(rewardSettings.dailyReportParameters || []).map((param) => (
            <ListItem
              key={param.id}
              secondaryAction={
                <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteParameter(param.id)}>
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText
                primary={param.name}
                secondary={param.description}
              />
            </ListItem>
          ))}
        </List>

        <Box sx={{ display: 'flex', gap: 2, mt: 2, alignItems: 'flex-start' }}>
          <TextField
            label="Parameter Name"
            value={newParamName}
            onChange={(e) => setNewParamName(e.target.value)}
            size="small"
            sx={{ flex: 1 }}
          />
          <TextField
            label="Description (optional)"
            value={newParamDesc}
            onChange={(e) => setNewParamDesc(e.target.value)}
            size="small"
            sx={{ flex: 2 }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddParameter}
            disabled={!newParamName.trim()}
          >
            Add
          </Button>
        </Box>
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
