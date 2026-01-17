import { Box } from '@mui/material';
import type { ProjectStatus } from '../../models/project';

interface StatusIndicatorProps {
  status?: ProjectStatus;
  onClick?: (e: React.MouseEvent) => void;
  size?: number;
}

const getStatusColor = (status: ProjectStatus = 'unset') => {
  switch (status) {
    case 'green': return '#4caf50';
    case 'yellow': return '#ff9800';
    case 'red': return '#f44336';
    case 'unset': 
    default: return '#9e9e9e';
  }
};

const StatusIndicator = ({ status = 'unset', onClick, size = 16 }: StatusIndicatorProps) => {
  const color = getStatusColor(status);
  
  return (
    <Box
      onClick={onClick}
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `radial-gradient(circle at 30% 30%, ${color}, ${color} 60%, #000 100%)`,
        boxShadow: onClick ? '0 0 5px rgba(0,0,0,0.3)' : 'none',
        cursor: onClick ? 'pointer' : 'default',
        flexShrink: 0,
        transition: 'transform 0.2s',
        '&:hover': onClick ? {
          transform: 'scale(1.1)',
        } : {},
      }}
    />
  );
};

export default StatusIndicator;
