import { useMemo, useState } from 'react';
import { Tabs, Tab, Box, Typography, Fab, Menu, MenuItem, ListItemIcon, ListItemText, IconButton, Tooltip } from '@mui/material';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import styles from './Randomizer.module.css';
import { useActivityContext } from '../../contexts/ActivityContext';
import { useTodoContext } from '../../contexts/TodoContext';
import { TabPanel } from '../../components/static/tab-panel';
import type { Activity } from '../../models/activity';
import type { ActivitiesPlaylist } from '../../models/playlist';
import { ActivityDialog } from '../../components/activities/ActivityDialog';
import { RandomActivityPicker } from '../../components/activities/RandomActivityPicker';
import { AddPlaylistPanel } from '../../components/playlists/AddPlaylistPanel';
import { EditPlaylistDialog } from '../../components/playlists/EditPlaylistDialog';
import { ActivitiesTable } from '../../components/activities/ActivitiesTable';
import { FloatingPanel } from '../../components/common/FloatingPanel';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { TodoList } from '../../components/todo/TodoList';
import { TaskRewardDialog } from '../../components/todo/TaskRewardDialog';
import type { TodoItem } from '../../models/todo';

type TabSelection = 
  | { type: 'playlist'; index: number }
  | { type: 'all-activities' }
  | { type: 'add-playlist' };

// Sortable Tab Component
const SortableTab = (props: any) => {
  const { sortableId, disabled, ...other } = props;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sortableId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: isDragging ? 'grabbing' : 'pointer',
    opacity: isDragging ? 0.5 : (disabled ? 0.6 : 1),
    filter: disabled ? 'grayscale(100%)' : 'none',
    zIndex: isDragging ? 1 : 'auto',
  };

  return (
    <Tab
      ref={setNodeRef}
      {...other}
      {...attributes}
      {...listeners}
      style={{ ...other.style, ...style }}
    />
  );
};

