import React from 'react';
import {Button} from '@/components/ui/button'
import UserTable from '../components/table/UserTable';
import CreateUser from '../components/modals/CreateUser';
import useDisclosure from '@/hooks/useDisclosure';
import { UserContextProvider } from '../components/context/UserContext';

interface UserProps {

}

const User: React.FC<UserProps> = () => {
    const createUser = useDisclosure();
   
    return (<div className='grid gap-2' >
         <div className='flex w-full justify-end'>
            <Button variant={'outline'} onClick={createUser.onOpen}>Create User</Button>
        </div>
        <div>
            <UserContextProvider>
                <UserTable/>
            </UserContextProvider>
        </div>
        <CreateUser isOpen={createUser.open} onClose={createUser.onClose}/>
    </div>);
}

export default User