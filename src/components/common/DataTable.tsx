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
}

export const DataTable = <T,>({ data, columns }: DataTableProps<T>) => {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="data table">
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column.id}
                align={column.align || 'left'}
                style={{ minWidth: column.minWidth }}
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
                  <TableCell key={column.id} align={column.align || 'left'}>
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
