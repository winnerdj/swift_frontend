import {
    ColumnDef,
    OnChangeFn,
    PaginationState,
    SortingState,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
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
    state?: {
        pagination?: PaginationState;
        sorting?: SortingState;
    };
}

function DataTable<TData, TValue>({ columns, data, ...props }: DatatableProps<TData, TValue>) {
    const table = useReactTable({
        data,
        columns,
        pageCount: props.pageCount,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        manualPagination: props.manualPagination,
        onPaginationChange: props.setPagination,
        onSortingChange: props.onSortingChange,
        state: {
            pagination: props.state?.pagination,
            sorting: props.state?.sorting ?? [],
        },
    });

    return (
        <div className="pl-2 pr-3">
            <div className="flex justify-between pb-3">
                <div className="flex gap-1">
                    <Input className="h-8" placeholder="Search" />
                    <Button variant="ghost" className="h-8" size="icon">
                        <RefreshCw className="text-gray-600 h-3" />
                    </Button>
                </div>
                <span className="font-sans text-sm font-semibold self-end">
                    Total Rows: {props.manualPagination ? props.count : data.length}
                </span>
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
                                        {header.column.getIsSorted() === "asc" ? <ArrowUpAZ className="h-4 w-6 text-red-600 inline" /> : ""}
                                        {header.column.getIsSorted() === "desc" ? <ArrowDownAZ className="h-4 w-6 text-red-600 inline"/> : ""}
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