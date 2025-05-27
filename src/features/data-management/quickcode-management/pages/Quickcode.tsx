import React from 'react';
import useDisclosure from '@/hooks/useDisclosure';
import { Button } from '@/components/ui/button'
import QuickcodeTable from '../components/table/QuickcodeTable';
import CreateQuickcode from '../components/modals/CreateQuickcode';
import UpdateQuickcode from '../components/modals/UpdateQuickcode';
import { QuickcodeContextProvider } from '../components/context/QuickcodeContext';
import { UserRoundPlus, CodeXml } from 'lucide-react'
import { RowSelectionState } from '@tanstack/react-table';
import { quickcodeTableType } from '../types';

interface QuickcodeProps {
}

const Quickcode: React.FC<QuickcodeProps> = () => {
    const quickcodeDisclosure = useDisclosure();

    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
    const [selectedRows, setSelectedRows] = React.useState<quickcodeTableType[]>([]);
    const [clickedRow, setClickedRow] = React.useState<quickcodeTableType | null>(null);

    React.useEffect(() => {
        console.log('rowSelection', rowSelection)
    }, [rowSelection])

    return (
        <div className='grid gap-3 pl-2 pr-2'>
            {/* HEADER */}
            <div className='flex w-full items-center justify-end rounded-xs p-3 h-12 gap-x-4 bg-gray-50 shadow-2xs'>
                <Button variant={'ghost'} className='p-2 h-7 hover:bg-gray-400 gap-1.5' onClick={() => quickcodeDisclosure.onOpen('createQuickcode') }>
                    <UserRoundPlus/>
                    Create Quickcode
                </Button>
                <Button variant={'ghost'} className='p-2 h-7 hover:bg-gray-400 gap-1.5' onClick={() => console.log('selectedRows',selectedRows)}><CodeXml/>
                log selectedRows
                </Button>
                <Button variant={'ghost'} className='p-2 h-7 hover:bg-gray-400 gap-1.5' onClick={() => console.log('clickedRow',clickedRow)}><CodeXml/>
                log clickedRow
                </Button>
            </div>
            <div className='rounded-xs h-full bg-gray-50 shadow-2xs p-4'>
                <QuickcodeContextProvider>
                    <QuickcodeTable
                        rowSelection={rowSelection}
                        setRowSelection={setRowSelection}
                        selectedRows={selectedRows}
                        setSelectedRows={setSelectedRows}
                        clickedRow={clickedRow}
                        setClickedRow={setClickedRow}
                        openUpdateModal={() => quickcodeDisclosure.onOpen('updateQuickcode')}
                    />
                </QuickcodeContextProvider>
            </div>
            <CreateQuickcode isOpen={quickcodeDisclosure.isOpen('createQuickcode')} onClose={() => quickcodeDisclosure.onClose('createQuickcode')} />
            <UpdateQuickcode isOpen={quickcodeDisclosure.isOpen('updateQuickcode') && clickedRow !== null} onClose={() => quickcodeDisclosure.onClose('updateQuickcode')} selectedQuickcode={clickedRow} />
        </div>
    );
}

export default Quickcode;