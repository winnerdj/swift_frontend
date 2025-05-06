import APITable from '@/components/table/APITable';
import { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import React, { useCallback } from 'react';
import { quickcodeTableType } from '../../types';
import moment from 'moment';
// import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react';

interface QuickcodeTableProps {
    rowSelection: RowSelectionState;
    setRowSelection: React.Dispatch<React.SetStateAction<RowSelectionState>>;
    selectedRows: quickcodeTableType[];
    setSelectedRows: React.Dispatch<React.SetStateAction<quickcodeTableType[]>>;
    clickedRow: quickcodeTableType | null;
    setClickedRow : React.Dispatch<React.SetStateAction<quickcodeTableType | null>>;
    openUpdateModal: () => void;
}

const QuickcodeTable: React.FC<QuickcodeTableProps> = ({
    rowSelection,
    setRowSelection,
    setSelectedRows,
    setClickedRow,
    openUpdateModal
}) => {

    const handleSelectedRowsChange = useCallback((rows: quickcodeTableType[]) => {
        setSelectedRows(rows);
    }, [setSelectedRows]);

    const columns: ColumnDef<quickcodeTableType>[] = [
        // {
        //     id: 'select', // Unique ID for selection column
        //     header: ({ table }) => (
        //         <Checkbox
        //             checked={table.getIsAllPageRowsSelected()}
        //             onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        //             aria-label="Select all"
        //         />
        //     ),
        //     cell: ({ row }) => (
        //         <Checkbox
        //             checked={row.getIsSelected()}
        //             onCheckedChange={(value) => row.toggleSelected(!!value)}
        //             aria-label="Select row"
        //             className='border border-gray-400'
        //         />
        //     ),
        //     enableSorting: false, // Disable sorting for this column
        //     enableHiding: false, // Prevent hiding this column
        // },
        {
            accessorKey: 'action_update ',
            header: 'Actions',
            cell: ({ row }) => (
                <div className='flex justify-center'>
                    <Button variant={'ghost'} className='p-2 h-7 hover:bg-gray-400 gap-1.5'
                        onClick={() => {
                            setClickedRow(row.original);
                            // Call updateQuickcode.onOpen() to show the modal
                            // updateQuickcode.onOpen();
                            openUpdateModal()}}
                    ><Pencil/>
                    </Button>
                </div>
            ),
            enableSorting: false,
        },
        {
            accessorKey: 'qc_type',
            header: 'Quickcode Type',
        },
        {
            accessorKey: 'qc_code',
            header: 'Quick Code ',
        },
        {
            accessorKey: 'qc_status',
            header: 'Status',
            cell: props => props.getValue() ? 'Active' : 'Inactive'
        },
        {
            accessorKey: 'qc_description',
            header: 'Description'
        },
        {
            accessorKey: 'qc_alternative_code1',
            header: 'Alt Code1'
        },
        {
            accessorKey: 'qc_alternative_code2',
            header: 'Alt Code2'
        },
        {
            accessorKey: 'qc_alternative_code3',
            header: 'Alt Code3'
        },
        {
            accessorKey: 'qc_remarks1',
            header: 'Remarks1'
        },
        {
            accessorKey: 'qc_remarks2',
            header: 'Remarks2'
        },
        {
            accessorKey: 'qc_remarks3',
            header: 'Remarks3'
        },
        {
            accessorKey: 'createdBy',
            header: 'Created By'
        },
        {
            accessorKey: 'createdAt',
            header: 'Created At',
            cell: props => {
                const date = props.getValue();
                return date ? moment(date).format('YYYY-MM-DD HH:mm') : "N/A";
            }
        },
        {
            accessorKey: 'updatedBy',
            header: 'Modified By'
        },
        {
            accessorKey: 'updatedAt',
            header: 'Modified At',
            cell: props => {
                const date = props.getValue();
                return date ? moment(date).format('YYYY-MM-DD HH:mm') : "N/A";
            }
        }
    ];

    return (
        <div>
            <APITable
                columns={columns}
                route='/quickcode'
                rowSelection={rowSelection}
                setRowSelection={setRowSelection}
                onSelectedRowsChange={handleSelectedRowsChange}
            />
        </div>
    );
}

export default QuickcodeTable;