import { useState } from 'react';
import { Checkbox, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import CheckIcon from '@mui/icons-material/Check';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import type { TodoItem } from '../../models/todo';
import { useTodoContext } from '../../contexts/TodoContext';

interface TodoListProps {
  items: TodoItem[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

interface SortableRowProps {
  item: TodoItem;
  activeTaskId: string | null;
  isPaused: boolean;
  onToggleComplete: (id: string) => void;
  onMenuOpen: (event: React.MouseEvent<HTMLElement>, itemId: string) => void;
}

const SortableRow = ({ item, activeTaskId, isPaused, onToggleComplete, onMenuOpen }: SortableRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: isDragging ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
  };

  const isActive = activeTaskId === item.id;
  const isItemPaused = isActive && isPaused;

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
    >
      <TableCell size="small" sx={{ width: 28, padding: '4px 8px' }}>
        <Box
          {...attributes}
          {...listeners}
          sx={{ 
            cursor: isDragging ? 'grabbing' : 'grab',
            display: 'flex',
            alignItems: 'center',
            color: 'text.secondary',
            '&:hover': { color: 'text.primary' }
          }}
        >
          <DragIndicatorIcon fontSize="small" />
        </Box>
      </TableCell>
      <TableCell size="small" sx={{ minWidth: 40, padding: '4px 8px' }}>
        <Checkbox
          checked={item.isCompleted}
          onChange={() => onToggleComplete(item.id)}
          color="primary"
          size="small"
          sx={{ padding: 0.5 }}
        />
      </TableCell>
      <TableCell size="small" sx={{ minWidth: 100, padding: '4px 8px' }}>
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
      </TableCell>
      <TableCell size="small" sx={{ minWidth: 100, padding: '4px 8px' }}>
        <span style={{ 
          textDecoration: item.isCompleted ? 'line-through' : 'none',
          color: item.isCompleted ? 'text.disabled' : 'inherit',
          opacity: item.isCompleted ? 0.6 : 1
        }}>
          {item.playlistName}
        </span>
      </TableCell>
      <TableCell size="small" align="right" sx={{ minWidth: 40, padding: '4px 8px' }}>
        <IconButton 
          onClick={(e) => onMenuOpen(e, item.id)}
          size="small" 
          sx={{ padding: 0.5 }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

export const TodoList = ({ items, onToggleComplete, onDelete }: TodoListProps) => {
  const { activeTaskId, isPaused, startTimer, pauseTimer, reorderTodos } = useTodoContext();
  const [menuAnchor, setMenuAnchor] = useState<{ el: HTMLElement; itemId: string } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Require 5px movement before drag starts
      },
    })
  );

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newItems = arrayMove(items, oldIndex, newIndex);
        const newOrder = newItems.map((item) => item.id);
        reorderTodos(newOrder);
      }
    }
  };

  const menuItem = menuAnchor ? items.find(i => i.id === menuAnchor.itemId) : null;
  const isMenuItemActive = menuItem && activeTaskId === menuItem.id;

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map(item => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <TableContainer component={Paper} elevation={0}>
            <Table sx={{ minWidth: '100%' }} aria-label="todo list" size="small">
              <TableHead>
                <TableRow>
                  <TableCell size="small" sx={{ width: 28, padding: '4px 8px' }}></TableCell>
                  <TableCell size="small" sx={{ minWidth: 40, padding: '4px 8px' }}>Done</TableCell>
                  <TableCell size="small" sx={{ minWidth: 100, padding: '4px 8px' }}>Activity</TableCell>
                  <TableCell size="small" sx={{ minWidth: 100, padding: '4px 8px' }}>Playlist</TableCell>
                  <TableCell size="small" align="right" sx={{ minWidth: 40, padding: '4px 8px' }}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <SortableRow
                    key={item.id}
                    item={item}
                    activeTaskId={activeTaskId}
                    isPaused={isPaused}
                    onToggleComplete={onToggleComplete}
                    onMenuOpen={handleMenuOpen}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </SortableContext>
      </DndContext>
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
