import APITable from '@/components/table/APITable';
import { ColumnDef } from '@tanstack/react-table';
import React, { useContext } from 'react'
import { userTableType } from '../../types';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import useDisclosure from '@/hooks/useDisclosure';
import CreateAppKey from '../modals/CreateAppKey';
import { UserContext } from '../context/UserContext';
import UpdateUserStatus from '../modals/UpdateUserStatus';

import {Pencil} from 'lucide-react'
import UpdateRole from '../modals/UpdateRole';

interface UserTableProps {

}

const UserTable: React.FC<UserTableProps> = () => {
    const {state,setState} = useContext(UserContext);
    const updateAppKey = useDisclosure();
    const updateStatus = useDisclosure();
    const updateRole = useDisclosure();
   
    const columns: ColumnDef<userTableType>[] = [
        {
            header:'User Name',
            accessorKey:'username'
        },
        {
            header:'Role Name',
            accessorKey:'role_name',
            cell: props => {
                return <div className='flex gap-3 items-center'>
                    {props.getValue() as string} <Button size='sm' variant={'outline'} onClick={updateRole.onOpen}><Pencil/></Button>
                </div>
            }
        },
        {
            header: 'Status',
            accessorKey:'is_active',
            cell: props => props.getValue() === 1 ? 'Active' : 'Inactive'
        },
        {
            header:'App Key',
            accessorKey:'app_key',
            cell: props => {
               
                const getAppKey = () => {
                    navigator.clipboard.writeText(props.getValue() as string)
                    toast.success('App key is copied!')
                }

                return <Button size={'sm'} onClick={getAppKey} >Copy App Key</Button>
            }
        },
        {
            header:'Action',
            cell: props => {
                const data = props.row.original;
                const isActive = props.row.original.is_active === 1
                const setSelectedData = () => {
                    setState({
                        ...state,
                        id: data.id,
                        is_active: data.is_active,
                        username: data.username,
                        app_key: data.app_key,
                        role_id: data.role_id,
                        role_name: data.role_name
                    })
                }
               
                const handleUpdateAppKey = () => {
                    updateAppKey.onOpen();
                    setSelectedData();
                }

                const handleUpdateStatus = () => {
                    updateStatus.onOpen();
                    setSelectedData();
                }

                return (
                    <div className='grid grid-flow-col gap-1 w-60'>
                        <Button size={'sm'}>Reset Password</Button>
                        <Button size={'sm'} onClick={handleUpdateAppKey}>Change App Key</Button>
                        <Button size={'sm'} onClick={handleUpdateStatus} variant={isActive ? 'destructive': 'default'}>{isActive ? 'Deactivate' : 'Activate'}</Button>
                    </div>
                )
            }
        }, 
    ]

    return(<div>
            <APITable
                columns={columns}
                route='/user'
            />
            <CreateAppKey       isOpen={updateAppKey.open} onClose={updateAppKey.onClose}/>
            <UpdateUserStatus   isOpen={updateStatus.open} onClose={updateStatus.onClose}/>
            <UpdateRole         isOpen={updateRole.open}   onClose={updateRole.onClose}/>
      </div>);
}

export default UserTable