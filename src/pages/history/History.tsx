import { useUserContext, type HistoryItem } from '../../contexts/UserContext';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  Button, 
  Paper,
  Chip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import StarIcon from '@mui/icons-material/Star';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import { useMemo } from 'react';
import { formatDateTime } from '../../utils/dateUtils';

const History = () => {
  const { history, clearHistory } = useUserContext();

  const { todayItems, weekItems, allItems } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const todayItems: HistoryItem[] = [];
    const weekItems: HistoryItem[] = [];

    history.forEach(item => {
      const itemDate = new Date(item.date);
      // Normalize itemDate to compare dates properly for "Today"
      const itemDateOnly = new Date(itemDate);
      itemDateOnly.setHours(0, 0, 0, 0);

      if (itemDateOnly.getTime() === today.getTime()) {
        todayItems.push(item);
      } else if (itemDate > sevenDaysAgo) {
        weekItems.push(item);
      }
    });

    return { todayItems, weekItems, allItems: history };
  }, [history]);

  const renderHistoryList = (items: HistoryItem[]) => (
    <List>
      {items.length === 0 && (
        <ListItem>
          <ListItemText secondary="No history items" />
        </ListItem>
      )}
      {items.map((item) => (
        <ListItem key={item.id} divider>
          <ListItemAvatar>
            <Avatar sx={{ bgcolor: item.type === 'points' ? 'secondary.main' : item.type === 'balance' ? 'success.main' : 'info.main' }}>
              {item.type === 'points' ? <StarIcon /> : item.type === 'balance' ? <MonetizationOnIcon /> : <ShuffleIcon />}
            </Avatar>
          </ListItemAvatar>
          <ListItemText 
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography component="span" variant="body1">{item.reason}</Typography>
                {item.category && (
                  <Chip 
                    label={item.category} 
                    size="small" 
                    sx={{ height: 20, fontSize: '0.7rem' }} 
                  />
                )}
                {item.subcategory && (
                  <Chip 
                    label={item.subcategory} 
                    size="small" 
                    color="info"
                    variant="outlined"
                    sx={{ height: 20, fontSize: '0.7rem' }} 
                  />
                )}
                {item.isEssential !== undefined && (
                  <Chip
                    label={item.isEssential ? 'Essential' : 'Non-Essential'}
                    size="small"
                    color={item.isEssential ? 'success' : 'warning'}
                    variant="outlined"
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                )}
              </Box>
            }
            secondary={formatDateTime(item.date)} 
          />
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
             <Typography 
                variant="subtitle1" 
                sx={{ 
                    color: item.amount >= 0 ? 'success.main' : 'error.main',
                    fontWeight: 'bold'
                }}
            >
                {item.amount > 0 ? '+' : ''}{item.amount} {item.type === 'points' ? 'P' : item.type === 'balance' ? 'ZL' : 'RP'}
            </Typography>
          </Box>
        </ListItem>
      ))}
    </List>
  );

  return (
    <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">History</Typography>
        <Button 
            variant="outlined" 
            color="error" 
            startIcon={<DeleteSweepIcon />}
            onClick={clearHistory}
        >
            Clear Archive ({'>'}7 days)
        </Button>
      </Box>

      {/* Today Section */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <Typography variant="h6" gutterBottom>Today</Typography>
        {renderHistoryList(todayItems)}
      </Paper>

      {/* This Week Section */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <Typography variant="h6" gutterBottom>Last 7 Days (Previous)</Typography>
        {renderHistoryList(weekItems)}
      </Paper>

      {/* Archive Section */}
      <Accordion defaultExpanded={false}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Archive (All History)</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {renderHistoryList(allItems)}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default History;
