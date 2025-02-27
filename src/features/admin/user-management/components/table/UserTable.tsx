import APITable from '@/components/table/APITable';
import { ColumnDef } from '@tanstack/react-table';
import React, { useContext } from 'react'
import { userTableType } from '../../types';
import moment from 'moment';
import useDisclosure from '@/hooks/useDisclosure';
import CreateAppKey from '../modals/CreateAppKey';
// import { UserContext } from '../context/UserContext';
import UpdateUserStatus from '../modals/UpdateUserStatus';
import UpdateRole from '../modals/UpdateRole';

interface UserTableProps {

}

const UserTable: React.FC<UserTableProps> = () => {
    // const { state, setState } = useContext(UserContext);
    const updateAppKey = useDisclosure();
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
                return date ? moment(date).format('MM-DD-YYYY HH:mm') : "N/A";
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
                return date ? moment(date).format('MM-DD-YYYY HH:mm') : "N/A";
            }
        }
        // ,{
        //     header:'Action',
        //     cell: props => {
        //         const data = props.row.original;
        //         const isActive = props.row.original.is_active === 1
        //         const setSelectedData = () => {
        //             setState({
        //                 ...state,
        //                 id: data.id,
        //                 is_active: data.is_active,
        //                 username: data.username,
        //                 app_key: data.app_key,
        //                 role_id: data.role_id,
        //                 role_name: data.role_name
        //             })
        //         }

        //         const handleUpdateAppKey = () => {
        //             updateAppKey.onOpen();
        //             setSelectedData();
        //         }

        //         const handleUpdateStatus = () => {
        //             updateStatus.onOpen();
        //             setSelectedData();
        //         }

        //         return (
        //             <div className='grid grid-flow-col gap-1 w-60'>
        //                 <Button size={'sm'}>Reset Password</Button>
        //                 <Button size={'sm'} onClick={handleUpdateAppKey}>Change App Key</Button>
        //                 <Button size={'sm'} onClick={handleUpdateStatus} variant={isActive ? 'destructive': 'default'}>{isActive ? 'Deactivate' : 'Activate'}</Button>
        //             </div>
        //         )
        //     }
        // }
    ]

    return (
        <div>
            <APITable
                columns={columns}
                route='/user'
            />
            <CreateAppKey       isOpen={updateAppKey.open} onClose={updateAppKey.onClose}/>
            <UpdateUserStatus   isOpen={updateStatus.open} onClose={updateStatus.onClose}/>
            <UpdateRole         isOpen={updateRole.open}   onClose={updateRole.onClose}/>
        </div>
    )
}

export default UserTable