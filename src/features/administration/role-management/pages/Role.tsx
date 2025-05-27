import React from 'react';
import useDisclosure from '@/hooks/useDisclosure';
import { Button } from '@/components/ui/button'
import RoleTable from '../components/table/RoleTable';
import CreateRole from '../components/modals/CreateRole';
import UpdateRole from '../components/modals/UpdateRole';
import { RoleContextProvider } from '../components/context/RoleContext';
import { UserRoundPlus, CodeXml } from 'lucide-react'
import { RowSelectionState } from '@tanstack/react-table';
import { roleTableType } from '../types';

interface RoleProps {
}

const Role: React.FC<RoleProps> = () => {
    const roleDisclosure = useDisclosure();

    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
    const [selectedRows, setSelectedRows] = React.useState<roleTableType[]>([]);
    const [clickedRow, setClickedRow] = React.useState<roleTableType | null>(null);

    React.useEffect(() => {
        console.log('rowSelection', rowSelection)
    }, [rowSelection])

    return (
        <div className='grid gap-3 pl-2 pr-2'>
            {/* HEADER */}
            <div className='flex w-full items-center justify-end rounded-xs p-3 h-12 gap-x-4 bg-gray-50 shadow-2xs'>
                <Button variant={'ghost'} className='p-2 h-7 hover:bg-gray-400 gap-1.5' onClick={() => roleDisclosure.onOpen('createRole') }>
                    <UserRoundPlus/>
                    Create Role
                </Button>
                <Button variant={'ghost'} className='p-2 h-7 hover:bg-gray-400 gap-1.5' onClick={() => console.log('selectedRows',selectedRows)}><CodeXml/>
                log selectedRows
                </Button>
                <Button variant={'ghost'} className='p-2 h-7 hover:bg-gray-400 gap-1.5' onClick={() => console.log('clickedRow',clickedRow)}><CodeXml/>
                log clickedRow
                </Button>
            </div>
            <div className='rounded-xs h-full bg-gray-50 shadow-2xs p-4'>
                <RoleContextProvider>
                    <RoleTable
                        rowSelection={rowSelection}
                        setRowSelection={setRowSelection}
                        selectedRows={selectedRows}
                        setSelectedRows={setSelectedRows}
                        clickedRow={clickedRow}
                        setClickedRow={setClickedRow}
                        openUpdateModal={() => roleDisclosure.onOpen('updateRole')}
                    />
                </RoleContextProvider>
            </div>
            <CreateRole isOpen={roleDisclosure.isOpen('createRole')} onClose={() => roleDisclosure.onClose('createRole')} />
            <UpdateRole isOpen={roleDisclosure.isOpen('updateRole') && clickedRow !== null} onClose={() => roleDisclosure.onClose('updateRole')} selectedRole={clickedRow} />
        </div>
    );
}

export default Role;