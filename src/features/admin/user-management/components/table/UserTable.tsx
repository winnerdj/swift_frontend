import APITable from '@/components/table/APITable';
import { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import React from 'react';
import { userTableType } from '../../types';
import moment from 'moment';
// import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react';

interface UserTableProps {
    rowSelection: RowSelectionState;
    setRowSelection: React.Dispatch<React.SetStateAction<RowSelectionState>>;
    selectedRows: userTableType[];
    setSelectedRows: React.Dispatch<React.SetStateAction<userTableType[]>>;
    clickedRow: userTableType | null;
    setClickedRow : React.Dispatch<React.SetStateAction<userTableType | null>>;
    openUpdateModal: () => void;
}

const UserTable: React.FC<UserTableProps> = ({
    rowSelection,
    setRowSelection,
    // selectedRows,
    setSelectedRows,
    // clickedRow,
    setClickedRow,
    openUpdateModal
}) => {

    const columns: ColumnDef<userTableType>[] = [
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
                            // Call updateUser.onOpen() to show the modal
                            // updateUser.onOpen(); 
                            openUpdateModal()}}
                    ><Pencil/>
                    </Button>
                </div>
            ),
            enableSorting: false,
        },
        {
            accessorKey: 'user_id',
            header: 'User ID',
            cell: ({ row }) => (
                // <span className="text-sky-700 cursor-pointer hover:underline" >
                    <div>{row?.original?.user_id}</div>
                // </span>
            )
        },
        {
            accessorKey: 'user_role',
            header: 'Role',
        },
        {
            accessorKey: 'user_status',
            header: 'Status',
            cell: props => props.getValue() === 1 ? 'Active' : 'Inactive'
        },
        {
            accessorKey: 'user_email',
            header: 'Email Address'
        },
        {
            accessorKey: 'user_first_name',
            header: 'First Name'
        },
        {
            accessorKey: 'user_middle_name',
            header: 'Middle Name'
        },
        {
            accessorKey: 'user_last_name',
            header: 'Last Name'
        },
        {
            accessorKey: 'user_contact_no',
            header: 'Contact No'
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
                route='/user'
                rowSelection={rowSelection}
                setRowSelection={setRowSelection}
                onSelectedRowsChange={setSelectedRows}
            />
        </div>
    );
}

export default UserTable;