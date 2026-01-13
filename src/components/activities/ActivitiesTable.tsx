import { useState } from 'react';
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import { useActivityContext } from '../../contexts/ActivityContext';
import type { Activity } from '../../models/activity';
import { DataTable } from '../common/DataTable';
import { ConfirmationDialog } from '../common/ConfirmationDialog';
import type { ColumnDef } from '../common/DataTable';

interface ActivitiesTableProps {
  activities: Activity[];
  showPlaylistColumn?: boolean;
}

export const ActivitiesTable = ({ activities, showPlaylistColumn = false }: ActivitiesTableProps) => {
  const { deleteActivity, playlists } = useActivityContext();
  
  // State for the menu
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  
  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, activity: Activity) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedActivity(activity);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedActivity(null);
  };

  const handleEdit = () => {
    // Placeholder for edit
    console.log('Edit activity:', selectedActivity);
    handleMenuClose();
  };

  const handleViewDetails = () => {
    // Placeholder for view details
    console.log('View details for activity:', selectedActivity);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    // Close menu and open confirmation dialog
    // We keep selectedActivity set so we know what to delete
    setMenuAnchorEl(null);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedActivity) {
      deleteActivity(selectedActivity.id);
    }
    setDeleteDialogOpen(false);
    setSelectedActivity(null);
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setSelectedActivity(null);
  };

  const columns: ColumnDef<Activity>[] = [
    {
      id: 'displayName',
      label: 'Name',
      align: 'left',
    },
    ...(showPlaylistColumn ? [{
      id: 'playlist',
      label: 'Playlist',
      align: 'left' as const,
      render: (activity: Activity) => playlists.get(activity.playlistId)?.displayName || 'Unknown',
    }] : []),
    {
      id: 'priority',
      label: 'Priority',
      align: 'left', // Or center? User said "name and prirority"
      render: (activity) => activity.priority.toString(),
    },
    {
      id: 'actions',
      label: '',
      align: 'right',
      render: (activity) => (
        <IconButton
          aria-label="more"
          aria-controls="long-menu"
          aria-haspopup="true"
          onClick={(e) => handleMenuOpen(e, activity)}
        >
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <>
      <DataTable data={activities} columns={columns} />

      <Menu
        id="long-menu"
        anchorEl={menuAnchorEl}
        keepMounted
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleViewDetails}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ color: 'error' }}>Remove</ListItemText>
        </MenuItem>
      </Menu>

      <ConfirmationDialog
        open={deleteDialogOpen}
        title="Delete Activity"
        content={`Are you sure you want to delete "${selectedActivity?.displayName}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onClose={handleCancelDelete}
        confirmLabel="Delete"
        confirmColor="error"
      />
    </>
  );
};
