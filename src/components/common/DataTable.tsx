import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import type { ReactNode } from 'react';

export interface ColumnDef<T> {
  id: string;
  label: string;
  align?: 'left' | 'right' | 'center';
  minWidth?: number;
  render?: (item: T) => ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  minWidth?: number | string;
  compact?: boolean;
  elevation?: number;
}

export const DataTable = <T,>({ 
  data, 
  columns, 
  minWidth = 650, 
  compact = false,
  elevation
}: DataTableProps<T>) => {
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
              >
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            // using index as fallback key if no id property is available on row
            // In a real app, we should probably enforce an id property or pass a key extractor
            <TableRow
              key={(row as any).id || index}
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
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
