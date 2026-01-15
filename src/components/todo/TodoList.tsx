import { Checkbox, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { DataTable } from '../common/DataTable';
import type { ColumnDef } from '../common/DataTable';
import type { TodoItem } from '../../models/todo';

interface TodoListProps {
  items: TodoItem[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TodoList = ({ items, onToggleComplete, onDelete }: TodoListProps) => {
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
      render: (item) => (
        <span style={{ 
          textDecoration: item.isCompleted ? 'line-through' : 'none',
          color: item.isCompleted ? 'text.disabled' : 'inherit',
          opacity: item.isCompleted ? 0.6 : 1
        }}>
          {item.displayName}
        </span>
      ),
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
        <IconButton 
          onClick={() => onDelete(item.id)} 
          size="small" 
          color="error"
          sx={{ padding: 0.5 }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (
    <DataTable 
      data={items} 
      columns={columns} 
      minWidth="100%" 
      compact={true} 
      elevation={0}
    />
  );
};
