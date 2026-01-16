import { useState, useMemo } from 'react';
import { Box, Typography, Paper, ToggleButton, ToggleButtonGroup, useTheme } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useUserContext } from '../../contexts/UserContext';

type TimeRange = 'week' | '7days' | '30days' | '100days' | '300days';

const Statistics = () => {
  const { history } = useUserContext();
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState<TimeRange>('week');

  const chartData = useMemo(() => {
    const now = new Date();
    now.setHours(23, 59, 59, 999); // End of today

    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    if (timeRange === 'week') {
      // Get Monday of current week
      const day = startDate.getDay();
      const diff = startDate.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
      startDate.setDate(diff);
    } else if (timeRange === '7days') {
      startDate.setDate(startDate.getDate() - 6);
    } else if (timeRange === '30days') {
      startDate.setDate(startDate.getDate() - 29);
    } else if (timeRange === '100days') {
      startDate.setDate(startDate.getDate() - 99);
    } else if (timeRange === '300days') {
      startDate.setDate(startDate.getDate() - 299);
    }

    // Filter relevant history items
    const relevantItems = history.filter(item => {
      // Allow both exact match and startsWith for task rewards
      const isRandomReward = item.reason === 'Random Reward';
      const isTaskReward = item.reason.startsWith('Task Reward');
      
      if (!isRandomReward && !isTaskReward) return false;
      
      const itemDate = new Date(item.date);
      return itemDate >= startDate && itemDate <= now;
    });

    // Group by date
    const dailyCounts = new Map<string, number>();

    const getLocalDateKey = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    
    // Initialize all days in range with 0
    const currentDate = new Date(startDate);
    while (currentDate <= now) {
      const dateKey = getLocalDateKey(currentDate);
      dailyCounts.set(dateKey, 0);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Fill with data
    relevantItems.forEach(item => {
      const itemDate = new Date(item.date);
      const dateKey = getLocalDateKey(itemDate);
      if (dailyCounts.has(dateKey)) {
        const count = item.count || 1; // Default to 1 for backward compatibility
        dailyCounts.set(dateKey, (dailyCounts.get(dateKey) || 0) + count);
      }
    });

    // Convert to array
    return Array.from(dailyCounts.entries()).map(([date, count]) => ({
      date,
      displayDate: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      count
    }));
  }, [history, timeRange]);

  const handleRangeChange = (_event: React.MouseEvent<HTMLElement>, newRange: TimeRange | null) => {
    if (newRange !== null) {
      setTimeRange(newRange);
    }
  };

  return (
    <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>Statistics</Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h6">Random Rewards Received</Typography>
          <ToggleButtonGroup
            value={timeRange}
            exclusive
            onChange={handleRangeChange}
            aria-label="time range"
            size="small"
          >
            <ToggleButton value="week">This Week</ToggleButton>
            <ToggleButton value="7days">Last 7 Days</ToggleButton>
            <ToggleButton value="30days">Last 30 Days</ToggleButton>
            <ToggleButton value="100days">Last 100 Days</ToggleButton>
            <ToggleButton value="300days">Last 300 Days</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ height: 400, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="displayDate" 
                tick={{ fontSize: 12 }}
                interval={timeRange === '300days' || timeRange === '100days' ? 'preserveStartEnd' : 0}
              />
              <YAxis allowDecimals={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary }}
                itemStyle={{ color: theme.palette.primary.main }}
                formatter={(value: number) => [value, 'Rewards']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Bar dataKey="count" fill={theme.palette.primary.main}>
                {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={theme.palette.primary.main} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
        
        <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
                Total rewards in this period: {chartData.reduce((sum, item) => sum + item.count, 0)}
            </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Statistics;
