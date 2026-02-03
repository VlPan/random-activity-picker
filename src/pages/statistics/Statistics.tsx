import { useState, useMemo, useCallback } from 'react';
import { Box, Typography, Paper, ToggleButton, ToggleButtonGroup, useTheme, Card, CardContent } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend, AreaChart, Area } from 'recharts';
import { useUserContext } from '../../contexts/UserContext';
import { formatDate } from '../../utils/dateUtils';

type TimeRange = 'week' | '7days' | '30days' | '100days' | '300days';

const Statistics = () => {
  const { history, rewardSettings } = useUserContext();
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState<TimeRange>('week');

  const getStartDate = (range: TimeRange, endDate: Date) => {
    const startDate = new Date(endDate);
    startDate.setHours(0, 0, 0, 0);

    if (range === 'week') {
      const day = startDate.getDay();
      const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
      startDate.setDate(diff);
    } else if (range === '7days') {
      startDate.setDate(startDate.getDate() - 6);
    } else if (range === '30days') {
      startDate.setDate(startDate.getDate() - 29);
    } else if (range === '100days') {
      startDate.setDate(startDate.getDate() - 99);
    } else if (range === '300days') {
      startDate.setDate(startDate.getDate() - 299);
    }
    return startDate;
  };

  const focusTimeData = useMemo(() => {
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    const startDate = getStartDate(timeRange, now);

    const relevantItems = history.filter(item => {
      if (!item.reason.startsWith('Task Reward')) return false;
      const itemDate = new Date(item.date);
      return itemDate >= startDate && itemDate <= now;
    });

    const dailyStats = new Map<string, { duration: number }>();

    const getLocalDateKey = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    
    // Initialize days
    const currentDate = new Date(startDate);
    while (currentDate <= now) {
      const dateKey = getLocalDateKey(currentDate);
      dailyStats.set(dateKey, { duration: 0 });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    relevantItems.forEach(item => {
      if (!item.duration) return;
      const itemDate = new Date(item.date);
      const dateKey = getLocalDateKey(itemDate);
      if (dailyStats.has(dateKey)) {
        const stats = dailyStats.get(dateKey)!;
        stats.duration += item.duration;
      }
    });

    return Array.from(dailyStats.entries()).map(([date, stats]) => ({
      date,
      displayDate: formatDate(date),
      minutes: Math.round(stats.duration / 60)
    }));
  }, [history, timeRange]);

  const focusStats = useMemo(() => {
    const totalMinutes = focusTimeData.reduce((acc, curr) => acc + curr.minutes, 0);
    
    // Calculate days in range
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    const startDate = getStartDate(timeRange, now);
    const diffTime = Math.abs(now.getTime() - startDate.getTime());
    const daysInRange = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    const avgMinutes = daysInRange > 0 ? (totalMinutes / daysInRange) : 0;

    const formatTime = (totalMins: number) => {
      const hours = Math.floor(totalMins / 60);
      const mins = Math.round(totalMins % 60);
      if (hours > 0) return `${hours}h ${mins}m`;
      return `${mins}m`;
    };

    return {
      totalTime: formatTime(totalMinutes),
      avgTime: formatTime(avgMinutes)
    };
  }, [focusTimeData, timeRange]);

  const taskCompletionData = useMemo(() => {
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    const startDate = getStartDate(timeRange, now);

    const relevantItems = history.filter(item => {
      if (!item.reason.startsWith('Task Reward')) return false;
      const itemDate = new Date(item.date);
      return itemDate >= startDate && itemDate <= now;
    });

    const dailyStats = new Map<string, { count: number; points: number }>();

    const getLocalDateKey = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    
    // Initialize days
    const currentDate = new Date(startDate);
    while (currentDate <= now) {
      const dateKey = getLocalDateKey(currentDate);
      dailyStats.set(dateKey, { count: 0, points: 0 });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    relevantItems.forEach(item => {
      const itemDate = new Date(item.date);
      const dateKey = getLocalDateKey(itemDate);
      if (dailyStats.has(dateKey)) {
        const stats = dailyStats.get(dateKey)!;
        stats.count += 1; // Count 1 per task completion event
        stats.points += item.amount;
      }
    });

    return Array.from(dailyStats.entries()).map(([date, stats]) => ({
      date,
      displayDate: formatDate(date),
      count: stats.count,
      points: stats.points
    }));
  }, [history, timeRange]);

  const productivityStats = useMemo(() => {
    const totalTasks = taskCompletionData.reduce((acc, curr) => acc + curr.count, 0);
    const totalPoints = taskCompletionData.reduce((acc, curr) => acc + curr.points, 0);
    
    // Calculate days in range
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    const startDate = getStartDate(timeRange, now);
    // Difference in days + 1
    const diffTime = Math.abs(now.getTime() - startDate.getTime());
    const daysInRange = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    // Note: getStartDate sets time to 00:00:00. now is 23:59:59.
    // So diff is close to X.99 days. Ceil should give X+1? 
    // Example: Today (Mon) 00:00 to Today 23:59. Diff ~24h. Ceil(1) = 1. Correct.
    // Example: Mon 00:00 to Tue 23:59. Diff ~48h. Ceil(2) = 2. Correct.
    
    const avgTasks = daysInRange > 0 ? (totalTasks / daysInRange) : 0;

    return {
      totalTasks,
      totalPoints,
      avgTasks: avgTasks.toFixed(1)
    };
  }, [taskCompletionData, timeRange]);

  const pointsGrowthData = useMemo(() => {
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    const startDate = getStartDate(timeRange, now);

    // 1. Calculate initial total points before startDate
    const initialTotal = history
      .filter(item => {
        if (item.type !== 'points') return false;
        if (item.amount <= 0) return false;
        const itemDate = new Date(item.date);
        return itemDate < startDate;
      })
      .reduce((sum, item) => sum + item.amount, 0);

    // 2. Get relevant items within range
    const relevantItems = history
      .filter(item => {
        if (item.type !== 'points') return false;
        if (item.amount <= 0) return false;
        const itemDate = new Date(item.date);
        return itemDate >= startDate && itemDate <= now;
      });

    // 3. Create daily map
    const dailyPointsChange = new Map<string, number>();

    const getLocalDateKey = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Initialize days
    const currentDate = new Date(startDate);
    while (currentDate <= now) {
      const dateKey = getLocalDateKey(currentDate);
      dailyPointsChange.set(dateKey, 0);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Fill daily changes
    relevantItems.forEach(item => {
        const itemDate = new Date(item.date);
        const dateKey = getLocalDateKey(itemDate);
        if (dailyPointsChange.has(dateKey)) {
            const currentVal = dailyPointsChange.get(dateKey)!;
            dailyPointsChange.set(dateKey, currentVal + item.amount);
        }
    });

    // 4. Build cumulative data
    let runningTotal = initialTotal;
    const result: { date: string; displayDate: string; totalPoints: number }[] = [];
    
    // Iterate through map keys in order
    for (const [date, change] of dailyPointsChange) {
        runningTotal += change;
        result.push({
            date,
            displayDate: formatDate(date),
            totalPoints: runningTotal
        });
    }

    return result;
  }, [history, timeRange]);

  // Get set of active parameter names from settings
  const activeParameterNames = useMemo(() => {
    return new Set((rewardSettings.dailyReportParameters || []).map(p => p.name));
  }, [rewardSettings.dailyReportParameters]);

  // Map parameter name to display name (use "Other" if not in active settings)
  const mapParameterName = useCallback((name: string): string => {
    if (name === 'Tasks') return 'Tasks';
    // If parameter is not in active settings, map to "Other"
    if (!activeParameterNames.has(name)) return 'Other';
    return name;
  }, [activeParameterNames]);

  // Get all unique RP source categories from history
  const rpSourceCategories = useMemo(() => {
    const categories = new Set<string>();
    history.forEach(item => {
      if (item.type === 'randomPicks' && item.amount > 0) {
        if (item.category === 'Tasks') {
          categories.add('Tasks');
        } else if (item.category === 'Daily Report' && item.subcategory) {
          // Map to "Other" if parameter is not in active settings
          const mappedName = mapParameterName(item.subcategory);
          categories.add(mappedName);
        }
      }
    });
    // Always include Tasks first, then sort Daily Report parameters (with "Other" last)
    const result: string[] = [];
    if (categories.has('Tasks')) {
      result.push('Tasks');
      categories.delete('Tasks');
    }
    const otherCategories = Array.from(categories);
    const otherIndex = otherCategories.indexOf('Other');
    if (otherIndex !== -1) {
      otherCategories.splice(otherIndex, 1);
      otherCategories.sort();
      result.push(...otherCategories);
      result.push('Other'); // Always put "Other" at the end
    } else {
      result.push(...otherCategories.sort());
    }
    return result;
  }, [history, activeParameterNames, mapParameterName]);

  // Distinct colors palette for RP sources
  const RP_COLORS_PALETTE = [
    '#9c27b0', // Purple (for Tasks)
    '#2196f3', // Blue
    '#4caf50', // Green
    '#ff9800', // Orange
    '#e91e63', // Pink
    '#00bcd4', // Cyan
    '#ff5722', // Deep Orange
    '#3f51b5', // Indigo
    '#009688', // Teal
    '#cddc39', // Lime
    '#795548', // Brown
    '#607d8b', // Blue Grey
  ];
  
  // Map categories to colors based on their index for consistent distinct colors
  const rpSourceColorMap = useMemo(() => {
    const colorMap: Record<string, string> = {};
    rpSourceCategories.forEach((cat, index) => {
      colorMap[cat] = RP_COLORS_PALETTE[index % RP_COLORS_PALETTE.length];
    });
    return colorMap;
  }, [rpSourceCategories]);

  const getSourceColor = (source: string): string => {
    // Always use grey for "Other"
    if (source === 'Other') return '#9e9e9e';
    return rpSourceColorMap[source] || '#9e9e9e';
  };

  const rpReceivedData = useMemo(() => {
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    const startDate = getStartDate(timeRange, now);

    // Filter for randomPicks type with positive amounts (RPs received, not spent)
    const relevantItems = history.filter(item => {
      if (item.type !== 'randomPicks') return false;
      if (item.amount <= 0) return false;
      
      const itemDate = new Date(item.date);
      return itemDate >= startDate && itemDate <= now;
    });

    const getLocalDateKey = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // Initialize all days with 0 for each category
    const dailyStats = new Map<string, Record<string, number>>();
    const currentDate = new Date(startDate);
    while (currentDate <= now) {
      const dateKey = getLocalDateKey(currentDate);
      const dayStats: Record<string, number> = {};
      rpSourceCategories.forEach(cat => {
        dayStats[cat] = 0;
      });
      dailyStats.set(dateKey, dayStats);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Fill with data
    relevantItems.forEach(item => {
      const itemDate = new Date(item.date);
      const dateKey = getLocalDateKey(itemDate);
      if (dailyStats.has(dateKey)) {
        const stats = dailyStats.get(dateKey)!;
        let sourceKey = 'Other';
        
        if (item.category === 'Tasks') {
          sourceKey = 'Tasks';
        } else if (item.category === 'Daily Report' && item.subcategory) {
          // Map to "Other" if parameter is not in active settings
          sourceKey = mapParameterName(item.subcategory);
        }
        
        if (stats[sourceKey] !== undefined) {
          stats[sourceKey] += item.amount;
        }
      }
    });

    // Convert to array format for recharts
    return Array.from(dailyStats.entries()).map(([date, stats]) => ({
      date,
      displayDate: formatDate(date),
      ...stats
    }));
  }, [history, timeRange, rpSourceCategories, mapParameterName]);

  const rpReceivedStats = useMemo(() => {
    // Calculate total RPs and per-category totals
    const categoryTotals: Record<string, number> = {};
    rpSourceCategories.forEach(cat => {
      categoryTotals[cat] = 0;
    });

    rpReceivedData.forEach(day => {
      rpSourceCategories.forEach(cat => {
        const value = (day as Record<string, unknown>)[cat];
        if (typeof value === 'number') {
          categoryTotals[cat] += value;
        }
      });
    });

    const totalRPs = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
    
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    const startDate = getStartDate(timeRange, now);
    const diffTime = Math.abs(now.getTime() - startDate.getTime());
    const daysInRange = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const avgRPs = daysInRange > 0 ? (totalRPs / daysInRange) : 0;

    return {
      totalRPs,
      avgRPs: avgRPs.toFixed(1),
      categoryTotals
    };
  }, [rpReceivedData, rpSourceCategories, timeRange, activeParameterNames]);

  const financialData = useMemo(() => {
    const now = new Date();
    now.setHours(23, 59, 59, 999);

    const startDate = getStartDate(timeRange, now);

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
      displayDate: formatDate(date),
      income: Number(stats.income.toFixed(2)),
      expense: Number(stats.expense.toFixed(2))
    }));
  }, [history, timeRange]);

  const spendingData = useMemo(() => {
    const now = new Date();
    now.setHours(23, 59, 59, 999);

    const startDate = getStartDate(timeRange, now);

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
      Manual: 0,
      Anket: 0,
      Other: 0
    };

    expenses.forEach(item => {
      const amount = Math.abs(item.amount);
      const category = item.category;

      if (category) {
        if (category === 'Shop') categories.Shop += amount;
        else if (category === 'Bill') categories.Bills += amount;
        else if (category === 'Manual') categories.Manual += amount;
        else if (category === 'Anket') categories.Anket += amount;
        else categories.Other += amount;
      } else {
        // Legacy fallback
        const reason = item.reason || '';
        if (reason.includes('Bought')) {
          categories.Shop += amount;
        } else if (reason.includes('Bill') || reason.includes('Paid')) {
          categories.Bills += amount;
        } else {
          categories.Other += amount;
        }
      }
    });

    return [
      { name: 'Shop', value: Number(categories.Shop.toFixed(2)) },
      { name: 'Bills', value: Number(categories.Bills.toFixed(2)) },
      { name: 'Manual', value: Number(categories.Manual.toFixed(2)) },
      { name: 'Anket', value: Number(categories.Anket.toFixed(2)) },
      { name: 'Other', value: Number(categories.Other.toFixed(2)) }
    ].filter(item => item.value > 0);
  }, [history, timeRange]);

  const essentialData = useMemo(() => {
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    const startDate = getStartDate(timeRange, now);

    // Filter relevant history items (expenses only)
    const expenses = history.filter(item => {
      if (item.type !== 'balance') return false;
      if (item.amount >= 0) return false;
      
      const itemDate = new Date(item.date);
      return itemDate >= startDate && itemDate <= now;
    });

    let essential = 0;
    let nonEssential = 0;
    let unknown = 0;

    expenses.forEach(item => {
      const amount = Math.abs(item.amount);
      if (item.isEssential === true) {
        essential += amount;
      } else if (item.isEssential === false) {
        nonEssential += amount;
      } else {
        unknown += amount;
      }
    });

    return [
      { name: 'Essential', value: Number(essential.toFixed(2)) },
      { name: 'Non-Essential', value: Number(nonEssential.toFixed(2)) },
      { name: 'Unknown', value: Number(unknown.toFixed(2)) }
    ].filter(item => item.value > 0);
  }, [history, timeRange]);

  const incomeSourceData = useMemo(() => {
    const now = new Date();
    now.setHours(23, 59, 59, 999);

    const startDate = getStartDate(timeRange, now);

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
      Projects: 0,
      Other: 0
    };

    incomeItems.forEach(item => {
      const amount = item.amount;
      const reason = item.reason || '';
      
      if (item.category === 'Project' || reason.startsWith('Project:')) {
        categories.Projects += amount;
      } else if (reason.includes('Task Reward')) {
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
      { name: 'Projects', value: Number(categories.Projects.toFixed(2)) },
      { name: 'Tasks', value: Number(categories.TaskRewards.toFixed(2)) },
      { name: 'Randoms', value: Number(categories.RandomRewards.toFixed(2)) },
      { name: 'Exchange', value: Number(categories.Exchange.toFixed(2)) },
      { name: 'Other', value: Number(categories.Other.toFixed(2)) }
    ].filter(item => item.value > 0);
  }, [history, timeRange]);

  const SPENDING_COLORS = {
    Shop: '#1976d2',
    Bills: '#ed6c02',
    Manual: '#d32f2f',
    Anket: '#9c27b0',
    Other: '#9e9e9e'
  };

  const ESSENTIAL_COLORS = {
    'Essential': '#2e7d32',
    'Non-Essential': '#d32f2f',
    'Unknown': '#9e9e9e'
  };

  const INCOME_COLORS = {
    'Projects': '#2196f3',
    'Tasks': '#9c27b0',
    'Randoms': '#2e7d32',
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Statistics</Typography>
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

      {/* Random Picks Received Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Random Picks Received</Typography>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 3 }}>
            <Card elevation={2} sx={{ flex: 1, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f5f5f5' }}>
                <CardContent>
                    <Typography color="text.secondary" gutterBottom>Total RPs Received</Typography>
                    <Typography variant="h4">{rpReceivedStats.totalRPs}</Typography>
                </CardContent>
            </Card>
            <Card elevation={2} sx={{ flex: 1, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f5f5f5' }}>
                <CardContent>
                    <Typography color="text.secondary" gutterBottom>Avg RPs / Day</Typography>
                    <Typography variant="h4">{rpReceivedStats.avgRPs}</Typography>
                </CardContent>
            </Card>
            {rpSourceCategories.slice(0, 3).map(cat => (
              <Card key={cat} elevation={2} sx={{ flex: 1, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f5f5f5' }}>
                <CardContent>
                    <Typography color="text.secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: getSourceColor(cat) }} />
                      {cat}
                    </Typography>
                    <Typography variant="h4">{rpReceivedStats.categoryTotals[cat] || 0}</Typography>
                </CardContent>
              </Card>
            ))}
        </Box>

        <Box sx={{ height: 400, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rpReceivedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="displayDate" 
                tick={{ fontSize: 12 }}
                interval={timeRange === 'week' || timeRange === '7days' ? 0 : 'preserveStartEnd'}
              />
              <YAxis allowDecimals={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary }}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend />
              {rpSourceCategories.map(cat => (
                <Bar 
                  key={cat}
                  dataKey={cat} 
                  name={cat}
                  stackId="rp"
                  fill={getSourceColor(cat)} 
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      {/* Focus Time Overview */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Focus Time Overview</Typography>
        
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 3 }}>
            <Card elevation={2} sx={{ flex: 1, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f5f5f5' }}>
                <CardContent>
                    <Typography color="text.secondary" gutterBottom>Total Focus Time</Typography>
                    <Typography variant="h4">{focusStats.totalTime}</Typography>
                </CardContent>
            </Card>
            <Card elevation={2} sx={{ flex: 1, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f5f5f5' }}>
                <CardContent>
                    <Typography color="text.secondary" gutterBottom>Avg Focus Time / Day</Typography>
                    <Typography variant="h4">{focusStats.avgTime}</Typography>
                </CardContent>
            </Card>
        </Box>

        <Box sx={{ height: 400, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={focusTimeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="displayDate" 
                tick={{ fontSize: 12 }}
                interval={timeRange === 'week' || timeRange === '7days' ? 0 : 'preserveStartEnd'}
              />
              <YAxis allowDecimals={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary }}
                itemStyle={{ color: '#7b1fa2' }}
                formatter={(value: number | undefined) => [`${value} min`, 'Focus Time']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Bar dataKey="minutes" fill="#7b1fa2">
                {focusTimeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill="#7b1fa2" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      {/* Task Completion Overview */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Task Completion Overview</Typography>
        
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 3 }}>
            <Card elevation={2} sx={{ flex: 1, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f5f5f5' }}>
                <CardContent>
                    <Typography color="text.secondary" gutterBottom>Total Tasks Completed</Typography>
                    <Typography variant="h4">{productivityStats.totalTasks}</Typography>
                </CardContent>
            </Card>
            <Card elevation={2} sx={{ flex: 1, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f5f5f5' }}>
                <CardContent>
                    <Typography color="text.secondary" gutterBottom>Avg Tasks / Day</Typography>
                    <Typography variant="h4">{productivityStats.avgTasks}</Typography>
                </CardContent>
            </Card>
            <Card elevation={2} sx={{ flex: 1, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f5f5f5' }}>
                <CardContent>
                    <Typography color="text.secondary" gutterBottom>Total Points Earned</Typography>
                    <Typography variant="h4">{productivityStats.totalPoints}</Typography>
                </CardContent>
            </Card>
        </Box>

        <Box sx={{ height: 400, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={taskCompletionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="displayDate" 
                tick={{ fontSize: 12 }}
                interval={timeRange === 'week' || timeRange === '7days' ? 0 : 'preserveStartEnd'}
              />
              <YAxis allowDecimals={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary }}
                itemStyle={{ color: '#0288d1' }}
                formatter={(value: number | undefined) => [value, 'Tasks']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Bar dataKey="count" fill="#0288d1">
                {taskCompletionData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill="#0288d1" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      {/* Points Growth Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Total Points History (XP Curve)</Typography>
        <Box sx={{ height: 400, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={pointsGrowthData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9c27b0" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#9c27b0" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="displayDate" 
                tick={{ fontSize: 12 }}
                interval={timeRange === 'week' || timeRange === '7days' ? 0 : 'preserveStartEnd'}
              />
              <YAxis />
              <Tooltip 
                contentStyle={{ backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary }}
                itemStyle={{ color: '#9c27b0' }}
                formatter={(value: number | undefined) => [value, 'Total Points']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Area 
                type="monotone" 
                dataKey="totalPoints" 
                stroke="#9c27b0" 
                fillOpacity={1} 
                fill="url(#colorPoints)" 
              />
            </AreaChart>
          </ResponsiveContainer>
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
                interval={timeRange === 'week' || timeRange === '7days' ? 0 : 'preserveStartEnd'}
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

      {/* Essential vs Non-Essential Breakdown */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Essential vs Non-Essential Spending</Typography>
        
        {essentialData.length > 0 ? (
          <Box sx={{ height: 400, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={essentialData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: { name?: string | number; percent?: number }) => `${name} ${(percent ? percent * 100 : 0).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {essentialData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={ESSENTIAL_COLORS[entry.name as keyof typeof ESSENTIAL_COLORS]} />
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
  );
};

export default Statistics;
