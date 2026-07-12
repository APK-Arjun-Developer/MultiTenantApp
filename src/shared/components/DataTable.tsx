import React, { useCallback, useMemo } from 'react';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import type { DataTableProps } from './DataTable.types';
import { styles } from './DataTable.styles';

export const DataTable = React.memo(function DataTable<TData>({
  data,
  columns,
  isLoading = false,
  totalCount,
  page = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  const showPagination = useMemo(
    () => totalCount !== undefined && onPageChange !== undefined,
    [totalCount, onPageChange],
  );

  const handlePageChange = useCallback(
    (_: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
      onPageChange?.(newPage);
    },
    [onPageChange],
  );

  const handleRowsPerPageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onPageSizeChange?.(Number(e.target.value));
      onPageChange?.(0);
    },
    [onPageSizeChange, onPageChange],
  );

  return (
    <Paper>
      <TableContainer>
        <Table size="small">
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell key={header.id} sx={styles.headerCell}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} sx={styles.centeredCell}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} sx={styles.centeredCell}>
                  <Typography variant="body2" color="text.secondary">
                    No records found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} hover>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {showPagination && (
        <Box sx={styles.paginationContainer}>
          <TablePagination
            component="div"
            count={totalCount!}
            page={page}
            rowsPerPage={pageSize}
            rowsPerPageOptions={[5, 10, 25, 50]}
            onPageChange={handlePageChange}
            onRowsPerPageChange={onPageSizeChange ? handleRowsPerPageChange : undefined}
          />
        </Box>
      )}
    </Paper>
  );
}) as <TData>(props: DataTableProps<TData>) => React.ReactElement;
