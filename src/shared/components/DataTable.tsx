import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table';
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

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  isLoading?: boolean;
  totalCount?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export function DataTable<TData>({
  data,
  columns,
  isLoading = false,
  totalCount,
  page = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
}: DataTableProps<TData>) {
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  const showPagination = totalCount !== undefined && onPageChange !== undefined;

  return (
    <Paper>
      <TableContainer>
        <Table size="small">
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell
                    key={header.id}
                    sx={{ fontWeight: 600, bgcolor: 'background.default', whiteSpace: 'nowrap' }}
                  >
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
                <TableCell colSpan={columns.length} sx={{ textAlign: 'center', py: 5 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} sx={{ textAlign: 'center', py: 5 }}>
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
        <Box sx={{ borderTop: 1, borderColor: 'divider' }}>
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            rowsPerPage={pageSize}
            rowsPerPageOptions={[5, 10, 25, 50]}
            onPageChange={(_, newPage) => onPageChange(newPage)}
            onRowsPerPageChange={
              onPageSizeChange
                ? (e) => {
                    onPageSizeChange(Number(e.target.value));
                    onPageChange(0);
                  }
                : undefined
            }
          />
        </Box>
      )}
    </Paper>
  );
}
