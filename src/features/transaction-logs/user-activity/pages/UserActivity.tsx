import React from 'react';
// import useDisclosure from '@/hooks/useDisclosure';
// import { Button } from '@/components/ui/button'
import UserActivityTable from '../components/table/UserActvityTable';
import { UserActivityContextProvider } from '../components/context/UserActivityContext';
// import { UserRoundPlus, CodeXml } from 'lucide-react'
import { RowSelectionState } from '@tanstack/react-table';
// import { userActivityTableType } from '../types';

interface UserActivityProps {
}

const UserActivity: React.FC<UserActivityProps> = () => {
    // const userActivityDisclosure = useDisclosure();

    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
    // const [selectedRows, setSelectedRows] = React.useState<userActivityTableType[]>([]);
    // const [clickedRow, setClickedRow] = React.useState<userActivityTableType | null>(null);

    // React.useEffect(() => {
    //     console.log('rowSelection', rowSelection)
    // }, [rowSelection])

    return (
        <div className='grid gap-3 pl-2 pr-2'>
            {/* HEADER */}
            <div className='flex w-full items-center justify-end rounded-xs p-3 h-12 gap-x-4 bg-gray-50 shadow-2xs'>
                {/* <Button variant={'ghost'} className='p-2 h-7 hover:bg-gray-400 gap-1.5' onClick={() => userActivityDisclosure.onOpen('createUserActivity') }>
                    <UserRoundPlus/>
                    Create UserActivity
                </Button>
                <Button variant={'ghost'} className='p-2 h-7 hover:bg-gray-400 gap-1.5' onClick={() => console.log('selectedRows',selectedRows)}><CodeXml/>
                log selectedRows
                </Button>
                <Button variant={'ghost'} className='p-2 h-7 hover:bg-gray-400 gap-1.5' onClick={() => console.log('clickedRow',clickedRow)}><CodeXml/>
                log clickedRow
                </Button> */}
            </div>
            <div className='rounded-xs h-full bg-gray-50 shadow-2xs p-4'>
                <UserActivityContextProvider>
                    <UserActivityTable
                        rowSelection={rowSelection}
                        setRowSelection={setRowSelection}
                        // selectedRows={selectedRows}
                        // setSelectedRows={setSelectedRows}
                        // clickedRow={clickedRow}
                        // setClickedRow={setClickedRow}
                    />
                </UserActivityContextProvider>
            </div>
        </div>
    );
}

export default UserActivity;