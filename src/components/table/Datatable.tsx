import React, { useState } from "react";
import {
    ColumnDef,
    OnChangeFn,
    PaginationState,
    SortingState,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    useReactTable,
    RowSelectionState
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import DataTablePagination from "./Pagination";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { RefreshCw, ArrowUpAZ, ArrowDownAZ } from "lucide-react";

interface DatatableProps<TData, TValue> {
    data: TData[];
    columns: ColumnDef<TData, TValue>[];
    pageCount?: number;
    count?: number;
    manualPagination?: boolean;
    isLoading?: boolean;
    setPagination?: OnChangeFn<PaginationState>;
    onSortingChange?: OnChangeFn<SortingState>; /* Sorting update handler */
    onSearchChange?: (search: string) => void;
    onRefresh?: () => void;
    state?: {
        pagination?: PaginationState;
        sorting?: SortingState;
        rowSelection: RowSelectionState;
    };
    apiStatus?: string;
    onRowSelectionChange?: OnChangeFn<RowSelectionState>;
    onSelectedRowsChange?: (selectedRows: TData[]) => void;
}

function DataTable<TData, TValue>({ columns, data, ...props }: DatatableProps<TData, TValue>) {
    const [search, setSearch] = useState("");
    const [isRefreshDisabled, setIsRefreshDisabled] = useState(false);

    const table = useReactTable({
        data,
        columns,
        pageCount: props.pageCount,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(), /* Enable filtering */
        manualPagination: props.manualPagination,
        onPaginationChange: props.setPagination,
        onSortingChange: props.onSortingChange,
        state: {
            ...props.state,
            pagination: props.state?.pagination,
            sorting: props.state?.sorting ?? [],
            globalFilter: search,
            rowSelection: props.state?.rowSelection,
        },
        enableRowSelection: true,
        onRowSelectionChange: props.onRowSelectionChange
    });

    const handleRefresh = () => {
        if(isRefreshDisabled) return; /* Prevent multiple clicks */

        setIsRefreshDisabled(true);
        props.onRefresh?.();

        setTimeout(() => {
            setIsRefreshDisabled(false); /* Re-enable after 10 seconds */
        }, 10000);
    };

    React.useEffect(() => {
        props.onSearchChange?.(search); /* Trigger search update in parent */
    }, [search]);

    React.useEffect(() => {
        if(props.onSelectedRowsChange) {
            const selectedRows = table.getSelectedRowModel().rows.map(row => row.original);
            props.onSelectedRowsChange(selectedRows);
        }
    }, [table.getSelectedRowModel().rows]);

    return (
        <div className="pl-2 pr-3">
            <div className="flex justify-between pb-3">
                <div className="flex gap-1">
                    <Input className="h-8"
                        id="searchBox"
                        placeholder="Search"
                        value={search} /* Bind value */
                        onChange={(e) => {
                            setSearch(e.target.value); /* Update local state */
                            props.onSearchChange?.(e.target.value); /* Also update the parent */
                        }}
                    />
                    <Button variant="outline" className="cursor-pointer h-8 w-8 hover:bg-gray-400" onClick={() => handleRefresh()} disabled={isRefreshDisabled} >
                        <RefreshCw className="h-4 w-4"/>
                    </Button>
                </div>
                <div className="flex items-center gap-2 justify-between">
                    <span className="text-xs font-light text-gray-400">{props.apiStatus}</span>
                    <span className="text-2xl font-light text-gray-500">{'|'}</span>
                    <span className="font-sans text-sm font-semibold">
                        Total Rows: {props.manualPagination ? props.count : data.length}
                    </span>
                </div>
            </div>
            <div className="rounded-md border border-gray-300">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className="font-sans font-bold text-black cursor-pointer"
                                        onClick={header.column.getToggleSortingHandler()}
                                    >
                                        {!header.isPlaceholder &&
                                            flexRender(header.column.columnDef.header, header.getContext())}
                                        {header.column.getIsSorted() === "asc" ? <ArrowDownAZ className="h-4 w-6 text-red-600 inline" /> : ""}
                                        {header.column.getIsSorted() === "desc" ? <ArrowUpAZ className="h-4 w-6 text-red-600 inline"/> : ""}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.length > 0 ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="hover:bg-gray-200 transition-colors">
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="py-3 border-t border-gray-300 text-xs">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="pt-2">
                <DataTablePagination table={table} isFetching={props.isLoading}  />
            </div>
        </div>
    );
}

export default DataTable;