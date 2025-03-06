import APITable from '@/components/table/APITable';
import { ColumnDef } from '@tanstack/react-table';
import React from 'react'
import { userTableType } from '../../types';
import moment from 'moment';
import useDisclosure from '@/hooks/useDisclosure';
// import { UserContext } from '../context/UserContext';
import UpdateUserStatus from '../modals/UpdateUserStatus';
import UpdateRole from '../modals/UpdateRole';

interface UserTableProps {

}

const UserTable: React.FC<UserTableProps> = () => {
    // const { state, setState } = useContext(UserContext);
    const updateStatus = useDisclosure();
    const updateRole = useDisclosure();

    const columns: ColumnDef<userTableType>[] = [
        {
            accessorKey:'user_id',
            header: 'User ID'
        },
        {
            accessorKey:'user_role',
            header:'Role',
        },
        {
            accessorKey:'user_status',
            header: 'Status',
            cell: props => props.getValue() === 1 ? 'Active' : 'Inactive'
        },
        {
            accessorKey:'user_email',
            header:'Email Address'
        },
        {
            accessorKey:'user_first_name',
            header:'First Name'
        },
        {
            accessorKey:'user_middle_name',
            header:'Middle Name'
        },
        {
            accessorKey:'user_last_name',
            header:'Last Name'
        },
        {
            accessorKey:'user_contact_no',
            header:'Contact No'
        },
        {
            accessorKey:'createdBy',
            header:'Created By'
        },
        {
            accessorKey:'createdAt',
            header:'Created At',
            cell: props => {
                const date = props.getValue();
                return date ? moment(date).format('YYYY-MM-DD HH:mm') : "N/A";
            }
        },
        {
            accessorKey:'updatedBy',
            header:'Modified By'
        },
        {
            accessorKey:'updatedAt',
            header:'Modified At',
            cell: props => {
                const date = props.getValue();
                return date ? moment(date).format('YYYY-MM-DD HH:mm') : "N/A";
            }
        }
    ]

    return (
        <div>
            <APITable
                columns={columns}
                route='/user'
            />
            <UpdateUserStatus   isOpen={updateStatus.open} onClose={updateStatus.onClose}/>
            <UpdateRole         isOpen={updateRole.open}   onClose={updateRole.onClose}/>
        </div>
    )
}

export default UserTable