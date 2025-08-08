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

    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

    return (
        <div className='grid gap-3 pl-2 pr-2'>
            {/* HEADER */}
            <div className='flex w-full items-center justify-end rounded-xs p-3 h-12 gap-x-4 bg-gray-50 shadow-2xs'>
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