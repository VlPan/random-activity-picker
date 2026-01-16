import { useState } from 'react';
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import { useActivityContext } from '../../contexts/ActivityContext';
import { useTodoContext } from '../../contexts/TodoContext';
import type { Activity } from '../../models/activity';
import type { TodoItem } from '../../models/todo';
import { DataTable } from '../common/DataTable';
import { ConfirmationDialog } from '../common/ConfirmationDialog';
import type { ColumnDef } from '../common/DataTable';

interface ActivitiesTableProps {
  activities: Activity[];
  showPlaylistColumn?: boolean;
  onEdit?: (activity: Activity) => void;
}

export const ActivitiesTable = ({ activities, showPlaylistColumn = false, onEdit }: ActivitiesTableProps) => {
  const { deleteActivity, playlists } = useActivityContext();
  const { addTodo } = useTodoContext();
  
  // Sorting state
  const [orderBy, setOrderBy] = useState<string>('priority');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  // State for the menu
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedActivities = [...activities].sort((a, b) => {
    if (orderBy === 'priority') {
      return order === 'asc' ? a.priority - b.priority : b.priority - a.priority;
    }
    if (orderBy === 'displayName') {
      return order === 'asc' 
        ? a.displayName.localeCompare(b.displayName) 
        : b.displayName.localeCompare(a.displayName);
    }
    if (orderBy === 'playlist') {
      const pA = playlists.get(a.playlistId)?.displayName || '';
      const pB = playlists.get(b.playlistId)?.displayName || '';
      return order === 'asc' 
        ? pA.localeCompare(pB) 
        : pB.localeCompare(pA);
    }
    return 0;
  });
  
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
    if (onEdit && selectedActivity) {
      onEdit(selectedActivity);
    }
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

  const handlePickActivity = () => {
    if (selectedActivity) {
      const playlist = playlists.get(selectedActivity.playlistId);
      const newItem: TodoItem = {
        id: crypto.randomUUID(),
        activityId: selectedActivity.id,
        displayName: selectedActivity.displayName,
        playlistName: playlist?.displayName || 'Unknown',
        isCompleted: false,
        timeSpent: 0
      };
      addTodo(newItem);
    }
    handleMenuClose();
  };

  const columns: ColumnDef<Activity>[] = [
    {
      id: 'displayName',
      label: 'Name',
      align: 'left',
      sortable: true,
    },
    ...(showPlaylistColumn ? [{
      id: 'playlist',
      label: 'Playlist',
      align: 'left' as const,
      render: (activity: Activity) => playlists.get(activity.playlistId)?.displayName || 'Unknown',
      sortable: true,
    }] : []),
    {
      id: 'priority',
      label: 'Priority',
      align: 'left',
      render: (activity) => activity.priority.toString(),
      sortable: true,
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
      <DataTable 
        data={sortedActivities} 
        columns={columns} 
        orderBy={orderBy}
        order={order}
        onRequestSort={handleRequestSort}
      />

      <Menu
        id="long-menu"
        anchorEl={menuAnchorEl}
        keepMounted
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handlePickActivity}>
          <ListItemIcon>
            <PlaylistAddIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Pick Activity</ListItemText>
        </MenuItem>
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
