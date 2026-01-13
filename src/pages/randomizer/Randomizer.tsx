import { useMemo, useState } from 'react';
import { Tabs, Tab, Box, Typography, Fab, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import styles from './Randomizer.module.css';
import { useActivityContext } from '../../contexts/ActivityContext';
import { TabPanel } from '../../components/static/tab-panel';
import type { Activity } from '../../models/activity';
import type { ActivitiesPlaylist } from '../../models/playlist';
import { AddActivityDialog } from '../../components/activities/AddActivityDialog';
import { RandomActivityPicker } from '../../components/activities/RandomActivityPicker';
import { AddPlaylistPanel } from '../../components/playlists/AddPlaylistPanel';
import { RenamePlaylistDialog } from '../../components/playlists/RenamePlaylistDialog';
import { ActivitiesTable } from '../../components/activities/ActivitiesTable';
import { FloatingPanel } from '../../components/common/FloatingPanel';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { TodoList } from '../../components/todo/TodoList';
import type { TodoItem } from '../../models/todo';

type TabSelection = 
  | { type: 'playlist'; index: number }
  | { type: 'all-activities' }
  | { type: 'add-playlist' };

// Sortable Tab Component
const SortableTab = (props: any) => {
  const { sortableId, ...other } = props;
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
    opacity: isDragging ? 0.5 : 1,
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
  const [selectedTab, setSelectedTab] = useState<TabSelection>({ type: 'playlist', index: 0 });
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [todoItems, setTodoItems] = useState<TodoItem[]>([]);

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    playlist: ActivitiesPlaylist;
  } | null>(null);

  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
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

  const handleActivityPicked = (activity: Activity) => {
    const newItem: TodoItem = {
      id: crypto.randomUUID(),
      activityId: activity.id,
      displayName: activity.displayName,
      isCompleted: false,
    };
    setTodoItems((prev) => [...prev, newItem]);
  };

  const handleToggleTodo = (id: string) => {
    setTodoItems((prev) => {
      const updated = prev.map((item) => {
        if (item.id === id) {
          const isCompleted = !item.isCompleted;
          return {
            ...item,
            isCompleted,
            completedAt: isCompleted ? new Date() : undefined,
          };
        }
        return item;
      });

      // Sort: incomplete first, then completed by date (newest first)
      return updated.sort((a, b) => {
        if (a.isCompleted === b.isCompleted) {
          if (a.isCompleted && a.completedAt && b.completedAt) {
            return b.completedAt.getTime() - a.completedAt.getTime();
          }
          return 0;
        }
        return a.isCompleted ? 1 : -1;
      });
    });
  };

  const handleDeleteTodo = (id: string) => {
    setTodoItems((prev) => prev.filter((item) => item.id !== id));
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

  const handleRenameClick = () => {
    if (contextMenu) {
      setPlaylistToAction(contextMenu.playlist);
      setRenameDialogOpen(true);
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

  const handleConfirmRename = (newName: string) => {
    if (playlistToAction) {
      updatePlaylist({
        ...playlistToAction,
        displayName: newName
      });
      setPlaylistToAction(null);
    }
  };

  const handleConfirmDelete = () => {
    if (playlistToAction) {
      deletePlaylist(playlistToAction.id);
      setDeleteDialogOpen(false);
      setPlaylistToAction(null);
    }
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

  return (
    <Box className={styles.randomizer} sx={{ width: '100%', position: 'relative', minHeight: '100vh' }}>
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
                  label={playlist.displayName}
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
              <ActivitiesTable activities={playlistActivities} />
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
          activities={Array.from(activities.values())} 
          onActivityPicked={handleActivityPicked}
        />
        {activities.size > 0 ? (
          <ActivitiesTable 
            activities={Array.from(activities.values())} 
            showPlaylistColumn={true} 
          />
        ) : (
          <Typography variant="body2" color="text.secondary">
            No activities created yet.
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
          onClick={() => setIsAddActivityOpen(true)}
        >
          <AddIcon />
        </Fab>
      )}

      <AddActivityDialog
        open={isAddActivityOpen}
        onClose={() => setIsAddActivityOpen(false)}
        defaultPlaylistId={currentPlaylistId}
      />

      {todoItems.length > 0 && (
        <FloatingPanel title="Session Todos">
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
        <MenuItem onClick={handleRenameClick}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Rename</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteClick}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      <RenamePlaylistDialog
        open={renameDialogOpen}
        onClose={() => setRenameDialogOpen(false)}
        onConfirm={handleConfirmRename}
        currentName={playlistToAction?.displayName || ''}
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
    </Box>
  );
};

export default Randomizer;
