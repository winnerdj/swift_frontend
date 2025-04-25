import APITable from '@/components/table/APITable';
import { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import React from 'react';
import { roleTableType } from '../../types';
import moment from 'moment';
// import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react';

interface RoleTableProps {
    rowSelection: RowSelectionState;
    setRowSelection: React.Dispatch<React.SetStateAction<RowSelectionState>>;
    selectedRows: roleTableType[];
    setSelectedRows: React.Dispatch<React.SetStateAction<roleTableType[]>>;
    clickedRow: roleTableType | null;
    setClickedRow : React.Dispatch<React.SetStateAction<roleTableType | null>>;
    openUpdateModal: () => void;
}

const RoleTable: React.FC<RoleTableProps> = ({
    rowSelection,
    setRowSelection,
    // selectedRows,
    setSelectedRows,
    // clickedRow,
    setClickedRow,
    openUpdateModal
}) => {

    const columns: ColumnDef<roleTableType>[] = [
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
                            // Call updateRole.onOpen() to show the modal
                            // updateRole.onOpen();
                            openUpdateModal()}}
                    ><Pencil/>
                    </Button>
                </div>
            ),
            enableSorting: false,
        },
        {
            accessorKey: 'role_name',
            header: 'Role',
        },
        {
            accessorKey: 'role_status',
            header: 'Status',
            cell: props => props.getValue() ? 'Active' : 'Inactive'
        },
        {
            accessorKey: 'role_description',
            header: 'Description'
        },
        {
            accessorKey: 'role_remarks1',
            header: 'Remarks1'
        },
        {
            accessorKey: 'role_remarks2',
            header: 'Remarks2'
        },
        {
            accessorKey: 'role_remarks3',
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
                route='/role'
                rowSelection={rowSelection}
                setRowSelection={setRowSelection}
                onSelectedRowsChange={setSelectedRows}
            />
        </div>
    );
}

export default RoleTable;