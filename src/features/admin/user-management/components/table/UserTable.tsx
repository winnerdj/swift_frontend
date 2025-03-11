import APITable from '@/components/table/APITable';
import { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import React, { useState } from 'react';
import { userTableType } from '../../types';
import moment from 'moment';
import useDisclosure from '@/hooks/useDisclosure';
// import { UserContext } from '../context/UserContext';
import UpdateUserStatus from '../modals/UpdateUserStatus';
import UpdateRole from '../modals/UpdateRole';
import { Checkbox } from '@/components/ui/checkbox'

// interface UserTableProps {

// }

const UserTable: React.FC = () => {
    const updateStatus = useDisclosure();
    const updateRole = useDisclosure();

    // State for row selection
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [selectedRows, setSelectedRows] = useState<userTableType[]>([]);

    const columns: ColumnDef<userTableType>[] = [
        {
            id: 'select', // Unique ID for selection column
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                    className='border border-gray-400'
                />
            ),
            enableSorting: false, // Disable sorting for this column
            enableHiding: false, // Prevent hiding this column
        },
        {
            accessorKey: 'user_id',
            header: 'User ID'
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
            <UpdateUserStatus isOpen={updateStatus.open} onClose={updateStatus.onClose} />
            <UpdateRole isOpen={updateRole.open} onClose={updateRole.onClose} />
            <div onClick={() => console.log('selectedRows', selectedRows)}>
                .......
            </div>
        </div>
    );
}

export default UserTable;
