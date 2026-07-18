import React, { useCallback, useMemo } from 'react';
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
import TableSortLabel from '@mui/material/TableSortLabel';
import Typography from '@mui/material/Typography';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';

import { DEFAULT_PAGE_SIZE } from '@/shared/constants/list';

import Icon from '../Icon';
import { styles } from './styles';
import type { DataTableProps } from './types';

const DataTable = React.memo(
  <TData,>({
    data,
    columns,
    isLoading = false,
    totalCount,
    page = 0,
    pageSize = DEFAULT_PAGE_SIZE,
    onPageChange,
    onPageSizeChange,
    sortBy,
    sortOrder,
    sortableColumns,
    onSortChange,
  }: DataTableProps<TData>) => {
    const table = useReactTable({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
      manualPagination: true,
    });

    const handleSortClick = useCallback(
      (columnId: string) => {
        if (!onSortChange) return;
        if (sortBy === columnId) {
          if (sortOrder === 'asc') {
            onSortChange(columnId, 'desc');
          } else {
            onSortChange(undefined, undefined);
          }
        } else {
          onSortChange(columnId, 'asc');
        }
      },
      [sortBy, sortOrder, onSortChange],
    );

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
      <Paper variant="outlined" sx={styles.paper}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const isSortable =
                      !!sortableColumns?.includes(header.column.id) && !!onSortChange;
                    const isActive = sortBy === header.column.id;
                    return (
                      <TableCell
                        key={header.id}
                        sx={isSortable ? styles.sortableHeaderCell : styles.headerCell}
                      >
                        {header.isPlaceholder ? null : isSortable ? (
                          <TableSortLabel
                            active={isActive}
                            direction={isActive ? (sortOrder ?? 'asc') : 'asc'}
                            onClick={() => handleSortClick(header.column.id)}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </TableSortLabel>
                        ) : (
                          flexRender(header.column.columnDef.header, header.getContext())
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} sx={styles.centeredCell}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} sx={styles.centeredCell}>
                    <Box sx={styles.emptyState}>
                      <Icon name="Inbox" sx={styles.emptyIcon} />
                      <Typography variant="body2" color="text.disabled">
                        No records found
                      </Typography>
                    </Box>
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
              count={totalCount ?? 0}
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
  },
) as <TData>(props: DataTableProps<TData>) => React.ReactElement;
export default DataTable;
