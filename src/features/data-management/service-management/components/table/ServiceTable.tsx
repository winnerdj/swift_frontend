import APITable from '@/components/table/APITable';
import { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import React, { useCallback } from 'react';
import { serviceTableType } from '../../types';
import moment from 'moment';
// import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react';

interface ServiceTableProps {
    rowSelection: RowSelectionState;
    setRowSelection: React.Dispatch<React.SetStateAction<RowSelectionState>>;
    selectedRows: serviceTableType[];
    setSelectedRows: React.Dispatch<React.SetStateAction<serviceTableType[]>>;
    clickedRow: serviceTableType | null;
    setClickedRow : React.Dispatch<React.SetStateAction<serviceTableType | null>>;
    openUpdateModal: () => void;
}

const ServiceTable: React.FC<ServiceTableProps> = ({
    rowSelection,
    setRowSelection,
    setSelectedRows,
    setClickedRow,
    openUpdateModal
}) => {

    const handleSelectedRowsChange = useCallback((rows: serviceTableType[]) => {
        setSelectedRows(rows);
    }, [setSelectedRows]);

    const columns: ColumnDef<serviceTableType>[] = [
        // {
        //     id: 'select', // Unique ID for selection column
        //     header: ({ table }) => (
        //         <Checkbox
        //             checked={table.getIsAllPageRowsSelected()}
        //             onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        //             aria-label="Select all"
        //         />
        //     ),
        //     cell: ({ row }) => (
        //         <Checkbox
        //             checked={row.getIsSelected()}
        //             onCheckedChange={(value) => row.toggleSelected(!!value)}
        //             aria-label="Select row"
        //             className='border border-gray-400'
        //         />
        //     ),
        //     enableSorting: false, // Disable sorting for this column
        //     enableHiding: false, // Prevent hiding this column
        // },
        {
            accessorKey: 'action_update ',
            header: 'Actions',
            cell: ({ row }) => (
                <div className='flex justify-center'>
                    <Button variant={'ghost'} className='p-2 h-7 hover:bg-gray-400 gap-1.5'
                        onClick={() => {
                            setClickedRow(row.original);
                            // Call updateService.onOpen() to show the modal
                            // updateService.onOpen();
                            openUpdateModal()}}
                    ><Pencil/>
                    </Button>
                </div>
            ),
            enableSorting: false,
        },
        {
            accessorKey: 'service_name',
            header: 'Service Name',
        },
        // {
        //     accessorKey: 'service_location',
        //     header: 'Location',
        // },
        {
            accessorKey: 'qc_service_location_desc',
            header: 'Location',
        },
        {
            accessorKey: 'service_status',
            header: 'Status',
            cell: props => props.getValue() ? 'Active' : 'Inactive'
        },
        {
            accessorKey: 'service_description',
            header: 'Description',
        },
        // {
        //     accessorKey: 'service_discipline',
        //     header: 'Discipline',
        // },
        {
            accessorKey: 'qc_service_discipline_desc',
            header: 'Discipline',
        },
        {
            accessorKey: 'no_of_counters',
            header: 'Number of Counters',
        },
        {
            accessorKey: 'counter_prefix',
            header: 'Counter Prefix',
        },
        {
            accessorKey: 'ticket_number_prefix',
            header: 'Ticket Number Prefix',
        },
        {
            accessorKey: 'recall_waiting_flag',
            header: 'Recall Waiting flag',
            cell: props => props.getValue() ? 'Active' : 'Inactive'
        },
        {
            accessorKey: 'recall_waiting_time',
            header: 'Recall Waiting Time',
        },
        {
            accessorKey: 'service_remarks1',
            header: 'Remarks1'
        },
        {
            accessorKey: 'service_remarks2',
            header: 'Remarks2'
        },
        {
            accessorKey: 'service_remarks3',
            header: 'Remarks3'
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
                route='/service'
                rowSelection={rowSelection}
                setRowSelection={setRowSelection}
                onSelectedRowsChange={handleSelectedRowsChange}
            />
        </div>
    );
}

export default ServiceTable;