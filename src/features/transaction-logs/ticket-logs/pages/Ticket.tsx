import React from 'react';
import useDisclosure from '@/hooks/useDisclosure';
// import { Button } from '@/components/ui/button'
import TicketTable from '../components/table/TicketTable';
import { TicketContextProvider } from '../components/context/TicketContext';
// import { CodeXml } from 'lucide-react'
import { RowSelectionState } from '@tanstack/react-table';
import { ticketTableType } from '../types';
import TicketDetails from '../components/modals/TicketDetails';

interface TicketProps {
}

const Ticket: React.FC<TicketProps> = () => {
    const ticketDisclosure = useDisclosure();

    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
    const [selectedRows, setSelectedRows] = React.useState<ticketTableType[]>([]);
    const [clickedRow, setClickedRow] = React.useState<ticketTableType | null>(null);

    React.useEffect(() => {
        console.log('rowSelection', rowSelection)
    }, [rowSelection])

    return (
        <div className='grid gap-3 pl-2 pr-2'>
            {/* HEADER */}
            <div className='flex w-full items-center justify-end rounded-xs p-3 h-12 gap-x-4 bg-gray-50 shadow-2xs'>
                {/* <Button variant={'ghost'} className='p-2 h-7 hover:bg-gray-400 gap-1.5' onClick={() => console.log('selectedRows',selectedRows)}><CodeXml/>
                    log selectedRows
                </Button> */}
            </div>
            <div className='rounded-xs h-full bg-gray-50 shadow-2xs p-4'>
                <TicketContextProvider>
                    <TicketTable
                        rowSelection={rowSelection}
                        setRowSelection={setRowSelection}
                        selectedRows={selectedRows}
                        setSelectedRows={setSelectedRows}
                        clickedRow={clickedRow}
                        setClickedRow={setClickedRow}
                        openDetailModal={() => ticketDisclosure.onOpen('ticketDetails')}
                    />
                </TicketContextProvider>
            </div>
            <TicketDetails isOpen={ticketDisclosure.isOpen('ticketDetails') && clickedRow !== null} onClose={() => ticketDisclosure.onClose('ticketDetails')} selectedTicket={clickedRow} />
        </div>
    );
}

export default Ticket;