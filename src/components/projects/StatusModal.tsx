import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Box, 
  List, 
  ListItem, 
  ListItemText, 
  IconButton,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Menu,
  MenuItem
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { v4 as uuidv4 } from 'uuid';
import type { ProjectStatus, Comment } from '../../models/project';
import StatusIndicator from './StatusIndicator';

interface StatusModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  currentStatus: ProjectStatus;
  comments: Comment[];
  onSave: (status: ProjectStatus, comments: Comment[]) => void;
}

const StatusModal = ({ open, onClose, title, currentStatus, comments, onSave }: StatusModalProps) => {
  const [status, setStatus] = useState<ProjectStatus>(currentStatus);
  const [localComments, setLocalComments] = useState<Comment[]>(comments);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setStatus(currentStatus);
      setLocalComments(comments || []); // Ensure comments is array
      setNewComment('');
      setEditingCommentId(null);
    }
  }, [open, currentStatus, comments]);

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    const comment: Comment = {
      id: uuidv4(),
      text: newComment.trim(),
      createdAt: new Date().toISOString()
    };
    
    setLocalComments([...localComments, comment]);
    setNewComment('');
  };

  const handleDeleteComment = (id: string) => {
    setLocalComments(localComments.filter(c => c.id !== id));
  };

  const handleStartEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingCommentText(comment.text);
  };

  const handleSaveEditComment = () => {
    if (!editingCommentText.trim() || !editingCommentId) return;
    
    setLocalComments(localComments.map(c => 
      c.id === editingCommentId 
        ? { ...c, text: editingCommentText.trim() } 
        : c
    ));
    setEditingCommentId(null);
    setEditingCommentText('');
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, commentId: string) => {
    setMenuAnchorEl(event.currentTarget);
    setActiveCommentId(commentId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setActiveCommentId(null);
  };

  const handleSave = () => {
    onSave(status, localComments);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3, mt: 1 }}>
            <Typography variant="subtitle2" gutterBottom>Status</Typography>
            <ToggleButtonGroup
                value={status}
                exclusive
                onChange={(_, newStatus) => {
                    if (newStatus !== null) setStatus(newStatus);
                }}
                fullWidth
            >
                <ToggleButton value="unset">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <StatusIndicator status="unset" /> Unset
                    </Box>
                </ToggleButton>
                <ToggleButton value="green">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <StatusIndicator status="green" /> Green
                    </Box>
                </ToggleButton>
                <ToggleButton value="yellow">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <StatusIndicator status="yellow" /> Yellow
                    </Box>
                </ToggleButton>
                <ToggleButton value="red">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <StatusIndicator status="red" /> Red
                    </Box>
                </ToggleButton>
            </ToggleButtonGroup>
        </Box>

        <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Comments</Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') handleAddComment();
                    }}
                />
                <Button variant="contained" onClick={handleAddComment} disabled={!newComment.trim()}>
                    Add
                </Button>
            </Box>

            <List sx={{ maxHeight: 300, overflow: 'auto', bgcolor: 'background.paper' }}>
                {localComments.length === 0 && (
                    <Typography variant="body2" color="text.secondary" align="center">
                        No comments yet
                    </Typography>
                )}
                {localComments.map((comment) => (
                    <ListItem
                        key={comment.id}
                        alignItems="flex-start"
                        secondaryAction={
                            editingCommentId !== comment.id && (
                                <IconButton size="small" onClick={(e) => handleMenuOpen(e, comment.id)}>
                                    <MoreVertIcon fontSize="small" />
                                </IconButton>
                            )
                        }
                        sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
                    >
                        {editingCommentId === comment.id ? (
                            <Box sx={{ width: '100%', display: 'flex', gap: 1 }}>
                                <TextField
                                    fullWidth
                                    multiline
                                    minRows={2}
                                    size="small"
                                    value={editingCommentText}
                                    onChange={(e) => setEditingCommentText(e.target.value)}
                                    autoFocus
                                />
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <Button size="small" variant="contained" onClick={handleSaveEditComment}>Save</Button>
                                    <Button size="small" onClick={() => setEditingCommentId(null)}>Cancel</Button>
                                </Box>
                             </Box>
                        ) : (
                            <ListItemText
                                primary={comment.text}
                                secondary={new Date(comment.createdAt).toLocaleString()}
                                secondaryTypographyProps={{ variant: 'caption' }}
                            />
                        )}
                    </ListItem>
                ))}
            </List>
            
            <Menu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={() => {
                    const comment = localComments.find(c => c.id === activeCommentId);
                    if (comment) {
                        handleStartEditComment(comment);
                    }
                    handleMenuClose();
                }}>
                    <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
                </MenuItem>
                <MenuItem onClick={() => {
                    if (activeCommentId) {
                        handleDeleteComment(activeCommentId);
                    }
                    handleMenuClose();
                }}>
                    <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
                </MenuItem>
            </Menu>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default StatusModal;
