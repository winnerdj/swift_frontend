import APITable from '@/components/table/APITable';
import { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import React from 'react';
import { userActivityTableType } from '../../types';
import moment from 'moment';
// import { Checkbox } from '@/components/ui/checkbox'

interface UserActivityTableProps {
    rowSelection: RowSelectionState;
    setRowSelection: React.Dispatch<React.SetStateAction<RowSelectionState>>;
    // selectedRows: userActivityTableType[];
    // setSelectedRows: React.Dispatch<React.SetStateAction<userActivityTableType[]>>;
    // clickedRow: userActivityTableType | null;
    // setClickedRow : React.Dispatch<React.SetStateAction<userActivityTableType | null>>;
    // openUpdateModal: () => void;
}

const UserActivityTable: React.FC<UserActivityTableProps> = ({
    rowSelection,
    setRowSelection,
    // setSelectedRows,
    // setClickedRow,
    // openUpdateModal
}) => {

    // const handleSelectedRowsChange = useCallback((rows: userActivityTableType[]) => {
    //     setSelectedRows(rows);
    // }, [setSelectedRows]);

    const columns: ColumnDef<userActivityTableType>[] = [
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
        // {
        //     accessorKey: 'action_update ',
        //     header: 'Actions',
        //     cell: ({ row }) => (
        //         <div className='flex justify-center'>
        //             <Button variant={'ghost'} className='p-2 h-7 hover:bg-gray-400 gap-1.5'
        //                 onClick={() => {
        //                     setClickedRow(row.original);
        //                     // Call updateUserActivity.onOpen() to show the modal
        //                     // updateUserActivity.onOpen();
        //                     // openUpdateModal()
        //                 }}
        //             ><Pencil/>
        //             </Button>
        //         </div>
        //     ),
        //     enableSorting: false,
        // },
        {
            accessorKey: 'user_id',
            header: 'User',
        },
        {
            accessorKey: 'activity',
            header: 'Activity',
        },
        {
            accessorKey: 'user_status',
            header: 'Status'
        },
        {
            accessorKey: 'service_id',
            header: 'Service Name',
            cell: ({ row }) => {
                return row.original?.srv_user_activity?.service_name || ''
            }
        },
        {
            accessorKey: 'location',
            header: 'Location',
            cell: props => {
                const location = props.getValue();
                return typeof location === 'string' && location.includes('@') ? ''.concat(location.split("@")[1]) : '';
            }
        },
        {
            accessorKey: 'counter',
            header: 'Counter'
        },
        {
            accessorKey: 'duration',
            header: 'Duration',
            cell: props => {
                const durationInSeconds = props.getValue(); // duration is in seconds
                if(typeof durationInSeconds === 'number' && durationInSeconds > 0 ) {
                    // Create a moment duration object
                    const duration = moment.duration(durationInSeconds, 'seconds');
                    // Format the duration. If hours are 0, only show minutes and seconds.
                    const formatString = duration.hours() > 0 ? 'HH:mm:ss' : 'mm:ss';
                    return moment.utc(duration.asMilliseconds()).format(formatString);
                }
                return '';
            }
        },
        {
            accessorKey: 'start_datetime',
            header: 'Start DateTime',
            cell: props => {
                const date = props.getValue();
                return date ? moment(date).format('YYYY-MM-DD HH:mm') : "N/A";
            }
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
                route='/user-activity'
                rowSelection={rowSelection}
                setRowSelection={setRowSelection}
                // onSelectedRowsChange={handleSelectedRowsChange}
            />
        </div>
    );
}

export default UserActivityTable;