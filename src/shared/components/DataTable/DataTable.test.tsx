import type { ColumnDef } from '@tanstack/react-table';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';

import DataTable from '.';

interface Row {
  id: string;
  name: string;
}

const columns: ColumnDef<Row>[] = [{ accessorKey: 'name', header: 'Name' }];
const rows: Row[] = [
  { id: '1', name: 'Acme' },
  { id: '2', name: 'Globex' },
];

describe('DataTable', () => {
  it('renders a row per item', () => {
    render(<DataTable data={rows} columns={columns} />);

    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Acme' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Globex' })).toBeInTheDocument();
  });

  it('shows a spinner while loading', () => {
    render(<DataTable data={[]} columns={columns} isLoading />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows the empty state when there are no rows', () => {
    render(<DataTable data={[]} columns={columns} />);

    expect(screen.getByText('No records found')).toBeInTheDocument();
  });

  it('shows the error state with a working Retry instead of the empty state', async () => {
    const onRetry = vi.fn();
    render(<DataTable data={[]} columns={columns} isError onRetry={onRetry} />);

    expect(screen.getByText("Couldn't load data. Please try again.")).toBeInTheDocument();
    expect(screen.queryByText('No records found')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('hides Retry when no handler is given', () => {
    render(<DataTable data={[]} columns={columns} isError />);

    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
  });

  it('shows an active sort column as ascending when no order is given', () => {
    render(
      <DataTable
        data={rows}
        columns={columns}
        sortableColumns={['name']}
        onSortChange={vi.fn()}
        sortBy="name"
      />,
    );

    expect(screen.getByRole('columnheader', { name: /Name/ })).toHaveAttribute(
      'aria-sort',
      'ascending',
    );
  });

  it('renders grouped column headers with placeholders above ungrouped columns', () => {
    const grouped: ColumnDef<Row>[] = [
      { accessorKey: 'id', header: 'ID' },
      { header: 'Company', columns: [{ accessorKey: 'name', header: 'Name' }] },
    ];

    render(<DataTable data={rows} columns={grouped} />);

    const headerRows = screen.getAllByRole('row').slice(0, 2);
    expect(within(headerRows[0]).getByText('Company')).toBeInTheDocument();
    expect(within(headerRows[0]).queryByText('ID')).not.toBeInTheDocument();
    expect(within(headerRows[1]).getByText('ID')).toBeInTheDocument();
    expect(within(headerRows[1]).getByText('Name')).toBeInTheDocument();
  });

  it('cycles sort order asc → desc → none', async () => {
    const onSortChange = vi.fn();
    const { rerender } = render(
      <DataTable
        data={rows}
        columns={columns}
        sortableColumns={['name']}
        onSortChange={onSortChange}
      />,
    );
    const header = () => screen.getByRole('button', { name: 'Name' });

    await userEvent.click(header());
    expect(onSortChange).toHaveBeenLastCalledWith('name', 'asc');

    rerender(
      <DataTable
        data={rows}
        columns={columns}
        sortableColumns={['name']}
        onSortChange={onSortChange}
        sortBy="name"
        sortOrder="asc"
      />,
    );
    await userEvent.click(header());
    expect(onSortChange).toHaveBeenLastCalledWith('name', 'desc');

    rerender(
      <DataTable
        data={rows}
        columns={columns}
        sortableColumns={['name']}
        onSortChange={onSortChange}
        sortBy="name"
        sortOrder="desc"
      />,
    );
    await userEvent.click(header());
    expect(onSortChange).toHaveBeenLastCalledWith(undefined, undefined);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<DataTable data={rows} columns={columns} />);

    expect(await axe(container)).toHaveNoViolations();
  });

  describe('pagination', () => {
    it('is hidden without a total count and page handler', () => {
      render(<DataTable data={rows} columns={columns} />);

      expect(screen.queryByRole('button', { name: 'Go to next page' })).not.toBeInTheDocument();
    });

    it('pages forward and resets to the first page when the page size changes', async () => {
      const onPageChange = vi.fn();
      const onPageSizeChange = vi.fn();
      render(
        <DataTable
          data={rows}
          columns={columns}
          totalCount={30}
          pageSize={10}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />,
      );

      await userEvent.click(screen.getByRole('button', { name: 'Go to next page' }));
      expect(onPageChange).toHaveBeenLastCalledWith(1);

      await userEvent.click(screen.getByRole('combobox', { name: /Rows per page/ }));
      await userEvent.click(await screen.findByRole('option', { name: '25' }));
      expect(onPageSizeChange).toHaveBeenCalledWith(25);
      expect(onPageChange).toHaveBeenLastCalledWith(0);
    });

    it('ignores sort clicks without a sort handler', async () => {
      render(<DataTable data={rows} columns={columns} sortableColumns={['name']} />);

      expect(screen.queryByRole('button', { name: 'Name' })).not.toBeInTheDocument();
    });
  });
});
