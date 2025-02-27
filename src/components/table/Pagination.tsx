import {
    ChevronLeft,
    ChevronRight,
    ChevronsRight,
    ChevronsLeft
} from 'lucide-react';
import { Table } from "@tanstack/react-table";
import { Button } from '@/components/ui/button';

interface DataTablePaginationProps<TData> {
    table: Table<TData>;
    isFetching?: boolean;
}

export default function DataTablePagination<TData>({
    table,
    isFetching
}: DataTablePaginationProps<TData>) {
    const { pageIndex, pageSize } = table.getState().pagination;
    const pageCount = table.getPageCount();
    const totalRows = table.getFilteredRowModel().rows.length;
    const selectedRows = table.getFilteredSelectedRowModel().rows.length;

    return (
            <div className="flex items-center justify-between py-1">
                    <div className="flex-1 text-sm text-muted-foreground">
                            {selectedRows} of {totalRows} row(s) selected.
                    </div>
                    <div className="flex items-center space-x-6 lg:space-x-8">
                            {/* Rows Per Page Display */}
                            <p className="text-sm font-medium">Rows per page: {pageSize}</p>

                            {/* Pagination Info */}
                            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                                    Page {pageIndex + 1} of {pageCount}
                            </div>

                            {/* Pagination Controls */}
                            <div className="flex items-center space-x-2">
                                    <Button
                                            variant="outline"
                                            className="hidden h-8 w-8 p-0 lg:flex"
                                            onClick={() => table.setPageIndex(0)}
                                            disabled={!table.getCanPreviousPage() || isFetching}
                                    >
                                            <span className="sr-only">Go to first page</span>
                                            <ChevronsLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                            variant="outline"
                                            className="h-8 w-8 p-0"
                                            onClick={() => table.previousPage()}
                                            disabled={!table.getCanPreviousPage() || isFetching}
                                    >
                                            <span className="sr-only">Go to previous page</span>
                                            <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                            variant="outline"
                                            className="h-8 w-8 p-0"
                                            onClick={() => table.nextPage()}
                                            disabled={!table.getCanNextPage() || isFetching}
                                    >
                                            <span className="sr-only">Go to next page</span>
                                            <ChevronRight className="h-4 w-4" />
                                    </Button>
                                    <Button
                                            variant="outline"
                                            className="hidden h-8 w-8 p-0 lg:flex"
                                            onClick={() => table.setPageIndex(pageCount - 1)}
                                            disabled={!table.getCanNextPage() || isFetching}
                                    >
                                            <span className="sr-only">Go to last page</span>
                                            <ChevronsRight className="h-4 w-4" />
                                    </Button>
                            </div>
                    </div>
            </div>
    );
}
