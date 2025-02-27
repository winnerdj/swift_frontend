import React from 'react';
import {Button} from '@/components/ui/button'
import UserTable from '../components/table/UserTable';
import CreateUser from '../components/modals/CreateUser';
import useDisclosure from '@/hooks/useDisclosure';
import { UserContextProvider } from '../components/context/UserContext';
import { CirclePlus } from 'lucide-react'

interface UserProps {

}

const User: React.FC<UserProps> = () => {
    const createUser = useDisclosure();

    return (
        <div className='grid gap-3 pl-2 pr-2'>
            {/* HEADER */}
            <div className='flex w-full items-center justify-end rounded-xs p-3 h-12 bg-gray-50 shadow-2xs'>
                <Button variant={'outline'} className='p-2 h-7' onClick={createUser.onOpen}>
                    <CirclePlus/>
                    Create User
                </Button>
            </div>
            <div className='rounded-xs h-full bg-gray-50 shadow-2xs p-4'>
                <UserContextProvider>
                    <UserTable/>
                </UserContextProvider>
            </div>
            <CreateUser isOpen={createUser.open} onClose={createUser.onClose}/>
        </div>
    );
}

export default User