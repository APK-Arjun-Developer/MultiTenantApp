import React, { useCallback, useMemo } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
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
import { flexRender, getCoreRowModel, type Header, useReactTable } from '@tanstack/react-table';

import { DEFAULT_PAGE_SIZE } from '@/shared/constants/list';

import Icon from '../Icon';
import { styles } from './styles';
import type { DataTableProps } from './types';

const DataTable = React.memo(
  <TData,>({
    data,
    columns,
    isLoading = false,
    isError = false,
    onRetry,
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

    const renderHeaderContent = (header: Header<TData, unknown>, isSortable: boolean) => {
      if (header.isPlaceholder) return null;
      const content = flexRender(header.column.columnDef.header, header.getContext());
      if (!isSortable) return content;
      const isActive = sortBy === header.column.id;
      return (
        <TableSortLabel
          active={isActive}
          direction={isActive ? (sortOrder ?? 'asc') : 'asc'}
          onClick={() => handleSortClick(header.column.id)}
        >
          {content}
        </TableSortLabel>
      );
    };

    /** A single full-width row for the loading, error and empty states. */
    const renderStatusRow = (content: React.ReactNode) => (
      <TableRow>
        <TableCell colSpan={columns.length} sx={styles.centeredCell}>
          {content}
        </TableCell>
      </TableRow>
    );

    const renderBody = () => {
      if (isLoading) return renderStatusRow(<CircularProgress size={24} />);

      if (isError) {
        return renderStatusRow(
          <Box sx={styles.emptyState}>
            <Icon name="ErrorOutline" sx={styles.errorIcon} />
            <Typography variant="body2" color="text.secondary">
              Couldn't load data. Please try again.
            </Typography>
            {onRetry && (
              <Button size="small" variant="outlined" onClick={onRetry}>
                Retry
              </Button>
            )}
          </Box>,
        );
      }

      const { rows } = table.getRowModel();
      if (rows.length === 0) {
        return renderStatusRow(
          <Box sx={styles.emptyState}>
            <Icon name="Inbox" sx={styles.emptyIcon} />
            <Typography variant="body2" color="text.disabled">
              No records found
            </Typography>
          </Box>,
        );
      }

      return rows.map((row) => (
        <TableRow key={row.id} hover>
          {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          ))}
        </TableRow>
      ));
    };

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
                    return (
                      <TableCell
                        key={header.id}
                        sx={isSortable ? styles.sortableHeaderCell : styles.headerCell}
                      >
                        {renderHeaderContent(header, isSortable)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableHead>
            <TableBody>{renderBody()}</TableBody>
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
