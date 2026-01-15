import { useState } from 'react';
import { Box, Typography, Button, Grid, CircularProgress, Alert } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { useRewardContext } from '../../contexts/RewardContext';
import RewardCard from '../../components/rewards/RewardCard';
import RewardDialog from '../../components/rewards/RewardDialog';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { UserBalance } from '../../components/inventory/UserBalance';
import type { Reward } from '../../models/reward';

const Inventory = () => {
  const { rewards, loading, error, addReward, updateReward, deleteReward } = useRewardContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | undefined>(undefined);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAddClick = () => {
    setEditingReward(undefined);
    setIsDialogOpen(true);
  };

  const handleEditClick = (reward: Reward) => {
    setEditingReward(reward);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      deleteReward(deleteId);
      setDeleteId(null);
    }
  };

  const handleSaveReward = (reward: Reward) => {
    if (editingReward) {
      updateReward(reward);
    } else {
      addReward(reward);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '1400px', mx: 'auto' }}>
      <UserBalance />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Rewards</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
        >
          Add Reward
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {Array.from(rewards.values())
            .sort((a, b) => a.value - b.value)
            .map((reward) => (
              <Grid key={reward.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <RewardCard
                  reward={reward}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                />
              </Grid>
            ))}
          {rewards.size === 0 && (
            <Grid size={{ xs: 12 }}>
              <Typography color="text.secondary" align="center">
                No rewards configured. Click "Add Reward" to create one.
              </Typography>
            </Grid>
          )}
        </Grid>
      )}

      <RewardDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveReward}
        reward={editingReward}
      />

      <ConfirmationDialog
        open={!!deleteId}
        title="Delete Reward"
        content="Are you sure you want to delete this reward? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteId(null)}
        confirmLabel="Delete"
        confirmColor="error"
      />
    </Box>
  );
};

export default Inventory;
