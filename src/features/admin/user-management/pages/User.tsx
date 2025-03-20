import React from 'react';
import useDisclosure from '@/hooks/useDisclosure';
import { Button } from '@/components/ui/button'
import UserTable from '../components/table/UserTable';
import CreateUser from '../components/modals/CreateUser';
import UpdateUser from '../components/modals/UpdateUser';
import { UserContextProvider } from '../components/context/UserContext';
import { UserRoundPlus, CodeXml } from 'lucide-react'
import { RowSelectionState } from '@tanstack/react-table';
import { userTableType } from '../types';

interface UserProps {

}

const User: React.FC<UserProps> = () => {
    const userDisclosure = useDisclosure();

    // State for row selection
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
    const [selectedRows, setSelectedRows] = React.useState<userTableType[]>([]);
    const [clickedRow, setClickedRow] = React.useState<userTableType | null>(null);

    React.useEffect(() => {
        console.log('rowSelection', rowSelection)
    }, [rowSelection])

    return (
        <div className='grid gap-3 pl-2 pr-2'>
            {/* HEADER */}
            <div className='flex w-full items-center justify-end rounded-xs p-3 h-12 gap-x-4 bg-gray-50 shadow-2xs'>
                <Button variant={'ghost'} className='p-2 h-7 hover:bg-gray-400 gap-1.5' onClick={userDisclosure.onOpen}>
                    <UserRoundPlus/>
                    Create User
                </Button>
                <Button variant={'ghost'} className='p-2 h-7 hover:bg-gray-400 gap-1.5' onClick={() => console.log('selectedRows',selectedRows)}><CodeXml/>
                log selectedRows
                </Button>
                <Button variant={'ghost'} className='p-2 h-7 hover:bg-gray-400 gap-1.5' onClick={() => console.log('clickedRow',clickedRow)}><CodeXml/>
                log clickedRow
                </Button>
            </div>
            <div className='rounded-xs h-full bg-gray-50 shadow-2xs p-4'>
                <UserContextProvider>
                    <UserTable
                        rowSelection={rowSelection}
                        setRowSelection={setRowSelection}
                        selectedRows={selectedRows}
                        setSelectedRows={setSelectedRows}
                        clickedRow={clickedRow}
                        setClickedRow={setClickedRow}
                        openUpdateModal={userDisclosure.onOpen} 
                    />
                </UserContextProvider>
            </div>
            <CreateUser isOpen={userDisclosure.open} onClose={userDisclosure.onClose}/>
            <UpdateUser isOpen={userDisclosure.open && selectedRows !== null} onClose={userDisclosure.onClose} selectedUser={clickedRow} />
        </div>
    );
}

export default User;