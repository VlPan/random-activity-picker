import { useState, useMemo } from 'react';
import { Box, Typography, Paper, ToggleButton, ToggleButtonGroup, useTheme } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
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

  const financialData = useMemo(() => {
    const now = new Date();
    now.setHours(23, 59, 59, 999);

    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    if (timeRange === 'week') {
      const day = startDate.getDay();
      const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
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
      if (item.type !== 'balance') return false;
      const itemDate = new Date(item.date);
      return itemDate >= startDate && itemDate <= now;
    });

    // Group by date
    const dailyStats = new Map<string, { income: number; expense: number }>();

    const getLocalDateKey = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // Initialize all days
    const currentDate = new Date(startDate);
    while (currentDate <= now) {
      const dateKey = getLocalDateKey(currentDate);
      dailyStats.set(dateKey, { income: 0, expense: 0 });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Fill with data
    relevantItems.forEach(item => {
      const itemDate = new Date(item.date);
      const dateKey = getLocalDateKey(itemDate);
      if (dailyStats.has(dateKey)) {
        const stats = dailyStats.get(dateKey)!;
        if (item.amount > 0) {
          stats.income += item.amount;
        } else {
          stats.expense += Math.abs(item.amount);
        }
      }
    });

    return Array.from(dailyStats.entries()).map(([date, stats]) => ({
      date,
      displayDate: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      income: Number(stats.income.toFixed(2)),
      expense: Number(stats.expense.toFixed(2))
    }));
  }, [history, timeRange]);

  const spendingData = useMemo(() => {
    const now = new Date();
    now.setHours(23, 59, 59, 999);

    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    if (timeRange === 'week') {
      const day = startDate.getDay();
      const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
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

    // Filter relevant history items (expenses only)
    const expenses = history.filter(item => {
      if (item.type !== 'balance') return false;
      if (item.amount >= 0) return false;
      
      const itemDate = new Date(item.date);
      return itemDate >= startDate && itemDate <= now;
    });

    const categories = {
      Shop: 0,
      Bills: 0,
      Other: 0
    };

    expenses.forEach(item => {
      const amount = Math.abs(item.amount);
      const reason = item.reason || '';
      
      if (reason.includes('Bought')) {
        categories.Shop += amount;
      } else if (reason.includes('Bill') || reason.includes('Paid')) {
        categories.Bills += amount;
      } else {
        categories.Other += amount;
      }
    });

    return [
      { name: 'Shop', value: Number(categories.Shop.toFixed(2)) },
      { name: 'Bills', value: Number(categories.Bills.toFixed(2)) },
      { name: 'Other', value: Number(categories.Other.toFixed(2)) }
    ].filter(item => item.value > 0);
  }, [history, timeRange]);

  const incomeSourceData = useMemo(() => {
    const now = new Date();
    now.setHours(23, 59, 59, 999);

    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    if (timeRange === 'week') {
      const day = startDate.getDay();
      const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
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

    // Filter relevant history items (income only, points only)
    const incomeItems = history.filter(item => {
      if (item.amount <= 0) return false;
      if (item.type !== 'points') return false;
      
      const itemDate = new Date(item.date);
      return itemDate >= startDate && itemDate <= now;
    });

    const categories = {
      TaskRewards: 0,
      RandomRewards: 0,
      Exchange: 0,
      Other: 0
    };

    incomeItems.forEach(item => {
      const amount = item.amount;
      const reason = item.reason || '';
      
      if (reason.includes('Task Reward')) {
        categories.TaskRewards += amount;
      } else if (reason === 'Random Reward') {
        categories.RandomRewards += amount;
      } else if (reason.includes('Exchange') || reason.includes('Currency')) {
        categories.Exchange += amount;
      } else {
        categories.Other += amount;
      }
    });

    return [
      { name: 'Task Rewards', value: Number(categories.TaskRewards.toFixed(2)) },
      { name: 'Random Rewards', value: Number(categories.RandomRewards.toFixed(2)) },
      { name: 'Exchange', value: Number(categories.Exchange.toFixed(2)) },
      { name: 'Other', value: Number(categories.Other.toFixed(2)) }
    ].filter(item => item.value > 0);
  }, [history, timeRange]);

  const SPENDING_COLORS = {
    Shop: '#1976d2',
    Bills: '#ed6c02',
    Other: '#9e9e9e'
  };

  const INCOME_COLORS = {
    'Task Rewards': '#9c27b0',
    'Random Rewards': '#2e7d32',
    'Exchange': '#ff9800',
    'Other': '#607d8b'
  };

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
                formatter={(value: number | undefined) => [value, 'Rewards']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Bar dataKey="count" fill={theme.palette.primary.main}>
                {chartData.map((_, index) => (
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

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Income vs Expenses (ZL)</Typography>
        </Box>

        <Box sx={{ height: 400, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={financialData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="displayDate" 
                tick={{ fontSize: 12 }}
                interval={timeRange === '300days' || timeRange === '100days' ? 'preserveStartEnd' : 0}
              />
              <YAxis allowDecimals={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary }}
                formatter={(value: number | undefined) => [`${value} ZL`, undefined]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Bar dataKey="income" name="Income" fill="#2e7d32" />
              <Bar dataKey="expense" name="Expense" fill="#d32f2f" />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Net Change: {(financialData.reduce((sum, item) => sum + item.income - item.expense, 0)).toFixed(2)} ZL
          </Typography>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 3 }}>
        {/* Income Breakdown */}
        <Paper sx={{ p: 3, flex: 1 }}>
          <Typography variant="h6" gutterBottom>Income Sources</Typography>
          
          {incomeSourceData.length > 0 ? (
            <Box sx={{ height: 400, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incomeSourceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: { name?: string | number; percent?: number }) => `${name} ${(percent ? percent * 100 : 0).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {incomeSourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={INCOME_COLORS[entry.name as keyof typeof INCOME_COLORS]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number | undefined) => {
                     return [`${value} Pts`, undefined];
                  }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          ) : (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">No income in this period</Typography>
            </Box>
          )}
        </Paper>

        {/* Spending Breakdown */}
        <Paper sx={{ p: 3, flex: 1 }}>
          <Typography variant="h6" gutterBottom>Spending Breakdown</Typography>
          
          {spendingData.length > 0 ? (
            <Box sx={{ height: 400, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={spendingData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: { name?: string | number; percent?: number }) => `${name} ${(percent ? percent * 100 : 0).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {spendingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={SPENDING_COLORS[entry.name as keyof typeof SPENDING_COLORS]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number | undefined) => [`${value} ZL`, undefined]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          ) : (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">No expenses in this period</Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default Statistics;
