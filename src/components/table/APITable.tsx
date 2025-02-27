/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import DataTable from './Datatable';
import { ColumnDef, PaginationState, SortingState } from '@tanstack/react-table';
import { useGetDataQuery } from '@/lib/redux/api/data.api';

interface APITableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    route: string;
    filters?: object;
}

function APITable<TData, TValue>({ columns, route, ...props }: APITableProps<TData, TValue>) {
    {/* State for pagination */}
    const [pagination, setPagination] = React.useState<PaginationState>({
        pageIndex: 0,
        pageSize: 15
    });

    {/* State for sorting */}
    const [sorting, setSorting] = React.useState<SortingState>([]);

    {/* State for sorting */}
    // ✅ Convert sorting array to API-friendly format
    const order = sorting.map(({ id, desc }) => `${id},${desc ? 'desc' : 'asc'}`).join(';');

    {/* Fetch data with pagination, sorting, and filters */}
    const { data = {}, isFetching } = useGetDataQuery({
        route,
        pageSize: pagination.pageSize,
        pageIndex: pagination.pageIndex,
        order,
        filters: { ...props.filters }
    }, {
        refetchOnMountOrArgChange: true
    });

    {/* Handle sorting changes */}
    const handleSortingChange = React.useCallback((updater: SortingState | ((old: SortingState) => SortingState)) => {
        setSorting(updater);
    }, []);

    {/* Log filter changes for debugging */}
    React.useEffect(() => {
        console.log(props.filters);
    }, [props.filters]);

    return (
        <DataTable
            columns={columns}
            data={data.rows ?? []}
            setPagination={setPagination}
            pageCount={data.pageCount}
            count={data.count}
            manualPagination
            isLoading={isFetching}
            state={{
                pagination,
                sorting
            }}
            onSortingChange={handleSortingChange}
        />
    );
}

export default APITable;