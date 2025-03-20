import { Dispatch, SetStateAction, useEffect, useState, useCallback } from 'react';
import { ColumnDef, RowSelectionState, SortingState, PaginationState } from '@tanstack/react-table';
import DataTable from './Datatable';
import { useGetDataQuery } from '@/lib/redux/api/data.api';
import debounce from 'lodash/debounce';

interface APITableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    route: string;
    filters?: object;
    rowSelection: RowSelectionState;
    setRowSelection: Dispatch<SetStateAction<RowSelectionState>>;
    onSelectedRowsChange?: (rows: TData[]) => void;
}

function APITable<TData, TValue>({ columns, route, 
    rowSelection, 
    setRowSelection,
    ...props }: APITableProps<TData, TValue>) {
    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 15 });   /* State for pagination */
    const [sorting, setSorting] = useState<SortingState>([]);   /* State for sorting */
    const [searchTerm, setSearchTerm] = useState<string>('');   /* State for Search */

    /* Convert sorting array to API-friendly format */
    const order = sorting.map(({ id, desc }) => `${id},${desc ? 'desc' : 'asc'}`).join(';');

    /* Debounce search function */
    const debouncedSetSearch = useCallback(debounce(setSearchTerm, 1000), []);

    /* Fetch data with pagination, sorting, and filters */
    const { data = {}, isFetching, isLoading, isSuccess, refetch } = useGetDataQuery(
        {
            route,
            pageSize: pagination.pageSize,
            pageIndex: pagination.pageIndex,
            order,
            filters: { ...props.filters, searchTerm },
        },
        {
            refetchOnMountOrArgChange: true,
        }
    );

    const apiStatus = isFetching ? 'Fetching...' : isLoading ? 'Loading...' : isSuccess ? 'Fetched ✅' : 'Idle';

    /* Handle sorting changes */
    const handleSortingChange = useCallback((updater: SortingState | ((old: SortingState) => SortingState)) => {
        setSorting(updater);
        setRowSelection({})
    }, []);

    /* Handle search updates from DataTable */
    const handleSearchChange = (query: string) => {
        debouncedSetSearch(query);
    };

    useEffect(() => {
        if(props.onSelectedRowsChange) {
            const selectedRowIndexes = Object.keys(rowSelection).map((key) => parseInt(key)); // Get selected indexes
            const selectedRows = selectedRowIndexes
                .map((index) => data.rows?.[index]) // Get rows from data
                .filter((row) => row !== undefined); // Remove undefined rows

            props.onSelectedRowsChange(selectedRows);
        }
    }, [rowSelection, data]);

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
                sorting,
                rowSelection,
            }}
            onSortingChange={handleSortingChange}
            onSearchChange={handleSearchChange}
            onRowSelectionChange={setRowSelection}
            onRefresh={refetch}
            apiStatus={apiStatus}
        />
    );
}

export default APITable;