const Randomizer = () => {
  const { playlists, loading, activities, updatePlaylist, deletePlaylist, reorderPlaylists } = useActivityContext();
  const { todoItems, addTodo, removeTodo, toggleComplete, clearTodos, resetTodoTime } = useTodoContext();
  const [selectedTab, setSelectedTab] = useState<TabSelection>({ type: 'playlist', index: 0 });
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | undefined>(undefined);
  // Removed local todoItems state
  const [isRewardDialogOpen, setIsRewardDialogOpen] = useState(false);
  const [completedTaskId, setCompletedTaskId] = useState<string | null>(null);
  const [confirmClearDialogOpen, setConfirmClearDialogOpen] = useState(false);

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    playlist: ActivitiesPlaylist;
  } | null>(null);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [playlistToAction, setPlaylistToAction] = useState<ActivitiesPlaylist | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts to prevent accidental drags on click
      },
    })
  );

  const playlistsArray = Array.from(playlists.values());

  // Pre-compute activities per playlist once, only recalculate when activities change
  const activitiesByPlaylistId = useMemo(() => {
    const map = new Map<string, Activity[]>();
    for (const activity of activities.values()) {
      const existing = map.get(activity.playlistId);
      if (existing) {
        existing.push(activity);
      } else {
        map.set(activity.playlistId, [activity]);
      }
    }
    return map;
  }, [activities]);

  const getMuiTabIndex = (selection: TabSelection): number => {
    if (selection.type === 'add-playlist') {
      return playlistsArray.length + 1;
    }
    
    if (selection.type === 'all-activities') {
      return playlistsArray.length;
    }
    
    if (playlistsArray.length === 0) {
      // If no playlists exist, we show All Activities at index 0
      // So if we are trying to select a playlist that doesn't exist, fallback to All Activities
      return 0;
    }
    
    const validIndex = Math.min(selection.index, playlistsArray.length - 1);
    return validIndex;
  };

  const getTabSelectionFromMuiIndex = (muiIndex: number): TabSelection => {
    const isAddPlaylistTab = muiIndex === playlistsArray.length + 1;
    const isAllActivitiesTab = muiIndex === playlistsArray.length;
    
    if (isAddPlaylistTab) {
      return { type: 'add-playlist' };
    }

    if (isAllActivitiesTab) {
      return { type: 'all-activities' };
    }
    
    return { type: 'playlist', index: muiIndex };
  };

  const handleTabChange = (_event: React.SyntheticEvent, muiTabIndex: number) => {
    const newSelection = getTabSelectionFromMuiIndex(muiTabIndex);
    setSelectedTab(newSelection);
  };

  const handlePlaylistAdded = () => {
    // Switch to the new playlist (which will be at the end)
    // The current length is the index of the new item because indices are 0-based
    setSelectedTab({ type: 'playlist', index: playlistsArray.length });
  };

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setIsAddActivityOpen(true);
  };

  const handleActivityPicked = (activity: Activity) => {
    const playlist = playlists.get(activity.playlistId);
    const newItem: TodoItem = {
      id: crypto.randomUUID(),
      activityId: activity.id,
      displayName: activity.displayName,
      playlistName: playlist?.displayName || 'Unknown',
      isCompleted: false,
      timeSpent: 0
    };
    addTodo(newItem);
  };

  const handleToggleTodo = (id: string) => {
    const item = todoItems.find(i => i.id === id);
    if (item && !item.isCompleted) {
        setCompletedTaskId(id);
        setIsRewardDialogOpen(true);
    }
    toggleComplete(id);
  };

  const handleDeleteTodo = (id: string) => {
    removeTodo(id);
  };

  const handleContextMenu = (event: React.MouseEvent, playlist: ActivitiesPlaylist) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
            playlist,
          }
        : null,
    );
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleEditClick = () => {
    if (contextMenu) {
      setPlaylistToAction(contextMenu.playlist);
      setEditDialogOpen(true);
      handleCloseContextMenu();
    }
  };

  const handleDeleteClick = () => {
    if (contextMenu) {
      setPlaylistToAction(contextMenu.playlist);
      setDeleteDialogOpen(true);
      handleCloseContextMenu();
    }
  };

  const handleConfirmEdit = (newName: string, newPriority: number) => {
    if (playlistToAction) {
      updatePlaylist({
        ...playlistToAction,
        displayName: newName,
        priority: newPriority
      });
      setPlaylistToAction(null);
    }
  };

  const handleToggleDisable = () => {
    if (contextMenu) {
      const playlist = contextMenu.playlist;
      updatePlaylist({
        ...playlist,
        disabled: !playlist.disabled
      });
      handleCloseContextMenu();
    }
  };

  const handleConfirmDelete = () => {
    if (playlistToAction) {
      deletePlaylist(playlistToAction.id);
      setDeleteDialogOpen(false);
      setPlaylistToAction(null);
    }
  };

  const handleClearTodos = () => {
    setConfirmClearDialogOpen(true);
  };

  const handleConfirmClear = () => {
    clearTodos();
    setConfirmClearDialogOpen(false);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = playlistsArray.findIndex((p) => p.id === active.id);
      const newIndex = playlistsArray.findIndex((p) => p.id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        // Calculate new order
        const newPlaylistsArray = arrayMove(playlistsArray, oldIndex, newIndex);
        const newOrder = newPlaylistsArray.map((p) => p.id);
        
        // If we are currently on a playlist tab, we need to track where it went
        if (selectedTab.type === 'playlist') {
          const currentPlaylistId = playlistsArray[selectedTab.index]?.id;
          
          // Reorder the playlists in context
          reorderPlaylists(newOrder);
          
          // Find new index of the previously selected playlist
          const newSelectedIndex = newPlaylistsArray.findIndex(p => p.id === currentPlaylistId);
          if (newSelectedIndex !== -1) {
            setSelectedTab({ type: 'playlist', index: newSelectedIndex });
          }
        } else {
          // If we are on 'all-activities' or 'add-playlist', their logical index shifts 
          // but the type doesn't change, so we don't strictly need to update selectedTab 
          // unless we want to keep index valid, but getMuiTabIndex handles the mapping.
          reorderPlaylists(newOrder);
        }
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  const activeMuiTabIndex = getMuiTabIndex(selectedTab);
  const clampedTabIndex = Math.max(0, Math.min(activeMuiTabIndex, playlistsArray.length + 1));
  
  // Calculate current playlist ID for the dialog default
  const currentPlaylistId = selectedTab.type === 'playlist' && playlistsArray.length > 0
    ? playlistsArray[Math.min(selectedTab.index, playlistsArray.length - 1)]?.id
    : undefined;

  const enabledActivities = Array.from(activities.values()).filter(activity => {
    const playlist = playlists.get(activity.playlistId);
    return playlist && !playlist.disabled;
  });

  return (
    <Box className={styles.randomizer} sx={{ width: '100%', position: 'relative', minHeight: '97vh' }}>
      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCenter} 
        onDragEnd={handleDragEnd}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <SortableContext 
            items={playlistsArray.map(p => p.id)} 
            strategy={horizontalListSortingStrategy}
          >
            <Tabs
              value={clampedTabIndex}
              onChange={handleTabChange}
              aria-label="playlist tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              {playlistsArray.map((playlist, index) => (
                <SortableTab
                  key={playlist.id}
                  sortableId={playlist.id}
                  disabled={playlist.disabled}
                  label={`${playlist.displayName} (${playlist.priority || 1})`}
                  id={`playlist-tab-${index}`}
                  aria-controls={`playlist-tabpanel-${index}`}
                  onContextMenu={(e: React.MouseEvent) => handleContextMenu(e, playlist)}
                />
              ))}
              <Tab
                label="All Activities"
                id={`playlist-tab-${playlistsArray.length}`}
                aria-controls={`playlist-tabpanel-${playlistsArray.length}`}
              />
              <Tab
                icon={<AddIcon />}
                aria-label="add playlist"
                id={`playlist-tab-${playlistsArray.length + 1}`}
                aria-controls={`playlist-tabpanel-${playlistsArray.length + 1}`}
              />
            </Tabs>
          </SortableContext>
        </Box>
      </DndContext>

      {playlistsArray.map((playlist, index) => {
        const playlistActivities = activitiesByPlaylistId.get(playlist.id) || [];
        return (
          <TabPanel key={playlist.id} value={clampedTabIndex} index={index}>
            <Typography variant="h6" gutterBottom>
              {playlist.displayName}
            </Typography>
            <RandomActivityPicker 
              activities={playlistActivities} 
              onActivityPicked={handleActivityPicked}
            />
            {playlistActivities.length > 0 ? (
              <ActivitiesTable 
                activities={playlistActivities} 
                onEdit={handleEditActivity}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                No activities in this playlist yet.
              </Typography>
            )}
          </TabPanel>
        );
      })}

      <TabPanel value={clampedTabIndex} index={playlistsArray.length}>
        <Typography variant="h6" gutterBottom>
          All Activities
        </Typography>
        <RandomActivityPicker 
          activities={enabledActivities} 
          onActivityPicked={handleActivityPicked}
          playlists={playlistsArray.filter(p => !p.disabled)}
          activitiesByPlaylist={activitiesByPlaylistId}
        />
        {enabledActivities.length > 0 ? (
          <ActivitiesTable 
            activities={enabledActivities} 
            showPlaylistColumn={true} 
            onEdit={handleEditActivity}
          />
        ) : (
          <Typography variant="body2" color="text.secondary">
            No activities available (check if playlists are enabled).
          </Typography>
        )}
      </TabPanel>

      <TabPanel value={clampedTabIndex} index={playlistsArray.length + 1}>
        <AddPlaylistPanel onPlaylistAdded={handlePlaylistAdded} />
      </TabPanel>

      {selectedTab.type === 'playlist' && playlistsArray.length > 0 && (
        <Fab
          color="primary"
          aria-label="add activity"
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
          }}
          onClick={() => {
            setEditingActivity(undefined);
            setIsAddActivityOpen(true);
          }}
        >
          <AddIcon />
        </Fab>
      )}

      <ActivityDialog
        open={isAddActivityOpen}
        onClose={() => {
          setIsAddActivityOpen(false);
          setEditingActivity(undefined);
        }}
        defaultPlaylistId={currentPlaylistId}
        activityToEdit={editingActivity}
      />

      {todoItems.length > 0 && (
        <FloatingPanel 
            title="Session Todos" 
            width={400}
            action={
                <Tooltip title="Clear all todos">
                    <IconButton size="small" onClick={handleClearTodos} color="inherit">
                        <DeleteSweepIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            }
        >
          <TodoList
            items={todoItems}
            onToggleComplete={handleToggleTodo}
            onDelete={handleDeleteTodo}
          />
        </FloatingPanel>
      )}

      <Menu
        open={contextMenu !== null}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={handleEditClick}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleToggleDisable}>
          <ListItemIcon>
            {contextMenu?.playlist.disabled ? <CheckCircleIcon fontSize="small" /> : <BlockIcon fontSize="small" />}
          </ListItemIcon>
          <ListItemText>{contextMenu?.playlist.disabled ? 'Enable' : 'Disable'}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteClick}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      <EditPlaylistDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onConfirm={handleConfirmEdit}
        currentName={playlistToAction?.displayName || ''}
        currentPriority={playlistToAction?.priority}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        title="Delete Playlist"
        content="Are you sure you want to delete this playlist? All activities in this playlist will also be deleted. This action cannot be undone."
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        confirmLabel="Delete"
        confirmColor="error"
      />

      <ConfirmationDialog
        open={confirmClearDialogOpen}
        title="Clear Session Todos"
        content="Are you sure you want to clear all session todos? This action cannot be undone."
        onClose={() => setConfirmClearDialogOpen(false)}
        onConfirm={handleConfirmClear}
        confirmLabel="Clear All"
        confirmColor="error"
      />
      
      <TaskRewardDialog
        open={isRewardDialogOpen}
        onClose={() => {
            setIsRewardDialogOpen(false);
            setCompletedTaskId(null);
        }}
        onTakeRewards={() => {
            if (completedTaskId) {
                resetTodoTime(completedTaskId);
            }
            setIsRewardDialogOpen(false);
            setCompletedTaskId(null);
        }}
        timeSpent={todoItems.find(i => i.id === completedTaskId)?.timeSpent}
      />
    </Box>
  );
};

export default Randomizer;
