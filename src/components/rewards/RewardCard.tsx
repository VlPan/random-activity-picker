import { Card, CardContent, Typography, IconButton, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Reward } from '../../models/reward';

interface RewardCardProps {
  reward: Reward;
  onEdit: (reward: Reward) => void;
  onDelete: (id: string) => void;
}

const RewardCard = ({ reward, onEdit, onDelete }: RewardCardProps) => {
  return (
    <Card
      sx={{
        minWidth: 150,
        border: '2px dashed #ccc',
        boxShadow: 'none',
        cursor: 'pointer',
        position: 'relative',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'scale(1.05)',
          borderColor: 'primary.main',
        },
      }}
    >
      <Box sx={{ position: 'absolute', top: 4, right: 4 }}>
        <IconButton size="small" onClick={() => onEdit(reward)}>
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={() => onDelete(reward.id)} color="error">
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>
      <CardContent sx={{ textAlign: 'center', pt: 4 }}>
        <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
          {reward.value}
        </Typography>
        <Typography color="text.secondary">
          {reward.currency}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default RewardCard;
