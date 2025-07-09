import React from 'react';
import useDisclosure from '@/hooks/useDisclosure';
import { Button } from '@/components/ui/button'
import ServiceTable from '../components/table/ServiceTable';
import CreateService from '../components/modals/CreateService';
import UpdateService from '../components/modals/UpdateService';
import { ServiceContextProvider } from '../components/context/ServiceContext';
import { 
    UserRoundPlus,
    // CodeXml
} from 'lucide-react'
import { RowSelectionState } from '@tanstack/react-table';
import { serviceTableType } from '../types';

interface ServiceProps {
}

const Service: React.FC<ServiceProps> = () => {
    const serviceDisclosure = useDisclosure();

    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
    const [selectedRows, setSelectedRows] = React.useState<serviceTableType[]>([]);
    const [clickedRow, setClickedRow] = React.useState<serviceTableType | null>(null);

    React.useEffect(() => {
        console.log('rowSelection', rowSelection)
    }, [rowSelection])

    return (
        <div className='grid gap-3 pl-2 pr-2'>
            {/* HEADER */}
            <div className='flex w-full items-center justify-end rounded-xs p-3 h-12 gap-x-4 bg-gray-50 shadow-2xs'>
                <Button variant={'ghost'} className='p-2 h-7 hover:bg-gray-400 gap-1.5' onClick={() => serviceDisclosure.onOpen('createService') }>
                    <UserRoundPlus/>
                    Create Service
                </Button>
                {/* <Button variant={'ghost'} className='p-2 h-7 hover:bg-gray-400 gap-1.5' onClick={() => console.log('selectedRows',selectedRows)}><CodeXml/>
                log selectedRows
                </Button>
                <Button variant={'ghost'} className='p-2 h-7 hover:bg-gray-400 gap-1.5' onClick={() => console.log('clickedRow',clickedRow)}><CodeXml/>
                log clickedRow
                </Button> */}
            </div>
            <div className='rounded-xs h-full bg-gray-50 shadow-2xs p-4'>
                <ServiceContextProvider>
                    <ServiceTable
                        rowSelection={rowSelection}
                        setRowSelection={setRowSelection}
                        selectedRows={selectedRows}
                        setSelectedRows={setSelectedRows}
                        clickedRow={clickedRow}
                        setClickedRow={setClickedRow}
                        openUpdateModal={() => serviceDisclosure.onOpen('updateService')}
                    />
                </ServiceContextProvider>
            </div>
            <CreateService isOpen={serviceDisclosure.isOpen('createService')} onClose={() => serviceDisclosure.onClose('createService')} />
            <UpdateService isOpen={serviceDisclosure.isOpen('updateService') && clickedRow !== null} onClose={() => serviceDisclosure.onClose('updateService')} selectedService={clickedRow} />
        </div>
    );
}

export default Service;