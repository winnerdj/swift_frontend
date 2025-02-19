/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import DataTable from './Datatable';
import {ColumnDef, PaginationState} from '@tanstack/react-table';
import { useGetDataQuery } from '@/lib/redux/api/data.api';

interface APITableProps <TData, TValue>{
    columns: ColumnDef<TData, TValue>[],
    route: string;
    filters?:object;
}

function APITable <TData, TValue>({columns,route,...props}: APITableProps<TData,TValue>) {
    const [{pageIndex,pageSize},setPagination] = React.useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10
    })

    const {data={}, isFetching} = useGetDataQuery({
        route,
        result: pageSize,
        page: pageIndex,
        filters:{
            ...props.filters
        }
    })
   
    // React.useEffect(() => {
    //     console.log(props.filters)
    // },[props.filters])

    return <DataTable
        columns={columns}
        data={data.rows ?? []}
        setPagination={setPagination}
        pageCount={data.pageCount}
        count={data.count}
        manualPagination
        isLoading={isFetching}
        state={{
            pagination: {
                pageIndex,
                pageSize
            }
        }}
    />;
}

export default APITable;