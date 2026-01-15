import { useState } from 'react';
import type { ReactNode } from 'react';
import { Paper, Box, IconButton, Typography, Collapse, useTheme } from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useLayoutContext } from '../../contexts/LayoutContext';

interface FloatingPanelProps {
  title: string;
  children: ReactNode;
  defaultExpanded?: boolean;
  width?: number | string;
}

export const FloatingPanel = ({ title, children, defaultExpanded = true, width = 300 }: FloatingPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const { sidebarWidth, isSidebarOpen } = useLayoutContext();
  const theme = useTheme();

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'fixed',
        bottom: 20,
        left: sidebarWidth + 24,
        zIndex: 1000,
        width: width,
        maxHeight: '50vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: theme.transitions.create('left', {
          easing: theme.transitions.easing.sharp,
          duration: isSidebarOpen
            ? theme.transitions.duration.enteringScreen
            : theme.transitions.duration.leavingScreen,
        }),
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
