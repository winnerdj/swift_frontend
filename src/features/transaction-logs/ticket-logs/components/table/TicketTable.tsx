import APITable from '@/components/table/APITable';
import { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import React, { useCallback } from 'react';
import { ticketTableType } from '../../types';
import moment from 'moment';
import { Button } from '@/components/ui/button'

interface TicketTableProps {
    rowSelection: RowSelectionState;
    setRowSelection: React.Dispatch<React.SetStateAction<RowSelectionState>>;
    selectedRows: ticketTableType[];
    setSelectedRows: React.Dispatch<React.SetStateAction<ticketTableType[]>>;
    clickedRow: ticketTableType | null;
    setClickedRow : React.Dispatch<React.SetStateAction<ticketTableType | null>>;
    openDetailModal: () => void;
}

const TicketTable: React.FC<TicketTableProps> = ({
    rowSelection,
    setRowSelection,
    setSelectedRows,
    setClickedRow,
    openDetailModal
}) => {

    const handleSelectedRowsChange = useCallback((rows: ticketTableType[]) => {
        setSelectedRows(rows);
    }, [setSelectedRows]);

    const columns: ColumnDef<ticketTableType>[] = [
        {
            accessorKey: 'ticket_id',
            header: 'Ticket ID',
            cell: ({ row }) => (
                <div className=''>
                    <Button variant={'ghost'} className='p-0 h-0 hover:bg-gray-400 gap-1.5'
                        onClick={() => {
                            setClickedRow(row.original);
                            openDetailModal()}}
                    >
                    {row.getValue('ticket_id')}
                    </Button>
                </div>
            ),
            enableSorting: true,
        },
        // {
        //     accessorKey: 'ticket_id',
        //     header: 'Ticket ID'
        // },
        {
            accessorKey: 'ticket_status',
            header: 'Status Code',
        },
        {
            accessorKey: 'qc_ticket_status.qc_description',
            header: 'Status',
            enableSorting: false
        },
        {
            accessorKey: 'ticket_parent_reference',
            header: 'Ticket Parent Ref',
        },
        {
            accessorKey: 'ticket_head_reference',
            header: 'Ticket Head Ref',
        },
        {
            accessorKey: 'ticket_counter',
            header: 'Counter',
        },
        {
            accessorKey: 'ticket_support',
            header: 'Support'
        },
        {
            accessorKey: 'createdBy',
            header: 'Created By'
        },
        {
            accessorKey: 'createdAt',
            header: 'Created At',
            cell: props => {
                const date = props.getValue();
                return date ? moment(date).format('YYYY-MM-DD HH:mm') : "N/A";
            }
        },
        {
            accessorKey: 'updatedBy',
            header: 'Modified By'
        },
        {
            accessorKey: 'updatedAt',
            header: 'Modified At',
            cell: props => {
                const date = props.getValue();
                return date ? moment(date).format('YYYY-MM-DD HH:mm') : "N/A";
            }
        }
    ];

    return (
        <div>
            <APITable
                columns={columns}
                route='/ticket'
                rowSelection={rowSelection}
                setRowSelection={setRowSelection}
                onSelectedRowsChange={handleSelectedRowsChange}
            />
        </div>
    );
}

export default TicketTable;