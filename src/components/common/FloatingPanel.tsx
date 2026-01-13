import { useState } from 'react';
import type { ReactNode } from 'react';
import { Paper, Box, IconButton, Typography, Collapse } from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface FloatingPanelProps {
  title: string;
  children: ReactNode;
  defaultExpanded?: boolean;
}

export const FloatingPanel = ({ title, children, defaultExpanded = true }: FloatingPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'fixed',
        bottom: 20,
        left: 20,
        zIndex: 1000,
        width: 300,
        maxHeight: '50vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          p: 1,
          px: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Typography variant="subtitle2" fontWeight="bold">
          {title}
        </Typography>
        <IconButton size="small" sx={{ color: 'inherit', p: 0.5 }}>
          {isExpanded ? <ExpandMoreIcon fontSize="small" /> : <ExpandLessIcon fontSize="small" />}
        </IconButton>
      </Box>
      <Collapse in={isExpanded}>
        <Box sx={{ p: 0, maxHeight: 'calc(50vh - 40px)', overflowY: 'auto' }}>
          {children}
        </Box>
      </Collapse>
    </Paper>
  );
};
