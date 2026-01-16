import { useState } from 'react';
import { Checkbox, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import CheckIcon from '@mui/icons-material/Check';
import { DataTable } from '../common/DataTable';
import type { ColumnDef } from '../common/DataTable';
import type { TodoItem } from '../../models/todo';
import { useTodoContext } from '../../contexts/TodoContext';

interface TodoListProps {
  items: TodoItem[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TodoList = ({ items, onToggleComplete, onDelete }: TodoListProps) => {
  const { activeTaskId, isPaused, startTimer, pauseTimer } = useTodoContext();
  const [menuAnchor, setMenuAnchor] = useState<{ el: HTMLElement; itemId: string } | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, itemId: string) => {
    event.stopPropagation();
    setMenuAnchor({ el: event.currentTarget, itemId });
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleStart = () => {
    if (menuAnchor) {
      startTimer(menuAnchor.itemId);
      handleMenuClose();
    }
  };

  const handlePause = () => {
    if (menuAnchor) {
      pauseTimer();
      handleMenuClose();
    }
  };

  const handleComplete = () => {
    if (menuAnchor) {
      onToggleComplete(menuAnchor.itemId);
      handleMenuClose();
    }
  };

  const columns: ColumnDef<TodoItem>[] = [
    {
      id: 'isCompleted',
      label: 'Done',
      minWidth: 40,
      render: (item) => (
        <Checkbox
          checked={item.isCompleted}
          onChange={() => onToggleComplete(item.id)}
          color="primary"
          size="small"
          sx={{ padding: 0.5 }}
        />
      ),
    },
    {
      id: 'displayName',
      label: 'Activity',
      minWidth: 100,
      render: (item) => {
        const isActive = activeTaskId === item.id;
        const isItemPaused = isActive && isPaused;
        
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
             {isActive && (
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: isItemPaused ? 'warning.main' : 'success.main',
                  flexShrink: 0
                }}
              />
            )}
            <span style={{ 
              textDecoration: item.isCompleted ? 'line-through' : 'none',
              color: item.isCompleted ? 'text.disabled' : 'inherit',
              opacity: item.isCompleted ? 0.6 : 1
            }}>
              {item.displayName}
            </span>
          </Box>
        );
      },
    },
    {
      id: 'playlistName',
      label: 'Playlist',
      minWidth: 100,
      render: (item) => (
        <span style={{ 
          textDecoration: item.isCompleted ? 'line-through' : 'none',
          color: item.isCompleted ? 'text.disabled' : 'inherit',
          opacity: item.isCompleted ? 0.6 : 1
        }}>
          {item.playlistName}
        </span>
      ),
    },
    {
      id: 'actions',
      label: '',
      minWidth: 40,
      align: 'right',
      render: (item) => (
        <>
          <IconButton 
            onClick={(e) => handleMenuOpen(e, item.id)}
            size="small" 
            sx={{ padding: 0.5 }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </>
      ),
    },
  ];

  const menuItem = menuAnchor ? items.find(i => i.id === menuAnchor.itemId) : null;
  const isMenuItemActive = menuItem && activeTaskId === menuItem.id;

  return (
    <>
      <DataTable 
        data={items} 
        columns={columns} 
        minWidth="100%" 
        compact={true} 
        elevation={0}
      />
      <Menu
        anchorEl={menuAnchor?.el}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        {!menuItem?.isCompleted && (
          isMenuItemActive && !isPaused ? (
            <MenuItem onClick={handlePause}>
              <ListItemIcon><PauseIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Pause</ListItemText>
            </MenuItem>
          ) : (
             <MenuItem onClick={handleStart}>
              <ListItemIcon><PlayArrowIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Start</ListItemText>
            </MenuItem>
          )
        )}
        
        {!menuItem?.isCompleted && (
          <MenuItem onClick={handleComplete}>
            <ListItemIcon><CheckIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Complete</ListItemText>
          </MenuItem>
        )}

        <MenuItem onClick={() => { 
          if(menuAnchor) onDelete(menuAnchor.itemId); 
          handleMenuClose(); 
        }}>
          <ListItemIcon><DeleteIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};
