import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  Box,
  Typography,
} from '@mui/material';
import type { ReactNode } from 'react';

export interface ColumnDef<T> {
  id: string;
  label: string;
  align?: 'left' | 'right' | 'center';
  minWidth?: number;
  render?: (item: T) => ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  minWidth?: number | string;
  compact?: boolean;
  elevation?: number;
  orderBy?: string;
  order?: 'asc' | 'desc';
  onRequestSort?: (property: string) => void;
  keyExtractor?: (item: T) => string | number;
  emptyMessage?: string;
}

export const DataTable = <T,>({ 
  data, 
  columns, 
  minWidth = 650, 
  compact = false,
  elevation,
  orderBy,
  order,
  onRequestSort,
  keyExtractor,
  emptyMessage
}: DataTableProps<T>) => {
  const createSortHandler = (property: string) => () => {
    if (onRequestSort) {
      onRequestSort(property);
    }
  };

  if (data.length === 0 && emptyMessage) {
      return (
          <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography color="text.secondary">{emptyMessage}</Typography>
          </Box>
      );
  }

  return (
    <TableContainer component={Paper} elevation={elevation}>
      <Table 
        sx={{ minWidth: minWidth }} 
        aria-label="data table"
        size={compact ? 'small' : 'medium'}
      >
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column.id}
                align={column.align || 'left'}
                style={{ minWidth: column.minWidth }}
                size={compact ? 'small' : 'medium'}
                sortDirection={orderBy === column.id ? order : false}
              >
                {column.sortable ? (
                  <TableSortLabel
                    active={orderBy === column.id}
                    direction={orderBy === column.id ? order : 'asc'}
                    onClick={createSortHandler(column.id)}
                  >
                    {column.label}
                  </TableSortLabel>
                ) : (
                  column.label
                )}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => {
            const key = keyExtractor ? keyExtractor(row) : ((row as any).id || index);
            return (
                <TableRow
                key={key}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                {columns.map((column) => {
                    const value = (row as any)[column.id];
                    return (
                    <TableCell 
                        key={column.id} 
                        align={column.align || 'left'}
                        size={compact ? 'small' : 'medium'}
                    >
                        {column.render ? column.render(row) : value}
                    </TableCell>
                    );
                })}
                </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
